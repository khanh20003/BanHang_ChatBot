from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import random
from module.mail_utils import send_email
from module.database import get_db
from module.models import User
from module import schemas
from module.crud import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from module.otp_storage import store_otp, verify_otp
import asyncio

router = APIRouter()

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    if user.email:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if user.password != user.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
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

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user 

@router.post("/forgot-password")
async def forgot_password(
    request: schemas.EmailRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        return JSONResponse(
            status_code=200,
            content={"message": "Nếu email tồn tại, mã OTP đã được gửi."}
        )

    otp = str(random.randint(100000, 999999))
    try:
        await store_otp(request.email, otp)
        body = f"""
        Xin chào {user.full_name or user.username},

        Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại Device Store.

        Mã OTP của bạn là: {otp}
        Mã này có hiệu lực trong 10 phút.
        """
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: send_email(
            to_email=request.email,
            subject="Mã OTP để đặt lại mật khẩu",
            body=body
        ))
        return JSONResponse(
            status_code=200,
            content={"message": "Mã OTP đã được gửi nếu email tồn tại."}
        )
    except Exception as e:
        print(f"Lỗi gửi email: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi gửi OTP, vui lòng thử lại sau.")

@router.post("/verify-otp")
async def verify_otp(
    request: schemas.OTPRequest,
    db: Session = Depends(get_db)
):
    try:
        # Validate dữ liệu đầu vào
        if not request.email or not request.otp:
            raise HTTPException(status_code=400, detail="Email và OTP là bắt buộc")
        
        # Kiểm tra user trong database
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            print(f"Không tìm thấy user với email: {request.email}")
            raise HTTPException(status_code=400, detail="Email không tồn tại")
        
        # Kiểm tra OTP
        otp_record = await verify_otp(request.email, request.otp)
        if not otp_record:
            print(f"OTP không hợp lệ hoặc đã hết hạn cho email: {request.email}")
            raise HTTPException(status_code=400, detail="Mã OTP không đúng hoặc đã hết hạn")
        
        # Lưu trạng thái xác minh
        await store_otp(request.email, None, verified=True)
        print(f"OTP xác minh thành công cho email: {request.email}")
        return {"message": "OTP verified"}
    except Exception as e:
        print(f"Lỗi xác minh OTP: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi xác minh OTP: {str(e)}")

@router.post("/reset-password")
async def reset_password(
    request: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    try:
        # Kiểm tra user
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            print(f"Không tìm thấy user với email: {request.email}")
            raise HTTPException(status_code=400, detail="Email không tồn tại")
        
        # Kiểm tra trạng thái xác minh OTP
        record = await verify_otp(request.email, None)
        if not record or not record.get("verified"):
            print(f"OTP chưa được xác minh cho email: {request.email}")
            raise HTTPException(status_code=400, detail="OTP chưa được xác minh")
        
        # Cập nhật mật khẩu
        user.password_hash = get_password_hash(request.password)
        db.commit()
        print(f"Đặt lại mật khẩu thành công cho email: {request.email}")
        return {"message": "Đặt lại mật khẩu thành công"}
    except Exception as e:
        print(f"Lỗi đặt lại mật khẩu: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi đặt lại mật khẩu")