/**
 * Simple HTML Email Templates for Edge Functions
 * Since React Email doesn't work directly in Deno, we use simple HTML templates
 */

// Brand constants (inline to avoid import issues)
const BRAND = {
  name: 'The Enclosure',
  domain: 'theenclosure.co.uk',
  website: 'https://theenclosure.co.uk',
  supportEmail: 'hello@theenclosure.co.uk',
};

const COLORS = {
  WHITE: '#FFFFFF',
  DARK_GREEN: '#006400',
  GRAY: '#333333',
  LIGHT_GRAY: '#666666',
  BORDER_GRAY: '#E5E5E5',
};

const LOGO_URL = 'https://theenclosure.co.uk/assets/images/logo.png';

export interface WelcomeEmailData {
  userName?: string;
  loginUrl: string;
  dashboardUrl: string;
}

export function renderWelcomeEmail(data: WelcomeEmailData): string {
  const userName = data.userName || 'there';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Enclosure!</title>
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
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${COLORS.DARK_GREEN}; padding: 40px; border-radius: 4px; margin-bottom: 30px;">
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: bold; margin: 0 0 8px 0; text-align: center;">
                Welcome to The Enclosure!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding-bottom: 30px;">
              <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
                Hi ${userName},
              </p>
              <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
                Thank you for joining The Enclosure! We're thrilled to have you on board and look forward to helping you build something amazing.
              </p>
            </td>
          </tr>
          
          <!-- Get Started Section -->
          <tr>
            <td style="padding-bottom: 30px;">
              <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 0 0 16px 0;">
                Get Started
              </h2>
              <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
                Your account is ready to use. Here's what you can do next:
              </p>
              <ul style="padding-left: 20px; margin: 16px 0; color: ${COLORS.GRAY}; font-size: 16px; line-height: 1.5;">
                <li style="margin-bottom: 8px;">Access your dashboard to view your projects and account details</li>
                <li style="margin-bottom: 8px;">Complete your profile to personalize your experience</li>
                <li style="margin-bottom: 8px;">Explore our services and discover what we can build together</li>
              </ul>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <a href="${data.dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${COLORS.DARK_GREEN}; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600;">
                Go to Dashboard
              </a>
            </td>
          </tr>
          
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

// Brand constants
const BRAND_EXTENDED = {
  ...BRAND,
  ordersEmail: 'orders@theenclosure.co.uk',
  adminEmail: 'admin@theenclosure.co.uk',
  notificationsEmail: 'notifications@theenclosure.co.uk',
};

const COLORS_EXTENDED = {
  ...COLORS,
  BACKGROUND_GRAY: '#F9F9F9',
};

// Helper function to format currency
function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Helper function to format date
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Helper function to format date/time
function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Common email layout wrapper
function createEmailLayout(
  title: string,
  subtitle: string | null,
  content: string,
  ctaText?: string,
  ctaUrl?: string
): string {
  const headerHtml = subtitle
    ? `
      <tr>
        <td style="background-color: ${COLORS.DARK_GREEN}; padding: 40px; border-radius: 4px; margin-bottom: 30px;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: bold; margin: 0 0 8px 0; text-align: center;">
            ${title}
          </h1>
          <p style="color: #FFFFFF; font-size: 16px; margin: 0; text-align: center; opacity: 0.9;">
            ${subtitle}
          </p>
        </td>
      </tr>
    `
    : `
      <tr>
        <td style="background-color: ${COLORS.DARK_GREEN}; padding: 40px; border-radius: 4px; margin-bottom: 30px;">
          <h1 style="color: #FFFFFF; font-size: 24px; font-weight: bold; margin: 0; text-align: center;">
            ${title}
          </h1>
        </td>
      </tr>
    `;

  const ctaHtml = ctaText && ctaUrl
    ? `
      <tr>
        <td align="center" style="padding-bottom: 30px;">
          <a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${COLORS.DARK_GREEN}; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600;">
            ${ctaText}
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
  <title>${title}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; background-color: #FFFFFF; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="${LOGO_URL}" alt="${BRAND.name}" width="180" style="display: block;" />
            </td>
          </tr>
          ${headerHtml}
          <tr>
            <td style="padding-bottom: 30px;">
              ${content}
            </td>
          </tr>
          ${ctaHtml}
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

// Order Confirmation Email
export interface OrderConfirmationEmailData {
  userName?: string;
  order: {
    orderId: string;
    orderNumber: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    tax?: number;
    shipping?: number;
    total: number;
    currency?: string;
    orderDate: string;
    shippingAddress?: {
      name: string;
      street: string;
      city: string;
      postcode: string;
      country: string;
    };
  };
  orderDetailsUrl: string;
}

export function renderOrderConfirmationEmail(data: OrderConfirmationEmailData): string {
  const userName = data.userName || 'Customer';
  const currency = data.order.currency || 'GBP';
  
  const itemsHtml = data.order.items.map(item => `
    <tr style="border-bottom: 1px solid ${COLORS.BORDER_GRAY}; padding-bottom: 12px; margin-bottom: 12px;">
      <td style="padding: 12px 0;">
        <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0; font-weight: bold;">${item.name}</p>
        <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 4px 0 0 0;">Quantity: ${item.quantity}</p>
      </td>
      <td align="right" style="padding: 12px 0;">
        <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0; font-weight: bold;">${formatCurrency(item.total, currency)}</p>
      </td>
    </tr>
  `).join('');

  const shippingAddressHtml = data.order.shippingAddress
    ? `
      <div style="margin-top: 20px;">
        <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 0 0 12px 0;">Shipping Address</h2>
        <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0;">
          ${data.order.shippingAddress.name}<br />
          ${data.order.shippingAddress.street}<br />
          ${data.order.shippingAddress.city} ${data.order.shippingAddress.postcode}<br />
          ${data.order.shippingAddress.country}
        </p>
      </div>
    `
    : '';

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Thank you for your order! We've received your order and will begin processing it shortly.
    </p>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom: 12px;">
            <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 0 0 4px 0;">Order Number</p>
            <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0; font-weight: bold;">${data.order.orderNumber}</p>
          </td>
          <td align="right" style="padding-bottom: 12px;">
            <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 0 0 4px 0;">Order Date</p>
            <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0;">${formatDate(data.order.orderDate)}</p>
          </td>
        </tr>
      </table>
    </div>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 12px 0;">Items Ordered:</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      ${itemsHtml}
    </table>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
      <tr>
        <td><p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 8px 0;">Subtotal:</p></td>
        <td align="right"><p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 8px 0;">${formatCurrency(data.order.subtotal, currency)}</p></td>
      </tr>
      ${data.order.tax !== undefined ? `
      <tr>
        <td><p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 8px 0;">Tax:</p></td>
        <td align="right"><p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 8px 0;">${formatCurrency(data.order.tax, currency)}</p></td>
      </tr>
      ` : ''}
      ${data.order.shipping !== undefined ? `
      <tr>
        <td><p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 8px 0;">Shipping:</p></td>
        <td align="right"><p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 8px 0;">${formatCurrency(data.order.shipping, currency)}</p></td>
      </tr>
      ` : ''}
      <tr>
        <td><p style="font-size: 20px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 8px 0;">Total:</p></td>
        <td align="right"><p style="font-size: 20px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 8px 0;">${formatCurrency(data.order.total, currency)}</p></td>
      </tr>
    </table>
    
    ${shippingAddressHtml}
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      We'll send you another email when your order ships. If you have any questions, please contact us at 
      <a href="mailto:${BRAND_EXTENDED.ordersEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND_EXTENDED.ordersEmail}</a>.
    </p>
  `;

  return createEmailLayout(
    'Order Confirmed!',
    `Order #${data.order.orderNumber}`,
    content,
    'View Order Details',
    data.orderDetailsUrl
  );
}

// Payment Receipt Email
export interface PaymentReceiptEmailData {
  userName?: string;
  payment: {
    transactionId: string;
    invoiceId?: string;
    invoiceNumber?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentDate: string;
    status: string;
  };
  invoiceUrl?: string;
  receiptUrl?: string;
}

export function renderPaymentReceiptEmail(data: PaymentReceiptEmailData): string {
  const userName = data.userName || 'Customer';
  
  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      We've successfully received your payment. This email serves as your receipt.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Payment Details</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 0 0 4px 0;">Transaction ID</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 16px 0; font-weight: bold;">${data.payment.transactionId}</p>
      
      ${data.payment.invoiceNumber ? `
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Invoice Number</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 16px 0;">${data.payment.invoiceNumber}</p>
      ` : ''}
      
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Payment Date</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 16px 0;">${formatDateTime(data.payment.paymentDate)}</p>
      
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Payment Method</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 16px 0;">${data.payment.paymentMethod}</p>
      
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Amount Paid</p>
      <p style="font-size: 24px; color: ${COLORS.DARK_GREEN}; margin: 0; font-weight: bold;">${formatCurrency(data.payment.amount, data.payment.currency)}</p>
    </div>
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      If you have any questions about this payment, please contact us at 
      <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND.supportEmail}</a>.
    </p>
  `;

  const ctaUrl = data.receiptUrl || data.invoiceUrl || '#';
  const ctaText = data.receiptUrl ? 'Download Receipt' : data.invoiceUrl ? 'View Invoice' : undefined;

  return createEmailLayout(
    'Payment Received',
    'Thank you for your payment',
    content,
    ctaText,
    ctaUrl !== '#' ? ctaUrl : undefined
  );
}

// Account Update Notification
export interface AccountUpdateEmailData {
  userName?: string;
  updatedFields: string[];
  updatedAt: string;
  settingsUrl: string;
}

export function renderAccountUpdateEmail(data: AccountUpdateEmailData): string {
  const userName = data.userName || 'there';
  
  const fieldsList = data.updatedFields.map(field => 
    `<li style="margin-bottom: 8px; line-height: 1.5;">${field.replace(/_/g, ' ')}</li>`
  ).join('');

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      We're confirming that your account information has been successfully updated.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Updated Information</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0; font-weight: bold;">The following fields were updated:</p>
      <ul style="padding-left: 20px; margin: 12px 0; color: ${COLORS.GRAY}; font-size: 16px; line-height: 1.5;">
        ${fieldsList}
      </ul>
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 0 0;">
        Updated on: ${formatDateTime(data.updatedAt)}
      </p>
    </div>
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      If you didn't make these changes, please contact us immediately at 
      <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND.supportEmail}</a>.
    </p>
  `;

  return createEmailLayout(
    'Account Updated',
    null,
    content,
    'View Account Settings',
    data.settingsUrl
  );
}

