import gleam/dynamic/decode
import gleam/http
import gleam/http/request
import gleam/http/response
import gleam/int
import gleam/json
import lustre/effect.{type Effect}
import rsvp

import grindsheet/parse
import grindsheet/platform

const progress_url =
  "https://api.github.com/repos/maskedsyntax/grindsheet/contents/progress.json?ref=master"

const worker_url = "https://grindsheet.maskedsyntax.workers.dev"

pub fn fetch_catalog(
  on_result handle: fn(Result(List(parse.Topic), String)) -> msg,
) -> Effect(msg) {
  rsvp.get(
    "/catalog.json",
    rsvp.expect_any_response(fn(result) {
      case result {
        Error(_) -> handle(Error("Could not load the problem list."))
        Ok(resp) ->
          case resp.status {
            200 ->
              case json.parse(resp.body, catalog_decoder()) {
                Ok(topics) -> handle(Ok(topics))
                Error(_) ->
                  handle(Error("The problem list was not valid JSON."))
              }
            _ -> handle(Error("Could not load the problem list."))
          }
      }
    }),
  )
}

pub fn fetch_progress(
  on_result handle: fn(Result(List(String), String)) -> msg,
) -> Effect(msg) {
  let expect =
    rsvp.expect_any_response(fn(result) {
      case result {
        Error(_) -> handle(Error("Could not reach GitHub."))
        Ok(resp) -> handle(read_progress(resp))
      }
    })

  case request.to(progress_url) {
    Error(_) -> fail(handle, "The progress URL is invalid.")
    Ok(req) ->
      req
      |> request.set_header("accept", "application/vnd.github+json")
      |> request.set_header("user-agent", "grindsheet")
      |> rsvp.send(expect)
  }
}

pub fn save(
  slug: String,
  solved: Bool,
  passphrase: String,
  on_result handle: fn(Result(List(String), String)) -> msg,
) -> Effect(msg) {
  let body =
    json.object([
      #("slug", json.string(slug)),
      #("solved", json.bool(solved)),
      #("passphrase", json.string(passphrase)),
    ])

  let expect =
    rsvp.expect_any_response(fn(result) {
      case result {
        Error(_) -> handle(Error("Could not reach the writer."))
        Ok(resp) -> handle(read_save(resp))
      }
    })

  case request.to(worker_url) {
    Error(_) -> fail(handle, "The writer URL is invalid.")
    Ok(req) ->
      req
      |> request.set_method(http.Post)
      |> request.set_header("content-type", "application/json")
      |> request.set_body(json.to_string(body))
      |> rsvp.send(expect)
  }
}

fn fail(handle: fn(Result(a, String)) -> msg, message: String) -> Effect(msg) {
  effect.from(fn(dispatch) { dispatch(handle(Error(message))) })
}

fn read_progress(
  resp: response.Response(String),
) -> Result(List(String), String) {
  case resp.status {
    404 -> Ok([])
    403 -> Error("GitHub refused the progress request. Refresh in a minute.")
    status ->
      case status >= 200 && status < 300 {
        True -> decode_github_progress(resp.body)
        False -> Error("GitHub returned " <> int.to_string(status) <> ".")
      }
  }
}

fn decode_github_progress(body: String) -> Result(List(String), String) {
  case json.parse(body, github_file_decoder()) {
    Error(_) -> Error("GitHub returned an unexpected progress response.")
    Ok(#(_sha, content)) ->
      case json.parse(platform.decode_base64(content), progress_decoder()) {
        Error(_) -> Error("progress.json is not valid.")
        Ok(#(version, solved)) ->
          case version {
            1 -> Ok(solved)
            other ->
              Error(
                "progress.json is version "
                <> int.to_string(other)
                <> ". This page reads version 1.",
              )
          }
      }
  }
}

fn read_save(resp: response.Response(String)) -> Result(List(String), String) {
  case resp.status >= 200 && resp.status < 300 {
    True ->
      case json.parse(resp.body, solved_decoder()) {
        Ok(solved) -> Ok(solved)
        Error(_) -> Error("The writer returned an unexpected response.")
      }
    False ->
      case json.parse(resp.body, error_decoder()) {
        Ok(message) -> Error(message)
        Error(_) ->
          Error("Could not save (" <> int.to_string(resp.status) <> ").")
      }
  }
}

fn catalog_decoder() -> decode.Decoder(List(parse.Topic)) {
  use topics <- decode.field("topics", decode.list(topic_decoder()))
  decode.success(topics)
}

fn topic_decoder() -> decode.Decoder(parse.Topic) {
  use name <- decode.field("name", decode.string)
  use problems <- decode.field("problems", decode.list(problem_decoder()))
  decode.success(parse.Topic(name:, problems:))
}

fn problem_decoder() -> decode.Decoder(parse.Problem) {
  use slug <- decode.field("slug", decode.string)
  use title <- decode.field("title", decode.string)
  use url <- decode.field("url", decode.string)
  decode.success(parse.Problem(slug:, title:, url:))
}

fn github_file_decoder() -> decode.Decoder(#(String, String)) {
  use sha <- decode.field("sha", decode.string)
  use content <- decode.field("content", decode.string)
  decode.success(#(sha, content))
}

fn progress_decoder() -> decode.Decoder(#(Int, List(String))) {
  use version <- decode.field("version", decode.int)
  use solved <- decode.field("solved", decode.list(decode.string))
  decode.success(#(version, solved))
}

fn solved_decoder() -> decode.Decoder(List(String)) {
  use solved <- decode.field("solved", decode.list(decode.string))
  decode.success(solved)
}

fn error_decoder() -> decode.Decoder(String) {
  use message <- decode.field("error", decode.string)
  decode.success(message)
}
