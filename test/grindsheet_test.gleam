import gleam/list
import gleam/set
import gleam/string
import gleeunit
import gleeunit/should
import simplifile

import grindsheet/parse

pub fn main() {
  gleeunit.main()
}

pub fn checked_box_is_ignored_test() {
  let source =
    "
## Arrays & Hashing
- [x] [Two Sum](https://leetcode.com/problems/two-sum/)
- [ ] [Valid Anagram](https://leetcode.com/problems/valid-anagram)
"
  let assert Ok(topics) = parse.parse(source)
  topics
  |> should.equal([
    parse.Topic("Arrays & Hashing", [
      parse.Problem(
        "two-sum",
        "Two Sum",
        "https://leetcode.com/problems/two-sum/",
      ),
      parse.Problem(
        "valid-anagram",
        "Valid Anagram",
        "https://leetcode.com/problems/valid-anagram",
      ),
    ]),
  ])
}

pub fn title_with_parentheses_test() {
  let source =
    "
## Math & Geometry
- [ ] [Pow(x, n)](https://leetcode.com/problems/powx-n/)
"
  let assert Ok([topic]) = parse.parse(source)
  topic.problems
  |> should.equal([
    parse.Problem(
      "powx-n",
      "Pow(x, n)",
      "https://leetcode.com/problems/powx-n/",
    ),
  ])
}

pub fn rejects_a_problem_before_a_topic_test() {
  let source = "- [ ] [Two Sum](https://leetcode.com/problems/two-sum/)\n"
  parse.parse(source)
  |> should.equal(Error("line 1: problem appears before a topic"))
}

pub fn rejects_a_duplicate_slug_test() {
  let source =
    "
## One
- [ ] [Two Sum](https://leetcode.com/problems/two-sum/)
## Two
- [ ] [Two Sum again](https://leetcode.com/problems/two-sum/)
"
  parse.parse(source)
  |> should.equal(Error("duplicate slug: two-sum"))
}

pub fn real_problem_list_test() {
  let assert Ok(source) = simplifile.read("problemset/problems.md")
  let assert Ok(topics) = parse.parse(source)

  list.map(topics, fn(topic) { #(topic.name, list.length(topic.problems)) })
  |> should.equal([
    #("Arrays & Hashing", 9),
    #("Two Pointers", 5),
    #("Sliding Window", 6),
    #("Stack", 6),
    #("Binary Search", 7),
    #("Linked List", 11),
    #("Trees", 15),
    #("Tries", 3),
    #("Backtracking", 10),
    #("Heap / Priority Queue", 7),
    #("Graphs", 13),
    #("Advanced Graphs", 6),
    #("1-D Dynamic Programming", 12),
    #("2-D Dynamic Programming", 11),
    #("Greedy", 8),
    #("Intervals", 6),
    #("Bit Manipulation", 7),
    #("Math & Geometry", 8),
  ])

  let problems = list.flat_map(topics, fn(topic) { topic.problems })
  list.length(problems) |> should.equal(150)

  let assert Ok(first) = list.first(problems)
  first.slug |> should.equal("contains-duplicate")

  let assert Ok(last) = list.last(problems)
  last.slug |> should.equal("detect-squares")

  let slugs = list.map(problems, fn(problem) { problem.slug })
  set.size(set.from_list(slugs)) |> should.equal(150)

  list.each(problems, fn(problem) {
    string.contains(
      problem.url,
      "https://leetcode.com/problems/" <> problem.slug,
    )
    |> should.be_true
  })
}
