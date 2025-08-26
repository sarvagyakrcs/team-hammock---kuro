# 📚 Document Embedding Uploader and Chatbot API

## 🚀 Features
- Multi-format Support: Upload PDF, DOCX, TXT, and Markdown documents (OCR-ready for scanned PDFs).
- Smart Text Extraction & Chunking: Automatic splitting into optimized chunks for better semantic retrieval.
- Embeddings-as-a-Service: Converts text into dense vector embeddings using Sentence-Transformers (all-MiniLM-L6-v2).
- Vector-Powered Search: Stores embeddings in Pinecone for lightning-fast semantic search.
- LLM-Powered Q&A: Combines retrieved notes with Groq LLM for contextual and accurate answers.
- Mind Map Generator: Turns queries into hierarchical JSON knowledge maps (perfect for study visualization).
- Plug & Play for Frontend: API-first design with CORS enabled → ready for dashboards, chatbots, or study assistants.

---

## 🛠 Tech Stack
- Backend Framework: FastAPI (async, blazing fast)
- Vector Database: Pinecone for semantic search
- Embeddings: Sentence-Transformers — all-MiniLM-L6-v2
- LLM Orchestration: Groq API for low-latency text generation
- Document Processing: PyPDF2, docx2txt, Markdown parser, OCR-ready
- Infra Ready: Runs on Uvicorn / Docker, frontend-friendly with JSON responses
