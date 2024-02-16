import { backendPort } from "./portUtils";

const trimEnd = (s: string, suffix: string): string => {
  if (s && suffix && s.endsWith(suffix)) {
    return s.slice(0, -suffix.length);
  }
  return s;
};

const port = !backendPort ? 3001 : parseInt(backendPort);
export const apiUrl = trimEnd(process.env.API_URL || `http://localhost:${port}`, "/");
