/**
 * Generate local HTML previews for every transactional email type.
 *
 * Run: npx tsx scripts/preview-email.ts
 *
 * Opens nothing itself; write output to preview-emails/*.html for browser review.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  renderWelcomeEmail,
  renderOrderConfirmationEmail,
  renderPaymentReceiptEmail,
  renderAccountUpdateEmail,
  renderAccountDeletionEmail,
  renderSubscriptionRenewalEmail,
  renderFailedPaymentEmail,
  renderNewsletterEmail,
  renderPromotionalOfferEmail,
  renderReengagementEmail,
  renderNewUserSignupEmail,
  renderNewOrderNotificationEmail,
  renderSystemErrorEmail,
  renderUserFeedbackSummaryEmail,
  renderNewTicketAdminEmail,
  renderTicketResponseClientEmail,
  renderPaymentReminderEmail,
  renderInvoiceIssuedEmail,
  renderOutreachEmail,
} from '../supabase/functions/_shared/email-templates.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'preview-emails');

mkdirSync(outDir, { recursive: true });

const dashboardUrl = 'https://theenclosure.co.uk/dashboard';
const billingUrl = 'https://theenclosure.co.uk/billing';
const adminUrl = 'https://theenclosure.co.uk/admin';
const now = new Date().toISOString();
const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

type Preview = { name: string; html: string };

const previews: Preview[] = [
  {
    name: 'welcome',
    html: renderWelcomeEmail({
      userName: 'Alex Morgan',
      email: 'alex@example.co.uk',
      loginUrl: 'https://theenclosure.co.uk/login',
      dashboardUrl,
      temporaryPassword: 'Tmp-Ex4mple!',
      requiresPasswordChange: true,
    }),
  },
  {
    name: 'account-deletion',
    html: renderAccountDeletionEmail({
      userName: 'Alex Morgan',
      deletionDate: nextMonth,
      recoveryUrl: 'https://theenclosure.co.uk/recover-account?token=demo-token',
      recoveryExpiryDate: nextMonth,
    }),
  },
  {
    name: 'order-confirmation',
    html: renderOrderConfirmationEmail({
      userName: 'Alex Morgan',
      orderDetailsUrl: `${dashboardUrl}/orders/ord_123`,
      order: {
        orderId: 'ord_123',
        orderNumber: 'ENC-1042',
        orderDate: now,
        currency: 'GBP',
        subtotal: 1200,
        tax: 240,
        total: 1440,
        items: [
          { id: '1', name: 'Website redesign', quantity: 1, price: 1000, total: 1000 },
          { id: '2', name: 'Hosting setup', quantity: 1, price: 200, total: 200 },
        ],
        shippingAddress: {
          name: 'Alex Morgan',
          street: '12 High Street',
          city: 'Bristol',
          postcode: 'BS1 4DJ',
          country: 'United Kingdom',
        },
      },
    }),
  },
  {
    name: 'payment-receipt',
    html: renderPaymentReceiptEmail({
      userName: 'Alex Morgan',
      invoiceUrl: `${billingUrl}/invoices/inv_88`,
      payment: {
        transactionId: 'txn_abc123',
        invoiceNumber: 'INV-2088',
        amount: 1440,
        currency: 'GBP',
        paymentMethod: 'Visa ending 4242',
        paymentDate: now,
        status: 'succeeded',
      },
    }),
  },
  {
    name: 'account-update',
    html: renderAccountUpdateEmail({
      userName: 'Alex Morgan',
      updatedFields: ['full_name', 'company_name'],
      updatedAt: now,
      settingsUrl: 'https://theenclosure.co.uk/settings',
    }),
  },
  {
    name: 'subscription-reminder',
    html: renderSubscriptionRenewalEmail({
      userName: 'Alex Morgan',
      billingUrl,
      subscription: {
        planName: 'Growth',
        renewalDate: nextMonth,
        amount: 199,
        currency: 'GBP',
        billingCycle: 'monthly',
      },
    }),
  },
  {
    name: 'failed-payment',
    html: renderFailedPaymentEmail({
      userName: 'Alex Morgan',
      updatePaymentMethodUrl: `${billingUrl}/payment-method`,
      billingUrl,
      retryDate: nextMonth,
      payment: {
        transactionId: 'txn_fail_9',
        invoiceNumber: 'INV-2090',
        amount: 199,
        currency: 'GBP',
        paymentMethod: 'Visa ending 4242',
      },
    }),
  },
  {
    name: 'newsletter',
    html: renderNewsletterEmail({
      userName: 'Alex Morgan',
      month: 'July',
      year: 2026,
      unsubscribeUrl: 'https://theenclosure.co.uk/unsubscribe?token=demo',
      featuredItems: [
        {
          title: 'Faster dashboard loads',
          description: 'We trimmed load times across the client dashboard.',
          link: 'https://theenclosure.co.uk/blog/faster-dashboard',
        },
        {
          title: 'New support categories',
          description: 'Support tickets now use clearer category labels.',
        },
      ],
    }),
  },
  {
    name: 'promotional-offer',
    html: renderPromotionalOfferEmail({
      userName: 'Alex Morgan',
      offerTitle: 'Spring maintenance package',
      offerDescription:
        'Book a spring maintenance package and keep your site running smoothly through the season.',
      discount: { percentage: 15, code: 'SPRING15' },
      expiryDate: nextMonth,
      ctaUrl: 'https://theenclosure.co.uk/offers/spring',
      unsubscribeUrl: 'https://theenclosure.co.uk/unsubscribe?token=demo',
    }),
  },
  {
    name: 'reengagement',
    html: renderReengagementEmail({
      userName: 'Alex Morgan',
      daysSinceLastActivity: 45,
      lastActivityDate: lastWeek,
      dashboardUrl,
      unsubscribeUrl: 'https://theenclosure.co.uk/unsubscribe?token=demo',
    }),
  },
  {
    name: 'new-user-alert',
    html: renderNewUserSignupEmail({
      adminName: 'Josh',
      userEmail: 'alex@example.co.uk',
      userName: 'Alex Morgan',
      signupDate: now,
      userRole: 'client',
      adminDashboardUrl: adminUrl,
    }),
  },
  {
    name: 'new-order-alert',
    html: renderNewOrderNotificationEmail({
      adminName: 'Josh',
      adminDashboardUrl: adminUrl,
      order: {
        orderId: 'ord_123',
        orderNumber: 'ENC-1042',
        orderDate: now,
        currency: 'GBP',
        total: 1440,
        items: [
          { name: 'Website redesign', quantity: 1, total: 1000 },
          { name: 'Hosting setup', quantity: 1, total: 200 },
        ],
      },
    }),
  },
  {
    name: 'system-error',
    html: renderSystemErrorEmail({
      adminName: 'Josh',
      errorType: 'BillingCronFailure',
      errorMessage: 'Scheduled invoice job timed out after 30s',
      timestamp: now,
      severity: 'high',
      context: { job: 'generate-scheduled-invoices', attempt: 2 },
      adminDashboardUrl: adminUrl,
    }),
  },
  {
    name: 'feedback-summary',
    html: renderUserFeedbackSummaryEmail({
      adminName: 'Josh',
      adminDashboardUrl: adminUrl,
      feedbackSummary: {
        period: '21 Jul 2026 - 27 Jul 2026',
        totalFeedback: 12,
        positiveFeedback: 9,
        negativeFeedback: 3,
        averageRating: 4.2,
        topComments: [
          'The new dashboard feels much clearer.',
          'Support reply times have improved.',
        ],
      },
    }),
  },
  {
    name: 'ticket-admin',
    html: renderNewTicketAdminEmail({
      subject: 'Billing question about invoice INV-2088',
      category: 'billing',
      clientEmail: 'alex@example.co.uk',
      clientName: 'Alex Morgan',
      ticketUrl: `${adminUrl}/support`,
      ticketId: 'tkt_55',
    }),
  },
  {
    name: 'ticket-client',
    html: renderTicketResponseClientEmail({
      clientName: 'Alex Morgan',
      subject: 'Billing question about invoice INV-2088',
      responsePreview:
        'Thanks for getting in touch. We have checked invoice INV-2088 and everything looks correct on our side.',
      ticketUrl: `${dashboardUrl}/support`,
    }),
  },
  {
    name: 'invoice-issued',
    html: renderInvoiceIssuedEmail({
      userName: 'Alex Morgan',
      invoiceNumber: 'INV-2091',
      amount: 199,
      currency: 'GBP',
      issueDate: now,
      dueDate: nextMonth,
      description: 'Growth plan - August 2026',
      invoiceUrl: `${billingUrl}/invoices/inv_91`,
    }).html,
  },
  {
    name: 'outreach',
    html: renderOutreachEmail({
      lead: {
        business_name: 'Riverside Cafe',
        contact_name: 'Sam',
        recommended_package: 'the Growth package',
      },
      personalisedBody:
        'Hi Sam,\n\nWe recently reviewed the public website for Riverside Cafe and spotted a few opportunities that could help visitors find you more easily.\n\nThe audit covers speed, mobile layout, and how clearly your opening hours come across.',
      subject: 'A quick look at Riverside Cafe',
      auditUrl: 'https://theenclosure.co.uk/audit/demo-token-example',
      packagesUrl: 'https://theenclosure.co.uk/pricing',
      unsubscribeUrl: 'https://theenclosure.co.uk/unsubscribe/demo-token-example',
    }).html,
  },
];

for (const level of [1, 2, 3, 4] as const) {
  const rendered = renderPaymentReminderEmail({
    userName: 'Alex Morgan',
    invoiceNumber: 'INV-2088',
    amount: 1440,
    currency: 'GBP',
    dueDate: lastWeek,
    daysOverdue: 7 * level,
    reminderLevel: level,
    paymentUrl: `${billingUrl}/invoices/inv_88`,
  });
  previews.push({
    name: `payment-reminder-level-${level}`,
    html: rendered.html,
  });
}

for (const preview of previews) {
  const path = join(outDir, `${preview.name}.html`);
  writeFileSync(path, preview.html, 'utf8');
  console.log(`Wrote ${path}`);
}

console.log(`\nGenerated ${previews.length} email previews in preview-emails/`);
console.log('Open any HTML file in a browser to review the layout.');
