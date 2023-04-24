import { defineConfig } from 'tsup'

export default defineConfig({
  entryPoints: [
    "src/connect.ts",
    "src/constants.ts",
    "src/http-client.ts",
    "src/index.test.ts",
    "src/index.ts",
    "src/types.ts",
  ],
  tsconfig: "tsconfig.json",
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true
})