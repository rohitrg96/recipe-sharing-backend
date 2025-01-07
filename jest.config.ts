module.exports = {
  preset: 'ts-jest', // Tells Jest to use ts-jest preset for TypeScript
  testEnvironment: 'node', // Use the Node.js environment for tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Path to your tsconfig file
    },
  },
  moduleFileExtensions: ['js', 'ts'], // Ensure Jest looks for .ts files
  transform: {
    '^.+\\.ts$': 'ts-jest', // Transforms TypeScript files using ts-jest
  },
};
