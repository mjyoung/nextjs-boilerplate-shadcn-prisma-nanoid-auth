/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  tailwindFunctions: ["clsx", "cn"],
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
