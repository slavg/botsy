
# Botsy - Intelligent Chat Bot

Botsy is a chat bot built with **FastAPI** for the backend and **React** for the frontend. It provides an interactive interface for users to engage with an AI-powered chatbot.

## Prerequisites
- **Python 3.11+**
- **Node.js 22+**
- **npm**

---

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at [http://localhost:8000](http://localhost:8000).

---

## Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at [http://localhost:5173](http://localhost:5173).

---

## ChatBot

### Overview
The chat functionality is powered by a **KnowledgeBaseBot** that extends the abstract base class:

```python
class ChatBotService(ABC):
    @abstractmethod
    async def generate_response(self, message: str) -> str:
        pass
```

### Offline Model
- The **KnowledgeBaseBot** runs **fully offline**, using:
  - **SentenceTransformers** (e.g., `all-MiniLM-L6-v2`) to embed knowledge base text.
  - **FAISS** for local vector similarity search.
  - A local text file (`knowledge_base.txt`) that acts as the bot’s knowledge base.
- **No external APIs** (e.g., OpenAI) are currently used.

### Extensibility
Because all bot functionality is encapsulated in a class inheriting from `ChatBotService`, we can **easily swap in another LLM service** (e.g., OpenAI API, Hugging Face models, or any other language model). Create a new class like:

```python
class OpenAIChatBot(ChatBotService):
    async def generate_response(self, message: str) -> str:
        # Call OpenAI API or other service here
        ...
        return response
```

Then plug it into FastAPI routes or chat logic just as with the `KnowledgeBaseBot`.

### Knowledge Base File
By default, the bot expects a file named `knowledge_base.txt` in the same directory as the bot script. The file contains **Q/A pairs** in this format:

```
Q: Some question?
A: The answer to that question.
```

When a user asks a question, the bot:
1. Embeds the query via SentenceTransformers.
2. Uses FAISS to find the closest matching Q&A chunk from `knowledge_base.txt`.
3. **Only returns the answer** portion to the user (omitting the question and any relevance score).

### Example Interaction
- **User**: “What is email warmup?”  
- **Bot**: “Email warm-up is the process of gradually sending an increasing number of emails …”

---

## Code Quality Tools

The project uses several code quality tools to maintain consistent code style:

- **Black** for code formatting  
- **isort** for import sorting  
- **Flake8** for code style enforcement  

### Manual Usage
From the **backend** directory:
```bash
# Format code with Black
black .

# Sort imports
isort .

# Check code style with flake8
flake8 .
```

### Pre-commit Hooks
The project also uses pre-commit hooks to automatically run these checks before each commit:

```bash
pip install pre-commit
pre-commit install
```
Now, the code quality checks will run automatically before each commit. If any checks fail, the commit will be blocked until the issues are fixed.

---

## Testing

### Running Tests
From the **backend** directory:
```bash
# Run all tests
pytest tests/

# Run tests with detailed output
pytest -v tests/

# Run tests for a specific module
pytest tests/messages/
pytest tests/users/
```

---

## API Documentation

Once the backend is running, you can access:
- **Swagger UI** at [http://localhost:8000/docs](http://localhost:8000/docs)  
- **ReDoc** at [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Features

- **Real-time chat interface**  
- **Message history**  
- **User authentication**  
- **Easily extensible bot functionality**  
- **Error handling and retry mechanisms**  

---

## Future Enhancements

Due to time constraints, the following features can be implemented in future releases:

- **Docker** containerization with `docker-compose` for easy deployment  
- **Database migrations** for version control of database schema  
- More comprehensive **authentication/authorization**  
- **Message queueing system** for handling high load  
- **Real-time notifications** using WebSockets  
- **Rate limiting** and request throttling  
- **Chat history export** functionality  

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.