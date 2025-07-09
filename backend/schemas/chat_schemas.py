from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    customer_id: int
    message: str

class ChatMessageSchema(BaseModel):
    id: int
    session_id: int
    sender: str
    message: str
    timestamp: datetime
    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    products: Optional[List[dict]] = None  # Cho phép trả về list sản phẩm dạng dict
    actions: Optional[List[dict]] = None   # Cho phép trả về list action dạng dict
    chat_session_id: Optional[str] = None  # Thêm trường này để trả về session id cho khách vãng lai