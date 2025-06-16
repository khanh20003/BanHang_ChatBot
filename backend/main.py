import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from module import models, database
from routers import category, product, banner, brand, feature, recent, cart, chat, admin, auth, checkout, orders, user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(category.router)
app.include_router(product.router)
app.include_router(banner.router)
app.include_router(brand.router)
app.include_router(feature.router)
app.include_router(recent.router)
app.include_router(cart.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(checkout.router)
app.include_router(orders.router)
app.include_router(user.router)
# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

