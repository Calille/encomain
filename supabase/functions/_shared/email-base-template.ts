/**
 * Shared branded HTML email base for all transactional sends.
 * Table-based, fully inlined styles for Gmail and Outlook compatibility.
 */

const BRAND = {
  name: 'The Enclosure',
  website: 'https://theenclosure.co.uk',
  supportEmail: 'hello@theenclosure.co.uk',
  logoUrl: 'https://theenclosure.co.uk/email-logo.png',
};

const COLORS = {
  mint: '#F8FAF9',
  cream: '#FDFCF7',
  ink: '#1A1A1A',
  muted: '#6b7280',
  forest: '#1A4D2E',
  border: '#e5e7eb',
  white: '#FFFFFF',
};

const FONT_BODY =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif";

export type EmailBodyBlock =
  | { type: 'text'; content: string }
  | { type: 'card'; content: Record<string, string> }
  | { type: 'button'; content: { text: string; href: string } }
  | { type: 'divider'; content?: string | Record<string, string> }
  | { type: 'signoff'; content: string };

export interface RenderEmailPayload {
  preheader?: string;
  heading: string;
  subheading?: string;
  bodyBlocks: EmailBodyBlock[];
  footerNote?: string;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderCard(content: Record<string, string>): string {
  const rows = Object.entries(content)
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding: 0 0 14px 0;">
          <p style="margin: 0 0 4px 0; font-family: ${FONT_BODY}; font-size: 13px; font-weight: 600; color: ${COLORS.ink}; line-height: 1.4;">
            ${label}
          </p>
          <p style="margin: 0; font-family: ${FONT_BODY}; font-size: 15px; font-weight: 400; color: ${COLORS.ink}; line-height: 1.5;">
            ${value}
          </p>
        </td>
      </tr>`
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid ${COLORS.border}; background-color: ${COLORS.cream}; border-radius: 8px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;
}

function renderBlock(block: EmailBodyBlock): string {
  switch (block.type) {
    case 'text':
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 0 0 16px 0; font-family: ${FONT_BODY}; font-size: 15px; color: ${COLORS.ink}; line-height: 1.6;">
              ${block.content}
            </td>
          </tr>
        </table>`;

    case 'card':
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 0 0 20px 0;">
              ${renderCard(block.content)}
            </td>
          </tr>
        </table>`;

    case 'button': {
      const { text, href } = block.content;
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 8px 0 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: ${COLORS.forest}; border-radius: 6px;">
                    <a href="${escapeAttr(href)}" style="display: inline-block; padding: 12px 24px; font-family: ${FONT_BODY}; font-size: 15px; font-weight: 600; color: ${COLORS.white}; text-decoration: none; border-radius: 6px;">
                      ${text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    }

    case 'divider':
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 8px 0 20px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid ${COLORS.border}; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;

    case 'signoff':
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 8px 0 8px 0; font-family: ${FONT_BODY}; font-size: 15px; color: ${COLORS.ink}; line-height: 1.6;">
              ${block.content}
            </td>
          </tr>
        </table>`;

    default:
      return '';
  }
}

/**
 * Render a full transactional email using The Enclosure marketing aesthetic.
 */
export function renderEmail(payload: RenderEmailPayload): string {
  const {
    preheader = '',
    heading,
    subheading,
    bodyBlocks,
    footerNote,
  } = payload;

  const blocksHtml = bodyBlocks.map(renderBlock).join('');

  const subheadingHtml = subheading
    ? `<p style="margin: 8px 0 0 0; font-family: ${FONT_BODY}; font-size: 16px; font-weight: 400; color: ${COLORS.muted}; line-height: 1.5;">${subheading}</p>`
    : '';

  const footerNoteHtml = footerNote
    ? `<p style="margin: 0 0 16px 0; font-family: ${FONT_BODY}; font-size: 13px; color: ${COLORS.muted}; line-height: 1.5;">${footerNote}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${heading}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.mint}; font-family: ${FONT_BODY}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: ${COLORS.mint};">
    ${preheader}${'&nbsp;&zwnj;'.repeat(30)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${COLORS.mint}; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: ${COLORS.white}; border: 1px solid ${COLORS.border}; border-radius: 8px;">
          <tr>
            <td style="padding: 32px 32px 0 32px;">
              <img src="${BRAND.logoUrl}" alt="${BRAND.name}" height="40" style="display: block; height: 40px; width: auto; border: 0; outline: none; text-decoration: none; margin: 0 0 24px 0;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <h1 style="margin: 0; font-family: ${FONT_DISPLAY}; font-size: 28px; font-weight: 600; color: ${COLORS.ink}; line-height: 1.25; text-align: left;">
                ${heading}
              </h1>
              ${subheadingHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 8px 32px;">
              ${blocksHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid ${COLORS.border}; padding-top: 24px; text-align: center;">
                    ${footerNoteHtml}
                    <p style="margin: 0 0 8px 0; font-family: ${FONT_BODY}; font-size: 13px; color: ${COLORS.muted}; line-height: 1.5;">
                      &copy; 2026 ${BRAND.name}. All rights reserved.
                    </p>
                    <p style="margin: 0 0 8px 0; font-family: ${FONT_BODY}; font-size: 13px; color: ${COLORS.muted}; line-height: 1.5;">
                      <a href="${BRAND.website}" style="color: ${COLORS.forest}; text-decoration: underline;">theenclosure.co.uk</a>
                    </p>
                    <p style="margin: 0; font-family: ${FONT_BODY}; font-size: 13px; color: ${COLORS.muted}; line-height: 1.5;">
                      Questions? Email us at <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.forest}; text-decoration: underline;">${BRAND.supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
