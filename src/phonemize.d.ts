declare module 'phonemize' {
  /**
   * Converts a sentence into phonemes.
   * @param sentence - The input sentence to phonemize.
   * @param returnStr - Whether to return the result as a string (true) or an array (false).
   * @returns The phonemized sentence as a string or an array of phonemes.
   */
  export function phonemize(sentence: string, returnStr?: boolean): string | string[][][];
}