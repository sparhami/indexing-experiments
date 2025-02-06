import { Word } from "./wordIterator";

export type DocumentId = string & {
  readonly brand: unique symbol;
};

export type WordPosition = {
  wordIndex: number;
  codepointIndex: number;
};
export type PrefixWordPosition = [Word, WordPosition];
export type DocumentWordEntry = [Word, Array<WordPosition>];
