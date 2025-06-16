from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid
from . import models, schemas
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .database import get_db

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: schemas.CategoryCreate):
    db_category = get_category(db, category_id)
    if db_category:
        for key, value in category.model_dump().items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False

#--Product--#

# Get multiple products
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def get_products_by_category(db: Session, category_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Product).filter(models.Product.category_id == category_id).offset(skip).limit(limit).all()

# Get one product
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

# Create a product
def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products_by_type(db: Session, product_type: str, skip: int = 0, limit: int = 100):
    try:
        # Log the query parameters
        print(f"Filtering products by type: {product_type}")
        
        # Query the database
        products = db.query(models.Product).filter(
            models.Product.product_type == product_type,
            models.Product.status == 'active'  # Only get active products
        ).offset(skip).limit(limit).all()
        
        # Log the results
        print(f"Found {len(products)} products with type {product_type}")
        for product in products:
            print(f"Product: {product.title}, Type: {product.product_type}")
            
        return products
    except Exception as e:
        print(f"Error in get_products_by_type: {str(e)}")
        raise e

# ----- BANNER -----
def get_banners(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Banner).offset(skip).limit(limit).all()

def get_banner(db: Session, banner_id: int):
    return db.query(models.Banner).filter(models.Banner.id == banner_id).first()

def create_banner(db: Session, banner: schemas.BannerCreate):
    db_banner = models.Banner(**banner.model_dump())
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)
    return db_banner

# ----- BRAND -----
def get_brands(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Brand).offset(skip).limit(limit).all()

def get_brand(db: Session, brand_id: int):
    return db.query(models.Brand).filter(models.Brand.id == brand_id).first()

def create_brand(db: Session, brand: schemas.BrandCreate):
    db_brand = models.Brand(**brand.model_dump())
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand

# ----- FEATURE -----
def get_features(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Feature).offset(skip).limit(limit).all()

def get_feature(db: Session, feature_id: int):
    return db.query(models.Feature).filter(models.Feature.id == feature_id).first()

def create_feature(db: Session, feature: schemas.FeatureCreate):
    db_feature = models.Feature(**feature.model_dump())
    db.add(db_feature)
    db.commit()
    db.refresh(db_feature)
    return db_feature

# ----- RECENT -----
def get_recents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Recent).offset(skip).limit(limit).all()

def get_recent(db: Session, recent_id: int):
    return db.query(models.Recent).filter(models.Recent.id == recent_id).first()

def create_recent(db: Session, recent: schemas.RecentCreate):
    db_recent = models.Recent(**recent.model_dump())
    db.add(db_recent)
    db.commit()
    db.refresh(db_recent)
    return db_recent

# Cart CRUD operations
def get_cart_by_session(db: Session, session_id: str):
    return db.query(models.Cart).filter(models.Cart.session_id == session_id).first()

def get_cart_by_user(db: Session, user_id: int):
    return db.query(models.Cart).filter(models.Cart.user_id == user_id).first()

def create_cart(db: Session, cart: schemas.CartCreate):
    now = datetime.now().isoformat()
    db_cart = models.Cart(
        user_id=cart.user_id,
        session_id=cart.session_id or str(uuid.uuid4()),
        created_at=now,
        updated_at=now
    )
    db.add(db_cart)
    db.commit()
    db.refresh(db_cart)
    return db_cart

def update_cart(db: Session, cart_id: int, cart_update: schemas.CartUpdate):
    db_cart = db.query(models.Cart).filter(models.Cart.id == cart_id).first()
    if not db_cart:
        return None

    # Delete existing items
    db.query(models.CartItem).filter(models.CartItem.cart_id == cart_id).delete()

    # Add new items
    for item in cart_update.items:
        db_item = models.CartItem(
            cart_id=cart_id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)

    db_cart.updated_at = datetime.now().isoformat()
    db.commit()
    db.refresh(db_cart)
    return db_cart

