from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from models.chat_models import ChatSession, ChatMessage
from schemas.chat_schemas import ChatRequest, ChatResponse, ChatMessageSchema
from services.chat_service import process_user_message
from services.gemini_service import generate_gemini_response
import uuid

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        session = db.query(ChatSession).filter(ChatSession.customer_id == request.customer_id).first()
        if not session:
            # Nếu là khách vãng lai, sinh chat_session_id là UUID
            chat_session_id = str(uuid.uuid4()) if not request.customer_id or request.customer_id == 0 else None
            session = ChatSession(customer_id=request.customer_id, chat_session_id=chat_session_id)
            db.add(session)
            db.commit()
            db.refresh(session)

        # Lưu câu hỏi
        user_msg = ChatMessage(session_id=session.id, sender="customer", message=request.message)
        db.add(user_msg)

        # Tìm câu trả lời từ chatbot logic
        logic_response = process_user_message(request.message, request.customer_id)
        if logic_response:
            response_text = logic_response.get("response")
            products = logic_response.get("products")
            actions = logic_response.get("actions")
        else:
            response_text = generate_gemini_response(request.message)
            products = None
            actions = None

        # Lưu câu trả lời
        bot_msg = ChatMessage(session_id=session.id, sender="bot", message=response_text)
        db.add(bot_msg)
        db.commit()

        return ChatResponse(
            response=response_text,
            timestamp=bot_msg.timestamp,
            products=products,
            actions=actions,
            chat_session_id=session.chat_session_id if hasattr(session, 'chat_session_id') and session.chat_session_id else str(session.id)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat-history/{customer_id}", response_model=list[ChatMessageSchema])
def get_chat_history(customer_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.customer_id == customer_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên trò chuyện.")
    return session.messages