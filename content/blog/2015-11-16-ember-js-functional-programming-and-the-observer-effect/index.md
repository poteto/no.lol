---
title: Ember.js — Functional Programming and the Observer Effect
description: >-
  My awesome colleagues have written about patterns and best practices we use at
  DockYard, covering everything from the Ember Object model…
date: '2015-11-16T16:06:28.547Z'
categories:
  - engineering
keywords:
  - functional programming
  - emberjs
  - observers
  - data down actions up
  - one way data flow
cover: ./adam-sodek-1403521-unsplash.jpg
coverAuthor: Adam Šodek
coverOriginalUrl: https://unsplash.com/photos/WF3shbZCOi4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

My awesome colleagues have written about patterns and [best practices](https://dockyard.com/blog/categories/best-practices) we use at [DockYard](https://dockyard.com/), covering everything from the [Ember](https://dockyard.com/blog/2015/10/19/2015-dont-dont-override-init) [Object](https://dockyard.com/blog/2015/09/18/ember-best-practices-avoid-leaking-state-into-factories) [model](https://dockyard.com/blog/2015/11/09/best-practices-extend-or-mixin) and [better acceptance tests](https://dockyard.com/blog/2015/09/25/ember-best-practices-acceptance-tests), to [native inputs](https://dockyard.com/blog/2015/10/05/ember-best-practices-using-native-input-elements) and [closure actions](https://dockyard.com/blog/2015/10/29/ember-best-practice-stop-bubbling-and-use-closure-actions).

Today, I’d like to write about something that is close to all our hearts — observers; and a topic I think about a lot — functional programming (FP). I’d like to take you through a tour of refactoring away from observers in your application and freeing yourself from the shackles of the “observer effect”. Let’s get started!

#### Side effects wreck projects

In science, the term [“observer effect”](https://en.wikipedia.org/wiki/Observer_effect_%28physics%29) refers to the changes that are effected on some phenomenon simply by observing it. This is often because of instruments that alter the state of what they observe in some manner.

Sound familiar? Funnily enough, the same effect can probably be found in your Ember application if you use observers. For reasons we’ll cover in this post, [observers are an anti-pattern](https://www.youtube.com/watch?v=7PUX27RKCq0) and should be avoided, as it makes it difficult to reason about and debug your application.

#### Difficult to reason about? ¯\\\_(ツ)\_/¯

“Difficult to reason about” is a term that is commonly thrown around — but what exactly does it mean? Informally, it means being able to tell what a program will do just by looking at its code. That is, running the program _should not_ lead to unexpected surprises. We strive to make our applications easy to reason about because it leads to more maintainable code that is easier to debug and test.

> That is, running the program should not lead to unexpected surprises.

Since JavaScript isn’t a purely functional language, it does not enforce immutability by default. Its mutable data structures can sometimes lead to surprising and unintuitive results (making some JavaScript applications difficult to reason about), so various attempts have been made to introduce immutability to the language.

For example, [ClojureScript](https://github.com/clojure/clojurescript) and [Elm](http://elm-lang.org/) are functional languages that compile down to JavaScript. [Mori](https://swannodette.github.io/mori/) and [immutable.js](https://facebook.github.io/immutable-js/) are also excellent libraries that provide immutable data structures you can use in vanilla JavaScript. These tools bring in bits of FP philosophy into JavaScript applications, and have become increasingly popular in front-end development thanks to the introduction of React and the Flux pattern.

#### The “rise” of Functional Programming in front end development

FP is not a new programming paradigm — it’s been around for a while since the introduction of LISP in the late 50s. However, it’s only in recent times that we’ve seen FP languages become more mainstream, most notably with [Elixir](http://elixir-lang.org/), which combines the elegance and productivity of Ruby with the performance of the Erlang VM.

> The combination of Ember’s conventions (over configuration), Glimmer, and DDAU means that just like Elixir, Ember developers too can find the sweet spot of having both productivity and performance.

Why is [FP useful](https://www.youtube.com/watch?v=aeh5Fmh_tmw) for building front end applications? [React](https://facebook.github.io/react/) taught us that it is surprisingly cheap to diff the changes on the DOM, and to perform a series of updates to sync the DOM with its virtual representation. In other words, React made its `render` function a pure one (one of the core principles of FP) — you always get the same output (HTML) for a given input (state).

With the [Flux pattern](https://facebook.github.io/flux/docs/overview.html#content), that is taken a step further and the entire application is treated as a pure function — for a given serialized state, we can predictably render the same output each time. This has allowed Flux implementations like [Redux](http://redux.js.org/) the ability to have a [“time traveling debugger”](https://www.youtube.com/watch?v=xsSnOQynTHs), which is only possible when you model your architecture with a FP paradigm.

#### Object.observe is not the answer

These philosophies have had resounding success, so much so that `Object.observe` was [withdrawn](https://mail.mozilla.org/pipermail/es-discuss/2015-November/044684.html) from TC39. All this means is that _observing property changes_ are no longer the best way of building web applications, and Ember in general is moving in that direction with it’s “Data Down, Actions Up” (DDAU) philosophy.

In 1.13.x, [Glimmer](https://www.youtube.com/watch?v=o12-90Dm-Qs) landed — it is Ember’s new rendering engine based on the same pure render semantics, and gives us fast, idempotent re-renders. The combination of Ember’s conventions (over configuration), Glimmer, and DDAU means that just like Elixir, Ember developers too can find the sweet spot of having both productivity and performance.

#### Data Down, Actions Up

Although you could bring in immutable data structures into your application (a topic for a future post!), that alone wouldn’t be enough. We should also strive to make our business logic as pure (free of side effects) as possible. Of course, it wouldn’t be possible to make _everything_ pure, as web applications inherently involve mutation (i.e. updating a user record), but it is beneficial to explicitly know and isolate the functions in your app that do have side effects.

In Ember 2.x, the best way forward is “Data Down, Actions Up”. This means:

1.  One way bindings by default
2.  Explicit closure actions over side effects
3.  Components should not mutate data directly

My colleagues have already written about [one way bindings](https://dockyard.com/blog/2015/10/05/ember-best-practices-using-native-input-elements), [closure actions](https://dockyard.com/blog/2015/10/29/ember-best-practice-stop-bubbling-and-use-closure-actions) and [not mutating data in Components](https://dockyard.com/blog/2015/10/14/best-practices-data-down-actions-up), so I will leave you to do further reading in your own time.

Instead, let’s continue the discussion above on how best to refactor away observers in your application, so that we can eliminate or reduce side effects.

#### Refactoring away observers

Let’s say we have an observer in our application that needs to check a user’s birthday ([demo](http://emberjs.jsbin.com/citiwi/edit?js,output)):

```js
// birth-day/component.js
import Ember from 'ember';
import moment from 'moment';

const {
  Component,
  computed,
  get,
  set
} = Ember;

export default Component.extend({
  isBirthday: false,
  birthDate: null,

  age: computed('birthDate', {
    get() {
      return moment().diff(moment(get(this, 'birthDate')), 'years');
    }
  }),

  checkBirthday() {
    let today = moment();
    let birthDate = moment(get(this, 'birthDate'));
    let isBirthday = (today.month() === birthDate.month()) &&
      (today.day() === birthDate.day());

    set(this, 'isBirthday', isBirthday);
  },

  init() {
    this._super(...arguments);
    this.addObserver('birthDate', this, this.checkBirthday);
  },

  willDestroy() {
    this.removeObserver('birthDate', this, this.checkBirthday);
  }
});
```

In the above example, we’re using an observer to set the `isBirthday` flag if it is the user’s birthday.

```handlebars
{{!birth-day/template.hbs}}
{{input value=birthDate placeholder="Your birthday"}}

<p>
  You are currently {{age}} years old.
  {{#if isBirthday}}
    Happy birthday!
  {{/if}}
</p>
```

When you find yourself setting some value (be in on the component, record or somewhere else), you can easily refactor away the observer.

#### Removing an observer that sets a value on the component

In this scenario, you can simply replace the observer with a CP.

```js
// birth-day/component.js
import Ember from 'ember';
import moment from 'moment';

const {
  Component,
  computed,
  get
} = Ember;

export default Component.extend({
  // ...
  isBirthday: computed('birthDate', {
    get() {
      let today = moment();
      let birthDate = moment(get(this, 'birthDate'));

      return (today.month() === birthDate.month()) &&
        (today.day() === birthDate.day());
    }
  })
});
```

#### Using component lifecycle hooks

We could also move the `input` logic out of this component, and use the [new component lifecycle hooks](https://github.com/emberjs/ember.js/pull/11127) to set the `isBirthday` flag on the component.

```js
// birth-day/component.js
import Ember from 'ember';
import moment from 'moment';

const {
  Component,
  computed,
  get
} = Ember;

export default Component.extend({
  birthDate: null,
  today: null,
  isBirthday: false,

  didReceiveAttrs() {
    let isBirthday = this.checkBirthday(
      moment(get(this, 'today')),
      moment(get(this, 'birthDate'))
    );

    set(this, 'isBirthday', isBirthday);
  },

  checkBirthday(today, birthDate)
    return (today.month() === birthDate.month()) &&
      (today.day() === birthDate.day());
  })
});
```

```handlebars
{{!index/template.hbs}}
{{one-way-input
    value=user.birthDate
    update=(action (mut user.birthDate))
    placeholder="Your birthday"
}}
{{happy-birthday today=today birthDate=user.birthDate}}
```

```handlebars
{{!birth-day/template.hbs}}
<p>
  You are currently {{age}} years old.
  {{#if isBirthday}}
    Happy birthday!
  {{/if}}
</p>
```

Both approaches let you remove the observer, but the `didReceiveAttrs` example is slightly more explicit, and transforms the component into a pure one. By limiting the scope of the component, we can easily isolate the origins of data mutations.

#### Removing an observer that sets a value outside the component

In this situation, let’s say we want to update the user record’s `isBirthday` flag instead. We can remove the observer by using one way input actions:

By bringing in the [ember-one-way-input](https://github.com/dockyard/ember-one-way-input) addon, we can eliminate the coupling of the component to the user record:

```js
// birth-day/component.js
import Ember from 'ember';
import moment from 'moment';

const {
  Component,
  computed,
  get
} = Ember;

export default Component.extend({
  // ...
  actions: {
    checkBirthday(birthDate) {
      birthDate = moment(birthDate);
      let today = moment();
      let isBirthday = (today.month() === birthDate.month()) &&
        (today.day() === birthDate.day());

      this.attrs.setIsBirthday(isBirthday);
      this.attrs.setBirthDate(birthDate.toDate());
    }
  }
});
```

```handlebars
{{!birth-day/template.hbs}}
{{one-way-input
    value=birthDate
    update=(action "checkBirthday")
    placeholder="Your birthday"
}}

<p>
  You are currently {{age}} years old.
  {{#if isBirthday}}
    Happy birthday!
  {{/if}}
</p>
```

And then in the Controller:

```js
// index/controller.js
import Ember from 'ember';

const { Controller, set } = Ember;

export default Controller.extend({
  actions: {
    setIsBirthday(isBirthday) {
      set(this, 'user.isBirthday', isBirthday);
      user.save();
    },

    setBirthDate(birthDate) {
      set(this, 'user.birthDate', birthDate);
      user.save();
    }
  }
});
```

```handlebars
{{!index/template.hbs}}
{{happy-birthday
    setIsBirthday=(action "setIsBirthday")
    setBirthdate=(action "setBirthdate")
    isBirthday=user.isBirthday
    birthDate=user.birthDate
}}
```

In the above example, we moved the logic for setting the `isBirthday` flag out of the `happy-birthday` component into its Controller. The component no longer needs to directly mutate state (an anti-pattern would be to set `user.isBirthday` directly in the component), and can instead send a closure action up, leaving the Controller to decide how to handle the actions. Data now flows down to the Component, and any changes to the `input` sends actions back up.

#### Who should use observers?

If observers are so terrible, why are they in Ember? According to Stefan Penner, observers are used by the framework itself as a low level primitive, so that _you don’t need to use them yourself_. So unless you’re working on a PR for Ember.js, stay away from observers.

#### Thanks for reading!

I hope you’ve enjoyed this post! It’s been a while since my last one so I do apologize. I hope to start writing shorter articles again more frequently — if you have suggestions for topics, please feel free to DM me on Slack or tweet me!

Until next time,

Lauren