---
title: Ember.js and HTML5 Drag and Drop
kind: post
description: >-
  It’s fairly trivial to add a ‘drag and drop’ interface to Ember.js with html5,
  without the need for external libraries, although…
date: '2014-09-25T02:38:31.953Z'
categories:
  - engineering
keywords:
  - emberjs
  - drag and drop
  - html5
published: true
cover: ./rawpixel-191157-unsplash.jpg
coverAuthor: rawpixel
coverOriginalUrl: https://unsplash.com/photos/C05KN4h8WKw?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

It’s fairly trivial to add a ‘drag and drop’ interface to Ember.js with [html](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_and_drop)5, without the need for external libraries, although the caveat is that mobile browsers don’t (yet) [support](http://caniuse.com/#feat=dragndrop) html5 drag and drop.

The basic premise is to create 2 components:

*   a `draggable-dropzone` component, that handles when an item is dropped into it (e.g. a shopping cart)
*   a `draggable-item` component, that sets up the data transfer into the dropzone

Using [transclusion](http://en.wikipedia.org/wiki/Transclusion), we can then easily add our ‘drag and drop’ functionality into our Ember application with different UI.

### demo (with extra bells and whistles)

Code: [JSBin demo](http://jsbin.com/denep/9/edit?js,output)

<div style='position:relative; padding-bottom:calc(31.10% + 44px)'><iframe src='https://gfycat.com/ifr/HarmfulQuarterlyBobwhite' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0;' allowfullscreen></iframe></div><p> <a href="https://gfycat.com/harmfulquarterlybobwhite">via Gfycat</a></p>

### draggable-dropzone

Let’s first define our `draggable-dropzone` component:

```js
import Ember from 'ember';

var { set } = Ember;

export default Ember.Component.extend({
  classNames        : [ 'draggableDropzone' ],
  classNameBindings : [ 'dragClass' ],
  dragClass         : 'deactivated',

  dragLeave(event) {
    event.preventDefault();
    set(this, 'dragClass', 'deactivated');
  },

  dragOver(event) {
    event.preventDefault();
    set(this, 'dragClass', 'activated');
  },

  drop(event) {
    var data = event.dataTransfer.getData('text/data');
    this.sendAction('dropped', data);

    set(this, 'dragClass', 'deactivated');
  }
});
```

```handlebars
{{yield}}
```

Ember includes [built-in events](http://emberjs.com/api/classes/Ember.View.html#toc_event-names) for the html5 drag and drop API, so we can make use of them right out of the box. We also set up a `classNamebinding` to provide visual cues to our user that the element is a dropzone for dragging things into.

### draggable-item

Next, we define the component for setting up items to be draggable:

```js
import Ember from 'ember';

var { get } = Ember;

export default Ember.Component.extend({
  classNames        : [ 'draggableItem' ],
  attributeBindings : [ 'draggable' ],
  draggable         : 'true',

  dragStart(event) {
    return event.dataTransfer.setData('text/data', get(this, 'content'));
  }
});
```

```handlebars
{{yield}}
```

`draggable` is, as you’d expect, the attribute that makes a DOM node draggable. We simply set the attribute of the component, and handle the `dragStart` event to get the content of the component. Unfortunately, the HTML5 API does not allow for draggables to transfer JavaScript, so we’ll have to perform a workaround.

### Using the components in our application

One thing to note is that we can’t transfer actual objects or records through the API, so when we include the component into our template, we have to set its content to the record’s ID.

Here’s a simple example of an interface for adding users to a new ‘team’ record we want to save:

```handlebars
<div class="selected-users">
  {{#draggable-dropzone dropped="addUser"}}
    <ul class="selected-users-list">
      {{#each user in selectedUsers}}
        <li>{{user.fullName}}</li>
      {{/each}}
    </ul>
  {{/draggable-dropzone}}
</div>

<div class="available-users">
  {{#each user in users}}
    {{#draggable-item content=user.id}}
      <span>{{user.fullName}}</span>
    {{/draggable-item}}
  {{/each}}
</div>
```

If you recall, we sent an action on `drop` in the `draggable-dropzone` component:

```js
drop(event) {
  // ...
  this.sendAction('dropped', data);
}
```

Now we simply need to define an appropriate action on our controller to handle the drag and drop:

```js
import Ember from 'ember';

var { computed, get } = Ember;

export default Ember.ArrayController.extend({
  selectedUsers        : Ember.A([]),
  remainingUsers       : computed.setDiff('model', 'selectedUsers'),
  remainingUsersLength : computed.alias('remainingUsers.length'),

  actions: {
    addUser(userId) {
      var selectedUsers = get(this, 'selectedUsers');
      var user          = get(this, 'model').findBy('id', parseInt(userId));

      if (!selectedUsers.contains(user)) {
        return selectedUsers.pushObject(user);
      }
    },

    addAllUsers() {
      var remainingUsers = get(this, 'remainingUsers')
      return get(this, 'selectedUsers').pushObjects(remainingUsers);
    },

    removeUser(user) {
      return get(this, 'selectedUsers').removeObject(user);
    },

    removeAllUsers() {
      return get(this, 'selectedUsers').clear();
    }
  }
});
```

In our Controller, we simply find the appropriate user record from the store (using the `userId` we get from the `draggable-item` component), and then push it into an array called `selectedUsers`. We can then do whatever we want with this array (e.g. create a new team with the selected users).

Some basic styling:

```scss
$default-margin : 20px;
$gray-light     : #e1e1e1;
$gray-medium    : #aaa;
$green          : #2ecc71;
$white          : #fff;
$black          : #111;

.draggableDropzone {
   display: block;
   border: 3px dashed $gray-medium;
   padding: $default-margin / 2;
   width: 100%;
   min-height: $default-margin * 2.5;
   color: $gray-medium;
   margin-bottom: $default-margin / 2;
   &.activated {
     border-color: $green;
   }
   &.deactivated {
     border-color: $gray-light;
   }
}

.draggableItem[draggable=true] {
   display: inline-block;
   min-width: $default-margin;
   min-height: $default-margin;
   background: $gray-light;
   padding: $default-margin / 4 $default-margin / 2;
   margin: $default-margin / 4;
   -moz-user-select: none;
   -khtml-user-drag: element;
   cursor: move;
   &:hover {
     background-color: $gray-medium;
   }
}
```

Over at [doceo](http://www.doceo.com), we’ve added more functionality to the interface, including typeahead search, and other useful controls (add all users, removing all users, removing a single user). This basic setup is sufficient enough to handle most use cases for a drag and drop UI, and having transclusion (yield) lets us define different designs for the same drag and drop functionality.

Special thanks to [@itscatkins](https://twitter.com/itscatkins) for pairing with me for this one.