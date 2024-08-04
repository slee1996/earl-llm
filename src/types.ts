export interface SystemPrompts {
  rapper: string;
  popstar: string;
  rockStar: string;
  countryArtist: string;
  electropopStar: string;
}

export interface LyricComponent {
  component: string;
  lyrics: string[];
}

export interface UserPromptParams {
  lineLimit: number;
  meterString: string;
  restOfSong: LyricComponent[];
  songTitle: string;
  songDescription: string;
}

export interface UserPrompts {
  VERSE: (params: UserPromptParams) => { role: string; content: string };
  CHORUS: (params: UserPromptParams) => { role: string; content: string };
  BRIDGE: (params: Omit<UserPromptParams, "restOfSong">) => {
    role: string;
    content: string;
  };
}

export interface SongComponent {
  lineLimit: number;
  meter: number[][];
  selectedSystemPrompt: keyof SystemPrompts;
  selectedUserPrompt: keyof UserPrompts;
  customSystemPrompt?: string;
}

export interface SongGenerationRequest {
  songComponents: SongComponent[];
  songTitle?: string;
  songDescription?: string;
  clientChoice?: "anthropic" | "openai" | "llama";
}

export interface RawLyricsOptions extends SongComponent {
  restOfSong: LyricComponent[];
  customSystemPrompt: string;
  songTitle: string;
  songDescription: string;
  clientChoice?: "anthropic" | "openai" | "llama";
}

export interface CorrectionParams {
  lyric: string;
  targetSyllables: number;
  currentLyrics: LyricComponent[];
  meter: number[];
  selectedSystemPrompt: keyof SystemPrompts;
}

export type PhonemeCache = { [key: string]: string };

export interface CorrectionChatParams {
  currentSyllables: number;
  targetSyllables: number;
  lyric: string;
  meter: number[];
  currentLyrics: LyricComponent[];
  selectedSystemPrompt: keyof SystemPrompts;
}

export interface ChatObjectParams {
  clientChoice: "llama" | "openai" | "anthropic";
  customSystemPrompt: string;
  selectedSystemPrompt: keyof SystemPrompts;
  selectedUserPrompt: keyof UserPrompts;
  lineLimit: number;
  finalString: string;
  restOfSong: LyricComponent[];
  songTitle: string;
  songDescription: string;
}

export interface PhonemeData {
  originalString: string;
  phoneme: string;
  syllableCount: number;
  syllableStress: number[];
}
