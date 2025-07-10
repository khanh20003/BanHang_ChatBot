import time

otps = {}

async def store_otp(email: str, otp: str = None, verified: bool = False):
    otps[email] = {
        "otp": otp,
        "expires": time.time() + 600 if otp else None,  # Hết hạn sau 10 phút
        "verified": verified,
    }

async def verify_otp(email: str, otp: str) -> dict:
    record = otps.get(email)
    if not record:
        return None
    if otp and (record["expires"] < time.time() or record["otp"] != otp):
        return None
    return record