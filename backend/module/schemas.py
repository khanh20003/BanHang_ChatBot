from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    image: str
    products: int  # Số lượng sản phẩm trong category

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# --- PRODUCT ---

class ProductBase(BaseModel):
    title: str
    image: Optional[str] = None
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
    sub_title: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

class BannerCreate(BannerBase):
    pass

class Banner(BannerBase):
    id: int
    class Config:
        orm_mode = True

# --- BRAND ---
class BrandBase(BaseModel):
    name: str
    logo: Optional[str] = None

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
    avatar: Optional[str] = None  # Thêm dòng này

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str | None = None
    full_name: str | None = None
    phone: str | None = None
    address: str | None = None
    created_at: datetime = None
    avatar: str | None = None  # Thêm dòng này
    is_admin: bool
    is_active: bool

    @property
    def role(self):
        return "admin" if self.is_admin else "user"

    class Config:
        orm_mode = True

class UserToken(BaseModel):
    access_token: str
    token_type: str

class UserTokenData(BaseModel):
    username: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None  # Sửa lại thành str
    is_active: Optional[bool] = None

class EmailRequest(BaseModel):
    email: str

class OTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    password: str

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
