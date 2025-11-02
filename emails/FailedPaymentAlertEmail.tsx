/**
 * Failed Payment Alert Email Template
 * Sent when payment fails with retry option
 * 
 * Subject: Payment Failed - Action Required
 */
import {
  Text,
  Section,
  Heading,
} from '@react-email/components';
import { EmailLayout } from './shared/EmailLayout';
import { EmailButton } from './shared/EmailButton';
import { EmailHeader } from './shared/EmailHeader';
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';
import { PaymentDetails } from './shared/types';

interface FailedPaymentAlertEmailProps {
  userName?: string;
  payment: PaymentDetails;
  retryDate?: string;
  updatePaymentMethodUrl: string;
  billingUrl: string;
}

export function FailedPaymentAlertEmail({
  userName = 'Customer',
  payment,
  retryDate,
  updatePaymentMethodUrl,
  billingUrl,
}: FailedPaymentAlertEmailProps) {
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <EmailLayout preview={`Payment of ${formatCurrency(payment.amount, payment.currency)} failed - action required`}>
      <EmailHeader title="Payment Failed" subtitle="Action Required" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We were unable to process your payment. This could be due to insufficient funds, an expired card, or a bank decline.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Payment Details
        </Heading>
        
        <Section style={{ backgroundColor: '#FFF5F5', border: `2px solid #FCA5A5`, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
            <strong>Amount:</strong> {formatCurrency(payment.amount, payment.currency)}
          </Text>
          {payment.invoiceNumber && (
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
              <strong>Invoice:</strong> {payment.invoiceNumber}
            </Text>
          )}
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
            <strong>Payment Method:</strong> {payment.paymentMethod}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
            <strong>Transaction ID:</strong> {payment.transactionId}
          </Text>
          {retryDate && (
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '8px 0 0 0' }}>
              We will automatically retry this payment on:{' '}
              {new Date(retryDate).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}
        </Section>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          What You Can Do
        </Heading>
        <ul style={{ paddingLeft: '20px', margin: '12px 0', color: COLORS.GRAY }}>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Update your payment method to ensure we can process future payments
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Contact your bank or card issuer to resolve any issues
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Ensure sufficient funds are available in your account
          </li>
        </ul>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={updatePaymentMethodUrl} style={{ marginRight: '12px' }}>
          Update Payment Method
        </EmailButton>
        <EmailButton href={billingUrl} variant="secondary">
          View Billing Details
        </EmailButton>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you continue to experience issues, please contact us at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          {' '}and we'll be happy to help.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default FailedPaymentAlertEmail;

