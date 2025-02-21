import { TrieMap, MultiMap } from "mnemonist";

import { Word, WordInfo, wordIterator } from "./wordIterator";
import { DocumentId, PrefixWordPosition, WordPosition } from "./indexTypes";
import { LocalPrefixWordShard } from "./localPrefixWordShard";

export class PrefixWordShard {
  private readonly localShard = new LocalPrefixWordShard();

  private readonly remoteShard = null;

  protected _firstWord: string | null = null;

  protected _lastWord: string | null = null;

  constructor(firstWord: string | null = null, lastWord: string | null = null) {
    this._firstWord = firstWord;
    this._lastWord = lastWord;
  }

  get firstWord() {
    return this._firstWord;
  }

  get lastWord() {
    return this._lastWord;
  }
}
