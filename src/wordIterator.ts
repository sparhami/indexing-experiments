import { isEmojiText } from "./isEmojiText";
import { Utf16IndexToCodePointIndexCalculator } from "./utf16Utils";

export type Word = string & {
  readonly brand: unique symbol;
};

export type WordInfo = {
  text: Word;
  codepointIndex: number;
  wordIndex: number;
};

export type WordInfoWithUtf16Index = WordInfo & {
  utf16Index: number;
};

// @ts-ignore
const segmenter = new Intl.Segmenter("en-US", { granularity: "word" });

export function* wordIterator(
  content: string
): Iterable<WordInfoWithUtf16Index> {
  const codePointIndexCalculator = new Utf16IndexToCodePointIndexCalculator();

  let wordIndex = 0;
  for (const data of segmenter.segment(content)) {
    if (!data.isWordLike && !isEmojiText(data.segment)) {
      continue;
    }

    const utf16Index = data.index;
    const codepointIndex = codePointIndexCalculator.get(content, utf16Index);

    yield {
      text: data.segment as Word,
      codepointIndex,
      utf16Index,
      wordIndex,
    };

    wordIndex += 1;
  }
}
