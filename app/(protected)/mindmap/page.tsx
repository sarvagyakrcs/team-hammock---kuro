'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Heading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import FileUploader from '@/components/global/file-uploader'
import StudyChatbot from '@/components/global/study-chatbot'
import { studyBuddyAPI, type MindMapNode } from '@/lib/study-buddy-api'
import clsx from 'clsx'

// Custom Node Component
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const { label, metadata, explanation } = data
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
      <div
        className={clsx(
          'px-4 py-3 rounded-lg border shadow-sm bg-white dark:bg-zinc-800 transition-all relative cursor-pointer',
          'min-w-[140px] max-w-[220px]',
          selected 
            ? 'shadow-lg ring-2 ring-opacity-50' 
            : 'border-zinc-950/10 dark:border-white/15 hover:border-zinc-950/20 dark:hover:border-white/25 hover:shadow-md'
        )}
        style={{
          borderColor: selected ? metadata?.color || '#3b82f6' : undefined
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-3">
          {metadata?.icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-lg"
                 style={{ backgroundColor: metadata.color + '20', color: metadata.color }}>
              {metadata.icon}
            </div>
          )}
          <div>
            <Text className="text-sm font-medium text-zinc-950 dark:text-white leading-tight">
              {label}
            </Text>
          </div>
        </div>
        
        {/* Tooltip */}
        {showTooltip && explanation && (
          <div 
            className="absolute p-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-lg shadow-lg border border-zinc-700 dark:border-zinc-300 max-w-xs"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              zIndex: 1000 // Higher than React Flow's z-index
            }}
          >
            <div className="relative">
              {/* Arrow pointing up */}
              <div 
                className="absolute w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-zinc-900 dark:border-b-zinc-100"
                style={{
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
              <strong className="block mb-1" style={{ color: metadata?.color || '#3b82f6' }}>
                {label}
              </strong>
              <p className="text-xs leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

const MindMap = () => {
  const [isMounted, setIsMounted] = useState(false)
  const [currentMindMapData, setCurrentMindMapData] = useState<MindMapNode[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const [showUploader, setShowUploader] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [hasGeneratedMap, setHasGeneratedMap] = useState(false)
  const [currentDocumentName, setCurrentDocumentName] = useState<string>('')

  useEffect(() => {
    setIsMounted(true)
    
    // Show demo mindmap immediately on load
    const demoData: MindMapNode[] = [
      {
        id: "1",
        label: "AI Study Assistant",
        children: ["2", "3", "4"],
        explanation: "Your intelligent study companion for learning and knowledge mapping",
        metadata: { color: "#3b82f6", icon: "🤖" },
      },
      {
        id: "2",
        label: "Mind Mapping",
        children: ["5", "6"],
        explanation: "Visual representation of knowledge and concepts",
        metadata: { color: "#10b981", icon: "🧠" },
        parent_id: "1",
      },
      {
        id: "3",
        label: "Document Analysis",
        children: ["7", "8"],
        explanation: "AI-powered analysis of your study materials",
        metadata: { color: "#f59e0b", icon: "📄" },
        parent_id: "1",
      },
      {
        id: "4",
        label: "Smart Chat",
        children: ["9", "10"],
        explanation: "Interactive Q&A about your study content",
        metadata: { color: "#8b5cf6", icon: "💬" },
        parent_id: "1",
      },
      {
        id: "5",
        label: "Concept Mapping",
        children: [],
        explanation: "Visualize relationships between ideas",
        metadata: { color: "#06b6d4", icon: "🗺️" },
        parent_id: "2",
      },
      {
        id: "6",
        label: "Knowledge Trees",
        children: [],
        explanation: "Hierarchical organization of information",
        metadata: { color: "#84cc16", icon: "🌳" },
        parent_id: "2",
      },
      {
        id: "7",
        label: "Content Extraction",
        children: [],
        explanation: "Extract key information from documents",
        metadata: { color: "#f97316", icon: "🔍" },
        parent_id: "3",
      },
      {
        id: "8",
        label: "Topic Modeling",
        children: [],
        explanation: "Identify main themes and topics",
        metadata: { color: "#ef4444", icon: "🎯" },
        parent_id: "3",
      },
      {
        id: "9",
        label: "Contextual Answers",
        children: [],
        explanation: "Get answers based on your uploaded content",
        metadata: { color: "#14b8a6", icon: "🎭" },
        parent_id: "4",
      },
      {
        id: "10",
        label: "Study Guidance",
        children: [],
        explanation: "Personalized learning recommendations",
        metadata: { color: "#a855f7", icon: "🧭" },
        parent_id: "4",
      },
    ]
    
    setCurrentMindMapData(demoData)
    setHasGeneratedMap(true)
    setTopicInput('AI Study Assistant (Demo)')
  }, [])

  // Generate mind map from topic
  const generateMindMapFromTopic = async (customTopic?: string) => {
    const topic = customTopic || topicInput.trim()
    if (!topic || isGenerating) return

    setIsGenerating(true)
    setCurrentDocumentName('')
    if (customTopic) setTopicInput(customTopic)
    
    try {
      const newMindMapData = await studyBuddyAPI.generateTopicMindMap(topic)
      setCurrentMindMapData(newMindMapData)
      setHasGeneratedMap(true)
    } catch (error) {
      console.error('Failed to generate mind map:', error)
      // Create a simple fallback if API fails
      const fallbackData: MindMapNode[] = [
        {
          id: '1',
          label: topic,
          children: [],
          explanation: `Topic: ${topic}. Mind map generation failed, but you can still chat about this topic.`,
          metadata: { color: '#3b82f6', icon: '🧠' }
        }
      ]
      setCurrentMindMapData(fallbackData)
      setHasGeneratedMap(true)
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate mind map from uploaded document
  const generateMindMapFromDocument = async (filename: string) => {
    setIsGenerating(true)
    setShowUploader(false)
    setShowChatbot(true) // Auto-enable chatbot for documents
    
    try {
      const newMindMapData = await studyBuddyAPI.generateMindMapFromDocument(filename)
      setCurrentMindMapData(newMindMapData)
      setHasGeneratedMap(true)
      setCurrentDocumentName(filename)
      setTopicInput(filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '))
    } catch (error) {
      console.error('Failed to generate mind map from document:', error)
      // Create a fallback based on document name
      const topicFromFilename = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
      const fallbackData: MindMapNode[] = [
        {
          id: '1',
          label: topicFromFilename,
          children: [],
          explanation: `Document: ${filename}. Mind map generation failed, but you can still chat about this document.`,
          metadata: { color: '#3b82f6', icon: '📄' }
        }
      ]
      setCurrentMindMapData(fallbackData)
      setHasGeneratedMap(true)
      setCurrentDocumentName(filename)
      setTopicInput(topicFromFilename)
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate mind map from all uploaded notes
  const generateMindMapFromAllNotes = async () => {
    if (isGenerating) return

    setIsGenerating(true)
    setCurrentDocumentName('')
    setShowUploader(false)
    setShowChatbot(true) // Auto-enable chatbot
    
    try {
      const newMindMapData = await studyBuddyAPI.generateMindMapFromAllNotes()
      setCurrentMindMapData(newMindMapData)
      setHasGeneratedMap(true)
      setTopicInput('All Study Materials')
    } catch (error) {
      console.error('Failed to generate mind map from all notes:', error)
      // Create a fallback for all notes
      const fallbackData: MindMapNode[] = [
        {
          id: '1',
          label: 'Your Study Materials',
          children: [],
          explanation: 'Overview of all your uploaded study materials. Mind map generation failed, but you can still chat about your documents.',
          metadata: { color: '#3b82f6', icon: '📚' }
        }
      ]
      setCurrentMindMapData(fallbackData)
      setHasGeneratedMap(true)
      setTopicInput('All Study Materials')
    } finally {
      setIsGenerating(false)
    }
  }

  // Transform currentMindMapData to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    if (currentMindMapData.length === 0) {
      console.log('No mind map data available')
      return { initialNodes: [], initialEdges: [] }
    }
    
    // Find the root node (one without parent_id)
    const rootNode = currentMindMapData.find(node => !node.parent_id) || currentMindMapData[0]
    console.log('Root node found:', rootNode)
    
    // Simplified layout - just place nodes in a simple pattern
    const centerX = 400
    const centerY = 300
    
    // Create React Flow nodes with simple positioning
    currentMindMapData.forEach((nodeData, index) => {
      let position = { x: centerX, y: centerY }
      
      if (nodeData.id === rootNode.id) {
        // Root in center
        position = { x: centerX, y: centerY }
      } else {
        // Arrange other nodes in a circle around the center
        const angle = (index * 2 * Math.PI) / Math.max(currentMindMapData.length - 1, 1)
        const radius = 200
        position = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      }
      
      nodes.push({
        id: nodeData.id,
        type: 'custom',
        position,
        data: {
          label: nodeData.label,
          metadata: nodeData.metadata,
          explanation: nodeData.explanation
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left
      })
    })
    
    // Create edges from parent-child relationships
    const addedEdges = new Set<string>()
    
    currentMindMapData.forEach(nodeData => {
      if (nodeData.children && nodeData.children.length > 0) {
        nodeData.children.forEach(childId => {
          const childExists = currentMindMapData.some(n => n.id === childId)
          const edgeId = `${nodeData.id}-${childId}`
          const reverseEdgeId = `${childId}-${nodeData.id}`
          
          if (childExists && !addedEdges.has(edgeId) && !addedEdges.has(reverseEdgeId)) {
            const sourceNode = currentMindMapData.find(n => n.id === nodeData.id)
            
            edges.push({
              id: edgeId,
              source: nodeData.id,
              target: childId,
              type: 'smoothstep',
              style: {
                stroke: sourceNode?.metadata?.color || '#3b82f6',
                strokeWidth: 2,
              },
              animated: false,
              label: undefined
            })
            addedEdges.add(edgeId)
          }
        })
      }
    })
    
    console.log('Mind map layout created:')
    console.log('- Nodes:', nodes.length)
    console.log('- Edges:', edges.length)
    console.log('- Root node:', rootNode.label)
    console.log('- All nodes:', nodes.map(n => ({ id: n.id, position: n.position })))
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [currentMindMapData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when initialNodes/initialEdges change
  useEffect(() => {
    console.log('Updating React Flow with new data:', {
      nodeCount: initialNodes.length,
      edgeCount: initialEdges.length,
      mindMapDataCount: currentMindMapData.length
    })
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-zinc-900 dark:to-zinc-800">
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {!hasGeneratedMap ? (
          /* Welcome Screen */
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto space-y-8">
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <Heading className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Study Buddy
                </Heading>
                <Text className="text-xl text-zinc-600 dark:text-zinc-300">
                  Generate interactive mind maps from any topic or document
                </Text>
              </div>

              {/* Main Input */}
              <div className="space-y-4">
                <div className="flex gap-3 max-w-lg mx-auto">
                  <Input
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Enter any topic (e.g., Machine Learning, Photosynthesis)"
                    className="flex-1 h-12 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && generateMindMapFromTopic()}
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={() => generateMindMapFromTopic()}
                    disabled={!topicInput.trim() || isGenerating}
                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isGenerating ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setShowUploader(!showUploader)}
                    className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    📄 Upload Documents
                  </Button>
                  <Button
                    onClick={generateMindMapFromAllNotes}
                    disabled={isGenerating}
                    className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    🧠 Map All Notes
                  </Button>
                  <Button
                    onClick={() => setShowChatbot(!showChatbot)}
                    className="bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    💬 Ask Questions
                  </Button>
                  <Button
                    onClick={() => {
                      // Show demo mindmap immediately using predefined data
                      const demoData: MindMapNode[] = [
                        {
                          id: "1",
                          label: "React Development",
                          children: ["2", "3"],
                          explanation: "A JavaScript library for building user interfaces",
                          metadata: { color: "#61dafb", icon: "⚛️" },
                        },
                        {
                          id: "2",
                          label: "Components",
                          children: ["4", "5"],
                          explanation: "Independent, reusable UI pieces in React",
                          metadata: { color: "#ff8c00", icon: "🧱" },
                          parent_id: "1",
                        },
                        {
                          id: "3",
                          label: "Hooks",
                          children: ["6", "7", "8"],
                          explanation: "Functions that let you use state and other React features",
                          metadata: { color: "#32cd32", icon: "🪝" },
                          parent_id: "1",
                        },
                        {
                          id: "4",
                          label: "Function Component",
                          children: [],
                          explanation: "A component defined as a function that returns JSX",
                          metadata: { color: "#4682b4", icon: "⚡" },
                          parent_id: "2",
                        },
                        {
                          id: "5",
                          label: "Class Component",
                          children: [],
                          explanation: "A component defined as a class extending React.Component",
                          metadata: { color: "#8a2be2", icon: "🏛️" },
                          parent_id: "2",
                        },
                        {
                          id: "6",
                          label: "useState",
                          children: [],
                          explanation: "Hook that lets you add state to function components",
                          metadata: { color: "#20b2aa", icon: "📊" },
                          parent_id: "3",
                        },
                        {
                          id: "7",
                          label: "useEffect",
                          children: [],
                          explanation: "Hook for performing side effects in components",
                          metadata: { color: "#d2691e", icon: "🔄" },
                          parent_id: "3",
                        },
                        {
                          id: "8",
                          label: "useContext",
                          children: [],
                          explanation: "Hook for consuming values from React Context",
                          metadata: { color: "#dc143c", icon: "🌐" },
                          parent_id: "3",
                        },
                      ]
                      setCurrentMindMapData(demoData)
                      setHasGeneratedMap(true)
                      setTopicInput('React Development (Demo)')
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  >
                    🚀 Try Demo
                  </Button>
                </div>
              </div>

              {/* Quick Examples */}
              <div className="space-y-3">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  Try these examples:
                </Text>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Quantum Physics', 'Climate Change', 'Ancient Rome', 'Machine Learning'].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => generateMindMapFromTopic(topic)}
                      className="px-3 py-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-full hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                      disabled={isGenerating}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Mind Map View */
          <div className="space-y-6">
            {/* Debug Info */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                Debug: isMounted={isMounted ? 'true' : 'false'}, 
                mindMapData={currentMindMapData.length}, 
                nodes={nodes.length}, 
                edges={edges.length}
              </Text>
            </div>
            
            {/* Header with Controls */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      setHasGeneratedMap(false)
                      setCurrentMindMapData([])
                      setTopicInput('')
                      setCurrentDocumentName('')
                      setShowChatbot(false)
                      setShowUploader(false)
                    }}
                    className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                  >
                    ← New Topic
                  </Button>
                  <div>
                    <Heading level={2} className="text-lg font-semibold">
                      {currentDocumentName ? (
        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <span>{topicInput}</span>
        </div>
                      ) : (
                        topicInput
                      )}
          </Heading>
                    <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                      {currentDocumentName 
                        ? `Document analysis • ${currentMindMapData.length} concepts mapped`
                        : `${currentMindMapData.length} concepts mapped`
                      }
          </Text>
        </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowUploader(!showUploader)}
                    className={clsx(
                      "transition-colors",
                      showUploader ? "bg-blue-600 hover:bg-blue-700" : "bg-zinc-600 hover:bg-zinc-700"
                    )}
                  >
                    📄 Upload
                  </Button>
                  <Button
                    onClick={() => setShowChatbot(!showChatbot)}
                    className={clsx(
                      "transition-colors",
                      showChatbot ? "bg-green-600 hover:bg-green-700" : "bg-zinc-600 hover:bg-zinc-700"
                    )}
                  >
                    💬 Chat
                  </Button>
                  <Button
                    onClick={() => {
                      // Force a simple test mindmap
                      const testData: MindMapNode[] = [
                        {
                          id: "test1",
                          label: "Test Node",
                          children: ["test2"],
                          explanation: "This is a test node",
                          metadata: { color: "#ff0000", icon: "🧪" },
                        },
                        {
                          id: "test2",
                          label: "Child Node",
                          children: [],
                          explanation: "This is a child node",
                          metadata: { color: "#00ff00", icon: "🔗" },
                          parent_id: "test1"
                        }
                      ]
                      console.log('Setting test data:', testData)
                      setCurrentMindMapData(testData)
                      setTopicInput('Test (Manual)')
                      setHasGeneratedMap(true)
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    🧪 Test
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Uploader */}
        {showUploader && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
            <FileUploader
              onUploadComplete={(filename) => {
                console.log('File uploaded:', filename)
                generateMindMapFromDocument(filename)
              }}
            />
          </div>
        )}

        {/* Mind Map and Chat Layout */}
        {hasGeneratedMap && (
          <div className={clsx(
            "grid gap-6",
            showChatbot ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
          )}>
      {/* Mind Map Container */}
            <div className={clsx(
              "h-[700px] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-lg",
              showChatbot ? "lg:col-span-2" : "col-span-1"
            )}>
              {(() => {
                console.log('Render check:', {
                  isMounted,
                  mindMapDataLength: currentMindMapData.length,
                  nodesLength: nodes.length,
                  edgesLength: edges.length,
                  hasGeneratedMap
                })
                return isMounted && currentMindMapData.length > 0
              })() ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
                  className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-zinc-950 dark:to-zinc-900"
            defaultEdgeOptions={{
              style: { stroke: '#3b82f6', strokeWidth: 2 },
              type: 'smoothstep',
              animated: false
            }}
          >
                  <Controls className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg" />
            <MiniMap 
                    className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
              nodeColor="#3498db"
              maskColor="rgb(240, 240, 240, 0.6)"
            />
            <Background 
                    gap={16} 
              size={1}
                    color="#e2e8f0"
                    className="opacity-30"
            />
          </ReactFlow>
        ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <Text className="text-zinc-500 dark:text-zinc-400">
                      {isGenerating ? 'Generating mind map...' : 'Loading visualization...'}
                    </Text>
            </div>
          </div>
        )}
      </div>
      
            {/* Chatbot */}
            {showChatbot && (
              <div className="lg:col-span-1">
                <StudyChatbot className="h-[700px]" />
          </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MindMap