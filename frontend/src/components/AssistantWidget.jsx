import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, MessageSquare, X, Send, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssistantWidget({ language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const getLangCode = (lang) => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'mr': return 'mr-IN';
      default: return 'en-IN';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);
  
  useEffect(() => {
    // Initialize SpeechRecognition if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = getLangCode(language);
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]); // Re-initialize if language changes

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = getLangCode(language); // Ensure lang is fresh
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const speakText = (text, langCode) => {
    if ('speechSynthesis' in window && isVoiceEnabled) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }) 
      });
      
      const data = await response.json();
      
      setMessages([...newMessages, { sender: 'ai', text: data.reply }]);
      speakText(data.reply, getLangCode(language));
      
      // Handle actions
      if (data.action === 'navigate_app' && data.action_data?.page_name) {
          const target = data.action_data.page_name.toLowerCase();
          
          if (target === 'home') {
            setTimeout(() => navigate('/'), 2000);
          } else if (target === 'contact') {
            setTimeout(() => navigate('/contact'), 2000);
          } else {
            // For inner farmer tabs: booking, auction, prices
            let tab = 'dashboard';
            if (target === 'booking') tab = 'book';
            if (target === 'auction') tab = 'bidding';
            if (target === 'prices') tab = 'dashboard';
            
            setTimeout(() => {
              sessionStorage.setItem("krishak-mitra-farmer-tab", tab);
              // Dispatch event in case already on farmer page
              window.dispatchEvent(new Event("storage")); 
              navigate('/farmer');
            }, 2000);
          }
      }
      
    } catch (error) {
      console.error("Error talking to AI assistant:", error);
      setMessages([...newMessages, { sender: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[32rem] flex flex-col border border-gray-100 overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">KrishakMitra AI</h3>
                  <p className="text-xs text-green-100">Online & Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsVoiceEnabled(!isVoiceEnabled);
                    if (isVoiceEnabled) window.speechSynthesis.cancel();
                  }} 
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  title={isVoiceEnabled ? "Mute Voice" : "Unmute Voice"}
                >
                  {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Hello! How can I help you today?</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <span className="text-xs bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors" onClick={() => handleSendMessage("Take me to booking")}>"Take me to booking"</span>
                    <span className="text-xs bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors" onClick={() => handleSendMessage("Show mandi prices")}>"Show mandi prices"</span>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-green-600" />
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <button 
                onClick={toggleListening}
                className={`p-2.5 rounded-full flex-shrink-0 transition-all ${isListening ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              >
                {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
              </button>
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder={isListening ? "Listening..." : "Type a message..."}
                className="flex-1 bg-gray-50 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all"
              />
              <button 
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className={`p-2.5 rounded-full flex-shrink-0 transition-all ${!inputText.trim() ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'}`}
              >
                <Send size={18} className={inputText.trim() ? 'ml-0.5' : ''} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isOpen && (
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center relative group"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        </motion.button>
      )}
    </div>
  );
}
