export type TestUserKey = keyof typeof testUsers;

export const testUsers = {
  primary: {
    email: "e2e.marcus@example.com",
    password: "TestingRocks123!",
    displayName: "E2E Marcus",
  },
} as const;

export function getTestUser(key: TestUserKey = "primary") {
  return testUsers[key];
}
