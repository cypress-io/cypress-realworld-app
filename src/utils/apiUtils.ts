import { backendPort } from "./portUtils";

const trimEnd = (s: string, suffix: string): string => {
  if (s && suffix && s.endsWith(suffix)) {
    return s.slice(0, -suffix.length);
  }
  return s;
};

export const apiUrl = trimEnd(process.env.API_URL || `http://localhost:${backendPort}`, "/")
