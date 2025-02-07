// Using RGI_Emoji for the most part, but also allow for emojis without
// variation selector (e.g. ❤) using `\p{Emoji}`.
const recognizedOnlyRegExp = new RegExp("^(\\p{RGI_Emoji}|\\p{Emoji})+$", "v");
// Allow for unrecognized combinations to be treated as emojis, e.g.
// `["❤", "\uFE0F", "\u200D", "🍅"].join()`. Generally more useful to
// allow for any combination, since the given platform may be old and not
// understand a new combination.
const allEmojiPartsRegExp = new RegExp(
  "^(\\p{Emoji}||\\uFE0F|\\p{Emoji_Presentation}|\\p{Emoji_Modifier}|\\p{Emoji_Component})+$",
  "v"
);

/**
 * @returns True if the given content is made up of only emoji characters.
 */
export function isEmojiText(content: string, recognizedOnly = false) {
  const regExp = recognizedOnly ? recognizedOnlyRegExp : allEmojiPartsRegExp;

  // Reset from any previous usage so that we can reuse the RegExp object rather
  // than creating a new one each time.
  regExp.lastIndex = 0;
  return regExp.test(content);
}
