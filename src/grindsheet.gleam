import gleam/float
import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/set
import gleam/string
import lustre
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import lustre/element/svg
import lustre/event

import grindsheet/parse
import grindsheet/platform
import grindsheet/remote

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

type Model {
  Model(
    topics: Option(List(parse.Topic)),
    load_error: String,
    solved: set.Set(String),
    progress_ready: Bool,
    filter: String,
    hide_solved: Bool,
    passphrase: String,
    notice: String,
    pending: set.Set(String),
  )
}

fn init(_) -> #(Model, Effect(Msg)) {
  #(
    Model(
      topics: None,
      load_error: "",
      solved: set.new(),
      progress_ready: False,
      filter: "",
      hide_solved: False,
      passphrase: "",
      notice: "",
      pending: set.new(),
    ),
    effect.batch([
      remote.fetch_catalog(CatalogLoaded),
      remote.fetch_progress(ProgressLoaded),
      effect.from(fn(dispatch) {
        dispatch(PassphraseRestored(platform.read_passphrase()))
      }),
    ]),
  )
}

type Msg {
  CatalogLoaded(Result(List(parse.Topic), String))
  ProgressLoaded(Result(List(String), String))
  PassphraseRestored(String)
  FilterChanged(String)
  HideToggled
  ThemeToggled
  PassphraseChanged(String)
  Toggled(slug: String, solved: Bool)
  SaveFinished(slug: String, want: Bool, result: Result(List(String), String))
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    CatalogLoaded(Ok(topics)) -> #(
      Model(..model, topics: Some(topics), load_error: ""),
      effect.none(),
    )
    CatalogLoaded(Error(message)) -> #(
      Model(..model, load_error: message),
      effect.none(),
    )
    ProgressLoaded(Ok(solved)) -> #(
      Model(
        ..model,
        solved: set.from_list(solved),
        progress_ready: True,
        notice: "",
      ),
      effect.none(),
    )
    ProgressLoaded(Error(message)) -> #(
      Model(..model, notice: message),
      effect.none(),
    )
    PassphraseRestored(value) -> #(
      Model(..model, passphrase: value),
      effect.none(),
    )
    FilterChanged(value) -> #(Model(..model, filter: value), effect.none())
    ThemeToggled -> #(
      model,
      effect.from(fn(_dispatch) { platform.toggle_theme() }),
    )
    HideToggled -> #(
      Model(..model, hide_solved: !model.hide_solved),
      effect.none(),
    )
    PassphraseChanged(value) -> #(
      Model(..model, passphrase: value),
      effect.from(fn(_dispatch) { platform.write_passphrase(value) }),
    )
    Toggled(slug, want) -> toggle(model, slug, want)
    SaveFinished(slug, want, result) -> finish_save(model, slug, want, result)
  }
}

fn toggle(model: Model, slug: String, want: Bool) -> #(Model, Effect(Msg)) {
  case model.progress_ready {
    False -> #(
      Model(..model, notice: "Progress has not loaded yet."),
      effect.none(),
    )
    True ->
      case string.trim(model.passphrase) {
        "" -> #(
          Model(
            ..model,
            notice: "Enter the passphrase before marking a problem.",
          ),
          effect.none(),
        )
        passphrase -> {
          let solved = case want {
            True -> set.insert(model.solved, slug)
            False -> set.delete(model.solved, slug)
          }
          #(
            Model(
              ..model,
              solved:,
              pending: set.insert(model.pending, slug),
              notice: "",
            ),
            remote.save(slug, want, passphrase, SaveFinished(slug, want, _)),
          )
        }
      }
  }
}

fn finish_save(
  model: Model,
  slug: String,
  want: Bool,
  result: Result(List(String), String),
) -> #(Model, Effect(Msg)) {
  let pending = set.delete(model.pending, slug)
  case result {
    Error(message) -> {
      let solved = case want {
        True -> set.delete(model.solved, slug)
        False -> set.insert(model.solved, slug)
      }
      #(Model(..model, solved:, pending:, notice: message), effect.none())
    }
    Ok(server) -> #(
      Model(
        ..model,
        solved: reconcile(set.from_list(server), pending, model.solved),
        pending:,
        notice: "",
      ),
      effect.none(),
    )
  }
}

