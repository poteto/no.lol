---
title: Skeleton Screen Loading in Ember.js
description: >-
  Skeleton screen loading (also known as placeholder loading) is a technique
  that enhances the perception of loading in your application…
date: '2017-10-11T21:39:53.733Z'
categories:
  - engineering
keywords:
  - emberjs
  - skeleton screen loading
  - query params
  - ember-concurrency
  - ember-parachute
cover: ./francesco-ungaro-1401507-unsplash.jpg
coverAuthor: Francesco Ungaro
coverOriginalUrl: https://unsplash.com/photos/vFuIriPcSiM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

Skeleton screen loading (also known as placeholder loading) is a technique that [enhances the perception](https://medium.com/ux-for-india/facilitating-better-interactions-using-skeleton-screens-a034a51120a5) of loading in your application. Typically, the loading state of an application is indicated by some kind of loading spinner or progress bar. Unfortunately, this can sometimes backfire and cause the app to feel slower than it actually is.

The idea behind skeleton screens is instead to “[show content as soon as possible](https://developer.apple.com/ios/human-interface-guidelines/app-architecture/loading/)”, by using a “skeleton” or placeholder representation of the actual UI in its place while content is being loaded. From what I’ve seen in the wild, this is typically a wireframe version of the UI with subtle animations, but there are no hard and fast rules.

![Facebook’s skeleton screen loading](https://cdn-images-1.medium.com/max/800/1*x3sau7_pLGRBTwK1bXGXhw.png "Facebook’s skeleton screen loading")

> Don’t make people wait for content to load before seeing the screen they’re expecting. Show the screen immediately, and use placeholder text, graphics, or animations to identify where content isn’t available yet. Replace these placeholder elements as the content loads. — Apple iOS Human Interface Guidelines

I won’t delve into too much detail on the concept. In this post, I’d like to demonstrate how you can achieve skeleton screen loading in your Ember.js application.

### Don’t fetch your data in the route

You’ve probably been told that you should always fetch data in the route, typically in the [model hook](https://guides.emberjs.com/v2.16.0/tutorial/model-hook/):

```js
import Ember from 'ember';

const { Route } = Ember;

export default Route.extend({
  model({ fullName }) {
    return this.store.queryRecord('user', { fullName });
  }
});
```

The nice thing about this approach, is that an unresolved promise returned in this hook will trigger the route’s [loading substate](https://guides.emberjs.com/v2.16.0/routing/loading-and-error-substates/). This is usually where you would place your loading spinner component, for example. This is fine when you’re working with a non-query-param-enabled route, but if you do have to support query params or refresh the model based on some user input, you might notice [annoying UX](https://ember-twiddle.com/b7489a0682f38df1f2d4a7aefe1eb9c4?openFiles=routes.application.js%2C&route=%2F%3Fgreeting%3DHallo!) (ember-twiddle example) as a result of this behavior.

Whenever your user tries to change a query param linked value that refreshes the model, the model hook re-fires. If you’re trying to search for something, for example, this causes an unacceptable amount of jank.

We can do better.

### Move data loading out of your route

What we really want to avoid is the entire application transitioning to a loading substate whenever some data is loading. This is regardless of whether you use query params. In Ember’s loading substate, your app is no longer responsive. We should avoid that.

However, moving this out from the route raises important questions. Without the built-in logic for the loading substate, what can we do to avoid rebuilding it?

#### ember-concurrency saves the day

Instead of loading data in the route, you can do so in a controller or a component. I personally prefer using [non-presentational components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) to load data — I call them “loader” components, sometimes also known as container components.

```js
import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component, get, set } = Ember;

export default Component.extend({
  tagName: '',
  init() {
    this._super(...arguments);
    this.data = [];
  },

  didReceiveAttrs() {
    let query = get(this, 'query');
    get(this, 'fetchData').perform(query);
  },

  fetchData: task(function*(query) {
    yield timeout(1000);
    let users = yield get(this, 'store').queryRecord('user', query);
    return set(this, 'data', users);
  }).restartable()
});
```

This approach also works with a controller, but you won’t have any lifecycle hooks to work with. Instead you’ll have an action call the [ember-concurrency](http://ember-concurrency) task that fetches data in response to some user input.

In its simplest form, a loader component is a tag-less component that performs an ember-concurrency task whenever some property being passed to it is changed. For example, this could be a query params hash, or other kind of user input. Then, all this loader component does is yield out specific properties:

```handlebars
{{yield (hash
    isRunning=fetchData.isRunning
    data=data)
}}
```

With ember-concurrency, we don’t have to rebuild the wheel to recreate the loading substate within our component. We can instead leverage its “[derived state](https://ember-concurrency.com/#/docs/derived-state)” and change our UI accordingly. Here’s a simple example of how to use this loader component:

```handlebars
{{#my-loader query=query as |loader|}}
  {{#if loader.isRunning}}
    <p>Loading...</p>
  {{else}}
    {{#each loader.data as |user|}}
      {{user.fullName}}
    {{/each}}
  {{/if}}
{{/my-loader}}
```

With this change, we now have granular control over how our loading substate is rendered in our application. Most importantly, you’ll note that loading data this way will no longer block interactivity in your UI. Now, adding skeleton screens in its place is easy, thanks to the [ember-content-placeholders](https://github.com/michalsnik/ember-content-placeholders) addon by [Michał](https://github.com/michalsnik).

Because the addon relies on ember-cli-sass, I wasn’t able to include it in my [ember-twiddle demo](https://ember-twiddle.com/c0f98a5b62287d4a88fa80be65d3ba0d?openFiles=templates.application.hbs%2C). I added a simple placeholder instead which provides a similar effect.

<div style='position:relative; padding-bottom:calc(62.50% + 44px)'><iframe src='https://gfycat.com/ifr/WelltodoHeartyBabirusa' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe></div><p> <a href="https://gfycat.com/welltodoheartybabirusa">via Gfycat</a></p>
Screencast taken with a terrible internet connection from an Airbnb in Berlin

### Data loading with query params

If you do use query params, you can still adopt the same approach. [Offir](https://twitter.com/offirgolan) and I wrote an [addon](https://github.com/offirgolan/ember-parachute) that improves upon the experience in working with query params.

Instead of defining query params in _both_ your route and controller, with this addon you can define them in one place as a query param map.

This map is the source of truth for your query params, and will generate a mixin that you can then add into your controller. The mixin adds very helpful properties and methods that makes working with query params a breeze! Once you’ve added ember-parachute to your app, you can move your query param configuration away from your route and into the controller.

```js
import Ember from 'ember';
import QueryParams from 'ember-parachute';

export const AppQueryParams = new QueryParams({
  query: {
    as: 'q',
    defaultValue: 'puppy',
    refresh: true
  }
});
const { Controller, computed: { or } } = Ember;

export default Controller.extend(AppQueryParams.Mixin, {
  queryParamsChanged: or('queryParamsState.{query}.changed')
});
```

Because your route no longer fetches data, you can fetch data in your controller or component with an ember-concurrency task. This task is performed in response to user input, either via a component’s lifecycle hook, or by an explicit action call. Use the task’s derived state to determine the loading substate instead.

### What should I use the route for?

In my applications, we still use the route for specific behavior, such as enforcing valid route (not query) params. I currently work on a calendar application, so visiting **/2017/15** is obviously not valid. We handle that validation logic in the route and redirect to a valid date instead.

Obviously, this approach isn’t aligned with what is recommended in the guides. Unfortunately, at this moment in time, there is no real answer into developing a solid skeleton screen experience with the status quo. This approach with ember-concurrency and moving data loading out of the route has worked well for us in the meantime, and I’m curious to hear what your thoughts and experiences are.

Thanks for reading!