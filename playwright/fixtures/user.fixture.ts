import { TestDataApi } from "../api/test-data.api";
import { User } from "../dto/user.dto";
import { apiFixtures } from "./api.fixture";

type UserFixtures = {
  user: User;
};

export const userFixtures = apiFixtures.extend<UserFixtures>({
  user: async ({ apiRequest }, use) => {
    const api = new TestDataApi(apiRequest);
    const users = await api.getUsers();
    await use(users[0]);
  },
});
