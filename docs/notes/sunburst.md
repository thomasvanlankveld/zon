# Sunburst

## HTML Canvas

### Canvas donut segments

- [html - How to draw segment of a donut with HTML5 canvas? - Stack Overflow](https://stackoverflow.com/questions/8030069/how-to-draw-segment-of-a-donut-with-html5-canvas)
- [CanvasRenderingContext2D: arc() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc)

### Canvas interactions

- [javascript - How to make canvas element in html clickable? - Stack Overflow](https://stackoverflow.com/questions/22317805/how-to-make-canvas-element-in-html-clickable)
- [CanvasRenderingContext2D: isPointInPath() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath)

### Is point in arc?

Probably not needed when we have [`isPointInPath()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath)

- [geometry - How to determine whether a point (X,Y) is contained within an arc section of a circle (i.e. a Pie slice)? - Stack Overflow](https://stackoverflow.com/questions/6270785/how-to-determine-whether-a-point-x-y-is-contained-within-an-arc-section-of-a-c)
- [Find if a point lies inside a Circle - GeeksforGeeks](https://www.geeksforgeeks.org/find-if-a-point-lies-inside-or-on-circle/)

## Scaling

For the thickness of the arcs, I've tried some continuous non-linear scaling methods. The goal is to emphasize the "lower depth" segments of the chart, but it does not seem like a great idea. The first and second layer become too thick, while the last few layers are not thick enough. It's more informative for the first few layers to be pretty thick, at an (about) equal thickness, so that you can easily inspect them. Then for the layers beyond that, it's useful to still show them, but only as thin slices, to indicate where the depth is. So the best option is probably to have two fixed thicknesses instead of a continuous scaling function.

### Continuous non-linear scaling

At the bottom of `getArcDimensions`, scale the coordinates:

```ts
return { x0, x1, y0: scale(y0), y1: scale(y1) };
```

The scale function needs to map from domain `0..1` to `0..1`.

First attempt was a simple `Math.sqrt`:

```ts
function scale(x: number) {
  return Math.sqrt(x);
}
```

Second attempt used logarithmic scaling

```ts
const base = 1;
const factor = 5;
const correction = 1 / Math.log(factor * 1 + base);

function scale(x: number) {
  return Math.log(factor * x + 1) * correction;
}
```

Sources:

- [d3-scale | D3 by Observable](https://d3js.org/d3-scale)
- [Continuous scales / D3 | Observable](https://observablehq.com/@d3/continuous-scales)
- [Power scales | D3 by Observable](https://d3js.org/d3-scale/pow)
- [Logarithmic scales | D3 by Observable](https://d3js.org/d3-scale/log)
