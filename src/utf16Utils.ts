/**
 * A class for calculating a codepoint index from a utf16 index. Internally,
 * this caches the last result based on an input string, which improves
 * performance when called multiple times with increasing utf16 indexes.
 */
export class Utf16IndexToCodePointIndexCalculator {
  private lastString = "";
  private lastUtf16Index = 0;
  private lastCodePointIndex = 0;

  get(str: string, utf16Index: number) {
    if (utf16Index < 0 || utf16Index >= str.length) {
      throw new Error("utf16Index must be existing with the string bounds.");
    }

    if (str !== this.lastString || utf16Index < this.lastUtf16Index) {
      this.lastString = str;
      this.lastUtf16Index = 0;
      this.lastCodePointIndex = 0;
    }

    let codePointCount = 0;
    for (let i = this.lastUtf16Index; i < utf16Index; i++) {
      const codePoint = str.codePointAt(i)!;

      // Check for a surrogate pair, need to advance by one.
      if (codePoint > 0xffff) {
        i++; // Skip next character
      }

      codePointCount++;
    }

    this.lastUtf16Index = utf16Index;
    this.lastCodePointIndex = this.lastCodePointIndex + codePointCount;

    return this.lastCodePointIndex;
  }
}
