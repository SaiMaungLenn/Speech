/**
 * Decodes a base64 string into a Uint8Array of bytes.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw audio data into an AudioBuffer.
 * Note: Gemini TTS usually returns raw PCM or encoded audio without headers in some contexts,
 * but strictly following the examples, we treat it as decodable via AudioContext.
 */
export async function decodeAudioData(
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const audioBytes = decode(base64String);
  
  // Note: The prompt example uses a manual PCM decoding loop for Live API, 
  // but for the generateContent TTS model, the response is typically a container format 
  // that standard decodeAudioData can handle or raw PCM.
  // However, the prompt specifically for "Generate Speech" uses this exact signature:
  // await decodeAudioData(decode(base64), ctx, 24000, 1)
  // AND explicitly defines the manual decoding function for PCM.
  // We will use the manual decoding function provided in the prompt "Audio Decoding" section
  // to be safe and compliant with the provided examples for "raw PCM data".
  
  // HOWEVER, the prompt instruction says "The audio bytes returned by the API is raw PCM data... it contains no header".
  // So we must use the manual PCM decoder logic.

  const sampleRate = 24000; // Standard for Gemini TTS
  const numChannels = 1;
  
  const dataInt16 = new Int16Array(audioBytes.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  
  return buffer;
}
