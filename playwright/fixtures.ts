import { test as base, request } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";

type CustomOptions = {
  apiBaseURL: string;
  apiRequest: APIRequestContext;
};

export const test = base.extend<CustomOptions>({
  apiBaseURL: [`http://localhost:${process.env.VITE_BACKEND_PORT || 3001}`, { option: true }],

  apiRequest: async ({ apiBaseURL }, use) => {
    const apiContext = await request.newContext({ baseURL: apiBaseURL });
    await use(apiContext);
    await apiContext.dispose();
  },
});

export { expect } from "@playwright/test";
