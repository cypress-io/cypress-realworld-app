import { APIRequestContext } from "@playwright/test";
import { TestDataApi } from "../api/test-data.api";

export async function seedDatabase(request: APIRequestContext): Promise<void> {
  const api = new TestDataApi(request);
  await api.seedDatabase();
}
