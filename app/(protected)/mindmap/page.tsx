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
import { mindMapData } from './data'
import { Heading, Subheading } from '@/components/ui/heading'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Transform mindMapData to React Flow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    // Find the root node (one without parent_id)
    const rootNode = mindMapData.find(node => !node.parent_id)
    
    // Create a more spread out circular/radial layout for this complex interconnected data
    const centerX = 400
    const centerY = 300
    const radiusIncrement = 150
    
    // Create nodes with better positioning
    mindMapData.forEach((nodeData, index) => {
      let x, y
      
      if (nodeData.id === rootNode?.id) {
        // Place root node in center
        x = centerX
        y = centerY
      } else {
        // Place other nodes in a circular pattern around the center
        const angle = (index * 2 * Math.PI) / mindMapData.length
        const radius = radiusIncrement + (index % 3) * 100 // Vary radius for visual interest
        x = centerX + radius * Math.cos(angle)
        y = centerY + radius * Math.sin(angle)
      }
      
      nodes.push({
        id: nodeData.id,
        type: 'custom',
        position: { x, y },
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
    const addedEdges = new Set<string>() // Prevent duplicate edges
    
    mindMapData.forEach(nodeData => {
      if (nodeData.children && nodeData.children.length > 0) {
        nodeData.children.forEach(childId => {
          // Verify the child node exists in the data
          const childExists = mindMapData.some(n => n.id === childId)
          const edgeId = `${nodeData.id}-${childId}`
          const reverseEdgeId = `${childId}-${nodeData.id}`
          
          if (childExists && !addedEdges.has(edgeId) && !addedEdges.has(reverseEdgeId)) {
            const sourceNode = mindMapData.find(n => n.id === nodeData.id)
            const targetNode = mindMapData.find(n => n.id === childId)
            
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
    
    // Debug: log what we're creating
    console.log('Nodes created:', nodes.length)
    console.log('Edges created:', edges.length) 
    console.log('Edge details:', edges)
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge color="purple" className="mb-2">
            <span>Mind Map</span>
          </Badge>
        </div>
        <div>
          <Heading className="text-2xl sm:text-3xl font-bold">
            Quantum Chromodynamics Mind Map
          </Heading>
          <Text className="text-zinc-500 dark:text-zinc-400 mt-1">
            Explore QCD concepts and their complex relationships in particle physics
          </Text>
          <Text className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 italic">
            💡 Hover over any node to see detailed explanations
          </Text>
        </div>
      </header>

      {/* Mind Map Container */}
      <div className="h-[800px] w-full rounded-lg border border-zinc-950/10 dark:border-white/15 bg-white dark:bg-zinc-900 overflow-hidden">
        {isMounted ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-zinc-50 dark:bg-zinc-950"
            defaultEdgeOptions={{
              style: { stroke: '#3b82f6', strokeWidth: 2 },
              type: 'smoothstep',
              animated: false
            }}
          >
            <Controls className="dark:bg-zinc-800 dark:border-white/15" />
            <MiniMap 
              className="dark:bg-zinc-800 dark:border-white/15"
              nodeColor="#3498db"
              maskColor="rgb(240, 240, 240, 0.6)"
            />
            <Background 
              gap={12} 
              size={1}
              className="dark:bg-zinc-950"
              color="#e4e4e7"
            />
          </ReactFlow>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <Text className="text-zinc-500 dark:text-zinc-400">Loading mind map...</Text>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-950/10 dark:border-white/15 p-4">
        <Subheading className="mb-3">QCD Concepts</Subheading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">⚛️</div>
            <Text className="text-sm">Fundamental Theory</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">🔺</div>
            <Text className="text-sm">Elementary Particles</Text>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">🌀</div>
            <Text className="text-sm">Force Carriers</Text>
          </div>
          <div className="flex items-center gap-2">
            <svg width="20" height="12" className="text-zinc-500 dark:text-zinc-400">
              <path d="M0 6 L20 6" stroke="currentColor" strokeWidth="2" />
            </svg>
            <Text className="text-sm">Relationships</Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MindMap