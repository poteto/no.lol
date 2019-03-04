---
title: Rise From the Ashes — Incremental APIs With Phoenix
description: >-
  Much has been said about the Elixir language and the Phoenix framework
  —Phoenix’s performance without compromise makes it a compelling…
date: '2016-08-12T17:26:46.769Z'
categories: ''
keywords: ''
slug: /@sugarpirate/rise-from-the-ashes-incremental-apis-with-phoenix-b08cd66bd142
---

![](https://cdn-images-1.medium.com/max/2560/1*9mWCn3ndLnXnhzydvWqfpA.jpeg)

via [unsplash](https://unsplash.com/?photo=Rdsc2L517iQ)

Much has been said about the [Elixir](http://elixir-lang.org/) language and the [Phoenix framework](http://www.phoenixframework.org/) —Phoenix’s [performance](http://www.phoenixframework.org/blog/the-road-to-2-million-websocket-connections) [without compromise](https://dockyard.com/blog/2015/11/18/phoenix-is-not-rails) makes it a compelling choice in a world where problems are increasingly concurrent and [real-time](https://dockyard.com/blog/2016/08/09/phoenix-channels-vs-rails-action-cable).

Despite Phoenix’s attractiveness, chances are you have business requirements that disallow you from dropping work on existing APIs that still need to be supported. And so you might consider Phoenix no longer viable, and dismiss it to your ever-growing list of shiny toys to check out — _someday._

What if we could incrementally replace our legacy API with Phoenix, one endpoint at a time? We could make a compelling argument by showcasing performance and maintainability gains, without committing to a rewrite.

In science fiction (and perhaps someday reality), transforming an uninhabitable planet into an inhabitable one is known as _“_[_terraforming_](https://en.wikipedia.org/wiki/Terraforming)_”_, or literally “Earth-shaping”. It’s an apt metaphor for a little [plug](https://github.com/elixir-lang/plug) I co-authored with [Dan McClain](https://twitter.com/_danmcclain).

[**poteto/terraform**
_terraform - A plug for incrementally transforming an API into Phoenix_github.com](https://github.com/poteto/terraform "https://github.com/poteto/terraform")[](https://github.com/poteto/terraform)

Using Terraform, you can create a Phoenix app that handles one or more endpoints, and forward un-handled requests to your legacy API. If some network latency is not a significant issue, you might find this plug useful.

#### Discovery

The basic idea is this — if a route is defined on our Phoenix app, we’ll handle the request. If it’s not, we forward the request on, and send its response back to the user.

In your Phoenix app, every incoming connection goes through a pipeline that you can readily examine at `lib/my_app/endpoint.ex`. You can see how a connection flows through the different plugs specified in this file. The connection is then piped into the router:

```elixir
# web/router.ex
defmodule MyApp.Router do
  use Terraform, terraformer: MyApp.Terraformers.LegacyApi

  # ...
end
```

Add Terraform to your router

#### Terraforming the legacy API

By adding the Terraform plug to your router, it will then re-route those missing route connections to a plug that you define. And because this plug uses [**Plug.Router**](https://hexdocs.pm/plug/Plug.Router.html), you have an elegant DSL in which you can handle them:

```elixir
# terraformers/foo.ex
defmodule MyApp.Terraformers.Foo do
  use Plug.Router

  plug :match
  plug :dispatch

  get "/v1/hello-world", do: send_resp(conn, 200, "Hello world")
  get _, do: send_resp(conn, 200, "Handle all GETs")

  options _, do: send_resp(conn, 200, "Handle all OPTIONs")
  delete  _, do: send_resp(conn, 200, "Handle all DELETEs")
  patch   _, do: send_resp(conn, 200, "Handle all PATCHs")
  post    _, do: send_resp(conn, 200, "Handle all POSTs")
  put     _, do: send_resp(conn, 200, "Handle all PUTs")

  match "/weird/api", via: :eat, do: send_resp(conn, 200, "eat it")
end
```

Write a Terraformer to forward requests

Basic example aside, we’d probably want to do an actual request on your API, and you can do so by writing a client for it. There are [many ways](https://github.com/h4cc/awesome-elixir#third-party-apis) to do it, and I’ve had success in doing so with [HTTPoison](https://github.com/edgurgel/httpoison) and its [Base](https://hexdocs.pm/httpoison/HTTPoison.Base.html) module. For example:

```elixir
defmodule MyApp.Terraformers.LegacyApi do
  alias MyApp.Clients.LegacyApi
  use Plug.Router

  plug :match
  plug :dispatch

  get _ do
    %{method: "GET", request_path: request_path, params: params, req_headers: req_headers} = conn
    res = LegacyApi.get!(request_path, req_headers, [params: Map.to_list(params)])
    send_response({:ok, conn, res})
  end

  def send_response({:ok, conn, %{headers: headers, status_code: status_code, body: body}}) do
    conn = %{conn | resp_headers: headers}
    send_resp(conn, status_code, body)
  end
end
```

Use a client for your legacy API

And here is what a client might look like:

```elixir
# Example taken from https://github.com/edgurgel/httpoison
defmodule GitHub do
  use HTTPoison.Base

  @expected_fields ~w(
    login id avatar_url gravatar_id url html_url followers_url
    following_url gists_url starred_url subscriptions_url
    organizations_url repos_url events_url received_events_url type
    site_admin name company blog location email hireable bio
    public_repos public_gists followers following created_at updated_at
  )

  def process_url(url) do
    "https://api.github.com" <> url
  end

  def process_response_body(body) do
    body
    |> Poison.decode!
    |> Map.take(@expected_fields)
    |> Enum.map(fn({k, v}) -> {String.to_atom(k), v} end)
  end
end
```

GitHub client example written with HTTPoison

This forwards all un-handled GETs to our legacy API via our client, and sends the response back with the right headers as well. Since this is just a plug, you have access to the connection, so you can easily handle things like sessions and auth as well.

#### What about performance?

I ran some unscientific benchmarks on my 2014 13" MBP, and the results between the route backed by a Phoenix controller and our Terraform handler were insignificant.

```
# Route handled by Terraform
$ siege -c 255 -r 40 -b http://localhost:4000/v1/hello-world

Transactions:             10200 hits
Availability:             100.00 %
Elapsed time:             13.59 secs
Data transferred:         0.11 MB
Response time:            0.32 secs
Transaction rate:         750.55 trans/sec
Throughput:               0.01 MB/sec
Concurrency:              241.40
Successful transactions:  10200
Failed transactions:      0
Longest transaction:      0.79
Shortest transaction:     0.03

# Route handled by FooController
$ siege -c 255 -r 40 -b http://localhost:4000/v1/foo

Transactions:             10137 hits
Availability:             99.38 %
Elapsed time:             16.85 secs
Data transferred:         0.03 MB
Response time:            0.39 secs
Transaction rate:         601.60 trans/sec
Throughput:               0.00 MB/sec
Concurrency:              235.74
Successful transactions:  10137
Failed transactions:      63
Longest transaction:      1.03
Shortest transaction:     0.04
```

This was done via [Siege](https://github.com/JoeDog/siege), with 255 concurrent connections doing 40 parallel requests each. That said, there will obviously be additional latency from having the Phoenix app send and return responses from your older API, so use your best judgement.

#### Give it a spin

Is [Phoenix](https://pragprog.com/book/phoenix/programming-phoenix) as productive, reliable, and fast as many claim? With Terraform, trying out Phoenix on your current API is almost risk-free. Handle a single, simple endpoint and compare it with the performance and developer experience of your current stack. You can also view a [simple demo of Terraform in action here](https://github.com/poteto/reverse_proxy).

Thanks for reading, and see you at [ElixirConf](http://elixirconf.com/)!