"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Volume1, VolumeX, Maximize, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { cn } from "@/lib/utils";

const formatTime = (seconds: number) => {
const minutes = Math.floor(seconds / 60);
const remainingSeconds = Math.floor(seconds % 60);
return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const CustomSlider = ({
value,
onChange,
className,
isEditing = false,
showPlacement = false,
placementStartPct,
placementWidthPct,
onPlacementClick,
}: {
value: number;
onChange: (value: number) => void;
className?: string;
isEditing?: boolean;
showPlacement?: boolean;
placementStartPct?: number;
placementWidthPct?: number;
onPlacementClick?: () => void;
}) => {
return (
  <motion.div
    className={cn(
      "relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all",
      isEditing && "animate-pulse shadow-[0_0_15px_rgba(45,212,191,0.5)] bg-teal-900/40",
      className
    )}
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      onChange(Math.min(Math.max(percentage, 0), 100));
    }}
  >
    <motion.div
      className={cn("absolute top-0 left-0 h-full rounded-full z-10", isEditing ? "bg-teal-400" : "bg-white")}
      style={{ width: `${value}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
    
    {/* Placement Bar Sync */}
    {showPlacement && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 -translate-y-1/2 bg-green-500 rounded-full z-20 shadow-[0_0_20px_rgba(34,197,94,1)] border-2 border-green-300 flex items-center justify-center group cursor-pointer hover:bg-green-400"
            onClick={(e) => {
                e.stopPropagation();
                onPlacementClick?.();
            }}
            style={{
                left: placementStartPct !== undefined ? `${placementStartPct}%` : "45%",
                width: placementWidthPct !== undefined ? `max(16px, ${placementWidthPct}%)` : "12%",
                height: "18px",
            }}
        >
          <div className="absolute -top-10 bg-green-500 text-black text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl before:content-[''] before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-green-500">
            ✨ AI Placement Slot
          </div>
        </motion.div>
    )}
  </motion.div>
);
};

const VideoPlayer = ({ 
  src, 
  placementStart, 
  placementEnd 
}: { 
  src: string;
  placementStart?: number;
  placementEnd?: number;
}) => {
const containerRef = useRef<HTMLDivElement>(null);
const videoRef = useRef<HTMLVideoElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(1);
const [progress, setProgress] = useState(0);
const [isMuted, setIsMuted] = useState(false);
const [playbackSpeed, setPlaybackSpeed] = useState(1);
const [showControls, setShowControls] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);

const [isEditing, setIsEditing] = useState(true);
const [showPlacement, setShowPlacement] = useState(false);

useEffect(() => {
  // Auto-play the video muted when it loads
  if (videoRef.current) {
    videoRef.current.muted = true;
    setIsMuted(true);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  }

  // Editing animation timer
  const timer = setTimeout(() => {
    setIsEditing(false);
    setShowPlacement(true);
  }, 10000); // 10 seconds of editing

  return () => clearTimeout(timer);
}, []);

const togglePlay = () => {
  if (videoRef.current) {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }
};

const handleVolumeChange = (value: number) => {
  if (videoRef.current) {
    const newVolume = value / 100;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }
};

const handleTimeUpdate = () => {
  if (videoRef.current) {
    const progress =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(isFinite(progress) ? progress : 0);
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  }
};

const handleSeek = (value: number) => {
  if (videoRef.current && videoRef.current.duration) {
    const time = (value / 100) * videoRef.current.duration;
    if (isFinite(time)) {
      videoRef.current.currentTime = time;
      setProgress(value);
    }
  }
};

const handleSeekToTime = (timeInSeconds: number) => {
  if (videoRef.current && videoRef.current.duration) {
    const safeTime = Math.max(0, Math.min(timeInSeconds, videoRef.current.duration));
    videoRef.current.currentTime = safeTime;
    setProgress((safeTime / videoRef.current.duration) * 100);
  }
};

const toggleMute = () => {
  if (videoRef.current) {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) {
      setVolume(0);
    } else {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  }
};

const setSpeed = (speed: number) => {
  if (videoRef.current) {
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
  }
};

const toggleFullscreen = () => {
  if (!containerRef.current) return;
  if (!document.fullscreenElement) {
    containerRef.current.requestFullscreen().catch((err) => {
      console.error("Error attempting to enable fullscreen:", err);
    });
  } else {
    document.exitFullscreen();
  }
};

return (
  <motion.div
    ref={containerRef}
    className="relative w-full mx-auto aspect-video rounded-2xl overflow-hidden bg-[#11111198] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm flex items-center justify-center group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    onMouseEnter={() => setShowControls(true)}
    onMouseLeave={() => setShowControls(false)}
  >
    <video
      ref={videoRef}
      className="w-full"
      onTimeUpdate={handleTimeUpdate}
      src={src}
      onClick={togglePlay}
    />

    <AnimatePresence>
        {(showPlacement && 
          ((placementStart !== undefined && placementEnd !== undefined && currentTime >= placementStart && currentTime <= placementEnd) || 
           (placementStart === undefined && progress >= 45 && progress <= 57))) && (
            <motion.div
              className="absolute top-8 right-8 z-50"
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div
                className={cn(
                  "group rounded-full border border-black/5 bg-neutral-100/90 text-lg md:text-xl text-black transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900/90 dark:text-white dark:hover:bg-neutral-800 backdrop-blur-md shadow-2xl hover:scale-105",
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    window.open('https://www.beatsbydre.com/', '_blank');
                }}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-8 py-4 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400 font-medium">
                  <span>✨ Learn More: Beats by Dre</span>
                  <ArrowRight className="ml-3 h-6 w-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </AnimatedShinyText>
              </div>
            </motion.div>
        )}
    </AnimatePresence>

    <AnimatePresence>
      {showControls && (
        <motion.div
          className="absolute bottom-4 mx-auto w-[90%] md:w-[80%] left-0 right-0 p-5 bg-[#11111198] backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl"
          initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: 20, opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="text-white text-base font-medium">
              {formatTime(currentTime)}
            </span>
            <CustomSlider
              value={progress}
              onChange={handleSeek}
              className="flex-1"
              isEditing={isEditing}
              showPlacement={showPlacement}
              placementStartPct={placementStart !== undefined ? (placementStart / (duration || 1)) * 100 : undefined}
              placementWidthPct={placementStart !== undefined && placementEnd !== undefined ? ((placementEnd - placementStart) / (duration || 1)) * 100 : undefined}
              onPlacementClick={() => {
                const targetTime = placementStart !== undefined ? placementStart : (0.45 * duration);
                const jumpTime = Math.max(0, targetTime - 2); // Jump to exactly 2 seconds before the clip starts!
                handleSeekToTime(jumpTime);
              }}
            />
            <span className="text-white text-base font-medium">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={togglePlay}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#111111d1] hover:text-white h-12 w-12 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-white" />
                  ) : (
                    <Play className="h-6 w-6 fill-white ml-1" />
                  )}
                </Button>
              </motion.div>
              <div className="flex items-center gap-x-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-[#111111d1] hover:text-white h-10 w-10 rounded-full"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : volume > 0.5 ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <Volume1 className="h-5 w-5" />
                    )}
                  </Button>
                </motion.div>

                <div className="w-28 mt-0.5">
                  <CustomSlider
                    value={volume * 100}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {[0.5, 1, 1.5, 2].map((speed) => (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  key={speed}
                >
                  <Button
                    onClick={() => setSpeed(speed)}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "text-white hover:bg-[#111111d1] hover:text-white h-9 px-3 rounded-full text-sm font-medium",
                      playbackSpeed === speed && "bg-[#111111d1]"
                    )}
                  >
                    {speed}x
                  </Button>
                </motion.div>
              ))}
              
              <div className="w-[1px] h-8 bg-white/20 mx-2" />
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#111111d1] hover:text-white h-10 w-10 rounded-full"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);
};

export default VideoPlayer;
