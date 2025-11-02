/**
 * Shared Email Header Component
 * Optional dark green header section for emphasis
 */
import { Section, Text } from '@react-email/components';
import { COLORS, TYPOGRAPHY, SPACING } from './constants';

interface EmailHeaderProps {
  title: string;
  subtitle?: string;
}

export function EmailHeader({ title, subtitle }: EmailHeaderProps) {
  return (
    <Section
      style={{
        backgroundColor: COLORS.DARK_GREEN,
        color: COLORS.WHITE,
        padding: SPACING.PADDING,
        borderRadius: '4px',
        marginBottom: SPACING.SECTION_SPACING,
      }}
    >
      <Text
        style={{
          fontSize: TYPOGRAPHY.FONT_SIZE_HEADING,
          fontWeight: 'bold',
          color: COLORS.WHITE,
          margin: '0 0 8px 0',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: TYPOGRAPHY.FONT_SIZE_BASE,
            color: COLORS.WHITE,
            margin: '0',
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          {subtitle}
        </Text>
      )}
    </Section>
  );
}

