import { TrieMap, MultiMap } from "mnemonist";

import { Word, WordInfo, wordIterator } from "./wordIterator";
import { DocumentId, PrefixWordPosition, WordPosition } from "./indexTypes";

export class PrefixWordShard {
  /**
   * A Trie for inserting words that are indexed. This maps to the documents
   * (and positions in the document) for the words.
   */
  private readonly wordTrie = new TrieMap<
    Word,
    MultiMap<DocumentId, WordPosition>
  >();

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

  getDocumentWordEntries() {
    return this.wordTrie.entries();
  }

  updateDocument(documentId: DocumentId, content: string) {
    for (const wordInfo of wordIterator(content)) {
      this.addWord(documentId, wordInfo);
    }
  }

  addWord(documentId: DocumentId, wordInfo: WordInfo) {
    const { text, wordIndex, codepointIndex } = wordInfo;

    const existingDocMap = this.wordTrie.get(text);
    const docMap = existingDocMap ?? new MultiMap<DocumentId, WordPosition>();
    if (!existingDocMap) {
      this.wordTrie.set(text, docMap);
    }

    docMap.set(documentId, {
      codepointIndex,
      wordIndex,
    });

    if (!this.firstWord || this.firstWord.localeCompare(text) > 0) {
      this._firstWord = text;
    }

    if (!this.lastWord || this.lastWord.localeCompare(text) < 0) {
      this._lastWord = text;
    }
  }

  private *getMatchingDocumentsWithDuplicates(
    prefix: string
  ): Iterable<string> {
    const docMaps = this.wordTrie.find(prefix as Word);

    for (const [text, docMap] of docMaps) {
      for (const key of docMap.keys()) {
        yield key;
      }
    }
  }

  getMatchingDocuments(prefix: string): Iterable<string> {
    const documentIdsIter = this.getMatchingDocumentsWithDuplicates(prefix);
    const documentIdsSet = new Set(documentIdsIter);

    return documentIdsSet.keys();
  }

  *getMatchingInstances(
    prefix: string,
    documentId: DocumentId
  ): Iterable<PrefixWordPosition> {
    const docMaps = this.wordTrie.find(prefix as Word);

    for (const [text, docMap] of docMaps) {
      const entries = docMap.get(documentId) ?? [];

      for (const entry of entries) {
        yield [text, entry];
      }
    }
  }
}
