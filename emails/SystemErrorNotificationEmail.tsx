/**
 * System Error Notification Email Template
 * Admin notification for critical system errors
 * 
 * Subject: [Severity] System Error Alert: [Error Type]
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

interface SystemErrorNotificationEmailProps {
  adminName?: string;
  errorType: string;
  errorMessage: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  adminDashboardUrl: string;
}

export function SystemErrorNotificationEmail({
  adminName = 'Admin',
  errorType,
  errorMessage,
  timestamp,
  severity,
  context,
  adminDashboardUrl,
}: SystemErrorNotificationEmailProps) {
  const severityColors = {
    critical: '#DC2626',
    high: '#F59E0B',
    medium: '#F97316',
    low: '#3B82F6',
  };

  const severityLabels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <EmailLayout preview={`${severityLabels[severity]} System Error: ${errorType}`}>
      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading 
          style={{ 
            fontSize: TYPOGRAPHY.FONT_SIZE_HEADING, 
            color: severityColors[severity], 
            margin: '0 0 16px 0' 
          }}
        >
          System Error Alert
        </Heading>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {adminName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          A system error has been detected that requires your attention.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Error Details
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Row style={{ marginBottom: '12px' }}>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Severity
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: severityColors[severity], fontWeight: 'bold', margin: '0' }}>
                {severityLabels[severity]}
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Error Type
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {errorType}
              </Text>
            </Column>
          </Row>
          
          <Row style={{ marginBottom: '12px' }}>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Timestamp
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {new Date(timestamp).toLocaleString('en-GB', {
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

        <Section style={{ marginBottom: SPACING.GAP }}>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0 0 8px 0' }}>
            Error Message:
          </Text>
          <Text style={{ 
            fontSize: TYPOGRAPHY.FONT_SIZE_BASE, 
            color: COLORS.GRAY, 
            lineHeight: TYPOGRAPHY.LINE_HEIGHT,
            backgroundColor: COLORS.BACKGROUND_GRAY,
            padding: SPACING.PADDING_MOBILE,
            borderRadius: '4px',
            margin: '0'
          }}>
            {errorMessage}
          </Text>
        </Section>

        {context && Object.keys(context).length > 0 && (
          <Section style={{ marginBottom: SPACING.GAP }}>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0 0 8px 0' }}>
              Additional Context:
            </Text>
            <pre style={{ 
              fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, 
              color: COLORS.GRAY, 
              backgroundColor: COLORS.BACKGROUND_GRAY,
              padding: SPACING.PADDING_MOBILE,
              borderRadius: '4px',
              margin: '0',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}>
              {JSON.stringify(context, null, 2)}
            </pre>
          </Section>
        )}
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={adminDashboardUrl}>
          View Admin Dashboard
        </EmailButton>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          This is an automated notification from The Enclosure system monitoring.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default SystemErrorNotificationEmail;

