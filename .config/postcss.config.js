import { config } from "process";

export default {
  plugins: {
    tailwindcss: {
      config: "./.config/tailwind.config.js",
    },
    autoprefixer: {},
  },
};
