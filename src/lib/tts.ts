let audioContext: AudioContext | null = null;
const base64Cache = new Map<string, string>(); 
const bufferCache = new Map<string, AudioBuffer>();
const prefetchingQueue = new Set<string>();
let currentSource: AudioBufferSourceNode | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext({ sampleRate: 24000 });
  }
  return audioContext;
}

/**
 * Preload audio for a given text to minimize future wait time.
 * For short/simple sounds, we skip AI preloading to save quota and use local synthesis instead.
 */
export async function preload(text: string, slow = false, forceAI = false) {
  // Fast path: Don't preload complex AI for very short strings unless forced
  if (!forceAI && text.length <= 12) return;

  const cacheKey = `${text}_${slow}`;
  if (base64Cache.has(cacheKey) || prefetchingQueue.has(cacheKey)) return;
  
  prefetchingQueue.add(cacheKey);
  try {
    const base64 = await fetchAudioBase64(text, slow);
    if (base64) {
      await decodeToBuffer(base64, cacheKey);
    }
  } finally {
    prefetchingQueue.delete(cacheKey);
  }
}

async function decodeToBuffer(base64: string, cacheKey: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(cacheKey)) return bufferCache.get(cacheKey)!;
  
  try {
    const ctx = getAudioContext();
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Int16Array(len / 2);
    
    for (let i = 0; i < len; i += 2) {
      const low = binaryString.charCodeAt(i);
      const high = binaryString.charCodeAt(i + 1);
      bytes[i / 2] = (high << 8) | low;
    }

    const float32 = new Float32Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      float32[i] = bytes[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    bufferCache.set(cacheKey, buffer);
    return buffer;
  } catch (e) {
    console.error("Decoding error:", e);
    return null;
  }
}

async function fetchAudioBase64(text: string, slow = false): Promise<string | null> {
  const cacheKey = `${text}_${slow}`;
  if (base64Cache.has(cacheKey)) return base64Cache.get(cacheKey)!;

  try {
    const lowText = text.toLowerCase();
    
    // Core phonetic rules
    const isSchwaCase = lowText === 'e' || (lowText.length === 2 && lowText.endsWith('e'));
    const isNasalIn = lowText === 'in' || lowText === 'ain' || lowText === 'ein';
    const isNasalAn = lowText === 'an' || lowText === 'en';
    const isNasalOn = lowText === 'on';
    const isNasalUn = lowText === 'un';
    const isPh = lowText === 'ph';
    const isTh = lowText === 'th';
    const isGn = lowText === 'gn';
    const isCh = lowText === 'ch';
    const isOu = lowText === 'ou';
    const isOi = lowText === 'oi';
    const isAi = lowText === 'ai' || lowText === 'ei';
    const isAu = lowText === 'au' || lowText === 'eau';
    const isEu = lowText === 'eu' || lowText === 'oeu';

    let baseInstruction = "Tu es un expert en phonétique FRANÇAISE. Tu as une voix d'HOMME, claire, calme et très naturelle. C'est un exercice de lecture pour enfants.";
    let phoneticDetail = "";

    if (isSchwaCase) {
      phoneticDetail = `Prononce cette syllabe isolée '${text}' avec le son 'e' caduc (le 'e' muet, comme dans 'le' ou 'petit'). Absolument pas de son 'é'.`;
    } else if (isNasalIn) {
      phoneticDetail = `Prononce le son nasal 'in' (IPA: /ɛ̃/). Comme dans 'lapin', 'pain', 'timbre'. Attention: ce n'est PAS le son 'ine' (/in/), ne prononce pas le 'n' à la fin.`;
    } else if (isNasalAn) {
      phoneticDetail = `Prononce le son nasal 'an' (IPA: /ɑ̃/). Comme dans 'maman', 'vent', 'enfant'. Attention: ne prononce pas le 'n' à la fin.`;
    } else if (isNasalOn) {
      phoneticDetail = `Prononce le son nasal 'on' (IPA: /ɔ̃/). Comme dans 'ballon', 'pont'. Attention: ne prononce pas le 'n' à la fin.`;
    } else if (isNasalUn) {
      phoneticDetail = `Prononce le son nasal 'un' (IPA: /œ̃/). Comme dans 'lundi', 'un'. Attention: ne prononce pas le 'n' à la fin.`;
    } else if (isPh) {
      phoneticDetail = `Prononce le son 'ph' qui fait /f/ comme dans 'photo'. Prononce juste le son /f/ très clairement.`;
    } else if (isTh) {
      phoneticDetail = `Prononce le son 'th' qui fait /t/ comme dans 'thé'. Prononce juste le son /t/ très clairement.`;
    } else if (isGn) {
      phoneticDetail = `Prononce le son 'gn' qui fait /ɲ/ comme dans 'montagne'. Prononce juste le son /ɲ/ très clairement.`;
    } else if (isCh) {
      phoneticDetail = `Prononce le son 'ch' qui fait /ʃ/ comme dans 'chat'. Prononce juste le son /ʃ/ très clairement.`;
    } else if (isOu) {
      phoneticDetail = `Prononce le digraphe 'ou' qui fait /u/ comme dans 'loup' ou 'genou'. Prononce juste le son /u/ très clairement.`;
    } else if (isOi) {
      phoneticDetail = `Prononce le digraphe 'oi' qui fait /wa/ comme dans 'roi' ou 'oiseau'. Prononce juste le son /wa/ très clairement.`;
    } else if (isAi) {
      phoneticDetail = `Prononce le digraphe '${text}' qui fait le son /ɛ/ (e ouvert) comme dans 'lait' ou 'neige'.`;
    } else if (isAu) {
      phoneticDetail = `Prononce le digraphe '${text}' qui fait le son /o/ (o fermé) comme dans 'auto' ou 'bateau'.`;
    } else if (isEu) {
      phoneticDetail = `Prononce '${text}' qui fait le son /ø/ comme dans 'feu' ou 'bleu'.`;
    } else if (text.length <= 3) {
      phoneticDetail = `Prononce cette syllabe isolée '${text}' de manière fluide, claire et pédagogique. La voix doit être chaleureuse et très bienveillante.`;
    } else {
      phoneticDetail = `Prononce ce contenu de manière fluide, naturelle et parfaitement articulée. Adopte un ton encourageant et bienveillant.`;
    }

    let speedInstruction = slow 
      ? "Parle posément et distinctement pour un élève qui apprend à lire, sans être saccadé. Garde une intonation naturelle et fluide."
      : "Parle à un rythme normal et naturel.";

    const instruction = `${baseInstruction} ${phoneticDetail} ${speedInstruction} Ne pas épeler les lettres.`;

    const response = await fetch("/api/gemini/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${instruction}\n\nContenu : ${text}` }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to generate speech");

    const base64Audio = data.data;
    if (base64Audio) {
      base64Cache.set(cacheKey, base64Audio);
      return base64Audio;
    }
  } catch (error: any) {
    console.error("TTS Fetch Error:", error);
  }
  return null;
}

