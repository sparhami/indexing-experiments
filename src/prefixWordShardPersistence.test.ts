import { describe, it, expect, beforeAll, jest } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";

import { LocalPrefixWordShard } from "./localPrefixWordShard";
import { deserialize, serialize } from "./prefixWordShardPersistence";
import { DocumentId } from "./indexTypes";

const pnpText = readFileSync(join(__dirname, "testdata", "pnp.text"), "utf8");

describe("prefixWordShard persistence", () => {
  const docIdA = "idA" as DocumentId;
  const docIdB = "idB" as DocumentId;
  let encryptionFn: (data: ArrayBuffer) => Promise<ArrayBuffer> = null!;
  let decryptionFn: (data: ArrayBuffer) => Promise<ArrayBuffer> = null!;

  beforeAll(async () => {
    const iv = await global.crypto.getRandomValues(new Uint8Array(12));
    const key = await global.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
    encryptionFn = (data: ArrayBuffer) => {
      return global.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        data
      );
    };
    decryptionFn = (data: ArrayBuffer) => {
      return global.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        data
      );
    };
  });

  it("should serialize / deserialize", async () => {
    const shard = new LocalPrefixWordShard();
    shard.updateDocument(docIdA, "hello world hello");
    shard.updateDocument(docIdB, "hello mars");

    const encryptionSpy = jest.fn((data: ArrayBuffer) => {
      return encryptionFn(data);
    });
    const serialized = await serialize(shard, encryptionSpy);

    // Check that the serialized data contains the result of the encryption
    // function.
    {
      const results = await Promise.all(
        encryptionSpy.mock.results.map(({ value }) => value)
      );

      expect(encryptionSpy).toBeCalledTimes(2);
      expect(results).toEqual([
        serialized.documents[docIdA],
        serialized.documents[docIdB],
      ]);
    }

    // Check that deserialization works correctly.
    const deserializedShard = await deserialize(serialized, decryptionFn);

    // Check for something in both documents.
    {
      const documents = Array.from(
        await deserializedShard.getMatchingDocuments("he")
      );
      expect(documents).toEqual(expect.arrayContaining([docIdA, docIdB]));

      const positions = Array.from(
        await deserializedShard.getMatchingInstances("he", docIdA)
      );
      expect(positions).toEqual(
        expect.arrayContaining([
          ["hello", { codepointIndex: 0, wordIndex: 0 }],
          ["hello", { codepointIndex: 12, wordIndex: 2 }],
        ])
      );
    }

    // Check for something in only one document.
    {
      const documents = Array.from(
        await deserializedShard.getMatchingDocuments("m")
      );
      expect(documents).toEqual([docIdB]);

      const positions = Array.from(
        await deserializedShard.getMatchingInstances("m", docIdB)
      );
      expect(positions).toEqual(
        expect.arrayContaining([["mars", { codepointIndex: 6, wordIndex: 1 }]])
      );
    }
  });

  it.skip("should serialize/deserialize pnp", async () => {
    const chapters = pnpText.split(new RegExp("CHAPTER [A-Z]+."));
    const shard = new LocalPrefixWordShard();

    console.time("index");
    for (let i = 0; i < chapters.length; i++) {
      const id = String(i) as DocumentId;
      shard.updateDocument(id, chapters[i]);
    }
    console.timeEnd("index");

    console.time("serialize");
    const serialized = await serialize(shard, encryptionFn);
    console.timeEnd("serialize");

    const size = Object.entries(serialized.documents).reduce(
      (p, [documentId, data]) => {
        return p + data.byteLength;
      },
      0
    );

    console.log("data size", size);

    console.time("split");
    const splitOffShard = shard.split();
    console.timeEnd("split");
  });
});
