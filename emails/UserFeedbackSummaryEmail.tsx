/**
 * User Feedback Summary Email Template
 * Weekly digest of user feedback for admins
 * 
 * Subject: Weekly Feedback Summary - [Period]
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
import { UserFeedbackSummary } from './shared/types';

interface UserFeedbackSummaryEmailProps {
  adminName?: string;
  feedbackSummary: UserFeedbackSummary;
  adminDashboardUrl: string;
}

export function UserFeedbackSummaryEmail({
  adminName = 'Admin',
  feedbackSummary,
  adminDashboardUrl,
}: UserFeedbackSummaryEmailProps) {
  const positivePercentage = feedbackSummary.totalFeedback > 0
    ? Math.round((feedbackSummary.positiveFeedback / feedbackSummary.totalFeedback) * 100)
    : 0;

  const negativePercentage = feedbackSummary.totalFeedback > 0
    ? Math.round((feedbackSummary.negativeFeedback / feedbackSummary.totalFeedback) * 100)
    : 0;

  return (
    <EmailLayout preview={`Weekly Feedback Summary: ${feedbackSummary.totalFeedback} total feedback`}>
      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_HEADING, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Weekly Feedback Summary
        </Heading>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {adminName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Here's a summary of user feedback for the period: {feedbackSummary.period}
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Feedback Overview
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Row style={{ marginBottom: '12px' }}>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Total Feedback
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '0' }}>
                {feedbackSummary.totalFeedback}
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Period
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {feedbackSummary.period}
              </Text>
            </Column>
          </Row>
        </Section>

        <Section style={{ marginBottom: SPACING.GAP }}>
          <Row>
            <Column style={{ backgroundColor: '#D1FAE5', padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginRight: '8px' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Positive Feedback
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: '#059669', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {feedbackSummary.positiveFeedback}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                {positivePercentage}%
              </Text>
            </Column>
            <Column style={{ backgroundColor: '#FEE2E2', padding: SPACING.PADDING_MOBILE, borderRadius: '4px' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Negative Feedback
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: '#DC2626', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                {feedbackSummary.negativeFeedback}
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                {negativePercentage}%
              </Text>
            </Column>
          </Row>
        </Section>

        {feedbackSummary.averageRating && (
          <Section style={{ marginBottom: SPACING.GAP }}>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0 0 8px 0' }}>
              Average Rating:
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '0' }}>
              {feedbackSummary.averageRating.toFixed(1)} / 5.0
            </Text>
          </Section>
        )}

        {feedbackSummary.topComments && feedbackSummary.topComments.length > 0 && (
          <Section style={{ marginBottom: SPACING.GAP }}>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0 0 12px 0' }}>
              Top Comments:
            </Text>
            {feedbackSummary.topComments.map((comment, index) => (
              <Section 
                key={index}
                style={{ 
                  backgroundColor: COLORS.BACKGROUND_GRAY, 
                  padding: SPACING.PADDING_MOBILE, 
                  borderRadius: '4px', 
                  marginBottom: '8px' 
                }}
              >
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, margin: '0' }}>
                  "{comment}"
                </Text>
              </Section>
            ))}
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
          This is an automated weekly summary. For detailed feedback analysis, please visit the admin dashboard.
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default UserFeedbackSummaryEmail;

