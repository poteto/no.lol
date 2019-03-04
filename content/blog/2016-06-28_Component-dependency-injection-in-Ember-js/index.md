---
title: Component dependency injection in Ember.js
description: >-
  The Dependency Injection (DI) pattern is a subset of Inversion of Control, and
  is a useful technique for decoupling the creation of a…
date: '2016-06-28T17:01:02.519Z'
categories: ''
keywords: ''
slug: /@sugarpirate/component-dependency-injection-in-ember-js-a46a39a5d30a
cover: ./andrew-buchanan-1404154-unsplash.jpg
cover-author: Andrew Buchanan
cover-original-url: https://unsplash.com/photos/UYJL-k9bkAY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

The [Dependency Injection](http://martinfowler.com/articles/injection.html) (DI) pattern is a subset of [Inversion of Control](http://martinfowler.com/articles/injection.html#InversionOfControl), and is a useful technique for decoupling the creation of a dependency from the object itself. Don’t let the terminology scare you though! DI is really just [giving an object its instance variables](http://www.jamesshore.com/Blog/Dependency-Injection-Demystified.html).

For example, below is a simple example of the `Player` class being implicitly coupled to the `Bag` class. The `Player` is responsible for creating the dependent objects:

```js
export default class Player {
  constructor() {
    this.inventory = new Bag({ /* ... */ });
  }

  add(item) {
    return this.inventory.add(item);
  }
}

let bob = new Player();
```

Although the example is simple, it’s fairly easy to see that this implementation could be difficult to test in isolation, as you now need to know about the `Bag` class in the `Player` class’ test. DI can help us here:

```js
export default class Player {
  constructor({ storageObject }) {
    this.inventory = storageObject;
  }

  add(item) {
    return this.inventory.add(item);
  }
}

let bob = new Player({ storageObject: new Bag({ /* ... */ }));
```

In the second example, we “inverted control” of the player’s inventory, and now we pass the storage object instance at runtime. This means that in our test, we can simply stub the inventory object out:

```js
test('it adds an item', function(assert) {
  let dummyStorage = { /* ... */ };
  let dummy = new Player({ storageObject: dummyStorage });

  assert.ok(/* ... */);
});
```

The `Player` class no longer needs to know anything about the `Bag`, and also allows other kinds of storage object classes to be used. Great!

#### Component Dependency Injection

I recently realized that the DI pattern can also be used to great effect in Ember components. For example, let’s say you have a container or parent component that uses multiple child components:

```handlebars
<!-- templates/application.hbs -->

{{edit-location location=location}}
```

```handlebars
<!-- components/edit-location.hbs -->

{{google-map
    lat=location.lat
    lng=location.lng
    setLatLng=(action "setLatLng")
    setMarkerRadius=(action "setMarkerRadius")
}}
{{edit-location-form location=location}}
{{location-activity location=location}}
```

The parent component `edit-location`’s primary responsibility is to provide UI to edit a location. It could have actions defined on it, like so:

```js
// components/edit-location.js

export default Component.extend({
  actions: {
    setLatLng(latLng) {
      // logic
    },

    setMarkerRadius(radius) {
      // logic
    }
  }
});
```

The `google-map` component provides UI for the user to drop a marker on a map, and adjust the radius around the marker by using the radius control. Needless to say, that UI interaction is quite difficult to test, and is tested in the `google-map` component test itself. Because the `edit-location` component is tightly coupled to its child components, testing it is no easy task. We need to make sure all the child components are setup just right, which introduces a lot of boilerplate in our component integration test.

#### Not my concern

In this scenario, the `edit-location` component itself shouldn’t need to concern itself with _how_ the `latLng` and `radius` arguments are passed into its actions. The drag and drop UI is a concern of the `google-map` component, and as such should be tested in its own component integration test.

Using DI, we can decouple the `edit-location` component from its child components, and clean up our tests. This technique is currently only possible with [contextual components](http://emberjs.com/blog/2016/01/15/ember-2-3-released.html#toc_contextual-components) due to the use of the `component` and `hash` helpers, which were made available in [Ember 2.3.0](http://emberjs.com/blog/2016/01/15/ember-2-3-released.html).

```handlebars
<!-- application.hbs -->

{{edit-location
    location=location
    ui=(hash
      location-map=(component "google-map")
      location-form=(component "edit-location-form")
      location-activity=(component "location-activity"))
}}
```

We’ve passed in a hash of the child components using the `hash` and `component` helpers. This effectively inverts control to the template that calls the `edit-location` form:

```handlebars
<!-- components/edit-location.hbs -->

{{ui.location-map
    lat=location.lat
    lng=location.lng
    setLatLng=(action "setLatLng")
    setMarkerRadius=(action "setMarkerRadius")
}}
{{ui.location-form location=location}}
{{ui.location-activity location=location}}
```

Install the test helper here:

[**poteto/ember-test-component**
_ember-test-component — Test helper for using dependency injected components_github.com](https://github.com/poteto/ember-test-component "https://github.com/poteto/ember-test-component")[](https://github.com/poteto/ember-test-component)

```
ember install ember-test-component
```

Now, in our tests, we’ll need to write a little test helper (or use the addon above) to create a dummy component we can use to no-op (do nothing). Credit goes to [@runspired](https://twitter.com/runspired) for nudging me in the right direction:

```js
// tests/helpers/dummy-component.js

import Ember from 'ember';

const {
  Component,
  assign,
  getOwner
} = Ember;

export function registerDummyComponent(context, name = 'dummy-component', opts = {}) {
  let owner = getOwner(context);
  let options = assign({ tagName: 'dummy' }, opts);
  let DummyComponent = Component.extend(options);

  unregisterDummyComponent(context);
  owner.register(`component:${name}`, DummyComponent);
}

export function unregisterDummyComponent(context, name = 'dummy-component') {
  let owner = getOwner(context);

  if (owner.resolveRegistration(`component:${name}`)) {
    owner.unregister(`component:${name}`);
  }
}
```

This test helper registers a fake component in the container, making it available for us to use in our component integration test:

```js
// tests/integration/edit-location-test.js

test('it ...', function(assert) {
  registerDummyComponent(this);
  this.set('location', {});
  this.render(hbs`
    {{edit-location
        location=location
        ui=(hash
          location-map=(component "dummy-component")
          location-form=(component "dummy-component")
          location-activity=(component "dummy-component"))
    }}
  `);

  assert.ok(/* ... */);
});
```

Now we can test the **edit-location** component itself without worrying about setting up child components. That said, DI still allows us to test those child components integrating with **edit-location**, in a more controlled environment:

```js
// tests/integration/edit-location-test.js

test('it updates location via the form', function(assert) {
  registerDummyComponent(this);
  this.set('location', {});
  this.render(hbs`
    {{edit-location
        location=location
        ui=(hash
          location-map=(component "dummy-component")
          location-form=(component "edit-location-form")
          location-activity=(component "dummy-component"))
    }}
  `);

  assert.ok(/* ... */);
```

I hope you find this useful! It’s not a silver bullet by any stretch, but DI can help you write better isolated components and simplify your tests.

Until next time! 👋