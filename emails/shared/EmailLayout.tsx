/**
 * Shared Email Layout Component
 * Base layout for all email templates with consistent branding
 */
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Link,
  Text,
  Hr,
} from '@react-email/components';
import {
  BRAND,
  COLORS,
  TYPOGRAPHY,
  SPACING,
  EMAIL_WIDTH,
  LOGO_URL,
} from './constants';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: TYPOGRAPHY.FONT_FAMILY, backgroundColor: COLORS.WHITE }}>
        <Container
          style={{
            maxWidth: EMAIL_WIDTH,
            margin: '0 auto',
            backgroundColor: COLORS.WHITE,
            padding: SPACING.PADDING,
          }}
        >
          {/* Logo */}
          <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
            <Img
              src={LOGO_URL}
              alt={BRAND.name}
              width="180"
              height="auto"
              style={{ margin: '0 auto' }}
            />
          </Section>

          {/* Preview Text */}
          {preview && (
            <Text style={{ display: 'none', fontSize: '1px', color: COLORS.WHITE }}>
              {preview}
            </Text>
          )}

          {/* Main Content */}
          {children}

          {/* Footer */}
          <Hr style={{ borderColor: COLORS.BORDER_GRAY, marginTop: SPACING.SECTION_SPACING }} />
          <Section style={{ textAlign: 'center', paddingTop: SPACING.SECTION_SPACING }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.FONT_SIZE_SMALL,
                color: COLORS.LIGHT_GRAY,
                margin: '8px 0',
              }}
            >
              © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.FONT_SIZE_SMALL,
                color: COLORS.LIGHT_GRAY,
                margin: '8px 0',
              }}
            >
              <Link href={BRAND.website} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
                {BRAND.website.replace('https://', '')}
              </Link>
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.FONT_SIZE_SMALL,
                color: COLORS.LIGHT_GRAY,
                margin: '8px 0',
              }}
            >
              Questions? Email us at{' '}
              <Link
                href={`mailto:${BRAND.supportEmail}`}
                style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}
              >
                {BRAND.supportEmail}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

