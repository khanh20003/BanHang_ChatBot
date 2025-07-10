


from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from module.database import get_db
from module import crud, schemas, models
from services.auth import get_current_user
import os
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["user"])
# API lấy danh sách guest (khách vãng lai) giống như user thật

# API lấy danh sách user thật (id < 100000) và khách vãng lai (id >= 100000 hoặc null) từ bảng ChatSession
@router.get("/list", response_model=dict)
def get_users_and_guests(db: Session = Depends(get_db)):
    # Lấy user thật từ bảng users
    users = crud.get_users(db)
    real_users = [
        {
            "id": str(u.id),
            "name": u.full_name or u.username,
            "group": "user"
        }
        for u in users if isinstance(u.id, int) and u.id > 0 and u.id < 100000
    ]

    # Lấy khách vãng lai từ bảng chat_sessions (customer_id >= 100000 hoặc null, loại trùng)
    from module.models import ChatSession
    guest_query = db.query(ChatSession.customer_id).distinct().all()
    guest_ids = set()
    for row in guest_query:
        cid = row[0]
        if (cid is not None and cid >= 100000) or cid is None:
            guest_ids.add(cid)
    guests = [
        {
            "id": str(cid) if cid is not None else "guest_null",
            "name": f"Khách: {cid}" if cid is not None else "Khách vãng lai (chưa có id)",
            "group": "guest"
        }
        for cid in guest_ids
    ]
    return {"users": real_users, "guests": guests}

@router.put("/profile", response_model=schemas.UserResponse)
async def update_profile(
    profile: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        logger.info(f"Updating profile for user {current_user.id}")
        updated_user = crud.update_user(db, current_user.id, profile)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except Exception as e:
        logger.error(f"Update failed: {e}")
        raise HTTPException(status_code=500, detail="Update failed")
    
@router.delete("/delete", response_model=schemas.UserResponse)
async def delete_user(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        logger.info(f"Deleting user {current_user.id}")
        deleted_user = crud.delete_user(db, current_user.id)
        if not deleted_user:
            raise HTTPException(status_code=404, detail="User not found")
        return deleted_user
    except Exception as e:
        logger.error(f"Delete failed: {e}")
        raise HTTPException(status_code=500, detail="Delete failed")        

@router.post("/upload-avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        logger.info(f"Uploading avatar for user {current_user.id}")
        # Kiểm tra file
        if not avatar.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Tạo tên file
        file_extension = avatar.filename.split(".")[-1]
        if file_extension not in ["jpg", "jpeg", "png", "gif"]:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        filename = f"{uuid.uuid4()}.{file_extension}"

        # Kiểm tra thư mục
        upload_dir = "static/avatars"
        try:
            os.makedirs(upload_dir, exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create directory {upload_dir}: {e}")
            raise HTTPException(status_code=500, detail="Failed to create upload directory")

        # Lưu file
        file_path = os.path.join(upload_dir, filename)
        try:
            with open(file_path, "wb") as f:
                content = await avatar.read()
                if not content:
                    raise HTTPException(status_code=400, detail="Empty file")
                f.write(content)
        except Exception as e:
            logger.error(f"Failed to save file {file_path}: {e}")
            raise HTTPException(status_code=500, detail="Failed to save file")

        # Tạo URL
        avatar_url = f"/{upload_dir}/{filename}"
        logger.info(f"Avatar saved at {avatar_url}")

        # Truy vấn lại user trong phiên hiện tại
        try:
            user = db.query(models.User).filter(models.User.id == current_user.id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            user.avatar = avatar_url
            db.commit()
            db.refresh(user)
        except Exception as e:
            logger.error(f"Database update failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to update user avatar: {str(e)}")

        return {"avatar_url": avatar_url}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload avatar failed: {str(e)}")

@router.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        logger.info(f"Admin deleting user {user_id}")
        deleted_user = crud.delete_user(db, user_id)
        if not deleted_user:
            raise HTTPException(status_code=404, detail="User not found")
        return deleted_user
    except Exception as e:
        logger.error(f"Admin delete failed: {e}")
        raise HTTPException(status_code=500, detail="Admin delete failed")