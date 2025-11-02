/**
 * Subscription Renewal Reminder Email Template
 * Sent before renewal date
 * 
 * Subject: Your Subscription Renews Soon - Action Required
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
import { SubscriptionDetails } from './shared/types';

interface SubscriptionRenewalReminderEmailProps {
  userName?: string;
  subscription: SubscriptionDetails;
  billingUrl: string;
  updatePaymentMethodUrl?: string;
}

export function SubscriptionRenewalReminderEmail({
  userName = 'Customer',
  subscription,
  billingUrl,
  updatePaymentMethodUrl,
}: SubscriptionRenewalReminderEmailProps) {
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <EmailLayout preview={`Your ${subscription.planName} subscription renews in ${daysUntilRenewal} days`}>
      <EmailHeader 
        title="Subscription Renewal Reminder" 
        subtitle={`Your ${subscription.planName} plan renews soon`}
      />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          This is a friendly reminder that your subscription will automatically renew in{' '}
          <strong>{daysUntilRenewal} day{daysUntilRenewal !== 1 ? 's' : ''}</strong>.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Renewal Details
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
            <strong>Plan:</strong> {subscription.planName}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
            <strong>Billing Cycle:</strong> {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
            <strong>Renewal Date:</strong>{' '}
            {new Date(subscription.renewalDate).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '8px 0 0 0' }}>
            <strong>Amount:</strong> {formatCurrency(subscription.amount, subscription.currency)}
          </Text>
        </Section>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          No action is required if you want to continue your subscription. Your payment method on file will be charged automatically.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={billingUrl} style={{ marginRight: '12px' }}>
          View Billing Details
        </EmailButton>
        {updatePaymentMethodUrl && (
          <EmailButton href={updatePaymentMethodUrl} variant="secondary">
            Update Payment Method
          </EmailButton>
        )}
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you need to make changes to your subscription or payment method, please visit your billing settings or contact us at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          .
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default SubscriptionRenewalReminderEmail;

