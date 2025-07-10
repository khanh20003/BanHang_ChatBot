from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import joinedload

from module import schemas, models, crud, database

router = APIRouter(prefix="/admin", tags=["Admin"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    admin = crud.authenticate_admin(db, form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=crud.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crud.create_access_token(
        data={"sub": admin.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, crud.SECRET_KEY, algorithms=[crud.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    admin = crud.get_admin_by_email(db, email=token_data.email)
    if admin is None:
        raise credentials_exception
    return admin

@router.get("/me", response_model=schemas.Admin)
async def read_admin_me(current_admin: models.Admin = Depends(get_current_admin)):
    return current_admin

@router.post("/register", response_model=schemas.Admin)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(database.get_db)):
    db_admin = crud.get_admin_by_email(db, email=admin.email)
    if db_admin:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_admin(db=db, admin=admin)

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    total_revenue = db.query(func.coalesce(func.sum(models.Order.total_amount), 0)).scalar()
    total_users = db.query(models.User).count()
    total_products = db.query(models.Product).count()
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
    recent_activity = [
        {
            "type": "user_registration",
            "user_name": getattr(user, 'full_name', None) or getattr(user, 'username', None) or getattr(user, 'email', None),
            "timestamp": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at)
        }
        for user in recent_users
    ]
    monthly_revenue = (
        db.query(
            extract('year', models.Order.created_at).label('year'),
            extract('month', models.Order.created_at).label('month'),
            func.coalesce(func.sum(models.Order.total_amount), 0).label('revenue')
        )
        .group_by('year', 'month')
        .order_by('year', 'month')
        .all()
    )
    monthly_revenue_data = [
        {
            "year": int(row.year),
            "month": int(row.month),
            "revenue": float(row.revenue)
        }
        for row in monthly_revenue
    ]
    return {
        "total_revenue": float(total_revenue or 0),
        "total_users": total_users,
        "total_products": total_products,
        "recent_activity": recent_activity,
        "monthly_revenue": monthly_revenue_data
    }

@router.get("/products")
async def get_admin_products(
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    status: str | None = None,
    product_type: str | None = None,
    tag: str | None = None,
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    try:
        query = db.query(models.Product)
        if search:
            search_term = f"%{search}%"
            query = query.filter(models.Product.title.ilike(search_term))
        if status and status != "all":
            query = query.filter(models.Product.status == status)
        if product_type and product_type != "all":
            query = query.filter(models.Product.product_type == product_type)
        if tag and tag != "all":
            query = query.filter(models.Product.tag == tag)
        total_products = query.count()
        products = query.order_by(models.Product.id).offset(skip).limit(limit).all()
        return {
            "products": products,
            "total_products": total_products
        }
    except Exception as e:
        print(f"Lỗi lấy sản phẩm: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving products: {str(e)}"
        )

@router.get("/orders")
async def get_admin_orders(
    skip: int = 0,
    limit: int = 5,
    status: str | None = None,
    search: str | None = None,
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db),
    request: Request = None
):
    try:
        query = db.query(models.Order).options(
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        if status and status != 'all':
            query = query.filter(models.Order.status == status)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (models.Order.id.ilike(search_term)) |
                (models.Order.shipping_name.ilike(search_term))
            )
        total_orders = query.count()
        orders = query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()
        for order in orders:
            for item in order.items:
                if  item.product and item.product.image and not item.product.image.startswith("http"):
                    item.product.image = str(request.base_url).rstrip("/") + "/" + item.product.image.lstrip("/")
        return {
            "orders": orders,
            "total_orders": total_orders
        }
    except Exception as e:
        print(f"Lỗi lấy đơn hàng: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving orders: {str(e)}"
        )

@router.get("/users", response_model=List[schemas.UserResponse])
async def get_admin_users(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    try:
        users = crud.get_users(db)
        return users
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.patch("/orders/{order_id}/status", response_model=schemas.Order)
def admin_update_order_status(
    order_id: int,
    status_data: dict = Body(...),
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    status = status_data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Missing status")
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order = crud.update_order_status(db, order_id, status)
    return order