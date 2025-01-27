import os
from abc import ABC, abstractmethod

import faiss
from sentence_transformers import SentenceTransformer


class ChatBotService(ABC):
    @abstractmethod
    async def generate_response(self, message: str) -> str:
        pass


class SimpleChatBot(ChatBotService):
    async def generate_response(self, message: str) -> str:
        return (
            f"I received your message: '{message}'." f" This is a simple echo response."
        )


class KnowledgeBaseBot(ChatBotService):
    def __init__(self, file_path: str = None):
        """
        If file_path is not provided, defaults to 'knowledge_base.txt'
        located in the same directory as this script.
        """
        if file_path is None:
            self.file_path = os.path.join(
                os.path.dirname(__file__), "knowledge_base.txt"
            )
        else:
            self.file_path = file_path

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )  # Lightweight local embedding model
        self.vector_store = None
        self.documents = None
        self.create_knowledge_base()

    def create_knowledge_base(self):
        """
        Reads each Q: ... / A: ... block from knowledge_base.txt and combines
        them into one chunk per QA pair. This ensures that retrieval
        yields both the question AND the answer together.
        """
        with open(self.file_path, "r", encoding="utf-8") as file:
            lines = [ln.strip() for ln in file.readlines() if ln.strip()]

        # We'll parse lines into chunks: whenever we see a line starting with 'Q:',
        # we start a new chunk. We keep adding lines (including 'A:')
        # until the next 'Q:' or the end.
        self.documents = []
        current_chunk = []

        for line in lines:
            # If this line starts with 'Q:' and we have an existing chunk,
            # push the old chunk
            if line.startswith("Q:"):
                # Push the current chunk if not empty
                if current_chunk:
                    self.documents.append(" ".join(current_chunk))
                    current_chunk = []
            current_chunk.append(line)

        # If there's a chunk leftover, push it too
        if current_chunk:
            self.documents.append(" ".join(current_chunk))

        # Create embeddings for each chunk
        embeddings = self.model.encode(self.documents, convert_to_tensor=False)

        # Create a FAISS index for the embeddings
        dimension = embeddings[0].shape[0]
        self.vector_store = faiss.IndexFlatL2(dimension)
        self.vector_store.add(embeddings)

    def query_knowledge_base(self, question: str, top_k: int = 1):
        """
        Searches the vector store for the best matching chunk(s).
        Returns a list of (chunk_text, distance).
        """
        question_embedding = self.model.encode([question], convert_to_tensor=False)
        distances, indices = self.vector_store.search(question_embedding, top_k)

        results = []
        for i, idx in enumerate(indices[0]):
            chunk_text = self.documents[idx]
            dist_value = float(distances[0][i])
            results.append((chunk_text, dist_value))

        return results

    async def generate_response(self, message: str) -> str:
        """
        Uses query_knowledge_base to find the best match.
        Removes the question part and relevance score from the response.
        """
        results = self.query_knowledge_base(message)
        if not results:
            return (
                "I'm sorry, I couldn't find any relevant information"
                " in the knowledge base."
            )

        best_chunk, distance = results[0]

        # Optional threshold to weed out irrelevant matches
        threshold = 1.5
        if distance > threshold:
            return (
                "I'm sorry, I couldn't find any relevant information"
                " in the knowledge base."
            )

        # Remove "Q:" portion and only return the answer portion
        # We'll split on "A:" and keep everything after.
        answer_text = best_chunk
        if "A:" in best_chunk:
            parts = best_chunk.split("A:", 1)
            # parts[0] -> "Q: ..." ; parts[1] -> "Answer content"
            if len(parts) == 2:
                answer_text = parts[1].strip()

        return answer_text
