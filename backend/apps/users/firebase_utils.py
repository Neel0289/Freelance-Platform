import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils.text import slugify
import os

User = get_user_model()

# Initialize Firebase Admin SDK once and capture startup issues for clear API errors.
firebase_creds_path = os.path.join(settings.BASE_DIR, 'config', 'firebase-service-account.json')
FIREBASE_INIT_ERROR = None

if os.path.exists(firebase_creds_path):
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_creds_path)
            firebase_admin.initialize_app(cred)
    except Exception as exc:
        FIREBASE_INIT_ERROR = f'Firebase initialization failed: {exc}'
else:
    FIREBASE_INIT_ERROR = (
        f'Firebase service account file missing at {firebase_creds_path}. '
        'Google sign-in is not available.'
    )

def verify_firebase_token(id_token):
    """
    Verifies a Firebase ID token and returns the user's information.
    """
    if FIREBASE_INIT_ERROR:
        raise RuntimeError(FIREBASE_INIT_ERROR)

    try:
        return auth.verify_id_token(id_token)
    except Exception as exc:
        raise ValueError(f'Invalid Firebase token: {exc}') from exc


def _build_unique_username(email):
    local_part = email.split('@')[0] if email else ''
    base = slugify(local_part) or 'user'
    max_length = User._meta.get_field('username').max_length
    base = base[:max_length]

    candidate = base
    counter = 1
    while User.objects.filter(username=candidate).exists():
        suffix = f'-{counter}'
        candidate = f"{base[:max_length - len(suffix)]}{suffix}"
        counter += 1
    return candidate

def get_or_create_firebase_user(decoded_token, role='FREELANCER'):
    """
    Gets or creates a Django user based on Firebase token information.
    """
    email = decoded_token.get('email')
    if not email:
        return None

    existing_user = User.objects.filter(email=email).first()
    if existing_user:
        return existing_user

    name_parts = decoded_token.get('name', '').split(' ')
    first_name = name_parts[0] if name_parts else ''
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

    # Retry on race conditions where another request claims the same generated username.
    for _ in range(5):
        try:
            with transaction.atomic():
                return User.objects.create(
                    email=email,
                    username=_build_unique_username(email),
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                )
        except IntegrityError:
            continue

    return User.objects.filter(email=email).first()
