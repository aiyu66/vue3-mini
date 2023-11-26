import vue from "rollup-plugin-vue";

export default {
  input: "./App.vue",
  plugins: [vue()],
  output: {
    name: "app",
    format: "es",
    file: "lib/mini-vue.esm.js",
  },
};
