import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    outputFile: {
      junit: './coverage/junit-report.xml',
    },
    coverage: {
      exclude: [ 'src/common/*.ts', 'src/**/interfaces.ts', ...coverageConfigDefaults.exclude ],
      reporter: [ 'text', 'text-summary', 'html' ],
      thresholds: { 100: true }
    },
  },
});