---
title: Route Closure Actions in Ember.js
description: >-
  In my previous post, I wrote about moving singleton state in Controllers into
  Services that back components. This means being able to…
date: '2016-04-21T17:08:25.092Z'
categories: ''
keywords: ''
slug: /@sugarpirate/route-closure-actions-in-ember-js-d0a7a37a5d1b
---

![](https://cdn-images-1.medium.com/max/2560/1*KU2Kul8ITrOeXD8u7weS4Q.jpeg)

In my [previous post](https://emberway.io/ember-js-goodbye-mvc-part-1-21777ecfd708#.cigfu5es3), I wrote about moving singleton state in Controllers into Services that back components. This means being able to lighten the responsibility of Controllers in your application, and in some cases even remove them completely. However, a common pain point that remains for many is that it isn’t really clear what _should live_ on a Controller, if anything.

![](https://cdn-images-1.medium.com/max/800/1*tvgwFdy2_WAIdc_kvd_Hqw.png)

(No, they’re not)

[Locks](https://twitter.com/locks) has written an excellent [blog post](https://locks.svbtle.com/controllers-are-dead-long-life-controllers) on this sometimes controversial topic, and I expanded upon it a little in my [podcast episode](https://emberweekend.com/episodes/like-stealing-candy-from-a-baby) with Ember Weekend. [Erik Hanchett](https://twitter.com/erikch) also did a video demo showcasing what I mentioned:

Are Ember.js Controllers Dead? by Erik Hanchett

Basically, you still require a Controller if you use query parameters, and in certain cases of bubbling actions.

One reason that is commonly suggested as an argument for using Controllers is that when Routable Components land, it would be a simple rename from Controller to Component. However, if you’ve read my earlier post and listened to the podcast / watched the video above, you’ll know that Routable Components are stateless like ordinary Ember Components. Controllers, on the other hand, are stateful, which means that the transition won’t be so simple.

That said, I wouldn’t go out of your way to creatively avoid using Controllers, and would **only remove them if it makes sense to do so**. You can ease the transition by extracting your stateful logic into a service, and leaving the stateless logic in your Controller (or Component).

#### Sending closure actions directly to the route

[Closure actions](https://dockyard.com/blog/2015/10/29/ember-best-practice-stop-bubbling-and-use-closure-actions) are probably one of my favorite additions to Ember. Instead of casting string actions into the void and praying that something is listening, we can instead use an action like we would any other JavaScript function. This means that we can do useful things like curry arguments, utilize return values, and all of the other good stuff we expect from a regular JS function call.

For example, the following action is implicit in that you have no idea where the action actually lives — it could be on a component, controller or route.

```handlebars
{{! where does `myAction` live? }}
<button {{action "myAction"}}>Do it</button>
```

Unfortunately, Ember’s in a bit of an awkward transition phase right now. Without bringing in an addon (or making a custom helper), it’s not possible to use a closure action directly from the route — it would have to be defined on the Controller.

If you wanted to remove Controllers from your application, then you would have to resort to using string based actions instead of closure actions. This seems like a lose-lose situation, so I worked together with [rwjblue](https://twitter.com/rwjblue) to turn his [jsbin spike](http://jsbin.com/jipani/edit?html,js,output) into a working addon.

[ember-route-action-helper](https://github.com/dockyard/ember-route-action-helper) lets you use closure actions defined on the route in your templates, meaning that many Controllers that only exist to implement actions can now be removed. You can install it today with:

```
ember install ember-route-action-helper
```

And to use it, you can just use `route-action` in place of `action` inside of your route’s template, like so:

```handlebars
{{! foo/template.hbs }}
{{foo-bar click=(route-action "updateFoo" "Hello" "world")}}
```

This addon gives you all the goodness of closure actions, and is a great way of taking steps to future proof your Ember application. When Routable Components do land, and actions work correctly, then upgrading your app simply becomes a search and replace for `s/route-action/action`.

#### Power up your Handlebars templates with Helpers

Helpers are a really nice way of extracting utility functions that you can use in your application. You can create class based Helpers, like ember-route-action-helper, or simple pure-function ones using [Helper.helper](http://emberjs.com/api/classes/Ember.Helper.html#method_helper) like the one used in [ember-toggle-helper](https://github.com/poteto/ember-toggle-helper).

Pure-function helpers are simple to grok and understand, so a look at addons like [ember-truth-helpers](https://github.com/jmurphyau/ember-truth-helpers) is sufficient to understand them.

ember-route-action-helper uses the class based implementation, which must define a `compute` method. This is then invoked every time one of the positional arguments to the helper changes.

Under the hood, the `route-action` helper retrieves the router from the application instance as a computed property, then locates the function reference from the currently active routes:

```js
function getRouteWithAction(router, actionName) {
  let handler = emberArray(getRoutes(router)).find((route) => {
    // find the route with the action
  });

  return { action, handler };
}
```

The action and the handler (route) is then returned, and wrapped with a closure action, which allows us to do all the nice stuff we expect from any other closure action in Ember. By returning a function in a helper, you can essentially “decorate” the action helper with some custom functionality.

```js
compute([actionName, ...params]) {
  let action = function(...invocationArgs) {
    let args = params.concat(invocationArgs);
    let { action, handler } = getRouteWithAction(router, actionName);

    return run.join(handler, action, ...args);
  };

  // return the closure action
}
```

And because Helper classes are just like any other class in Ember, you can do the usual things like inject services, define computed properties, and so on. Here’s a contrived example:

```js
import Ember from 'ember';

const {
  inject: { service },
  Helper,
  observer,
  get
} = Ember;

export default Helper.extend({
  session: service('session'),

  compute([shoe]) {
    return parseInt(get(this, 'session.currentUser.shoeSize')) === parseInt(get(shoe, 'size'));
  },

  onShoeSizeChange: observer('session.currentUser.shoeSize', function() {
    this.recompute();
  })
});
```

The simplified Helper class was introduced in [1.13](http://emberjs.com/blog/2015/06/12/ember-1-13-0-released.html#toc_new-ember-js-helper-api), and are an excellent addition to Ember. In my next post, I’ll talk a little bit more about them and how we can use them to replace certain CPs.

Until next time, thanks for reading!