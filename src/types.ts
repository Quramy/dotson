export type DeepPartial<TObj> = TObj extends object
  ? {
      [P in keyof TObj]?: DeepPartial<TObj[P]>
    }
  : TObj

type DollarToken = { type: "Dollar" }
type AsteriskToken = { type: "Asterisk" }
type DotToken = { type: "Dot" }
type LBToken = { type: "LeftBracket" }
type RBToken = { type: "RightBracket" }
type NumberIndexToken<TIndex extends number> = {
  type: "NumberIndex"
  value: TIndex
}
type IdToken<TName extends string> = { type: "Identifier"; value: TName }

type Token = DollarToken | AsteriskToken | LBToken | RBToken | NumberIndexToken<number> | IdToken<string>

// prettier-ignore
export type Tokenize<T extends string> = 
 T extends "" ? [] :
 T extends `\$${infer S}` ? [DollarToken, Tokenize<S>] :
 T extends `.${infer S}` ? [DotToken, Tokenize<S>] :
 T extends `[${infer N extends number}]${infer S}` ? [LBToken, [NumberIndexToken<N>, [RBToken, Tokenize<S>]]] :
 T extends `[*]${infer S}` ? [LBToken, [DollarToken, [RBToken, Tokenize<S>]]] :
 T extends `${infer N}\$${infer S}` ? [IdToken<N>, Tokenize<`\$${S}`>] :
 T extends `${infer N}.${infer S}` ? [IdToken<N>, [DotToken, Tokenize<S>]] :
 T extends `${infer N}[${infer S}` ? [IdToken<N>, Tokenize<`[${S}`>] :
 T extends `${infer N}]${infer S}` ? [IdToken<N>, Tokenize<`]${S}`>] :
 T extends `${infer N}*${infer S}` ? [IdToken<N>, Tokenize<`*${S}`>] :
 [IdToken<T>, []]

// prettier-ignore
type PickInner<TRootObj, TTokens, TCurrent = never> =
  TTokens extends [DollarToken, infer S] ? PickInner<TRootObj, S, TRootObj> :
  TTokens extends [DotToken, [IdToken<infer TName>, infer S]] ? TName extends keyof TCurrent ? PickInner<TRootObj, S, TCurrent[TName]> : never :
  TTokens extends [LBToken, [NumberIndexToken<infer TIndex>, [RBToken, infer S]]] ? TCurrent extends readonly any[] ? PickInner<TRootObj, S, TCurrent[TIndex]> : never :
  TTokens extends [LBToken, [DollarToken, [RBToken, infer S]]] ? TCurrent extends readonly any[] ? PickInner<TRootObj, S, TCurrent[number]> : never :
  TCurrent

export type PickFromPath<TObj, TPath extends string> = PickInner<TObj, Tokenize<TPath>>
