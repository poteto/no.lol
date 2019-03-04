---
title: Lazy Loading Videos in Ember
description: >-
  If you’re like me, every time you embed a video iframe into your app you feel
  a little bit dirty for having to load an entire html document…
date: '2014-12-14T10:28:26.243Z'
categories: ''
keywords: ''
slug: /@sugarpirate/lazy-loading-videos-in-ember-7504a4abe34f
cover: ./damian-markutt-1405941-unsplash.jpg
coverAuthor: Damian Markutt
coverOriginalUrl: https://unsplash.com/photos/eCkmZ7f8oWY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

If you’re like me, every time you embed a video iframe into your app you feel a little dirty. Embedding an iframe means loading an entire html document and the crazy amounts of resources it brings along with it. What’s worse is having to embed multiple videos — you really start to feel the performance hit the more videos you add.

Lazy loading is a design pattern for deferring initialization of objects until we actually need them (as opposed to eager loading). In our case, we’d like to use lazy loading to display a thumbnail of the video as a placeholder, and only render the iframe when the user requests it (probably by clicking on it). Lazy loading resource heavy video embeds helps improve render performance of our app, and the best part is that it does not negatively affect the user experience.

In this post, we’ll build a simple component and service to handle lazy loading of Youtube and Vimeo videos. I’d like the component’s API to look something like this:

```handlebars
{{lazy-video provider="youtube" videoId="gvdf5n-zI14"}}
{{lazy-video provider="vimeo"   videoId="51771300"}}
```

### JS Bin Demo

