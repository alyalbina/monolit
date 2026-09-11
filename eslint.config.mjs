import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'test-results/**', 'playwright-report/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // Result-block payloads are typed `unknown` at the domain boundary (DOC-02) and narrowed per RB type
      // inside the renderer; the casts there are deliberate.
      '@typescript-eslint/no-explicit-any': 'off',
      // This rule targets the pages router's _document. The DS type pairing (Noto Sans / Source Code Pro)
      // is loaded once in the App Router root layout, which is the supported place for it.
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

export default config;
