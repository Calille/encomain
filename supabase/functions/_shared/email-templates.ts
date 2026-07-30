/**
 * Typed transactional email payloads.
 * All HTML is produced via the shared branded base in email-base-template.ts.
 */
import { renderEmail, type EmailBodyBlock } from './email-base-template.ts';

const BRAND = {
  name: 'The Enclosure',
  website: 'https://theenclosure.co.uk',
  supportEmail: 'hello@theenclosure.co.uk',
};

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function p(text: string): string {
  return `<p style="margin: 0 0 12px 0;">${text}</p>`;
}

function mailtoLink(email: string = BRAND.supportEmail): string {
  return `<a href="mailto:${email}" style="color: #1A4D2E; text-decoration: underline;">${email}</a>`;
}

// ---------------------------------------------------------------------------
// Welcome
// ---------------------------------------------------------------------------

export interface WelcomeEmailData {
  userName?: string;
  /** Supabase recovery / set-password action link */
  recoveryUrl: string;
}

export function renderWelcomeEmail(data: WelcomeEmailData): string {
  const userName = data.userName || 'there';
  const recoveryUrl = data.recoveryUrl;

  return renderEmail({
    preheader: 'Set your password to get started.',
    heading: 'Welcome to The Enclosure',
    bodyBlocks: [
      {
        type: 'text',
        content: p(
          `Hi ${userName}, your account is ready. Set your password using the button below to sign in for the first time.`
        ),
      },
      {
        type: 'button',
        content: { text: 'Set your password', href: recoveryUrl },
      },
      {
        type: 'text',
        content: p(
          'This link expires in 7 days. If it does expire, email <a href="mailto:hello@theenclosure.co.uk" style="color: #1A4D2E; text-decoration: underline;">hello@theenclosure.co.uk</a> and we\'ll send a new one.'
        ),
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('Josh and Will at The Enclosure'),
      },
    ],
    footerNote:
      'If you did not expect this account, please contact us at <a href="mailto:hello@theenclosure.co.uk" style="color: #1A4D2E; text-decoration: underline;">hello@theenclosure.co.uk</a> so we can look into it.',
  });
}

// ---------------------------------------------------------------------------
// Order confirmation
// ---------------------------------------------------------------------------

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
  const userName = data.userName || 'there';
  const currency = data.order.currency || 'GBP';

  const itemsText = data.order.items
    .map(
      (item) =>
        `${item.name} (qty ${item.quantity}) - ${formatCurrency(item.total, currency)}`
    )
    .join('<br />');

  const card: Record<string, string> = {
    'Order number': data.order.orderNumber,
    'Order date': formatDate(data.order.orderDate),
    Items: itemsText,
    Subtotal: formatCurrency(data.order.subtotal, currency),
  };
  if (data.order.tax !== undefined) {
    card.Tax = formatCurrency(data.order.tax, currency);
  }
  if (data.order.shipping !== undefined) {
    card.Shipping = formatCurrency(data.order.shipping, currency);
  }
  card.Total = formatCurrency(data.order.total, currency);

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content:
        p(`Hi ${userName},`) +
        p('Thank you for your order. We have received it and will begin processing shortly.'),
    },
    { type: 'card', content: card },
  ];

  if (data.order.shippingAddress) {
    const a = data.order.shippingAddress;
    blocks.push({
      type: 'card',
      content: {
        'Shipping address': `${a.name}<br />${a.street}<br />${a.city} ${a.postcode}<br />${a.country}`,
      },
    });
  }

  blocks.push(
    {
      type: 'text',
      content: p(
        `We will send another email when your order ships. If you have any questions, contact us at ${mailtoLink()}.`
      ),
    },
    {
      type: 'button',
      content: { text: 'View order details', href: data.orderDetailsUrl },
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('The Enclosure team'),
    }
  );

  return renderEmail({
    preheader: `Order ${data.order.orderNumber} confirmed`,
    heading: 'Order confirmed',
    subheading: `Order ${data.order.orderNumber}`,
    bodyBlocks: blocks,
  });
}

