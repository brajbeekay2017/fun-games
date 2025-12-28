module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
};