from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi import FastAPI
from typing import List
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Create email_templates directory if it doesn't exist
template_dir = Path(__file__).parent / 'email_templates'
template_dir.mkdir(exist_ok=True)

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "your-email@example.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your-password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "your-email@example.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "Your Store Name"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=template_dir
)

fm = FastMail(conf)

async def send_order_confirmation_email(
    email_to: str,
    order_number: str,
    customer_name: str,
    order_items: List[dict],
    total_amount: float,
    shipping_address: str
):
    """
    Send order confirmation email to customer
    """
    # Create email content
    items_html = ""
    for item in order_items:
        items_html += f"""
        <tr>
            <td>{item['product_name']}</td>
            <td>{item['quantity']}</td>
            <td>${item['price']:.2f}</td>
            <td>${item['quantity'] * item['price']:.2f}</td>
        </tr>
        """

    html_content = f"""
    <html>
        <body>
            <h1>Order Confirmation</h1>
            <p>Dear {customer_name},</p>
            <p>Thank you for your order! Your order number is: {order_number}</p>
            
            <h2>Order Details:</h2>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                {items_html}
            </table>
            
            <p><strong>Total Amount:</strong> ${total_amount:.2f}</p>
            <p><strong>Shipping Address:</strong><br>{shipping_address}</p>
            
            <p>We will process your order shortly.</p>
            <p>Thank you for shopping with us!</p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject=f"Order Confirmation - Order #{order_number}",
        recipients=[email_to],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)

async def send_order_notification_to_admin(
    order_number: str,
    customer_name: str,
    order_items: List[dict],
    total_amount: float
):
    """
    Send order notification to admin
    """
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    
    # Create email content
    items_html = ""
    for item in order_items:
        items_html += f"""
        <tr>
            <td>{item['product_name']}</td>
            <td>{item['quantity']}</td>
            <td>${item['price']:.2f}</td>
            <td>${item['quantity'] * item['price']:.2f}</td>
        </tr>
        """

    html_content = f"""
    <html>
        <body>
            <h1>New Order Received</h1>
            <p>Order Number: {order_number}</p>
            <p>Customer: {customer_name}</p>
            
            <h2>Order Details:</h2>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                {items_html}
            </table>
            
            <p><strong>Total Amount:</strong> ${total_amount:.2f}</p>
        </body>
    </html>
    """

    message = MessageSchema(
        subject=f"New Order #{order_number}",
        recipients=[admin_email],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message) 