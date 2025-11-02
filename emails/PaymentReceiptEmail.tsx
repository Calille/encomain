/**
 * Payment Receipt Email Template
 * Sent after successful payment
 * 
 * Subject: Payment Receipt - [Transaction ID]
 */
import {
  Text,
  Section,
  Heading,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './shared/EmailLayout';
import { EmailButton } from './shared/EmailButton';
import { EmailHeader } from './shared/EmailHeader';
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';
import { PaymentDetails } from './shared/types';

interface PaymentReceiptEmailProps {
  userName?: string;
  payment: PaymentDetails;
  invoiceUrl?: string;
  receiptUrl?: string;
}

export function PaymentReceiptEmail({
  userName = 'Customer',
  payment,
  invoiceUrl,
  receiptUrl,
}: PaymentReceiptEmailProps) {
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <EmailLayout preview={`Payment received: ${formatCurrency(payment.amount, payment.currency)}`}>
      <EmailHeader title="Payment Received" subtitle="Thank you for your payment" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We've successfully received your payment. This email serves as your receipt.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Payment Details
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Row style={{ marginBottom: '12px' }}>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Transaction ID
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0' }}>
                {payment.transactionId}
              </Text>
            </Column>
          </Row>
          {payment.invoiceNumber && (
            <Row style={{ marginBottom: '12px' }}>
              <Column>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                  Invoice Number
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                  {payment.invoiceNumber}
                </Text>
              </Column>
            </Row>
          )}
          <Row style={{ marginBottom: '12px' }}>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Payment Date
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {new Date(payment.paymentDate).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Column>
          </Row>
          <Row style={{ marginBottom: '12px' }}>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Payment Method
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {payment.paymentMethod}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Amount Paid
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '0' }}>
                {formatCurrency(payment.amount, payment.currency)}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        {receiptUrl && (
          <EmailButton href={receiptUrl} style={{ marginRight: '12px' }}>
            Download Receipt
          </EmailButton>
        )}
        {invoiceUrl && (
          <EmailButton href={invoiceUrl} variant="secondary">
            View Invoice
          </EmailButton>
        )}
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you have any questions about this payment, please contact us at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          . We're happy to help!
        </Text>
      </Section>

      <Section style={{ marginTop: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Thank you for your business!
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, marginTop: '8px' }}>
          Best regards,<br />
          The Team at The Enclosure
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default PaymentReceiptEmail;

