##Pizza Pie Charts

Pizza is a responsive pie, donut, bar, and line graph charting library based on the Snap SVG framework from Adobe. It focuses on easy integration via HTML markup and CSS instead of JavaScript objects, although you can pass JavaScript objects to Pizza as well.

### Implementation

The first step is to create a key with a `ul` and list elements that represent each piece of the pie with a `data-pie-id` attribute pointing to the ID of your chart container.
```
<ul data-pie-id="svg">
  <li data-value="60">Water Buffalo (60)</li>
  <li data-value="20">Bison (20)</li>
  <li data-value="12">Sheep (12)</li>
  <li data-value="32">Goat (32)</li>
  <li data-value="50">Shetland Pony (50)</li>
</ul>
```

After you have created your legend, you can include your chart container anywhere on the page.

```
<div id="svg"></div>
```

You can then style your chart with CSS or SCSS.

To initialize your charts, you can call `Pizza.init();` at the end of the body of your page.

### Data Options

You can pass options to the chart by using the `data-options` attribute on your legend:

```
<ul data-pie-id="svg" data-options='{"donut":"true"}'>
```

Or on initialization:

```
Pizza.init('#myChart', {
  data: [23, 44, 1, 29, 90]
});
```

### Custom Text

Setting `data-text` on your `li` allows you to override the default percent for pie piece labels. You have access to `value` and `percent` as variables. All variables are wrapped in handlebar.js style double brackets.

```
<li data-value="32" data-text="Goats {{percent}} ({{value}} total)">Goat (32)</li>
```

Will render out `Goats 19% (32 total)` for example.

### Contributing

To contribute you must have Node and Grunt installed on your system.

Compiling:

```
npm install
bower install
grunt
```
