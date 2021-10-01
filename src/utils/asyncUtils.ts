import axios from "axios";

const httpClient = axios.create({
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  /* istanbul ignore if */
  if (
    import.meta.env.VITE_AUTH0 ||
    import.meta.env.VITE_OKTA ||
    import.meta.env.VITE_AWS_COGNITO ||
    import.meta.env.VITE_GOOGLE
  ) {
    const accessToken = localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_NAME!);
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

export { httpClient };
