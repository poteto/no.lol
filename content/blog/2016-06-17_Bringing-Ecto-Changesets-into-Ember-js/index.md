---
title: Bringing Ecto Changesets into Ember.js
description: >-
  The past month or so, I’ve been working on an Elixir and Phoenix API for a
  client. I am blown away by how nice it is working with Elixir…
date: '2016-06-17T23:47:26.143Z'
categories:
  - engineering
keywords:
  - elixir
  - ecto
  - emberjs
  - changesets
  - ember-changeset
  - ember-changeset-validations
  - functional validations
  - virtual properties
  - method missing
slug: /@sugarpirate/bringing-ecto-changesets-into-ember-js-8e665ec70ab6
cover: ./steven-su-1405584-unsplash.jpg
coverAuthor: Steven Su
coverOriginalUrl: https://unsplash.com/photos/7Oc33M8vs0s?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

The past month or so, I’ve been working on an [Elixir](http://elixir-lang.org/) and [Phoenix](http://www.phoenixframework.org/) API for a client. I am blown away by how nice it is working with Elixir and functional programming (FP) concepts. FP feels more intuitive and less prone to “shoot yourself in the foot” scenarios compared to OOP. In fact, I try to use functional approaches wherever possible in JavaScript as well.

That isn’t to say that one is better than the other, but in my experience less unexpected behavior occurs in FP. It turns out whole classes of bugs disappear when embracing immutability and pure functions.

#### Ecto Changesets to the Rescue

In Elixir, we use [Ecto](https://github.com/elixir-ecto/ecto), a DSL for writing queries and interacting with databases. One of the core concepts in Ecto is the [changeset](https://hexdocs.pm/ecto/Ecto.Changeset.html) — an atomic collection of changes. Changes are validated and checked against database constraints (such as uniqueness) before casting. This ensures that we catch invalid data in the app layer before insertion into the database. Ecto is often confused with [Rails](http://rubyonrails.org/)’ [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html), but it isn’t an ORM, and shouldn’t be used like one.

The idea for bringing changesets into Ember occurred to me while I was working on a new client app. An edit page featured 3 forms, all bound to the same model. Each hidden form had separate “toggle”, “save” and “reset” actions. Using [ember-form-for](https://github.com/martndemus/ember-form-for) and [ember-cp-validations](https://github.com/offirgolan/ember-cp-validations), this turned out to be harder than I thought. Editing one form would immediately update the model with 2-way bindings. This was a poor user experience, since you might edit more than 1 form at a time, but want to separate saves and resets.

#### Changesets in Ember

In my mind, I could see a solution using changesets. Each form would have a separate changeset, so changes (and validations) would be independent. It turns out that this approach works really well, and I’m happy to announce that you can [install it today as an addon](https://github.com/poteto/ember-changeset) with:

```
ember install ember-changeset
ember install ember-changeset-validations
```

I wrote the addon with compatibility in mind, so it’s easy to wire up with your favorite validation library. The simplest way to incorporate validations is to use [ember-changeset-validations](https://github.com/poteto/ember-changeset-validations/), a companion addon. It has a simple mental model, and there are no observers or CPs involved — just pure, plain JavaScript functions.

Let’s take a look at how [ember-changeset](https://github.com/poteto/ember-changeset) is implemented, and we’ll also demonstrate how they align with Ember’s Data Down Actions Up (DDAU) philosophy.

#### Virtual Properties with unknownProperty and setUnknownProperty

The core concept behind ember-changeset is the definition of `unknownProperty` and `setUnknownProperty`. These methods are invoked (if present) in `Ember.get` or `Ember.set` whenever an Ember Object does not define a property. Ruby developers would be familiar with this behavior via the `method_missing` method. A colleague I used to work with wrote an excellent [blog post](https://emberway.io/metaprogramming-in-emberjs-627921395299#.8m07o1i8u) on this topic, please check it out if you’re interested in finding out more!

For example:

```js
let Person = EmberObject.extend({
  firstName: null,
  lastName: null,

  unknownProperty(key) {
    console.log(`Could not get ${key}!`);
  },

  setUnknownProperty(key, value) {
    console.log(`Could not set `${key} with ${value}!`);
  }
});
```

When a `Person` is created, trying to `get` or `set` a property other than `firstName` and `lastName` will invoke the `unknownProperty` and `setUnknownProperty` methods respectively:

```js
let jim = Person.create({ firstName: 'Jim', lastName: 'Bob' });
jim.get('firstName'); // "Jim"
jim.get('fullName'); // "Could not get fullName!"
jim.set('age', 25); // "Could not set age with 25!"
```

These two methods allow us to _proxy_ our changeset to the actual model, meaning we can hold back changes but still forward `get`s to the model.

#### Storing Changes

Our changeset needs a reference to the underlying model, as well as an internal list of changes to be applied. We can set this up in the `init` method of our object, which is invoked whenever a new instance is created.

```js
export function changeset(obj, validateFn/*, validationMap */) {
  return EmberObject.extend({
    init() {
      this._super(...arguments);
      this._content = obj;
      this._changes = {};
      this._errors = {};
      this._validator = validateFn;
    }
  });
}

export default class Changeset {
  constructor() {
    return changeset(...arguments).create();
  }
}
```

We want to be able to forward `get`s to `_content`, but hold back `set`s on `_changes`, and this is easy enough to set up via virtual properties:

```js
{
  unknownProperty(key) {
    let content = get(this, '_content');
    return get(content, key);
  },

  setUnknownProperty(key, value) {
    return this._validateAndSet(key, value);
  },

  _validateAndSet(key, value) {
    // if valid, set it on `_changes`
    // otherwise set it on `_errors`
  }
}
```

Since a changeset should only allow valid changes to be set, we validate the change using the `validateFn` function that was passed in to the changeset factory. If a change is valid, we add it to the hash of changes in `_changes`, and if it’s invalid and returns an error message, we add it to the hash of `_errors`.

Of course, there are more implementation details than that, but the concept remains unchanged. After defining a simple public API for using changesets, there wasn’t too much more code to add! For example, this is how you would use a changeset:

```js
let changeset = new Changeset(user, validatorFn);
user.get('firstName'); // "Michael"
user.get('lastName'); // "Bolton"

changeset.set('firstName', 'Jim');
changeset.set('lastName', 'B');
changeset.get('isInvalid'); // true
changeset.get('errors'); // [{ key: 'lastName', validation: 'too short', value: 'B' }]
changeset.set('lastName', 'Bob');
changeset.get('isValid'); // true

user.get('firstName'); // "Michael"
user.get('lastName'); // "Bolton"

changeset.save(); // sets and saves valid changes on the user
user.get('firstName'); // "Jim"
user.get('lastName'); // "Bob"
```

Rolling back changes, and even merging them, becomes trivial with a changeset:

```js
changeset.set('firstName', 'Milton');
changeset.get('isDirty'); // true
changeset.rollback();
changeset.get('isDirty'); // false
```

```js
let changesetA = new Changeset(user, validatorFn);
let changesetB = new Changeset(user, validatorFn);
changesetA.set('firstName', 'Jim');
changesetB.set('firstName', 'Jimmy');
changesetB.set('lastName', 'Fallon');
let changesetC = changesetA.merge(changesetB);
changesetC.execute();
user.get('firstName'); // "Jimmy"
user.get('lastName'); // "Fallon"
```

#### Data Down Actions Up, Not 2-Way Bindings

One of the reasons DDAU is so strongly emphasized in Ember 2.x is because it helps us avoid shooting ourselves in the foot with 2 way bindings (2WBs). 2WBs were the “killer feature” of many JavaScript frameworks when they first debuted. As client side applications matured and became more sophisticated, developers realized that 2WBs were more harmful than useful. 2WBs led to instability and difficult debugging in the form of cascading changes, and [React](https://facebook.github.io/react/) was the first library to attempt to solve this problem.

React’s breakthrough was in the use of a virtual DOM, a representation of the actual DOM as a tree-like data structure. Diffing the changes between the virtual and real DOM paved the way for the complete removal of 2WBs — the application simply re-renders whenever there is a change in value.

This continues to be a simpler mental model, and just like Elixir (and other functional languages), eliminates a whole class of bugs. DDAU in Ember.js is built upon the same idea, that data should flow one way.

Using changesets in Ember takes the DDAU philosophy used in rendering into the realm of interacting with client side view models. Instead of 2WBs, changesets allow one way data flow to a model, ensuring that they are always valid, and eliminating a whole class of synchronization headaches.

#### Is This Real Life?

When I dropped in `ember-changeset` and `ember-changeset-validations` into my client app, it instantly clicked with the way I’ve been writing Ember, using DDAU. My complex forms now have independent validations and changes, and I no longer need to worry about saving an unintended change in one form when I submit another.

Because `ember-changeset` can be used directly in place of an ember-data model, using it with a form library like `ember-form-for` is trivial using the `changeset` helper:

```handlebars
{{dummy-form changeset=(changeset model (action "validate"))}}
```

```handlebars
{{#form-for changeset as |f|}}
  {{f.text-field "firstName"}}
  {{f.text-field "lastName"}}
  {{f.date-field "birthDate"}}

  {{f.submit "Save"}}
{{/form-for}}
```

#### Validating Changesets

Validation becomes even simpler with changesets. Throughout Ember’s history, we have largely relied on addons like [ember-validations](https://github.com/DockYard/ember-validations) which make extensive use of observers. Newer libraries like [ember-cp-validations](https://github.com/offirgolan/ember-cp-validations) use computed properties (CPs) instead, but that still relies on 2WBs.

Using `ember-changeset` and `ember-changeset-validations` you can take a functional approach with validations. A validator function is passed into the changeset, that is invoked whenever a property is set. This validator function then looks up the appropriate validator (say `presence` or `format`) on the validation map, and returns `true` or an error message.

```js
import {
  validatePresence,
  validateLength,
  validateConfirmation,
  validateFormat
} from 'ember-changeset-validations/validators';
import validateCustom from '../validators/custom'; // local validator
import validatePasswordStrength from '../validators/password-strength'; // local validator

export default {
  firstName: [
    validatePresence(true),
    validateLength({ min: 4 })
  ],
  lastName: validatePresence(true),
  age: validateCustom({ foo: 'bar' }),
  email: validateFormat({ type: 'email' }),
  password: [
    validateLength({ min: 8 }),
    validatePasswordStrength({ minScore: 80 })
  ],
  passwordConfirmation: validateConfirmation({ on: 'password' })
};
```

A validator like `validatePresence` is simply a function that returns a function:

```js
// validators/custom.js
export default function validateCustom({ foo, bar } = {}) {
  return (key, newValue, oldValue, changes) => {
    // validation logic
    // return `true` if valid || error message string if invalid
  }
}
```

Which is simpler to reason about compared to an OOP implementation that relies on extending base classes and holding on to state. Because validation maps are simply POJOs, composing validators is intuitive:

```js
// validations/user.js
import {
  validatePresence,
  validateLength
} from 'ember-changeset-validations/validators';

export default {
  firstName: validatePresence(true),
  lastName: validatePresence(true)
};
```

You can easily import other validations and combine them using `Ember.assign` or `Ember.merge`.

```js
// validations/adult.js
import Ember from 'ember';
import UserValidations from './user';
import { validateNumber } from 'ember-changeset-validations/validators';

const { assign } = Ember;

export const AdultValidations = {
  age: validateNumber({ gt: 18 })
};

export default assign({}, UserValidations, AdultValidations);
```

This approach lets you build up validations independent of the model. Ember Data models aren’t 1 to 1 representations of server-side records, they’re View Models. This means we shouldn’t need to validate them the same way we would a server-side model. For example, you might have `User` models in your application, and some of these users might have different roles that require different validation. Best of all, we don’t need to use observers or CPs!

#### The Only Constant is Change

I hope you enjoyed reading about the concept and implementation of changesets in Ember. DDAU on your models will make your life simpler and your app easier to reason about! Work is still on-going on these addons, so please try them out and let me know if you have any issues or feedback.

As always, thanks for reading!