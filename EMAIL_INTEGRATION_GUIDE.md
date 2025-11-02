# 📧 Email Functions Integration Guide

This guide shows which email functions need frontend integration and where to add them.

## 🎯 Functions That NEED Frontend Integration

### ✅ Priority 1 - User Actions (Frontend Required)

#### 1. **Welcome Email** ⭐ HIGH PRIORITY
**When**: After user verifies their email  
**Where to Integrate**: 
- `src/contexts/AuthContext.tsx` - After email verification
- Or via Supabase Auth webhook (recommended)

**Integration Example:**
```typescript
// In AuthContext.tsx - after email verification
import { sendWelcomeEmail } from '../utils/emailHelpers';

// After user verifies email
useEffect(() => {
  if (user && user.email_confirmed_at && !userEmailSent) {
    sendWelcomeEmail(user.email!, {
      userName: profile?.name || user.email?.split('@')[0],
      loginUrl: 'https://theenclosure.co.uk/login',
      dashboardUrl: 'https://theenclosure.co.uk/dashboard',
    });
    setUserEmailSent(true);
  }
}, [user?.email_confirmed_at]);
```

**Status**: ✅ Helper function exists in `src/utils/emailHelpers.ts`

---

#### 2. **Order Confirmation** ⭐ HIGH PRIORITY
**When**: After user places an order  
**Where to Integrate**: 
- Order completion/checkout page
- Payment success callback
- After order is saved to database

**Integration Example:**
```typescript
// In your checkout/payment success handler
import { sendOrderConfirmation } from '../utils/emailHelpers';

const handleOrderSuccess = async (order: Order) => {
  // Save order to database first
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();

  if (data && !error) {
    // Send order confirmation email
    await sendOrderConfirmation(user.email!, {
      orderId: data.id,
      orderNumber: `ORD-${data.id}`,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      currency: 'GBP',
      orderDate: new Date().toISOString(),
    }, {
      userName: profile?.name,
      orderDetailsUrl: `https://theenclosure.co.uk/orders/${data.id}`,
    });

    toast({
      title: 'Order confirmed!',
      description: 'Check your email for order details.',
    });
  }
};
```

**Status**: ✅ Helper function exists in `src/utils/emailHelpers.ts`

---

#### 3. **Payment Receipt** ⭐ HIGH PRIORITY
**When**: After successful payment  
**Where to Integrate**: 
- Payment success callback
- After payment is processed
- `src/pages/dashboard/payments.tsx` - After payment success

**Integration Example:**
```typescript
// In payment success handler
import { sendPaymentReceipt } from '../utils/emailHelpers';

const handlePaymentSuccess = async (payment: PaymentDetails) => {
  // Save payment to database
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      amount: payment.amount,
      currency: payment.currency,
      status: 'completed',
      transaction_id: payment.transactionId,
    })
    .select()
    .single();

  if (data && !error) {
    // Send payment receipt email
    await sendPaymentReceipt(user.email!, {
      transactionId: payment.transactionId,
      invoiceNumber: payment.invoiceNumber,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentDate: new Date().toISOString(),
      status: 'completed',
    }, {
      userName: profile?.name,
      receiptUrl: `https://theenclosure.co.uk/receipts/${payment.transactionId}`,
      invoiceUrl: `https://theenclosure.co.uk/invoices/${payment.invoiceNumber}`,
    });
  }
};
```

**Status**: ✅ Helper function exists in `src/utils/emailHelpers.ts`

---

#### 4. **Account Update Notification** ⭐ MEDIUM PRIORITY
**When**: After user updates their account details  
**Where to Integrate**: 
- Account settings page
- Profile update handlers
- Any form that updates user data

**Integration Example:**
```typescript
// In account settings update handler
import { sendAccountUpdateNotification } from '../utils/emailHelpers';

