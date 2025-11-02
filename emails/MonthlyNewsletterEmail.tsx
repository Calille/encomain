/**
 * Monthly Newsletter Email Template
 * Marketing email sent monthly
 * 
 * Subject: [Month] Newsletter - The Enclosure Updates
 */
import {
  Text,
  Section,
  Heading,
  Link,
} from '@react-email/components';
import { EmailLayout } from './shared/EmailLayout';
import { EmailButton } from './shared/EmailButton';
import { EmailHeader } from './shared/EmailHeader';
import { EmailFooter } from './shared/EmailFooter';
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';

interface NewsletterItem {
  title: string;
  description: string;
  link?: string;
  imageUrl?: string;
}

interface MonthlyNewsletterEmailProps {
  userName?: string;
  month: string;
  year: number;
  featuredItems: NewsletterItem[];
  unsubscribeUrl: string;
}

export function MonthlyNewsletterEmail({
  userName = 'there',
  month,
  year,
  featuredItems,
  unsubscribeUrl,
}: MonthlyNewsletterEmailProps) {
  return (
    <EmailLayout preview={`The Enclosure ${month} ${year} Newsletter`}>
      <EmailHeader title={`${month} ${year} Newsletter`} subtitle="Updates from The Enclosure" />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We hope this email finds you well! Here's what's new at The Enclosure this month.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        {featuredItems.map((item, index) => (
          <Section key={index} style={{ marginBottom: SPACING.GAP, paddingBottom: SPACING.GAP, borderBottom: index < featuredItems.length - 1 ? `1px solid ${COLORS.BORDER_GRAY}` : 'none' }}>
            <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 12px 0' }}>
              {item.title}
            </Heading>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT, marginBottom: '12px' }}>
              {item.description}
            </Text>
            {item.link && (
              <Text style={{ margin: '0' }}>
                <Link
                  href={item.link}
                  style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline', fontSize: TYPOGRAPHY.FONT_SIZE_BASE }}
                >
                  Read more →
                </Link>
              </Text>
            )}
          </Section>
        ))}
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={BRAND.website}>
          Visit Our Website
        </EmailButton>
      </Section>

      <EmailFooter unsubscribeLink={unsubscribeUrl} />
    </EmailLayout>
  );
}

export default MonthlyNewsletterEmail;

