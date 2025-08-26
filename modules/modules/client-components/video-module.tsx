"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { SparkleIcon } from '@/components/ui/sparkle-icon'
import { Text } from '@/components/ui/text'
import { Module } from '@prisma/client'
import { ChevronLeft, Play, Star, Clock } from 'lucide-react'
import React, { useState } from 'react'
import { updateModuleVideo } from '@/actions/modules/update-module'

type VideoResult = {
  title: string
  link: string
  thumbnailUrl: string
  transcript: string
  videoInfo?: {
    description: string
    channel: string
    publishedAt: string
  }
}

type Props = {
    module: Module
    videos?: VideoResult[]
    topSimilarVideo?: VideoResult
}

// Function to transform YouTube URLs properly
const getEmbedUrl = (url: string) => {
    try {
      // Handle YouTube links
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Extract video ID
        let videoId;
        if (url.includes('watch?v=')) {
          videoId = new URL(url).searchParams.get('v');
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
          return url; // Already an embed URL
        }
        
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      // Return original URL if not YouTube or couldn't parse
      return url;
    } catch (e) {
      console.error("Error parsing video URL:", e);
      return url;
    }
  };

const VideoModuleClient = ({ module, videos, topSimilarVideo }: Props) => {
  const [videoError, setVideoError] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(
    module.videoUrl || topSimilarVideo?.link || ""
  );

  const embedUrl = getEmbedUrl(selectedVideoUrl);

  const handleVideoSelect = async (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    setVideoError(false);
    
    // Update the module in the database
    try {
      await updateModuleVideo(module.id, videoUrl);
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  // If we have videos to choose from, show the selection interface
  if (videos && videos.length > 0 && !module.videoUrl) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <Badge color="blue" className="mb-1 sm:mb-2">
                  <SparkleIcon className="mr-1 size-3 sm:size-4" />
                  <span>Choose Video</span>
                </Badge>
                <Heading level={2} className="text-base sm:text-xl font-bold">{module.name}</Heading>
              </div>
              <Badge color="zinc" className="self-start rounded-full px-2 sm:px-3 py-1 text-xs">
                <span>Top 3 matches</span>
              </Badge>
            </div>

            {/* Current selected video */}
            {selectedVideoUrl && (
              <div className="w-full rounded-lg overflow-hidden shadow-md bg-black">
                <div className="relative pb-[56.25%] w-full">
                  {videoError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <div className="text-center p-4">
                        <p className="text-red-500 font-medium">Unable to load video</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Try selecting another video</p>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={embedUrl}
                      title={`${module.name} video`}
                      frameBorder="0"
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onError={() => setVideoError(true)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Video selection grid */}
            <div className="space-y-3">
              <Text className="font-medium text-sm">Select from top 3 most similar videos:</Text>
              <div className="grid gap-3">
                {videos.map((video, index) => {
                  const isSelected = selectedVideoUrl === video.link;
                  const isTopMatch = topSimilarVideo?.link === video.link;
                  
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                      onClick={() => handleVideoSelect(video.link)}
                    >
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Text className="text-sm font-medium line-clamp-2">{video.title}</Text>
                          <div className="flex gap-1 flex-shrink-0">
                            {isTopMatch && (
                              <Badge color="amber" className="text-xs">
                                <Star className="mr-1 size-3" />
                                <span>#{index + 1} Best</span>
                              </Badge>
                            )}
                            {!isTopMatch && (
                              <Badge color="zinc" className="text-xs">
                                <span>#{index + 1}</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Text className="text-xs text-zinc-500">
                            {video.videoInfo?.channel || 'YouTube Video'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 pt-2">
              <Text className="text-xs sm:text-sm text-muted-foreground">
                {selectedVideoUrl ? 'Video selected!' : 'Choose a video to get started.'}
              </Text>
              <div className="self-end sm:self-auto">
                <Button href={`/home`} color="sky" className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    Back <ChevronLeft size={16} />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular video display when video is already selected
  return (
    <div className="space-y-4">
      {selectedVideoUrl && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <Badge color="blue" className="mb-1 sm:mb-2">
                  <SparkleIcon className="mr-1 size-3 sm:size-4" />
                  <span>Video Content</span>
                </Badge>
                <Heading level={2} className="text-base sm:text-xl font-bold">{module.name}</Heading>
              </div>
              <Badge color="zinc" className="self-start rounded-full px-2 sm:px-3 py-1 text-xs">
                <Play className="mr-1 size-3" />
                <span>Video</span>
              </Badge>
            </div>

            <div className="w-full rounded-lg overflow-hidden shadow-md bg-black">
              <div className="relative pb-[56.25%] w-full">
                {videoError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="text-center p-4">
                      <p className="text-red-500 font-medium">Unable to load video</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Please check the video URL and try again</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={embedUrl}
                    title={`${module.name} video`}
                    frameBorder="0"
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    onError={() => setVideoError(true)}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 pt-2">
              <Text className="text-xs sm:text-sm text-muted-foreground">Watch the complete video to understand the key concepts.</Text>
              <div className="self-end sm:self-auto">
                <Button href={`/home`} color="sky" className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    Back <ChevronLeft size={16} />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoModuleClient