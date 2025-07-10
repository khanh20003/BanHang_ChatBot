import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("MAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
EMAIL_FROM = os.getenv("MAIL_FROM", EMAIL_ADDRESS)

def send_email(to_email: str, subject: str, body: str):
    if not all([EMAIL_ADDRESS, EMAIL_PASSWORD]):
        raise ValueError("Thiếu MAIL_USERNAME hoặc MAIL_PASSWORD trong .env")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            smtp.send_message(msg)
        print(f"✅ Email sent to {to_email}")
    except smtplib.SMTPAuthenticationError:
        raise ValueError("Lỗi xác thực SMTP. Kiểm tra MAIL_USERNAME và MAIL_PASSWORD.")
    except smtplib.SMTPException as e:
        raise ValueError(f"Lỗi SMTP: {str(e)}")
    except Exception as e:
        raise ValueError(f"Lỗi gửi email: {str(e)}")