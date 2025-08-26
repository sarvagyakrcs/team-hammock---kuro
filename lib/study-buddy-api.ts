// Study Buddy API integration
const API_BASE_URL = 'https://prithivi-nanda-hammock.hf.space'

export interface MindMapNode {
  id: string
  label: string
  children: string[]
  explanation?: string
  metadata?: {
    color: string
    icon: string
  }
  parent_id?: string
}

export interface UploadResponse {
  message: string
  filename?: string
  error?: string
}

export interface QueryResponse {
  answer: string
  error?: string
}

class StudyBuddyAPI {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // Health check
  async healthCheck(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/`)
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Health check error:', error)
      throw error
    }
  }

  // Upload a document
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.baseURL}/upload/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  // Query the LLM with notes
  async query(query: string): Promise<QueryResponse> {
    try {
      const response = await fetch(`${this.baseURL}/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Query response:', result)
      return result
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }

  // Generate mind map
  async generateMindMap(query: string): Promise<MindMapNode[]> {
    try {
      const response = await fetch(`${this.baseURL}/generate-mindmap/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`Mind map generation failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Validate the response format
      if (!Array.isArray(data)) {
        throw new Error('Invalid mind map response format')
      }

      // Ensure each node has required properties
      return data.map((node: any, index: number) => ({
        id: node.id || `node_${index}`,
        label: node.label || `Node ${index + 1}`,
        children: Array.isArray(node.children) ? node.children : [],
        explanation: node.explanation || '',
        metadata: {
          color: node.metadata?.color || this.getRandomColor(),
          icon: node.metadata?.icon || this.getRandomIcon()
        },
        parent_id: node.parent_id || undefined
      }))
    } catch (error) {
      console.error('Mind map generation error:', error)
      throw error
    }
  }

  // Helper method to get random colors for nodes
  private getRandomColor(): string {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#06b6d4', // cyan
      '#f97316', // orange
      '#84cc16', // lime
      '#ec4899', // pink
      '#6b7280'  // gray
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Helper method to get random icons for nodes
  private getRandomIcon(): string {
    const icons = [
      '🧠', '📚', '💡', '🔬', '📊', '🎯', '⚛️', '🔍', '📝', '🎨',
      '🌟', '🚀', '🔥', '💎', '🌀', '⚡', '🌱', '🎪', '🎭', '🎪'
    ]
    return icons[Math.floor(Math.random() * icons.length)]
  }

  // Generate a mind map from a topic without requiring uploaded documents
  async generateTopicMindMap(topic: string): Promise<MindMapNode[]> {
    try {
      // First try to use the mind map endpoint
      const topicQuery = `Create a comprehensive mind map structure for the topic: ${topic}. Include main concepts, subtopics, and relationships.`
      console.log('Attempting to generate mind map for:', topic)
      
      const response = await this.generateMindMap(topicQuery)
      console.log('API response received, nodes:', response.length)
      
      if (response && response.length > 0) {
        return response
      } else {
        throw new Error('Empty response from API')
      }
    } catch (error) {
      // If the API fails, create a basic fallback mind map
      console.warn('API mind map generation failed, creating fallback:', error)
      return this.createFallbackMindMap(topic)
    }
  }

  // Generate mind map from uploaded document content
  async generateMindMapFromDocument(filename: string): Promise<MindMapNode[]> {
    try {
      // Create a query to generate mind map from all uploaded notes/documents
      const documentQuery = `Based on all the uploaded documents and notes in the database, create a comprehensive mind map. Focus on the main topics, key concepts, and their relationships found across all the content. Organize the information hierarchically showing how different concepts connect to each other.`
      console.log('Generating mind map from uploaded documents:', filename)
      
      const response = await this.generateMindMap(documentQuery)
      console.log('Document mind map response received, nodes:', response.length)
      
      if (response && response.length > 0) {
        return response
      } else {
        throw new Error('Empty response from document analysis')
      }
    } catch (error) {
      console.warn('Document mind map generation failed, creating fallback:', error)
      // Create a fallback based on the filename
      const topicFromFilename = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
      return this.createDocumentFallbackMindMap(topicFromFilename, filename)
    }
  }

  // Generate mind map from all uploaded notes in the database
  async generateMindMapFromAllNotes(): Promise<MindMapNode[]> {
    try {
      // Create a comprehensive query to analyze all uploaded content
      const allNotesQuery = `Create a comprehensive mind map based on all the uploaded documents and notes in the database. Analyze all the content and extract the main topics, themes, concepts, and their relationships. Organize this information into a hierarchical mind map structure that shows how different ideas and concepts connect to each other across all the uploaded materials.`
      console.log('Generating mind map from all uploaded notes')
      
      const response = await this.generateMindMap(allNotesQuery)
      console.log('All notes mind map response received, nodes:', response.length)
      
      if (response && response.length > 0) {
        return response
      } else {
        throw new Error('Empty response from notes analysis')
      }
    } catch (error) {
      console.warn('All notes mind map generation failed, creating fallback:', error)
      return this.createGeneralFallbackMindMap()
    }
  }

  // Fallback mind map creation
  private createFallbackMindMap(topic: string): MindMapNode[] {
    const rootId = '1'
    
    // Create a more comprehensive fallback based on the topic
    const fallbackNodes: MindMapNode[] = [
      {
        id: rootId,
        label: topic,
        children: ['2', '3', '4', '5'],
        explanation: `Main topic: ${topic}. This is a fallback mind map created when the AI service is unavailable.`,
        metadata: {
          color: '#3b82f6',
          icon: '🧠'
        }
      },
      {
        id: '2',
        label: 'Core Concepts',
        children: ['6', '7'],
        explanation: `Fundamental concepts and principles underlying ${topic}`,
        metadata: {
          color: '#10b981',
          icon: '💡'
        },
        parent_id: rootId
      },
      {
        id: '3',
        label: 'Key Components',
        children: ['8', '9'],
        explanation: `Main elements and building blocks of ${topic}`,
        metadata: {
          color: '#f59e0b',
          icon: '🔧'
        },
        parent_id: rootId
      },
      {
        id: '4',
        label: 'Applications',
        children: ['10', '11'],
        explanation: `Real-world applications and use cases of ${topic}`,
        metadata: {
          color: '#8b5cf6',
          icon: '🎯'
        },
        parent_id: rootId
      },
      {
        id: '5',
        label: 'Learning Path',
        children: ['12', '13'],
        explanation: `Suggested learning progression for ${topic}`,
        metadata: {
          color: '#ec4899',
          icon: '🛤️'
        },
        parent_id: rootId
      },
      {
        id: '6',
        label: 'Definitions',
        children: [],
        explanation: `Basic definitions and terminology for ${topic}`,
        metadata: {
          color: '#06b6d4',
          icon: '📖'
        },
        parent_id: '2'
      },
      {
        id: '7',
        label: 'Principles',
        children: [],
        explanation: `Governing principles and laws of ${topic}`,
        metadata: {
          color: '#84cc16',
          icon: '⚖️'
        },
        parent_id: '2'
      },
      {
        id: '8',
        label: 'Tools & Methods',
        children: [],
        explanation: `Tools, techniques, and methodologies used in ${topic}`,
        metadata: {
          color: '#f97316',
          icon: '🛠️'
        },
        parent_id: '3'
      },
      {
        id: '9',
        label: 'Systems',
        children: [],
        explanation: `Systems and frameworks within ${topic}`,
        metadata: {
          color: '#ef4444',
          icon: '🏗️'
        },
        parent_id: '3'
      },
      {
        id: '10',
        label: 'Industry Uses',
        children: [],
        explanation: `How ${topic} is applied in various industries`,
        metadata: {
          color: '#14b8a6',
          icon: '🏭'
        },
        parent_id: '4'
      },
      {
        id: '11',
        label: 'Research Areas',
        children: [],
        explanation: `Current research directions in ${topic}`,
        metadata: {
          color: '#a855f7',
          icon: '🔬'
        },
        parent_id: '4'
      },
      {
        id: '12',
        label: 'Beginner Level',
        children: [],
        explanation: `Starting point for learning ${topic}`,
        metadata: {
          color: '#22c55e',
          icon: '🌱'
        },
        parent_id: '5'
      },
      {
        id: '13',
        label: 'Advanced Level',
        children: [],
        explanation: `Advanced topics and specialized areas of ${topic}`,
        metadata: {
          color: '#dc2626',
          icon: '🎓'
        },
        parent_id: '5'
      }
    ]

    return fallbackNodes
  }

  // Document-specific fallback mind map
  private createDocumentFallbackMindMap(topic: string, filename: string): MindMapNode[] {
    const rootId = '1'
    
    const fallbackNodes: MindMapNode[] = [
      {
        id: rootId,
        label: topic,
        children: ['2', '3', '4'],
        explanation: `Document: ${filename}. Main content topic extracted from the uploaded document.`,
        metadata: {
          color: '#3b82f6',
          icon: '📄'
        }
      },
      {
        id: '2',
        label: 'Document Structure',
        children: ['5', '6'],
        explanation: `Organization and structure of the content in ${filename}`,
        metadata: {
          color: '#10b981',
          icon: '📋'
        },
        parent_id: rootId
      },
      {
        id: '3',
        label: 'Key Topics',
        children: ['7', '8'],
        explanation: `Main topics and themes covered in the document`,
        metadata: {
          color: '#f59e0b',
          icon: '🎯'
        },
        parent_id: rootId
      },
      {
        id: '4',
        label: 'Content Analysis',
        children: ['9', '10'],
        explanation: `Analysis and insights from the uploaded document`,
        metadata: {
          color: '#8b5cf6',
          icon: '🔍'
        },
        parent_id: rootId
      },
      {
        id: '5',
        label: 'Sections',
        children: [],
        explanation: `Main sections and chapters in the document`,
        metadata: {
          color: '#06b6d4',
          icon: '📑'
        },
        parent_id: '2'
      },
      {
        id: '6',
        label: 'Format',
        children: [],
        explanation: `Document format and presentation style`,
        metadata: {
          color: '#84cc16',
          icon: '📝'
        },
        parent_id: '2'
      },
      {
        id: '7',
        label: 'Primary Concepts',
        children: [],
        explanation: `Core concepts discussed in the document`,
        metadata: {
          color: '#f97316',
          icon: '💡'
        },
        parent_id: '3'
      },
      {
        id: '8',
        label: 'Supporting Details',
        children: [],
        explanation: `Supporting information and examples`,
        metadata: {
          color: '#ef4444',
          icon: '📊'
        },
        parent_id: '3'
      },
      {
        id: '9',
        label: 'Summary',
        children: [],
        explanation: `Key takeaways from the document`,
        metadata: {
          color: '#14b8a6',
          icon: '📌'
        },
        parent_id: '4'
      },
      {
        id: '10',
        label: 'Questions',
        children: [],
        explanation: `Questions you can ask about this document`,
        metadata: {
          color: '#a855f7',
          icon: '❓'
        },
        parent_id: '4'
      }
    ]

    return fallbackNodes
  }

  // General fallback mind map for when we don't have specific content
  private createGeneralFallbackMindMap(): MindMapNode[] {
    const rootId = '1'
    
    const fallbackNodes: MindMapNode[] = [
      {
        id: rootId,
        label: 'Your Study Materials',
        children: ['2', '3', '4'],
        explanation: 'Overview of all your uploaded study materials and notes.',
        metadata: {
          color: '#3b82f6',
          icon: '📚'
        }
      },
      {
        id: '2',
        label: 'Main Topics',
        children: ['5', '6'],
        explanation: 'Primary subjects and themes from your documents',
        metadata: {
          color: '#10b981',
          icon: '🎯'
        },
        parent_id: rootId
      },
      {
        id: '3',
        label: 'Key Concepts',
        children: ['7', '8'],
        explanation: 'Important concepts and ideas across your materials',
        metadata: {
          color: '#f59e0b',
          icon: '💡'
        },
        parent_id: rootId
      },
      {
        id: '4',
        label: 'Study Areas',
        children: ['9', '10'],
        explanation: 'Different areas of study represented in your uploads',
        metadata: {
          color: '#8b5cf6',
          icon: '🔬'
        },
        parent_id: rootId
      },
      {
        id: '5',
        label: 'Subject A',
        children: [],
        explanation: 'First major subject area from your documents',
        metadata: {
          color: '#06b6d4',
          icon: '📖'
        },
        parent_id: '2'
      },
      {
        id: '6',
        label: 'Subject B',
        children: [],
        explanation: 'Second major subject area from your documents',
        metadata: {
          color: '#84cc16',
          icon: '📋'
        },
        parent_id: '2'
      },
      {
        id: '7',
        label: 'Core Ideas',
        children: [],
        explanation: 'Fundamental ideas and principles',
        metadata: {
          color: '#f97316',
          icon: '⭐'
        },
        parent_id: '3'
      },
      {
        id: '8',
        label: 'Advanced Topics',
        children: [],
        explanation: 'More complex concepts and theories',
        metadata: {
          color: '#ef4444',
          icon: '🚀'
        },
        parent_id: '3'
      },
      {
        id: '9',
        label: 'Practical Applications',
        children: [],
        explanation: 'Real-world applications and examples',
        metadata: {
          color: '#14b8a6',
          icon: '🛠️'
        },
        parent_id: '4'
      },
      {
        id: '10',
        label: 'Further Reading',
        children: [],
        explanation: 'Additional study materials and references',
        metadata: {
          color: '#a855f7',
          icon: '📚'
        },
        parent_id: '4'
      }
    ]

    return fallbackNodes
  }
}

// Export singleton instance
export const studyBuddyAPI = new StudyBuddyAPI()
export default studyBuddyAPI
