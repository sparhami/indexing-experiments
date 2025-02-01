import TrieMap from "mnemonist/trie-map";

import { wordIterator } from "./wordIterator";

type WordPosition = [number, number];
type PrefixWordPosition = [string, ...WordPosition];

export class PrefixWordIndex {
  /**
   * A Trie for inserting words that are indexed. This maps to the documents
   * (and positions in the document) for the words.
   */
  private readonly wordTrie = new TrieMap<
    string,
    Map<string, Array<WordPosition>>
  >();

  constructor() {}

  addStringToIndex(documentId: string, content: string) {
    for (const wordInfo of wordIterator(content)) {
      const { text, utf16Index, codePointIndex } = wordInfo;

      const existingDocMap = this.wordTrie.get(text);
      const docMap = existingDocMap ?? new Map();
      if (!existingDocMap) {
        this.wordTrie.set(text, docMap);
      }

      const existingEntries = docMap.get(documentId);
      const entries = existingEntries ?? [];
      if (!existingEntries) {
        docMap.set(documentId, entries);
      }

      entries.push([utf16Index, codePointIndex]);
    }
  }

  private *getMatchingDocumentsWithDuplicates(
    prefix: string
  ): Iterable<string> {
    const docMaps = this.wordTrie.find(prefix);

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
    documentId: string
  ): Iterable<PrefixWordPosition> {
    const docMaps = this.wordTrie.find(prefix);

    for (const [text, docMap] of docMaps) {
      const entries = docMap.get(documentId) ?? [];

      for (const entry of entries) {
        yield [text, ...entry];
      }
    }
  }
}
