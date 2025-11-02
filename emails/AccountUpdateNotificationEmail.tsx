/**
 * Account Update Notification Email Template
 * Sent when user changes account details
 * 
 * Subject: Your Account Has Been Updated
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

interface AccountUpdateNotificationEmailProps {
  userName?: string;
  updatedFields: string[];
  updatedAt: string;
  settingsUrl: string;
}

export function AccountUpdateNotificationEmail({
  userName = 'Customer',
  updatedFields,
  updatedAt,
  settingsUrl,
}: AccountUpdateNotificationEmailProps) {
  return (
    <EmailLayout preview="Your account information has been successfully updated.">
      <EmailHeader title="Account Updated" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We're confirming that your account information has been successfully updated.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Updated Information
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0', fontWeight: 'bold' }}>
            The following fields were updated:
          </Text>
          <ul style={{ paddingLeft: '20px', margin: '12px 0', color: COLORS.GRAY }}>
            {updatedFields.map((field, index) => (
              <li key={index} style={{ marginBottom: '4px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
                {field}
              </li>
            ))}
          </ul>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '12px 0 0 0' }}>
            Updated on: {new Date(updatedAt).toLocaleString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Section>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you did not make these changes, please contact us immediately at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          {' '}to secure your account.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={settingsUrl}>
          View Account Settings
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

export default AccountUpdateNotificationEmail;

