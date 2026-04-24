"""
Cypress Specs Filter Script

This script analyzes code coverage data to determine which Cypress specs should run
based on the files changed in a Pull Request.

Overview:
--------
Instead of running all Cypress tests on every PR, this script:
1. Reads the list of changed files from the PR
2. Looks up which Cypress specs cover those files using a coverage map
3. Outputs only the relevant specs that need to run
4. Calculates the optimal number of parallel containers needed

Environment Variables:
---------------------
- GITHUB_OUTPUT: Path to GitHub Actions output file
- PR_FILENAMES: Comma-separated list of changed files
  Example: "src/containers/App.tsx,backend/user-routes.ts"
- MAP_FILE_PATH: Path to the coverage map JSON file
  Example: "cypress/results/reports/coverage-map/coverage-map.json"
- SPECS_PER_CONTAINER: (Optional) Number of specs per container, defaults to 3

Outputs:
--------
The script generates three GitHub Actions outputs:
1. spec-paths: Comma-separated list of spec files to run
2. cypress-matrix: JSON array of container numbers for parallel execution
3. is-regression-pr: Boolean indicating if this is a regression PR (true) or full test run (false)
"""

import os
import sys
import json
import math
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Constants
DEFAULT_SPECS_PER_CONTAINER = 3
DEFAULT_MATRIX = "[1, 2, 3, 4, 5]"
DEFAULT_SPEC_PATTERN = "cypress/src/**/*.cy.{js,jsx,ts,tsx}"
SEPARATOR = "-" * 130


def log_info(message: str) -> None:
    """Print informational message to stdout."""
    print(message)


def log_error(message: str) -> None:
    """Print error message to stderr."""
    print(f"ERROR: {message}", file=sys.stderr)


def validate_environment() -> Tuple[str, str, str, int]:
    """
    Validate and retrieve required environment variables.
    
    Returns:
        Tuple of (github_output_path, pr_filenames, map_file_path, specs_per_container)
    
    Raises:
        SystemExit: If required environment variables are missing
    """
    github_output = os.getenv("GITHUB_OUTPUT")
    if not github_output:
        log_error("GITHUB_OUTPUT environment variable is not set")
        sys.exit(1)
    
    pr_filenames = os.environ.get("PR_FILENAMES", "")
    if not pr_filenames:
        log_error("PR_FILENAMES environment variable is not set or empty")
        sys.exit(1)
    
    map_file_path = os.environ.get("MAP_FILE_PATH", "")
    if not map_file_path:
        log_error("MAP_FILE_PATH environment variable is not set")
        sys.exit(1)
    
    specs_per_container = int(os.environ.get("SPECS_PER_CONTAINER", str(DEFAULT_SPECS_PER_CONTAINER)))
    if specs_per_container < 1:
        log_error(f"SPECS_PER_CONTAINER must be >= 1, got {specs_per_container}")
        sys.exit(1)
    
    return github_output, pr_filenames, map_file_path, specs_per_container


def load_coverage_map(map_file_path: str) -> Dict:
    """
    Load and parse the coverage map JSON file.
    
    Args:
        map_file_path: Path to the coverage map JSON file
    
    Returns:
        Dictionary containing the coverage map
    
    Raises:
        SystemExit: If file doesn't exist or JSON is invalid
    """
    if not Path(map_file_path).exists():
        log_error(f"Coverage map file not found: {map_file_path}")
        sys.exit(1)
    
    try:
        with open(map_file_path, 'r', encoding='utf-8') as f:
            coverage_map = json.load(f)
        
        if not isinstance(coverage_map, dict):
            log_error(f"Coverage map must be a JSON object, got {type(coverage_map).__name__}")
            sys.exit(1)
        
        return coverage_map
    
    except json.JSONDecodeError as e:
        log_error(f"Invalid JSON in coverage map file: {e}")
        sys.exit(1)
    except Exception as e:
        log_error(f"Failed to read coverage map file: {e}")
        sys.exit(1)


def parse_pr_files(pr_filenames: str) -> List[str]:
    """
    Parse comma-separated list of PR filenames.
    
    Args:
        pr_filenames: Comma-separated string of file paths
    
    Returns:
        List of file paths, with empty strings filtered out
    """
    return [f.strip() for f in pr_filenames.split(",") if f.strip()]


def filter_coverage_map(pr_files: List[str], coverage_map: Dict) -> Dict:
    """
    Filter coverage map to only include files changed in the PR.
    
    Args:
        pr_files: List of changed file paths
        coverage_map: Full coverage map
    
    Returns:
        Filtered coverage map containing only PR files
    """
    parsed_map = {}
    for file in pr_files:
        if file in coverage_map:
            parsed_map[file] = coverage_map[file]
            log_info(f"Found coverage data for: {file}")
        else:
            log_info(f"No coverage data for: {file}")
    
    return parsed_map


def find_best_spec_for_file(file: str, file_coverage: Dict) -> Optional[Tuple[str, str, int]]:
    """
    Find the spec with the test that has the highest statement count for a file.
    
    Args:
        file: Source file path
        file_coverage: Coverage data for the file (spec -> test -> count)
    
    Returns:
        Tuple of (best_spec, best_test, max_statements) or None if no coverage found
    """
    best_spec = None
    best_test = None
    max_statements = 0
    
    for spec, tests in file_coverage.items():
        if not tests:
            continue
        
        # Find the test with the most statements in this spec
        spec_best_test = max(tests, key=tests.get)
        spec_max_statements = tests[spec_best_test]
        
        # Keep track of the spec with the single test that has the highest count
        if spec_max_statements > max_statements:
            max_statements = spec_max_statements
            best_spec = spec
            best_test = spec_best_test
    
    if best_spec and best_test:
        return best_spec, best_test, max_statements
    
    return None


