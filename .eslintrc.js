module.exports = {
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parser": "@babel/eslint-parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-prototype-builtins": "off"
  }
};
