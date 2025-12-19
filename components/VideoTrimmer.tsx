"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scissors, Play, Pause } from 'lucide-react';

interface VideoTrimmerProps {
  videoUrl: string;
  videoDuration: number;
  onTrim: (startTime: number, endTime: number) => void;
  isProcessing?: boolean;
}

const VideoTrimmer: React.FC<VideoTrimmerProps> = ({
  videoUrl,
  videoDuration,
  onTrim,
  isProcessing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(videoDuration);
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Update current time while video is playing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener('timeupdate', updateTime);

    // Sync play state
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Clamp current time within trim range
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isDraggingPlayhead) return;

    if (video.currentTime < startTime) {
      video.currentTime = startTime;
    } else if (video.currentTime > endTime) {
      video.currentTime = endTime;
      video.pause();
      setIsPlaying(false);
    }
  }, [currentTime, startTime, endTime, isDraggingPlayhead]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
      video.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * videoDuration;

    if (Math.abs(time - startTime) < Math.abs(time - endTime)) {
      setStartTime(Math.max(0, Math.min(time, endTime - 0.1)));
    } else {
      setEndTime(Math.min(videoDuration, Math.max(time, startTime + 0.1)));
    }

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingStart && !isDraggingEnd && !isDraggingPlayhead) return;

    const timeline = document.getElementById('timeline-container');
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const time = percentage * videoDuration;

    if (isDraggingStart) {
      setStartTime(Math.max(0, Math.min(time, endTime - 0.1)));
      if (videoRef.current && videoRef.current.currentTime < time) {
        videoRef.current.currentTime = time;
      }
    } else if (isDraggingEnd) {
      setEndTime(Math.min(videoDuration, Math.max(time, startTime + 0.1)));
      if (videoRef.current && videoRef.current.currentTime > time) {
        videoRef.current.currentTime = time;
      }
    } else if (isDraggingPlayhead) {
      const clampedTime = Math.max(startTime, Math.min(endTime, time));
      setCurrentTime(clampedTime);
      if (videoRef.current) {
        videoRef.current.currentTime = clampedTime;
      }
    }
  }, [isDraggingStart, isDraggingEnd, isDraggingPlayhead, videoDuration, startTime, endTime]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingStart(false);
    setIsDraggingEnd(false);
    setIsDraggingPlayhead(false);
  }, []);

  useEffect(() => {
    if (isDraggingStart || isDraggingEnd || isDraggingPlayhead) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingStart, isDraggingEnd, isDraggingPlayhead, handleMouseMove, handleMouseUp]);

  const startPercentage = (startTime / videoDuration) * 100;
  const endPercentage = (endTime / videoDuration) * 100;
  const currentPercentage = (currentTime / videoDuration) * 100;

  const handleTrim = () => {
    onTrim(startTime, endTime);
  };

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setEndTime(Math.min(videoDuration, videoRef.current.duration || videoDuration));
            }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="btn btn-circle btn-lg bg-base-100 bg-opacity-80 hover:bg-opacity-100"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
      </div>

      {/* Timeline Controls */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-base-content opacity-70">
          <span>Start: {formatTime(startTime)}</span>
          <span>Current: {formatTime(currentTime)}</span>
          <span>End: {formatTime(endTime)}</span>
          <span>Duration: {formatTime(endTime - startTime)}</span>
        </div>

        <div
          id="timeline-container"
          className="relative h-12 bg-base-300 rounded-lg cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Background scrubber */}
          <div className="absolute inset-0 flex items-center">
            <div className="h-2 bg-base-content opacity-20 w-full rounded"></div>
          </div>

          {/* Trimmed range */}
          <div
            className="absolute h-2 bg-primary rounded"
            style={{
              left: `${startPercentage}%`,
              width: `${endPercentage - startPercentage}%`,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Start handle */}
          <div
            className="absolute w-3 h-full bg-primary cursor-ew-resize z-10"
            style={{ left: `${startPercentage}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingStart(true);
            }}
          />

          {/* End handle */}
          <div
            className="absolute w-3 h-full bg-primary cursor-ew-resize z-10"
            style={{ left: `calc(${endPercentage}% - 12px)` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingEnd(true);
            }}
          />

          {/* Playhead */}
          <div
            className="absolute w-1 h-full bg-accent cursor-ew-resize z-20"
            style={{ left: `${currentPercentage}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingPlayhead(true);
            }}
          />
        </div>

        {/* Trim Button */}
        <button
          onClick={handleTrim}
          disabled={isProcessing || endTime - startTime <= 0}
          className="btn btn-primary w-full"
        >
          <Scissors size={18} className="mr-2" />
          {isProcessing ? 'Processing...' : `Trim Video (${formatTime(endTime - startTime)})`}
        </button>
      </div>
    </div>
  );
};

export default VideoTrimmer;



/*

lets use tanstack query for writing the frontend components and the pages that would remove a lot of repetative boilerplate










*/