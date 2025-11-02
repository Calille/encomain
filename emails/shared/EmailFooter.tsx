/**
 * Shared Email Footer Component
 * Standard footer with unsubscribe and company info
 */
import { Section, Text, Link } from '@react-email/components';
import { BRAND, COLORS, TYPOGRAPHY } from './constants';

interface EmailFooterProps {
  unsubscribeLink?: string;
}

export function EmailFooter({ unsubscribeLink }: EmailFooterProps) {
  return (
    <Section style={{ marginTop: '30px', paddingTop: '20px', borderTop: `1px solid ${COLORS.BORDER_GRAY}` }}>
      {unsubscribeLink && (
        <Text
          style={{
            fontSize: TYPOGRAPHY.FONT_SIZE_SMALL,
            color: COLORS.LIGHT_GRAY,
            textAlign: 'center',
            margin: '0 0 12px 0',
          }}
        >
          <Link
            href={unsubscribeLink}
            style={{ color: COLORS.LIGHT_GRAY, textDecoration: 'underline' }}
          >
            Unsubscribe
          </Link>
          {' | '}
          <Link
            href={`${BRAND.website}/settings`}
            style={{ color: COLORS.LIGHT_GRAY, textDecoration: 'underline' }}
          >
            Manage Preferences
          </Link>
        </Text>
      )}
      <Text
        style={{
          fontSize: TYPOGRAPHY.FONT_SIZE_SMALL,
          color: COLORS.LIGHT_GRAY,
          textAlign: 'center',
          margin: '4px 0',
        }}
      >
        This email was sent by {BRAND.name}
      </Text>
    </Section>
  );
}

