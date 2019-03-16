---
title: Submit an Ember TextArea with Command or Ctrl + Enter
description: >-
  You might have an Ember TextArea in your app somewhere, perhaps as a comment
  form or some other input, for submitting multi-line strings…
date: '2014-12-22T12:17:33.263Z'
categories:
  - engineering
keywords:
  - emberjs
  - keyboard
cover: ./pawel-czerwinski-1404603-unsplash.jpg
coverAuthor: Paweł Czerwiński
coverOriginalUrl: https://unsplash.com/photos/1aMG_ShZCYg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

It’s Christmas in a few days, so I only have time for a short post this week.

You might have an [Ember TextArea](http://emberjs.com/api/classes/Ember.Handlebars.helpers.html#method_textarea) in your app somewhere, perhaps as a comment form or some other input, for submitting multi-line strings (e.g. formatted with [Markdown](https://help.github.com/articles/github-flavored-markdown/)) to some API. If you’ve ever commented on a Github issue or pull request, you’ll notice that the form doesn’t submit if you hit enter while it’s in focus. Instead, it only submits when you hit ctrl or ⌘ + enter.

In this post, we’ll explore the few lines of code we need to extend the default Ember TextArea to do just that.

[JS Bin Demo](http://jsbin.com/susipe/9/embed?html,js,output)

### Reopening Ember.TextArea

Ember makes it really easy to [reopen](http://emberjs.com/guides/object-model/reopening-classes-and-instances/) classes so that we can add new methods and properties, or modify existing ones. It’s analogous to adding methods to some prototype instead of adding them to each and every instance of that class. Generally speaking, `reopenClass` adds methods to the class itself, while `reopen` adds methods to instances of that class.

> _‘reopen’ is used to add instance methods and properties that are shared across all instances of a class._

For example, if you wanted your Ember app to use the browser’s history API instead of a hashchange event, you would have to reopen the Router, and set it’s location key/value to ‘history’:

```js
App.Router.reopen({
  location: 'history'
});
```

In our case, we’re reopening `Ember.Textarea`, and modifying the default event `keyDown` to check if the event has the right keycode and modifier key (`_isValidCombination`). If it is, the TextArea (which extends Ember.Component — it’s just a special kind of component) sends an action we named `modifiedSubmit`. Then in our template, we just need to bind that action name to some controller action to handle it and we’re done!

```handlebars
{{textarea modifiedSubmit="someControllerAction" value=someText}}
```

```js
export default Ember.TextArea.reopen({
  keyDown: function(event) {
    if (this._isValidCombination(event)) {
      this.sendAction('modifiedSubmit');
    }
  },
  _hasCorrectModifier: function(event) {
    return event.ctrlKey || event.metaKey;
  },
  _isCorrectKeyCode: function(keyCode) {
    return keyCode === 13;
  },
  _isValidCombination: function(event) {
    return this._hasCorrectModifier(event) && this._isCorrectKeyCode(event.keyCode);
  }
});
```

### Reopening and Extending Other Classes to Keep Things DRY

As you can see, it’s really easy to reopen and add or overwrite existing methods on Ember classes. It’s a powerful concept that can also be easily abused, so have a read of the Ember guides about the [Ember object model](http://emberjs.com/guides/object-model/classes-and-instances/) to get a sense of how it all works. Many classes in Ember inherit from [Ember.Object](http://emberjs.com/api/classes/Ember.Object.html) as a base, so knowing about the object model will be useful in getting a better understanding of how Ember works.

#### Ember.Object#extend

This method extends a sub-class from some Ember Object. For example, you might have noticed that all your controllers extend Ember.Controller/ObjectController/ArrayController:

```js
export default Ember.Controller.extend({ ... });
```

That means we can also create our own controllers and other objects that can then be used as a new base class:

```js
// base.js
export default Ember.Controller.extend({
  someComputed: Ember.computed('foo', 'bar', function() {
    return get(this, 'foo') + ' ' + get(this, 'bar');
  })
});
```

Then:

```js
// other.js
import BaseController from 'base';

export default BaseController.extend({
  ... // some other classes that need the 'someComputed' property
});
```

Now all classes that extend from ‘BaseController’ will automatically inherit the `someComputed` computed property, and you don’t have to define it a million times, keeping your code DRY. You can extend pretty much anything: computed properties, actions, and even lifecycle hooks.

This doesn’t just apply to controllers — you can do the same for models, components, views, routes… Basically anything that extends Ember.Object.

### Merry Christmas and Thanks for Reading!

I hope you’ve enjoyed reading this little blog post!

#### What I’ve been up to

Over the next few weeks and months, I’ll be working on improving the [Ember Getting Started Guide](http://emberjs.com/guides/getting-started/) (GSG) alongside the Ember documentation strike team. We’re aware that Ember’s documentation isn’t as strong as we’d like, so we’ll be taking this opportunity to redesign and rewrite it from the ground up to ensure Ember’s on-boarding story for new developers is best in class in the run up to 2.0.

If you have any suggestions, ideas or feedback for the new GSG, please [tweet me](https://twitter.com/sugarpirate_)! Anything, no matter how small or insignificant, will be helpful. If you like my writing, I hope I’ll be able to inject a little bit of _sugarpirate_ goodness into the GSG, and if you don’t, please let me know ☺

See you in the new year! — _Lauren_

#### Follow my Ember Collections on Medium

[`Delightful UI for Ember Apps`
_A curation of insights into building delightful user interfaces for your Ember application_medium.com](https://medium.com/delightful-ui-for-ember-apps "https://medium.com/delightful-ui-for-ember-apps")[](https://medium.com/delightful-ui-for-ember-apps)

[`The Ember Way`
_Doing things the Ember Way_medium.com](https://medium.com/the-ember-way "https://medium.com/the-ember-way")[](https://medium.com/the-ember-way)