export async function speak(text: string, slow = false, forceAI = false) {
  const cacheKey = `${text}_${slow}`;

  // Cancel current speech
  stop();
  window.speechSynthesis.cancel();

  // Prefer the pedagogical AI voice for learning content. Only fall back to the
  // browser speech engine if the AI audio cannot be produced.
  const phonemes = ['in', 'ain', 'ein', 'un', 'an', 'en', 'on', 'eu', 'ou', 'oi', 'au', 'eau', 'ph', 'th', 'gn', 'ch'];
  const lowText = text.toLowerCase();
  const isDifficultPhoneme = phonemes.includes(lowText);

  // If the content is already cached, use the cached AI audio immediately.
  if (base64Cache.has(cacheKey) || bufferCache.has(cacheKey)) {
    // cached path
  } else if (!forceAI && text.length <= 15 && !isDifficultPhoneme) {
    // For very simple inputs, still try the AI voice first so the learner hears the
    // intended French pronunciation instead of a generic browser voice.
  }
  
  // 1. Check Buffer Cache (Instant if preloaded/cached)
  let buffer = bufferCache.get(cacheKey);
  
  // Parallel attempt: If not in cache, start fetching but don't block yet if we can use a fallback?
  // No, user wants QUALITY for long texts (sentences), so we wait for AI but optimize the fetch.
  
  if (!buffer) {
    const base64 = await fetchAudioBase64(text, slow);
    if (base64) {
      buffer = await decodeToBuffer(base64, cacheKey);
    }
  }
  
  if (buffer) {
    try {
      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      currentSource = source;
      source.onended = () => { if (currentSource === source) currentSource = null; };
      source.start();
      return;
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }

  // Final fallback to system TTS
  systemSpeak(text, slow);
}

export function stop() {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource = null;
    } catch (e) {}
  }
  window.speechSynthesis.cancel();
}

function systemSpeak(text: string, slow = false) {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  let processedText = text.toLowerCase();
  
  // Phonetic corrections for local TTS (Web Speech API)
  // Especially for the French 'e' sound (schwa)
  if (processedText === 'e' || processedText === 'me' || processedText === 're' || processedText === 'le' || processedText === 'de' || processedText === 'se' || processedText === 'te') {
    // Adding a space or using a word context can help some engines with the schwa sound
    processedText = processedText + " ";
  }

  const utterance = new SpeechSynthesisUtterance(processedText);
  utterance.lang = 'fr-FR';
  utterance.rate = slow ? 0.7 : 0.85; // Slightly slower for better clarity
  utterance.pitch = 1.05; // Slightly higher for child-friendly tone

  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Thomas') || v.name.includes('Paul') || v.name.includes('Male'))) 
               || voices.find(v => v.lang.startsWith('fr') && v.name.includes('Google')) 
               || voices.find(v => v.lang.startsWith('fr'));
  
  if (frVoice) {
    utterance.voice = frVoice;
  }

  window.speechSynthesis.speak(utterance);
}
