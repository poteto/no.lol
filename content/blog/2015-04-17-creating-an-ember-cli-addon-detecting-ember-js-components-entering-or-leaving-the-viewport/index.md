---
title: >-
  Creating an Ember CLI addon — Detecting Ember.js Components Entering or
  Leaving the Viewport
kind: post
description: >-
  I wrote a post last year about how I made an Ember Mixin that would let Ember
  Components or Views know if their DOM element had entered or…
date: '2015-04-17T23:02:16.905Z'
categories:
  - engineering
keywords:
  - emberjs
  - requestAnimationFrame
  - ember-in-viewport
  - in viewport
  - getBoundingClientRect
  - ember addons
published: true
cover: ./toa-heftiba-1399721-unsplash-optimized.jpg
coverAuthor: Toa Heftiba
coverOriginalUrl: https://unsplash.com/photos/_2HNqkk6FEU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

I [wrote a post](https://medium.com/delightful-ui-for-ember-apps/ember-js-detecting-if-a-dom-element-is-in-the-viewport-eafcc77a6f86) last year about how I made an Ember Mixin that would let Ember Components or Views know if their DOM element had entered or left the viewport. If you’re unfamiliar with the [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) API or the approach in general (for determining if an element is in the viewport), please have a read of that post first!

This time, I want to talk about how I improved the original Mixin to use the [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)  API for improved performance at close to 60FPS, as well as to go through the process of creating a simple [ember-cli addon](http://www.ember-cli.com/#developing-addons-and-blueprints). Because certain browsers (mainly IE) don’t support rAF, we’ll also setup an automatic fallback to using the Ember run loop method I used in my previous post.

Let’s get started!

### Demo App

![](https://cdn-images-1.medium.com/max/800/1*9WZqJfpL4daIEBJiufTolQ.png)

Featuring Brian from DockYard ☺

I made a simple [demo app](http://development.ember-in-viewport-demo.divshot.io/) to demonstrate how you might use the Mixin. The goal for this addon was to allow you to easily style or do something with Components/Views when they enter or leave the viewport. For example, you could easily use this Mixin to build a lazy loader for images, or even for triggering animations. Using this Mixin, you won’t need to bring a jQuery plugin and can instead rely on a highly performant ember-cli addon.

### Installing the addon

If you’re using ember-cli and want to use the addon, you can install it with:

```
$ ember install ember-in-viewport
```

The source for the addon is available at [dockyard/ember-in-viewport](https://github.com/dockyard/ember-in-viewport).

### Creating your first ember-cli addon

I’m going to walk through this post as if I was creating the [ember-in-viewport](https://github.com/dockyard/ember-in-viewport) addon, so I’ll be using that name from here on.

With ember-cli, creating a new addon is just one command away:

```
$ ember addon ember-in-viewport
```

This generates a new folder structure with the same name as your addon. Before we dive into the addon logic, let’s get a few housekeeping items out of the way.

#### Updating manifests

[package.json](https://docs.npmjs.com/files/package.json) is the manifest for your ember-cli addon that does many things with npm. Because this is quite basic, I won’t go into any details here, but you’ll want to update your addon’s _name_, _description_, _repository_, _author_ _name_ and _keywords_ as relevant to your addon. If you care at all about scores on [Ember Observer](http://emberobserver.com/addons/ember-cli-flash), you’ll want to make sure these are filled out correctly because they do affect scores! They also help with finding your addon on npm, so it doesn’t hurt to fill these out from the start.

For this addon, since we’re not using ember-data, we’re going to delete that line in [package.json](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/package.json) as well as [bower.json](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/bower.json).

#### Adding an ember-try config

[ember-try](https://github.com/kategengler/ember-try) is a wonderful ember-cli addon by [@katiegengler](https://twitter.com/katiegengler) that helps you test against multiple bower dependencies such as ember and ember-data. This means you’ll be able to test your addon to verify if it works on other versions, which is a nice thing to do as an addon author! For ember-in-viewport, we [test against ember 1.11.1, release, beta and canary channels](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/config/ember-try.js).

With that out of the way, we can start writing the improved logic for the addon.

### Rewriting the In Viewport Mixin

The Mixin still uses the [same method](https://medium.com/delightful-ui-for-ember-apps/ember-js-detecting-if-a-dom-element-is-in-the-viewport-eafcc77a6f86) for determining if a DOM element is in the viewport, using [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect) and the window’s [innerHeight](https://developer.mozilla.org/en-US/docs/Web/API/Window.innerHeight) and [innerWidth](https://developer.mozilla.org/en-US/docs/Web/API/Window.innerWidth).

First, let’s create a new Mixin using ember-cli:

```
$ ember g mixin in-viewport
```

This creates the appropriate files inside of **/addon**, which is the main folder for your addon’s logic. This folder won’t be merged with the consuming ember application’s tree (unlike the **/app** folder). For this addon, we want our users to import the mixin directly from the addon itself, so we’ll delete the folder that was generated inside of **/app**, and update the generated tests to import the right file.

#### Importing modules and utils

```js
import Ember from 'ember';
import canUseDOM from 'ember-in-viewport/utils/can-use-dom';
import canUseRAF from 'ember-in-viewport/utils/can-use-raf';
import isInViewport from 'ember-in-viewport/utils/is-in-viewport';
```

Inside of [addons/mixins/in-viewport.js](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/addon%2Fmixins%2Fin-viewport.js), we’ll import the modules that the mixin requires. The [canUseDOM](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/addon%2Futils%2Fcan-use-dom.js) and [canUseRAF](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/addon%2Futils%2Fcan-use-raf.js) modules are simple utility files that help us determine whether or not a DOM is available (this is particularly important for running PhantomJS tests and FastBoot/server side rendering) and whether or not the user’s browser supports the [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) API.

To generate a new utility file:

```
$ ember g util can-use-dom
```

Again, we don’t want these files inside our users’ app trees, so we’ll delete the folders generated inside of **/app.**

#### Updating the Is In Viewport logic

The [method for calculating](https://github.com/dockyard/ember-in-viewport/blob/0.2.1/addon%2Futils%2Fis-in-viewport.js) whether or not a DOM element is in the viewport remains mostly unchanged, except with the addition of a new ‘tolerance’ argument.

```js
import Ember from 'ember';

const { merge } = Ember;

const defaultTolerance = {
  top    : 0,
  left   : 0,
  bottom : 0,
  right  : 0
};

export default function isInViewport(boundingClientRect={}, height=0, width=0, tolerance=defaultTolerance) {
  const { top, left, bottom, right } = boundingClientRect;
  const tolerances = merge(defaultTolerance, tolerance);
  let {
    top    : topTolerance,
    left   : leftTolerance,
    bottom : bottomTolerance,
    right  : rightTolerance
  } = tolerances;

  return (
    (top + topTolerance)       >= 0 &&
    (left + leftTolerance)     >= 0 &&
    (bottom - bottomTolerance) <= height &&
    (right - rightTolerance)   <= width
  );
}
```

With the addition of the tolerance option, addon users can relax how precise the check is. When set to 0, the Mixin only considers an element inside the viewport when it is completely visible inside of the viewport.

#### Setting up the Class variables

```js
const {
  get,
  set,
  setProperties,
  computed,
  run,
  on,
  $,
} = Ember;

const {
  scheduleOnce,
  debounce,
  bind,
  next
} = run;

const { not }     = computed;
const { forEach } = Ember.EnumerableUtils;

const listeners = [
  { context: window,   event: 'scroll.scrollable' },
  { context: window,   event: 'resize.resizable' },
  { context: document, event: 'touchmove.scrollable' }
];

let rAFIDS = {};
```

If you haven’t had the chance to use [ES2015 features](https://babeljs.io/docs/learn-es6/), now’s a good time to learn, since ember-cli-babel has been shipped with ember-cli by default for a while now. Here, we’re destructuring certain methods from Ember, as well as setting up an array of listeners we want to register. I also declare a mutable variable rAFIDS with **let** — I’ll be using this object to store the ID that’s returned by the requestAnimationFrame function so that we can cancel it later.

Something interesting to note is that these variables are actually shared by all instances of the Mixin. This means if we stored the rAF ID in that variable, it will be overwritten by other instances of the Components that are being watched by the Mixin. So instead, we’ll store each rAF ID as a key (the element ID for the Component) inside of an object. More on that later.

#### Initial state

```js
_setInitialState: on('init', function() {
  setProperties(this, {
    $viewportCachedEl   : undefined,
    viewportUseRAF      : canUseRAF(),
    viewportEntered     : false,
    viewportSpy         : false,
    viewportRefreshRate : 100,
    viewportTolerance   : {
      top    : 0,
      left   : 0,
      bottom : 0,
      right  : 0
    },
  });
}),
```

We’ll need to setup some initial values for our Mixin’s state. We do this when the Object the Mixin is mixed into is instantiated, by setting some properties on _init_. This is because [Mixins extend a constructor’s prototype](http://emberjs.com/api/classes/Ember.Mixin.html), so certain properties will be shared amongst objects that implement the Mixin — and in our case, we want these to be unique to each instance.

Here, we’re also going to make use of our utility function **canUseRAF** to let the Mixin know whether to use requestAnimationFrame or fallback to the Ember run loop.

#### Read only computed properties

For convenience, we’ll add a ‘**viewportExited**’ computed property (c.f. ‘viewportEntered’) that our addon users can use. Setting this up is simple:

```js
viewportExited: not('viewportEntered').readOnly(),
```

We’ll also make this computed property [read only](http://emberjs.com/api/classes/Ember.ComputedProperty.html#method_readOnly), because it doesn’t make sense for the addon user to set this manually.

#### Setting up the DOM element rendered by the component

When the DOM element is inserted into the DOM, we’ll need to setup a few things:

1.  The initial check on render to see if the element is immediately in view
2.  Setting up an observer if we’re not spying on the element
3.  Calling the recursive requestAnimationFrame method
4.  Setting up and removing event listeners if we are spying on the element

```js
_setupElement: on('didInsertElement', function() {
  if (!canUseDOM) { return; }

  const viewportUseRAF = get(this, 'viewportUseRAF');

  this._setInitialViewport(window);
  this._addObserverIfNotSpying();
  this._setViewportEntered(window);

  if (!viewportUseRAF) {
    forEach(listeners, (listener) => {
      const { context, event } = listener;
      this._bindListeners(context, event);
    });
  }
}),
```

#### Checking if the DOM element is immediately in view

After the element has been rendered into the DOM, we want to immediately check if it’s visible. This calls the **_setViewportEntered** method in the afterRender queue of the Ember run loop.

```js
_setInitialViewport(context=null) {
  Ember.assert('You must pass a valid context to _setInitialViewport', context);

  return scheduleOnce('afterRender', this, () => {
    this._setViewportEntered(context);
  });
},
```

#### Unbinding listeners after entering the viewport

It makes sense for certain use cases to actually stop watching the element after it has entered the viewport at least once. For example, in an image lazy loader, we only want to load the image once, after which it makes sense to clean up listeners to reduce the load on the app. We do that with the **viewportSpy** option.

Here, we programatically add an [observer](http://emberjs.com/api/classes/Ember.Object.html#method_addObserver) on the **viewportEntered** prop if **viewportSpy** has been set to false by our addon user. The observer itself doesn’t do much — it unbinds listeners and then removes itself.

```js
_addObserverIfNotSpying() {
  const viewportSpy = get(this, 'viewportSpy');

  if (!viewportSpy) {
    this.addObserver('viewportEntered', this, this._viewportDidEnter);
  }
},

_viewportDidEnter() {
  const viewportEntered = get(this, 'viewportEntered');
  const viewportSpy     = get(this, 'viewportSpy');

  if (!viewportSpy && viewportEntered) {
    this._unbindListeners();
    this.removeObserver('viewportEntered', this, this._viewportDidEnter);
  }
},
```

#### Setting up event listeners

Let’s look at binding our event listeners before we take a look at **_setViewportEntered**, the main method for the mixin. We’ll be using the array of listeners we declared earlier at the top of the file, and binding the event to the appropriate context (_window_ or _document_), like so:

```js
_bindListeners(context=null, event=null) {
  Ember.assert('You must pass a valid context to _bindListeners', context);
  Ember.assert('You must pass a valid event to _bindListeners', event);

  const elementId = get(this, 'elementId');

  Ember.warn('No elementId was found on this Object, `viewportSpy` will' +
    'not work as expected', elementId);

  $(context).on(`${event}#${elementId}`, () => {
    this._scrollHandler(context);
  });
},
```

Note that we can actually pass the Component’s [elementId](http://emberjs.com/api/classes/Ember.View.html#property_elementId) (the id attribute that is rendered into the DOM) to the event, which will allow us to only unbind the listener for that particular element. If we didn’t do this, all listeners would have been unbound when the first DOM element enters the viewport, which isn’t what we’d expect.

#### Handling the event

Now, we can handle the event by debouncing the main method with the **viewportRefreshRate** set by the addon user. I talk about this in my previous post, so please have a read if you’re not sure how debouncing works with the Ember run loop.

```js
_scrollHandler(context=null) {
  Ember.assert('You must pass a valid context to _scrollHandler', context);

  const viewportRefreshRate = get(this, 'viewportRefreshRate');

  debounce(this, function() {
    this._setViewportEntered(context);
  }, viewportRefreshRate);
},
```

#### Unbinding listeners

When we eventually destroy the Component, we want to make sure we also cleanup after ourselves. We’ll have to remove both event listeners and the recursive requestAnimationFrame call:

```js
_unbindListeners() {
  const elementId      = get(this, 'elementId');
  const viewportUseRAF = get(this, 'viewportUseRAF');

  Ember.warn('No elementId was found on this Object, `viewportSpy` will' +
    'not work as expected', elementId);

  if (viewportUseRAF) {
    next(this, () => {
      window.cancelAnimationFrame(rAFIDS[elementId]);
      rAFIDS[elementId] = null;
    });
  }

  forEach(listeners, (listener) => {
    const { context, event } = listener;
    $(context).off(`${event}#${elementId}`);
  });
}
```

```js
_teardown: on('willDestroyElement', function() {
  this._unbindListeners();
}),
```

If you recall, the [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) function returns an ID that uniquely identifies the entry in the callback list. We can pass this on to [cancelAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame) in order to cancel the infinitely recursive call to the main method. Because we register the Component’s DOM elementId as a key in the rAFIDS object, we can remove the specific rAF call for that single Component. I’ve wrapped the cAF call in an Ember.run.next to avoid a race condition preventing proper cancellation of the rAF recursion that happens occasionally.

#### Updating the viewportEntered property

Let’s take a look at the main method responsible for setting the ‘**viewportEntered**’ property. This method does two main things:

1.  Set viewportEntered to true or false
2.  Fire off the next requestAnimationFrame step

```js
_setViewportEntered(context=null) {
  Ember.assert('You must pass a valid context to _setViewportEntered', context);

  const $viewportCachedEl = get(this, '$viewportCachedEl');
  const viewportUseRAF    = get(this, 'viewportUseRAF');
  const elementId         = get(this, 'elementId');
  const tolerance         = get(this, 'viewportTolerance');
  const height            = $(context) ? $(context).height() : 0;
  const width             = $(context) ? $(context).width()  : 0;

  let boundingClientRect;

  if ($viewportCachedEl) {
    boundingClientRect = $viewportCachedEl[0].getBoundingClientRect();
  } else {
    boundingClientRect = set(this, '$viewportCachedEl', this.$())[0].getBoundingClientRect();
  }

  const viewportEntered = isInViewport(boundingClientRect, height, width, tolerance);

  set(this, 'viewportEntered', viewportEntered);

  if ($viewportCachedEl && viewportUseRAF) {
    rAFIDS[elementId] = window.requestAnimationFrame(
      bind(this, this._setViewportEntered, context)
    );
  }
},
```

As a simple optimization, we can cache the selected DOM element inside the Object as **$viewportCachedEl** so we don’t have call the expensive DOM node selector method every time. Then, we pass the Component’s element properties to the utility we defined earlier, and set the **viewportEntered** property to true or false.

If requestAnimationFrame is enabled, we call the method again inside of the rAF method, after [binding it to the correct context](http://emberjs.com/api/classes/Ember.run.html#method_bind). Like [Function.prototype.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind), this creates a new function, that when called, has its _this_ keyword set to the correct value (along with any arguments). With that first call after the element is inserted into the DOM, this fires off an infinitely recursive loop that will only end when we cancel it.

Hence, we don’t have to setup event listeners when rAF is enabled. And that’s it for the Mixin!

#### Recap

Basically, the Mixin does one of two things when implemented by a Component or View:

1.  If rAF is enabled, it sets off an infinitely recursive call to the main method at close to 60FPS (or whatever the user’s monitor refresh rate is), without the use of event listeners. This is then canceled when the Component is destroyed, or if the **viewportSpy** option has been set to false and the Component has already entered the viewport once.
2.  If not, the Mixin sets up event listeners on the Component’s unique DOM element, and fires the main method whenever the user triggers one of three events (scroll, resize, and touch). Again, the event listeners are removed on destroy and if the **viewportSpy** option is false.

### Unleashing your addon on the Ember community

Now that we’re done with the main addon logic, and writing tests (a topic for another post!), we’re ready to release our addon to the world! I typically use [git flow](http://danielkummer.github.io/git-flow-cheatsheet/) to manage my repos, and it also helps with the release process using **git flow release.**

At this point, I make sure my readme is written comprehensively to detail how an addon user can use the addon, as well as bump version numbers according to [SemVer](http://semver.org/). [GitHub](https://github.com/dockyard/ember-in-viewport/releases) also has a nice way to keep track of your addon’s different named releases, which I tend to use quite often as a way to keep addon users updated about what’s changed in each version.

Once your changes have been merged back into _master_, you can [publish your addon](https://gist.github.com/coolaj86/1318304) up onto npm:

```
$ npm publish
```

Congrats! You’ve written your first addon☺Now you can obsess over your addon’s score at [Ember Observer](http://emberobserver.com/addons/ember-in-viewport).

### Thanks for reading!

This has been a pretty long post, I hope you’ve learned something. If you’d like to ask any questions, please feel free to send me a [tweet](http://www.twitter.com/potetotes).

Some of you might probably know that I’ve recently joined [DockYard](http://www.dockyard.com). If you’re looking for Ember experts to augment your staff, work on a greenfield project or an existing one, please get in touch!

Until next time,

Lauren