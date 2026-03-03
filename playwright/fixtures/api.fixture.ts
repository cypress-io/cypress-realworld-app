import { test as base, request } from "@playwright/test";
import { APIRequestContext } from "@playwright/test";

type ApiFixtures = {
  apiRequest: APIRequestContext;
};

const apiBaseURL = `http://localhost:${process.env.VITE_BACKEND_PORT || 3001}`;

export const apiFixtures = base.extend<ApiFixtures>({
  // eslint-disable-next-line no-empty-pattern
  apiRequest: async ({}, use) => {
    const apiContext = await request.newContext({ baseURL: apiBaseURL });
    await use(apiContext);

    await apiContext.dispose();
  },
});
