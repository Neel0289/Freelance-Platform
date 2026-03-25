import os
import django
from django.core.mail import send_mail
from django.conf import settings
from django.core.mail.backends.smtp import EmailBackend

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_smtp_config(host, port, user, password, use_tls, use_ssl):
    print(f"\n--- Testing Host:{host} Port:{port} TLS:{use_tls} SSL:{use_ssl} ---")
    try:
        backend = EmailBackend(
            host=host,
            port=port,
            username=user,
            password=password,
            use_tls=use_tls,
            use_ssl=use_ssl,
            fail_silently=False,
        )
        send_mail(
            'Final SMTP Test',
            'This is a final test to find a working config.',
            settings.DEFAULT_FROM_EMAIL,
            ['neel9086@gmail.com'],
            connection=backend,
        )
        print("SUCCESS!!!")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

user = 'a139ab001@smtp-brevo.com'
password = 'xsmtpsib-f2389cfceecc0dda3de5bf165e8a0de59322827644dc2dee3bb7df815ec93772-bT0pcUX6TkVaGvP3'

# 1. 587 TLS (Previous)
test_smtp_config('smtp-relay.brevo.com', 587, user, password, True, False)

# 2. 465 SSL
test_smtp_config('smtp-relay.brevo.com', 465, user, password, False, True)

# 3. 2525 TLS
test_smtp_config('smtp-relay.brevo.com', 2525, user, password, True, False)

# 4. Try with Gmail backend for reference (if user wants) - No, just stay with current credentials
