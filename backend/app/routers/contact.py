import os
import smtplib
import logging
from email.message import EmailMessage

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel, Field

# Router setup connects this file to your main FastAPI app
router = APIRouter(prefix="/contact", tags=["Contact"])
logger = logging.getLogger(__name__)

# Pydantic Schema: Enforces that frontend data matches these exact types
class ContactMessage(BaseModel):
    full_name: str
    country_code: str = Field(pattern=r"^\+\d{1,4}$")
    phone: str = Field(pattern=r"^\d+$")
    email: str | None = None
    message: str

COUNTRY_DIGIT_LIMITS = {
    "+91": 10,
    "+1": 10,
    "+44": 10,
    "+61": 9,
    "+971": 9,
    "+65": 8,
}


def validate_phone(data: ContactMessage) -> None:
    expected_digits = COUNTRY_DIGIT_LIMITS.get(data.country_code)
    if expected_digits is None or len(data.phone) != expected_digits:
        raise ValueError(
            f"Phone number must contain {expected_digits or 'the correct number of'} digits for {data.country_code}."
        )


def send_contact_email(data: ContactMessage) -> None:
    smtp_host = os.getenv("EMAIL_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT", "587"))
    smtp_user = os.getenv("EMAIL_USER")
    smtp_password = os.getenv("EMAIL_PASSWORD")
    recipient_email = os.getenv("CONTACT_TO_EMAIL") or os.getenv("EMAIL_USER")

    if not all([smtp_host, smtp_user, smtp_password, recipient_email]):
        raise RuntimeError(
            "Missing email configuration. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, and CONTACT_TO_EMAIL in backend/.env."
        )

    # ---------------------------------------------------------
    # 1. ADMIN NOTIFICATION: The email sent to your project inbox
    # ---------------------------------------------------------
    admin_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0f172a; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">New Inquiry Received</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 13px;">KrishakMitra Contact Form</p>
      </div>
      <div style="padding: 30px 20px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold; width: 30%;">Full Name:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{data.full_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Phone Number:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{data.country_code} {data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-weight: bold;">Email Address:</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{data.email or 'Not provided'}</td>
          </tr>
        </table>
        <div style="margin-top: 25px;">
          <p style="color: #64748b; font-weight: bold; margin-bottom: 10px;">Message:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; color: #334155; line-height: 1.6;">
            {data.message.strip()}
          </div>
        </div>
      </div>
    </div>
    """

    admin_msg = EmailMessage()
    admin_msg["Subject"] = f"New contact message from {data.full_name} - KrishakMitra"
    admin_msg["From"] = smtp_user
    admin_msg["To"] = recipient_email
    if data.email:
        admin_msg["Reply-To"] = data.email
    admin_msg.set_content("Please enable HTML to view this email.") # Fallback for old email clients
    admin_msg.add_alternative(admin_html, subtype='html')

    # ---------------------------------------------------------
    # 2. AUTO-RESPONDER: The thank you email sent back to the user
    # ---------------------------------------------------------
    user_msg = None
    if data.email: # Only create this if the user provided an email address
        user_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #16a34a; padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">KRISHAKMITRA</h1>
            <p style="color: #dcfce7; margin: 5px 0 0 0; font-size: 14px;">Farmer Procurement Platform</p>
          </div>
          <div style="padding: 30px 20px; background-color: #ffffff; color: #334155;">
            <h2 style="margin-top: 0; color: #0f172a;">Message Received!</h2>
            <p style="line-height: 1.6;">Hello <strong>{data.full_name}</strong>,</p>
            <p style="line-height: 1.6;">Thank you for reaching out to KrishakMitra. We have successfully received your message.</p>
            <p style="line-height: 1.6;">Our team will review your inquiry and get back to you shortly to assist with your agricultural needs.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
              Empowering Small & Marginal Farmers.<br>
              © 2026 KrishakMitra Team
            </p>
          </div>
        </div>
        """
        user_msg = EmailMessage()
        user_msg["Subject"] = "KrishakMitra - We received your message!"
        user_msg["From"] = smtp_user
        user_msg["To"] = data.email
        user_msg.set_content("Please enable HTML to view this email.")
        user_msg.add_alternative(user_html, subtype='html')

    # ---------------------------------------------------------
    # 3. SMTP CONNECTION: Send both emails in one secure session
    # ---------------------------------------------------------
    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        
        server.send_message(admin_msg) # Send to you
        
        if user_msg:
            server.send_message(user_msg) # Send to the farmer


def deliver_contact_email(data: ContactMessage) -> None:
    try:
        send_contact_email(data)
    except Exception:
        logger.exception("Contact email delivery failed")


@router.post("/", status_code=status.HTTP_202_ACCEPTED)
def submit_contact_message(data: ContactMessage, background_tasks: BackgroundTasks):
    if not data.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    try:
        validate_phone(data)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    background_tasks.add_task(deliver_contact_email, data)
    return {
        "success": True,
        "message": "Your message was received and is being sent to the KrishakMitra support team.",
    }