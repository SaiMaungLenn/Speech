import React, { useState, useRef, useEffect } from 'react';
import { VoiceName } from './types';
import { VoiceSelector } from './components/VoiceSelector';
import { generateSpeech } from './services/geminiService';
import { decodeAudioData } from './utils/audioUtils';
import { AudioVisualizer } from './components/AudioVisualizer';

const SAMPLE_BURMESE_TEXT = "မင်္ဂလာပါ၊ ကျွန်တော်က Gemini ဖြစ်ပါတယ်။ ဒီနေ့ ဘာအကူအညီပေးရမလဲခင်ဗျာ။";

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Kore);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore error if already stopped
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) return;
    
    stopAudio();
    setLoading(true);
    setError(null);

    try {
      // 1. Initialize Audio Context if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      // Ensure context is running (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 2. Fetch Audio
      const base64Audio = await generateSpeech(text, selectedVoice);

      if (!base64Audio) {
        throw new Error("No audio data received. The model may have returned an empty response.");
      }

      // 3. Decode Audio
      const audioBuffer = await decodeAudioData(base64Audio, audioContextRef.current);

      // 4. Setup Source and Analyser
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;

      const newAnalyser = audioContextRef.current.createAnalyser();
      newAnalyser.fftSize = 256;
      source.connect(newAnalyser);
      newAnalyser.connect(audioContextRef.current.destination);

      source.onended = () => {
        setIsPlaying(false);
      };

      sourceRef.current = source;
      analyserRef.current = newAnalyser;
      setAnalyser(newAnalyser);

      // 5. Play
      source.start();
      setIsPlaying(true);

    } catch (err: any) {
      console.error(err);
      // Display the specific error message (e.g. if Gemini refused the text)
      setError(err.message || "Failed to generate speech. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInsertSample = () => {
    setText(SAMPLE_BURMESE_TEXT);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Gemini <span className="text-blue-600">Polyglot TTS</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Generate lifelike speech in multiple languages, including <span className="font-semibold text-slate-800">Burmese (Myanmar)</span>.
            Powered by the Gemini 2.5 Flash model.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Top Section: Voice Selection */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">Select Voice Persona</h2>
            <VoiceSelector 
              selectedVoice={selectedVoice} 
              onSelect={setSelectedVoice}
              disabled={loading || isPlaying}
            />
          </div>

          {/* Middle Section: Input */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <label htmlFor="text-input" className="text-sm font-semibold text-slate-700">
                Text to Speech
              </label>
              <button 
                onClick={handleInsertSample}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors"
              >
                Insert Burmese Sample
              </button>
            </div>
            
            <div className="relative">
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text here... (Supports English, Burmese, etc.)"
                className="w-full h-40 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-lg burmese-text leading-relaxed text-slate-800 placeholder:text-slate-400"
                disabled={loading}
              />
              {text.length > 0 && (
                <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium pointer-events-none">
                  {text.length} chars
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Actions & Visualizer */}
          <div className="p-8 bg-slate-900 text-white flex flex-col gap-6">
            
            {/* Visualizer Area */}
            <div className="relative w-full h-24 bg-slate-800/50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700">
               {isPlaying ? (
                 <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
               ) : (
                 <div className="text-slate-500 text-sm flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                   Ready to generate audio
                 </div>
               )}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : isPlaying ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                    <span className="text-sm font-medium">
                        {loading ? 'Generating...' : isPlaying ? 'Playing Audio' : 'Idle'}
                    </span>
                  </div>
               </div>

               <div className="flex gap-3">
                 {isPlaying && (
                   <button
                     onClick={stopAudio}
                     className="px-6 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all shadow-lg flex items-center gap-2"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Stop
                   </button>
                 )}
                 
                 <button
                   onClick={handleGenerateAndPlay}
                   disabled={loading || !text.trim()}
                   className={`
                     px-8 py-3 rounded-full font-bold text-white shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all transform active:scale-95
                     ${loading || !text.trim() 
                       ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                       : 'bg-blue-600 hover:bg-blue-500'
                     }
                   `}
                   title={text.trim() ? "Generate Speech" : "Enter text to generate"}
                 >
                   {loading ? (
                     <>
                       <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Processing...
                     </>
                   ) : (
                     <>
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                       Generate Speech
                     </>
                   )}
                 </button>
               </div>
            </div>

            {error && (
              <div className="mt-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

          </div>
        </div>
        
        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Use the <span className="font-mono bg-slate-200 text-slate-600 rounded px-1">Gemini 2.5</span> model via Google GenAI SDK.</p>
        </div>
      </div>
    </div>
  );
};

export default App;