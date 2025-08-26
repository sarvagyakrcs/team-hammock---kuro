# Study Buddy API Integration

This project now includes a complete integration with the Study Buddy API hosted at `https://prithivi-nanda-hammock.hf.space/`. The integration provides three main features:

## 🧠 Features

### 1. File Upload Component (`/components/global/file-uploader.tsx`)
- Drag & drop or click to upload files
- Supports PDF, DOCX, TXT, and MD files up to 10MB
- Real-time upload status and progress
- List of successfully uploaded files
- Automatic file validation

### 2. Study Chatbot (`/components/global/study-chatbot.tsx`)
- AI-powered chat interface
- Query uploaded documents for answers
- Real-time conversation with loading states
- Chat history with timestamps
- Clear chat functionality

### 3. Mind Map Generator (`/app/(protected)/mindmap/page.tsx`)
- Generate mind maps from any topic using AI
- Interactive React Flow visualization
- Dynamic node positioning and relationships
- Hover tooltips with detailed explanations
- Customizable colors and icons

## 🚀 API Service (`/lib/study-buddy-api.ts`)

The `StudyBuddyAPI` class provides methods for:

- `healthCheck()` - Verify API connectivity
- `uploadDocument(file)` - Upload documents for processing
- `query(question)` - Ask questions about uploaded content
- `generateMindMap(topic)` - Generate mind maps from topics
- `generateTopicMindMap(topic)` - Create mind maps with fallback support

## 📱 Usage

### Mind Map Page
Navigate to `/mindmap` to:
1. **Generate Topic Mind Maps**: Enter any topic (e.g., "Machine Learning", "Photosynthesis") and click Generate
2. **Upload Documents**: Click "📁 Upload Documents" to upload files - mind maps are automatically generated
3. **Map All Notes**: Click "🧠 Map All Notes" to create a comprehensive mind map from all uploaded documents
4. **Chat with AI**: Click "💬 Ask Questions" to chat about your documents and topics
5. **Explore**: Hover over mind map nodes to see detailed explanations

### Automatic Workflow
- **File Upload** → **Automatic Mind Map Generation** → **Auto-Enable Chat** → **Ready to Study**

### Direct Component Usage

```tsx
import FileUploader from '@/components/global/file-uploader'
import StudyChatbot from '@/components/global/study-chatbot'
import { studyBuddyAPI } from '@/lib/study-buddy-api'

// File uploader
<FileUploader 
  onUploadComplete={(filename) => console.log('Uploaded:', filename)}
/>

// Chatbot
<StudyChatbot className="h-96" />

// API usage
const mindMap = await studyBuddyAPI.generateTopicMindMap('Physics')
const answer = await studyBuddyAPI.query('What is quantum mechanics?')
```

## 🔧 API Endpoints

The integration uses these Study Buddy API endpoints:

1. **Health Check**: `GET /`
2. **Upload Document**: `POST /upload/`
3. **Query LLM**: `POST /query/`
4. **Generate Mind Map**: `POST /generate-mindmap/`

## 📄 Supported File Types

- **PDF** (.pdf)
- **Word Documents** (.docx)
- **Text Files** (.txt)
- **Markdown** (.md)

## 💡 Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Automatic theme switching
- **Error Handling**: Graceful fallbacks and user feedback
- **Loading States**: Visual feedback during API calls
- **Type Safety**: Full TypeScript support

## 🧪 Testing

Run the API test script:

```bash
npx tsx scripts/test/study-buddy-api.ts
```

## 🎯 Next Steps

1. **Enhanced File Processing**: Generate mind maps directly from uploaded documents
2. **Collaboration**: Share mind maps with other users
3. **Export**: Download mind maps as images or PDFs
4. **Templates**: Pre-built mind map templates for different subjects
5. **Analytics**: Track learning progress and insights
