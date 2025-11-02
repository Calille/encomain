/**
 * Shared Email Button Component
 * Consistent button styling across all emails
 */
import { Button, ButtonProps } from '@react-email/components';
import { COLORS, TYPOGRAPHY, SPACING } from './constants';

interface EmailButtonProps extends Omit<ButtonProps, 'style'> {
  variant?: 'primary' | 'secondary';
}

export function EmailButton({
  children,
  variant = 'primary',
  style,
  ...props
}: EmailButtonProps) {
  const baseStyle = {
    display: 'inline-block',
    padding: '12px 24px',
    fontSize: TYPOGRAPHY.FONT_SIZE_BASE,
    fontWeight: '600',
    textDecoration: 'none',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontFamily: TYPOGRAPHY.FONT_FAMILY,
  };

  const variantStyles = {
    primary: {
      backgroundColor: COLORS.DARK_GREEN,
      color: COLORS.WHITE,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: COLORS.DARK_GREEN,
      border: `2px solid ${COLORS.DARK_GREEN}`,
    },
  };

  return (
    <Button
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

