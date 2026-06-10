import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, AlertCircle, Copy, Check } from "lucide-react";
import { ChatMessage } from "../types";
import avatarUrl from "../assets/images/lin_an_avatar_1781055311230.png";

const SUGGESTED_QUESTIONS = [
  "你现在在做什么？",
  "你有哪些作品？",
  "怎么联系你？",
  "说说你为什么喜欢把复杂问题讲成人话？"
];

const WELCOME_TEXT = "嗨，我是林安的分身 👋 你可以问我最近在忙什么、写过什么、或者怎么联系我。随便聊，不用客气。";

export default function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("lin_an_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: "welcome",
        role: "model",
        text: WELCOME_TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("lin_an_chat_history", JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorStatus(null);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const formattedHistory = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          history: formattedHistory
        })
      });

      if (!response.ok) {
        let serverMessage = "连接失败";
        try {
          const errorData = await response.json();
          serverMessage = errorData.details || errorData.error || serverMessage;
        } catch {
          // ignore parse errors
        }
        throw new Error(serverMessage);
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err?.message || "好像连不上了，可以点重试，或者直接加我微信聊。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm("清空聊天记录，重新开始？")) {
      const welcome: ChatMessage = {
        id: "welcome",
        role: "model",
        text: WELCOME_TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      };
      setMessages([welcome]);
      setErrorStatus(null);
    }
  };

  const handleCopyContact = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div
      className="flex flex-col bg-white rounded-2xl border border-amber-200/60 shadow-[0_8px_30px_rgba(180,83,9,0.08)] ring-1 ring-amber-100/80 h-[min(680px,calc(100dvh-7rem))] overflow-hidden"
      id="chat-section-container"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50/40 border-b border-amber-100/80 px-5 py-4 flex items-center justify-between" id="chat-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl ring-2 ring-white shadow-sm overflow-hidden flex-shrink-0">
            <img
              src={avatarUrl}
              alt="林安"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-900 leading-tight">和我聊聊</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                在线
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 truncate">问我近况、作品，或者直接打字聊</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-stone-400 hover:text-stone-600 transition-colors p-2 rounded-lg hover:bg-stone-50"
          title="清空聊天记录"
          id="chat-reset-btn"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-stone-50/40" id="chat-messages-container">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.98, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              id={`msg-bubble-${msg.id}`}
            >
              {msg.role === "model" && (
                <div className="w-7 h-7 rounded-full ring-1 ring-amber-100 overflow-hidden flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt="林安"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="space-y-0.5">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber-600 text-white rounded-tr-sm"
                      : "bg-white text-stone-700 rounded-tl-sm border border-stone-100"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <p className={`text-[10px] text-stone-300 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto" id="chat-loading-indicator">
            <div className="w-7 h-7 rounded-full ring-1 ring-amber-100 overflow-hidden flex-shrink-0">
              <img
                src={avatarUrl}
                alt="林安"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-stone-100 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl border border-rose-100 text-xs" id="chat-error-toast">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <p>{errorStatus}</p>
          </div>
        )}

        <div ref={listEndRef} />
      </div>

      {/* Suggested questions */}
      <div className="px-5 py-3 bg-amber-50/50 border-t border-amber-100/60 overflow-x-auto flex items-center gap-2 whitespace-nowrap" id="chat-suggestions">
        <span className="text-xs font-medium text-amber-800/70 select-none flex-shrink-0">
          快捷提问
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white text-stone-700 border border-amber-200/70 rounded-full text-xs cursor-pointer transition-colors hover:border-amber-400 hover:text-amber-800 flex-shrink-0 disabled:opacity-50 shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="p-4 border-t border-amber-100/60 flex items-center gap-3 bg-white"
        id="chat-input-form"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isLoading ? "正在想..." : "输入你想问的，按回车发送"}
          disabled={isLoading}
          className="flex-1 bg-stone-50 text-sm px-4 py-3.5 rounded-xl border border-stone-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all text-stone-700"
          id="chat-input-field"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="bg-amber-600 hover:bg-amber-700 disabled:bg-stone-100 text-white disabled:text-stone-300 px-5 py-3.5 rounded-xl transition-colors text-sm font-semibold flex-shrink-0 shadow-sm"
          id="chat-submit-btn"
        >
          发送
        </button>
      </form>

      {/* Quick contact */}
      <div className="border-t border-stone-50 px-5 py-2 flex items-center justify-end text-[11px] text-stone-400" id="chat-quick-contact-panel">
        <button
          type="button"
          onClick={() => handleCopyContact("linan_content", "微信")}
          className="hover:text-amber-600 transition-colors cursor-pointer flex items-center gap-1"
        >
          {copiedText === "微信" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
          复制微信 linan_content
        </button>
      </div>
    </div>
  );
}