const handleAccountUpdate = async (updatedData: UserProfile) => {
  const updatedFields: string[] = [];
  
  // Track which fields were updated
  if (updatedData.name !== profile?.name) updatedFields.push('name');
  if (updatedData.email !== profile?.email) updatedFields.push('email');
  if (updatedData.phone !== profile?.phone) updatedFields.push('phone');

  // Update in database
  const { error } = await supabase
    .from('users')
    .update(updatedData)
    .eq('id', user.id);

  if (!error && updatedFields.length > 0) {
    // Send account update notification
    await sendAccountUpdateNotification(user.email!, updatedFields, {
      userName: updatedData.name,
      accountSettingsUrl: 'https://theenclosure.co.uk/dashboard/settings',
    });
  }
};
```

**Status**: ✅ Helper function exists in `src/utils/emailHelpers.ts`

---

#### 5. **Account Deletion Confirmation** ⭐ MEDIUM PRIORITY
**When**: After user requests account deletion  
**Where to Integrate**: 
- Account settings / delete account page
- User deletion handler

**Integration Example:**
```typescript
// In account deletion handler
import { supabase } from '../lib/supabase';

const handleAccountDeletion = async () => {
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30); // 30 day grace period
  
  // Mark account for deletion
  const { error } = await supabase
    .from('users')
    .update({ 
      status: 'pending_deletion',
      deletion_date: deletionDate.toISOString(),
    })
    .eq('id', user.id);

  if (!error) {
    // Send deletion confirmation email
    const { data, error: emailError } = await supabase.functions.invoke('send-account-deletion', {
      body: {
        email: user.email!,
        userName: profile?.name,
        deletionDate: deletionDate.toISOString(),
        recoveryUrl: `https://theenclosure.co.uk/recover-account?token=${recoveryToken}`,
        recoveryExpiryDate: deletionDate.toISOString(),
      },
    });

    if (!emailError) {
      toast({
        title: 'Account deletion scheduled',
        description: 'Check your email for confirmation details.',
      });
    }
  }
};
```

**Status**: ⚠️ Helper function needed

---

## 🔄 Functions That Are BACKEND/AUTOMATED (Optional Frontend)

### ✅ Priority 2 - Backend/Cron Jobs (Database Triggers Recommended)

#### 6. **Subscription Renewal Reminder**
**When**: Before subscription renewal date  
**Where**: 
- **Recommended**: Database trigger or cron job (backend)
- **Optional**: Frontend check on login (less reliable)

**Implementation**: Use Supabase database triggers or edge function cron jobs

---

#### 7. **Failed Payment Alert**
**When**: When payment fails  
**Where**: 
- **Recommended**: Database trigger on payment failure
- **Optional**: Payment processor webhook → Edge Function

**Implementation**: Set up webhook from payment processor (Stripe, PayPal, etc.)

---

#### 8. **Newsletter**
**When**: Monthly marketing email  
**Where**: 
- **Recommended**: Cron job (weekly/monthly)
- **Optional**: Admin-triggered from dashboard

**Implementation**: Supabase Edge Function cron or scheduled task

---

#### 9. **Promotional Offer**
**When**: Marketing campaigns  
**Where**: 
- **Recommended**: Admin dashboard trigger
- **Optional**: Scheduled campaign

**Implementation**: Admin can trigger from dashboard

---

#### 10. **Re-engagement Email**
**When**: For inactive users  
**Where**: 
- **Recommended**: Cron job checking user activity
- **Optional**: Manual trigger from admin

**Implementation**: Scheduled Edge Function checking last_login_date

---

## 👨‍💼 Admin Emails (Backend/Database Triggers)

### ✅ Priority 3 - Admin Notifications

#### 11. **New User Signup Alert** ⭐ MEDIUM PRIORITY
**When**: When new user signs up  
**Where to Integrate**: 
- `src/components/auth/signup-form.tsx` - After successful signup
- Or via Supabase Auth webhook (recommended)

**Integration Example:**
```typescript
// In signup form after successful registration
import { notifyAdminNewUser } from '../utils/emailHelpers';