// Account Deletion Confirmation
export interface AccountDeletionEmailData {
  userName?: string;
  deletionDate: string;
  recoveryUrl?: string;
  recoveryExpiryDate?: string;
}

export function renderAccountDeletionEmail(data: AccountDeletionEmailData): string {
  const userName = data.userName || 'there';
  
  const recoverySection = data.recoveryUrl && data.recoveryExpiryDate
    ? `
      <div style="background-color: #FFF9E6; border: 2px solid #FFE066; padding: 20px; border-radius: 4px; margin: 20px 0;">
        <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 12px 0; font-weight: bold;">
          Changed Your Mind?
        </p>
        <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
          You can recover your account before ${formatDateTime(data.recoveryExpiryDate)} by clicking the link below.
        </p>
        <a href="${data.recoveryUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${COLORS.DARK_GREEN}; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600;">
          Recover Account
        </a>
      </div>
    `
    : '';

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      We've received and processed your request to delete your account. Your account will be permanently deleted on 
      <strong>${formatDateTime(data.deletionDate)}</strong>.
    </p>
    
    ${recoverySection}
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      If you have any questions, please contact us at 
      <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND.supportEmail}</a>.
    </p>
  `;

  return createEmailLayout(
    'Account Deletion Confirmed',
    null,
    content
  );
}

// Subscription Renewal Reminder
export interface SubscriptionRenewalEmailData {
  userName?: string;
  subscription: {
    planName: string;
    renewalDate: string;
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
  };
  billingUrl: string;
  updatePaymentMethodUrl?: string;
}

export function renderSubscriptionRenewalEmail(data: SubscriptionRenewalEmailData): string {
  const userName = data.userName || 'Customer';
  const daysUntilRenewal = Math.ceil(
    (new Date(data.subscription.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      This is a friendly reminder that your subscription will automatically renew in <strong>${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}</strong>.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Renewal Details</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Plan:</strong> ${data.subscription.planName}</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Billing Cycle:</strong> ${data.subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Renewal Date:</strong> ${formatDate(data.subscription.renewalDate)}</p>
      <p style="font-size: 20px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 8px 0 0 0;"><strong>Amount:</strong> ${formatCurrency(data.subscription.amount, data.subscription.currency)}</p>
    </div>
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      No action is required if you want to continue your subscription. Your payment method on file will be charged automatically.
    </p>
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      If you need to make changes to your subscription or payment method, please visit your billing settings or contact us at 
      <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND.supportEmail}</a>.
    </p>
  `;

  return createEmailLayout(
    'Subscription Renewal Reminder',
    `Your ${data.subscription.planName} plan renews soon`,
    content,
    'View Billing Details',
    data.billingUrl
  );
}

