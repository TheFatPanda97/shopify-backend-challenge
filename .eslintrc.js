module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  rules: {
    'consistent-return': 0,
    'object-curly-newline': 0,
    'implicit-arrow-linebreak': 0,
    'no-unused-vars': 1,
  },
};
