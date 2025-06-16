# routes/admin_router.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List

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
    # Tổng doanh thu từ tất cả các đơn hàng
    total_revenue = db.query(func.coalesce(func.sum(models.Order.total_amount), 0)).scalar()

    # Tổng số người dùng
    total_users = db.query(models.User).count()

    # Tổng số sản phẩm
    total_products = db.query(models.Product).count()

    # Hoạt động gần đây: lấy 5 user mới nhất
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(5).all()
    recent_activity = [
        {
            "type": "user_registration",
            "user_name": getattr(user, 'full_name', None) or getattr(user, 'username', None) or getattr(user, 'email', None),
            "timestamp": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at)
        }
        for user in recent_users
    ]

    # Dữ liệu doanh thu từng tháng trong 12 tháng gần nhất
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


@router.get("/products", response_model=List[schemas.Product])
async def get_admin_products(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    try:
        products = crud.get_products(db)
        return products
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving products: {str(e)}"
        )


@router.get("/orders", response_model=List[schemas.Order])
async def get_admin_orders(
    current_admin: models.Admin = Depends(get_current_admin),
    db: Session = Depends(database.get_db)
):
    try:
        orders = db.query(models.Order).order_by(models.Order.created_at.desc()).all()
        return orders
    except Exception as e:
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
