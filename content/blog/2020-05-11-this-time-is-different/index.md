---
title: "This Time Is Different"
kind: post
description: >-
  This time is different. "Clean slate. Solid foundations. This time I will build things the right way."
date: "2020-05-12T00:17:26.935Z"
categories:
  - engineering
keywords:
  - rewrites
  - perfection
  - hard problems
published: true
cover: ./jr-korpa-xOW_W2vsuk8-unsplash-optimized.jpg
coverAuthor: korpa
coverOriginalUrl: https://unsplash.com/photos/xOW_W2vsuk8
---

This time is different. "Clean slate. Solid foundations. This time I will build things the right way."

[![The Life of a Software Engineer, by Manu Cornet](./2011.11.15_building_software.png)](https://bonkersworld.net/building-software)

I used to be obsessed with "best practices". I wanted to write code that would stand the test of time. Code that was objectively ideal. Everything had to be functional, pure, composable, and perfectly extensible. The fact that my programming idols on Twitter said it was good was convincing enough. Who was I to question them? There was a sense I had that if I wrote it well enough and adopted the right patterns and libraries, that my project would be set for life.

At one point I even gathered enough hubris to speak about writing [Idiomatic Code](https://speakerdeck.com/poteto/emberconf-2016-idiomatic-ember-finding-the-sweet-spot-of-performance-and-productivity), lecturing others on ways they could future proof their codebases today. Embarassingly for me, these solutions never landed in the next version of the framework. Idiomatic indeed.

### Best practice today, anti-pattern tomorrow

As I gained experience working on more projects, I started to question the dogma I accepted without question. If I had to identify the turning point, it was when I first started learning a new programming language, Elixir. Up to that point, Ruby and JavaScript were the tools I knew best. It turns out that there's truth behind Maslow's Hammer--"I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail." In the same way, when you learn new concepts like functional programming for the first time, it's only natural to start seeing patterns in your codebase that could be cleaned up and optimized with your newfound knowledge. The same could be said for PRs on GitHub that "refactor" function declarations into arrow function expressions. It's not always better because it's shorter!

Learning a new language that was unlike anything I had used before was humbling. I struggled for hours trying to understand pattern matching. Variable declarations are one of the first things you learn as a total beginner in any programming language. Yet here I was struggling to understand it, despite having done this for a few years.

It forced me to expand my perspective on different techniques and an appreciation for why they were used. Almost everything has a use. Finding a satisfying solution that is always better in 100% of use cases is exceedingly rare. As much as I enjoyed the functional nature of Elixir and  recursing everywhere, I realized that some things are more efficiently solved with a good old `for` loop. Both techniques have their place.

https://twitter.com/potetotes/status/1256254398121955328

I've picked up more languages and tools since then, but the humbling lessons don't stop. Paradoxically, the more I know, the less I understand.

We often look to proxies like Twitter follower counts, stars on GitHub, and loudness of voice to tell us what we should do next. That's fair--sometimes, you just want to get your job done. Software is still a relatively young industry, and it seems to change rapidly. That often is overwhelming. But I've learned that starting from the default of thinking that this must be good because someone famous said so is a flawed foundation. Consider the problem you're trying to solve, the opportunity cost of going with this solution instead of another, and the tradeoffs your team is comfortable making. Dealing with ambiguity and making tradeoffs is part of the job. A worse trap to fall into is taking best practices at face value and applying that everywhere across your code without further consideration.

More importantly, realize that whatever you decide to go with today will likely [change](https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to) in the long term. If your project even lasts that long. And that's okay. 

### This time is no different

I learn from many random sources on the internet. One source I find myself going back to often are videos about cooking. There's something magical about watching people make things. And I like to eat.

When I first watched [Jiro Dreams of Sushi](https://www.netflix.com/title/70181716) almost 10 years ago, I didn't understand what drove Ono. His obsession with perfection seemed pointless. Surely at some point, after decades of making sushi, there would be nothing left to perfect.

I've come to realize that perfection is not a destination. It's an incremental journey, process, or whatever you want to call it. Whether it's today's project, or a project I'll work on next year, every piece of software is the [same, only different](http://st.japantimes.co.jp/english_news/essay/2012/ey20120203/ey20120203main.htm?print=noframe). Put another way, something that works well on one project might not yield the same results in another.

Instead of seeing code as an unchanging structure, like a building, think of your software as a living thing. Every project changes and grows over time. The people who work on it come and go. The people who use your software also change. Like things that constantly change, software is never finished. It just gets released (hopefully continuously).

> "We are simply never going to realize a state of software nirvana where everything is supremely satisfying. That’s an important emotional realization. The fundamental reward of an improvement process is the experience of betterment, not some mythical destination." - [Mark Slee](http://mcslee.com/)

I suppose there's a certain zen of software engineering that comes with experience that is hard to learn without the scars to prove it. So go forth, make those mistakes, and find peace with yourself. And the next time, it'll be different :)

---

This blog post was inspired by this [writing](https://engineering.fb.com/uncategorized/thoughts-on-software-quality/) from Mark Slee. It was written 10 years ago, but it's still excellent. Highly recommended.
