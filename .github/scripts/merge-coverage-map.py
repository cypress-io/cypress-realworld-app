import os
import json

# Get environment variables - support both old and new variable names
JSON_FILES = os.environ['JSON_FILES']  # Ex: 'cypress/fixtures/extras/coverage/e2e-1-coverage-map.json ...'
OUTPUT_PATH = os.environ.get('MERGED_REPORT_PATH') or os.environ.get('OUTPUT_PATH')  # Ex: artifacts/coverage-map.json

print('--------------------Merging Coverage maps-------------------------------------')

files_list = [f.strip() for f in JSON_FILES.split() if f.strip()]
print(f'Found {len(files_list)} coverage map files to merge')

merged_map = {}
files_processed = 0
files_skipped = 0

# Coverage map structure: { srcFile: { specFile: { testName: statementCount } } }
for file_path in files_list:
    try:
        print(f'\nProcessing: {file_path}')
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f'  ⚠️  File not found, skipping: {file_path}')
            files_skipped += 1
            continue
        
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            file_content = f.read()
        
        print(f'  Read {len(file_content)} bytes')
        
        # Check for empty file
        if not file_content or file_content.strip() == '':
            print(f'  ⚠️  Empty file, skipping: {file_path}')
            files_skipped += 1
            continue
        
        # Parse JSON
        file_data = json.loads(file_content)
        
        # Validate that file_data is a dict and not None
        if file_data is None or not isinstance(file_data, dict):
            print(f'  ⚠️  Invalid data (null or not an object), skipping: {file_path}')
            files_skipped += 1
            continue
        
        # Check if empty
        if len(file_data) == 0:
            print(f'  ℹ️  Empty coverage map, skipping: {file_path}')
            files_skipped += 1
            continue
        
        print(f'  Found {len(file_data)} source files with coverage data')
        
        # Merge strategy: for each source file -> spec file -> test name
        for src_file, spec_data in file_data.items():
            # Validate spec_data is a dict
            if not isinstance(spec_data, dict):
                print(f'  ⚠️  Invalid spec data for {src_file}, skipping')
                continue
            
            if src_file not in merged_map:
                merged_map[src_file] = {}
            
            for spec_file, test_data in spec_data.items():
                # Validate test_data is a dict
                if not isinstance(test_data, dict):
                    print(f'  ⚠️  Invalid test data for {src_file}/{spec_file}, skipping')
                    continue
                
                if spec_file not in merged_map[src_file]:
                    merged_map[src_file][spec_file] = {}
                
                # Merge tests, keeping the highest statement count
                for test_name, statement_count in test_data.items():
                    # Validate statement_count is a number
                    if not isinstance(statement_count, (int, float)):
                        print(f'  ⚠️  Invalid statement count for {test_name}, skipping')
                        continue
                    
                    current_count = merged_map[src_file][spec_file].get(test_name, 0)
                    merged_map[src_file][spec_file][test_name] = max(current_count, statement_count)
        
        files_processed += 1
        print('  ✓ Successfully merged')
        
    except json.JSONDecodeError as e:
        print(f'  ✗ JSON decode error in file {file_path}:')
        print(f'    Error: {str(e)}')
        files_skipped += 1
    except Exception as e:
        print(f'  ✗ Error processing file {file_path}:')
        print(f'    Error: {str(e)}')
        files_skipped += 1

print('\n--------------------Merge Summary---------------------------------------------')
print(f'Files processed: {files_processed}')
print(f'Files skipped: {files_skipped}')
print(f'Total source files in merged map: {len(merged_map)}')

# Write merged map to output
try:
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(OUTPUT_PATH)
    if output_dir and not os.path.exists(output_dir):
        print(f'\nCreating output directory: {output_dir}')
        os.makedirs(output_dir, exist_ok=True)
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged_map, f, ensure_ascii=False, indent=4)
    
    file_size = os.path.getsize(OUTPUT_PATH)
    print(f'\n✓ Successfully merged coverage maps to {OUTPUT_PATH}')
    print(f'  Output file size: {file_size} bytes')
    print('------------------------------------------------------------------------------')
except Exception as e:
    print('\n✗ Error writing output file:')
    print(f'  Error: {str(e)}')
    exit(1)
