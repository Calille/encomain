# Email System - Supabase Edge Functions

Complete email system for "The Enclosure" using Supabase Edge Functions and Resend.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Available Functions](#available-functions)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This email system provides 14 email templates organized by priority:

- **Priority 1 (Core)**: Welcome, Order Confirmation, Payment Receipt
- **Priority 2 (Account)**: Account Update, Account Deletion
- **Priority 3 (Transactional)**: Subscription Renewal, Failed Payment
- **Priority 4 (Marketing)**: Newsletter, Promotional Offer, Re-engagement
- **Priority 5 (Admin)**: New User Alert, New Order Alert, System Error, Feedback Summary

All emails follow a minimalistic, professional design with dark green (#006400) branding.

## Prerequisites

1. **Supabase Project** - You need an active Supabase project
2. **Resend Account** - Sign up at [resend.com](https://resend.com) and get your API key
3. **Domain Verification** - Verify your domain (`theenclosure.co.uk`) in Resend
4. **Supabase CLI** - Install from [supabase.com/docs/reference/cli](https://supabase.com/docs/reference/cli)

## Setup

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

### 3. Set Up Resend API Key

Set the Resend API key as a Supabase secret:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Or via Supabase Dashboard:
1. Go to Project Settings → Edge Functions → Secrets
2. Add `RESEND_API_KEY` with your Resend API key

### 4. Install Dependencies

The Edge Functions use npm imports (deno-compatible packages):
- `npm:resend@4.0.0` - Resend SDK for sending emails
- `npm:@react-email/components@0.0.28` - React Email components for rendering

These are automatically resolved by Deno when deployed.

## Available Functions

### Priority 1 - Core Emails

#### 1. `send-welcome-email`
Welcome email sent after user verifies their email.

**Function**: `send-welcome-email`
**From**: `hello@theenclosure.co.uk`
**Subject**: "Welcome to The Enclosure!"

#### 2. `send-order-confirmation`
Order confirmation email sent when an order is placed.

**Function**: `send-order-confirmation`
**From**: `orders@theenclosure.co.uk`
**Subject**: "Order Confirmation - [Order Number]"

#### 3. `send-payment-receipt`
Payment receipt email sent after successful payment.

**Function**: `send-payment-receipt`
**From**: `notifications@theenclosure.co.uk`
**Subject**: "Payment Receipt - [Transaction ID]"

### Priority 2 - Account Emails

#### 4. `send-account-update`
Account update notification when user changes account details.

**Function**: `send-account-update`
**From**: `notifications@theenclosure.co.uk`
**Subject**: "Your account has been updated"

#### 5. `send-account-deletion`
Account deletion confirmation with optional recovery link.

**Function**: `send-account-deletion`
**From**: `notifications@theenclosure.co.uk`
**Subject**: "Account Deletion Confirmation"

### Priority 3 - Transactional Emails

#### 6. `send-subscription-reminder`
Subscription renewal reminder before renewal date.

**Function**: `send-subscription-reminder`
**From**: `notifications@theenclosure.co.uk`
**Subject**: "Your [Plan Name] subscription renews soon"

#### 7. `send-failed-payment`
Failed payment alert with retry instructions.

**Function**: `send-failed-payment`
**From**: `notifications@theenclosure.co.uk`
**Subject**: "Payment Failed - Action Required"

### Priority 4 - Marketing Emails

#### 8. `send-newsletter`
Monthly newsletter with featured items.

**Function**: `send-newsletter`
**From**: `hello@theenclosure.co.uk`
**Subject**: "[Month] [Year] Newsletter - The Enclosure Updates"

#### 9. `send-promotional-offer`
Promotional offer email with discount codes.

**Function**: `send-promotional-offer`
**From**: `hello@theenclosure.co.uk`
**Subject**: "Special Offer: [Offer Title]"

#### 10. `send-reengagement`
Re-engagement email for inactive users.

**Function**: `send-reengagement`
**From**: `hello@theenclosure.co.uk`
**Subject**: "We Miss You! [User Name]"

### Priority 5 - Admin Emails

#### 11. `send-new-user-alert`
Admin notification when new user signs up.

**Function**: `send-new-user-alert`
**From**: `admin@theenclosure.co.uk`
**Subject**: "New User Signup: [User Email]"

#### 12. `send-new-order-alert`
Admin notification when new order is placed.

**Function**: `send-new-order-alert`
**From**: `orders@theenclosure.co.uk`
**Subject**: "New Order Received: [Order Number]"

#### 13. `send-system-error`
System error notification for critical issues.

**Function**: `send-system-error`
**From**: `admin@theenclosure.co.uk`
**Subject**: "[Severity] System Error Alert: [Error Type]"

#### 14. `send-feedback-summary`
Weekly digest of user feedback.

**Function**: `send-feedback-summary`
**From**: `admin@theenclosure.co.uk`
**Subject**: "Weekly Feedback Summary - [Period]"

## Usage Examples

### From Frontend (React/TypeScript)

#### Welcome Email

```typescript
import { supabase } from './lib/supabase';

async function sendWelcomeEmail(userEmail: string, userName?: string) {
  const { data, error } = await supabase.functions.invoke('send-welcome-email', {
    body: {
      email: userEmail,
      userName: userName || 'there',
      loginUrl: 'https://theenclosure.co.uk/login',
      dashboardUrl: 'https://theenclosure.co.uk/dashboard',
    },
  });

  if (error) {
    console.error('Error sending welcome email:', error);
    return;
  }

  console.log('Welcome email sent:', data);
}
```

#### Order Confirmation

```typescript
async function sendOrderConfirmation(
  userEmail: string,
  order: OrderDetails
) {
  const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
    body: {
      email: userEmail,
      userName: 'Customer Name',
      order: {
        orderId: 'order-123',
        orderNumber: 'ORD-2024-001',
        items: [
          {
            id: 'item-1',
            name: 'Website Development',
            quantity: 1,
            price: 1500,
            total: 1500,
          },
        ],
        subtotal: 1500,
        tax: 300,
        shipping: 0,
        total: 1800,
        currency: 'GBP',
        orderDate: new Date().toISOString(),
      },
      orderDetailsUrl: `https://theenclosure.co.uk/orders/order-123`,
    },
  });

  if (error) {
    console.error('Error sending order confirmation:', error);
    return;
  }

  console.log('Order confirmation sent:', data);
}
```

#### Payment Receipt

```typescript
async function sendPaymentReceipt(
  userEmail: string,
  payment: PaymentDetails
) {
  const { data, error } = await supabase.functions.invoke('send-payment-receipt', {
    body: {
      email: userEmail,
      userName: 'Customer Name',
      payment: {
        transactionId: 'txn-123',
        invoiceNumber: 'INV-2024-001',
        amount: 1800,
        currency: 'GBP',
        paymentMethod: 'Credit Card ending in 4242',
        paymentDate: new Date().toISOString(),
        status: 'completed',
      },
      invoiceUrl: 'https://theenclosure.co.uk/invoices/INV-2024-001',
    },
  });

  if (error) {
    console.error('Error sending payment receipt:', error);
    return;
  }

  console.log('Payment receipt sent:', data);
}
```

#### Account Update

```typescript
async function sendAccountUpdateNotification(
  userEmail: string,
  updatedFields: string[]
) {
  const { data, error } = await supabase.functions.invoke('send-account-update', {
    body: {
      email: userEmail,
      userName: 'User Name',
      updatedFields: updatedFields, // e.g., ['email', 'full_name']
      updatedAt: new Date().toISOString(),
      accountSettingsUrl: 'https://theenclosure.co.uk/settings',
    },
  });

  if (error) {
    console.error('Error sending account update email:', error);
    return;
  }

  console.log('Account update email sent:', data);
}
```

#### Failed Payment Alert

```typescript
async function sendFailedPaymentAlert(
  userEmail: string,
  payment: PaymentDetails
) {
  const { data, error } = await supabase.functions.invoke('send-failed-payment', {
    body: {
      email: userEmail,
      userName: 'Customer Name',
      payment: {
        transactionId: 'txn-123',
        amount: 1800,
        currency: 'GBP',
        paymentMethod: 'Credit Card',
        paymentDate: new Date().toISOString(),
        status: 'failed',
      },
      retryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      updatePaymentMethodUrl: 'https://theenclosure.co.uk/dashboard/payment-methods',
      billingUrl: 'https://theenclosure.co.uk/dashboard/billing',
    },
  });

  if (error) {
    console.error('Error sending failed payment alert:', error);
    return;
  }

  console.log('Failed payment alert sent:', data);
}
```

#### Admin Alert - New User

```typescript
async function notifyAdminNewUser(userData: {
  email: string;
  name?: string;
  role: string;
}) {
  const adminEmail = 'admin@theenclosure.co.uk'; // Replace with actual admin email

  const { data, error } = await supabase.functions.invoke('send-new-user-alert', {
    body: {
      adminEmail,
      adminName: 'Admin',
      userEmail: userData.email,
      userName: userData.name,
      signupDate: new Date().toISOString(),
      userRole: userData.role,
      adminDashboardUrl: 'https://theenclosure.co.uk/admin/users',
    },
  });

  if (error) {
    console.error('Error sending admin alert:', error);
    return;
  }

  console.log('Admin alert sent:', data);
}
```

## Testing

### Local Testing

You can test Edge Functions locally using the Supabase CLI:

```bash
# Start local Supabase (if not already running)
supabase start

