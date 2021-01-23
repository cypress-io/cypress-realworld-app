/** @type {import("snowpack").SnowpackUserConfig } */

module.exports = {
  extends: "@snowpack/app-scripts-react",

  mount: {
    public: { url: "/", static: true },
    src: { url: "/dist" },
  },
  plugins: [
    //"@snowpack/plugin-react-refresh",
    //"@snowpack/plugin-dotenv",
    //"@snowpack/plugin-typescript",
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    //{ match: "routes", src: ".*", dest: "/index.html" },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    polyfillNode: true,
  },
  devOptions: {
    port: 3000,
    src: "src",
    bundle: false,
  },
  buildOptions: {
    /* ... */
  },
  alias: {
    src: "./src",
  },
};
