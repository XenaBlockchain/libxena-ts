# Libnexa-ts

Nexa is a powerful new peer-to-peer platform for the next generation of financial technology.

The decentralized nature of the Nexa network allows for highly resilient nexa infrastructure, and the developer community needs reliable, open-source tools to implement nexa apps and services.

Libnexa-ts provides a reliable SDK for TypeScript/JavaScript apps that need to interface with the Nexa network.

## Get Started

### Install the library

```sh
npm install libnexa-ts
```

### Import into your project

#### Using ES Modules (ESM)

When using this library in an ESM-based project, it is recommended to import only the specific modules you need, rather than importing the entire library. This approach is beneficial for tree-shaking, which helps reduce your application's bundle size by eliminating unused code.

```ts
// Less Optimal: Importing the entire library
import libnexa from 'libnexa-ts';

// Recommended: Import only what you need
import { Address, PrivateKey, ... } from 'libnexa-ts';
```

#### Using CommonJS (CJS)

With CJS, the common way is to load the entire library and using the modules thruogh it:

```ts
const libnexa = require('libnexa-ts');
```

## Node.js / Server-Side Applications

This library is fully compatible with Node.js and can be used seamlessly in server-side applications. There is no need for additional configuration or polyfills when running in a Node.js environment.

Simply install the library and import it into your project.


## Browser / Client-Side Applications

If you are building a browser application, you may need to **polyfill** certain Node.js modules or features used by this library. This can be done using your bundler or packager, such as **Webpack**, **Vite**, or **Rollup**.

### How to Polyfill

- **Webpack**: Use the [NodePolyfillPlugin](https://github.com/Richienb/node-polyfill-webpack-plugin).
- **Vite**: Use the [vite-plugin-node-polyfills](https://github.com/vitejs/vite-plugin-node-polyfills).
- **Rollup**: Include [rollup-plugin-node-polyfills](https://github.com/ionic-team/rollup-plugin-node-polyfills).

### Example with Vite

```bash
npm install -D vite-plugin-node-polyfills
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [nodePolyfills({
    protocolImports: true,
    globals: {
      global: true,
      process: true,
      Buffer: true
    }
  })],
});
```

Make sure your packager is configured correctly to handle the dependencies for browser environments.