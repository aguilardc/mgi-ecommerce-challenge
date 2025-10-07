module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/main.ts',
    '!**/*.module.ts',
    '!**/*.entity.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/order/domain/$1',
    '^@application/(.*)$': '<rootDir>/order/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/order/infrastructure/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
};
