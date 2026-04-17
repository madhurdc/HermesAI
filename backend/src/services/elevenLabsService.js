import dotenv from "dotenv";
dotenv.config();

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
// "Bella" — free-tier voice
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

/**
 * Convert text to speech using ElevenLabs API.
 * Returns an audio buffer (MP3).
 */
export async function textToSpeech(text, voiceId = DEFAULT_VOICE_ID) {
  // Strip Markdown (asterisks, hashtags) and strictly enforce 2500 char limit
  const cleanText = text.replace(/[*#]/g, "").trim().slice(0, 2500);

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("ElevenLabs API call failed with status code:", response.status);
    console.error("ElevenLabs Error details:", errorBody);
    throw new Error(`ElevenLabs TTS error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
