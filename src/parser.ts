import type { Token } from "./types"

// EBNF
//
// Root                  := "$" Accessor*
// Accessor              := ChildAccessor | ArrayIndexAccessor | ArrayWildCardAccessor
// ChildAccessor         := "."Identifier
// ArrayIndexAccessor    := "[" NumberIndex "]"
// ArrayWildCardAccessor := "[" "*" "]"
// Identifier            := RegExp([a-zA-Z][a-zA-Z0-9]*)
// NumberIndex           := RegExp([0-9]+)

export type ArrayWildCardAccessorNode = {
  type: "arrayWildCardAccessor"
}

export type ArrayIndexAccessorNode = {
  type: "arrayIndexAccessor"
  numberIndex: number
}

export type ChildAccessorNode = {
  type: "childAccessor"
  identifier: string
}

export type AccessorNode = ChildAccessorNode | ArrayIndexAccessorNode | ArrayWildCardAccessorNode

export type RootNode = {
  type: "root"
  accessors: readonly AccessorNode[]
}

export function tokenize(path: string): readonly Token[] {
  let rest = path
  const tokens: Token[] = []

  const scanWithString = (tester: string) => {
    if (rest.startsWith(tester)) {
      rest = rest.slice(tester.length)
      return tester
    }
    return null
  }

  const scanWithRegExp = (tester: RegExp) => {
    const hit = tester.exec(rest)
    if (hit) {
      rest = rest.slice(hit[0].length)
      return hit
    }
    return null
  }

  while (rest.length) {
    const currentLength = rest.length
    let regexpHit: null | undefined | RegExpExecArray
    if ((regexpHit = scanWithRegExp(/^([a-zA-Z][a-zA-Z0-9]*)/))) {
      tokens.push({ type: "Identifier", value: regexpHit[1] })
    } else if ((regexpHit = scanWithRegExp(/^(\d+)/))) {
      tokens.push({ type: "NumberIndex", value: parseInt(regexpHit[1], 10) })
    } else if (scanWithString("$")) {
      tokens.push({ type: "Dollar" })
    } else if (scanWithString("[")) {
      tokens.push({ type: "LeftBracket" })
    } else if (scanWithString("]")) {
      tokens.push({ type: "RightBracket" })
    } else if (scanWithString("*")) {
      tokens.push({ type: "Asterisk" })
    } else if (scanWithString(".")) {
      tokens.push({ type: "Dot" })
    } else if (scanWithString("*")) {
      tokens.push({ type: "Asterisk" })
    }
    if (currentLength === rest.length) {
      throw new SyntaxError(`${rest.slice(0, 10)}`)
    }
  }
  return tokens
}

export function parsePath(tokens: readonly Token[]): RootNode {
  const [first, ...rest] = tokens
  if (first.type !== "Dollar") {
    throw new SyntaxError("Unexpected token")
  }

  let seq = rest
  let accessors: AccessorNode[] = []

  const parseChildAccessor = (): ChildAccessorNode | undefined => {
    const [dot, id] = seq
    if (dot.type === "Dot" && id.type === "Identifier") {
      seq = seq.slice(2)
      return {
        type: "childAccessor",
        identifier: id.value,
      }
    }
  }

  const parseArrayIndexAccessor = (): ArrayIndexAccessorNode | undefined => {
    const [lb, ni, rb] = seq
    if (lb.type === "LeftBracket" && ni.type === "NumberIndex" && rb.type === "RightBracket") {
      seq = seq.slice(3)
      return {
        type: "arrayIndexAccessor",
        numberIndex: ni.value,
      }
    }
  }

  const parseArrayWildCardAccessor = (): ArrayWildCardAccessorNode | undefined => {
    const [lb, asterisk, rb] = seq
    if (lb.type === "LeftBracket" && asterisk.type === "Asterisk" && rb.type === "RightBracket") {
      seq = seq.slice(3)
      return {
        type: "arrayWildCardAccessor",
      }
    }
  }

  while (seq.length) {
    const node = parseChildAccessor() ?? parseArrayIndexAccessor() ?? parseArrayWildCardAccessor()
    if (!node) {
      throw new SyntaxError("Unexpected token")
    }
    accessors.push(node)
  }

  return {
    type: "root",
    accessors,
  }
}
