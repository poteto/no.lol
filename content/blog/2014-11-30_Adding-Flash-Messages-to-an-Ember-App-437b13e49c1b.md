---
title: Adding Flash Messages to an Ember App
description: >-
  One of Jakob Nielsen’s 10 heuristics for user interface design is Visibility
  of System Status, or in other words, keeping users informed…
date: '2014-11-30T06:40:17.224Z'
categories: ''
keywords: ''
slug: /@sugarpirate/adding-flash-messages-to-an-ember-app-437b13e49c1b
---

  

One of Jakob Nielsen’s [10 heuristics for user interface design](http://www.nngroup.com/articles/ten-usability-heuristics/) is **Visibility of System Status**, or in other words, keeping users informed about the status of the system through appropriate and timely feedback. A mechanic for fulfilling this heuristic is the use of flash messages, which are concise notifications that appear briefly in the user interface before being dismissed automatically (or manually).

In this post, we’ll learn about creating a service that can be injected into Ember Controllers and Routes, that lets us easily add a flash message to our app. We can then trigger these messages in specific actions with a simple API. Let’s get to it!

![](https://cdn-images-1.medium.com/max/800/1*bf9CMdP3k4PZCiGnVndvMQ.gif)

The flash message addon in action

### Planning our Approach

On a high level, we’ll be creating a singleton FlashMessageService that injects itself into all Ember Controllers and Routes. The service will contain a queue of messages that dequeue automatically after a certain amount of time has elapsed.

These messages can then be created from any Ember Controller or Route, then rendered in the application template.

#### **Update (1st Feb 2015)**

I’ve also made this an [ember-addon](https://github.com/poteto/ember-cli-flash) — you can install it with:

$ ember install:addon ember-cli-flash

or:

$ npm install --save ember-cli-flash

### JS Bin Demo (globals)

[**JS Bin**  
_Sample of the bin: Ember Flash Messages demo by @sugarpirate\_ Add flash messages with different types by clicking on…_jsbin.com](http://jsbin.com/ranewo/37/edit?js,output "http://jsbin.com/ranewo/37/edit?js,output")[](http://jsbin.com/ranewo/37/edit?js,output)

### The Flash Message Service

[_View full gist_](https://gist.github.com/poteto/366002c9f0ae1c044dad)

The Flash Message Service is an Ember.Object that holds a queue of Flash Messages. The public API will allow us to create **success, info, warning** and **danger** type messages, as well as add flash messages with custom **type**, and **clear** all visible flash messages.

Usage is very simple. From within a Controller or Route:

#### Props

The Flash Service starts out with an empty array as its **queue** property**.** Flash messages that are created are pushed into this queue, and removed when their timeouts have elapsed. We also setup a global **defaultTimeout**, in case one isn’t specified when creating new flash messages.

#### Public methods

The #**success**, #**info**, #**warning**, and #**danger** methods simply curry the **#\_addToQueue** method with their types filled in as you’d expect. Also note the use of es6 syntax here — we can pass in default values for timeout. Awesome!

**#addMessage** is responsible for creating flash messages where the user wishes to have a type that isn’t one of the default four, and #**clearMessages** [clears the array](http://emberjs.com/api/classes/Ember.NativeArray.html#method_clear).

#### #\_newFlashMessage

This private method is responsible for creating new flash message objects. A timeout is also set here, so we can remove the created flash message after a certain amount of time has elapsed.

The created flash message object also holds a reference to the singleton flash service, so that it can remove itself from the queue after the timeout has elapsed.

#### #\_addToQueue

This private method creates a new flash message object, then pushes it into the queue.

### The Flash Message Object

[_View full gist_](https://gist.github.com/poteto/77f02fc2e1a517a3b6c8)

This Ember Object represents a single flash message.

#### Props

These are convenience properties using Ember.computed macros.

#### On init

When the Object’s **create** method is called, **init** runs and calls **#\_destroyMessage** on it after the timeout period has passed.

#### Destroying the message

Calling **#\_destroyMessage** sets the **isDestroyed** flag on the message, and removes itself from the queue. We also expose **#destroyMessage** so that the flash message can be destroyed from the component itself.

### Injecting the Flash Messages Service into Ember Controllers

Now that we have a service that holds a queue of flash messages, we’ll need to inject it into all our Controllers and Routes, so we can easily add new flash messages from across the app. We register the factory as a singleton, as we only want one instance of the service.

For more information about dependency and service lookups, check out the [Ember guides](http://emberjs.com/guides/understanding-ember/dependency-injection-and-service-lookup/).

### Rendering Flash Messages with a Component

With the service created, we can render all our flash messages into our application template. We’ll wrap it in a very simple component, which adds classes needed for Bootstrap to style ‘alerts’.

Now we can render our flash messages easily into any template:

{{#each flash in flashes.queue}}  
  {{flash-message flash=flash}}  
{{/each}}

You can also pass in your own template for the flash message if you wish:

{{#each flash in flashes.queue}}  
  {{#flash-message flash=flash}}  
    <h6>{{flash.flashType}}</h6>  
    <p>{{flash.message}}</p>  
  {{/flash-message}}  
{{/each}}

Implementing this yourself is quite simple, but if you’d rather not, please install the [ember-addon](https://github.com/poteto/ember-cli-flash)!

$ ember install:addon ember-cli-flash

or:

$ npm install --save ember-cli-flash