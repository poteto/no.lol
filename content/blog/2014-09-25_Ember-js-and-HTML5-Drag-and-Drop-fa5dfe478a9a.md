---
title: Ember.js and HTML5 Drag and Drop
description: >-
  It’s fairly trivial to add a ‘drag and drop’ interface to Ember.js with html5,
  without the need for external libraries, although…
date: '2014-09-25T02:38:31.953Z'
categories: ''
keywords: ''
slug: /@sugarpirate/ember-js-and-html5-drag-and-drop-fa5dfe478a9a
---

  

It’s fairly trivial to add a ‘drag and drop’ interface to Ember.js with [html](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_and_drop)5, without the need for external libraries, although the caveat is that mobile browsers don’t (yet) [support](http://caniuse.com/#feat=dragndrop) html5 drag and drop.

The basic premise is to create 2 components:

*   a **draggable-dropzone** component, that handles when an item is dropped into it (e.g. a shopping cart)
*   a **draggable-item** component, that sets up the data transfer into the dropzone

Using [transclusion](http://en.wikipedia.org/wiki/Transclusion), we can then easily add our ‘drag and drop’ functionality into our Ember application with different UI.

### demo (with extra bells and whistles)

[http://gfycat.com/HarmfulQuarterlyBobwhite](http://gfycat.com/HarmfulQuarterlyBobwhite)

[**JS Bin**  
_Sample of the bin: Ember Drag and Drop demo by @sugarpirate\_ {{outlet}} {{#draggable-dropzone dropped="addUser"}} {…_jsbin.com](http://jsbin.com/denep/9/edit?js,output "http://jsbin.com/denep/9/edit?js,output")[](http://jsbin.com/denep/9/edit?js,output)

### draggable-dropzone

Let’s first define our ‘draggable-dropzone’ component:

Ember includes [built-in events](http://emberjs.com/api/classes/Ember.View.html#toc_event-names) for the html5 drag and drop API, so we can make use of them right out of the box. We also set up a **classNamebinding** to provide visual cues to our user that the element is a dropzone for dragging things into.

### draggable-item

Next, we define the component for setting up items to be draggable:

**draggable** is, as you’d expect, the attribute that makes a DOM node draggable. We simply set the attribute of the component, and handle the **dragStart** event to get the content of the component. Unfortunately, the HTML5 API does not allow for draggables to transfer JavaScript, so we’ll have to perform a workaround.

### Using the components in our application

One thing to note is that we can’t transfer actual objects or records through the API, so when we include the component into our template, we have to set its content to the record’s ID.

Here’s a simple example of an interface for adding users to a new ‘team’ record we want to save:

If you recall, we sent an action on **‘drop’** in the ‘draggable-dropzone’ component:

Now we simply need to define an appropriate action on our controller to handle the drag and drop:

In our Controller, we simply find the appropriate user record from the store (using the **userId** we get from the draggable-item component), and then push it into an array called **selectedUsers**. We can then do whatever we want with this array (e.g. create a new team with the selected users).

Some basic styling:

Over at [doceo](http://www.doceo.com), we’ve added more functionality to the interface, including typeahead search, and other useful controls (add all users, removing all users, removing a single user). This basic setup is sufficient enough to handle most use cases for a drag and drop UI, and having transclusion (yield) lets us define different designs for the same drag and drop functionality.

Special thanks to [@itscatkins](https://twitter.com/itscatkins) for pairing with me for this one.