const handleSignupSuccess = async (userData: SignupData) => {
  // After user is created
  await notifyAdminNewUser('admin@theenclosure.co.uk', {
    email: userData.email,
    name: userData.name,
    role: 'user',
  }, {
    adminName: 'Admin',
    adminDashboardUrl: 'https://theenclosure.co.uk/admin/users',
  });
};
```

**Status**: ✅ Helper function exists in `src/utils/emailHelpers.ts`

---

#### 12. **New Order Notification** ⭐ MEDIUM PRIORITY
**When**: When new order is placed  
**Where to Integrate**: 
- Same place as Order Confirmation (checkout/payment success)

**Integration Example:**
```typescript
// In checkout success handler (alongside order confirmation)
const { data: adminEmail } = await supabase.functions.invoke('send-new-order-alert', {
  body: {
    adminEmail: 'admin@theenclosure.co.uk',
    adminName: 'Admin',
    order: {
      orderId: order.id,
      orderNumber: `ORD-${order.id}`,
      items: order.items,
      total: order.total,
      currency: 'GBP',
      orderDate: new Date().toISOString(),
    },
    adminDashboardUrl: 'https://theenclosure.co.uk/admin/orders',
  },
});
```

**Status**: ⚠️ Helper function needed

---

#### 13. **System Error Notification**
**When**: When critical system errors occur  
**Where**: 
- **Recommended**: Error logging service
- Global error handler
- API error middleware

**Implementation**: Set up error monitoring (Sentry, LogRocket, etc.) → Edge Function

---

#### 14. **User Feedback Summary**
**When**: Weekly digest of user feedback  
**Where**: 
- **Recommended**: Cron job (weekly)
- **Optional**: Admin dashboard manual trigger

**Implementation**: Scheduled Edge Function querying feedback table

---

## 📝 Quick Integration Checklist

### Immediate (High Priority)
- [ ] **Welcome Email** - After email verification in `AuthContext.tsx`
- [ ] **Order Confirmation** - After order placed (checkout success)
- [ ] **Payment Receipt** - After payment success in `payments.tsx`
- [ ] **New User Alert** - After signup in `signup-form.tsx`

### Short Term (Medium Priority)
- [ ] **Account Update** - After profile update in settings
- [ ] **Account Deletion** - After deletion request
- [ ] **New Order Alert** - After order placed (admin notification)

### Long Term (Backend/Cron)
- [ ] **Subscription Reminder** - Database trigger or cron
- [ ] **Failed Payment** - Payment webhook
- [ ] **Newsletter** - Scheduled cron job
- [ ] **Promotional Offers** - Admin dashboard trigger
- [ ] **Re-engagement** - Scheduled cron job
- [ ] **System Errors** - Error monitoring integration
- [ ] **Feedback Summary** - Scheduled cron job

---

## 🔧 Helper Functions Status

**Already Created** ✅:
- `sendWelcomeEmail()` - ✅ Ready
- `sendOrderConfirmation()` - ✅ Ready
- `sendPaymentReceipt()` - ✅ Ready
- `sendAccountUpdateNotification()` - ✅ Ready
- `sendFailedPaymentAlert()` - ✅ Ready
- `notifyAdminNewUser()` - ✅ Ready

**Need to Add** ⚠️:
- `sendAccountDeletionConfirmation()` - ⚠️ Add to `emailHelpers.ts`
- `sendSubscriptionReminder()` - ⚠️ Optional (backend preferred)
- `sendNewsletter()` - ⚠️ Optional (cron preferred)
- `sendPromotionalOffer()` - ⚠️ Optional (admin trigger)
- `sendReengagementEmail()` - ⚠️ Optional (cron preferred)
- `notifyAdminNewOrder()` - ⚠️ Add to `emailHelpers.ts`
- `notifyAdminSystemError()` - ⚠️ Backend integration
- `sendUserFeedbackSummary()` - ⚠️ Cron job

---

## 📍 Key Integration Points

1. **`src/contexts/AuthContext.tsx`**
   - Welcome email after verification
   - Account update notifications

2. **`src/components/auth/signup-form.tsx`**
   - New user admin alert

3. **`src/pages/dashboard/payments.tsx`**
   - Payment receipt emails
   - Failed payment alerts

4. **Checkout/Payment Success Page** (if exists)
   - Order confirmation
   - Payment receipt
   - New order admin alert

5. **Account Settings Page** (if exists)
   - Account update notifications
   - Account deletion confirmation

---

## 🚀 Next Steps

1. **Priority 1**: Integrate Welcome Email, Order Confirmation, Payment Receipt
2. **Priority 2**: Add missing helper functions for Account Deletion and New Order Alert
3. **Priority 3**: Set up database triggers or cron jobs for automated emails

Want me to help integrate any of these? I can:
- Add the Welcome Email to AuthContext
- Integrate Order Confirmation in checkout
- Add Payment Receipt to payments page
- Create missing helper functions
- Set up any specific integration

