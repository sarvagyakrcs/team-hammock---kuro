import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from utils import process_file,embed_text  # Assuming your previous code is in utils.py
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pinecone import Pinecone
from dotenv import load_dotenv
import requests
load_dotenv()

app = FastAPI(title="Document Embedding Uploader")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX") or "studybuddy-notes"
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}


# CORS middleware (optional, for testing with frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Supported file types and their extensions
ALLOWED_EXTENSIONS = {
    "pdf": "pdf",
    "docx": "docx",
    "txt": "txt",
    "md": "md",
}

def get_file_type(filename: str):
    ext = filename.split(".")[-1].lower()
    if ext in ALLOWED_EXTENSIONS.values():
        return ext
    return None

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_type = get_file_type(file.filename)
    if not file_type:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file.file.close()

    try:
        process_file(file_location, file_type)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

    return {"message": f"File '{file.filename}' processed and embedded successfully"}


class QueryRequest(BaseModel):
    query: str

@app.post("/query/")
async def query_llm(req: QueryRequest):
    try:
        # Use your existing embed_text function for query embedding
        query_embedding = embed_text(req.query).tolist()

        # Query Pinecone index
        result = index.query(vector=query_embedding, top_k=5, include_metadata=True)

        docs = [match.get("metadata", {}).get("text", "") for match in result.get("matches", []) if "metadata" in match]

        context = "\n\n".join(docs) if docs else "No relevant context found."

        prompt = (
            f"You are a helpful assistant. Use the following context to answer the question.\n\n"
            f"Context:\n{context}\n\nQuestion: {req.query}\nAnswer:"
        )

        # Call Groq LLM API
        response = requests.post(
            GROQ_BASE_URL,
            headers=HEADERS,
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 512
            }
        )
        response.raise_for_status()
        answer = response.json()["choices"][0]["message"]["content"].strip()

        return {"answer": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
class MindMapRequest(BaseModel):
    query: str

@app.post("/generate-mindmap/")
async def generate_mindmap(req: MindMapRequest):
    prompt = (
        "You are a helpful assistant that creates mind map nodes from the user's query. "
        "Generate output strictly in JSON array format where each node has the following schema:\n\n"
        "{ \n"
        "  id: string,\n"
        "  label: string,\n"
        "  children: string[],\n"
        "  explanation?: string,\n"
        "  metadata?: { color: string, icon: string },\n"
        "  parent_id?: string\n"
        "}\n\n"
        f"User query: \"{req.query}\"\n\n"
        "Please respond ONLY with valid JSON."
    )

    try:
        response = requests.post(
            GROQ_BASE_URL,
            headers=HEADERS,
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {"role": "system", "content": "You are an expert mind map generator."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1024
            }
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"].strip()

        # Validate JSON format by parsing (catch errors)
        import json
        mindmap_nodes = json.loads(content)

        # Optional: Validate schema here or sanitize

        return mindmap_nodes

    except requests.HTTPError as http_err:
        raise HTTPException(status_code=response.status_code, detail=f"LLM API error: {http_err}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="LLM responded with invalid JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.get("/")
def root():
    return {"message": "Document embedding uploader API is running."}
