const whitespaceRegexp = new RegExp("\\p{White_Space}", "u");

type CodePoint = number & {
  readonly CodePoint: unique symbol;
};

type CodePointInfo = {
  codePoint: CodePoint;
  codePointIndex: number;
  utf16Index: number;
};

export type WordInfo = {
  text: string;
  codePointIndex: number;
  utf16Index: number;
};

/**
 * Iterates over the code points in a JavaScript string. Yields a code point
 * along with the utf-16 string index it ended at.
 */
function* codePointIterator(content: string): Iterable<CodePointInfo> {
  for (
    let utf16Index = 0, codePointIndex = 0;
    utf16Index < content.length;
    utf16Index++, codePointIndex++
  ) {
    const codePoint = content.codePointAt(utf16Index) as CodePoint;

    // Check for a surrogate pair, need to advance by one.
    if (codePoint > 0xffff) {
      utf16Index++; // Skip next character
    }

    yield {
      codePoint,
      codePointIndex,
      utf16Index,
    };
  }
}

export function* wordIterator(content: string): Iterable<WordInfo> {
  const contentIterator = codePointIterator(content);
  const currentWord: Array<CodePoint> = [];
  let currentWordLastCodePointIndex: number = 0;
  let currentWordLastUtf16Index: number = 0;

  function getWordInfo() {
    const text = String.fromCodePoint(...currentWord);

    return {
      text,
      utf16Index: currentWordLastUtf16Index - text.length + 1,
      codePointIndex: currentWordLastCodePointIndex - currentWord.length + 1,
    };
  }

  for (const info of contentIterator) {
    const { codePoint, codePointIndex, utf16Index } = info;
    const char = String.fromCodePoint(codePoint);
    const isWhitespace = whitespaceRegexp.test(char);

    if (!isWhitespace) {
      currentWord.push(codePoint);
      currentWordLastUtf16Index = utf16Index;
      currentWordLastCodePointIndex = codePointIndex;
    } else if (currentWord.length) {
      yield getWordInfo();
      currentWord.length = 0;
    }
  }

  // Add the last word, if any.
  if (currentWord.length) {
    yield getWordInfo();
  }
}
