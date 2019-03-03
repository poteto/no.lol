---
title: Lazy Loading Videos in Ember
description: >-
  If you’re like me, every time you embed a video iframe into your app you feel
  a little bit dirty for having to load an entire html document…
date: '2014-12-14T10:28:26.243Z'
categories: ''
keywords: ''
slug: /@sugarpirate/lazy-loading-videos-in-ember-7504a4abe34f
---

  

If you’re like me, every time you embed a video iframe into your app you feel a little dirty. Embedding an iframe means loading an entire html document and the crazy amounts of resources it brings along with it. What’s worse is having to embed multiple videos — you really start to feel the performance hit the more videos you add.

Lazy loading is a design pattern for deferring initialization of objects until we actually need them (as opposed to eager loading). In our case, we’d like to use lazy loading to display a thumbnail of the video as a placeholder, and only render the iframe when the user requests it (probably by clicking on it). Lazy loading resource heavy video embeds helps improve render performance of our app, and the best part is that it does not negatively affect the user experience.

In this post, we’ll build a simple component and service to handle lazy loading of Youtube and Vimeo videos. I’d like the component’s API to look something like this:

{{lazy-video provider="youtube" videoId="gvdf5n-zI14"}}  
{{lazy-video provider="vimeo"   videoId="51771300"}}

### JS Bin Demo

[**JS Bin**  
_Sample of the bin: ember-lazy-video by @sugarpirate\_ The lazy-video component displays the video's thumbnail, and doesn…_emberjs.jsbin.com](http://emberjs.jsbin.com/qaribi/edit?html,js,output "http://emberjs.jsbin.com/qaribi/edit?html,js,output")[](http://emberjs.jsbin.com/qaribi/edit?html,js,output)

### Retrieving the Right URLs

The Lazy Video service is basically our interface to use different providers. It needs a bit of refactoring, but you can see that it doesn’t do that much except serialize URLs. Eventually we’ll be able to add our own providers pretty easily.

For now, let’s add Youtube and Vimeo providers:

These providers don’t do anything too complicated. Youtube’s thumbnails are [predictably named](http://stackoverflow.com/a/2068371/4259952), so we can just return strings with the correct videoId. Unfortunately [Vimeo’s thumbnail URL](http://developer.vimeo.com/apis/oembed) isn’t as simple, but it’s nothing simple AJAX can’t handle. If you haven’t dealt with Ember promises much before, we’re just wrapping a jQuery AJAX call inside of an [RSVP](https://github.com/tildeio/rsvp.js/) promise, and resolving the promise with the thumbnail URL from the API response.

### Injecting the Service into our Component

With that all done, we can inject the Lazy Video providers service into our single component, and call it ‘providers’. This means we can simply call the service from within our component with:

this.get('providers'); // 'this' being the component

### The Lazy Video Component

The component works by first asking the service for the right embed and thumbnail URLs. It then sets an inline style for the background to be the video’s thumbnail. Because the iframe embed is disabled by default, the component renders the thumbnail until the user clicks on it, at which point it renders the iframe with the correct embed URL.

I stole the SVG for Youtube’s play button as a default overlay on top of the thumbnails, to let our users know that this is a video. Sorry Youtube! If we specify a block in our component though, the overlay won’t appear and we can design our own play button. This is done with transclusion and the [ability to check](https://github.com/emberjs/ember.js/blob/master/packages/ember-views/lib/views/component.js#L170) if a template was passed into the component’s block:

{{#if template}}  
  {{yield}}  
{{else}}  
  <p>Do something else</p>

With a little bit of CSS to make the play button a little snazzier, we’re done with our dead simple component!

### Where to go from here

I originally started writing this code inside of an Ember.js flavoured [JSBin](http://emberjs.jsbin.com). It’s a great playground to experiment and tinker with ideas before you decide you want to commit to writing something in greater detail.

As you can probably tell, we could refactor the code we’ve written into something more reusable and extendable. For example, we could rewrite it in a way so that adding new providers is easy, and for the ability to customize the kind of event that triggers the display of the embed. We could even abstract it more so that the component lazy loads anything, and not just videos. After experimenting with our idea in the JS Bin and getting a sense of what we want to build, we should also start writing the right tests to confidently be sure that our code does what we intend it to.

> First do it, then do it right, then do it better — Addy Osmani

As always, it’s been a pleasure writing and I hope you’ve enjoyed reading. I’ll be working on making this into a [reusable Ember addon](https://github.com/poteto/ember-lazy-video) over the next week or so in my spare time, I invite you to contribute if you’d like to.

In the next week or two, I’ll be writing about the process for turning a little idea in a JS Bin into a proper well tested Ember addon. Follow me on [twitter](https://twitter.com/sugarpirate_) if you’d like to read more of my ramblings!