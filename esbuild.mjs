import * as esbuild from "esbuild";
import { log } from "console";
import brode from "@geut/esbuild-plugin-brode";

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
  plugins: [brode()],
  // bundle: true,
});

log(buildResult);
