from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from module import crud, schemas
from module.database import get_db
from module.crud import get_current_active_user
from module.models import Order, User
from module.email_config import fm
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from fastapi import BackgroundTasks

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

# ví dụ trong order_router.py
@router.get("/order/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=schemas.Order)
async def create_order(
    order: schemas.OrderCreate,
    background_tasks: BackgroundTasks,  # dùng background task để tránh delay phản hồi
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    new_order = Order(
        **order.dict(),
        user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Chuẩn bị nội dung email
    subject = f"Xác nhận đơn hàng #{new_order.id}"
    recipients = [current_user.email]
    body = f"""
    Xin chào {current_user.full_name or current_user.username},

    Bạn đã đặt hàng thành công với mã đơn #{new_order.id}.
    Tổng tiền: {new_order.total_amount:,}₫

    Cảm ơn bạn đã mua hàng tại Device Store!
    """

    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.plain
    )

    # Gửi email trong nền để tránh chặn phản hồi
    background_tasks.add_task(fm.send_message, message)

    return new_order

@router.get("/", response_model=List[schemas.Order])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Get all orders for the current user
    """
    if current_user:
        return crud.get_user_orders(db, current_user.id, skip, limit)
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

@router.get("/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Get a specific order by ID
    """
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if current_user and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order

@router.put("/{order_id}/status", response_model=schemas.Order)
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Update the status of an order
    """
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to update this order
    if current_user and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    return crud.update_order_status(db, order_id, status)

@router.get("/{order_id}/items", response_model=List[schemas.OrderItem])
def get_order_items(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Get all items in an order
    """
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if current_user and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order.items

@router.get("/{order_id}/items/{item_id}", response_model=schemas.OrderItem)
def get_order_item(
    order_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Get a specific item in an order
    """
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if current_user and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    # Find the item in the order
    item = next((item for item in order.items if item.id == item_id), None)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order item not found"
        )
    
    return item