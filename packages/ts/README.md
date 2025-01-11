# ts-gleam [![npm](https://img.shields.io/npm/v/@gleam-tools/ts)](https://npmjs.com/package/@gleam-tools/ts)

TypeScript LSP Plugin for importing [Gleam](https://gleam.run) files.

## Usage

1. Create a new Gleam project.
2. In `gleam.toml`, set `target=javascript` and under `[javascript]` set `typescript_declarations=true`.
3. `npm add @gleam-tools/ts`
4. Create a `tsconfig.json`/`jsconfig.json` and set `compilerOptions.plugins` to `[{"name": "@gleam-tools/ts"}]`
5. Build your Gleam project when ever you have changes and import away!

## Note

This **does not** build and resolve imports for your. All this is, is for the LSP to type check correctly.
For building with Gleam/JavaScript, check out [`@gleam-tools/vite`](https://github.com/albizures/gleam-tools/tree/master/packages/vite)
