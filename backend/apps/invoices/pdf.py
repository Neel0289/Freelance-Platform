import io
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER


def generate_invoice_pdf(invoice):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=30*mm, bottomMargin=30*mm)
    styles = getSampleStyleSheet()
    elements = []

    # Title style
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=colors.HexColor('#6366f1'),
        spaceAfter=20,
    )

    # Header
    elements.append(Paragraph('INVOICE', title_style))
    elements.append(Spacer(1, 10))

    # Invoice details
    detail_style = ParagraphStyle('Detail', parent=styles['Normal'], fontSize=10)
    right_style = ParagraphStyle('RightDetail', parent=styles['Normal'], fontSize=10, alignment=TA_RIGHT)

    info_data = [
        [
            Paragraph(f"<b>From:</b><br/>{invoice.freelancer.get_full_name() or invoice.freelancer.email}<br/>{invoice.freelancer.email}", detail_style),
            Paragraph(f"<b>Invoice #:</b> {invoice.invoice_number}<br/>"
                      f"<b>Issue Date:</b> {invoice.issue_date}<br/>"
                      f"<b>Due Date:</b> {invoice.due_date}<br/>"
                      f"<b>Status:</b> {invoice.get_status_display()}", right_style),
        ],
        [
            Paragraph(f"<b>To:</b><br/>{invoice.client.name}<br/>{invoice.client.email}<br/>{invoice.client.company}", detail_style),
            Paragraph('', right_style),
        ],
    ]

    info_table = Table(info_data, colWidths=[3.5*inch, 3.5*inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 20))

    # Items table
    header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=10, textColor=colors.white)
    item_data = [
        [
            Paragraph('<b>Description</b>', header_style),
            Paragraph('<b>Qty</b>', header_style),
            Paragraph('<b>Unit Price</b>', header_style),
            Paragraph('<b>Total</b>', header_style),
        ]
    ]

    for item in invoice.items.all():
        item_data.append([
            Paragraph(item.description, detail_style),
            Paragraph(str(item.quantity), detail_style),
            Paragraph(f"₹{item.unit_price:,.2f}", detail_style),
            Paragraph(f"₹{item.total:,.2f}", detail_style),
        ])

    items_table = Table(item_data, colWidths=[3.2*inch, 1*inch, 1.4*inch, 1.4*inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 20))

    # Totals
    totals_data = [
        ['', '', Paragraph('<b>Subtotal:</b>', right_style), Paragraph(f"₹{invoice.subtotal:,.2f}", right_style)],
        ['', '', Paragraph(f'<b>Tax ({invoice.tax_rate}%):</b>', right_style), Paragraph(f"₹{invoice.tax_amount:,.2f}", right_style)],
        ['', '', Paragraph('<b>Total:</b>', right_style), Paragraph(f"<b>₹{invoice.total:,.2f}</b>", right_style)],
    ]

    totals_table = Table(totals_data, colWidths=[3.2*inch, 1*inch, 1.4*inch, 1.4*inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('LINEABOVE', (2, 2), (-1, 2), 1, colors.HexColor('#6366f1')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(totals_table)

    # Notes
    if invoice.notes:
        elements.append(Spacer(1, 30))
        elements.append(Paragraph('<b>Notes:</b>', detail_style))
        elements.append(Paragraph(invoice.notes, detail_style))

    if invoice.terms:
        elements.append(Spacer(1, 10))
        elements.append(Paragraph('<b>Terms:</b>', detail_style))
        elements.append(Paragraph(invoice.terms, detail_style))

    doc.build(elements)
    buffer.seek(0)

    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
    return response