/// Server state wins, except for toggles that are still in flight.
fn reconcile(
  server: set.Set(String),
  pending: set.Set(String),
  local: set.Set(String),
) -> set.Set(String) {
  set.fold(pending, server, fn(acc, slug) {
    case set.contains(local, slug) {
      True -> set.insert(acc, slug)
      False -> set.delete(acc, slug)
    }
  })
}

fn view(model: Model) -> Element(Msg) {
  let topics = option.unwrap(model.topics, [])
  let total = count_problems(topics)
  let done = count_solved(topics, model.solved)

  html.div([], [
    html.header([attribute.class("wrap head")], [
      html.p([attribute.class("eyebrow")], [html.text("NeetCode 150")]),
      html.div([attribute.class("title-row")], [
        html.h1([], [logo(), html.text("Grindsheet")]),
        theme_button(),
      ]),
      html.p([attribute.class("count")], [
        html.span([attribute.class("count-done")], [
          html.text(int.to_string(done)),
        ]),
        html.text(" / " <> int.to_string(total)),
      ]),
      progress_bar(done, total),
      html.div([attribute.class("tools")], [
        html.input([
          attribute.type_("search"),
          attribute.class("filter"),
          attribute.placeholder("Filter problems"),
          attribute.value(model.filter),
          attribute.attribute("aria-label", "Filter problems"),
          event.on_input(FilterChanged),
        ]),
        html.button(
          [
            attribute.type_("button"),
            attribute.class("text-button"),
            attribute.attribute("aria-pressed", case model.hide_solved {
              True -> "true"
              False -> "false"
            }),
            event.on_click(HideToggled),
          ],
          [
            html.text(case model.hide_solved {
              True -> "Show solved"
              False -> "Hide solved"
            }),
          ],
        ),
        html.input([
          attribute.type_("password"),
          attribute.class("passphrase"),
          attribute.placeholder("Passphrase"),
          attribute.value(model.passphrase),
          attribute.attribute("aria-label", "Passphrase"),
          attribute.attribute("autocomplete", "current-password"),
          event.on_input(PassphraseChanged),
        ]),
      ]),
      html.p(
        [
          attribute.class("notice"),
          attribute.attribute("role", "status"),
        ],
        [html.text(notice_text(model))],
      ),
    ]),
    html.main([attribute.class("wrap")], body(model, topics)),
  ])
}

fn logo() -> Element(Msg) {
  svg.svg(
    [
      attribute.class("logo"),
      attribute.attribute("viewBox", "0 0 32 32"),
      attribute.attribute("aria-hidden", "true"),
    ],
    [
      svg.rect([
        attribute.class("logo-box"),
        attribute.attribute("x", "3"),
        attribute.attribute("y", "8"),
        attribute.attribute("width", "20"),
        attribute.attribute("height", "20"),
        attribute.attribute("rx", "2.5"),
      ]),
      svg.path([
        attribute.class("logo-tick"),
        attribute.attribute("d", "M7.5 17.5l5 5L29 4"),
      ]),
    ],
  )
}

fn theme_button() -> Element(Msg) {
  html.button(
    [
      attribute.type_("button"),
      attribute.class("theme-button"),
      attribute.attribute("aria-label", "Switch light or dark theme"),
      attribute.attribute("title", "Switch theme"),
      event.on_click(ThemeToggled),
    ],
    [
      icon("icon-moon", [
        svg.path([
          attribute.attribute(
            "d",
            "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z",
          ),
        ]),
      ]),
      icon("icon-sun", [
        svg.circle([
          attribute.attribute("cx", "12"),
          attribute.attribute("cy", "12"),
          attribute.attribute("r", "4"),
        ]),
        svg.path([
          attribute.attribute(
            "d",
            "M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
          ),
        ]),
      ]),
    ],
  )
}

fn icon(class: String, children: List(Element(Msg))) -> Element(Msg) {
  svg.svg(
    [
      attribute.class("icon " <> class),
      attribute.attribute("viewBox", "0 0 24 24"),
      attribute.attribute("aria-hidden", "true"),
    ],
    children,
  )
}

fn notice_text(model: Model) -> String {
  case model.notice {
    "" ->
      case model.topics, model.progress_ready {
        Some(_), False ->
          case model.load_error {
            "" -> "Loading progress…"
            _ -> ""
          }
        _, _ -> ""
      }
    notice -> notice
  }
}