def delete_cart(db: Session, cart_id: int):
    db_cart = db.query(models.Cart).filter(models.Cart.id == cart_id).first()
    if db_cart:
        db.delete(db_cart)
        db.commit()
        return True
    return False

def calculate_cart_totals(db: Session, cart_id: int):
    cart = db.query(models.Cart).filter(models.Cart.id == cart_id).first()
    if not cart:
        return None

    subtotal = sum(item.price * item.quantity for item in cart.items)
    tax = subtotal * 0.1  # 10% tax
    shipping = 10.0 if subtotal < 100 else 0.0  # Free shipping over $100
    total = subtotal + tax + shipping

    return {
        "subtotal": subtotal,
        "tax": tax,
        "shipping": shipping,
        "total": total
    }

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here"  # TODO: Move to environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_admin_by_email(db: Session, email: str):
    return db.query(models.Admin).filter(models.Admin.email == email).first()

def create_admin(db: Session, admin: schemas.AdminCreate):
    hashed_password = get_password_hash(admin.password)
    db_admin = models.Admin(
        email=admin.email,
        hashed_password=hashed_password,
        name=admin.name
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

def authenticate_admin(db: Session, email: str, password: str):
    admin = get_admin_by_email(db, email)
    if not admin:
        print("authenticate_admin: admin not found (email: {})".format(email))
        return False
    if not verify_password(password, admin.hashed_password):
        print("authenticate_admin: verify_password failed (email: {}, password: {})".format(email, password))
        return False
    return admin

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    # Check if username exists
    if get_user_by_username(db, user.username):
        return None
    
    # Check if email exists
    if user.email and get_user_by_email(db, user.email):
        return None
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Create user
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        phone=user.phone,
        address=user.address
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserBase):
    db_user = get_user(db, user_id)
    if db_user:
        for key, value in user.model_dump().items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

# --- ORDER CRUD ---
def create_order(db: Session, order_data: schemas.OrderCreate, user_id: Optional[int] = None, session_id: Optional[str] = None):
    # Calculate total amount
    total_amount = sum(item.price * item.quantity for item in order_data.items)
    
    # Create order
    db_order = models.Order(
        user_id=user_id,
        session_id=session_id,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        shipping_phone=order_data.shipping_phone,
        shipping_name=order_data.shipping_name,
        payment_method=order_data.payment_method
    )
    db.add(db_order)
    db.flush()  # Get the order ID
    
    # Create order items
    for item in order_data.items:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
    
    # Create payment record
    db_payment = models.Payment(
        order_id=db_order.id,
        amount=total_amount,
        payment_method=order_data.payment_method
    )
    db.add(db_payment)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Order).filter(models.Order.user_id == user_id).offset(skip).limit(limit).all()

def get_session_orders(db: Session, session_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Order).filter(models.Order.session_id == session_id).offset(skip).limit(limit).all()

def update_order_status(db: Session, order_id: int, status: str):
    db_order = get_order(db, order_id)
    if db_order:
        db_order.status = status
        db.commit()
        db.refresh(db_order)
    return db_order

# --- PAYMENT CRUD ---
def create_payment(db: Session, payment_data: schemas.PaymentCreate):
    db_payment = models.Payment(**payment_data.dict())
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payment(db: Session, payment_id: int):
    return db.query(models.Payment).filter(models.Payment.id == payment_id).first()

def get_order_payment(db: Session, order_id: int):
    return db.query(models.Payment).filter(models.Payment.order_id == order_id).first()

def update_payment_status(db: Session, payment_id: int, status: str, transaction_id: Optional[str] = None):
    db_payment = get_payment(db, payment_id)
    if db_payment:
        db_payment.status = status
        if transaction_id:
            db_payment.transaction_id = transaction_id
        db.commit()
        db.refresh(db_payment)
    return db_payment

def get_current_active_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=username)  # Sử dụng email=sub hoặc đổi tên field thành sub
    except JWTError:
        raise credentials_exception
    user = get_user_by_username(db, username=token_data.email)  # Truyền email=sub vào hàm lấy user
    if user is None:
        raise credentials_exception
    return user