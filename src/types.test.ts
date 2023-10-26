import type { AssertIs, AssertSub, TestSuite } from "type-assert-tool"

import type { PickFromPath, Tokenize } from "./types"

const json = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95,
      },
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        price: 12.99,
      },
      {
        category: "fiction",
        author: "Herman Melville",
        title: "Moby Dick",
        isbn: "0-553-21311-3",
        price: 8.99,
      },
      {
        category: "fiction",
        author: "J. R. R. Tolkien",
        title: "The Lord of the Rings",
        isbn: "0-395-19395-8",
        price: 22.99,
      },
    ],
    bicycle: {
      color: "red",
      price: 19.95,
    },
  },
} as const

type JsonType = typeof json

interface TypeTest extends TestSuite {
  "Root element": AssertIs<PickFromPath<JsonType, "$">, JsonType>

  "Dot-notated child": AssertIs<PickFromPath<JsonType, "$.store">, JsonType["store"]>

  "Array index": AssertIs<PickFromPath<JsonType, "$.store.book[0]">, JsonType["store"]["book"][0]>

  "Numeric wildcard": AssertIs<PickFromPath<JsonType, "$.store.book[*]">, JsonType["store"]["book"][number]>
}
