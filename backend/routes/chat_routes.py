

# Đảm bảo chỉ import 1 lần và router chỉ khai báo 1 lần ở đầu file


# Đảm bảo chỉ import 1 lần và router chỉ khai báo 1 lần ở đầu file

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from module.database import get_db
from module.models import ChatSession, ChatMessage
from module.schemas import ChatRequest, ChatResponse, ChatMessageSchema
from services.chat_service import process_user_message
from services.gemini_service import generate_gemini_response

router = APIRouter()


# Lấy toàn bộ lịch sử chat của tất cả user và khách vãng lai
@router.get('/chat/history/all')
def get_all_chat_history(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).all()
    session_map = {s.id: s for s in sessions}
    messages = db.query(ChatMessage).order_by(ChatMessage.timestamp).all()
    result = []
    for m in messages:
        s = session_map.get(m.session_id)
        # Nếu user_id là guest thì customer_id là None, còn user thật thì lấy customer_id
        customer_id = s.customer_id if s and not str(s.customer_id).startswith('guest_') else None
        result.append({
            'id': m.id,
            'session_id': m.session_id,
            'sender': m.sender,
            'message': str(m.message),
            'timestamp': m.timestamp,
            'customer_id': customer_id,
            'chat_session_id': s.chat_session_id if s else None
        })
    return result




# Đảm bảo route guest luôn đặt trước route động

# Đảm bảo route guest luôn đặt trước route động
@router.get('/chat/history/guest')
def get_guest_chat_history(db: Session = Depends(get_db)):
    """
    Trả về lịch sử chat của tất cả khách vãng lai (giống như user thật, trả về mảng message, không group theo guest_id).
    Luôn trả về mảng (dù rỗng), không raise lỗi.
    """
    try:
        messages = db.query(ChatMessage).filter(ChatMessage.user_id.like('guest_%')).order_by(ChatMessage.timestamp).all()
        result = []
        for m in messages:
            result.append({
                'id': m.id,
                'user_id': m.user_id,
                'sender': m.sender,
                'message': m.message or m.text,
                'timestamp': m.timestamp,
                'customer_id': m.user_id,
                'chat_session_id': m.session.chat_session_id if m.session else None
            })
        return result
    except Exception as e:
        # Nếu có lỗi bất kỳ, vẫn trả về mảng rỗng
        return []



@router.post("/chat", response_model=ChatResponse)

def chat(request: ChatRequest, db: Session = Depends(get_db)):
    import uuid
    import random, string
    try:
        import sys
        print(f"[DEBUG] Nhận request: customer_id={getattr(request, 'customer_id', None)}, guest_id={getattr(request, 'guest_id', None)}, chat_session_id={getattr(request, 'chat_session_id', None)}", file=sys.stderr)
        # Ưu tiên lấy guest_id nếu có
        guest_id = getattr(request, 'guest_id', None)
        customer_id = getattr(request, 'customer_id', None)
        chat_session_id = getattr(request, 'chat_session_id', None)

        # Nếu không có customer_id hợp lệ, sinh guest_id
        if not customer_id or str(customer_id).lower() in ["none", "", "null", "undefined", "nan", "0", "false"] or customer_id == 0:
            if not guest_id or not str(guest_id).startswith('guest_'):
                guest_id = 'guest_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            customer_id = guest_id
        elif str(customer_id).startswith('guest_'):
            # Nếu customer_id đã là guest_xxx thì giữ nguyên
            pass
        else:
            # Nếu là user thật (số), giữ nguyên
            pass

        # Tìm session theo chat_session_id (nếu có)
        session = db.query(ChatSession).filter(ChatSession.chat_session_id == chat_session_id).first() if chat_session_id else None

        # Nếu không có session, tạo mới
        if not session:
            # Nếu là guest thì customer_id=None, còn user thật thì là số
            session_customer_id = None if str(customer_id).startswith('guest_') else customer_id
            session = ChatSession(customer_id=session_customer_id, chat_session_id=str(uuid.uuid4()))
            db.add(session)
            db.commit()
            db.refresh(session)

        # Lưu câu hỏi của user, luôn truyền user_id là string (user_id hoặc guest_xxx)
        user_msg = ChatMessage(session_id=session.id, sender="customer", message=request.message, user_id=str(customer_id))
        db.add(user_msg)

        # Xử lý logic trả lời
        logic_response = process_user_message(request.message, customer_id)
        response_text = logic_response.get("response") if logic_response else generate_gemini_response(request.message)
        products = logic_response.get("products") if logic_response else None
        actions = logic_response.get("actions") if logic_response else None

        # Lưu câu trả lời của bot
        bot_msg = ChatMessage(session_id=session.id, sender="bot", message=response_text, user_id=str(customer_id))
        db.add(bot_msg)
        db.commit()

        return ChatResponse(
            response=response_text,
            timestamp=bot_msg.timestamp,
            products=products,
            actions=actions,
            chat_session_id=session.chat_session_id,
            customer_id=customer_id
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



# Route động lấy lịch sử cho user thật hoặc guest cụ thể
@router.get("/chat/history/{customer_id}")
def get_chat_history(customer_id: str, db: Session = Depends(get_db)):
    """
    Lấy lịch sử chat của user hoặc khách vãng lai (nếu truyền vào guest_xxx).
    """
    if not customer_id or customer_id.strip() == '' or customer_id == '0':
        raise HTTPException(status_code=400, detail="customer_id không hợp lệ. Nếu muốn lấy lịch sử khách vãng lai, hãy truyền guest_id hoặc user_id hợp lệ.")

    # Nếu là guest (guest_xxx), truy vấn theo user_id ở bảng ChatMessage
    if str(customer_id).startswith('guest_'):
        messages = db.query(ChatMessage).filter(ChatMessage.user_id == customer_id).order_by(ChatMessage.timestamp).all()
        result = []
        for m in messages:
            result.append({
                'id': m.id,
                'user_id': m.user_id,
                'sender': m.sender,
                'message': m.message or m.text,
                'timestamp': m.timestamp,
                'customer_id': m.user_id,
                'chat_session_id': m.session.chat_session_id if m.session else None
            })
        return result
    # Nếu là user thật (user_id là số), truy vấn theo customer_id ở bảng ChatSession
    elif str(customer_id).isdigit():
        sessions = db.query(ChatSession).filter(ChatSession.customer_id == int(customer_id)).order_by(ChatSession.created_at.desc()).all()
        if not sessions:
            return []
        result = []
        for session in sessions:
            for m in session.messages:
                result.append({
                    'id': m.id,
                    'user_id': m.user_id,
                    'sender': m.sender,
                    'message': m.message or m.text,
                    'timestamp': m.timestamp,
                    'customer_id': m.user_id,
                    'chat_session_id': session.chat_session_id
                })
        return result
    else:
        raise HTTPException(status_code=400, detail="customer_id không hợp lệ. Nếu muốn lấy lịch sử khách vãng lai, hãy truyền guest_id hoặc user_id hợp lệ.")