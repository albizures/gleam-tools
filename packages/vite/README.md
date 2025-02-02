# @gleam-tools/vite [![npm](https://img.shields.io/npm/v/@gleam-tools/vite)](https://npmjs.com/package/@gleam-tools/vite)

Import from [Gleam](https://gleam.run/) (`*.gleam`) files directly.

## Usage

1. `npm i @gleam-tools/vite`
2. Create a basic Vite project (`npm create vite`)
3. Create a `gleam.toml` and add Gleam dependencies
4. Update your vite config

```ts
// vite.config.{ts,js}
import { gleam } from '@gleam-tools/vite'

export default {
	plugins: [gleam()],
}
```

5. Start importing from Gleam!

## API


## Note

By default, TypeScript (LSP) will complain about importing files with the `.gleam` extension. There are two choices for fixes:

- If the type of the import doesn't matter , add `declare module "*.gleam";` inside any TypeScript file. A caveat is the LSP does not know if an export exists so it will not provide autocompletion when importing a Gleam file and it will type exports as `any`.
- Alternatively, if the vite dev server is running you can have full type safety when importing from Gleam. `npm i @gleam-tools/ts`. Create a `tsconfig.json`/`jsconfig.json` and set `compilerOptions.plugins` to `[{"name": "@gleam-tools/ts"}]` (**RECOMMENDED**)
