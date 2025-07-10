from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from module import crud, schemas, database, models, email_config
from typing import Optional
from module.crud import get_current_active_user

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/{session_id}", response_model=schemas.CartResponse)
def get_cart(session_id: str, db: Session = Depends(database.get_db)):
    cart = crud.get_cart_by_session(db, session_id)
    if not cart:
        # Create new cart if not exists
        cart = crud.create_cart(db, schemas.CartCreate(session_id=session_id))
    
    totals = crud.calculate_cart_totals(db, cart.id)
    return {
        "cart": cart,
        **totals
    }

@router.post("/{session_id}/items", response_model=schemas.CartResponse)
def add_to_cart(
    session_id: str,
    item: schemas.CartItemCreate,
    db: Session = Depends(database.get_db)
):
    cart = crud.get_cart_by_session(db, session_id)
    if not cart:
        cart = crud.create_cart(db, schemas.CartCreate(session_id=session_id))
    
    # Get current cart items
    current_items = [{"product_id": item.product_id, "quantity": item.quantity, "price": item.price} 
                    for item in cart.items]
    
    # Add or update item
    item_exists = False
    for current_item in current_items:
        if current_item["product_id"] == item.product_id:
            current_item["quantity"] += item.quantity
            item_exists = True
            break
    
    if not item_exists:
        current_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": item.price
        })
    
    # Update cart
    updated_cart = crud.update_cart(db, cart.id, schemas.CartUpdate(items=current_items))
    totals = crud.calculate_cart_totals(db, updated_cart.id)
    
    return {
        "cart": updated_cart,
        **totals
    }

@router.put("/{session_id}/items/{item_id}", response_model=schemas.CartResponse)
def update_cart_item(
    session_id: str,
    item_id: int,
    quantity: int,
    db: Session = Depends(database.get_db)
):
    cart = crud.get_cart_by_session(db, session_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Update item quantity
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.id == item_id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    cart_item.quantity = quantity
    db.commit()
    
    totals = crud.calculate_cart_totals(db, cart.id)
    return {
        "cart": cart,
        **totals
    }

@router.delete("/{session_id}/items/{item_id}", response_model=schemas.CartResponse)
def remove_from_cart(
    session_id: str,
    item_id: int,
    db: Session = Depends(database.get_db)
):
    cart = crud.get_cart_by_session(db, session_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    # Remove item
    db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.id == item_id
    ).delete()
    db.commit()
    
    totals = crud.calculate_cart_totals(db, cart.id)
    return {
        "cart": cart,
        **totals
    }

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(session_id: str, db: Session = Depends(database.get_db)):
    cart = crud.get_cart_by_session(db, session_id)
    if cart:
        crud.delete_cart(db, cart.id)
    return None 

@router.post("/{session_id}/checkout", response_model=schemas.CheckoutResponse)
async def checkout_cart(
    session_id: str,
    checkout_data: schemas.CheckoutRequest,
    db: Session = Depends(database.get_db),
    current_user: Optional[schemas.UserResponse] = Depends(get_current_active_user)
):
    """
    Create an order from the current cart
    """
    cart = crud.get_cart_by_session(db, session_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Check stock for all items
    for item in cart.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for product {product.title}. Available: {product.stock}, Requested: {item.quantity}"
            )
    
    # Create order from cart
    order_data = schemas.OrderCreate(
        shipping_address=checkout_data.shipping_address,
        shipping_phone=checkout_data.shipping_phone,
        shipping_name=checkout_data.shipping_name,
        payment_method=checkout_data.payment_method,
        items=[schemas.OrderItemCreate(
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        ) for item in cart.items]
    )
    
    try:
        # Create order
        order = crud.create_order(
            db=db,
            order_data=order_data,
            user_id=current_user.id if current_user else None,
            session_id=session_id
        )
        
        # Update stock for all products
        for item in cart.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            product.stock -= item.quantity
            db.add(product)
        
        # Create payment record
        payment = crud.create_payment(
            db=db,
            payment_data=schemas.PaymentCreate(
                order_id=order.id,
                amount=order.total_amount,
                payment_method=checkout_data.payment_method
            )
        )
        
        # Clear the cart after successful order
        crud.delete_cart(db, cart.id)
        
        db.commit()
        
        # Prepare order items for email
        order_items = []
        for item in order.items:
            product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
            order_items.append({
                'product_name': product.title,
                'quantity': item.quantity,
                'price': item.price
            })
        
        # Send confirmation emails
        if current_user and current_user.email:
            await email.send_order_confirmation_email(
                email_to=current_user.email,
                order_number=str(order.id),
                customer_name=checkout_data.shipping_name,
                order_items=order_items,
                total_amount=order.total_amount,
                shipping_address=checkout_data.shipping_address
            )
        
        # Send notification to admin
        await email.send_order_notification_to_admin(
            order_number=str(order.id),
            customer_name=checkout_data.shipping_name,
            order_items=order_items,
            total_amount=order.total_amount
        )
        
        return {
            "order": order,
            "payment": payment
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create order: {str(e)}"
        ) 