// Failed Payment Alert
export interface FailedPaymentEmailData {
  userName?: string;
  payment: {
    transactionId: string;
    invoiceNumber?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
  };
  retryDate?: string;
  updatePaymentMethodUrl: string;
  billingUrl: string;
}

export function renderFailedPaymentEmail(data: FailedPaymentEmailData): string {
  const userName = data.userName || 'Customer';
  
  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      We were unable to process your payment. This could be due to insufficient funds, an expired card, or a bank decline.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Payment Details</h2>
    
    <div style="background-color: #FFF5F5; border: 2px solid #FCA5A5; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Amount:</strong> ${formatCurrency(data.payment.amount, data.payment.currency)}</p>
      ${data.payment.invoiceNumber ? `<p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Invoice:</strong> ${data.payment.invoiceNumber}</p>` : ''}
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Payment Method:</strong> ${data.payment.paymentMethod}</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Transaction ID:</strong> ${data.payment.transactionId}</p>
      ${data.retryDate ? `<p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0 0 0;">We will automatically retry this payment on: ${formatDate(data.retryDate)}</p>` : ''}
    </div>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">What You Can Do</h2>
    <ul style="padding-left: 20px; margin: 12px 0; color: ${COLORS.GRAY}; font-size: 16px; line-height: 1.5;">
      <li style="margin-bottom: 8px;">Update your payment method to ensure we can process future payments</li>
      <li style="margin-bottom: 8px;">Contact your bank or card issuer to resolve any issues</li>
      <li style="margin-bottom: 8px;">Ensure sufficient funds are available in your account</li>
    </ul>
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      If you continue to experience issues, please contact us at 
      <a href="mailto:${BRAND.supportEmail}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline;">${BRAND.supportEmail}</a>.
    </p>
  `;

  return createEmailLayout(
    'Payment Failed',
    'Action Required',
    content,
    'Update Payment Method',
    data.updatePaymentMethodUrl
  );
}

// Newsletter
export interface NewsletterEmailData {
  userName?: string;
  month: string;
  year: number;
  featuredItems: Array<{
    title: string;
    description: string;
    link?: string;
  }>;
  unsubscribeUrl: string;
}

export function renderNewsletterEmail(data: NewsletterEmailData): string {
  const userName = data.userName || 'there';
  
  const itemsHtml = data.featuredItems.map(item => `
    <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid ${COLORS.BORDER_GRAY};">
      <h3 style="font-size: 18px; color: ${COLORS.DARK_GREEN}; margin: 0 0 8px 0;">${item.title}</h3>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 8px 0;">${item.description}</p>
      ${item.link ? `<a href="${item.link}" style="color: ${COLORS.DARK_GREEN}; text-decoration: underline; font-size: 16px;">Learn more →</a>` : ''}
    </div>
  `).join('');

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      We hope this email finds you well! Here's what's new at The Enclosure this month.
    </p>
    
    ${itemsHtml}
  `;

  const footerHtml = `
    <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0;">
      <a href="${data.unsubscribeUrl}" style="color: ${COLORS.LIGHT_GRAY}; text-decoration: underline;">Unsubscribe</a> | 
      <a href="${BRAND.website}/settings" style="color: ${COLORS.LIGHT_GRAY}; text-decoration: underline;">Manage Preferences</a>
    </p>
  `;

  return createEmailLayout(
    `${data.month} ${data.year} Newsletter`,
    'Updates from The Enclosure',
    content,
    undefined,
    undefined
  ).replace('</html>', footerHtml + '</html>');
}

