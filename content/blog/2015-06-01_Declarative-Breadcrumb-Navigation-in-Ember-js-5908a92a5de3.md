---
title: Declarative Breadcrumb Navigation in Ember.js
description: >-
  Breadcrumb navigation isn’t a new concept, in fact, it’s usefulness has been
  endlessly debated about by UX designers all over. Today, I…
date: '2015-06-01T22:48:44.818Z'
categories: ''
keywords: ''
slug: /@sugarpirate/declarative-breadcrumb-navigation-in-ember-js-5908a92a5de3
---

  

[Breadcrumb navigation](http://www.nngroup.com/articles/breadcrumb-navigation-useful/) isn’t a new concept, in fact, it’s usefulness has been endlessly debated about by UX designers all over. Today, I won’t get into the nitty gritty on whether or not your app should include one, but I’d like to share an [addon](https://github.com/poteto/ember-crumbly) I built for a project I’m working on that required it.

This is a simple Component that is placed once in your application, and then generates a dynamic breadcrumb by looking up the current route hierarchy. The addon has a simple declarative API, which makes integration with your app super easy.

Let’s dive in!

I will steal your croissant and eat it. Does anyone even read this caption?

### Demo & Source

![](https://cdn-images-1.medium.com/max/800/1*hWdrtZ948cmcQyeA0OyKiw.png)

One True God

You can take a look at the [demo app](http://development.ember-crumbly-demo.divshot.io) to see ember-crumbly in action. What’s cool about it is how little code it takes to add dynamic breadcrumbs to your app, and how declarative it is. The source is on GitHub, as always.

[**poteto/ember-crumbly**  
_ember-crumbly - Declarative breadcrumb navigation for Ember apps_github.com](https://github.com/poteto/ember-crumbly "https://github.com/poteto/ember-crumbly")[](https://github.com/poteto/ember-crumbly)

P.S. Why is my face the thumbnail? 😐

### The idea

We work on many Ember apps at [DockYard](https://dockyard.com/), and one particular client’s project I was working on called for a very dynamic breadcrumb type UI that would respond to changes in the route and model. Before I started actually implementing it, I sketched my plan on paper to see if I could make it nice and declarative instead of manually setting the breadcrumb on each of those route templates.

#### The Ember Container and currentRouteName

The Component relies mainly on Ember’s container and the current route name. On a high level, the Component is injected with the Application Controller’s **currentRouteName** prop, then looks up the appropriate route in the Container to check if it has a **breadCrumb** prop defined. If it does, we display whatever the POJO is, or else we show its route name in the Component.

### Intended usage

The goal was to have an API as declarative as the following:

{{bread-crumbs linkable=true outputStyle="foundation"}}

And the route:

// foo/route.js

export default Ember.Route.extend({  
  breadCrumb: {  
    title: 'Animals'  
  }  
});

We wanted to be able to pass in our own template block too:

{{#bread-crumbs linkable=true as |component route|}}  
  {{#if route.title}}  
    {{route.title}}  
  {{else}}  
    {{route.foo}} ({{route.bar}}) ... {{route.baz}}   
  {{/if}}  
{{/bread-crumbs}}

Let’s see how we can write a component that does just that using some of Ember’s new features.

### Injecting the Application Controller

I’ve explained how we inject things in other posts, so I won’t go into detail for the initializer. Ember adds the [currentRouteName and currentPath to the Application Controller](http://guides.emberjs.com/v1.10.0/understanding-ember/debugging/#toc_get-current-route-name-path), so we’ll inject it into our Component so we can extract it.

### Declaring your variables

We typically declare our variables and functions used at the top of each file, to make code easier to read and refactor in the future. For ember-crumbly’s **bread-crumbs** component, we’re using the usual suspects:

You might be wondering why we declare **const get = Ember.get;** by itself on line 4 — currently there are issues with destructuring **{ get }** and [bugs in Esprima](https://github.com/dockyard/ember-suave/issues/5), so we do it by itself as temporary workaround.

### Component props

Here we set a bunch of default props for the component.

We’ve injected the Application Controller into the component in our initializer, so getting the current route’s name is as simple as setting a computed property macro. We make it [**readOnly**](http://emberjs.com/api/classes/Ember.ComputedProperty.html#method_readOnly) so we don’t set it by accident.

### Computing the route hierarchy

Ember’s **currentRouteName** prop returns the current route hierarchy separated by periods. For example, if you were on /foo/bar/baz, your route would probably be something like ‘**foo.bar.baz.index’**. Knowing this, the goal would be to split the string by the period, and then working out the route name for each of its parts. With the correct route name, we can then lookup the route on the container and extract the breadCrumb POJO we need for our bread-crumb.

You’ll notice straight away that we’re using new Ember computed property syntax here. The new syntax allows you to set both getters and setters on your CP, instead of checking argument length like you used to have to do.

### Figuring out the route name

First, we split the **currentRouteName** string into an array, and then filter out any **index** routes. This is because the string splits into an array with all the parts, so foo/bar/baz would yield **\[ ‘foo’, ‘bar’, ‘baz’, ‘index’ \]**, while we only want the first 3.

Now with the array of parts, we need to piece them together again bit by bit to reconstruct their constituent routes.

### Looking up the route on the container

In here, we:

1.  Map over the filtered route names individually
2.  Reconstruct the route name by slicing the original array of route names with the [right **end** argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)
3.  Look the reconstructed route name up on the container
4.  Retrieve the breadCrumb POJO, add props to it, and return an Ember Array that our component can iterate over in its template

#### Reconstructing the route name

Each time map runs in the previous method, we get a single piece of the route name, e.g. **bar**. We know that its correct route name is **foo.bar**, so we can slice the original array with the [map’s **index** argument](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Syntax) to piece those bits together. When we start with the first piece (**foo**), we know that we need to look up **foo.index** so that we can generate the correct link-to, so we check for that.

Now that we have the correct route name for each path, we can look up the actual route object on the Container while we map over the filtered route names.

#### Looking up the route on the Container

The Ember Container (basically how Ember keeps track of all its different objects) isn’t well documented because it is originally intended to be private API. However, many addons and apps make use of it to do certain things, and this one is no exception. There is an [RFC on the table](https://github.com/emberjs/rfcs/pull/46) with reforming the Registry and Container, so this might have to be changed in the future. For now, we can still get the Container from the Component, and then use its **lookup(‘type:name’)** method to find the route.

#### Extracting the breadCrumb POJO

With the route object in hand, we can then easily extract the breadCrumb POJO we define on our routes.

In certain scenarios, you might want to opt-out of displaying a specific route in the breadcrumb. We allow that by setting **breadCrumb: null** inside of that route. If no breadCrumb POJO is found, we set the title to be the route’s capitalized name by default, and if we do find one, we simply add the path and linkable keys to it.

Finally, we return an [Ember Array](http://emberjs.com/api/classes/Ember.html#method_A) so that the resulting array is iterable in the template, and filter out any undefined breadcrumbs.

With the logic done, let’s look at our somewhat complicated template to handle all the different uses!

### Yo dawg, I heard you like conditional logic in your templates

Because we want to handle both the inline and block form of the Component, as well as the ability to make each route linkable, the template does get a little ugly. Fortunately, this is still manageable and is hidden from our consuming users, so that’s our problem.

And that’s done!

### Thanks for reading!

This has been yet another long post, I hope I’ve managed to explain my ideas well and maybe show you a new thing or two about Ember.

Until next time,

[Lauren](https://twitter.com/sugarpirate_) / [_DockYard_](http://www.dockyard.com)