import { APIRequestContext } from "@playwright/test";

export async function seedDatabase(request: APIRequestContext) {
  await request.post("/testData/seed");
}

export async function findUser(request: APIRequestContext) {
  const response = await request.get("/testData/users");
  const data = await response.json();
  return data.results[0];
}
