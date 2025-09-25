import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Permite usar any temporariamente
      "@typescript-eslint/no-explicit-any": "off",

      // Ignora strings não escapadas em JSX
      "react/no-unescaped-entities": "off",

      // Variáveis não usadas geram aviso, não erro
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      // Permite imports não usados gerarem aviso
      "no-unused-vars": ["warn"],

      // Outros ajustes opcionais
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];

export default eslintConfig;
