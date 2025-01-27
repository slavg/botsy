from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.database import init_db
from app.message.routes import router as message_router
from app.user.routes import router as user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(user_router, prefix="/api/users", tags=["users"])
app.include_router(message_router, prefix="/api/messages", tags=["messages"])


@app.on_event("startup")
async def startup():
    await init_db()
