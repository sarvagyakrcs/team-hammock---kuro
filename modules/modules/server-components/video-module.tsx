import React, { Suspense } from 'react'
import { Module } from '@prisma/client'
import { getVideos } from '@/actions/youtube/get-videos'
import { getMostSimilarVideoToNotes } from '@/lib/events/modules/get-video-embeddings'
import VideoModuleClient from '../client-components/video-module'
import { updateModuleVideo } from '@/actions/modules/update-module'

type Props = {
  module: Module
}

// Loading component for video search - matches VideoModuleClient's structure
const VideoLoader = ({ module }: { module: Module }) => (
  <div className="space-y-4">
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            {/* Badge skeleton */}
            <div className="mb-1 sm:mb-2 h-6 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
            {/* Heading skeleton */}
            <div className="h-7 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
          </div>
          {/* Video badge skeleton */}
          <div className="self-start h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
        </div>

        {/* Video container skeleton */}
        <div className="w-full rounded-lg overflow-hidden shadow-md bg-black">
          <div className="relative pb-[56.25%] w-full">
            <div className="absolute inset-0 bg-zinc-800 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-center text-zinc-600 dark:text-zinc-400">
                <svg className="mx-auto h-12 w-12 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Finding best video...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text and button skeleton */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 pt-2">
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          <div className="self-end sm:self-auto">
            <div className="h-9 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Component to find and show top 3 most similar videos
const VideoFinder = async ({ module }: Props) => {
  console.log("Finding top 3 most similar videos")
  try {
    const allVideos = await getVideos(module.name, 3)
    
    if (allVideos.length === 0) {
      throw new Error("No videos found")
    }

    try {
      // Get similarity scores for all videos
      const result = await getMostSimilarVideoToNotes(allVideos)
      
      if ('mostSimilarVideo' in result && result.similarityMap) {
        // Sort videos by similarity score (highest first)
        const sortedVideos = allVideos
          .map(video => ({
            video,
            similarity: result.similarityMap?.get(video.link)?.similarity || 0
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .map(item => item.video)

        console.log('Top 3 videos sorted by similarity')
        
        return <VideoModuleClient 
          module={module} 
          videos={sortedVideos}
          topSimilarVideo={result.mostSimilarVideo}
        />
      } else {
        // Fallback: just use the videos as-is
        return <VideoModuleClient 
          module={module} 
          videos={allVideos}
          topSimilarVideo={allVideos[0]}
        />
      }
    } catch (error) {
      console.log("Error finding similar videos, using original order:", error)
      return <VideoModuleClient 
        module={module} 
        videos={allVideos}
        topSimilarVideo={allVideos[0]}
      />
    }
  } catch (error) {
    console.error("Error in VideoFinder:", error)
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-4 text-center">
          <p className="text-red-500 font-medium">Unable to load video content</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Please try again later</p>
        </div>
      </div>
    )
  }
}

const VideoModule = async ({ module }: Props) => {
  if(!module.videoUrl){
    return (
      <Suspense fallback={<VideoLoader module={module} />}>
        <VideoFinder module={module} />
      </Suspense>
    )
  }
  
  return (
    <VideoModuleClient module={module} />
  )
}

export default VideoModule
