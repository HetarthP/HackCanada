"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize2, RotateCw, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VideoPlayerProProps {
  src: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const VideoPlayerPro: React.FC<VideoPlayerProProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // States for the faux "Spotlight AI" editing effect
  const [isEditing, setIsEditing] = useState(true);
  const [editProgress, setEditProgress] = useState(0);

  useEffect(() => {
    const TOTAL_DURATION = 15000;
    const startTime = Date.now();
    
    // Auto-play muted for the showcase
    if (videoRef.current) {
        videoRef.current.muted = true;
        setIsMuted(true);
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percentage = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
        setEditProgress(percentage);
        if (percentage >= 100) {
            clearInterval(interval);
            setIsEditing(false);
        }
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Play / Pause / Restart
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isEnded) {
      videoRef.current.currentTime = 0;
      setIsEnded(false);
    }
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // Update progress and time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isFinite(prog) ? prog : 0);
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  // Video ended
  const handleEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
  };

  // Seek
  const handleSeek = (percent: number) => {
    if (!videoRef.current) return;
    const time = (percent / 100) * (videoRef.current.duration || 0);
    if (isFinite(time)) videoRef.current.currentTime = time;
    setProgress(percent);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen failed:", err);
      });
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    setVolume(!isMuted ? 0 : 1);
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video overflow-hidden rounded-2xl border border-gray-800 bg-black flex items-center justify-center",
        isEditing && "transition-all duration-1000"
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className={cn("w-full h-full object-contain transition-all duration-700", isEditing && "opacity-80 sepia-[.2] hue-rotate-[180deg] blur-[2px]")}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        loop
      />
      
      {/* Editing Overlay Indicator */}
      <AnimatePresence>
        {isEditing && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-teal-500/50 text-teal-400 px-6 py-3 rounded-full flex items-center gap-3 font-mono text-sm tracking-wider shadow-[0_0_30px_rgba(20,184,166,0.5)] z-20"
            >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>SPOTLIGHT AI INJECTION: {Math.floor(editProgress)}%</span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 z-30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            {/* Progress */}
            <div
              className="relative w-full h-2.5 bg-white/20 rounded-full cursor-pointer overflow-visible"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                handleSeek((x / rect.width) * 100);
              }}
            >
                {/* Playing Progress */}
              <motion.div
                className="absolute top-0 left-0 h-full bg-white/70 rounded-full z-10 pointer-events-none"
                style={{ width: `${progress}%` }}
              />

              {/* Editing Animation Progress Overlay */}
              {isEditing && (
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-700 via-teal-400 to-teal-200 z-10 pointer-events-none rounded-full"
                    style={{ width: `${editProgress}%` }}
                >
                    <div className="absolute inset-0 opacity-40 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[move_1s_linear_infinite]" />
                </div>
              )}

              {/* Highlight Placed Range */}
              {!isEditing && (
                <motion.div 
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    className="absolute top-1/2 -translate-y-1/2 h-5 bg-teal-500/80 border border-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.8)] rounded z-20 pointer-events-none"
                    style={{ left: "45%", width: "12%" }}
                />
              )}
            </div>

            {/* Control Row */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-3">
                {/* Play / Pause / Restart */}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-8 h-8" onClick={togglePlay}>
                  {isEnded ? <RotateCw className="w-4 h-4" /> : isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                </Button>

                {/* Volume */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-8 h-8" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="w-4 h-4" /> : volume > 0.5 ? <Volume2 className="w-4 h-4" /> : <Volume1 className="w-4 h-4" />}
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent className="w-32 bg-black/90 border border-white/10 p-2 backdrop-blur-xl">
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}  
                        onValueChange={(val: number[]) => {
                          const newVolume = val[0] / 100;
                          if (videoRef.current) videoRef.current.volume = newVolume;
                          setVolume(newVolume);
                          if (newVolume > 0 && isMuted) setIsMuted(false);
                          if (newVolume === 0) setIsMuted(true);
                        }}
                        step={1}
                        min={0}
                        max={100}
                      />
                    </PopoverContent>
                </Popover>

                {/* Timer */}
                <span className="text-white/80 text-xs font-medium font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Settings */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-8 h-8">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-black/90 border border-white/10 w-40 p-2 backdrop-blur-xl text-white">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Speed</span>
                      <div className="grid grid-cols-2 gap-1">
                          {[0.5, 1, 1.5, 2].map((s) => (
                            <Button
                              key={s}
                              variant={playbackSpeed === s ? "secondary" : "ghost"}
                              size="sm"
                              className={cn("h-7 text-xs", playbackSpeed === s ? "bg-white/20" : "")}
                              onClick={() => {
                                if (videoRef.current) videoRef.current.playbackRate = s;
                                setPlaybackSpeed(s);
                              }}
                            >
                              {s}x
                            </Button>
                          ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Fullscreen */}
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-8 h-8" onClick={toggleFullscreen}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes move {
            0% { background-position: 0 0; }
            100% { background-position: 1rem 1rem; }
        }
      `}} />
    </motion.div>
  );
};

export default VideoPlayerPro;
