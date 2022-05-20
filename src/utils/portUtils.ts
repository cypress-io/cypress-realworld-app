require("dotenv").config();

export const HOST = process.env.HOST || "0.0.0.0";
export const frontendPort = process.env.PORT;
export const backendPort = process.env.REACT_APP_BACKEND_PORT;
