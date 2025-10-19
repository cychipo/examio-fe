import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "app",
    // Disable the built-in stylistic rules (these can produce strict JSX line-break errors)
    stylistic: false,
    imports: true,
    unicorn: true,
    typescript: {
      overrides: {
        "ts/consistent-type-imports": "off",
        "perfectionist/sort-imports": "off",
        "perfectionist/sort-exports": "off",
        "perfectionist/sort-named-imports": "off",
        "perfectionist/sort-named-exports": "off",
        "perfectionist/sort-type-exports": "off",
        "perfectionist/sort-type-imports": "off",
        "unicorn/prefer-node-protocol": "off",
        "node/prefer-global/process": "off",
        "ts/consistent-type-definitions": "off",
        "unused-imports/no-unused-imports": "warn",
        "unused-imports/no-unused-vars": "warn",
      },
    },
    react: {
      overrides: {
        "react-refresh/only-export-components": "off",
        "react/no-array-index-key": "off",
        "no-alert": "off",
        "no-console": "off",
        "react-hooks-extra/no-direct-set-state-in-use-effect": "off",
        "react-dom/no-missing-button-type": "off",
        "react/no-forward-ref": "off",
      },
    },
    javascript: true,
    yaml: false,
    jsonc: false,
    markdown: false,
    toml: false,
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/components/kokonutui",
      "src/components/magicui",
      "src/components/ui",
    ],
  },
  {
    // Without `files`, they are general rules for all files
    rules: {
      "style/semi": "off",
      "style/arrow-parens": "off",
      "style/brace-style": "off",
      "style/quote-props": "off",
      "import/consistent-type-specifier-style": "off",
      // disable trailing-comma checks (some configs call it `comma-dangle` or `style/comma-dangle`)
      "comma-dangle": "off",
      "style/comma-dangle": "off",
    },
  }
);
