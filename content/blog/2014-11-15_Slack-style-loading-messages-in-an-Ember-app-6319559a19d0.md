---
title: Slack-style loading messages in an Ember app
description: >-
  If you haven’t used Slack already, it’s an awesome chat app for teams that’s
  similar to IRC. I’ve been using it for a while now, and I’ve…
date: '2014-11-15T00:21:24.720Z'
categories: ''
keywords: ''
slug: /@sugarpirate/slack-style-loading-messages-in-an-ember-app-6319559a19d0
---

  

If you haven’t used [Slack](http://www.slack.com) already, it’s an awesome chat app for teams that’s similar to IRC. I’ve been using it for a while now, and I’ve pretty much sworn off writing emails for internal communication in favour of Slack.

One little interaction that I particularly enjoy is the random loading message that appears every time you load the app – it’s a nice little touch that makes the app feel just a little bit more human and fun.

Because Ember is well designed for asynchronous routing, it’s really easy to add application loading messages by making use of the little known global [**loading**](http://emberjs.com/guides/routing/loading-and-error-substates/#toc_code-loading-code-substates) route that you get for free. Let’s get started!

### What We’re Building

![](https://cdn-images-1.medium.com/max/800/1*Zt4D8uCy5-J82hw-rHsJxA.gif)

What you see when you open the Slack app

We’re going to create a few things:

*   A loading message component
*   A custom computed property macro (CPM) for randomly choosing an item from an array (e.g. Ruby’s [Array#sample](http://www.ruby-doc.org/core-2.1.5/Array.html#method-i-sample))
*   CSS for animating the ellipsis

### The Component

The component itself is fairly simple – we’re setting a tag name and some classes (I’m using [animate.css](http://daneden.github.io/animate.css/) to fade the message in), as well as some loading messages and text. In addition, we accept a simple boolean property to show or hide the random loading messages, as sometimes we might only want the ‘Loading…” text to appear. The only thing of interest here is the **computedSample** CPM, which is defined in a little utility file.

### A Custom Computed Property Macro

Here, we’re creating a new computed property macro for sampling an array and returning a random item.

What this function does is return an **Ember.computed** function that’s observing each item in some **dependentKey** (an array),  then accessing a random index on that array. The prototype method [**volatile**](http://emberjs.com/api/classes/Ember.ComputedProperty.html#method_volatile) tells Ember not to cache the return value, so we get a unique loading message each time the app enters the loading route (even without a hard refresh).

### Animating the ellipsis in CSS

The above lets us animate the opacity of each individual dot in the ellipsis. Using sibling selectors, we can easily apply a different delay to each dot, and then have the keyframes repeat infinitely.

### Using the component

The template for the component.

The loading template that’s rendered in the loading route.

### The Final Product

![](https://cdn-images-1.medium.com/max/800/1*FwmSrN52_-sAv7JV7yybgw.gif)

The finished product

### In Closing

Ember makes front end development such a joy. I hope you’ve enjoyed how easy it is to add Slack-like loading messages into your app!

For more Ember.js posts, follow my two collections on Medium:

[**Delightful UI for Ember Apps**  
_A curation of insights into building delightful user interfaces for your Ember application_medium.com](https://medium.com/delightful-ui-for-ember-apps "https://medium.com/delightful-ui-for-ember-apps")[](https://medium.com/delightful-ui-for-ember-apps)

[**The Ember Way**  
_Doing things the Ember Way_medium.com](https://medium.com/the-ember-way "https://medium.com/the-ember-way")[](https://medium.com/the-ember-way)