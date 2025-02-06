// package: ProtoWordShard
// file: proto/protoWordShard.proto

import * as jspb from "google-protobuf";

export class Document extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getRevision(): number;
  setRevision(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Document.AsObject;
  static toObject(includeInstance: boolean, msg: Document): Document.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Document, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Document;
  static deserializeBinaryFromReader(message: Document, reader: jspb.BinaryReader): Document;
}

export namespace Document {
  export type AsObject = {
    id: string,
    revision: number,
  }
}

export class WordLocation extends jspb.Message {
  getWordIndex(): number;
  setWordIndex(value: number): void;

  getCodepointIndex(): number;
  setCodepointIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WordLocation.AsObject;
  static toObject(includeInstance: boolean, msg: WordLocation): WordLocation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WordLocation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WordLocation;
  static deserializeBinaryFromReader(message: WordLocation, reader: jspb.BinaryReader): WordLocation;
}

export namespace WordLocation {
  export type AsObject = {
    wordIndex: number,
    codepointIndex: number,
  }
}

export class WordEntry extends jspb.Message {
  hasText(): boolean;
  clearText(): void;
  getText(): string;
  setText(value: string): void;

  hasIndex(): boolean;
  clearIndex(): void;
  getIndex(): number;
  setIndex(value: number): void;

  clearWordLocationsList(): void;
  getWordLocationsList(): Array<WordLocation>;
  setWordLocationsList(value: Array<WordLocation>): void;
  addWordLocations(value?: WordLocation, index?: number): WordLocation;

  getWordCase(): WordEntry.WordCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WordEntry.AsObject;
  static toObject(includeInstance: boolean, msg: WordEntry): WordEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WordEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WordEntry;
  static deserializeBinaryFromReader(message: WordEntry, reader: jspb.BinaryReader): WordEntry;
}

export namespace WordEntry {
  export type AsObject = {
    text: string,
    index: number,
    wordLocationsList: Array<WordLocation.AsObject>,
  }

  export enum WordCase {
    WORD_NOT_SET = 0,
    TEXT = 1,
    INDEX = 2,
  }
}

export class DocumentEntry extends jspb.Message {
  clearWordEntriesList(): void;
  getWordEntriesList(): Array<WordEntry>;
  setWordEntriesList(value: Array<WordEntry>): void;
  addWordEntries(value?: WordEntry, index?: number): WordEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DocumentEntry.AsObject;
  static toObject(includeInstance: boolean, msg: DocumentEntry): DocumentEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DocumentEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DocumentEntry;
  static deserializeBinaryFromReader(message: DocumentEntry, reader: jspb.BinaryReader): DocumentEntry;
}

export namespace DocumentEntry {
  export type AsObject = {
    wordEntriesList: Array<WordEntry.AsObject>,
  }
}

