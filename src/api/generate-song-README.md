# Song Generation API Endpoint

This document describes the `/generate-song` endpoint of our Song Generation API.

## Endpoint: Generate Song

Generates a complete song based on the provided components and parameters.

- **URL**: `/generate-song` (Base URL to be specified)
- **Method**: POST
- **Auth Required**: (To be specified)

## Request Body

The request body should be a JSON object conforming to the `SongGenerationRequest` interface:

```typescript
{
  songComponents: Array<{
    lineLimit: number,
    meter: number[][],
    selectedSystemPrompt: keyof SystemPrompts | string,
    selectedUserPrompt: keyof UserPrompts,
    customSystemPrompt?: string,
    rhymeScheme: string
  }>,
  songTitle?: string,
  songDescription?: string,
  clientChoice?: "anthropic" | "openai" | "llama",
  rhymeScheme?: string
}
```

### Field Descriptions

- `songComponents`: An array of `SongComponent` objects, each describing a component of the song (verse, chorus, etc.)
  - `lineLimit`: The number of lines for this component
  - `meter`: A 2D array representing the metrical structure for this component (see Meter Structure section below)
  - `selectedSystemPrompt`: A key from the `SystemPrompts` object or a custom string
  - `selectedUserPrompt`: A key from the `UserPrompts` object
  - `customSystemPrompt` (optional): A custom system prompt
  - `rhymeScheme`: The rhyme scheme for this component
- `songTitle` (optional): The title of the song
- `songDescription` (optional): A description of the song
- `clientChoice` (optional): The choice of LLM to use for generation ("anthropic", "openai", or "llama")
- `rhymeScheme` (optional): A global rhyme scheme for the entire song

### Meter Structure

The `meter` field is a 2D array of numbers representing the stress pattern for each line of the component. Each subarray represents a line, where:

- `1` represents a stressed syllable
- `0` represents an unstressed syllable

For example:
```javascript
meter: [
  [1, 0, 1, 0, 1],  // First line: stressed-unstressed-stressed-unstressed-stressed
  [0, 1, 0, 1, 0]   // Second line: unstressed-stressed-unstressed-stressed-unstressed
]
```

This structure allows for precise control over the rhythm and stress patterns of the generated lyrics.

## System Prompts

The `selectedSystemPrompt` can be one of the following keys from the `SystemPrompts` object:

- `rapper`
- `popstar`
- `rockStar`
- `countryArtist`
- `electropopStar`

Alternatively, you can provide a custom system prompt string.

## User Prompts

The `selectedUserPrompt` must be one of the following keys from the `UserPrompts` object:

- `VERSE`
- `CHORUS`
- `BRIDGE`
- `OUTRO`
- `INTRO`
- `PRECHORUS`
- `ARBITRARY`

Each of these prompts is a function that takes specific parameters and returns an object with `role` and `content` properties.

## Response

### Success Response

- **Code**: 200 OK
- **Content**: An array of `LyricComponent` objects

```typescript
[
  {
    component: string, // e.g., "chorus", "verse", etc.
    lyrics: string[]
  },
  // ... more components
]
```

### Error Response

- **Code**: 500 Internal Server Error
- **Content**: `{ error: string }`

## Notes

1. The API generates lyrics for each component in the order provided.
2. Chorus components with the same `lineLimit` are only generated once and reused.
3. Each component has access to previously generated components, allowing for contextual generation.
4. The global `rhymeScheme` (if provided) applies to the entire song, while component-specific `rhymeScheme` fields apply to individual components.

## Example Usage

```javascript
const response = await fetch('/generate-song', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Add any necessary authentication headers
  },
  body: JSON.stringify({
    songComponents: [
      {
        lineLimit: 4,
        meter: [[1,0,1,0,1,0,1,0],[1,0,1,0,1,0],[1,0,1,0,1,0,1,0],[1,0,1,0,1,0]],
        selectedSystemPrompt: "countryArtist",
        selectedUserPrompt: "VERSE",
        rhymeScheme: "abab"
      },
      {
        lineLimit: 4,
        meter: [[1,0,1,0,1,0,1,0],[1,0,1,0,1,0,1,0],[1,0,1,0,1,0,1,0],[1,0,1,0,1,0,1,0]],
        selectedSystemPrompt: "countryArtist",
        selectedUserPrompt: "CHORUS",
        rhymeScheme: "aabb"
      },
      // ... more components
    ],
    songTitle: "My Country Road",
    songDescription: "A nostalgic country song about returning home",
    clientChoice: "anthropic"
  })
});

const song = await response.json();
```

## Error Handling

If an error occurs during song generation, the API will return a 500 Internal Server Error with an error message in the response body.

## Additional Information

(Add any additional information, rate limits, etc. here)
