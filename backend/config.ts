const chalk = require("chalk");
const { choosePort } = require("react-dev-utils/WebpackDevServerUtils");
import { HOST, backendPort } from "../src/utils/portUtils";

export const getBackendPort = async () => {
  console.log(chalk.yellow(`Attempting to start backend server on port ${backendPort}`));
  return choosePort(HOST, Number(backendPort)).then((port:number) => {
    if(port) {
      console.log(chalk.green(`Backend server running at http://${HOST}:${port}`));
      return port;
    }
    else {
      console.log(chalk.yellow("Update REACT_APP_BACKEND_PORT in .env file to start server on a different port"));
    }
  });
}