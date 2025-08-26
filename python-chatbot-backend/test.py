import os
from pinecone import Pinecone,ServerlessSpec
from dotenv import load_dotenv

load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "studybuddy-notes"
DIMENSION = 384  # Adjust based on your embedding size

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# List existing indexes
indexes = pc.list_indexes()
if INDEX_NAME not in indexes:
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )




