from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from module.database import get_db
from module.models import ChatSession, ChatMessage
from module.schemas import ChatRequest, ChatResponse, ChatMessageSchema
from services.chat_service import process_user_message
from services.gemini_service import generate_gemini_response
import uuid
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        session = None
        print(f"[DEBUG] Nhận chat_session_id từ request: {request.chat_session_id}")

        # 1. Ưu tiên tìm theo chat_session_id nếu có
        if request.chat_session_id and request.chat_session_id.strip():
            session = db.query(ChatSession).filter(ChatSession.chat_session_id == request.chat_session_id).first()

        # 2. Nếu không có session theo chat_session_id, xử lý tiếp
        if not session:
            new_session_id = str(uuid.uuid4())
            if request.customer_id and request.customer_id != 0:
                # Người dùng đã đăng nhập → tạo session mới
                session = ChatSession(
                    customer_id=request.customer_id,
                    chat_session_id=new_session_id
                )
                print(f"[DEBUG] Tạo session mới cho người dùng đăng nhập (id={request.customer_id})")
            else:
                # Người dùng vãng lai → tạo session mới
                session = ChatSession(
                    customer_id=None,
                    chat_session_id=new_session_id
                )
                print(f"[DEBUG] Tạo session mới cho khách vãng lai")
            db.add(session)
            db.commit()
            db.refresh(session)
        else:
            print(f"[DEBUG] Đã tìm thấy session: id={session.id}, chat_session_id={session.chat_session_id}")

        # Lưu câu hỏi người dùng
        user_msg = ChatMessage(session_id=session.id, sender="customer", message=request.message)
        db.add(user_msg)

        # Xử lý logic từ AI
        logic_response = process_user_message(request.message, request.customer_id)
        response_text = generate_gemini_response(request.message, context=logic_response or {})

        # Trích xuất dữ liệu nếu có
        products = logic_response.get("products") if logic_response else None
        actions = logic_response.get("actions") if logic_response else None

        # Lưu câu trả lời từ bot
        bot_msg = ChatMessage(session_id=session.id, sender="bot", message=response_text)
        db.add(bot_msg)

        # Cập nhật thời gian tương tác cuối
        session.updated_at = datetime.utcnow()

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
def get_chat_history_by_customer(customer_id: str, db: Session = Depends(get_db)):
    # Chặn truyền customer_id='all' hoặc các giá trị không hợp lệ
    if customer_id == "all":
        raise HTTPException(status_code=400, detail="Không được truyền 'all' vào API này. Hãy dùng API /chat/history/all để lấy toàn bộ lịch sử chat.")
    if not customer_id or customer_id.strip() == '' or customer_id == '0':
        raise HTTPException(status_code=400, detail="customer_id không hợp lệ. Nếu muốn lấy lịch sử khách vãng lai, hãy truyền guest_id hoặc user_id hợp lệ.")
    # Nếu là guest (guest_xxx), truy vấn theo user_id ở bảng ChatMessage
    if str(customer_id).lower().startswith('guest_'):
        messages = db.query(ChatMessage).filter(ChatMessage.user_id == customer_id).order_by(ChatMessage.timestamp).all()
        return messages
    # Nếu là user thật (user_id là số), truy vấn theo customer_id ở bảng ChatSession
    elif str(customer_id).isdigit():
        sessions = db.query(ChatSession).filter(ChatSession.customer_id == int(customer_id)).order_by(ChatSession.created_at.desc()).all()
        if not sessions:
            raise HTTPException(status_code=404, detail="Không tìm thấy phiên trò chuyện.")
        messages = []
        for session in sessions:
            messages.extend(session.messages)
        return messages
    else:
        raise HTTPException(status_code=400, detail="customer_id không hợp lệ. Nếu muốn lấy lịch sử khách vãng lai, hãy truyền guest_id hoặc user_id hợp lệ.")

@router.get("/history/session/{chat_session_id}", response_model=list[ChatMessageSchema])
def get_chat_history_by_session(chat_session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.chat_session_id == chat_session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Không tìm thấy phiên trò chuyện theo session.")
    return session.messages



