import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  clearMocks: true,
  coverageProvider: "v8",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/",
    "^.+\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}", "**/?(*.)+(spec|test).{ts,tsx}"],
};

export default createJestConfig(config);