// ---------------------------------------------------------------------------
// Payment receipt
// ---------------------------------------------------------------------------

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
  const userName = data.userName || 'there';

  const card: Record<string, string> = {
    'Transaction ID': data.payment.transactionId,
  };
  if (data.payment.invoiceNumber) {
    card['Invoice number'] = data.payment.invoiceNumber;
  }
  card['Payment date'] = formatDateTime(data.payment.paymentDate);
  card['Payment method'] = data.payment.paymentMethod;
  card['Amount paid'] = formatCurrency(data.payment.amount, data.payment.currency);

  const ctaUrl = data.receiptUrl || data.invoiceUrl;
  const ctaText = data.receiptUrl
    ? 'Download receipt'
    : data.invoiceUrl
      ? 'View invoice'
      : undefined;

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content:
        p(`Hi ${userName},`) +
        p('We have successfully received your payment. This email is your receipt.'),
    },
    { type: 'card', content: card },
    {
      type: 'text',
      content: p(
        `If you have any questions about this payment, contact us at ${mailtoLink()}.`
      ),
    },
  ];

  if (ctaUrl && ctaText) {
    blocks.push({ type: 'button', content: { text: ctaText, href: ctaUrl } });
  }

  blocks.push({
    type: 'signoff',
    content: p('Cheers,') + p('The Enclosure team'),
  });

  return renderEmail({
    preheader: 'Payment received. Your receipt is inside.',
    heading: 'Payment received',
    subheading: 'Thank you for your payment',
    bodyBlocks: blocks,
  });
}

// ---------------------------------------------------------------------------
// Account update
// ---------------------------------------------------------------------------

export interface AccountUpdateEmailData {
  userName?: string;
  updatedFields: string[];
  updatedAt: string;
  settingsUrl: string;
}

