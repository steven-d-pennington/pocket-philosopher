import nextJest from "next/jest";
import type { Config } from "jest";

const createJestConfig = nextJest({
  dir: "./",
});

const baseConfig: Config = {
  clearMocks: true,
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/",
    "^.+\\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFiles: ["<rootDir>/jest.setup.env.ts"],
};

const clientProjectConfig: Config = {
  ...baseConfig,
  displayName: "client",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: [
    "<rootDir>/{app,components}/**/__tests__/**/*.{spec,test}.{ts,tsx}",
    "<rootDir>/{app,components}/**/?(*.)+(spec|test).{ts,tsx}",
  ],
};

const serverProjectConfig: Config = {
  ...baseConfig,
  displayName: "server",
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/__tests__/**/*.{spec,test}.{ts,tsx}",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.server.ts"],
};

const createClientJestConfig = createJestConfig(clientProjectConfig);
const createServerJestConfig = createJestConfig(serverProjectConfig);

const combinedConfig = async (): Promise<Config> => {
  const [client, server] = await Promise.all([
    createClientJestConfig(),
    createServerJestConfig(),
  ]);

  return {
    coverageProvider: "v8",
    projects: [client, server],
  };
};

export default combinedConfig;
