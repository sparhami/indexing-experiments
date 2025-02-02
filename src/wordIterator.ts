import { isEmojiText } from "./isEmojiText";
import { Utf16IndexToCodePointIndexCalculator } from "./utf16Utils";

export type WordInfo = {
  text: string;
  codePointIndex: number;
  utf16Index: number;
  wordIndex: number;
};

export function* wordIterator(content: string): Iterable<WordInfo> {
  const segmenter = new Intl.Segmenter("en-US", { granularity: "word" });
  const codePointIndexCalculator = new Utf16IndexToCodePointIndexCalculator();

  let wordIndex = 0;
  for (const data of segmenter.segment(content)) {
    if (!data.isWordLike && !isEmojiText(data.segment)) {
      continue;
    }

    const utf16Index = data.index;
    const codePointIndex = codePointIndexCalculator.get(content, utf16Index);

    yield {
      text: data.segment,
      codePointIndex,
      utf16Index,
      wordIndex,
    };

    wordIndex += 1;
  }
}
