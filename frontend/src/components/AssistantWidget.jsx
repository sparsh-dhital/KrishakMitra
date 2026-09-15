import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssistantWidget({ language = "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sendMessageRef = useRef(null);
  const apiUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:8000"
  ).replace(/\/$/, "");

  const getLangCode = (lang) => {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      default:
        return "en-IN";
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = getLangCode(language);
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      sendMessageRef.current?.(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.lang = getLangCode(language);
      let started = false;
      try {
        recognitionRef.current.start();
        started = true;
      } catch (error) {
        console.error("Unable to start speech recognition", error);
      }
      setIsListening(started);
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window) || !isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode(language);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language,
          chat_history: messages.map(({ sender, text: messageText }) => ({
            sender,
            text: messageText,
          })),
        }),
      });
      if (!response.ok)
        throw new Error(`Assistant request failed: ${response.status}`);
      const data = await response.json();
      setMessages([...newMessages, { sender: "ai", text: data.reply }]);
      speakText(data.reply);

      if (data.action === "navigate_app" && data.action_data?.page_name) {
        const target = data.action_data.page_name.toLowerCase();
        if (target === "home") {
          setTimeout(() => navigate("/"), 2000);
        } else if (target === "contact") {
          setTimeout(() => navigate("/contact"), 2000);
        } else {
          const tab =
            target === "booking"
              ? "book"
              : target === "auction"
                ? "bidding"
                : "dashboard";
          setTimeout(() => {
            sessionStorage.setItem("krishak-mitra-farmer-tab", tab);
            window.dispatchEvent(new Event("storage"));
            navigate("/farmer");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error talking to AI assistant:", error);
      setMessages([
        ...newMessages,
        {
          sender: "ai",
          text: "Sorry, I am having trouble connecting to the server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  sendMessageRef.current = handleSendMessage;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-128 flex flex-col border border-gray-100 overflow-hidden mb-4"
          >
            <div className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">KrishakMitra AI</h3>
                  <p className="text-xs text-green-100">
                    Online &amp; Ready to help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsVoiceEnabled(!isVoiceEnabled);
                    if (isVoiceEnabled && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  title={isVoiceEnabled ? "Mute Voice" : "Unmute Voice"}
                >
                  {isVoiceEnabled ? (
                    <Volume2 size={18} />
                  ) : (
                    <VolumeX size={18} />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close assistant"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    Hello! How can I help you today?
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button
                      type="button"
                      className="text-xs bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors"
                      onClick={() => handleSendMessage("Take me to booking")}
                    >
                      Take me to booking
                    </button>
                    <button
                      type="button"
                      className="text-xs bg-white border px-3 py-1.5 rounded-full cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors"
                      onClick={() => handleSendMessage("Show mandi prices")}
                    >
                      Show mandi prices
                    </button>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={`${msg.sender}-${idx}`}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${msg.sender === "user" ? "bg-green-600 text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin text-green-600"
                    />
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <button
                onClick={toggleListening}
                aria-label={
                  isListening ? "Stop listening" : "Start voice input"
                }
                className={`p-2.5 rounded-full shrink-0 transition-all ${isListening ? "bg-red-50 text-red-500 shadow-inner" : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
              >
                {isListening ? (
                  <MicOff size={18} className="animate-pulse" />
                ) : (
                  <Mic size={18} />
                )}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSendMessage(inputText)
                }
                placeholder={isListening ? "Listening..." : "Type a message..."}
                className="flex-1 bg-gray-50 border-transparent rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || loading}
                aria-label="Send message"
                className={`p-2.5 rounded-full shrink-0 transition-all ${!inputText.trim() || loading ? "bg-gray-100 text-gray-400" : "bg-green-600 text-white hover:bg-green-700 hover:shadow-md"}`}
              >
                <Send size={18} className={inputText.trim() ? "ml-0.5" : ""} />
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
          aria-label="Open assistant"
          className="bg-green-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center relative group"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        </motion.button>
      )}
    </div>
  );
}
