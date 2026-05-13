import chalk from "chalk";
import detect from "detect-port";

/** Hostname for Vite, API calls, and CORS. Set `VITE_DEV_HOST` in `.env` to override. */
export const devHost = process.env.VITE_DEV_HOST ?? "127.0.0.1";

export const frontendPort = process.env.PORT;
export const backendPort = process.env.VITE_BACKEND_PORT;

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `http://${devHost}:${backendPort}${p}`;
}

export const getBackendPort = async () => {
  return detect(Number(backendPort))
    .then((_port) => {
      if (Number(backendPort) === _port) {
        console.log(chalk.green(`Backend server running at http://${devHost}:${backendPort}`));
        return Number(backendPort);
      }

      console.log(
        chalk.red(
          `Failed to start the backend server on port ${backendPort}. \n Starting the backend server on port ${_port}. \n Please update VITE_BACKEND_PORT in the .env file and 'apiUrl' in cypress.json to ${_port}.`
        )
      );
      return _port;
    })
    .catch((err) => {
      console.log(chalk.red(err));
    });
};
