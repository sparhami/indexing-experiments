import MultiMap from "mnemonist/multi-map";

import {
  DocumentEntry,
  WordEntry,
  WordLocation,
} from "./generated/proto/protoWordShard_pb";
import { DocumentId, DocumentWordEntry, WordPosition } from "./indexTypes";
import { PrefixWordShard } from "./prefixWordShard";
import { Word } from "./wordIterator";
import { compressData, decompressData } from "./byteArrayUtils";

type SerializedShard = {
  words: Array<Word>;
  firstWord: string | null;
  lastWord: string | null;
  documents: Record<DocumentId, Uint8Array>;
};

type PersistedWordEntry = [Word | number, WordPosition[]];

function wordLocationToProto(wordLocation: WordPosition) {
  const proto = new WordLocation();
  proto.setWordIndex(wordLocation.wordIndex);
  proto.setCodepointIndex(wordLocation.codepointIndex);

  return proto;
}

function persistedWordEntriesToProto(
  persistedWordEntries: PersistedWordEntry[]
): DocumentEntry {
  const wordEntriesList = persistedWordEntries.map(([word, positions]) => {
    const wordLocationsList = positions.map(wordLocationToProto);
    const wordEntry = new WordEntry();

    if (typeof word === "string") {
      wordEntry.setText(word);
    } else {
      wordEntry.setIndex(word);
    }

    wordEntry.setWordLocationsList(wordLocationsList);

    return wordEntry;
  });

  const documentEntry = new DocumentEntry();
  documentEntry.setWordEntriesList(wordEntriesList);

  return documentEntry;
}

export function documentWordEntriesFromProto(
  words: Array<Word>,
  documentEntry: DocumentEntry
): DocumentWordEntry[] {
  return documentEntry.getWordEntriesList().map((wordEntry) => {
    const text = wordEntry.hasText()
      ? (wordEntry.getText() as Word)
      : words[wordEntry.getIndex()];
    const locations = wordEntry.getWordLocationsList();

    return [
      text,
      locations.map((wordLocation) => {
        return wordLocation.toObject();
      }),
    ] as const;
  });
}

export async function serialize(
  shard: PrefixWordShard
): Promise<SerializedShard> {
  // Track all the words,
  const words: Array<Word> = [];

  // Step 1: Generate a MultiMap from document id -> the indexed data for the
  // document in this shard. This gathers data across all the different words
  // and groups them by document.
  const documentsWordsMap = new MultiMap<DocumentId, PersistedWordEntry>();
  for (const [word, docMap] of shard.getDocumentWordEntries()) {
    const wordIndex = words.length;

    for (const [documentId, wordPositions] of docMap.associations()) {
      documentsWordsMap.set(documentId, [wordIndex, wordPositions]);
    }

    words.push(word);
  }

  // Step 2: Convert the word entries array for each document into a proto
  // definition, serialize it.
  const documentsWordContent = Array.from(
    documentsWordsMap.associations(),
    ([documentId, persistedWordEntries]) => {
      const documentEntryProto =
        persistedWordEntriesToProto(persistedWordEntries);
      const binaryContent = documentEntryProto.serializeBinary();

      return [documentId, binaryContent] as const;
    }
  );

  // Step 3: Compress the data.
  const documentsWordContentCompressedPromises = documentsWordContent.map(
    async ([documentId, binaryContent]) => {
      const compressed = await compressData(binaryContent);

      return [documentId, compressed];
    }
  );
  const documentsWordContentCompressed = await Promise.all(
    documentsWordContentCompressedPromises
  );

  // Step 4: Encrypt the data for each entry.

  return {
    words,
    firstWord: shard.firstWord,
    lastWord: shard.lastWord,
    documents: Object.fromEntries(documentsWordContentCompressed),
  };
}

export async function deserialize(serialized: SerializedShard) {
  const { words, firstWord, lastWord, documents } = serialized;
  const shard = new PrefixWordShard(firstWord, lastWord);

  const documentsWordContentCompressed = Object.entries(documents);
  const documentsWordContentPromises = documentsWordContentCompressed.map(
    async ([documentId, compressedContent]) => {
      const decompressed = await decompressData(compressedContent);

      return [documentId, decompressed] as const;
    }
  );
  const documentsWordContent = await Promise.all(documentsWordContentPromises);

  for (const [documentId, binaryContent] of documentsWordContent) {
    const documentEntryProto = DocumentEntry.deserializeBinary(binaryContent);

    for (const wordEntry of documentEntryProto.getWordEntriesList()) {
      const text = wordEntry.hasText()
        ? (wordEntry.getText() as Word)
        : words[wordEntry.getIndex()];
      const locations = wordEntry.getWordLocationsList();

      for (const location of locations) {
        shard.addWord(documentId as DocumentId, {
          text,
          wordIndex: location.getWordIndex(),
          codepointIndex: location.getCodepointIndex(),
        });
      }
    }
  }

  return shard;
}