[**JS Bin**
_Sample of the bin: ember-lazy-video by @sugarpirate_ The lazy-video component displays the video's thumbnail, and doesn…_emberjs.jsbin.com](http://emberjs.jsbin.com/qaribi/edit?html,js,output "http://emberjs.jsbin.com/qaribi/edit?html,js,output")[](http://emberjs.jsbin.com/qaribi/edit?html,js,output)

### Retrieving the Right URLs

The Lazy Video service is basically our interface to use different providers. It needs a bit of refactoring, but you can see that it doesn’t do that much except serialize URLs. Eventually we’ll be able to add our own providers pretty easily.

```js
import Ember from 'ember';
import youtube from 'ember-lazy-video/lazy-video-providers/youtube';
import vimeo from 'ember-lazy-video/lazy-video-providers/vimeo';

export default Ember.Object.extend({
  getUrl: function(provider, endpoint, videoId, opts) {
    var params;
    opts = (typeof opts === "undefined") ? {} : opts;
    params = Ember.$.param(opts);
    return this.get(provider)[endpoint](videoId) + '?' + params;
  },
  youtube: youtube,
  vimeo: vimeo
});
```

For now, let’s add Youtube and Vimeo providers:

```js
import Ember from 'ember';

export default {
  apiUrl: function(videoId) {
    return '//gdata.youtube.com/feeds/api/videos/' + videoId;
  },
  embedUrl: function(videoId) {
    return '//www.youtube.com/embed/' + videoId;
  },
  thumbnailUrl: function(videoId) {
    return Ember.RSVP.resolve('//img.youtube.com/vi/' + videoId + '/maxresdefault.jpg');
  }
};
```

```js
import Ember from 'ember';

export default {
  apiUrl: function(videoId) {
    return '//vimeo.com/api/oembed.json?url=http%3A//vimeo.com/' + videoId;
  },
  embedUrl: function(videoId) {
    return '//player.vimeo.com/video/' + videoId;
  },
  thumbnailUrl: function(videoId) {
    var apiUrl = this.apiUrl(videoId);
    return new Ember.RSVP.Promise(function(resolve) {
      Ember.$.getJSON(apiUrl).then(function(res) {
        resolve(res.thumbnail_url);
      });
    });
  }
};
```

These providers don’t do anything too complicated. Youtube’s thumbnails are [predictably named](http://stackoverflow.com/a/2068371/4259952), so we can just return strings with the correct videoId. Unfortunately [Vimeo’s thumbnail URL](http://developer.vimeo.com/apis/oembed) isn’t as simple, but it’s nothing simple AJAX can’t handle. If you haven’t dealt with Ember promises much before, we’re just wrapping a jQuery AJAX call inside of an [RSVP](https://github.com/tildeio/rsvp.js/) promise, and resolving the promise with the thumbnail URL from the API response.

### Injecting the Service into our Component

```js
import LazyVideoProviders from 'ember-lazy-video/services/lazy-video-providers';

export default {
  name: 'lazy-video',
  initialize: function(container, application){
    application.register('service:lazy-video-providers', LazyVideoProviders, { singleton: true });
    application.inject('component:lazy-video', 'providers', 'service:lazy-video-providers');
  }
};
```

With that all done, we can inject the Lazy Video providers service into our single component, and call it ‘providers’. This means we can simply call the service from within our component with:

```js
this.get('providers'); // 'this' being the component
```

### The Lazy Video Component

The component works by first asking the service for the right embed and thumbnail URLs. It then sets an inline style for the background to be the video’s thumbnail. Because the iframe embed is disabled by default, the component renders the thumbnail until the user clicks on it, at which point it renders the iframe with the correct embed URL.

I stole the SVG for Youtube’s play button as a default overlay on top of the thumbnails, to let our users know that this is a video. Sorry Youtube! If we specify a block in our component though, the overlay won’t appear and we can design our own play button. This is done with transclusion and the [ability to check](https://github.com/emberjs/ember.js/blob/master/packages/ember-views/lib/views/component.js#L170) if a template was passed into the component’s block:

```handlebars
{{#if template}}
  {{yield}}
{{else}}
  <p>Do something else</p>
```

```handlebars
{{#if isDisplayed}}
  <iframe {{bind-attr src=videoSrc}} width="100%" height="100%" frameBorder="0" allowFullScreen></iframe>
{{else}}
  {{#if template}}
    {{yield}}
  {{else}}
    <div class="lazyLoad-play">
      <svg>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M84.15,26.4v6.35c0,2.833-0.15,5.967-0.45,9.4c-0.133,1.7-0.267,3.117-0.4,4.25l-0.15,0.95c-0.167,0.767-0.367,1.517-0.6,2.25c-0.667,2.367-1.533,4.083-2.6,5.15c-1.367,1.4-2.967,2.383-4.8,2.95c-0.633,0.2-1.316,0.333-2.05,0.4c-0.767,0.1-1.3,0.167-1.6,0.2c-4.9,0.367-11.283,0.617-19.15,0.75c-2.434,0.034-4.883,0.067-7.35,0.1h-2.95C38.417,59.117,34.5,59.067,30.3,59c-8.433-0.167-14.05-0.383-16.85-0.65c-0.067-0.033-0.667-0.117-1.8-0.25c-0.9-0.133-1.683-0.283-2.35-0.45c-2.066-0.533-3.783-1.5-5.15-2.9c-1.033-1.067-1.9-2.783-2.6-5.15C1.317,48.867,1.133,48.117,1,47.35L0.8,46.4c-0.133-1.133-0.267-2.55-0.4-4.25C0.133,38.717,0,35.583,0,32.75V26.4c0-2.833,0.133-5.95,0.4-9.35l0.4-4.25c0.167-0.966,0.417-2.05,0.75-3.25c0.7-2.333,1.567-4.033,2.6-5.1c1.367-1.434,2.967-2.434,4.8-3c0.633-0.167,1.333-0.3,2.1-0.4c0.4-0.066,0.917-0.133,1.55-0.2c4.9-0.333,11.283-0.567,19.15-0.7C35.65,0.05,39.083,0,42.05,0L45,0.05c2.467,0,4.933,0.034,7.4,0.1c7.833,0.133,14.2,0.367,19.1,0.7c0.3,0.033,0.833,0.1,1.6,0.2c0.733,0.1,1.417,0.233,2.05,0.4c1.833,0.566,3.434,1.566,4.8,3c1.066,1.066,1.933,2.767,2.6,5.1c0.367,1.2,0.617,2.284,0.75,3.25l0.4,4.25C84,20.45,84.15,23.567,84.15,26.4z M33.3,41.4L56,29.6L33.3,17.75V41.4z"></path>
        <polygon fill-rule="evenodd" clip-rule="evenodd" fill="#FFFFFF" points="33.3,41.4 33.3,17.75 56,29.6"></polygon>
      </svg>
    </div>
  {{/if}}
{{/if}}
```

```js
import Ember from 'ember';

export default Ember.Component.extend({
  provider          : null,
  isDisplayed       : false,
  videoTitle        : null,
  videoId           : null,
  classNames        : [ 'lazyLoad-container' ],
  attributeBindings : [ 'style' ],
  videoThumbnail    : null,

  click: function() {
    this.set('isDisplayed', true);
  },

  videoSrc: Ember.computed('provider', 'videoId', function() {
    var providers = this.get('providers');
    var provider  = this.get('provider');
    var videoId   = this.get('videoId');
    return providers.getUrl(provider, 'embedUrl', videoId, { autoplay: 1 });
  }),

  _getVideoThumbnail: (function() {
    var providers = this.get('providers');
    var provider  = this.get('provider');
    var videoId   = this.get('videoId');
    providers.get(provider).thumbnailUrl(videoId).then(function(res) {
      this.set('videoThumbnail', res);
    }.bind(this));
  }).on('didInsertElement'),

  style: Ember.computed('videoThumbnail', function() {
    var thumbnail = this.get('videoThumbnail');
    return 'background-image: url(' + thumbnail + ') center center no-repeat';
  })
});
```

```css
.lazyLoad-container {
  cursor: pointer;
  width: 100%;
  height: 100%;
  background: black;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  &:hover {
    .lazyLoad-play SVG {
      fill: rgb(206, 19, 18);
    }
  }
}

.lazyLoad-play {
  $width: 85px;
  $height: 60px;
  $marginLeft: $width / -2;
  $marginTop: $height / -2;
  width: $width;
  height: $height;
  margin-left: $marginLeft;
  margin-top: $marginTop;
  cursor: pointer;
  outline: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;
  svg {
    height: 100%;
    width: 100%;
    fill: rgb(31,31,31);
    @include opacity(0.9);
    cursor: pointer;
  }
}
```

With a little bit of CSS to make the play button a little snazzier, we’re done with our dead simple component!

### Where to go from here

I originally started writing this code inside of an Ember.js flavoured [JSBin](http://emberjs.jsbin.com). It’s a great playground to experiment and tinker with ideas before you decide you want to commit to writing something in greater detail.

As you can probably tell, we could refactor the code we’ve written into something more reusable and extendable. For example, we could rewrite it in a way so that adding new providers is easy, and for the ability to customize the kind of event that triggers the display of the embed. We could even abstract it more so that the component lazy loads anything, and not just videos. After experimenting with our idea in the JS Bin and getting a sense of what we want to build, we should also start writing the right tests to confidently be sure that our code does what we intend it to.

> First do it, then do it right, then do it better — Addy Osmani

As always, it’s been a pleasure writing and I hope you’ve enjoyed reading. I’ll be working on making this into a [reusable Ember addon](https://github.com/poteto/ember-lazy-video) over the next week or so in my spare time, I invite you to contribute if you’d like to.

In the next week or two, I’ll be writing about the process for turning a little idea in a JS Bin into a proper well tested Ember addon. Follow me on [twitter](https://twitter.com/sugarpirate_) if you’d like to read more of my ramblings!