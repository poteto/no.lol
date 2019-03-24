---
title: Ember – Simple text search computed property macro
description: >-
  Every now and then, you want to let your users quickly search for records that
  you’ve already loaded into your store. We can easily…
date: '2014-11-19T10:48:11.952Z'
categories:
  - engineering
keywords:
  - emberjs
  - computed property macros
  - search
published: true
cover: ./philip-swinburn-60229-unsplash.jpg
coverAuthor: Philip Swinburn
coverOriginalUrl: https://unsplash.com/photos/vS7LVkPyXJU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

Every now and then, you want to let your users quickly search for records that you’ve already loaded into your store. We can easily implement naïve search using Ember’s [Array#filter](http://emberjs.com/api/classes/Ember.Array.html#method_filter) and native String prototype methods, but let’s go a little step further and create a custom computed property macro (CPM) that wraps the search so we can easily drop it into other properties.

Source: [Unsplash](https://unsplash.com/photos/IClZBVw5W5A/) | By Todd Quackenbush

### Demo

![](https://cdn-images-1.medium.com/max/800/1*LObyCCcVsFUPWE5VJ5gAwg.gif)

[JSBin](http://emberjs.jsbin.com/piyoba/1/edit?html,js,output)

### The search macro

```js:title=utils/computed/search.js
import Ember from 'ember';
var computed = Ember.computed;

export default function search(dependentKey, propertyKey, searchQueryKey, returnEmptyArray) {
  returnEmptyArray = (typeof returnEmptyArray === "undefined") ? false : returnEmptyArray;
  return computed("" + dependentKey + ".@each." + propertyKey, searchQueryKey, function() {
    var items, query;
    if (returnEmptyArray && !this.get(searchQueryKey)) {
      return Ember.A([]);
    }

    query = this.get(searchQueryKey) || '';
    query = query.toLowerCase();
    items = this.get(dependentKey) || Ember.A([]);

    return items.filter(function(item) {
      if (item.get(propertyKey)) {
        return item.get(propertyKey).toLowerCase().indexOf(query) !== -1;
      }
    });
  });
}
```

Our search macro returns an outer function (line#5) that takes 4 arguments, a `dependentKey`,  a `propertyKey`,  a `searchQueryKey` and a `returnEmptyArray` argument.

The `dependentKey` (e.g. users)  and `propertyKey` (e.g. ‘fullName’)  relates to the array we want to search through. We specify a `searchQueryKey` so that we can update the results of our macro when the search term changes. The last argument is optional, and isn’t critical – it returns an empty array (line#9) if no query is entered.

The outer function returns an inner function (line#7), which is actually just an `Ember.computed` property that observes the properties we specified in the outer function. If this syntax seems unusual to you, it uses the [alternate invocation](http://emberjs.com/guides/object-model/computed-properties/#toc_alternate-invocation) and not the function prototype method.

Using the special key [`@each`](http://emberjs.com/guides/object-model/computed-properties-and-aggregate-data/), we can make sure that Ember observes the `propertyKey` on each item in our array so that it can search through it correctly.

Finally, after slightly massaging the inputs (lines#13–15), we just return the filtered array (line#17) using [String.prototype.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf). While this search is naïve and probably won’t perform too well on large datasets, with our computed property macro it is very easy to implement something more efficient.

### Using the computed property macro

Now we can very quickly and easily drop in text search on any of our controllers or components:

```js
import computedSearch from '../utils/computed/search';

export default Ember.ArrayController.extend({
  searchQuery:   null,
  searchResults: computedSearch('model', 'fullName', 'searchQuery')
});
```

By simply binding `searchQuery` to the value of any input or textarea, we’re able to drop in live search on data in the store very easily.

It’s a good idea to have a look at your application to see if you find yourself repeating bits of functionality, and create custom property macros so you can move shared logic into one place. This DRYs up your code and makes it much more testable, which is probably a good thing.

Thanks for reading!