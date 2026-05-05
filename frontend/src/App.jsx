import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  ArrowRightLeft, 
  Copy, 
  Download, 
  Volume2, 
  Mic, 
  History, 
  Moon, 
  Sun,
  Loader2,
  Trash2,
  Share2
} from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const API_URL = 'http://localhost:8000';

function App() {
  const [languages, setLanguages] = useState([]);
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es'); // Default to Spanish
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const debounceTimer = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Load languages and history on mount
  useEffect(() => {
    fetchLanguages();
    fetchHistory();
    // Check dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Update source text when speech recognition is active
  useEffect(() => {
    if (listening && transcript) {
      setSourceText(transcript);
    }
  }, [transcript, listening]);

  const fetchLanguages = async () => {
    try {
      const res = await axios.get(`${API_URL}/languages`);
      setLanguages(res.data);
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleTranslate = async (textToTranslate) => {
    if (!textToTranslate.trim()) {
      setTranslatedText('');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/translate`, {
        text: textToTranslate,
        source_lang: sourceLang,
        target_lang: targetLang
      });
      setTranslatedText(res.data.translated_text);
      if (res.data.source_lang && sourceLang === 'auto') {
        // We could update a state to show detected language if desired
      }
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Error during translation. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce translation as user types
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (sourceText) {
      debounceTimer.current = setTimeout(() => {
        handleTranslate(sourceText);
      }, 800);
    } else {
      setTranslatedText('');
    }
    
    return () => clearTimeout(debounceTimer.current);
  }, [sourceText, sourceLang, targetLang]);

  const handleSwap = () => {
    if (sourceLang === 'auto') return; // Cannot swap 'auto'
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (text, filename) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const handleShare = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Translated Text',
          text: text,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      handleCopy(text);
      alert("Text copied to clipboard. Sharing is not supported on this browser.");
    }
  };

  const handleSpeak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'auto' ? 'en-US' : lang; // Fallback to en-US
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const toggleMic = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
        
        {/* Navbar */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 text-white p-2 rounded-lg">
              <ArrowRightLeft size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
              LingoSync
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="History"
            >
              <History size={20} />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
          
          {/* Translation Area */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Language Selectors & Swap */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm">
              <div className="flex-1">
                <select 
                  className="w-full bg-transparent p-3 outline-none text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                >
                  <option value="auto">Detect Language</option>
                  {languages.map(lang => (
                    <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleSwap}
                disabled={sourceLang === 'auto'}
                className="p-3 mx-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                <ArrowRightLeft size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              
              <div className="flex-1">
                <select 
                  className="w-full bg-transparent p-3 outline-none text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={`tgt-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input/Output Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Source Box */}
              <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 transition-shadow h-80">
                <textarea
                  className="flex-1 w-full p-5 bg-transparent resize-none outline-none text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400"
                  placeholder="Type to translate..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                ></textarea>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleMic}
                      className={`p-2 rounded-full transition ${listening ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                      title="Voice Input"
                    >
                      <Mic size={20} />
                    </button>
                    <button 
                      onClick={() => handleSpeak(sourceText, sourceLang)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                      title="Listen"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    {sourceText.length} chars
                  </div>
                </div>
              </div>

              {/* Target Box */}
              <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-80 relative">
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10 backdrop-blur-[1px]">
                    <Loader2 size={32} className="animate-spin text-primary-500" />
                  </div>
                )}
                
                <div className="flex-1 w-full p-5 bg-transparent overflow-y-auto text-lg text-gray-800 dark:text-gray-100 font-medium">
                  {translatedText || (
                    <span className="text-gray-400 font-normal italic">Translation will appear here...</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSpeak(translatedText, targetLang)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                      title="Listen"
                      disabled={!translatedText}
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(translatedText)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                      title="Copy"
                      disabled={!translatedText}
                    >
                      <Copy size={20} />
                    </button>
                    <button 
                      onClick={() => handleShare(translatedText)}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                      title="Share"
                      disabled={!translatedText}
                    >
                      <Share2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDownload(translatedText, 'translation.txt')}
                      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
                      title="Download"
                      disabled={!translatedText}
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Sidebar / History Panel */}
          {showHistory && (
            <div className="w-full md:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-120px)] sticky top-24 overflow-hidden shrink-0">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <History size={18} />
                  Recent Translations
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {history.length === 0 ? (
                  <div className="text-center p-8 text-gray-400 text-sm">
                    No history yet
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {history.map(item => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition"
                        onClick={() => {
                          setSourceLang(item.source_lang);
                          setTargetLang(item.target_lang);
                          setSourceText(item.source_text);
                          setTranslatedText(item.translated_text);
                        }}
                      >
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span className="uppercase font-bold">{item.source_lang}</span>
                          <ArrowRightLeft size={10} />
                          <span className="uppercase font-bold">{item.target_lang}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.source_text}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {item.translated_text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
