import gleam/int
import gleam/json
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/regexp
import gleam/result
import gleam/set
import gleam/string

pub type Problem {
  Problem(slug: String, title: String, url: String)
}

pub type Topic {
  Topic(name: String, problems: List(Problem))
}

/// Parse `problemset/problems.md`. Solved checkboxes in the file are ignored.
/// Progress lives in `progress.json`, not in this list.
pub fn parse(source: String) -> Result(List(Topic), String) {
  let assert Ok(slug_pattern) = regexp.from_string("^[a-z0-9]+(?:-[a-z0-9]+)*$")

  case walk(string.split(source, "\n"), 1, slug_pattern, None, []) {
    Error(message) -> Error(message)
    Ok(#(current, done)) ->
      case close_topic(current, done) {
        Error(message) -> Error(message)
        Ok(topics) -> ensure_unique(topics)
      }
  }
}

pub fn to_json(topics: List(Topic)) -> String {
  json.object([#("topics", json.array(topics, topic_json))])
  |> json.to_string
}

fn topic_json(topic: Topic) -> json.Json {
  json.object([
    #("name", json.string(topic.name)),
    #("problems", json.array(topic.problems, problem_json)),
  ])
}

fn problem_json(problem: Problem) -> json.Json {
  json.object([
    #("slug", json.string(problem.slug)),
    #("title", json.string(problem.title)),
    #("url", json.string(problem.url)),
  ])
}

fn walk(
  lines: List(String),
  number: Int,
  slug_pattern: regexp.Regexp,
  current: Option(Topic),
  done: List(Topic),
) -> Result(#(Option(Topic), List(Topic)), String) {
  case lines {
    [] -> Ok(#(current, done))
    [line, ..rest] -> {
      let trimmed = string.trim(line)
      case trimmed {
        "" -> walk(rest, number + 1, slug_pattern, current, done)
        _ ->
          case classify(trimmed, number, slug_pattern) {
            Ok(Skip) -> walk(rest, number + 1, slug_pattern, current, done)
            Ok(Heading(name)) ->
              case close_topic(current, done) {
                Error(message) -> Error(message)
                Ok(done) ->
                  walk(
                    rest,
                    number + 1,
                    slug_pattern,
                    Some(Topic(name:, problems: [])),
                    done,
                  )
              }
            Ok(Item(problem)) ->
              case current {
                None ->
                  Error(line_message(number, "problem appears before a topic"))
                Some(topic) ->
                  walk(
                    rest,
                    number + 1,
                    slug_pattern,
                    Some(Topic(..topic, problems: [problem, ..topic.problems])),
                    done,
                  )
              }
            Error(message) -> Error(message)
          }
      }
    }
  }
}

type Line {
  Skip
  Heading(name: String)
  Item(problem: Problem)
}

fn classify(
  line: String,
  number: Int,
  slug_pattern: regexp.Regexp,
) -> Result(Line, String) {
  case string.starts_with(line, "## ") {
    True -> {
      let name = string.trim(string.drop_start(line, 3))
      case name {
        "" -> Error(line_message(number, "empty topic heading"))
        name -> Ok(Heading(name))
      }
    }
    False ->
      case string.starts_with(line, "# ") {
        True -> Ok(Skip)
        False ->
          case string.starts_with(line, "- [") {
            True ->
              parse_problem(line, slug_pattern)
              |> result.map(Item)
              |> result.map_error(line_message(number, _))
            False -> Error(line_message(number, "unexpected line"))
          }
      }
  }
}

fn parse_problem(
  line: String,
  slug_pattern: regexp.Regexp,
) -> Result(Problem, String) {
  use rest <- result.try(drop_prefix(line, "- ["))
  use rest <- result.try(take_checkbox(rest))
  use #(title, url) <- result.try(take_link(rest))
  use slug <- result.try(slug_from_url(url, slug_pattern))
  case title {
    "" -> Error("missing title")
    title -> Ok(Problem(slug:, title:, url:))
  }
}

fn take_checkbox(rest: String) -> Result(String, String) {
  case rest {
    " ] " <> rest | "x] " <> rest | "X] " <> rest -> Ok(rest)
    _ -> Error("expected a markdown checkbox")
  }
}

fn take_link(rest: String) -> Result(#(String, String), String) {
  use rest <- result.try(drop_prefix(rest, "["))
  use #(title, after) <- result.try(
    string.split_once(rest, "](")
    |> result.replace_error("expected a markdown link"),
  )
  use #(url, tail) <- result.try(
    string.split_once(after, ")")
    |> result.replace_error("expected a closing parenthesis"),
  )
  case string.trim(tail) {
    "" -> Ok(#(string.trim(title), string.trim(url)))
    _ -> Error("unexpected text after the link")
  }
}

fn slug_from_url(
  url: String,
  slug_pattern: regexp.Regexp,
) -> Result(String, String) {
  case string.split(url, "/problems/") {
    [_, path] ->
      case string.split(path, "/") {
        [slug, ..] ->
          case regexp.check(slug_pattern, slug) {
            True -> Ok(slug)
            False -> Error("slug has unexpected characters: " <> slug)
          }
        _ -> Error("missing slug")
      }
    _ -> Error("url is not a LeetCode problem")
  }
}

fn close_topic(
  current: Option(Topic),
  done: List(Topic),
) -> Result(List(Topic), String) {
  case current {
    None -> Ok(done)
    Some(topic) ->
      case topic.problems {
        [] -> Error("topic has no problems: " <> topic.name)
        problems ->
          Ok([Topic(..topic, problems: list.reverse(problems)), ..done])
      }
  }
}

fn ensure_unique(reversed: List(Topic)) -> Result(List(Topic), String) {
  let topics = list.reverse(reversed)
  case find_duplicate(topics, set.new()) {
    Error(slug) -> Error("duplicate slug: " <> slug)
    Ok(_) -> Ok(topics)
  }
}

fn find_duplicate(
  topics: List(Topic),
  seen: set.Set(String),
) -> Result(Nil, String) {
  case topics {
    [] -> Ok(Nil)
    [topic, ..rest] ->
      case find_duplicate_problems(topic.problems, seen) {
        Error(slug) -> Error(slug)
        Ok(seen) -> find_duplicate(rest, seen)
      }
  }
}

fn find_duplicate_problems(
  problems: List(Problem),
  seen: set.Set(String),
) -> Result(set.Set(String), String) {
  case problems {
    [] -> Ok(seen)
    [problem, ..rest] ->
      case set.contains(seen, problem.slug) {
        True -> Error(problem.slug)
        False -> find_duplicate_problems(rest, set.insert(seen, problem.slug))
      }
  }
}

fn drop_prefix(value: String, prefix: String) -> Result(String, String) {
  case string.starts_with(value, prefix) {
    True -> Ok(string.drop_start(value, string.length(prefix)))
    False -> Error("expected " <> prefix)
  }
}

fn line_message(number: Int, message: String) -> String {
  "line " <> int.to_string(number) <> ": " <> message
}