export function renderAccountUpdateEmail(data: AccountUpdateEmailData): string {
  const userName = data.userName || 'there';
  const fieldsList = data.updatedFields
    .map((field) => field.replace(/_/g, ' '))
    .join(', ');

  return renderEmail({
    preheader: 'Your account details were updated',
    heading: 'Account updated',
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${userName},`) +
          p('We are confirming that your account information has been successfully updated.'),
      },
      {
        type: 'card',
        content: {
          'Updated fields': fieldsList,
          'Updated on': formatDateTime(data.updatedAt),
        },
      },
      {
        type: 'text',
        content: p(
          `If you did not make these changes, contact us straight away at ${mailtoLink()}.`
        ),
      },
      {
        type: 'button',
        content: { text: 'View account settings', href: data.settingsUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Account deletion
// ---------------------------------------------------------------------------

export interface AccountDeletionEmailData {
  userName?: string;
  deletionDate: string;
  recoveryUrl?: string;
  recoveryExpiryDate?: string;
}

export function renderAccountDeletionEmail(data: AccountDeletionEmailData): string {
  const userName = data.userName || 'there';
  const expiryLabel = data.recoveryExpiryDate
    ? formatDateTime(data.recoveryExpiryDate)
    : formatDateTime(data.deletionDate);

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content:
        p(`Hi ${userName},`) +
        p(
          `You (or an admin acting on your behalf) requested account deletion. Your account is deactivated and will be permanently deleted on <strong>${expiryLabel}</strong>. If you change your mind, use the link below to restore your account before then.`
        ),
    },
  ];

  if (data.recoveryUrl && data.recoveryExpiryDate) {
    blocks.push(
      {
        type: 'card',
        content: {
          'Recovery expires': formatDateTime(data.recoveryExpiryDate),
        },
      },
      {
        type: 'button',
        content: { text: 'Recover account', href: data.recoveryUrl },
      }
    );
  }

  blocks.push(
    {
      type: 'text',
      content: p(
        `If you did not request this, contact us straight away at ${mailtoLink()}.`
      ),
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('The Enclosure team'),
    },
  );

  return renderEmail({
    preheader: 'Your account has been deactivated. Recovery details inside.',
    heading: 'Account deletion confirmed',
    bodyBlocks: blocks,
  });
}

// ---------------------------------------------------------------------------
// Subscription renewal
// ---------------------------------------------------------------------------

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
  const userName = data.userName || 'there';
  const daysUntilRenewal = Math.ceil(
    (new Date(data.subscription.renewalDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const dayWord = daysUntilRenewal === 1 ? 'day' : 'days';

  return renderEmail({
    preheader: `Your ${data.subscription.planName} plan renews soon`,
    heading: 'Subscription renewal reminder',
    subheading: `Your ${data.subscription.planName} plan renews soon`,
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${userName},`) +
          p(
            `This is a friendly reminder that your subscription will automatically renew in <strong>${daysUntilRenewal} ${dayWord}</strong>.`
          ),
      },
      {
        type: 'card',
        content: {
          Plan: data.subscription.planName,
          'Billing cycle':
            data.subscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly',
          'Renewal date': formatDate(data.subscription.renewalDate),
          Amount: formatCurrency(data.subscription.amount, data.subscription.currency),
        },
      },
      {
        type: 'text',
        content:
          p(
            'No action is required if you want to continue. Your payment method on file will be charged automatically.'
          ) +
          p(
            `If you need to make changes, visit your billing settings or contact us at ${mailtoLink()}.`
          ),
      },
      {
        type: 'button',
        content: { text: 'View billing details', href: data.billingUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Failed payment
// ---------------------------------------------------------------------------

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
  const userName = data.userName || 'there';

  const card: Record<string, string> = {
    Amount: formatCurrency(data.payment.amount, data.payment.currency),
  };
  if (data.payment.invoiceNumber) {
    card.Invoice = data.payment.invoiceNumber;
  }
  card['Payment method'] = data.payment.paymentMethod;
  card['Transaction ID'] = data.payment.transactionId;
  if (data.retryDate) {
    card['Automatic retry'] = formatDate(data.retryDate);
  }

  return renderEmail({
    preheader: 'We could not process your payment. Please update your details.',
    heading: 'Payment failed',
    subheading: 'Action required',
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${userName},`) +
          p(
            'We were unable to process your payment. This could be due to insufficient funds, an expired card, or a bank decline.'
          ),
      },
      { type: 'card', content: card },
      {
        type: 'text',
        content:
          p('What you can do:') +
          p(
            'Update your payment method, contact your bank or card issuer if needed, and ensure sufficient funds are available.'
          ) +
          p(`If you continue to experience issues, contact us at ${mailtoLink()}.`),
      },
      {
        type: 'button',
        content: { text: 'Update payment method', href: data.updatePaymentMethodUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

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

  const itemBlocks: EmailBodyBlock[] = data.featuredItems.map((item) => ({
    type: 'text' as const,
    content:
      `<p style="margin: 0 0 4px 0; font-weight: 600;">${item.title}</p>` +
      p(item.description) +
      (item.link
        ? `<p style="margin: 0 0 12px 0;"><a href="${item.link}" style="color: #1A4D2E; text-decoration: underline;">Learn more</a></p>`
        : ''),
  }));

  return renderEmail({
    preheader: `Updates from The Enclosure for ${data.month} ${data.year}`,
    heading: `${data.month} ${data.year} newsletter`,
    subheading: 'Updates from The Enclosure',
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${userName},`) +
          p('Here is what is new at The Enclosure this month.'),
      },
      ...itemBlocks,
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
    footerNote: `<a href="${data.unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | <a href="${BRAND.website}/settings" style="color: #6b7280; text-decoration: underline;">Manage preferences</a>`,
  });
}

// ---------------------------------------------------------------------------
// Promotional offer
// ---------------------------------------------------------------------------

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

  const discountCard: Record<string, string> = {};
  if (data.discount?.percentage) {
    discountCard.Discount = `${data.discount.percentage}% off`;
  }
  if (data.discount?.amount) {
    discountCard.Saving = `${formatCurrency(data.discount.amount)} off`;
  }
  if (data.discount?.code) {
    discountCard['Promo code'] = data.discount.code;
  }
  if (data.expiryDate) {
    discountCard['Offer expires'] = formatDate(data.expiryDate);
  }

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content: p(`Hi ${userName},`) + p(data.offerDescription),
    },
  ];

  if (Object.keys(discountCard).length > 0) {
    blocks.push({ type: 'card', content: discountCard });
  }

  blocks.push(
    {
      type: 'button',
      content: { text: 'Claim offer', href: data.ctaUrl },
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('The Enclosure team'),
    }
  );

  return renderEmail({
    preheader: data.offerTitle,
    heading: data.offerTitle,
    subheading: 'Limited time offer',
    bodyBlocks: blocks,
    footerNote: `<a href="${data.unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | <a href="${BRAND.website}/settings" style="color: #6b7280; text-decoration: underline;">Manage preferences</a>`,
  });
}

