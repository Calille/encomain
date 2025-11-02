/**
 * Account Deletion Confirmation Email Template
 * Sent when user deletes their account (with recovery link if within grace period)
 * 
 * Subject: Account Deletion Confirmation
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

interface AccountDeletionConfirmationEmailProps {
  userName?: string;
  deletionDate: string;
  recoveryUrl?: string;
  recoveryExpiryDate?: string;
}

export function AccountDeletionConfirmationEmail({
  userName = 'Customer',
  deletionDate,
  recoveryUrl,
  recoveryExpiryDate,
}: AccountDeletionConfirmationEmailProps) {
  return (
    <EmailLayout preview="Your account deletion request has been processed.">
      <EmailHeader title="Account Deletion Confirmed" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We've received and processed your request to delete your account. Your account will be permanently deleted on{' '}
          <strong>{new Date(deletionDate).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</strong>.
        </Text>
      </Section>

      {recoveryUrl && recoveryExpiryDate && (
        <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
          <Section style={{ backgroundColor: '#FFF9E6', border: `2px solid #FFE066`, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
            <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.GRAY, margin: '0 0 12px 0' }}>
              Changed Your Mind?
            </Heading>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, marginBottom: '16px' }}>
              You can recover your account before it's permanently deleted. Click the button below to restore your account.
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '12px 0 0 0' }}>
              This recovery link expires on:{' '}
              {new Date(recoveryExpiryDate).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
            <EmailButton href={recoveryUrl}>
              Restore My Account
            </EmailButton>
          </Section>
        </Section>
      )}

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          What Happens Next?
        </Heading>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, marginBottom: '12px' }}>
          Before your account is permanently deleted:
        </Text>
        <ul style={{ paddingLeft: '20px', margin: '12px 0', color: COLORS.GRAY }}>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            All of your data will be permanently removed
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            You will lose access to all projects and services
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            All billing and payment information will be deleted
          </li>
        </ul>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you have any questions or concerns, please contact us at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          .
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default AccountDeletionConfirmationEmail;

