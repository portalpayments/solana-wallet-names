import * as esbuild from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { log } from "console";

let buildResult = await esbuild.build({
  entryPoints: [
    "src/connect.ts",
    "src/constants.ts",
    "src/http-client.ts",
    "src/index.test.ts",
    "src/index.ts",
    "src/types.ts",
  ],
  tsconfig: "tsconfig.json",
  outdir: "dist",
  bundle: false,
  plugins: [dtsPlugin()],
});

log(buildResult);
