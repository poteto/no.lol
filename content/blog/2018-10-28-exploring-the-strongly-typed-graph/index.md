---
title: Exploring the Strongly Typed Graph
description: >-
  The “Strongly Typed Graph” is something I’ve been thinking about lately. I
  believe it could significantly improve developer productivity in…
date: '2018-10-28T01:53:04.094Z'
categories:
  - engineering
keywords:
  - graphql
  - microservices
slug: /@sugarpirate/exploring-the-strongly-typed-graph-31fc27512326
cover: ./benjamin-hung-340383-unsplash.jpg
coverAuthor: Benjamin Hung
coverOriginalUrl: https://unsplash.com/photos/m7q5iX4L7vQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
---

The “Strongly Typed Graph” is something I’ve been thinking about lately. I believe it could significantly improve developer productivity in large, microservice heavy organizations.

To be clear, this is still an exploration. An early idea I wanted to throw out there. But before I dive into what it is and what it could solve, let me give you some context about our problem, and why I think this idea is compelling.

_⚠️ Warning_: It may not solve the exact problem that you have. Read more and decide for yourself, this is not a silver bullet or a “best practice”.

👩🏻‍💻 I assume some basic knowledge of [gRPC](https://grpc.io/)/[Thrift](https://thrift.apache.org/), [GraphQL](https://graphql.org/) and [TypeScript](https://www.typescriptlang.org/)/[Flow](https://flow.org/).

### Move fast and learn things

I currently work in a large, microservice heavy organization. Microservices have worked well for us given our loosely coupled org structure. We optimize for rapid learning and innovation in our respective business sub-domains. The larger domain being entertainment, for content creation at scale. Think creating thousands of high quality shows (movies and TV series) a year, across domains such as financing, production, business/legal obligations, casting/staffing of productions, and more.

![](https://cdn-images-1.medium.com/max/800/1*II3IKcf1BWtrT6cmbdSfJg.png)

“Organizations which design systems … are constrained to produce designs which are copies of the communication structures of these organizations.” — M. Conway

We moved fast, building a core set of applications in a few years. But, these applications were silos, and disconnected from each other. We would update something in one, and wonder why it wasn’t updated in the other.

This was the price of moving fast and breaking things. It was impossible at the time to understand what the larger domain was. In hindsight, these connections are obvious. But in the beginning, it was like foraging for a random selection of mushrooms in a forest. Only to later discover that they all share [deep, interconnected roots](https://www.scientificamerican.com/article/strange-but-true-largest-organism-is-fungus/).

### Everything is a graph

Creating content is a creative process, and made possible by the collaboration of different business units. Creating a new show is like creating a startup. You worry about where the money is going to come from. Who’s the CEO and COO? Is the business model sound? How will we hire people to do the work?

In entertainment, it’s the same questions. How we will finance the show? Who will be the showrunner (for TV), or director (for movies)? Is the script any good? How will we cast actors and actresses, and hire the best grips, editors, camera operators, and more?

In moving fast, we were also able to learn fast. We learned that these sub-domains made up a larger graph. And that we needed to connect them together to truly push the business forward.

![](https://cdn-images-1.medium.com/max/600/1*lsQ-lcLu2J080Ym1dpy-tw.png)

Example graph from neo4j movie dataset

### Move fast and grow the network

We needed to ensure our data was consistent across domains, but allow teams to independently evolve their sub-domains. The challenge–the tension between correctness and productivity that is difficult to balance, especially in large organizations.

We want teams to be able to accelerate their rate of innovation, but in a way that makes the collective network stronger.

#### End-to-end type coverage

The idea of end-to-end type coverage is simple and compelling. It is the combination of strongly typed technologies such as gRPC/Thrift, GraphQL, and TypeScript/Flow across the stack, from backend to frontend. If you’re interested in learning more about type systems, check out my talk below at [React Rally 2018](https://youtu.be/y3uXazpAdwo).

My talk about type systems in JavaScript

Type systems are not new inventions. You may have used a strongly typed language like Java, C#, Go, Rust, and more. The static type systems you’re familiar with give you compile time guarantees. They guarantee that the code _you_ have written is type safe. They don’t guarantee that the services you _depend on_ are type safe.

In other words, they can’t provide any runtime type guarantees (not the same as runtime type checking). You may trust that some JSON has _foo, bar_, and _baz_ defined, but an external service could return otherwise. A [TypeScript library](https://github.com/gcanti/io-ts) ([_io-ts_](https://github.com/gcanti/io-ts) by the amazing [gcanti](https://medium.com/u/bde030ef1bdb)) does exist for a runtime type system, interestingly enough.

io-ts aside, having end-to-end type coverage won’t provide any runtime type guarantees. Services can and will fail in ways you don’t expect. An end-to-end type system is not meant to give you type safety at runtime boundaries, but it enhances type safety for dependencies at compile time.

Picture this. You’re at your editor, coding up a storm for a new client-side UI. A VS Code extension allows you to hook up to any GraphQL endpoint, and immediately receive type information. Because it’s subscribed to the endpoint, it can also alert you when fields you’re using break (their type changes, or they’re removed/deprecated). In real time.

### Highly Aligned, Loosely Coupled

The “Strongly Typed Graph” builds upon end-to-end type coverage and connects diverse domains into a single graph. It gives teams near real-time visibility of how changes in the larger graph affect your entire organization. As a reminder, this architecture is still only an exploration!

![](https://cdn-images-1.medium.com/max/800/1*Y140aFlCjLSsU0iZQvYpLA.png)

Architecture for the Strongly Typed Graph

What’s exciting about this are just some of the possibilities at various levels in the organization:

*   autocompletion in your editor/IDE while building client UIs. See new fields “come online” as other teams evolve the graph, right in your editor
*   understanding how long using a field in the graph will impact your page load time
*   pull request feedback when a change in your schema is going to break clients of that data
*   email/slack notifications when field(s) you rely on become deprecated or changed in a breaking fashion (type change or removal)
*   transform/map low level IDLs to product facing GraphQL schemas
*   visibility into how the larger graph evolves over time
*   (not in the diagram) orchestrate distributed writes across multiple systems

There are a few major pieces to this proposed architecture. The two I want to highlight are the schema registry, and the domain graph itself.

#### Schema registry

The schema registry stores and handles the analysis of GraphQL SDLs (Schema Definition Language). Microservices push their schema changes to the registry before deployment. The registry tracks how schemas change over time and alerts users of specific fields whenever there are deprecations or removals. These alerts can surface through various hooks, for example in GitHub/Bitbucket pull requests, emails, Slack notifications, and more.

If you rely on a field from the domain graph, you should receive an alert if it’s deprecated or removed. You should also receive an alert when you make a change that will break clients.

#### Domain graph

The domain graph retrieves GraphQL SDLs from the schema registry, and stitches them together. Incoming requests include client metadata, so we can track field usage on a per client basis. Reads/writes should passthrough to the respective microservice. Being a single access point, this service must be highly available.

### How does this work in practice?

The goal is to improve correctness and productivity across a large organization. Tooling still needs to be built, but some of these things (such as schema management) are already being worked on by [Apollo](https://apollographql.com). For example, [Apollo Engine](https://www.apollographql.com/engine) is a SaaS that they’re building that gives insights into performance, schema validation and so forth.

I haven’t seen this topic discussed heavily yet, so it’s still pretty early in the adoption curve. This is a [video](https://www.youtube.com/watch?v=S93i9wuZRhA) that discusses the idea of an end-to-end type system. It’s one of the only resources on this topic I’ve found so far.

If you are building something similar, I would love to hear more about your experience.

Thanks for reading!