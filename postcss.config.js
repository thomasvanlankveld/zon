export default function postcssConfig(ctx) {
  return {
    parser: ctx.parser ? "sugarss" : false,
    map: ctx.env === "development" ? ctx.map : false,
    // Transpilation targets Safari 13, see `vite.config.ts` for more details
    plugins: {
      "postcss-import": {},
      "postcss-nesting": {},
      "@csstools/postcss-bundler": {},
      "@csstools/postcss-cascade-layers": {},
    },
  };
}
