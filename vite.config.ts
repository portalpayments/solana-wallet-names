// https://vitejs.dev/config/
import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import nodePolyfills from "rollup-plugin-node-polyfills";
import dts from "vite-plugin-dts";

// Config is based on metaplex + vite example from:
// https://github.com/metaplex-foundation/js-examples/tree/main/getting-started-vite

// es2020 Needed for BigNumbers
// See https://github.com/sveltejs/kit/issues/859

export default defineConfig({
  plugins: [dts()],
  resolve: {
    alias: {
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      assert: "assert",
      crypto: "crypto-browserify",
      util: "util",
      "node-fetch": "just-use-native-fetch",
    },
  },
  define: {
    "process.env": process.env ?? {},
  },
  build: {
    target: "es2020",
    // See https://vitejs.dev/guide/build.html#library-mode
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: "src/index.ts",
      name: "SolanaWalletNames",
      // the proper extensions will be added
      fileName: "solana-wallet-names",
    },

    rollupOptions: {
      plugins: [nodePolyfills({ crypto: true })],
    },
    // From https://github.com/vitejs/vite/issues/9703#issuecomment-1216662109
    commonjsOptions: {
      include: [],
    },
    minify: true,
    // We use tsc/rollup to build the service worker, so don't destroy that built file.
    emptyOutDir: false,
  },
  optimizeDeps: {
    // From https://github.com/vitejs/vite/issues/9703#issuecomment-1216662109
    disabled: false,
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
      target: "es2020",
    },
  },
});