// ---------------------------------------------------------------------------
// Re-engagement
// ---------------------------------------------------------------------------

export interface ReengagementEmailData {
  userName?: string;
  lastActivityDate?: string;
  daysSinceLastActivity: number;
  dashboardUrl: string;
  unsubscribeUrl: string;
}

export function renderReengagementEmail(data: ReengagementEmailData): string {
  const userName = data.userName || 'there';

  return renderEmail({
    preheader: 'We noticed you have been away. Your account is still here.',
    heading: 'We miss you',
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${userName},`) +
          p(
            'We noticed you have not been active lately, and wanted to let you know we are still here for you.'
          ) +
          p(
            'Your account remains active. New features, project updates, and offers may be waiting when you return.'
          ),
      },
      {
        type: 'button',
        content: { text: 'Visit dashboard', href: data.dashboardUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
    footerNote: `<a href="${data.unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> | <a href="${BRAND.website}/settings" style="color: #6b7280; text-decoration: underline;">Manage preferences</a>`,
  });
}

// ---------------------------------------------------------------------------
// New user signup (admin)
// ---------------------------------------------------------------------------

export interface NewUserSignupEmailData {
  adminName?: string;
  userEmail: string;
  userName?: string;
  signupDate: string;
  userRole: string;
  adminDashboardUrl: string;
}

