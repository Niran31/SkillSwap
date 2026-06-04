import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, X, Send, ChevronDown, MessageCircle, Zap, BookOpen, Brain, AlertTriangle } from 'lucide-react';
import { Lesson } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiTutorChatProps {
  lesson: Lesson;
  learningStyle?: string;
}

const AiTutorChat: React.FC<AiTutorChatProps> = ({ lesson, learningStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Explain this simply',
    'Give me a practice problem',
    'What are the key takeaways?',
    'Quiz me on this topic'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevLessonIdRef = useRef<string>('');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Reset conversation when lesson changes
  useEffect(() => {
    if (lesson.id !== prevLessonIdRef.current) {
      prevLessonIdRef.current = lesson.id;
      setMessages([]);
      setSuggestions([
        'Explain this simply',
        'Give me a practice problem',
        'What are the key takeaways?',
        'Quiz me on this topic'
      ]);
    }
  }, [lesson.id]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await axios.post('/api/ai/tutor', {
        message: text.trim(),
        lessonTitle: lesson.title,
        lessonContent: lesson.content,
        learningStyle: learningStyle || 'Visual',
        conversationHistory
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error('AI Tutor error:', err);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `### ⚠️ Connection Issue\n\nI couldn't reach the AI server right now. Please try again in a moment.\n\n*Tip: Make sure the backend server is running on port 5000.*`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleChipClick = (chip: string) => {
    sendMessage(chip);
  };

  // Simple markdown-like rendering for AI responses
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headings
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-sm font-extrabold text-indigo-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-sm font-extrabold text-indigo-200 mt-2 mb-1">{line.replace('## ', '')}</h2>;
      }
      // Blockquotes
      if (line.startsWith('> ')) {
        return <blockquote key={i} className="border-l-2 border-indigo-500/40 pl-3 my-1.5 text-gray-300 italic text-[11px]">{line.replace('> ', '')}</blockquote>;
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-3 text-[11px] text-gray-300 list-disc">{renderInlineMarkdown(line.replace('- ', ''))}</li>;
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-3 text-[11px] text-gray-300 list-decimal">{renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>;
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={i} className="h-1.5" />;
      }
      // Regular text
      return <p key={i} className="text-[11px] text-gray-300 leading-relaxed">{renderInlineMarkdown(line)}</p>;
    });
  };

  const renderInlineMarkdown = (text: string) => {
    // Bold
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-indigo-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-gray-800 text-emerald-400 px-1 py-0.5 rounded text-[10px] font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-fabPulse group"
          title="Ask AI Tutor"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[540px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-gray-700/50 animate-slideInRight"
          style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.97), rgba(30,27,75,0.97))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50"
            style={{ background: 'linear-gradient(90deg, rgba(79,70,229,0.15), rgba(139,92,246,0.1))' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  AI Tutor
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                </h3>
                <p className="text-[9px] text-gray-400 font-medium truncate max-w-[220px]">
                  Studying: {lesson.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setIsOpen(false); }}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="animate-messageSlideIn">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="glass-dark rounded-xl rounded-tl-sm px-3.5 py-3 max-w-[85%]">
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      👋 Hi! I'm your <strong className="text-white">AI Tutor</strong> for this lesson. I've read through <strong className="text-indigo-300">"{lesson.title}"</strong> and I'm ready to help!
                    </p>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
                      Ask me anything about the lesson, or try one of the quick actions below ↓
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2.5 animate-messageSlideIn ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}
                <div className={`rounded-xl px-3.5 py-2.5 max-w-[82%] ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-blue-500/10'
                    : 'glass-dark rounded-tl-sm border border-gray-700/30'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-[11px] leading-relaxed font-medium">{msg.content}</p>
                  ) : (
                    <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5 animate-messageSlideIn">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="glass-dark rounded-xl rounded-tl-sm px-4 py-3 border border-gray-700/30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2 border-t border-gray-700/30 flex gap-1.5 overflow-x-auto scrollbar-none"
            style={{ background: 'rgba(17,24,39,0.6)' }}
          >
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                disabled={isLoading}
                className="flex-shrink-0 text-[9px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-full px-2.5 py-1 transition whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {idx === 0 && <Zap className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />}
                {idx === 1 && <BookOpen className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />}
                {idx === 2 && <Brain className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />}
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="px-4 py-3 border-t border-gray-700/40 flex items-center gap-2"
            style={{ background: 'rgba(17,24,39,0.8)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about this lesson..."
              disabled={isLoading}
              className="flex-1 bg-gray-800/60 border border-gray-700/50 focus:border-indigo-500/50 text-white text-xs px-3.5 py-2.5 rounded-xl outline-none placeholder-gray-500 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiTutorChat;
