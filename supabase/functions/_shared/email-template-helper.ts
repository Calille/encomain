/**
 * Email Template Helper
 * Reusable functions for creating consistent email HTML
 */

const BRAND = {
  name: 'The Enclosure',
  website: 'https://theenclosure.co.uk',
  supportEmail: 'hello@theenclosure.co.uk',
  ordersEmail: 'orders@theenclosure.co.uk',
};

const COLORS = {
  WHITE: '#FFFFFF',
  DARK_GREEN: '#006400',
  GRAY: '#333333',
  LIGHT_GRAY: '#666666',
  BORDER_GRAY: '#E5E5E5',
  BACKGROUND_GRAY: '#F9F9F9',
};

const LOGO_URL = 'https://theenclosure.co.uk/assets/images/logo.png';

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface EmailLayoutOptions {
  title?: string;
  subtitle?: string;
  preview?: string;
  content: string;
  cta?: {
    text: string;
    url: string;
  };
  footer?: string;
}

export function createEmailLayout(options: EmailLayoutOptions): string {
  const headerSection = options.title
    ? `
      <!-- Header -->
      <tr>
        <td style="background-color: ${COLORS.DARK_GREEN}; padding: 40px; border-radius: 4px; margin-bottom: 30px;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: bold; margin: 0 0 8px 0; text-align: center;">
            ${options.title}
          </h1>
          ${options.subtitle ? `<p style="color: #FFFFFF; font-size: 16px; margin: 0; text-align: center; opacity: 0.9;">${options.subtitle}</p>` : ''}
        </td>
      </tr>
    `
    : '';

  const ctaSection = options.cta
    ? `
      <!-- CTA Button -->
      <tr>
        <td align="center" style="padding-bottom: 30px;">
          <a href="${options.cta.url}" style="display: inline-block; padding: 12px 24px; background-color: ${COLORS.DARK_GREEN}; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600;">
            ${options.cta.text}
          </a>
        </td>
      </tr>
    `
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || BRAND.name}</title>
  ${options.preview ? `<meta name="description" content="${options.preview}">` : ''}
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #FFFFFF; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="${LOGO_URL}" alt="${BRAND.name}" width="180" style="display: block;" />
            </td>
          </tr>
          ${headerSection}
          
          <!-- Content -->
          <tr>
            <td style="padding-bottom: 30px;">
              ${options.content}
            </td>
          </tr>
          ${ctaSection}
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid ${COLORS.BORDER_GRAY}; padding-top: 30px; text-align: center;">
              <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0;">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
              <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0;">
                <a href="${BRAND.website}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">
                  ${BRAND.website.replace('https://', '')}
                </a>
              </p>
              <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0;">
                Questions? Email us at <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND.supportEmail}</a>
              </p>
              ${options.footer || ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

