import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uuid
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from module import models, database
from routers import category, product, banner, brand, feature, recent, cart, chat, admin, auth, checkout, orders, user
from dotenv import load_dotenv
load_dotenv()


app = FastAPI()

# Quản lý kết nối WebSocket theo customer_id
from collections import defaultdict
import asyncio
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = defaultdict(list)  # customer_id: [WebSocket,...]
        self.lock = asyncio.Lock()

    async def connect(self, customer_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections[customer_id].append(websocket)

    async def disconnect(self, customer_id: str, websocket: WebSocket):
        async with self.lock:
            if websocket in self.active_connections[customer_id]:
                self.active_connections[customer_id].remove(websocket)
            if not self.active_connections[customer_id]:
                del self.active_connections[customer_id]

    async def broadcast(self, customer_id: str, message: dict):
        async with self.lock:
            for ws in self.active_connections.get(customer_id, []):
                await ws.send_json(message)

manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(category.router)
app.include_router(product.router)
app.include_router(banner.router)
app.include_router(brand.router)
app.include_router(feature.router)
app.include_router(recent.router)
app.include_router(cart.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(checkout.router)
app.include_router(orders.router)
app.include_router(user.router)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# WebSocket endpoint cho chat realtime
from sqlalchemy.orm import Session
from module.models import ChatSession, ChatMessage
from datetime import datetime
from sqlalchemy import or_

@app.websocket("/ws/chat/{customer_id}")
async def websocket_endpoint(websocket: WebSocket, customer_id: str):
    await manager.connect(customer_id, websocket)
    try:
        # Tạo session SQLAlchemy riêng cho mỗi kết nối
        db = database.SessionLocal()
        while True:
            data = await websocket.receive_json()
            # Lưu tin nhắn admin vào DB (giả định sender: 'admin' hoặc 'customer')
            # 1. Tìm hoặc tạo ChatSession phù hợp
            session = None
            if str(customer_id).isdigit():
                session = db.query(ChatSession).filter(ChatSession.customer_id == int(customer_id)).order_by(ChatSession.created_at.desc()).first()
                if not session:
                    session = ChatSession(customer_id=int(customer_id), chat_session_id=str(uuid.uuid4()))
                    db.add(session)
                    db.commit()
                    db.refresh(session)
            else:
                # guest: lưu theo user_id dạng string
                session = db.query(ChatSession).filter(ChatSession.customer_id == None).order_by(ChatSession.created_at.desc()).first()
                if not session:
                    session = ChatSession(customer_id=None, chat_session_id=str(uuid.uuid4()))
                    db.add(session)
                    db.commit()
                    db.refresh(session)
            # 2. Lưu ChatMessage (admin trả lời user, sender là 'admin', user_id là 'admin')
            msg = ChatMessage(
                session_id=session.id,
                user_id="admin",  # phân biệt rõ admin gửi
                sender="admin",
                message=data.get("content", ""),
                timestamp=datetime.utcnow()
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)
            # 3. Broadcast lại tin nhắn đã lưu (có id, timestamp thật)
            out_msg = {
                "id": msg.id,
                "user_id": msg.user_id,
                "user_name": "Admin",
                "guest_id": None,
                "content": msg.message,
                "products": data.get("products"),
                "sender": msg.sender,
                "timestamp": msg.timestamp.isoformat()
            }
            await manager.broadcast(customer_id, out_msg)
    except WebSocketDisconnect:
        await manager.disconnect(customer_id, websocket)
    finally:
        try:
            db.close()
        except:
            pass
