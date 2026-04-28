import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { MessageCircle, Send, Mic, Square, Loader2 } from "lucide-react";
import * as api from "../../api/client.js";
import RevealOnScroll from "../RevealOnScroll";
import VoiceMessagePlayer from "../VoiceMessagePlayer";

const ChatPage = ({ t, complaints = [], currentUser, initialCaseId }) => {
  const [selectedComplaintId, setSelectedComplaintId] = useState(initialCaseId || "");
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

  const chatEligibleComplaints = useMemo(
    () => complaints.filter((c) => (c.assignedTo === "lawyer" || c.assignedTo === "counsellor") && c.status !== "resolved"),
    [complaints]
  );

  useEffect(() => {
    if (initialCaseId) {
      setSelectedComplaintId(initialCaseId);
    } else if (!selectedComplaintId && chatEligibleComplaints.length > 0) {
      setSelectedComplaintId(chatEligibleComplaints[0].id);
    }
  }, [chatEligibleComplaints, initialCaseId, selectedComplaintId]);

  useEffect(() => {
    if (!selectedComplaintId) {
      setMessages([]);
      return;
    }

    let active = true;
    const load = async () => {
      setLoadingMessages(true);
      try {
        const data = await api.fetchChatMessages(selectedComplaintId);
        if (active) {
          setMessages(data);
          setError("");
        }
      } catch (e) {
        if (active) setError(e.message || "Could not load chat");
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
  }, [selectedComplaintId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || !selectedComplaintId || sending) return;
    setSending(true);
    try {
      const created = await api.sendChatMessage(selectedComplaintId, content);
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
          return; // Too short, ignore
        }

        setSendingVoice(true);
        try {
          const created = await api.sendVoiceMessage(selectedComplaintId, audioBlob);
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
  }, [selectedComplaintId]);

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

  const getConversationLabel = (complaint) => {
    if (!complaint) return "";
    return complaint.assignedTo === "lawyer" ? "User ↔ Lawyer" : "User ↔ Counsellor";
  };

  const renderMessage = (msg) => {
    const mine = msg.senderUserId === currentUser?.id;
    const isVoice = msg.type === "voice" && msg.voiceUrl;

    return (
      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            mine ? "bg-[#0066cc] text-white" : "bg-[#f5f5f7] dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white"
          }`}
        >
          <p className="text-xs opacity-80 mb-1">
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
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll delay={40} y={16} blur={10}>
          <div className="bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 mb-6">
            <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
              {t.chat || "Secure Chat"}
            </h2>
            <p className="text-sm text-[#86868b] dark:text-[#a1a1a6] mt-1">
              {t.chatHint || "Persistent conversation history is stored securely for each case."}
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevealOnScroll delay={70} y={18} blur={10} className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 font-semibold text-[#1d1d1f] dark:text-white">
                Cases
              </div>
              <div className="max-h-[65vh] overflow-y-auto">
                {chatEligibleComplaints.length === 0 ? (
                  <p className="p-5 text-sm text-[#86868b] dark:text-[#a1a1a6]">
                    No chat-enabled cases yet.
                  </p>
                ) : (
                  chatEligibleComplaints.map((complaint) => (
                    <button
                      key={complaint.id}
                      onClick={() => setSelectedComplaintId(complaint.id)}
                      className={`w-full text-left px-5 py-4 border-b border-gray-50 hover:bg-[#0066cc]/[0.03] transition-colors ${
                        selectedComplaintId === complaint.id ? "bg-[#0066cc]/[0.06]" : ""
                      }`}
                    >
                      <p className="font-medium text-[#1d1d1f] dark:text-white">{complaint.id}</p>
                      <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1">{getConversationLabel(complaint)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={110} y={18} blur={10} className="lg:col-span-2">
            <div className="bg-white/70 dark:bg-[#1e2333]/70 backdrop-blur-xl rounded-[24px] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-[70vh]">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
                <MessageCircle size={18} className="text-[#0066cc]" />
                <span className="font-medium text-[#1d1d1f] dark:text-white">
                  {selectedComplaintId ? `Conversation - ${selectedComplaintId}` : "Select a case"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {loadingMessages ? (
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-[#86868b] dark:text-[#a1a1a6]">No messages yet. Start the conversation.</p>
                ) : (
                  messages.map(renderMessage)
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <p className="px-6 pb-2 text-sm text-red-600">{error}</p>}

              {/* Input area with voice recording */}
              <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-3">
                {isRecording ? (
                  /* Recording indicator */
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
                      onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                      placeholder="Type your message..."
                      disabled={!selectedComplaintId || sending || sendingVoice}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e2333]/70 focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 text-[#1d1d1f] dark:text-white"
                    />
                    {/* Mic button */}
                    <button
                      onClick={startRecording}
                      disabled={!selectedComplaintId || sending || sendingVoice}
                      className="w-12 h-12 rounded-full bg-red-500 text-white disabled:opacity-40 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_14px_rgba(239,68,68,0.4)]"
                      title="Record voice message"
                    >
                      {sendingVoice ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                    </button>
                    {/* Send text button */}
                    <button
                      onClick={handleSend}
                      disabled={!selectedComplaintId || sending || !newMessage.trim() || sendingVoice}
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
    </div>
  );
};

export default ChatPage;
