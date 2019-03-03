---
title: Declarative Templating in Ember with Composable Helpers
description: >-
  Previously, I mentioned that Ember’s new Helper implementation landed in 1.13.
  In my opinion, helpers are one of the most useful, yet least…
date: '2016-04-21T17:24:46.876Z'
categories: ''
keywords: ''
slug: >-
  /@sugarpirate/declarative-templating-in-ember-with-composable-helpers-a70f01d67165
---

![](https://cdn-images-1.medium.com/max/2560/1*mK8I3vf9Mbr24mrlakaj5g.jpeg)

[Previously](https://emberway.io/route-closure-actions-in-ember-js-d0a7a37a5d1b#.ce4ri08c6), I mentioned that Ember’s new **Helper** implementation landed in [1.13](http://emberjs.com/blog/2015/06/12/ember-1-13-0-released.html#toc_new-ember-js-helper-api). In my opinion, helpers are one of the most useful, yet least talked about features in Ember.

Idiomatic Ember — The Sweet Spot of Performance & Productivity

In my EmberConf 2016 talk on Idiomatic Ember, I spoke about helpers in detail, showing how they can be used to power up and essentially extend [Handlebars](http://handlebarsjs.com/) with custom functionality. These helpers can then be used to allow declarative templating — a style of templating by composing actions, and giving templates more responsibility with regards to presentational logic.

Together with fellow DockYarder [Marten Schilstra](https://twitter.com/Martndemus), we’ve created the [ember-composable-helpers](https://github.com/DockYard/ember-composable-helpers) addon. It’s a package of declarative helpers that lend themselves naturally for composition, and using it can help remove boilerplate code in your app. You can install it today with:

ember install ember-composable-helpers

One of my favorite helpers in the addon is the **pipe** helper (and its closure action cousin, **pipe-action**). This lets you declaratively compose actions in your template, instead of creating many variants in your Component:

This pipe helper was inspired by Elixir’s pipe operator, which lets you write the following:

A(B(C(D(E), "F"), "G"), "H")

As a series of data transforms:

Using the pipe operator, we can naturally express how **E** is passed to the **D** function, then the return value of that function is passed into **C** as its first argument, and so on. I think we can agree that the pipe version is a lot easier to read!

#### If only you knew the power of the Helper

You can think of a helper as a primitive **Keyword** construct used by Ember and HTMLBars to extend the ordinary expressions provided by Handlebars. At its most basic level, the Handlebars library is responsible for compiling the **hbs** language down to HTML:

Ember and HTMLBars then builds on top of this, adding useful keywords like **action**, **mut**, **get**, and **hash**. In fact, all the familiar keywords you’ve been using (everything from **each** to **component**) are [actually HTMLBars helpers under the hood](http://emberjs.com/api/classes/Ember.Templates.helpers.html)!

Ember Helpers operate at a higher level compared to HTMLBars helpers, but can also be used as a way to let you create new keywords in Ember, effectively allowing you to extend templating with custom behavior.

#### It depends

More experienced or conservative developers might see this as a red flag: while making this framework construct available to end-users is useful, it can also open up potential for abuse.

For example, in Elixir, macros can be used to extend the language, but aren’t recommended unless you _really_ need to. In fact, this has been informally codified in the excellent [Metaprogramming Elixir](https://pragprog.com/book/cmelixir/metaprogramming-elixir) book by [Chris McCord](https://twitter.com/chris_mccord) — “Rule 1: Don’t Write Macros”.

Fortunately, helpers aren’t quite as powerful as Elixir macros, and play an important role in the Ember programming model. Unlike a macro, which lets you reach down to the AST, using an Ember helper to extend presentational logic is OK _as long as we don’t abuse it_, and that distinction is where experience comes into play. So use helpers responsibly.

#### Get your logic off my lawn

Some people may feel uneasy using addons containing helpers because of the misconception that it introduces too much logic in their templates, and that they prefer to keep their templates logic-free.

As a best practice, we should strive not to have complicated logic in our templates, and when your sub-expression looks like this:

It’s a sign that you’re better off using a computed property.

On the other hand, keeping your templates 100% logic-free is really hard — you’re likely already using a logical helper like **if/else** or **unless**. It can be easy to lose sight of the fact that the amount of logic in your template lies on a spectrum, and is not a strict dichotomy.

#### Back to the future

ember-composable-helpers doesn’t significantly increase the amount of logic in your templates — in fact, if used correctly, it encapsulates presentational logic within these helpers, and in many cases can help you eliminate now redundant code in your Components or Controllers.

For example, you might have written something like this in your app:

It’s quite common to have “intermediary” CPs in your Component that you then use in some other CP. Using ember-composable-helpers lets you compose that directly in the template, where the intent becomes incredibly clear:

You can think of a composable helper as a kind of computed property macro that you can use and compose directly in your template. And since you can compose sub-expressions in Ember, these can become powerful constructs to reduce boilerplate code in your application.

With that said, remember not to get too carried away with deeply nesting helpers!

#### The Principle of Least Power

Also known as the Rule of Least Power, this principle can be generally applied as:

> Given a choice of solutions, pick the least powerful solution capable of solving your problem. ([source](http://www.lihaoyi.com/post/StrategicScalaStylePrincipleofLeastPower.html#philosophy-principle-of-least-power))

This rule originated in 2006, from a [W3C TAG Finding](https://www.w3.org/2001/tag/doc/leastPower.html) written by Tim Berners-Lee and Noah Mendelsohn.

> Computer Science in the 1960s to 80s spent a lot of effort making languages which were as powerful as possible. Nowadays we have to appreciate the reasons for picking not the most powerful solution but the least powerful. The reason for this is that the less powerful the language, the more you can do with the data stored in that language. If you write it in a simple declarative from, anyone can write a program to analyze it in many ways.

This principle is one of the [core ideas](https://twitter.com/wycats/status/665713741258821633) that drives Ember and its adoption of Handlebars / HTMLBars over something infinitely more complex in the form of React’s JSX.

This principle is the same reason why you wouldn’t write an eval helper and insert arbitrary JavaScript into your templates. You _could_, but _should you?_

#### Exercise best judgment

As with all programming tools, it’s important to exercise best judgment and use them responsibly.

> Just because you can do something doesn’t mean that you should.

A well written view layer means that templates should be as declarative as possible (communicate intent clearly), and not that we should avoid logic altogether. That said, we’re not advocating for moving all your logic into your template — again, it’s not a dichotomy, but a spectrum.

If you’d like to see how the addon is being used, [Katherin Siracusa](https://twitter.com/katherinlaine) wrote an excellent [blog post](https://m.alphasights.com/composable-helpers-and-route-actions-two-ember-add-ons-you-should-know-655cf39fd9de#.y63wvqjpm) about how she uses ember-composable-helpers at [AlphaSights](https://www.alphasights.com):

> This pattern, of performing some significant, data-changing action and subsequently performing a more ancillary, short-term state-like action, keeps arising in our application. Using \[…\] composable-helpers, we can take care of this in a fairly straightforward way, without much duplication and without having to worry about unintended side effects.

You can also join in the discussion on our Slack channel [#e-composable-helpers](https://ember-community-slackin.herokuapp.com/).

As always, thanks for reading!