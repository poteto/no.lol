---
title: Applying the Adapter Pattern for Analytics in Ember.js Apps
description: >-
  At DockYard, most (if not all) Ember apps we build for our clients require
  analytics in some form or other. For many of these apps…
date: '2015-08-07T18:12:11.856Z'
categories: ''
keywords: ''
slug: >-
  /@sugarpirate/applying-the-adapter-pattern-for-analytics-in-ember-js-apps-29448cbcedf3
---

  

At [DockYard](https://dockyard.com/), most (if not all) Ember apps we build for our clients require analytics in some form or other. For many of these apps, including the Google Analytics tracking script is sufficient. However, we’ve begun to notice an increased interest in other services such as Mixpanel or Kissmetrics for more data minded clients.

Including multiple services (typically we see about 3–5 different analytics in use) with different APIs leads to code duplication, which is less than ideal and generally a maintenance nightmare. I don’t know about you, but deleting repetitive code is one of my favorite things to do — so [Michael](https://twitter.com/michaeldupuisjr) and I set out to build an Ember addon that would apply the adapter pattern to analytics.

In this post, we’ll explore what the adapter pattern is, what it gives us, and demonstrate how to implement it to enable one API for orchestrating multiple analytics services.

### Introducing the ember-metrics addon

To install the addon:

$ ember install ember-metrics

You can also find the source below.

[**poteto/ember-metrics**  
_ember-metrics - Send data to multiple analytics integrations without re-implementing new API_github.com](https://github.com/poteto/ember-metrics)[](https://github.com/poteto/ember-metrics)

The [ember-metrics](https://github.com/poteto/ember-metrics) addon adds a simple metrics service and customized _LinkComponent_ to your app that makes it simple to send data to multiple analytics services without having to implement a new API each time.

Using this addon, you can easily use bundled adapters for various analytics services, and one API to track events, page views, and more. When you decide to add another analytics service to your stack, all you need to do is add it to your configuration, and that’s it.

With this addon, we wanted to make it super simple to write your own adapters for other analytics services too, so we set out to make it extensible and easily tested.

### What is the Adapter Pattern?

![](https://cdn-images-1.medium.com/max/600/1*Xbv2WHCJHwA0u4AgMN4TAA.jpeg)

I heard you like adapters

In a broad sense, the [adapter pattern](https://sourcemaking.com/design_patterns/adapter) is about _adapting_ between class and objects. Like its real world counterpart, the _adapter_ is used as an interface, or bridge, between two objects.

In the case of analytics, this is an excellent pattern for us to implement, because these services all have different APIs, but very similar _intent._ For example, to send an event to Google Analytics, you would use the _analytics.js_ library like so:

While in Mixpanel, you would track the same event like this:

And with Kissmetrics:

As you can probably tell, this gets repetitive really quickly, and becomes hard to maintain when your boss or client wants to update something as simple as the event name across these services.

### Applying the Adapter Pattern

![](https://cdn-images-1.medium.com/max/400/1*vhzVNLqZGOIHm-8UWW8UKQ.png)

Diagram from [https://sourcemaking.com/design\_patterns/adapter](https://sourcemaking.com/design_patterns/adapter)

We generally have a few players in the adapter pattern: the client, the adapter (or wrapper), and the adaptee.

For ember-metrics, the client is our Ember.Service, the adapter is the adapter created for each analytics service, and the adaptee is the analytics library’s API.

Each analytics service has its own adapter that implements a standard contract to impedance match the analytics library’s API to the Ember.Service that is responsible for conducting all of the analytics in unison.

### Using ember-metrics

The addon is first setup by configuring it in _config/environment_, then injected into any Object registered in the container that you wish to track.

Then, you can call a _trackPage_ event across all your analytics services like so, using the _metrics_ service:

If you wish to only call a single service, just specify its name as the first argument:

This is clearly a much cleaner implementation, as we can now use one API to invoke across all services we want to use in our app.

### Implementing the Adapter Pattern in ember-metrics

The service _metrics_ is the heart of the addon, and is responsible for orchestrating event tracking across all analytics that have been activated.

#### Setting up addon configuration

A simple pattern for passing configuration from the consuming app’s _config/environment_ to the addon is through an initializer:

This lets us access the configuration POJO from within the metrics service by retrieving the _metricsAdapter_ property when the service is created.

With the retrieved configuration, we then call the service’s _activateAdapters_ method in order to retrieve the adapter(s) from the addon or locally, then caching them in the service so they can be looked up later easily.

Activating an adapter simply calls _create_ on the looked up adapter (which inherits from _Ember.Object_) and passes along any analytics specific configuration such as API keys.

Because we’ve also implemented caching, we can safely call _activateAdapters_ without having to re-instantiate already activated adapters, which allows us to defer the initialization of these analytics if (for example) we need to dynamically retrieve a property from one of our models:

#### Leveraging the container and resolver

Then, leveraging the Ember container and conventions around the [ember-resolver](https://github.com/ember-cli/ember-resolver), we can lookup adapters from the addon first, and then fallback to locally created adapters.

This is done through looking up the adapter factory with _container.lookupFactory_, and passing in the correct name that the resolver can understand. For example, we can look up adapters from the addon by using the following lookup pattern:

name-space?@folder-name:file-name

Where _name-space_ (and the following @ symbol) is optional, if looking up from within the app. One thing to note is that the ‘folder name’ is usually determined by the singular form. For example, you would lookup the metrics service from the container like so:

const metricsInstance = container.lookup('ember-metrics@service:metrics');

If you’re wondering how the resolver maps this string to the actual files, you only need to type _requirejs.entries_ into the developer console while in an Ember app. This returns all the entries that have been exported by requirejs. For example, here are some of the entries from the [DockYard](https://dockyard.com) website:

![](https://cdn-images-1.medium.com/max/800/1*HNDb0QB6R_FvAiyRad6IpA.png)

To lookup the _ember-wormhole_ component class from the application container, you would use:

container.lookupFactory('ember-wormhole@component:ember-wormhole');

…which returns what you’d expect.

![](https://cdn-images-1.medium.com/max/800/1*lmCVU_Bqdzx7d7fvG0dzfg.png)

#### Invoking adapter methods from the service

Now that our service can access both local and addon adapters, we can invoke methods across activated adapters like so:

### Creating Adapters for the Addon

With the service implemented, we can now create a base adapter class that all adapters extend from:

This is mainly so we can assert that the adapter’s _init_ and _willDestroy_ hooks are implemented, and to give it a nicer output in the console through overriding the _toString_ function.

If you’re not already familiar with the Ember Object model, the _init_ method is called whenever an _Ember.Object_ is instantiated through _Ember.Object.create()._

We can thus rely on this knowledge that _init_ will always be called on object instantiation to pass in configuration to the analytics, and to call its setup. Typically, an analytics service will create a script tag through JavaScript, and asynchronously load its library from some CDN.

Here’s the Google Analytics adapter that’s bundled with the addon:

#### Enhancing the developer experience with blueprints

One of my favorite parts of ember-cli are its generators. Using blueprints, we can easily extend the cli commands to generate new metrics adapters using:

$ ember generate metrics-adapter foo-bar

This creates _app/metrics-adapters/foo-bar.js_ and a unit test at _tests/unit/metrics-adapters/foo-bar-test.js._ You can take a closer look at these blueprints [here](https://github.com/poteto/ember-metrics/tree/0.1.2/blueprints).

With these conventions in place, it’s now trivial for consuming app developers to add new adapters to work along side bundled adapters. And when they feel that an adapter they’ve built is ready to be shared with the community, they only need open a pull request to have that adapter included in the addon.

At some point in the future, it would make sense for each adapter to have its own repo and npm module, but to keep things simple, we’ve placed them within the addon.

### Thanks for reading!

I hope you’ve learned something about addon creation and the adapter pattern. As always, please direct any comments or criticism to [@sugarpirate\_](https://twitter.com/sugarpirate_).

Until next time,

Lauren