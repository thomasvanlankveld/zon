export default function postcssConfig(ctx) {
  return {
    parser: ctx.parser ? "sugarss" : false,
    map: ctx.env === "development" ? ctx.map : false,
    plugins: {
      "postcss-import": {},
      "postcss-nesting": {},
    },
  };
}
