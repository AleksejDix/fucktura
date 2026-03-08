module.exports = {
  plugins: ['stylelint-prettier'],
  extends: ['stylelint-config-recommended-vue', 'stylelint-prettier/recommended'],
  rules: {
    'prettier/prettier': true,
    // Allow newlines inside class attribute values
    'string-no-newline': null,
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'v-bind'],
      },
    ],
    // Allow custom tailwind @ rules
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'],
      },
    ],
    'selector-id-pattern': /^[a-z][A-Za-z]*$/,
    'selector-max-type': [1, { ignore: ['child', 'descendant', 'compounded'] }],
    'selector-max-universal': 2,
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'media-feature-name-disallowed-list': ['max-width'],
  },
};
