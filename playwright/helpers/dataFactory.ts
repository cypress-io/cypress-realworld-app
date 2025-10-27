import { faker } from '@faker-js/faker';
import { User } from '../models/User';

/**
 * Hardcoded test users for consistent testing
 */
export const testUsers = {
  heath: { firstName: 'Heath', lastName: 'Admin', username: 'Heath93', password: 's3cret' },
  dina: { firstName: 'Dina', lastName: 'User', username: 'Dina20', password: 's3cret' },
  arvilla: { firstName: 'Arvilla', lastName: 'Hegmann', username: 'Arvilla_Hegmann', password: 's3cret' },
  reyes: { firstName: 'Reyes', lastName: 'Osinski', username: 'Reyes.Osinski', password: 's3cret' },
  judah: { firstName: 'Judah', lastName: 'Dietrich', username: 'Judah_Dietrich50', password: 's3cret' },
} as const;

/**
 * Simple data factory for generating test data
 */
export class DataFactory {
  /**
   * Generate a user with optional parameters
   * @param firstName - Optional first name
   * @param lastName - Optional last name  
   * @param username - Optional username
   * @param password - Optional password
   * @returns User object with generated or provided data
   */
  static createUser(
    firstName?: string,
    lastName?: string,
    username?: string,
    password?: string
  ): User {
    const finalFirstName = firstName || faker.person.firstName();
    const finalLastName = lastName || faker.person.lastName();
    const finalUsername = username || `${finalFirstName}${finalLastName}${faker.number.int({ min: 10, max: 99 })}`.toLowerCase();
    const finalPassword = password || 's3cret';

    return {
      firstName: finalFirstName,
      lastName: finalLastName,
      username: finalUsername,
      password: finalPassword,
    };
  }


  /**
   * Get a random hardcoded test user
   * @returns User object from hardcoded users
   */
  static getRandomTestUser(): User {
    const users = Object.values(testUsers);
    return faker.helpers.arrayElement(users);
  }
}
