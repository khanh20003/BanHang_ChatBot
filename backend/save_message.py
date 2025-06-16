import os
from sqlalchemy import create_engine, Column, Integer, String, Text, TIMESTAMP, func, JSON
from sqlalchemy.orm import sessionmaker, declarative_base # Updated import for newer SQLAlchemy
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

# Use a mock DATABASE_URL if not set, e.g., for local testing without a .env file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test_chat.db") # Default to SQLite in-memory

Base = declarative_base()

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    text = Column(Text, nullable=False)
    sender = Column(String(50), nullable=False) # E.g., 'user' or 'assistant'
    metadata_products = Column(JSON, default=[])
    buttons = Column(JSON, default=[])
    template = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
    
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create table if it doesn't exist
Base.metadata.create_all(bind=engine)

def save_chat_message(text, sender, user_id, metadata_products=None, buttons=None, template=None):
    session = SessionLocal()
    try:
        new_message = ChatMessage(
            text=text,
            sender=sender,
            user_id=user_id,
            metadata_products=metadata_products if metadata_products is not None else [],
            buttons=buttons if buttons is not None else [],
            template=template
        )
        session.add(new_message)
        session.commit()
        session.refresh(new_message)  # Get ID after save
        print(f"Saved message ID: {new_message.id} from sender: {sender} for user: {user_id}")
        return new_message.id  # Return the ID of the saved message
    except Exception as e:
        session.rollback()
        print(f"Error saving chat message: {e}")
        return None
    finally:
        session.close()

# Example usage (optional, for testing this file directly)
# if __name__ == "__main__":
#     print(f"Using database: {DATABASE_URL}")
#     test_user_id = "test_user_123"
#     msg_id1 = save_chat_message(text="Xin chào", sender="user", user_id=test_user_id)
#     print(f"Saved user message with ID: {msg_id1}")
#     msg_id2 = save_chat_message(text="Chào bạn, tôi giúp gì được?", sender="assistant", user_id=test_user_id,
#                               metadata_products=[{"name": "Laptop X", "price": 200}])
#     print(f"Saved assistant message with ID: {msg_id2}") 