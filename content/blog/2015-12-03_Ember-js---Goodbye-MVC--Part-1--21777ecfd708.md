---
title: Ember.js — Goodbye MVC (Part 1)
description: >-
  At EmberConf 2015, Yehuda Katz and Tom Dale announced the arrival of certain
  changes to Ember 2. Most notably, the routable components RFC…
date: '2015-12-03T16:49:32.589Z'
categories: ''
keywords: ''
slug: /@sugarpirate/ember-js-goodbye-mvc-part-1-21777ecfd708
---

At EmberConf 2015, [Yehuda Katz](https://twitter.com/wycats) and [Tom Dale](https://twitter.com/tomdale) announced the arrival of certain changes to Ember 2. Most notably, the [routable components RFC](https://github.com/emberjs/rfcs/pull/38) attracted a lot of attention because of its proposal to deprecate and eventually remove controllers. Naturally, this was alarming to many existing Ember users, especially since Ember and Sproutcore have always been client-side MVC frameworks.

![](https://cdn-images-1.medium.com/max/2560/1*N53JJT7h8-Oe-8OJhRCqHg.jpeg)

[https://unsplash.com/photos/Ki0dpxd3LGc](https://unsplash.com/photos/Ki0dpxd3LGc)

#### Goodbye MVC

It is no secret that many new Ember 2 conventions and changes have direct influence from [React](https://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/docs/overview.html#content) (a pattern for data flow in React apps). What Flux calls the “unidirectional data flow” is what we call “Data down, actions up” (DDAU) in Ember.

DDAU avoids the traditional client-side MVC pattern in favor of a single flow of data (hence unidirectional), which makes apps easier to reason about, and improves their performance. The fundamental problem with MVC is revealed as your application grows larger and more complex — cascading updates and implicit dependencies lead to a tangled mess and unpredictability. Updating one object leads to another changing, which in turn triggers more changes, and ultimately makes maintaining your application a frustrating experience.

![](https://cdn-images-1.medium.com/max/1000/1*MjgBefc-yauK1zWrtCX1Bg.png)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).

In the DDAU pattern, data flows one-way and there are no two-way bindings. Different parts of your application can remain highly decoupled and predictable, which means you will always know the source of an object’s change. If you’ve read my post on [functional programming and the observer effect](https://medium.com/the-ember-way/ember-js-functional-programming-and-the-observer-effect-48901c3b84d7#.1205bzvwx), you’ll understand why it’s important to keep your components free from side effects.

Instead of spending time cobbling together your own makeshift framework with a dozen [micro-libraries](https://www.reddit.com/r/javascript/comments/3v43qf/im_a_web_developer_who_uses_jquery_to_write_a/cxkl9d1) and bike-shedding on the best way to implement a feature, using Ember means instant productivity and quick developer on-boarding. Combined with the DDAU pattern and the Glimmer rendering engine, Ember developers have both productivity and performance out of the box.

#### Preparing your application for DDAU

When routable components land, controllers will be deprecated and removed. Controllers and views have always been confusing for new Ember users, and “80% of their use cases were to do something that was fundamentally a component” (watch Yehuda and Tom explain more in this [video](https://www.youtube.com/watch?v=QgycDZjOnIg)).

Since Ember components aren’t singletons, they will be torn down and re-rendered in an optimized fashion when Glimmer deems necessary. How then to handle state persistence when controllers go away?

For example, you might have some property on your controller that holds on to state that you would like to preserve throughout the app. To do so in Ember 2 (and today), we can remove that controller property in favor of “service-backed components”. The service will hold on to singleton component state, and explicitly injected only where necessary. Because services are powerful and can be easily abused, I’ll talk more about it at the end of this post.

#### Implementing service-backed components

In the following example, I’ll demonstrate how you can use services and one-way bindings today. You can follow along below as well as check out the [demo](https://poteto.github.io/component-best-practices/#/service-backed).

Our little application consists of a couple of checkboxes for selecting animals. This selection needs to persist across different routes, and restore state when returning back to the route. All we need is to define a simple service that holds state for the selected items, and then inject it into the routable component.

In the route’s template, we can just render the injected service’s state using the **each** helper.

In our controller or routable component, we inject the service and define the action for handling the checked animal. The service’s bag of state is then passed into the component, keeping it as pure as possible. Although you could have just injected the service into the component, doing it this way makes things more explicit and allows the component to be decoupled from the service.

As mentioned, the service itself is simple. We can define more complex behavior later, but the underlying persistence for its state is just a JavaScript array.

Because our behavior is simple, we don’t need to define a sub-classed component in this example. The **check** action is passed in from the routable component / controller, so using closure actions in the component’s template means that we don’t have to cast **sendActions** into the void.

In our component’s template, we make use of small, composable helpers. These helpers are just simple JavaScript functions under the hood, and because they have return values, we can use them as Handlebars sub-expressions where we might have once defined a computed property.

The **contains** helper doesn’t ship with Ember, but the function itself is [one line of code](https://github.com/poteto/component-best-practices/blob/master/app%2Fhelpers%2Fcontains.js?ts=2). There are a bunch of useful addons that add helpers such as these to your application — for example, [ember-truth-helpers](https://www.npmjs.com/package/ember-truth-helpers) is an addon I find myself using in almost all my apps.

As mentioned in my [previous post](https://medium.com/the-ember-way/ember-js-functional-programming-and-the-observer-effect-48901c3b84d7#.1205bzvwx), the [ember-one-way-input](https://github.com/dockyard/ember-one-way-input) addon is an easy way to start using one-way bindings today.

I hope this simple example illustrates how you can build maintainable and performant apps with some of my favorite features of Ember — helpers, closure actions, components, and one-way bindings.

#### A word of caution about Services

As the cliché goes, “with great power…”. Because services in Ember are singletons, it becomes tempting to make multiple services and inject them everywhere.

If your main reason for creating a service is to use it as a global, that is generally a code smell because dependencies become implicit (we learned earlier that this is a bad thing) and parts of your application become tightly coupled. Instead, expose data and actions via interfaces to keep your code decoupled and explicit. Remember the Principle of Least Power, and only use a service when strictly necessary!

#### So when should I use a Service?

I like this [Stack Overflow answer](http://stackoverflow.com/a/142450/4259952) on when you should use a singleton. Essentially, you should only use one when you can only have a single instance throughout your application. For example, a shopping cart, [flash messages](https://github.com/poteto/ember-cli-flash), or activity feed could be great candidates for a service.

Thanks for reading! In my next post in this series, we’ll explore other advanced techniques for the DDAU pattern.

Until next time,

Lauren