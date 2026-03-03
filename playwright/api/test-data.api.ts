import { APIRequestContext } from "@playwright/test";
import { User } from "../dto/user.dto";

export class TestDataApi {
  testDataPath = "/testData";

  constructor(private readonly request: APIRequestContext) {}

  async seedDatabase(): Promise<void> {
    await this.request.post(`${this.testDataPath}/seed`);
  }

  async getUsers(): Promise<User[]> {
    const response = await this.request.get(`${this.testDataPath}/users`);
    const data = await response.json();

    return data.results;
  }
}
