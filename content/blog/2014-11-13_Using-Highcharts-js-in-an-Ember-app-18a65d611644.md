---
title: Using Highcharts.js in an Ember app
description: >-
  Highcharts is one of the better supported and developed front end charting
  libraries out there, and it makes creating standard charts a…
date: '2014-11-13T14:46:31.759Z'
categories: ''
keywords: ''
slug: /@sugarpirate/using-highcharts-js-in-an-ember-app-18a65d611644
---



[Highcharts](http://www.highcharts.com/) is one of the better supported and developed front end charting libraries out there, and it makes creating standard charts a breeze. If you have a custom chart the likes of which the world has never seen however, you might be better off building it in something like [D3.js](http://d3js.org/). If all you need is a vanilla chart in your Ember app, read on.

Implementing Highcharts in your Ember application so that it live binds to your data is simple, and really highlights the power of Ember.

#### The component and theme mixin

```js
// component
App.HighChartsComponent = Ember.Component.extend(App.HighchartsThemeMixin, {
  classNames:   [ 'highcharts-wrapper' ],
  content:      undefined,
  chartOptions: undefined,
  chart:        null,

  buildOptions: Em.computed('chartOptions', 'content.@each.isLoaded', function() {
    var chartContent, chartOptions, defaults;
    chartOptions = this.getWithDefault('chartOptions', {});
    chartContent = this.get('content.length') ? this.get('content') : [
      {
        id: 'noData',
        data: 0,
        color: '#aaaaaa'
      }
    ];
    defaults = {
      series: chartContent
    };
    return Em.merge(defaults, chartOptions);
  }),

  _renderChart: (function() {
    this.drawLater();
    this.buildTheme();
  }).on('didInsertElement'),

  contentDidChange: Em.observer('content.@each.isLoaded', function() {
    var chart;
    if (!(this.get('content') && this.get('chart'))) {
      return;
    }
    chart = this.get('chart');
    return this.get('content').forEach(function(series, idx) {
      var _ref;
      if ((_ref = chart.get('noData')) != null) {
        _ref.remove();
      }
      if (chart.series[idx]) {
        return chart.series[idx].setData(series.data);
      } else {
        return chart.addSeries(series);
      }
    });
  }),

  drawLater: function() {
    Ember.run.scheduleOnce('afterRender', this, 'draw');
  },

  draw: function() {
    var options;
    options = this.get('buildOptions');
    this.set('chart', this.$().highcharts(options).highcharts());
  },

  _destroyChart: (function() {
    this._super();
    this.get('chart').destroy();
  }).on('willDestroyElement')
});
```

```js
// mixin
App.HighchartsThemeMixin = Ember.Mixin.create({
  buildTheme: function() {
    Highcharts.theme = {
      colors: [
        '#258be2',
        '#666666',
        '#f45b5b',
        '#8085e9',
        '#8d4654',
        '#7798bf',
        '#aaeeee',
        '#ff0066',
        '#eeaaee',
        '#55bf3b',
        '#df5353',
        '#7798bf',
        '#aaeeee'
      ],
      chart: {
        backgroundColor: null,
        style: {
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
        }
      },
      title: {
        style: {
          color: 'black',
          fontSize: '18px',
          fontWeight: 'bold'
        }
      },
      subtitle: {
        style: {
          color: 'black'
        }
      },
      tooltip: {
        borderWidth: 0,
        style: {
          fontSize: '16px'
        }
      },
      legend: {
        itemStyle: {
          fontWeight: 'bold',
          fontSize: '14px'
        }
      },
      xAxis: {
        labels: {
          style: {
            color: '#6e6e70',
            fontSize: '16px'
          }
        },
        title: {
          style: {
            fontSize: '14px'
          }
        }
      },
      yAxis: {
        labels: {
          style: {
            color: '#6e6e70',
            fontSize: '16px'
          }
        },
        title: {
          style: {
            fontSize: '14px'
          }
        }
      },
      plotOptions: {
        series: {
          shadow: true
        },
        candlestick: {
          lineColor: '#404048'
        }
      },
      navigator: {
        xAxis: {
          gridLineColor: '#D0D0D8'
        }
      },
      rangeSelector: {
        buttonTheme: {
          fill: 'white',
          stroke: '#C0C0C8',
          'stroke-width': 1,
          states: {
            select: {
              fill: '#D0D0D8'
            }
          }
        }
      },
      scrollbar: {
        trackBorderColor: '#C0C0C8'
      },
      background2: '#E0E0E8',
      global: {
        timezoneOffset: new Date().getTimezoneOffset()
      }
    };
    return Highcharts.setOptions(Highcharts.theme);
  }
});
```

#### Private and public APIs

The component defines three properties as APIs – `content`, which refers to series data in [a form that Highcharts expects](http://api.highcharts.com/highcharts#series.data), `chartOptions,` a POJO that defines options for Highcharts (see [API](http://api.highcharts.com/highcharts)) and `chart`, a private property that holds the actual Highchart object so that we can refer to it within the component.

#### didInsertElement

When the component’s `didInsertElement` hook fires, we call two methods: `drawLater()`, and `buildTheme()`.

`buildTheme()` is a method from the Highcharts theme mixin that simply applies theme options to the Highchart object. `drawLater()` runs the `draw()` method once in the _afterRender_ queue in the Ember run loop, which makes sure the DOM elements are rendered before we attempt to wire up our Highchart.

#### Setting Highcharts options

In the method `buildOptions`, we add a default data series to be displayed if no content ends up being passed into the component. You could very easily set this up to include your own global Highcharts options.

#### Binding live data changes to the Highchart

With `contentDidChange` we set up an Ember observer on the `content` that’s been passed into the component. We make use of a handy Highcharts API method that lets us update the data for a series (without redrawing the entire chart), so that the chart doesn’t trash the DOM by re-rendering multiple times when data changes. This is all you need to do to get data live binding into Highcharts!

#### Teardowns

Finally, for performance issues, we want to teardown and destroy the chart when the component is destroyed. This is easily achieved with the Ember lifecycle hook `willDestroyElement`, which fires when the component is about to be destroyed (but not yet).

#### Using the component in your templates

Using the Highcharts component is as simple as:

{{high-charts content=someController.chartData chartOptions=someController.chartOptions class="some-custom-class"}}

As you can see, it’s really easy to integrate Highcharts into your Ember application. It’s not free if you’re building a non-personal project, but the support from the Highcharts team is amazing and they update the library very frequently.

If you want to build custom charts that aren’t already implemented in Highcharts, I’d highly recommend looking into D3.js. A post on wrapping D3.js might be next if enough people tweet me about it.

Enjoy!