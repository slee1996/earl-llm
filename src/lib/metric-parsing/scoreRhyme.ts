type VowelPosition = [number, number];

interface VowelPositions {
  [key: string]: VowelPosition;
}

interface Syllable {
  vowels: string[];
  consonants: string;
  stress: string;
}

const MAX_DISTANCE = Math.sqrt(32);

// Vowel positions based on the mapping of the ipa chart
// https://www.ipachart.com/
const VOWEL_POSITIONS: VowelPositions = {
  i: [0, 0],
  y: [0, 0],
  ɪ: [1, 0],
  ʏ: [1, 0],
  e: [0, 1],
  ø: [0, 1],
  ɛ: [0, 2],
  œ: [0, 2],
  æ: [0, 3],
  a: [0, 4],
  ɶ: [0, 4],
  ɨ: [2, 0],
  ʉ: [2, 0],
  ə: [2, 2],
  ɜ: [2, 2],
  ɞ: [2, 2],
  ɐ: [2, 3],
  ɯ: [4, 0],
  u: [4, 0],
  ʊ: [4, 0],
  ɤ: [4, 1],
  o: [4, 1],
  ʌ: [4, 2],
  ɔ: [4, 2],
  ɑ: [4, 4],
  ɒ: [4, 4],
};

export function rhymeScore(phonemes1: string, phonemes2: string): number {
  const syllable1 = getLastSyllable(phonemes1.split(""));
  const syllable2 = getLastSyllable(phonemes2.split(""));

  if (syllable1.vowels.length === 0 || syllable2.vowels.length === 0) {
    return 0;
  }

  const vowelScore = compareVowels(syllable1.vowels, syllable2.vowels);
  const consonantScore = compareConsonants(
    syllable1.consonants,
    syllable2.consonants
  );
  const stressScore = syllable1.stress === syllable2.stress ? 1 : 0.5;

  return 0.6 * vowelScore + 0.3 * consonantScore + 0.1 * stressScore;
}

// Helper functions
function getLastSyllable(phonemes: string[]): Syllable {
  let vowels: string[] = [];
  let consonants = "";
  let stress = "";
  let vowelFound = false;

  for (let i = phonemes.length - 1; i >= 0; i--) {
    const phoneme = phonemes[i];
    if (
      phoneme in VOWEL_POSITIONS ||
      (vowels.length > 0 && phoneme in VOWEL_POSITIONS)
    ) {
      vowels.unshift(phoneme);
      vowelFound = true;
    } else if (phoneme === "ˈ" || phoneme === "ˌ") {
      if (!vowelFound) stress = phoneme;
      if (vowels.length > 0) break;
    } else if (!vowelFound) {
      consonants = phoneme + consonants;
    } else {
      break;
    }
  }

  return { vowels, consonants, stress };
}

function calculateDistance(pos1: VowelPosition, pos2: VowelPosition): number {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function compareConsonants(cons1: string, cons2: string): number {
  if (cons1 === cons2) return 1;
  if (cons1.length === cons2.length) return 0.5;
  return 0;
}

function getAveragePosition(vowels: string[]): VowelPosition {
  const positions = vowels.map((v) => VOWEL_POSITIONS[v] || [0, 0]);
  const sum = positions.reduce(
    (acc, pos) => [acc[0] + pos[0], acc[1] + pos[1]],
    [0, 0]
  );
  return [sum[0] / vowels.length, sum[1] / vowels.length];
}

function compareVowels(vowels1: string[], vowels2: string[]): number {
  const avgPos1 = getAveragePosition(vowels1);
  const avgPos2 = getAveragePosition(vowels2);

  const distance = calculateDistance(avgPos1, avgPos2);
  return 1 - distance / MAX_DISTANCE;
}


