import { TestDataApi } from "../api/test-data.api";
import { apiFixtures } from "./api.fixture";

export const databaseFixtures = apiFixtures.extend<{ seedDatabase: () => Promise<void> }>({
  seedDatabase: async ({ apiRequest }, use) => {
    const testDataApi = new TestDataApi(apiRequest);
    await use(() => testDataApi.seedDatabase());
  },
});
