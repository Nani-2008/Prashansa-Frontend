import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const BARS = 28;

function generateWaveform(seed = 0) {
  const bars = [];
  for (let i = 0; i < BARS; i++) {
    const h = 0.25 + 0.75 * Math.abs(Math.sin(seed + i * 0.7) * Math.cos(i * 1.3 + seed));
    bars.push(h);
  }
  return bars;
}

const VoiceMessagePlayer = ({ src, isMine = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [waveform] = useState(() => generateWaveform(Math.random() * 100));
  const [durationResolved, setDurationResolved] = useState(false);

  const progress = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryResolveDuration = () => {
      const d = audio.duration;
      if (d && isFinite(d) && d > 0) {
        setDuration(d);
        setDurationResolved(true);
      }
    };

    const onLoadedMetadata = () => {
      tryResolveDuration();
      // WebM files often report Infinity for duration on first load.
      // Seeking to a very large value forces the browser to calculate the real duration.
      if (!isFinite(audio.duration)) {
        audio.currentTime = 1e10; // seek to "end"
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      tryResolveDuration();
    };

    const onDurationChange = () => {
      tryResolveDuration();
    };

    const onSeeked = () => {
      // After our trick seek, the browser now knows the real duration
      tryResolveDuration();
      if (audio.currentTime > 0 && !isPlaying) {
        audio.currentTime = 0; // reset to start
      }
    };

    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !duration || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = x * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const formatTime = (t) => {
    if (!t || !isFinite(t) || isNaN(t) || t < 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const playBtnColor = isMine
    ? "bg-white/20 hover:bg-white/30 text-white"
    : "bg-[#0066cc]/10 hover:bg-[#0066cc]/20 text-[#0066cc]";

  const barActiveColor = isMine ? "bg-white" : "bg-[#0066cc]";
  const barInactiveColor = isMine ? "bg-white/30" : "bg-[#0066cc]/20";
  const textColor = isMine ? "text-white/70" : "text-[#86868b]";
  const sliderAccent = isMine ? "#ffffff" : "#0066cc";

  return (
    <div className="flex items-center gap-2.5 min-w-[240px] max-w-[300px]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 ${playBtnColor}`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      {/* Waveform + Timeline */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="flex items-end gap-[2px] h-7 cursor-pointer"
          onClick={handleSeek}
        >
          {waveform.map((h, i) => {
            const barProgress = i / BARS;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isActive ? barActiveColor : barInactiveColor
                } ${isPlaying && isActive ? "animate-pulse" : ""}`}
                style={{
                  height: `${h * 100}%`,
                  minWidth: "2.5px",
                  opacity: isActive ? 1 : 0.5,
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div className={`flex justify-between text-[10px] ${textColor} font-medium`}>
          <span>{formatTime(currentTime)}</span>
          <span>{durationResolved ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowVolume(!showVolume)}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${playBtnColor}`}
        >
          {volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        {showVolume && (
          <div
            className={`absolute bottom-full right-0 mb-2 px-2 py-3 rounded-xl shadow-lg z-50 ${
              isMine ? "bg-blue-700" : "bg-white dark:bg-[#2a2a2e] border border-gray-200 dark:border-white/10"
            }`}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                accentColor: sliderAccent,
                background: `linear-gradient(to right, ${sliderAccent} ${volume * 100}%, ${isMine ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} ${volume * 100}%)`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