def build_impacted_specs(parsed_map: Dict) -> Dict[str, Dict[str, int]]:
    """
    Build a map of impacted specs with their best tests.
    
    Args:
        parsed_map: Filtered coverage map for PR files
    
    Returns:
        Dictionary mapping spec paths to their best tests and statement counts
    """
    impacted_specs = {}
    
    for file, file_coverage in parsed_map.items():
        log_info(SEPARATOR)
        log_info(f"Finding the best spec for {file}")
        
        result = find_best_spec_for_file(file, file_coverage)
        
        if result:
            best_spec, best_test, max_statements = result
            log_info(f"Found the best spec: {best_spec}")
            log_info(f"  Test: {best_test}")
            log_info(f"  Statements covered: {max_statements}")
            
            # Initialize spec entry if it doesn't exist
            if best_spec not in impacted_specs:
                impacted_specs[best_spec] = {}
            
            # Only add if this test has higher coverage than existing one for this spec
            if best_test not in impacted_specs[best_spec] or max_statements > impacted_specs[best_spec].get(best_test, 0):
                impacted_specs[best_spec][best_test] = max_statements
        else:
            log_info(f"No valid spec found for {file}")
    
    return impacted_specs


def calculate_matrix(num_specs: int, specs_per_container: int) -> str:
    """
    Calculate the GitHub Actions matrix for parallel execution.
    
    Args:
        num_specs: Number of specs to run
        specs_per_container: Number of specs per container
    
    Returns:
        JSON array string of container numbers
    """
    if num_specs == 0:
        return DEFAULT_MATRIX
    
    containers_number = math.ceil(num_specs / specs_per_container)
    containers_list = list(range(1, containers_number + 1))
    return json.dumps(containers_list)


def write_github_output(output_path: str, spec_paths: str, cypress_matrix: str, is_regression: bool) -> None:
    """
    Write outputs to GitHub Actions output file.
    
    Args:
        output_path: Path to GITHUB_OUTPUT file
        spec_paths: Comma-separated list of spec paths
        cypress_matrix: JSON array of container numbers
        is_regression: Whether this is a regression PR
    """
    try:
        with open(output_path, 'a', encoding='utf-8') as f:
            f.write(f"spec-paths={spec_paths}\n")
            f.write(f"cypress-matrix={cypress_matrix}\n")
            f.write(f"is-regression-pr={'true' if is_regression else 'false'}\n")
        
        log_info("Successfully wrote GitHub Actions outputs")
    
    except Exception as e:
        log_error(f"Failed to write GitHub Actions outputs: {e}")
        sys.exit(1)


def handle_no_coverage_match(github_output: str) -> None:
    """
    Handle the case where no PR files match the coverage map.
    Outputs default values to run all tests.
    
    Args:
        github_output: Path to GITHUB_OUTPUT file
    """
    log_info("PR files are not used in any existing cypress test.")
    log_info("Running all specs with default parallelization...")
    
    cypress_matrix = DEFAULT_MATRIX
    specs_paths = DEFAULT_SPEC_PATTERN
    
    log_info(f"Cypress Matrix: {cypress_matrix}")
    log_info(f"Specs Paths: {specs_paths}")
    log_info(SEPARATOR)
    
    write_github_output(github_output, specs_paths, cypress_matrix, False)


def handle_regression_pr(github_output: str, impacted_specs: Dict, specs_per_container: int) -> None:
    """
    Handle the case where PR files match coverage map.
    Outputs filtered specs for regression testing.
    
    Args:
        github_output: Path to GITHUB_OUTPUT file
        impacted_specs: Dictionary of impacted specs
        specs_per_container: Number of specs per container
    """
    # Sort spec paths alphabetically for consistent ordering
    specs_paths = ",".join(sorted(impacted_specs.keys()))
    cypress_matrix = calculate_matrix(len(impacted_specs), specs_per_container)
    
    log_info(SEPARATOR)
    log_info(f"# of Impacted Specs: {len(impacted_specs)}")
    log_info(f"SPECS_PER_CONTAINER: {specs_per_container}")
    log_info(f"Cypress Matrix: {cypress_matrix}")
    log_info(f"Specs Paths: {specs_paths}")
    log_info(SEPARATOR)
    
    write_github_output(github_output, specs_paths, cypress_matrix, True)


def main() -> None:
    """Main execution function."""
    try:
        # Validate environment and get configuration
        github_output, pr_filenames, map_file_path, specs_per_container = validate_environment()
        
        log_info("Starting Cypress specs filter...")
        log_info(f"Coverage map: {map_file_path}")
        log_info(f"Specs per container: {specs_per_container}")
        
        # Load coverage map
        coverage_map = load_coverage_map(map_file_path)
        log_info(f"Loaded coverage map with {len(coverage_map)} source files")
        
        # Parse PR files
        pr_files = parse_pr_files(pr_filenames)
        log_info(f"Analyzing {len(pr_files)} changed files from PR")
        
        # Filter coverage map to PR files
        parsed_map = filter_coverage_map(pr_files, coverage_map)
        
        if not parsed_map:
            handle_no_coverage_match(github_output)
        else:
            # Build impacted specs
            impacted_specs = build_impacted_specs(parsed_map)
            
            if not impacted_specs:
                log_info("No impacted specs found despite coverage matches")
                handle_no_coverage_match(github_output)
            else:
                handle_regression_pr(github_output, impacted_specs, specs_per_container)
        
        log_info("Cypress specs filter completed successfully")
    
    except KeyboardInterrupt:
        log_error("Script interrupted by user")
        sys.exit(130)
    except Exception as e:
        log_error(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
