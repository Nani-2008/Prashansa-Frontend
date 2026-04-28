import { useEffect, useState, useRef, useCallback } from "react";
import { MessageCircle, Send, Shield, Mic, Square, Loader2 } from "lucide-react";
import * as api from "../../api/client.js";
import RevealOnScroll from "../RevealOnScroll";
import VoiceMessagePlayer from "../VoiceMessagePlayer";

const OfficialChatPage = ({ t, currentUser }) => {
  const channelId = `admin-${currentUser?.role}`;
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sendingVoice, setSendingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.role) return;

    let active = true;
    const load = async () => {
      setLoadingMessages(true);
      try {
        const data = await api.fetchChatMessages(channelId);
        if (active) {
          setMessages(data);
          setError("");
        }
      } catch (e) {
        if (active) setError(e.message || "Could not load messages");
      } finally {
        if (active) setLoadingMessages(false);
      }
    };

    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [channelId, currentUser?.role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const created = await api.sendChatMessage(channelId, content);
      setMessages((prev) => [...prev, created]);
      setNewMessage("");
      setError("");
    } catch (e) {
      setError(e.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) {
          setIsRecording(false);
          setRecordingDuration(0);
          return;
        }

        setSendingVoice(true);
        try {
          const created = await api.sendVoiceMessage(channelId, audioBlob);
          setMessages((prev) => [...prev, created]);
          setError("");
        } catch (e) {
          setError(e.message || "Could not send voice message");
        } finally {
          setSendingVoice(false);
          setRecordingDuration(0);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (e) {
      setError("Microphone access denied. Please allow microphone permission.");
    }
  }, [channelId]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const roleLabel = currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "Official";

  const renderMessage = (msg) => {
    const mine = msg.senderUserId === currentUser?.id;
    const isVoice = msg.type === "voice" && msg.voiceUrl;

    return (
      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            mine
              ? "bg-[#0066cc] text-white"
              : "bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white"
          }`}
        >
          <p className="text-xs opacity-80 mb-1 font-medium">
            {msg.senderName} ({msg.senderRole})
          </p>

          {isVoice ? (
            <div className="mt-1">
              <VoiceMessagePlayer src={msg.voiceUrl} isMine={mine} />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
          )}

          <p className="text-[11px] opacity-70 mt-1">
            {new Date(msg.sentAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fbfbfd] dark:bg-transparent py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <RevealOnScroll delay={40} y={16} blur={10}>
          <div className="bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <Shield size={24} className="text-[#0066cc]" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                  Admin Channel
                </h2>
                <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-0.5">
                  Direct communication with Administration
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={80} y={18} blur={10}>
          <div className="bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[70vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
                <Shield size={18} className="text-[#0066cc]" />
              </div>
              <div>
                <span className="font-semibold text-[#1d1d1f] dark:text-white text-[15px]">
                  Admin ↔ {roleLabel}
                </span>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">Secure channel</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle size={40} className="text-gray-200 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] font-medium">No messages yet</p>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">Start a conversation with the Admin</p>
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && <p className="px-6 pb-2 text-sm text-red-600">{error}</p>}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-3">
              {isRecording ? (
                <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Recording {formatDuration(recordingDuration)}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={stopRecording}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Stop and send"
                  >
                    <Square size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Message Admin..."
                    disabled={sending || sendingVoice}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e2333]/70 text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc]/30 transition-all"
                  />
                  <button
                    onClick={startRecording}
                    disabled={sending || sendingVoice}
                    className="w-12 h-12 rounded-full bg-red-500 text-white disabled:opacity-40 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_14px_rgba(239,68,68,0.4)]"
                    title="Record voice message"
                  >
                    {sendingVoice ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim() || sendingVoice}
                    className="h-12 px-6 rounded-full bg-[#0066cc] text-white disabled:opacity-40 flex items-center gap-2 hover:bg-[#004499] active:scale-95 transition-all font-semibold shadow-[0_4px_14px_rgba(0,102,204,0.4)]"
                  >
                    <Send size={16} />
                    Send
                  </button>
                </>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default OfficialChatPage;