export function renderNewUserSignupEmail(data: NewUserSignupEmailData): string {
  const adminName = data.adminName || 'there';

  const card: Record<string, string> = {
    Email: data.userEmail,
  };
  if (data.userName) {
    card.Name = data.userName;
  }
  card.Role = data.userRole;
  card['Signup date'] = formatDateTime(data.signupDate);

  return renderEmail({
    preheader: `New signup: ${data.userEmail}`,
    heading: 'New user signup',
    subheading: `User: ${data.userEmail}`,
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${adminName},`) + p('A new user has signed up for an account.'),
      },
      { type: 'card', content: card },
      {
        type: 'button',
        content: { text: 'View admin dashboard', href: data.adminDashboardUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// New order notification (admin)
// ---------------------------------------------------------------------------

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

export function renderNewOrderNotificationEmail(
  data: NewOrderNotificationEmailData
): string {
  const adminName = data.adminName || 'there';
  const currency = data.order.currency || 'GBP';

  const itemsText = data.order.items
    .map(
      (item) =>
        `${item.name} (qty ${item.quantity}) - ${formatCurrency(item.total, currency)}`
    )
    .join('<br />');

  return renderEmail({
    preheader: `New order ${data.order.orderNumber}`,
    heading: 'New order received',
    subheading: `Order ${data.order.orderNumber}`,
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${adminName},`) +
          p('A new order has been placed and requires your attention.'),
      },
      {
        type: 'card',
        content: {
          'Order number': data.order.orderNumber,
          'Order date': formatDateTime(data.order.orderDate),
          Items: itemsText,
          Total: formatCurrency(data.order.total, currency),
        },
      },
      {
        type: 'button',
        content: { text: 'View admin dashboard', href: data.adminDashboardUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// System error (admin)
// ---------------------------------------------------------------------------

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
  const adminName = data.adminName || 'there';

  const severityLabels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const card: Record<string, string> = {
    Severity: severityLabels[data.severity],
    'Error type': data.errorType,
    Timestamp: formatDateTime(data.timestamp),
    'Error message': data.errorMessage,
  };

  if (data.context && Object.keys(data.context).length > 0) {
    card.Context = `<pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;font-size:13px;">${JSON.stringify(data.context, null, 2)}</pre>`;
  }

  return renderEmail({
    preheader: `${severityLabels[data.severity]} system error detected`,
    heading: 'System error alert',
    subheading: `${severityLabels[data.severity]} severity`,
    bodyBlocks: [
      {
        type: 'text',
        content:
          p(`Hi ${adminName},`) +
          p('A system error has been detected that requires your attention.'),
      },
      { type: 'card', content: card },
      {
        type: 'button',
        content: { text: 'View admin dashboard', href: data.adminDashboardUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Feedback summary (admin)
// ---------------------------------------------------------------------------

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

export function renderUserFeedbackSummaryEmail(
  data: UserFeedbackSummaryEmailData
): string {
  const adminName = data.adminName || 'there';
  const summary = data.feedbackSummary;
  const positivePercentage =
    summary.totalFeedback > 0
      ? Math.round((summary.positiveFeedback / summary.totalFeedback) * 100)
      : 0;
  const negativePercentage =
    summary.totalFeedback > 0
      ? Math.round((summary.negativeFeedback / summary.totalFeedback) * 100)
      : 0;

  const card: Record<string, string> = {
    'Total feedback': String(summary.totalFeedback),
    Positive: `${summary.positiveFeedback} (${positivePercentage}%)`,
    Negative: `${summary.negativeFeedback} (${negativePercentage}%)`,
  };
  if (summary.averageRating) {
    card['Average rating'] = `${summary.averageRating.toFixed(1)} / 5.0`;
  }

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content:
        p(`Hi ${adminName},`) +
        p(`Here is a summary of user feedback for the period: ${summary.period}`),
    },
    { type: 'card', content: card },
  ];

  if (summary.topComments && summary.topComments.length > 0) {
    blocks.push({
      type: 'card',
      content: {
        'Top comments': summary.topComments.map((c) => `&ldquo;${c}&rdquo;`).join('<br /><br />'),
      },
    });
  }

  blocks.push(
    {
      type: 'button',
      content: { text: 'View admin dashboard', href: data.adminDashboardUrl },
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('The Enclosure team'),
    }
  );

  return renderEmail({
    preheader: `Feedback summary for ${summary.period}`,
    heading: 'Weekly feedback summary',
    subheading: `Period: ${summary.period}`,
    bodyBlocks: blocks,
  });
}

// ---------------------------------------------------------------------------
// Support tickets
// ---------------------------------------------------------------------------

export interface NewTicketAdminEmailData {
  subject: string;
  category: string;
  clientEmail: string;
  clientName?: string;
  ticketUrl: string;
  ticketId: string;
}

export function renderNewTicketAdminEmail(data: NewTicketAdminEmailData): string {
  const clientLabel = data.clientName
    ? `${data.clientName} (${data.clientEmail})`
    : data.clientEmail;

  return renderEmail({
    preheader: `New support ticket: ${data.subject}`,
    heading: 'New support ticket',
    subheading: data.subject,
    bodyBlocks: [
      {
        type: 'text',
        content: p('A new support ticket has been submitted.'),
      },
      {
        type: 'card',
        content: {
          Subject: data.subject,
          Category: data.category,
          Client: clientLabel,
          'Ticket ID': data.ticketId,
        },
      },
      {
        type: 'button',
        content: { text: 'View support tickets', href: data.ticketUrl },
      },
      {
        type: 'signoff',
        content: p('Cheers,') + p('The Enclosure team'),
      },
    ],
  });
}

export interface TicketResponseClientEmailData {
  clientName?: string;
  subject: string;
  responsePreview?: string;
  ticketUrl: string;
}

export function renderTicketResponseClientEmail(
  data: TicketResponseClientEmailData
): string {
  const name = data.clientName || 'there';

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content:
        p(`Hi ${name},`) +
        p(
          `We have replied to your support request: <strong>${data.subject}</strong>.`
        ),
    },
  ];

  if (data.responsePreview) {
    blocks.push({
      type: 'card',
      content: { Reply: data.responsePreview },
    });
  }

  blocks.push(
    {
      type: 'text',
      content: p('You can view the full conversation in your dashboard.'),
    },
    {
      type: 'button',
      content: { text: 'View your ticket', href: data.ticketUrl },
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('The Enclosure team'),
    }
  );

  return renderEmail({
    preheader: `Update on your support request: ${data.subject}`,
    heading: 'Support update',
    subheading: data.subject,
    bodyBlocks: blocks,
  });
}

// ---------------------------------------------------------------------------
// Payment reminder (levels 1-4)
// ---------------------------------------------------------------------------

export interface PaymentReminderEmailData {
  userName?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  reminderLevel: 1 | 2 | 3 | 4;
  paymentUrl?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
}

const PAYMENT_REMINDER_COPY: Record<
  1 | 2 | 3 | 4,
  { subject: string; heading: string; intro: string; closing: string }
> = {
  1: {
    subject: 'Just a friendly reminder',
    heading: 'A friendly payment reminder',
    intro:
      'Just a friendly reminder in case this slipped through. Payment for the invoice below is still outstanding. If you have already paid, please disregard this message.',
    closing:
      'If you have any questions about this invoice, reply to this email or contact us at',
  },
  2: {
    subject: 'Your invoice is now overdue',
    heading: 'Your invoice is now overdue',
    intro:
      'Our records show that the invoice below is now overdue. Please arrange payment at your earliest convenience, or let us know when we can expect payment.',
    closing:
      'We would appreciate an update so we can keep your account in good order. Contact us at',
  },
  3: {
    subject: 'Final reminder before escalation',
    heading: 'Final reminder before we escalate',
    intro:
      'This is a final reminder before we escalate. The invoice below remains unpaid. Continued non-payment may affect ongoing services. Please settle the balance, or contact us immediately to discuss.',
    closing: 'Please treat this as a clear deadline for payment. Reach us at',
  },
  4: {
    subject: 'Account escalation notice',
    heading: 'Account escalation notice',
    intro:
      'This is a formal escalation notice. The invoice below remains unpaid. Services may be paused until the outstanding balance is settled. Please contact us immediately to resolve this matter.',
    closing:
      'Immediate contact is required to avoid further action. Write to us at',
  },
};

export function renderPaymentReminderEmail(
  data: PaymentReminderEmailData
): RenderedEmail {
  const userName = data.userName || 'there';
  const level = data.reminderLevel;
  const copy = PAYMENT_REMINDER_COPY[level];
  const formattedAmount = formatCurrency(data.amount, data.currency);
  const formattedDue = formatDate(data.dueDate);
  const daysLabel =
    data.daysOverdue === 1
      ? '1 day overdue'
      : `${data.daysOverdue} days overdue`;

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content: p(`Hi ${userName},`) + p(copy.intro),
    },
    {
      type: 'card',
      content: {
        'Invoice number': data.invoiceNumber,
        'Amount due': formattedAmount,
        'Original due date': formattedDue,
        Status: daysLabel,
      },
    },
  ];

  if (level === 3) {
    blocks.push({
      type: 'text',
      content: p(
        'Please complete payment within <strong>7 days</strong> of this notice.'
      ),
    });
  }

  if (data.paymentUrl) {
    blocks.push(
      {
        type: 'text',
        content: p('You can pay online using the button below.'),
      },
      {
        type: 'button',
        content: { text: 'Pay invoice', href: data.paymentUrl },
      }
    );
  }

  blocks.push(
    {
      type: 'text',
      content: p(`${copy.closing} ${mailtoLink()}.`),
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('The Enclosure team'),
    }
  );

  const html = renderEmail({
    preheader: `${copy.subject} for invoice ${data.invoiceNumber}`,
    heading: copy.heading,
    subheading: `Invoice ${data.invoiceNumber}`,
    bodyBlocks: blocks,
  });

  return { subject: copy.subject, html };
}

// ---------------------------------------------------------------------------
// Invoice issued
// ---------------------------------------------------------------------------

export interface InvoiceIssuedEmailData {
  userName?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  description?: string;
  invoiceUrl?: string;
}

export function renderInvoiceIssuedEmail(
  data: InvoiceIssuedEmailData
): RenderedEmail {
  const userName = data.userName || 'there';
  const formattedAmount = formatCurrency(data.amount, data.currency);
  const formattedIssue = formatDate(data.issueDate);
  const formattedDue = formatDate(data.dueDate);
  const subject = `Invoice ${data.invoiceNumber} from The Enclosure`;

  const card: Record<string, string> = {
    'Invoice number': data.invoiceNumber,
  };
  if (data.description) {
    card.Description = data.description;
  }
  card['Amount due'] = formattedAmount;
  card['Issue date'] = formattedIssue;
  card['Due date'] = formattedDue;

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content:
        p(`Hi ${userName},`) +
        p(
          'Please find details of your new invoice below. Payment is due by the date shown.'
        ),
    },
    { type: 'card', content: card },
    {
      type: 'text',
      content: p(
        `If you have already arranged payment, thank you. For questions about this invoice, contact us at ${mailtoLink()}.`
      ),
    },
  ];

  if (data.invoiceUrl) {
    blocks.push({
      type: 'button',
      content: { text: 'View invoice', href: data.invoiceUrl },
    });
  }

  blocks.push({
    type: 'signoff',
    content: p('Cheers,') + p('The Enclosure team'),
  });

  const html = renderEmail({
    preheader: `Invoice ${data.invoiceNumber} is ready`,
    heading: 'Your invoice',
    subheading: `Invoice ${data.invoiceNumber}`,
    bodyBlocks: blocks,
  });

  return { subject, html };
}

