"use client"
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast";
import VideoTrimmer from '@/components/VideoTrimmer';
import { getCldVideoUrl } from 'next-cloudinary';
import { Video } from '@/types';
import { UploadIcon } from 'lucide-react';

function VideoEdit() {
  const [step, setStep] = useState<'upload' | 'trim' | 'complete'>('upload');
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('VideoEdit component mounted, step:', step);
  }, [step]);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size is too large. Maximum size is 60MB.");
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setVideoUrl(url);
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Please fill in the title and select a video file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      const response = await axios.post("/api/video-upload", formData);
      setUploadedVideo(response.data);
      setStep('trim');
      toast.success("Video uploaded! Now you can trim it.");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Upload failed";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTrim = async (startTime: number, endTime: number) => {
    if (!uploadedVideo) {
      toast.error("No video uploaded");
      return;
    }

    setIsTrimming(true);
    try {
      const response = await axios.post("/api/video-trim", {
        publicId: uploadedVideo.publicId,
        startTime,
        endTime,
        title: `${title} (Trimmed)`,
        description,
      });

      toast.success("Video trimmed successfully!");
      setStep('complete');
      setTimeout(() => {
        router.push("/home");
      }, 2000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Trim failed";
      toast.error(errorMessage);
    } finally {
      setIsTrimming(false);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  if (step === 'upload') {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Toaster />
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded">
          <p className="text-blue-800">✅ Video Upload & Trim Page Loaded</p>
        </div>
        <h1 className="text-3xl font-bold mb-6">Upload and Edit Video</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Video</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Title *</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-full"
                  rows={4}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-bold">Video File *</span>
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="file-input file-input-bordered w-full file-input-primary"
                  required
                />
                <p className="text-xs text-base-content opacity-60 mt-2">
                  Select a video file (Max 60MB)
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full btn-lg mt-4"
                disabled={isUploading || !file}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon size={20} className="mr-2" />
                    Upload Video
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            {videoUrl ? (
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onLoadedMetadata={handleVideoLoaded}
                  controls
                />
              </div>
            ) : (
              <div className="bg-base-200 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-base-content opacity-50">No video selected</p>
              </div>
            )}
            {videoDuration > 0 && (
              <p className="text-sm text-base-content opacity-70">
                Duration: {Math.floor(videoDuration / 60)}:
                {(Math.floor(videoDuration % 60)).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'trim' && uploadedVideo) {
    // Get Cloudinary video URL for trimming
    const cloudinaryVideoUrl = getCldVideoUrl({
      src: uploadedVideo.publicId,
    });

    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Toaster />
        <div className="mb-6">
          <button
            onClick={() => setStep('upload')}
            className="btn btn-ghost btn-sm mb-4"
          >
            ← Back to Upload
          </button>
          <h1 className="text-3xl font-bold">Trim Video</h1>
          <p className="text-base-content opacity-70 mt-2">
            Select the start and end points for your video
          </p>
        </div>

        <VideoTrimmer
          videoUrl={cloudinaryVideoUrl}
          videoDuration={parseFloat(uploadedVideo.duration.toString())}
          onTrim={handleTrim}
          isProcessing={isTrimming}
        />
        
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => {
              toast.success("Video saved without trimming!");
              router.push("/home");
            }}
            className="btn btn-ghost w-full"
          >
            Skip Trimming - Save Full Video
          </button>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Toaster />
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold">Video Trimmed Successfully!</h1>
          <p className="text-base-content opacity-70">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default VideoEdit;

