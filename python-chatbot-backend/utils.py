import os
from PyPDF2 import PdfReader
import docx2txt
from pinecone import Pinecone, ServerlessSpec
from transformers import AutoTokenizer, AutoModel
import torch
from dotenv import load_dotenv

load_dotenv()
# -------- Document Text Extraction --------

def extract_text_from_pdf(file_path: str, use_ocr: bool = True) -> str:
    text = ""
    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print(f"PDF text extraction error: {e}")

    return text

def extract_text_from_docx(file_path: str) -> str:
    try:
        return docx2txt.process(file_path)
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

def extract_text_from_txt(file_path: str) -> str:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"TXT extraction error: {e}")
        return ""

def extract_text_from_md(file_path: str) -> str:
    return extract_text_from_txt(file_path)

# -------- Hugging Face Embedding Setup --------

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model.eval()

def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, dim=1)
    sum_mask = torch.clamp(input_mask_expanded.sum(dim=1), min=1e-9)
    return sum_embeddings / sum_mask

def embed_text(text):
    encoded_input = tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors='pt')
    with torch.no_grad():
        model_output = model(**encoded_input)
    embeddings = mean_pooling(model_output, encoded_input['attention_mask'])
    normalized_embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
    return normalized_embeddings[0].cpu().numpy()

# -------- Pinecone Setup --------

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "studybuddy-notes"
DIMENSION = 384  # Embedding dimension from the model

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# -------- Text Chunking --------

def chunk_text(text, chunk_size=500, overlap=100):
    if overlap >= chunk_size:
        raise ValueError("Overlap must be smaller than chunk size")
    chunks = []
    start = 0
    text_length = len(text)
    while start < text_length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

# -------- Complete Pipeline --------

def process_file(file_path, file_type):
    if file_type == "pdf":
        text = extract_text_from_pdf(file_path)
    elif file_type == "docx":
        text = extract_text_from_docx(file_path)
    elif file_type == "txt":
        text = extract_text_from_txt(file_path)
    elif file_type == "md":
        text = extract_text_from_md(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

    chunks = chunk_text(text)
    vectors = []
    for i, chunk in enumerate(chunks):
        vector = embed_text(chunk)
        vector_id = f"{os.path.basename(file_path)}_chunk_{i}"
        vectors.append((vector_id, vector))

    index.upsert(vectors)

#----retrieve from pinecone------
def retrieve_from_pinecone(query: str, top_k: int = 5):
    # Embed the query text
    query_vector = embed_text(query)

    # Query Pinecone index
    result = index.query(vector=query_vector, top_k=top_k, include_metadata=True)

    # Parse and return results (ID, score, metadata)
    matches = []
    for match in result['matches']:
        matches.append({
            'id': match['id'],
            'score': match['score'],
            'metadata': match.get('metadata', {})
        })
    return matches