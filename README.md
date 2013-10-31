##Pizza Pie Charts

Pizza is a responsive Pie chart based on the Snap SVG framework from Adobe. It focuses on easy integration via HTML markup and CSS instead of JavaScript objects, although you can pass JavaScript objects to Pizza as well.

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

You can pass options to the chart by using the `data-options` attribute on your legend, or by passing them in on initialization.

```
<ul data-pie-id="svg" data-options='{"donut":"true"}'>
```

Or on initialization:

```
Pizza.init('#myChart', {
  data: [23, 44, 1, 29, 90]
});
```

### Contributing

To contribute you must have Ruby and Bundler installed on your system.

Compiling the example:

```
bundle
bundle exec compass watch
```
