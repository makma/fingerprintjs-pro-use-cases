/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals', '@fingerprintjs/eslint-config-dx-team'],
  plugins: ['react-hooks', 'jsx-a11y'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/no-unescaped-entities': 'off',
  },
};
