import { wordIterator } from "./wordIterator";
import { PrefixWordShard } from "./prefixWordShard";
import { DocumentId, PrefixWordPosition } from "./indexTypes";

export class PrefixWordIndex {
  private readonly shards: Array<PrefixWordShard> = [];

  constructor() {}

  addShard(shard: PrefixWordShard) {
    const index = shard.lastWord
      ? this.getShardIndex(shard.lastWord)
      : this.shards.length - 1;

    if (index < 0) {
      this.shards.push(shard);
    } else {
      this.shards.splice(index, 0, shard);
    }
  }

  private getShardIndex(text: string) {
    const index = this.shards.findIndex((s) => {
      if (!s.lastWord) {
        return true;
      }

      if (!text) {
        return false;
      }

      return s.lastWord.localeCompare(text) > 0;
    });

    if (index < 0) {
      return this.shards.length;
    }

    return index;
  }

  private getShard(text: string): PrefixWordShard {
    const index = Math.min(this.getShardIndex(text), this.shards.length - 1);
    const shard = this.shards[index];

    if (!shard) {
      throw new Error("Expected to have at least one shard");
    }

    return shard;
  }

  updateDocument(documentId: DocumentId, content: string) {
    for (const wordInfo of wordIterator(content)) {
      const shard = this.getShard(wordInfo.text);

      shard.addWord(documentId, wordInfo);
    }
  }

  private *getMatchingDocumentsWithDuplicates(
    prefix: string
  ): Iterable<string> {
    for (const shard of this.shards) {
      for (const id of shard.getMatchingDocuments(prefix)) {
        yield id;
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
    for (const shard of this.shards) {
      for (const instance of shard.getMatchingInstances(prefix, documentId)) {
        yield instance;
      }
    }
  }
}