fn body(model: Model, topics: List(parse.Topic)) -> List(Element(Msg)) {
  case model.topics, model.load_error {
    None, "" -> [
      html.p([attribute.class("empty")], [html.text("Loading the list…")]),
    ]
    None, message -> [html.p([attribute.class("empty")], [html.text(message)])]
    Some(_), _ -> {
      let sections =
        list.filter_map(topics, fn(topic) { view_topic(model, topic) })
      case sections {
        [] -> [
          html.p([attribute.class("empty")], [html.text("Nothing matches.")]),
        ]
        sections -> sections
      }
    }
  }
}

fn view_topic(model: Model, topic: parse.Topic) -> Result(Element(Msg), Nil) {
  let rows =
    list.filter_map(topic.problems, fn(problem) {
      case visible(model, problem) {
        True -> Ok(view_problem(model, problem))
        False -> Error(Nil)
      }
    })

  case rows {
    [] -> Error(Nil)
    rows -> {
      let done = count_solved_problems(topic.problems, model.solved)
      let total = list.length(topic.problems)
      Ok(
        html.section([attribute.class("topic")], [
          html.div([attribute.class("topic-head")], [
            html.h2([], [html.text(topic.name)]),
            html.span([attribute.class("topic-count")], [
              html.text(int.to_string(done) <> "/" <> int.to_string(total)),
            ]),
          ]),
          html.ul([], rows),
        ]),
      )
    }
  }
}

fn view_problem(model: Model, problem: parse.Problem) -> Element(Msg) {
  let solved = set.contains(model.solved, problem.slug)
  let pending = set.contains(model.pending, problem.slug)
  html.li(
    [
      attribute.class("row"),
      attribute.attribute("data-solved", case solved {
        True -> "true"
        False -> "false"
      }),
    ],
    [
      html.input([
        attribute.type_("checkbox"),
        attribute.checked(solved),
        attribute.disabled(!model.progress_ready || pending),
        attribute.attribute("aria-label", case solved {
          True -> "Mark " <> problem.title <> " unsolved"
          False -> "Mark " <> problem.title <> " solved"
        }),
        event.on_check(Toggled(problem.slug, _)),
      ]),
      html.a(
        [
          attribute.href(problem.url),
          attribute.target("_blank"),
          attribute.rel("noreferrer noopener"),
        ],
        [html.text(problem.title)],
      ),
    ],
  )
}

fn visible(model: Model, problem: parse.Problem) -> Bool {
  let query = string.lowercase(string.trim(model.filter))
  let matches = case query {
    "" -> True
    query -> string.contains(string.lowercase(problem.title), query)
  }
  let hidden = model.hide_solved && set.contains(model.solved, problem.slug)
  matches && !hidden
}

fn progress_bar(done: Int, total: Int) -> Element(Msg) {
  html.div(
    [
      attribute.class("bar"),
      attribute.attribute("role", "progressbar"),
      attribute.attribute("aria-valuemin", "0"),
      attribute.attribute("aria-valuemax", int.to_string(total)),
      attribute.attribute("aria-valuenow", int.to_string(done)),
      attribute.attribute(
        "aria-label",
        int.to_string(done) <> " of " <> int.to_string(total) <> " solved",
      ),
    ],
    [
      html.span(
        [
          attribute.class("bar-fill"),
          attribute.attribute("style", "width: " <> percent(done, total) <> "%"),
        ],
        [],
      ),
    ],
  )
}

fn percent(done: Int, total: Int) -> String {
  case total {
    0 -> "0"
    _ -> {
      let value = int.to_float(done) /. int.to_float(total) *. 100.0
      float.to_string(value)
    }
  }
}

fn count_problems(topics: List(parse.Topic)) -> Int {
  list.fold(topics, 0, fn(total, topic) { total + list.length(topic.problems) })
}

fn count_solved(topics: List(parse.Topic), solved: set.Set(String)) -> Int {
  list.fold(topics, 0, fn(total, topic) {
    total + count_solved_problems(topic.problems, solved)
  })
}

fn count_solved_problems(
  problems: List(parse.Problem),
  solved: set.Set(String),
) -> Int {
  list.fold(problems, 0, fn(total, problem) {
    case set.contains(solved, problem.slug) {
      True -> total + 1
      False -> total
    }
  })
}
