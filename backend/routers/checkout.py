from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import sys
import os

# Add the project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.module import crud, schemas
from backend.module.database import get_db
from backend.services.auth import get_current_active_user

router = APIRouter(
    prefix="/checkout",
    tags=["checkout"]
)

@router.post("/", response_model=schemas.CheckoutResponse)
def create_checkout(
    checkout_data: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    # Generate session ID for guest checkout
    session_id = str(uuid.uuid4()) if not current_user else None

    # Create order
    order = crud.create_order(
        db=db,
        order_data=schemas.OrderCreate(
            shipping_address=checkout_data.shipping_address,
            shipping_phone=checkout_data.shipping_phone,
            shipping_name=checkout_data.shipping_name,
            payment_method=checkout_data.payment_method,
            items=checkout_data.items
        ),
        user_id=current_user.id if current_user else None,
        session_id=session_id
    )
    # Create payment record nếu chưa có
    payment = crud.get_order_payment(db, order.id)
    if not payment:
        payment = crud.create_payment(
            db=db,
            payment_data=schemas.PaymentCreate(
                order_id=order.id,
                amount=order.total_amount,
                payment_method=checkout_data.payment_method,
                status="pending"
            )
        )

    # Return the order and payment
    return schemas.CheckoutResponse(order=order, payment=payment)

@router.post("/cart/{session_id}/checkout", response_model=schemas.CheckoutResponse)
def guest_checkout(
    session_id: str,
    checkout_data: schemas.CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)  # thêm dòng này
):


    # Create order
    order = crud.create_order(
        db=db,
        order_data=schemas.OrderCreate(
            shipping_address=checkout_data.shipping_address,
            shipping_phone=checkout_data.shipping_phone,
            shipping_name=checkout_data.shipping_name,
            payment_method=checkout_data.payment_method,
            items=checkout_data.items
        ),
        user_id=current_user.id if current_user else None,
        session_id=session_id
    )
    
    # Get payment record
    payment = crud.get_order_payment(db, order.id)
    
    return schemas.CheckoutResponse(order=order, payment=payment)

@router.get("/orders", response_model=list[schemas.Order])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    if current_user:
        return crud.get_user_orders(db, current_user.id, skip, limit)
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

@router.get("/orders/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
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

@router.post("/orders/{order_id}/payment", response_model=schemas.Payment)
def process_payment(
    order_id: int,
    payment_data: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to process payment for this order
    if current_user and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to process payment for this order"
        )
    
    # Here you would typically integrate with a payment gateway
    # For now, we'll just update the payment status
    payment = crud.get_order_payment(db, order_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    # Simulate payment processing
    payment = crud.update_payment_status(
        db=db,
        payment_id=payment.id,
        status="completed",
        transaction_id=f"TRANS_{uuid.uuid4()}"
    )
    
    # Update order status
    crud.update_order_status(db, order_id, "processing")
    
    return payment