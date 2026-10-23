// @ts-check
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

/** @param {string} name */
const selfImport = (name) => ({
  regex: `^${name}(/.*)?$`,
  message: 'Use a relative import, not a package import, inside the package itself.',
});

const clientFromCore = {
  regex: '^@sentdm/voice-client(-react)?(/.*)?$',
  message: '@sentdm/voice-client-core must not depend on the packages built on it.',
};

const providerImport = {
  regex: '^sinch-rtc(/.*)?$',
  message:
    'sinch-rtc may only be imported by the Sinch adapter, packages/voice-client/src/adapter/sinch*.ts.',
};

/** The imports each package's source may not make, by package directory. */
const restricted = {
  'voice-client-core': [selfImport('@sentdm/voice-client-core'), clientFromCore],
  'voice-client': [selfImport('@sentdm/voice-client')],
  'voice-client-react': [selfImport('@sentdm/voice-client-react')],
};

export default tseslint.config(
  { ignores: ['**/dist/'] },
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { sourceType: 'module' },
    },
    files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'no-restricted-imports': ['error', { patterns: [providerImport] }],
    },
  },
  ...Object.entries(restricted).map(([dir, patterns]) => ({
    files: [`packages/${dir}/src/**`],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...patterns, providerImport] }],
    },
  })),
  {
    files: ['packages/voice-client/src/adapter/sinch.ts', 'packages/voice-client/src/adapter/sinch-rtc.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: restricted['voice-client'] }],
    },
  },
  {
    files: ['packages/*/tests/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
);
