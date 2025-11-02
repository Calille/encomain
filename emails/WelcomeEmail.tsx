/**
 * Welcome Email Template
 * Sent after user verifies their email
 * 
 * Subject: Welcome to The Enclosure!
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

interface WelcomeEmailProps {
  userName?: string;
  loginUrl: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ userName = 'there', loginUrl, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to The Enclosure! We're excited to have you on board.">
      <EmailHeader title="Welcome to The Enclosure!" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Thank you for joining The Enclosure! We're thrilled to have you on board and look forward to helping you build something amazing.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Get Started
        </Heading>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, marginBottom: '20px' }}>
          Your account is ready to use. Here's what you can do next:
        </Text>
        <ul style={{ paddingLeft: '20px', margin: '16px 0', color: COLORS.GRAY }}>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Access your dashboard to view your projects and account details
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Complete your profile to personalize your experience
          </li>
          <li style={{ marginBottom: '8px', lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
            Explore our services and discover what we can build together
          </li>
        </ul>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={dashboardUrl}>
          Go to Dashboard
        </EmailButton>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          If you have any questions, feel free to reach out to our support team at{' '}
          <a href={`mailto:${BRAND.supportEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.supportEmail}
          </a>
          . We're here to help!
        </Text>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Best regards,<br />
          The Team at The Enclosure
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default WelcomeEmail;

