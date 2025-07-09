from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    title: str
    image: str
    products: int = 0  # Số lượng sản phẩm trong category, mặc định 0

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True



class ProductBase(BaseModel):
    title: str
    image: str
    price: float
    currentPrice: Optional[float] = None
    status: Optional[str] = None
    stock: int
    product_type: str  # loại như: 'newest', 'trending', 'best_seller'
    category_id: Optional[int] = None
    tag: Optional[str] = None
    short_description: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    category: Optional[Category] = None

    class Config:
        from_attributes = True


from pydantic import BaseModel
from typing import Optional

# --- BANNER ---
class BannerBase(BaseModel):
    image_url: str
    sub_title: str
    title: str
    description: str

class BannerCreate(BannerBase):
    pass

class Banner(BannerBase):
    id: int
    class Config:
        from_attributes = True

# --- BRAND ---
class BrandBase(BaseModel):
    name: str
    logo_url: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class Brand(BrandBase):
    id: int
    class Config:
        orm_mode = True

# --- FEATURE ---
class FeatureBase(BaseModel):
    title: str
    status: Optional[str] = None
    price: float
    current_price: Optional[float] = None
    image_url: str
    description: Optional[str] = None

class FeatureCreate(FeatureBase):
    pass

class Feature(FeatureBase):
    id: int

    class Config:
        orm_mode = True

# --- RECENT ---
class RecentBase(BaseModel):
    title: str
    status: Optional[str] = None
    price: float
    current_price: Optional[float] = None
    image_url: str


class RecentCreate(RecentBase):
    pass


class Recent(RecentBase):
    id: int

    class Config:
        orm_mode = True

class CartItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class CartItemCreate(CartItemBase):
    pass

class CartItem(CartItemBase):
    id: int
    cart_id: int
    product: Product  # Include product details

    class Config:
        from_attributes = True

class CartBase(BaseModel):
    user_id: Optional[int] = None
    session_id: Optional[str] = None

class CartCreate(CartBase):
    pass

class Cart(CartBase):
    id: int
    created_at: str
    updated_at: str
    items: List[CartItem]

    class Config:
        from_attributes = True

class CartUpdate(BaseModel):
    items: List[CartItemCreate]

class CartResponse(BaseModel):
    cart: Cart
    total: float
    subtotal: float
    tax: float
    shipping: float
    discount: Optional[float] = None
    discount_code: Optional[str] = None

class AdminBase(BaseModel):
    email: str
    name: str

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- CHAT ---
class ChatMessageBase(BaseModel):
    sender: str
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageSchema(ChatMessageBase):
    id: int
    session_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    customer_id: int
    message: str
    chat_session_id: str | None = None

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    products: Optional[List[dict]] = None  # Cho phép trả về list sản phẩm dạng dict
    actions: Optional[List[dict]] = None   # Cho phép trả về list action dạng dict
    chat_session_id: Optional[str] = None  # Trả về session_id cho frontend lưu lại

# --- USER ---
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserToken(BaseModel):
    access_token: str
    token_type: str

class UserTokenData(BaseModel):
    username: Optional[str] = None

# --- ORDER ---
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    product: Product

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    shipping_address: str
    shipping_phone: str
    shipping_name: str
    payment_method: str

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    user_id: Optional[int]
    session_id: Optional[str]
    status: str
    total_amount: float
    payment_status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True

# --- PAYMENT ---
class PaymentBase(BaseModel):
    amount: float
    payment_method: str

class PaymentCreate(PaymentBase):
    order_id: int

class Payment(PaymentBase):
    id: int
    order_id: int
    status: str
    transaction_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- CHECKOUT ---
class CheckoutRequest(BaseModel):
    shipping_address: str
    shipping_phone: str
    shipping_name: str
    payment_method: str
    items: List[OrderItemCreate]

class CheckoutResponse(BaseModel):
    order: Order
    payment: Payment

