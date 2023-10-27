import { describe, test } from "node:test"
import { deepEqual } from "node:assert"

import { tokenize, parsePath, RootNode } from "./parser"

describe(tokenize.name, () => {
  test("empty string", () => {
    deepEqual(tokenize(""), [])
  })

  test("Dollar", () => {
    deepEqual(tokenize("$"), [{ type: "Dollar" }])
  })

  test("Dot", () => {
    deepEqual(tokenize("a.b"), [
      { type: "Identifier", value: "a" },
      { type: "Dot" },
      { type: "Identifier", value: "b" },
    ])
  })

  test("Brackets and NumberIndex", () => {
    deepEqual(tokenize("[1]"), [{ type: "LeftBracket" }, { type: "NumberIndex", value: 1 }, { type: "RightBracket" }])
  })

  test("Brackets and Asterisk", () => {
    deepEqual(tokenize("[*]"), [{ type: "LeftBracket" }, { type: "Asterisk" }, { type: "RightBracket" }])
  })
})

describe(parsePath.name, () => {
  test("root", () => {
    deepEqual(parsePath(tokenize("$")), { type: "root", accessors: [] })
  })

  test("ChildAccessor", () => {
    deepEqual(parsePath(tokenize("$.hoge")), {
      type: "root",
      accessors: [{ type: "childAccessor", identifier: "hoge" }],
    } satisfies RootNode)
  })

  test("ArrayIndexAccessor", () => {
    deepEqual(parsePath(tokenize("$[0]")), {
      type: "root",
      accessors: [{ type: "arrayIndexAccessor", numberIndex: 0 }],
    } satisfies RootNode)
  })

  test("ArrayWildCardAccessor", () => {
    deepEqual(parsePath(tokenize("$[*]")), {
      type: "root",
      accessors: [{ type: "arrayWildCardAccessor" }],
    } satisfies RootNode)
  })

  test("complex", () => {
    deepEqual(parsePath(tokenize("$.store.books[1]")), {
      type: "root",
      accessors: [
        { type: "childAccessor", identifier: "store" },
        { type: "childAccessor", identifier: "books" },
        { type: "arrayIndexAccessor", numberIndex: 1 },
      ],
    } satisfies RootNode)
  })
})