// ---------------------------------------------------------------------------
// Outreach (lead cold email)
// ---------------------------------------------------------------------------

export interface OutreachEmailData {
  lead: {
    business_name: string;
    contact_name?: string | null;
    recommended_package?: string | null;
  };
  personalisedBody: string;
  subject: string;
  auditUrl: string;
  packagesUrl: string;
  unsubscribeUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape plain text and turn newlines into paragraphs. */
function plainTextToParagraphs(text: string): string {
  const trimmed = text.replace(/\r\n/g, '\n').trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\n{2,}/)
    .map((block) => {
      const withBreaks = escapeHtml(block).replace(/\n/g, '<br />');
      return `<p style="margin: 0 0 12px 0;">${withBreaks}</p>`;
    })
    .join('');
}

/**
 * Warmer branded outreach wrapping Sentry's personalised body.
 * Subject is taken from the Sentry export (or admin override) and used as the email subject.
 */
export function renderOutreachEmail(data: OutreachEmailData): RenderedEmail {
  const businessName = data.lead.business_name || 'your business';
  const subject = data.subject.trim() || `A quick look at ${businessName}`;
  const packageLabel =
    data.lead.recommended_package?.trim() || 'our fixed website packages';

  const bodyHtml = plainTextToParagraphs(data.personalisedBody);

  const blocks: EmailBodyBlock[] = [
    {
      type: 'text',
      content: bodyHtml || p('We recently reviewed your public website.'),
    },
    {
      type: 'card',
      content: {
        'See your full audit report':
          'We put together a short report covering the main opportunities we found.',
      },
    },
    {
      type: 'button',
      content: { text: 'View your audit', href: data.auditUrl },
    },
    {
      type: 'card',
      content: {
        'How we can help': `If you would like a hand putting this into practice, have a look at ${escapeHtml(packageLabel)}.`,
      },
    },
    {
      type: 'button',
      content: { text: 'See our packages', href: data.packagesUrl },
    },
    {
      type: 'signoff',
      content: p('Cheers,') + p('Josh at The Enclosure'),
    },
  ];

  const footerNote =
    `${mailtoLink()} · ` +
    `If you would rather not hear from us again, <a href="${data.unsubscribeUrl}" style="color: #1A4D2E; text-decoration: underline;">unsubscribe here</a>.` +
    ` The Enclosure, Welwyn Garden City, United Kingdom`;

  const html = renderEmail({
    preheader: subject,
    heading: `A quick look at ${escapeHtml(businessName)}`,
    bodyBlocks: blocks,
    footerNote,
  });

  return { subject, html };
}
