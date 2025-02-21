import { TrieMap, MultiMap } from "mnemonist";

import { Word, WordInfo, wordIterator } from "./wordIterator";
import { DocumentId, PrefixWordPosition, WordPosition } from "./indexTypes";

export class LocalPrefixWordShard {
  /**
   * A Trie for inserting words that are indexed. This maps to the documents
   * (and positions in the document) for the words.
   */
  private readonly wordTrie = new TrieMap<
    Word,
    MultiMap<DocumentId, WordPosition>
  >();

  private readonly updatedDocuments = new Set<DocumentId>();

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

  removeDocument(documentId: DocumentId) {
    for (const docMap of this.wordTrie.values()) {
      docMap.delete(documentId);
    }
  }

  updateDocument(documentId: DocumentId, content: string) {
    this.removeDocument(documentId);
    this.updatedDocuments.add(documentId);

    for (const wordInfo of wordIterator(content)) {
      this.addWord(documentId, wordInfo);
    }
  }

  clearUpdatedDocuments() {
    this.updatedDocuments.clear();
  }

  getUpdatedDocuments(): Iterable<DocumentId> {
    return this.updatedDocuments.keys();
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

  private getSplitIndex(
    entries: Array<[Word, MultiMap<DocumentId, WordPosition, WordPosition[]>]>,
    splitCount: number
  ) {
    let currentCount = 0;

    for (let i = 0; i < entries.length; i++) {
      const [word, docMap] = entries[i];
      currentCount += docMap.size;

      if (currentCount >= splitCount) {
        return i;
      }
    }

    return entries.length;
  }

  split(): LocalPrefixWordShard {
    const entries = Array.from(this.wordTrie).sort(([wordA], [wordB]) => {
      return wordA.localeCompare(wordB);
    });
    const totalCount = entries.reduce((total, [word, docMap]) => {
      return total + docMap.size;
    }, 0);
    const splitIndex = this.getSplitIndex(entries, totalCount / 2);
    const otherShard = new LocalPrefixWordShard();

    for (let i = splitIndex; i < entries.length; i++) {
      const [word, docMap] = entries[i];

      otherShard.wordTrie.set(word, docMap);
      this.wordTrie.delete(word);
    }

    this._firstWord = entries.at(0)?.[0] ?? null;
    this._lastWord = entries.at(splitIndex - 1)?.[0] ?? null;
    otherShard._firstWord = entries.at(splitIndex)?.[0] ?? null;
    otherShard._lastWord = entries.at(-1)?.[0] ?? null;

    return otherShard;
  }

  private *getMatchingDocumentsWithDuplicates(
    prefix: string
  ): Iterable<DocumentId> {
    const docMaps = this.wordTrie.find(prefix as Word);

    for (const [text, docMap] of docMaps) {
      for (const key of docMap.keys()) {
        yield key;
      }
    }
  }

  async getMatchingDocuments(prefix: string): Promise<Iterable<DocumentId>> {
    const documentIdsIter = this.getMatchingDocumentsWithDuplicates(prefix);
    const documentIdsSet = new Set<DocumentId>(documentIdsIter);

    return documentIdsSet.keys();
  }

  private *_getMatchingInstances(
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

  async getMatchingInstances(
    prefix: string,
    documentId: DocumentId
  ): Promise<Iterable<PrefixWordPosition>> {
    return this._getMatchingInstances(prefix, documentId);
  }
}
