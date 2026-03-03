import { TestDataApi } from "../api/test-data.api";
import { User } from "../dto/user.dto";
import { apiFixtures } from "./api.fixture";

type UserFixtures = {
  testDataApi: TestDataApi;
  user: User;
};

export const userFixtures = apiFixtures.extend<UserFixtures>({
  testDataApi: async ({ apiRequest }, use) => {
    await use(new TestDataApi(apiRequest));
  },

  user: async ({ testDataApi }, use) => {
    const users = await testDataApi.getUsers();
    await use(users[0]);
  },
});