# Test a function locally
supabase functions serve send-welcome-email --env-file .env.local

# Then in another terminal, make a test request
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "test@example.com",
    "userName": "Test User",
    "loginUrl": "http://localhost:3000/login",
    "dashboardUrl": "http://localhost:3000/dashboard"
  }'
```

### Testing Email Rendering

To preview email templates locally (before deployment):

1. Install React Email CLI:
```bash
npm install -g react-email
```

2. Navigate to the emails directory:
```bash
cd emails
```

3. Start the React Email preview server:
```bash
email dev
```

This will start a local server where you can preview all email templates.

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Individual Function

```bash
supabase functions deploy send-welcome-email
```

### Deploy with Environment Variables

Environment variables (secrets) are managed separately:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Verify Deployment

After deployment, you can test functions directly:

```bash
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/send-welcome-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "test@example.com",
    "userName": "Test User"
  }'
```

## Troubleshooting

### Common Issues

#### 1. "RESEND_API_KEY is not set"
- **Solution**: Ensure you've set the secret: `supabase secrets set RESEND_API_KEY=your_key`

#### 2. "Failed to render email template"
- **Solution**: Check that React Email components are properly imported. Ensure you're using the correct Deno-compatible imports.

#### 3. "CORS error"
- **Solution**: Ensure you're including the `Authorization` header with a valid Bearer token when calling functions from the frontend.

#### 4. "Email not received"
- **Solution**: 
  - Check Resend dashboard for delivery status
  - Verify domain is properly configured in Resend
  - Check spam folder
  - Ensure the recipient email is verified (for test emails)

#### 5. "Function timeout"
- **Solution**: Edge Functions have a default timeout. For long-running operations, consider:
  - Optimizing email rendering
  - Using background jobs for bulk emails
  - Implementing queue system for marketing emails

### Debugging

Enable verbose logging in functions:

```typescript
// In your Edge Function
console.log('Debug info:', { email, subject });
```

View function logs:

```bash
supabase functions logs send-welcome-email
```

### Email Rendering Issues

If React Email components don't work in Deno:

1. **Option 1**: Pre-render templates to HTML during build
2. **Option 2**: Use a simpler template system for Edge Functions
3. **Option 3**: Use React Email's server-side rendering API

## Email Addresses

Configure these email addresses in Resend:

- `hello@theenclosure.co.uk` - General communication, newsletters
- `orders@theenclosure.co.uk` - Order confirmations, billing
- `notifications@theenclosure.co.uk` - Account notifications, receipts
- `admin@theenclosure.co.uk` - Admin alerts

## Logo Configuration

Update the logo URL in `emails/shared/constants.ts`:

```typescript
export const LOGO_URL = 'https://theenclosure.co.uk/assets/images/logo.png';
```

Ensure the logo is publicly accessible at this URL.

## Best Practices

1. **Rate Limiting**: Implement rate limiting for marketing emails
2. **Unsubscribe**: Always include unsubscribe links in marketing emails
3. **Error Handling**: Implement retry logic for failed email sends
4. **Monitoring**: Set up monitoring/alerts for failed email deliveries
5. **Testing**: Test all email templates before deployment
6. **Personalization**: Always include user's name when available
7. **Mobile Responsive**: All templates are mobile-responsive by design

## Support

For issues or questions:
- Check Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- Check Resend docs: https://resend.com/docs
- Check React Email docs: https://react.email/docs

## License

This email system is part of The Enclosure project.

