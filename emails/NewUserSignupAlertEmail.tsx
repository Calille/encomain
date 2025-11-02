/**
 * New User Signup Alert Email Template
 * Admin notification when new user signs up
 * 
 * Subject: New User Signup: [User Email]
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
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';

interface NewUserSignupAlertEmailProps {
  adminName?: string;
  userEmail: string;
  userName?: string;
  signupDate: string;
  userRole: string;
  adminDashboardUrl: string;
}

export function NewUserSignupAlertEmail({
  adminName = 'Admin',
  userEmail,
  userName,
  signupDate,
  userRole,
  adminDashboardUrl,
}: NewUserSignupAlertEmailProps) {
  return (
    <EmailLayout preview={`New user signup: ${userEmail}`}>
      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_HEADING, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          New User Signup
        </Heading>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {adminName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          A new user has signed up for an account.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          User Details
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Row style={{ marginBottom: '8px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Email:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0' }}>
                {userEmail}
              </Text>
            </Column>
          </Row>
          {userName && (
            <Row style={{ marginBottom: '8px' }}>
              <Column style={{ width: '40%' }}>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                  Name:
                </Text>
              </Column>
              <Column>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                  {userName}
                </Text>
              </Column>
            </Row>
          )}
          <Row style={{ marginBottom: '8px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Role:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {userRole}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Signup Date:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {new Date(signupDate).toLocaleString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={adminDashboardUrl}>
          View in Admin Dashboard
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

export default NewUserSignupAlertEmail;

