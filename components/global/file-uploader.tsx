'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Heading } from '@/components/ui/heading'
import { Badge } from '@/components/ui/badge'
import clsx from 'clsx'

interface FileUploaderProps {
  onUploadComplete?: (filename: string) => void
  className?: string
}

interface UploadResponse {
  message: string
  filename?: string
  error?: string
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, className }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const API_BASE_URL = 'https://prithivi-nanda-hammock.hf.space'

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    setUploadStatus('idle')

    try {
      const file = files[0] // Handle single file for now
      
      // Validate file type
      const allowedTypes = ['.pdf', '.docx', '.txt', '.md']
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} not supported. Please upload: ${allowedTypes.join(', ')}`)
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB')
      }

      const result = await uploadFile(file)
      
      setUploadStatus('success')
      setUploadMessage(result.message || 'File uploaded successfully!')
      setUploadedFiles(prev => [...prev, file.name])
      
      if (onUploadComplete) {
        onUploadComplete(file.name)
      }
    } catch (error) {
      setUploadStatus('error')
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <Heading level={3} className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upload Study Materials
        </Heading>
        <Text className="text-zinc-600 dark:text-zinc-400">
          Upload documents to automatically generate mind maps and enable AI chat about your content
        </Text>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200',
          isDragging
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20'
            : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50 dark:hover:from-zinc-900 dark:hover:to-zinc-800',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="space-y-2">
              <Text className="font-medium text-blue-600 dark:text-blue-400">
                Processing Document
              </Text>
              <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                Uploading file and generating mind map...
              </Text>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 text-zinc-400 dark:text-zinc-500">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="space-y-3">
              <Text className="text-lg font-medium text-zinc-700 dark:text-zinc-200">
                Drop your study materials here
              </Text>
              <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                or click to browse files
              </Text>
              <Text className="text-xs text-zinc-400 dark:text-zinc-500">
                Supports PDF, DOCX, TXT, MD • Max 10MB
              </Text>
            </div>
            <label htmlFor="file-upload">
              <Button as="span" className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3">
                Choose Files
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileInput}
              />
            </label>
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploadStatus !== 'idle' && (
        <div className={clsx(
          'p-4 rounded-lg border',
          uploadStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
        )}>
          <div className="flex items-center gap-2">
            {uploadStatus === 'success' ? (
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <Text className={clsx(
              'text-sm font-medium',
              uploadStatus === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            )}>
              {uploadMessage}
            </Text>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Uploaded Files:
          </Text>
          <div className="space-y-1">
            {uploadedFiles.map((filename, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-md">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                  {filename}
                </Text>
                <Badge color="green" className="ml-auto">
                  <span>✓</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploader
