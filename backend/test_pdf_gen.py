import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.invoices.models import Invoice
from apps.invoices.pdf import generate_invoice_pdf

try:
    invoice = Invoice.objects.first()
    if not invoice:
        print("No invoices found to test.")
    else:
        print(f"Testing PDF generation for Invoice: {invoice.invoice_number}")
        response = generate_invoice_pdf(invoice)
        if response.status_code == 200 and response.has_header('Content-Disposition'):
            print("SUCCESS! PDF generated successfully.")
            # Save to temp file to verify content length
            with open('test_invoice.pdf', 'wb') as f:
                f.write(response.content)
            print(f"PDF saved to test_invoice.pdf ({len(response.content)} bytes)")
        else:
            print(f"FAILED! Response status: {response.status_code}")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
