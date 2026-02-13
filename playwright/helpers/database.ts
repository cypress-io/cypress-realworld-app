import axios from "axios";
import _ from "lodash";
import { User } from "../../src/models";

const API_URL = process.env.API_URL || "http://localhost:3001";
const TEST_DATA_API_ENDPOINT = `${API_URL}/testData`;

/**
 * Seed the database with test data
 */
export async function seedDatabase(): Promise<void> {
  await axios.post(`${TEST_DATA_API_ENDPOINT}/seed`);
}

/**
 * Find a single user from the database
 */
export async function findUser(query: Partial<User>): Promise<User> {
  const { data } = await axios.get(`${TEST_DATA_API_ENDPOINT}/users`);
  return _.find(data.results, query) as User;
}

/**
 * Filter users from the database
 */
export async function filterUsers(query: Partial<User>): Promise<User[]> {
  const { data } = await axios.get(`${TEST_DATA_API_ENDPOINT}/users`);
  return _.filter(data.results, query) as User[];
}
