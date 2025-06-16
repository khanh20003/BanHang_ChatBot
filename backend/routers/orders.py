from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from module import crud, schemas
from module.database import get_db
from module.crud import get_current_active_user

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=schemas.Order)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Create a new order
    """
    return crud.create_order(
        db=db,
        order_data=order,
        user_id=current_user.id if current_user else None
    )

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