from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from module.database import get_db
from module.models import ChatSession, ChatMessage
from module.schemas import ChatRequest, ChatResponse, ChatMessageSchema
from services.chat_service import process_user_message
from services.gemini_service import generate_gemini_response
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        session = None
        print(f"[DEBUG] Nhận chat_session_id từ request: {request.chat_session_id}")
        # Ưu tiên tìm session theo chat_session_id nếu có và không rỗng
        if request.chat_session_id and request.chat_session_id.strip():
            session = db.query(ChatSession).filter(ChatSession.chat_session_id == request.chat_session_id).first()
        # Nếu không có chat_session_id, mới tìm theo customer_id (chỉ cho user đã đăng nhập)
        elif request.customer_id and request.customer_id != 0:
            session = db.query(ChatSession).filter(ChatSession.customer_id == request.customer_id).first()
        # Nếu vẫn chưa có session, tạo mới với chat_session_id ngẫu nhiên nếu cần
        if not session:
            new_session_id = request.chat_session_id if request.chat_session_id and request.chat_session_id.strip() else str(uuid.uuid4())
            session = ChatSession(customer_id=request.customer_id if request.customer_id != 0 else None,
                                  chat_session_id=new_session_id)
            db.add(session)
            db.commit()
            db.refresh(session)
            print(f"[DEBUG] Tạo session mới với chat_session_id: {session.chat_session_id}")
        else:
            print(f"[DEBUG] Đã tìm thấy session: id={session.id}, chat_session_id={session.chat_session_id}")

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
            chat_session_id=session.chat_session_id
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{customer_id}", response_model=list[ChatMessageSchema])
def get_chat_history_by_customer(customer_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.customer_id == customer_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên trò chuyện.")
    return session.messages

@router.get("/history/session/{chat_session_id}", response_model=list[ChatMessageSchema])
def get_chat_history_by_session(chat_session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.chat_session_id == chat_session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên trò chuyện theo session.")
    return session.messages