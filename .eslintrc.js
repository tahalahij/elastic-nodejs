module.exports = {
  extends: 'airbnb-base',
  env: {
    mocha: true,
  },
  rules: {
    indent: [2, 2, { SwitchCase: 1 }],
    'no-underscore-dangle': 0,
    'import/no-unresolved': 0,
    'no-param-reassign': 0,
    'default-case': 0,
    'max-len': [2, 150, 4, { ignoreUrls: true, ignoreStrings: true }],
    'import/prefer-default-export': 0,
    'consistent-return': 0,
    'no-plusplus': 0,
    'no-console': 0,
  },
};
