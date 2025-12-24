import js from '@eslint/js';
import globals from 'globals';
import security from 'eslint-plugin-security';

export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      '_site/**',
      'cv/_site/**',
      'vendor/**',
      'data/**',
      // Vendor/third-party libraries (minified or external)
      'assets/js/*.min.js',
      'assets/js/jquery*.js',
      'assets/js/util.js',
      'assets/js/main.js',
    ],
  },

  // Browser JavaScript (assets/js)
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      security,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...security.configs.recommended.rules,

      // Error prevention
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['error', 'warn'] }],

      // Security - detect potential XSS via innerHTML
      'no-unsanitized/property': 'off', // Handled by our escapeHtml pattern
      'security/detect-object-injection': 'off', // Too many false positives

      // Best practices
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },

  // Node.js scripts (_scripts)
  {
    files: ['_scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      security,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...security.configs.recommended.rules,

      // Error prevention
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off', // Console output is expected in CLI scripts

      // Security
      'security/detect-object-injection': 'off', // Too many false positives
      'security/detect-non-literal-fs-filename': 'off', // We use computed paths intentionally

      // Best practices
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
];
