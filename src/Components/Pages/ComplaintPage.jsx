import React, { useState, useRef, useEffect } from "react";
import { Send, Upload, CheckCircle, Video, User, Mic, Square, Trash2, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RevealOnScroll from "../RevealOnScroll";

const ComplaintPage = ({
  t,
  formData,
  setFormData,
  handleComplaintSubmit,
  caseId
}) => {
  const [inputMode, setInputMode] = useState('write');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setFormData(prev => ({
          ...prev,
          audioFile: new File([audioBlob], 'voice-recording.webm', { type: 'audio/webm' })
        }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone access denied or not available. Please allow microphone permissions.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const clearRecording = () => {
    setAudioUrl(null);
    setFormData(prev => ({ ...prev, audioFile: null }));
    setRecordingTime(0);
  };
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (inputMode === 'say' && !formData.audioFile) {
      alert("Please record your voice complaint or switch to Write mode.");
      return;
    }
    handleComplaintSubmit(e);
  };

  return (
    <div className="flex justify-center py-16 px-4 bg-[#fbfbfd] dark:bg-transparent">
      <RevealOnScroll delay={60} y={20} blur={12}>
      <div className="w-full max-w-2xl bg-white dark:bg-[#1e2333]/70 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 dark:border-white/10 p-8 sm:p-12">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-2">
            {t.registerComplaintForm}
          </h2>
          <p className="text-[15px] text-[#86868b] dark:text-[#a1a1a6]">Please fill out the details carefully. Your information is secure.</p>
        </div>

        {caseId && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-[16px] flex items-center gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            <span className="text-[#1d1d1f] dark:text-white text-[15px]">
              {t.caseId} <span className="font-semibold">{caseId}</span>
            </span>
          </div>
        )}

        <form onSubmit={onFormSubmit} className="space-y-6">
          {/* Reporter Role - Victim or Witness */}
          <div>
            <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
              {t.iAmReportingAs || 'I am reporting as'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, reporterRole: 'victim' })}
                className={`p-4 rounded-[14px] border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                  formData.reporterRole === 'victim'
                    ? 'border-[#0066cc] bg-[#0066cc]/5 text-[#0066cc]'
                    : 'border-gray-200 dark:border-white/10 hover:border-[#0066cc]/50 text-[#86868b] dark:text-[#a1a1a6]'
                }`}
              >
                <User size={24} />
                <span className="font-medium">{t.victim}</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, reporterRole: 'witness' })}
                className={`p-4 rounded-[14px] border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                  formData.reporterRole === 'witness'
                    ? 'border-[#0066cc] bg-[#0066cc]/5 text-[#0066cc]'
                    : 'border-gray-200 dark:border-white/10 hover:border-[#0066cc]/50 text-[#86868b] dark:text-[#a1a1a6]'
                }`}
              >
                <User size={24} />
                <span className="font-medium">{t.witness}</span>
              </button>
            </div>
          </div>

          {/* Type of Violence */}
          <div>
            <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
              {t.typeOfViolence}
            </label>

            <select
              value={formData.incidentType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  incidentType: e.target.value
                })
              }
              required
              className="w-full px-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 focus:shadow-[0_8px_30px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 outline-none appearance-none cursor-pointer"
            >
              <option value="">{t.selectType}</option>
              <option value="physical">{t.physicalViolence}</option>
              <option value="emotional">{t.emotionalAbuse}</option>
              <option value="sexual">{t.sexualAbuse}</option>
              <option value="financial">{t.financialAbuse}</option>
              <option value="verbal">{t.verbalAbuse}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                {t.incidentDate}
              </label>

              <input
                type="date"
                value={formData.incidentDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    incidentDate: e.target.value
                  })
                }
                required
                className="w-full px-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 focus:shadow-[0_8px_30px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                {t.incidentTime}
              </label>

              <input
                type="time"
                value={formData.incidentTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    incidentTime: e.target.value
                  })
                }
                required
                className="w-full px-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 focus:shadow-[0_8px_30px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 outline-none"
              />
            </div>
          </div>

          {/* Write / Say Slider */}
          <div className="mt-8">
            <div className="flex bg-[#f5f5f7] dark:bg-[#121212] p-1.5 rounded-full w-full max-w-[280px] mx-auto mb-6 relative">
              <motion.div
                className="absolute top-1.5 bottom-1.5 bg-white dark:bg-[#2c2c2e] rounded-full shadow-sm"
                initial={false}
                animate={{ 
                  left: inputMode === 'write' ? '6px' : 'calc(50% + 2px)', 
                  width: 'calc(50% - 8px)' 
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <button 
                type="button"
                onClick={() => setInputMode('write')}
                className={`relative flex-1 py-2.5 text-[14px] font-semibold z-10 transition-colors ${inputMode === 'write' ? 'text-[#1d1d1f] dark:text-white' : 'text-[#86868b]'}`}
              >
                Write Description
              </button>
              <button 
                type="button"
                onClick={() => setInputMode('say')}
                className={`relative flex-1 py-2.5 text-[14px] font-semibold z-10 transition-colors ${inputMode === 'say' ? 'text-[#1d1d1f] dark:text-white' : 'text-[#86868b]'}`}
              >
                Record Voice
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === 'write' ? (
              <motion.div
                key="write"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Description */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                    {t.description}
                  </label>

                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value
                      })
                    }
                    placeholder={t.describeIncident}
                    required={inputMode === 'write'}
                    className="w-full px-4 py-3.5 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-transparent rounded-[14px] text-[15px] text-[#1d1d1f] dark:text-white placeholder:text-[#86868b] dark:text-[#a1a1a6]/70 focus:bg-white/90 dark:focus:bg-[#1c1c1e]/90 focus:backdrop-blur-xl focus:border-[#0066cc]/40 focus:ring-4 focus:ring-[#0066cc]/10 focus:shadow-[0_8px_30px_rgba(0,102,204,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 outline-none min-h-[120px] resize-y"
                  />
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="say"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
                    Record Voice Complaint
                  </label>
                  
                  <div className="w-full p-8 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-[16px] flex flex-col items-center justify-center gap-6">
                    {audioUrl ? (
                      <div className="w-full flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[#0066cc] dark:text-blue-400">
                          <Headphones size={32} />
                        </div>
                        <audio src={audioUrl} controls className="w-full max-w-sm" />
                        <button
                          type="button"
                          onClick={clearRecording}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                        >
                          <Trash2 size={16} /> Record Again
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        {isRecording ? (
                          <>
                            <div className="text-3xl font-mono text-[#1d1d1f] dark:text-white mb-2">
                              {formatTime(recordingTime)}
                            </div>
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(239,68,68,0.4)] transition-all transform active:scale-95"
                            >
                              <Square size={28} className="text-white fill-current" />
                            </button>
                            <p className="text-sm font-medium text-red-500 animate-pulse mt-2">Recording...</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[15px] text-center text-[#86868b] dark:text-[#a1a1a6] max-w-sm mb-2">
                              Tap the microphone and describe the incident, location, and any details clearly.
                            </p>
                            <button
                              type="button"
                              onClick={startRecording}
                              className="w-20 h-20 bg-[#0066cc] hover:bg-[#004499] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,102,204,0.4)] transition-all transform hover:scale-105 active:scale-95"
                            >
                              <Mic size={32} className="text-white" />
                            </button>
                            <p className="text-sm font-medium text-[#1d1d1f] dark:text-white mt-2">Tap to record</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Video */}
          <div>
            <label className="block text-[13px] font-semibold text-[#86868b] dark:text-[#a1a1a6] uppercase tracking-wider mb-2 ml-1">
              {t.uploadVideo}
            </label>

            <div className="relative cursor-pointer group">
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    videoFile: e.target.files?.[0] || null
                  })
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full px-4 py-8 bg-[#f5f5f7]/80 dark:bg-[#121212]/80 backdrop-blur-md border-2 border-dashed border-[#d2d2d7]/60 rounded-[16px] flex flex-col items-center justify-center gap-3 hover:bg-[#0066cc]/5 hover:border-[#0066cc]/40 hover:shadow-[0_8px_30px_rgba(0,102,204,0.08)] transition-all duration-300">
                <div className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Video size={24} className="text-[#0066cc]" />
                </div>
                <div className="text-center transition-colors duration-300 group-hover:text-[#0066cc]">
                  <p className="text-[15px] font-medium text-current">
                    {formData.videoFile ? formData.videoFile.name : "Click or drag video to attach"}
                  </p>
                  <p className="text-[13px] text-[#86868b] dark:text-[#a1a1a6] mt-1 group-hover:text-[#0066cc]/70 transition-colors">{t.maxFile}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="flex items-start gap-3 p-4 bg-[#fbfbfd] dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-[14px] mt-4">
            <input
              type="checkbox"
              required
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]/20 cursor-pointer"
            />
            <label className="text-[14px] leading-relaxed text-[#1d1d1f] dark:text-white">
              {t.consent}
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-6 bg-[#1d1d1f]/90 dark:bg-[#0066cc]/90 backdrop-blur-md text-white font-medium text-[15px] py-4 rounded-[14px] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:bg-[#0066cc]/90 hover:backdrop-blur-xl hover:shadow-[0_12px_40px_rgba(0,102,204,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group border border-transparent hover:border-white/20"
          >
            <span>{t.submitComplaint}</span>
            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 ml-1" />
          </button>
        </form>
      </div>
      </RevealOnScroll>
    </div>
  );
};

export default ComplaintPage;
