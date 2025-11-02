/**
 * Promotional Offer Email Template
 * Marketing email for special offers and promotions
 * 
 * Subject: Special Offer: [Offer Title]
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

interface PromotionalOfferEmailProps {
  userName?: string;
  offerTitle: string;
  offerDescription: string;
  discount?: {
    percentage?: number;
    amount?: number;
    code?: string;
  };
  expiryDate?: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}

export function PromotionalOfferEmail({
  userName = 'there',
  offerTitle,
  offerDescription,
  discount,
  expiryDate,
  ctaUrl,
  unsubscribeUrl,
}: PromotionalOfferEmailProps) {
  return (
    <EmailLayout preview={`Special offer: ${offerTitle}`}>
      <EmailHeader title={offerTitle} subtitle="Limited Time Offer" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          {offerDescription}
        </Text>
      </Section>

      {discount && (
        <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
          <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', textAlign: 'center' }}>
            {discount.percentage && (
              <Text style={{ fontSize: '36px', fontWeight: 'bold', color: COLORS.DARK_GREEN, margin: '0 0 8px 0' }}>
                {discount.percentage}% OFF
              </Text>
            )}
            {discount.amount && (
              <Text style={{ fontSize: '36px', fontWeight: 'bold', color: COLORS.DARK_GREEN, margin: '0 0 8px 0' }}>
                £{discount.amount} OFF
              </Text>
            )}
            {discount.code && (
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.GRAY, margin: '8px 0 0 0' }}>
                Use code: <strong style={{ color: COLORS.DARK_GREEN }}>{discount.code}</strong>
              </Text>
            )}
          </Section>
        </Section>
      )}

      {expiryDate && (
        <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, textAlign: 'center' }}>
            <strong>Offer expires:</strong>{' '}
            {new Date(expiryDate).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={ctaUrl}>
          Claim Offer Now
        </EmailButton>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Don't miss out on this exclusive offer! If you have any questions, feel free to contact us.
        </Text>
      </Section>

      <EmailFooter unsubscribeLink={unsubscribeUrl} />
    </EmailLayout>
  );
}

export default PromotionalOfferEmail;

