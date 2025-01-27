# Botsy - Intelligent Chat Bot

Botsy is a chat bot  built with FastAPI for the backend and React for the frontend. 
It provides an interactive interface for users to engage with an AI-powered chatbot.

## Prerequisites

- Python 3.11+
- Node.js 22+
- npm

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend will be available at `http://localhost:8000`

## Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Code Quality Tools

The project uses several code quality tools to maintain consistent code style:

- Black for code formatting
- isort for import sorting
- Flake8 for code style enforcement

### Manual Usage

You can run these tools manually from the backend directory:

```bash
# Format code with Black
black .

# Sort imports
isort .

# Check code style with flake8
flake8 .
```

### Pre-commit Hooks

The project uses pre-commit hooks to automatically run these checks before each commit.

1. Install pre-commit:
   ```bash
   pip install pre-commit
   ```

2. Install the git hooks:
   ```bash
   pre-commit install
   ```

Now, the code quality checks will run automatically before each commit. If any checks fail, the commit will be blocked until the issues are fixed.


## Testing


### Running Tests

From the backend directory:

```bash
# Run all tests
pytest tests/

# Run tests with detailed output
pytest -v tests/

# Run tests for a specific module
pytest tests/messages/  # For message-related tests
pytest tests/users/     # For user-related tests
```

## API Documentation

Once the backend is running, you can access:
- Swagger UI documentation at `http://localhost:8000/docs`
- ReDoc documentation at `http://localhost:8000/redoc`

## Features

- Real-time chat interface
- Message history
- User authentication
- Easily extensible bot functionality
- Error handling and retry mechanisms

## Future Enhancements

Due to time constraints, the following features can be implemented in future releases:

- Docker containerization with docker-compose for easy deployment
- Database migrations for version control of database schema
- More comprehensive authentication/authorization solution
- Message queueing system for handling high load
- Real-time notifications using WebSockets
- Rate limiting and request throttling
- Chat history export functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details