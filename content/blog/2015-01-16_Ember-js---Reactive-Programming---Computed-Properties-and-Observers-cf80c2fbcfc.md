---
title: Ember.js & Reactive Programming — Computed Properties and Observers
description: >-
  Reactive Programming (or RP for short) is a programming paradigm that gets
  thrown around a lot, but its clear that there is much confusion…
date: '2015-01-16T22:08:07.852Z'
categories: ''
keywords: ''
slug: >-
  /@sugarpirate/ember-js-reactive-programming-computed-properties-and-observers-cf80c2fbcfc
---



Reactive Programming (or RP for short) is a programming paradigm that gets thrown around a lot, but its clear that there is much [confusion](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming?rq=1) about what it actually is. RP is a general programming paradigm, but is particularly suited to creating [reactive user interfaces](http://en.wikipedia.org/wiki/Reactive_user_interface).

The simplest analogy to understand RP is that of a ‘spreadsheet’ — if you’ve ever dabbled with Excel/Google Spreadsheet formulas, congratulations, you’ve done some reactive programming already!

Ever since the introduction of AJAX, users have grown used to, and expect reactive user interfaces in the web applications that they use. Through the use of the RP paradigm, we can build beautiful user experiences and reactive interfaces in Ember.js — in particular, we’ll look at how we can use computed properties and observers to do just that.

### What is Reactive Programming?

Take a look at this screenshot from Google Sheets. It’s the most basic spreadsheet possible: we have two user input cells, `A1` and `B1` (the letter representing the column, and the number representing the row). Each cell contains a static value (in this case, they’re both 1), that the user has entered.

![](https://cdn-images-1.medium.com/max/800/1*rfNPLxDtGfUySMMo86SygA.png)

A simple formula in Google Sheets

In cell `C1`, we have a dynamic value `=A1+B1`, which is self-explanatory. The value of `C1` is simply the addition of cells `A1` + `B1`, which is `2` in this case. Changing values in either `A1` or `B1` immediately updates the value of `C1`, without us needing to imperatively update its value every time one of its dependent cells change.

> _Reactive programming is about the flow of data and declaratively maintaining the relationships between that data._

If you did this in vanilla JavaScript or jQuery, you’d have to explicitly listen to ‘change’ events on the inputs, and then manually update the value of `C1`. Not fun! And this is only a simple example — if you were building a complex web app without a more declarative approach, your code quickly becomes difficult to maintain and reason about, and worse, hard to test.

This imperative struggle has given rise to JavaScript frameworks such as Ember, React and Angular, which makes web applications easier to build, maintain and test.

#### The Observer Pattern

JavaScript is an object oriented language, and features inheritance of properties and methods. Unlike Ruby or Python, which have ‘classical’ inheritance, JavaScript has ‘[prototypal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)’ inheritance.

[Ember.Object](http://emberjs.com/api/classes/Ember.Object.html) (which is [Ember.CoreObject](http://emberjs.com/api/classes/Ember.CoreObject.html) with the [Ember.Observable](http://emberjs.com/api/classes/Ember.Observable.html) mixin applied) implements a more classical JavaScript object, and together with the observer pattern (computed properties and observers), allows data to be updated whenever a change is made.

In that sense, the observer pattern provides a mechanism for which RP can happen in Ember.js. Thus, any class that has the Ember.Observable mixin is observable, and you can apply RP techniques to it.

### Functional Reactive Programming

Functional Reactive Programming (FRP) is RP’s functional cousin. In functional programming, data should be **immutable,** and programs **stateless.** JavaScript isn’t a pure functional language (see [Erlang](http://www.erlang.org/), [Haskell](https://www.haskell.org/haskellwiki/Haskell), or [Clojure](http://clojure.org/) for examples), but we can certainly write our programs to be more functional.

In FRP, user interactions are expressed as streams (also called signals), or value over time. The simplest example is one you’re probably already very familiar with — the mouse.

![](https://cdn-images-1.medium.com/max/800/1*GcZonsVzlpAl1EaIgUvzow.png)

Image from ‘[Elm: Concurrent FRP for Functional GUIs](http://elm-lang.org/papers/concurrent-frp.pdf)’ by Evan Czaplicki

If you imagine your table or mousepad to be a cartesian plane, then the movement of your mouse can be expressed in (x, y) coordinates as `Mouse.position`. Moving your mouse immediately updates its coordinates, and there is an clear relationship between the physical position of the mouse and its digital representation on your screen.

To do this in JavaScript would require significantly more code compared to an FRP language like [Elm](http://elm-lang.org/) (which does it in [far fewer lines](http://elm-lang.org/edit/examples/Reactive/Position.elm)): you’d have to manually extract the mouse position on every ‘mousemove’ event, and then describe exactly how to update the displayed value.

Every mouse movement is thus a value over time, (imagine an array of events with data) and using functional programming techniques like [Array.prototype#map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), #[filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [#reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce), and [#concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat) (all of which return new arrays or values) we can transform our data in order to make our interfaces reactive.

Libraries like [bacon.js](https://github.com/baconjs/bacon.js) make FRP possible in JavaScript. Ember doesn’t ship with as many of bacon.js’s features, but we can make use of a few key tools to make our goal of building reactive user interfaces easier.

### Computed properties

![](https://cdn-images-1.medium.com/max/1000/1*wXME4Jg0lFQBVvJTpLIogw.png)

The current Ember guides on computed properties

[Computed properties](http://emberjs.com/guides/object-model/computed-properties/) are built on top of the observer pattern, and let us take one or more properties and reactively _transform_ or _manipulate_ their data to return some new value. The computed property updates whenever one of their dependent values change, ensuring that relationships are always kept in sync.

You’ve probably seen this example a number of times:

```js
import Ember from 'ember';

var computed = Ember.computed;
var get      = Ember.get;

export default Ember.Object.extend({
  fullName: computed('firstName', 'lastName', function() {
    return get(this, 'firstName') + ' ' + get(this, 'lastName');
  })
});
```

This is great! We can now use `fullName` like we would any other property on the object that it sits in.

> [Computed properties are] … super handy for taking one or more normal properties and transforming or manipulating their data to create a new value.

With computed properties, we can also avoid needless computation through [caching](http://emberjs.com/api/classes/Ember.ComputedProperty.html#method_cacheable), which prevents re-computation even though the input has not changed.

### Computed property macros

As our application grows larger and more complex however, we might find that we have repetition in our computed properties.

In order to make our code DRY and testable, it’s a good idea to think about refactoring some of our shared computed properties into computed property macros. A computed property macro can really be thought of as a function that returns the definition of a computed property (you can return an observer as well). Ember ships with [a few handy ones](http://emberjs.com/api/#method_computed) out of the box.

Let’s say we decide that instead of calling the property `fullName` on our object, we want to use `name`, for whatever reason. A naïve approach might be to do something like this:

#### An anti-pattern

```js
import Ember from 'ember';

var computed = Ember.computed;
var get      = Ember.get;

export default Ember.Object.extend({
  fullName: computed('firstName', 'lastName', function() {
    return get(this, 'firstName') + ' ' + get(this, 'lastName');
  }),

  name: computed('fullName', function() {
    return get(this, 'fullName');
  })
});
```

This might seem superfluous, and it is. Let’s use one of the computed property macros ([computed.alias](http://emberjs.com/api/#method_computed_alias)) that Ember ships with instead.

```js
import Ember from 'ember';

var computed = Ember.computed;
var get      = Ember.get;

export default Ember.Object.extend({
  fullName: computed('firstName', 'lastName', function() {
    return get(this, 'firstName') + ' ' + get(this, 'lastName');
  }),

  name: computed.alias('fullName')
});
```

That’s better! Computed property macros let us re-use common functionality and share them throughout our app, and avoids repeating the logic every time we need it. Because the above use case is so common, the fine folk in charge of Ember.js have included it as a default computed property macro.

### Observers

Unlike computed properties, observers don’t return new values. Instead, they only observe changes to properties, and are synchronously invoked whenever the dependent properties change.

For example, let’s say we have an Ember.Object representing a Child.

```js
import Ember         from 'ember';
import notifyParents from 'notify-parents';

var observer = Ember.observer;
var computed = Ember.computed;
var not      = computed.not;
var get      = Ember.get;

export default Ember.Object.extend({
  firstName: 'Lauren',
  lastName:  'Tan',
  isAtHome:  false,

  isOutside: not('isAtHome'),

  fullName: computed('firstName', 'lastName', function() {
    return get(this, 'firstName') + ' ' + get(this, 'lastName');
  }),

  notifyParentsWhenAtHome: observer('isAtHome', function() {
    var userIsAtHome = get(this, 'isAtHome');
    if (userIsAtHome) {
      notifyParents(get(this, 'fullName'), new Date());
    }
  })
});
```

The Child has properties for her first and last name, and whether or not she is at home. Note the use of [Ember.computed.not](http://emberjs.com/api/classes/Ember.html#method_computed_not) in the `isOutside` property, which simply means that whether or not the child is at home is inversely related to whether or not she is outside. With computed properties, this relationship is always maintained, and we can be sure that our interface also updates accordingly when the dependent value changes.

The `notifyParentsWhenAtHome` observer then observes the property `isAtHome`, and if that is true, we notify the child’s parents the child’s full name and the exact time she returned home.

### A Functional Reactive Example with Ember Data and Promises

As a simple example, let’s imagine we’re building an app that has 3 models: Teams, Players and Coaches. A Team has many players, and one Coach. I assume some familiarity with [Promises](http://emberjs.com/api/classes/RSVP.Promise.html) in this example.

#### Players and Coaches

These are very simple models and are quite self-explanatory.

```js
import DS from 'ember-data;'

export default DS.Model.extend({
  name:      DS.attr('string'),
  score:     DS.attr('number'),
  team:      DS.belongsTo('team', { async: true }),
  coaches:   DS.hasMany('coach', { async: true })
});
```

```js
import DS from 'ember-data;'

export default DS.Model.extend({
  name:      DS.attr('string'),
  score:     DS.attr('number'),
  team:      DS.belongsTo('team', { async: true }),
  players:   DS.hasMany('player', { async: true })
});
```

#### Teams

```js
import Ember from 'ember';
import DS    from 'ember-data';

var computed = Ember.computed;
var get      = Ember.get;
var RSVP     = Ember.RSVP;

export default DS.Model.extend({
  name:    DS.attr('string'),
  players: DS.hasMany('player', { async: true }),
  coach:   DS.belongsTo('coach', { async: true }),

  coachScore: computed.alias('coach.score'),

  playersScore: computed('players.@each.score', function() {
    var promise = get(this, 'players')
    .then(function(players) {
      return RSVP.all(players.mapBy('score'))
    })
    .then(function(scores) {
      return scores.reduce(function(previous, current) {
        return previous + current;
      }, []);
    });
    return DS.PromiseObject.create({ promise: promise });
  }),

  score: computed('playersScore', 'coachScore', function() {
    var playersScore = get(this, 'playersScore');
    var coachScore   = get(this, 'coachScore');

    return playersScore * coachScore;
  })
});
```

Let’s say that the Team’s score is made up of the sum of all its Players’ scores, multiplied by the Coach’s score. We first create two computed properties, `coachScore` and `playersScore`, which return a single score for the Coach and Player respectively. Because a Team only has one Coach, it’s easy to get the Coach’s Score using a computed alias.

As the Team has many Players, it’s a little bit trickier to calculate the sum of their scores. Unfortunately, we can’t do:

```js
computed.alias('players.score');
```

Because the `players` property returns an array of Player models, the array itself does not have the property ‘score’. We actually need to map over each Player’s score, and then add them together. Using functional programming, we can make use of [Ember.Array#mapBy](http://emberjs.com/api/classes/Ember.Array.html#method_mapBy) to first return a new array of all Player scores.

We then [reduce](http://emberjs.com/api/classes/Ember.Array.html#method_reduce) the array down to a single value by adding them all together. To get the Team’s score (`score`), we just multiply the Coach’s score with the Players’ score.

After defining these 3 computed properties, we’ll have three functional and reactive properties that can be then used in our template. Whenever a player’s or coach’s score changes, the team score updates immediately in the user interface, without us having to imperatively update DOM elements and the like. Awesome!

#### A Note on Dependent Computed Properties

Because you can have computed properties observe other computed properties, it’s easy to build overly complex data relationships. It’s also possible to create circular dependencies (i.e. infinite loops), so be careful about how deep down the rabbit hole you go.

### Building Your Own Computed Property Macros

In another post, I wrote about [writing your own computed property macro to do simple text search](https://medium.com/the-ember-way/ember-simple-text-search-computed-property-macro-1b7ca6a25ad2). I won’t go into the details here, but have a read if you’d like to see how you can write your own macros. If you notice your computed properties being repeated in multiple areas in your app, refactoring them into re-usable macros are a great way to improve the maintainability and testability of your app.

I also recommend looking at [ember-cpm](https://github.com/cibernox/ember-cpm) by [@miguelcamba](https://twitter.com/miguelcamba), which is a collection of more computed macros, available both as an ember-cli addon and for globals based Ember apps.

### Why You Should Care

If you’ve ever built an app with complex user interactions without a framework like Ember before, you’ll know how difficult it is to effectively manage the flow of data through the app.

As front end developers, we strive to build delightful and reactive experiences our users. Using modern tools like Ember.js and functional reactive techniques help us write more declaratively, freeing us from the shackles of low level DOM manipulation and jQuery spaghetti.

#### Recommended Reading

*   [Reactive modeling with Ember](http://frontside.io/blog/2014/09/21/reactive-modeling-with-ember.html) — Charles Lowell
*   [Elm: Concurrent FRP for Functional GUIs](http://elm-lang.org/papers/concurrent-frp.pdf) — Evan Czaplicki
*   [Functional Reactive Programming with the Power of Node.js Streams](http://blog.risingstack.com/functional-reactive-programming-with-the-power-of-nodejs-streams/) — Péter Márton
*   [The introduction to Reactive Programming you’ve been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) — @andrestaltz
*   [Principles of Reactive Programming](https://www.coursera.org/course/reactive)—Coursera

As always, I hope you’ve enjoyed reading! [Tweet me](https://twitter.com/sugarpirate_) if you have any questions.

This post started its life as a draft from a few months ago, but finished from inside the [@DockYard](https://twitter.com/DockYard) offices. Thanks for letting me hang out with you for the week!

![](https://cdn-images-1.medium.com/max/2560/1*ospBumDEncb0ouA7SDrknA.jpeg)

Rare winter sunshine in the DockYard offices