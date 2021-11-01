import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const httpClient = axios.create({
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  /* istanbul ignore if */
  if (
    process.env.REACT_APP_AUTH0 ||
    process.env.REACT_APP_OKTA ||
    process.env.REACT_APP_AWS_COGNITO ||
    process.env.REACT_APP_GOOGLE
  ) {
    const accessToken = localStorage.getItem(process.env.REACT_APP_AUTH_TOKEN_NAME!);
    // @ts-ignore
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export { httpClient };
