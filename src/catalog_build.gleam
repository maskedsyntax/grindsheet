import gleam/io
import gleam/result
import simplifile

import grindsheet/parse

pub fn main() {
  let outcome = {
    use source <- result.try(
      simplifile.read("problemset/problems.md")
      |> result.map_error(fn(_) { "could not read problemset/problems.md" }),
    )
    use topics <- result.try(parse.parse(source))
    simplifile.write("assets/catalog.json", parse.to_json(topics))
    |> result.map_error(fn(_) { "could not write assets/catalog.json" })
  }

  case outcome {
    Ok(_) -> io.println("wrote assets/catalog.json")
    Error(message) -> {
      io.println_error(message)
      panic as "catalog build failed"
    }
  }
}
