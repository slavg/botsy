from abc import ABC, abstractmethod


class ChatBotService(ABC):
    @abstractmethod
    async def generate_response(self, message: str) -> str:
        pass


class SimpleChatBot(ChatBotService):
    async def generate_response(self, message: str) -> str:
        return (
            f"I received your message: '{message}'." f" This is a simple echo response."
        )