// Promotional Offer
export interface PromotionalOfferEmailData {
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

export function renderPromotionalOfferEmail(data: PromotionalOfferEmailData): string {
  const userName = data.userName || 'there';
  
  const discountHtml = data.discount
    ? `
      <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
        ${data.discount.percentage ? `<p style="font-size: 32px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 0 0 8px 0;">${data.discount.percentage}% OFF</p>` : ''}
        ${data.discount.amount ? `<p style="font-size: 24px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 0 0 8px 0;">${formatCurrency(data.discount.amount)} OFF</p>` : ''}
        ${data.discount.code ? `<p style="font-size: 18px; color: ${COLORS.GRAY}; margin: 8px 0 0 0;">Use code: <strong style="color: ${COLORS.DARK_GREEN}; font-family: monospace;">${data.discount.code}</strong></p>` : ''}
      </div>
    `
    : '';

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      ${data.offerDescription}
    </p>
    
    ${discountHtml}
    
    ${data.expiryDate ? `<p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 16px 0; text-align: center;"><strong>Offer expires:</strong> ${formatDate(data.expiryDate)}</p>` : ''}
  `;

  const footerHtml = `
    <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0;">
      <a href="${data.unsubscribeUrl}" style="color: ${COLORS.LIGHT_GRAY}; text-decoration: underline;">Unsubscribe</a> | 
      <a href="${BRAND.website}/settings" style="color: ${COLORS.LIGHT_GRAY}; text-decoration: underline;">Manage Preferences</a>
    </p>
  `;

  return createEmailLayout(
    data.offerTitle,
    'Limited Time Offer',
    content,
    'Claim Offer',
    data.ctaUrl
  ).replace('</html>', footerHtml + '</html>');
}

// Re-engagement
export interface ReengagementEmailData {
  userName?: string;
  lastActivityDate?: string;
  daysSinceLastActivity: number;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export function renderReengagementEmail(data: ReengagementEmailData): string {
  const userName = data.userName || 'there';
  
  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${userName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      We noticed you haven't been active lately, and we wanted to reach out and let you know we're still here for you!
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">What You've Been Missing</h2>
    <ul style="padding-left: 20px; margin: 12px 0; color: ${COLORS.GRAY}; font-size: 16px; line-height: 1.5;">
      <li style="margin-bottom: 8px;">New features and improvements</li>
      <li style="margin-bottom: 8px;">Updates to your projects</li>
      <li style="margin-bottom: 8px;">Special offers and promotions</li>
    </ul>
    
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 20px 0 0 0;">
      We'd love to have you back! Your account is still active and ready for you whenever you return.
    </p>
  `;

  const footerHtml = `
    <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 8px 0;">
      <a href="${data.unsubscribeUrl}" style="color: ${COLORS.LIGHT_GRAY}; text-decoration: underline;">Unsubscribe</a> | 
      <a href="${BRAND.website}/settings" style="color: ${COLORS.LIGHT_GRAY}; text-decoration: underline;">Manage Preferences</a>
    </p>
  `;

  return createEmailLayout(
    'We Miss You!',
    null,
    content,
    'Visit Dashboard',
    data.dashboardUrl
  ).replace('</html>', footerHtml + '</html>');
}

// New User Signup Alert (Admin)
export interface NewUserSignupEmailData {
  adminName?: string;
  userEmail: string;
  userName?: string;
  signupDate: string;
  userRole: string;
  adminDashboardUrl: string;
}

export function renderNewUserSignupEmail(data: NewUserSignupEmailData): string {
  const adminName = data.adminName || 'Admin';
  
  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${adminName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      A new user has signed up for an account.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">User Details</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Email:</strong> ${data.userEmail}</p>
      ${data.userName ? `<p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Name:</strong> ${data.userName}</p>` : ''}
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Role:</strong> ${data.userRole}</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0;"><strong>Signup Date:</strong> ${formatDateTime(data.signupDate)}</p>
    </div>
  `;

  return createEmailLayout(
    'New User Signup',
    `User: ${data.userEmail}`,
    content,
    'View Admin Dashboard',
    data.adminDashboardUrl
  );
}

// New Order Notification (Admin)
export interface NewOrderNotificationEmailData {
  adminName?: string;
  order: {
    orderId: string;
    orderNumber: string;
    items: Array<{ name: string; quantity: number; total: number }>;
    total: number;
    currency?: string;
    orderDate: string;
  };
  adminDashboardUrl: string;
}

export function renderNewOrderNotificationEmail(data: NewOrderNotificationEmailData): string {
  const adminName = data.adminName || 'Admin';
  const currency = data.order.currency || 'GBP';
  
  const itemsList = data.order.items.map(item => 
    `<li style="margin-bottom: 8px;">${item.name} (Qty: ${item.quantity}) - ${formatCurrency(item.total, currency)}</li>`
  ).join('');

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${adminName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      A new order has been placed and requires your attention.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Order Details</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Order Number:</strong> ${data.order.orderNumber}</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Order Date:</strong> ${formatDateTime(data.order.orderDate)}</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 12px 0 8px 0;"><strong>Items:</strong></p>
      <ul style="padding-left: 20px; margin: 8px 0; color: ${COLORS.GRAY}; font-size: 16px;">
        ${itemsList}
      </ul>
      <p style="font-size: 20px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 12px 0 0 0;"><strong>Total:</strong> ${formatCurrency(data.order.total, currency)}</p>
    </div>
  `;

  return createEmailLayout(
    'New Order Received',
    `Order #${data.order.orderNumber}`,
    content,
    'View Admin Dashboard',
    data.adminDashboardUrl
  );
}

// System Error Notification (Admin)
export interface SystemErrorEmailData {
  adminName?: string;
  errorType: string;
  errorMessage: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  adminDashboardUrl: string;
}

export function renderSystemErrorEmail(data: SystemErrorEmailData): string {
  const adminName = data.adminName || 'Admin';
  
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

  const contextHtml = data.context && Object.keys(data.context).length > 0
    ? `
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 12px 0 8px 0; font-weight: bold;">Additional Context:</p>
      <pre style="font-size: 14px; color: ${COLORS.GRAY}; background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 16px; border-radius: 4px; margin: 0; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(data.context, null, 2)}</pre>
    `
    : '';

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${adminName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      A system error has been detected that requires your attention.
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Error Details</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 0 0 4px 0;">Severity</p>
      <p style="font-size: 16px; color: ${severityColors[data.severity]}; font-weight: bold; margin: 0 0 12px 0;">${severityLabels[data.severity]}</p>
      
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Error Type</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 12px 0;">${data.errorType}</p>
      
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Timestamp</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 12px 0;">${formatDateTime(data.timestamp)}</p>
      
      <p style="font-size: 14px; color: ${COLORS.LIGHT_GRAY}; margin: 12px 0 4px 0;">Error Message</p>
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0; background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 12px; border-radius: 4px;">${data.errorMessage}</p>
      
      ${contextHtml}
    </div>
  `;

  return createEmailLayout(
    'System Error Alert',
    `${severityLabels[data.severity]} Severity`,
    content,
    'View Admin Dashboard',
    data.adminDashboardUrl
  );
}

// User Feedback Summary (Admin)
export interface UserFeedbackSummaryEmailData {
  adminName?: string;
  feedbackSummary: {
    period: string;
    totalFeedback: number;
    positiveFeedback: number;
    negativeFeedback: number;
    averageRating?: number;
    topComments?: string[];
  };
  adminDashboardUrl: string;
}

export function renderUserFeedbackSummaryEmail(data: UserFeedbackSummaryEmailData): string {
  const adminName = data.adminName || 'Admin';
  const summary = data.feedbackSummary;
  const positivePercentage = summary.totalFeedback > 0
    ? Math.round((summary.positiveFeedback / summary.totalFeedback) * 100)
    : 0;
  const negativePercentage = summary.totalFeedback > 0
    ? Math.round((summary.negativeFeedback / summary.totalFeedback) * 100)
    : 0;

  const topCommentsHtml = summary.topComments && summary.topComments.length > 0
    ? `
      <h3 style="font-size: 18px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 12px 0;">Top Comments:</h3>
      ${summary.topComments.map(comment => `
        <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 16px; border-radius: 4px; margin-bottom: 12px;">
          <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0;">"${comment}"</p>
        </div>
      `).join('')}
    `
    : '';

  const content = `
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Hi ${adminName},
    </p>
    <p style="font-size: 16px; color: ${COLORS.GRAY}; line-height: 1.5; margin: 0 0 16px 0;">
      Here's a summary of user feedback for the period: ${summary.period}
    </p>
    
    <h2 style="font-size: 20px; color: ${COLORS.DARK_GREEN}; margin: 20px 0 16px 0;">Feedback Overview</h2>
    
    <div style="background-color: ${COLORS_EXTENDED.BACKGROUND_GRAY}; padding: 20px; border-radius: 4px; margin: 20px 0;">
      <p style="font-size: 16px; color: ${COLORS.GRAY}; margin: 0 0 8px 0;"><strong>Total Feedback:</strong> ${summary.totalFeedback}</p>
      <p style="font-size: 16px; color: #059669; margin: 0 0 8px 0;"><strong>Positive:</strong> ${summary.positiveFeedback} (${positivePercentage}%)</p>
      <p style="font-size: 16px; color: #DC2626; margin: 0 0 8px 0;"><strong>Negative:</strong> ${summary.negativeFeedback} (${negativePercentage}%)</p>
      ${summary.averageRating ? `<p style="font-size: 18px; color: ${COLORS.DARK_GREEN}; font-weight: bold; margin: 12px 0 0 0;"><strong>Average Rating:</strong> ${summary.averageRating.toFixed(1)} / 5.0</p>` : ''}
    </div>
    
    ${topCommentsHtml}
  `;

  return createEmailLayout(
    'Weekly Feedback Summary',
    `Period: ${summary.period}`,
    content,
    'View Admin Dashboard',
    data.adminDashboardUrl
  );
}

