import { APIRequestContext, ElementHandle, Locator, Page, test as base } from "@playwright/test";
import { User } from "../src/models";

class APIClient {
  #apiRequestContext: APIRequestContext;
  constructor(apiRequestContext: APIRequestContext) {
    this.#apiRequestContext = apiRequestContext;
  }

  public fetch(pathname: string, options: Parameters<APIRequestContext["fetch"]>[1] = {}) {
    const url = `${process.env.PLAYWRIGHT_BACKEND_URL}${pathname}`;
    return this.#apiRequestContext.fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  public get(pathname: string, options?: Parameters<APIRequestContext["fetch"]>[1]) {
    return this.fetch(pathname, options);
  }

  public post(pathname: string, options: Parameters<APIRequestContext["fetch"]>[1] = {}) {
    return this.fetch(pathname, {
      ...options,
      method: "POST",
    });
  }
}

class Backend {
  #apiClient: APIClient;
  constructor(apiClient: APIClient) {
    this.#apiClient = apiClient;
  }

  public async seedDB() {
    await this.#apiClient.post("/testData/seed");
  }

  public async getUsers(): Promise<User[]> {
    const response = await this.#apiClient.get("/testData/users");
    const json = await response.json();
    return json.results;
  }

  public async getAUser(): Promise<User> {
    const users = await this.getUsers();
    if (!users?.length) throw new Error("No users found");
    return users[0];
  }
}

interface TestFixtures {
  apiClient: APIClient;
  backend: Backend;
  loginByXstate: (username: string, password?: string) => void;
  page: Page & {
    getByTestIdLike: (testId: string) => Locator;
  };
}

declare global {
  interface Window {
    authService: {
      send: (event: string, payload: any) => void;
    };
    Cypress: {};
  }
}

export const test = base.extend<TestFixtures>({
  // 🤮 we have to do this because the runtime app
  // is configured with Cypress in mind
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.Cypress = {};
    });
    // 🤮 we have to do this due to non-standard data-test attributes
    page.getByTestId = (testId: string) => page.locator(`[data-test="${testId}"]`);
    page.getByTestIdLike = (testId: string) => page.locator(`[data-test*="${testId}"]`);

    await use(page);
  },

  apiClient: async ({ request }, use) => {
    await use(new APIClient(request));
  },
  backend: async ({ request }, use) => {
    await use(new Backend(new APIClient(request)));
  },
  loginByXstate: async ({ page }, use) => {
    await use(async (username: string, password = process.env.SEED_DEFAULT_USER_PASSWORD) => {
      await page.evaluate(
        ({ username, password }) => {
          window.authService.send("LOGIN", { username, password });
        },
        { username, password }
      );
    });
  },
});

export * from "@playwright/test";
