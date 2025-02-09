import { describe, it, expect } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";

import { PrefixWordShard } from "./prefixWordShard";
import { deserialize, serialize } from "./prefixWordShardPersistence";
import { DocumentId } from "./indexTypes";

const pnpText = readFileSync(join(__dirname, "testdata", "pnp.text"), "utf8");

describe("prefixWordShard", () => {
  const docIdA = "idA" as DocumentId;
  const docIdB = "idB" as DocumentId;

  it("should serialize / deserialize", async () => {
    const shard = new PrefixWordShard();
    shard.updateDocument(docIdA, "hello world hello");
    shard.updateDocument(docIdB, "hello mars");

    const serialized = await serialize(shard);
    const deserializedShard = await deserialize(serialized);

    {
      const documents = Array.from(
        deserializedShard.getMatchingDocuments("he")
      );
      expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB]));

      const positions = Array.from(
        deserializedShard.getMatchingInstances("he", docIdA)
      );
      expect(positions).toEqual(
        expect.arrayContaining([
          ["hello", { codepointIndex: 0, wordIndex: 0 }],
          ["hello", { codepointIndex: 12, wordIndex: 2 }],
        ])
      );
    }

    {
      const documents = Array.from(deserializedShard.getMatchingDocuments("m"));
      expect(documents).toEqual([docIdB]);

      const positions = Array.from(
        deserializedShard.getMatchingInstances("m", docIdB)
      );
      expect(positions).toEqual(
        expect.arrayContaining([["mars", { codepointIndex: 6, wordIndex: 1 }]])
      );
    }
  });

  it("should serialize/deserialize pnp", async () => {
    const chapters = pnpText.split(new RegExp("CHAPTER [A-Z]+."));
    const shard = new PrefixWordShard();

    console.time("index");
    for (let i = 0; i < chapters.length; i++) {
      const id = String(i) as DocumentId;
      shard.updateDocument(id, chapters[i]);
    }
    console.timeEnd("index");

    console.time("serialize");
    const serialized = await serialize(shard);
    console.timeEnd("serialize");

    const size = Object.entries(serialized.documents).reduce(
      (p, [documentId, data]) => {
        return p + data.length;
      },
      0
    );

    console.log("data size", size);

    console.time("split");
    const splitOffShard = shard.split();
    console.timeEnd("split");
  });
});
