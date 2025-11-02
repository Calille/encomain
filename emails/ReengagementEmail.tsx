/**
 * Re-engagement Email Template
 * Sent to inactive users to encourage them to return
 * 
 * Subject: We Miss You! [User Name]
 */
import {
  Text,
  Section,
  Heading,
} from '@react-email/components';
import { EmailLayout } from './shared/EmailLayout';
import { EmailButton } from './shared/EmailButton';
import { EmailHeader } from './shared/EmailHeader';
import { EmailFooter } from './shared/EmailFooter';
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';

interface ReengagementEmailProps {
  userName?: string;
  lastActivityDate?: string;
  daysSinceLastActivity: number;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export function ReengagementEmail({
  userName = 'there',
  lastActivityDate,
  daysSinceLastActivity,
  dashboardUrl,
  unsubscribeUrl,
}: ReengagementEmailProps) {
  return (
    <EmailLayout preview="We miss you! Come back and see what's new.">
      <EmailHeader title="We Miss You!" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We noticed you haven't been active lately, and we wanted to reach out and let you know we're still here for you!
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          What You've Been Missing
        </Heading>
        <ul style={{ paddingLeft: '20px', margin: '12px 0', color: COLORS.GRAY }}>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Access to all your projects and account information
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            New features and improvements we've been working on
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Expert support whenever you need it
          </li>
        </ul>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Your account is still active and ready to use. We'd love to have you back!
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={dashboardUrl}>
          Return to Dashboard
        </EmailButton>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you have any questions or need assistance, please don't hesitate to contact us at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          .
        </Text>
      </Section>

      <EmailFooter unsubscribeLink={unsubscribeUrl} />
    </EmailLayout>
  );
}

export default ReengagementEmail;

