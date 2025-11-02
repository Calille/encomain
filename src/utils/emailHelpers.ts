/**
 * Email Helper Utilities
 * Convenient functions to call Supabase Edge Functions for sending emails
 */
import { supabase } from '../lib/supabase';
import { OrderDetails, PaymentDetails, SubscriptionDetails } from '../types/email';

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  email: string,
  options?: {
    userName?: string;
    loginUrl?: string;
    dashboardUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        email,
        userName: options?.userName || 'there',
        loginUrl: options?.loginUrl || 'https://theenclosure.co.uk/login',
        dashboardUrl: options?.dashboardUrl || 'https://theenclosure.co.uk/dashboard',
      },
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  email: string,
  order: OrderDetails,
  options?: {
    userName?: string;
    orderDetailsUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
      body: {
        email,
        userName: options?.userName || 'Customer',
        order,
        orderDetailsUrl: options?.orderDetailsUrl || `https://theenclosure.co.uk/orders/${order.orderId}`,
      },
    });

    if (error) {
      console.error('Error sending order confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceipt(
  email: string,
  payment: PaymentDetails,
  options?: {
    userName?: string;
    invoiceUrl?: string;
    receiptUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-payment-receipt', {
      body: {
        email,
        userName: options?.userName || 'Customer',
        payment,
        invoiceUrl: options?.invoiceUrl,
        receiptUrl: options?.receiptUrl,
      },
    });

    if (error) {
      console.error('Error sending payment receipt:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending payment receipt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send account update notification
 */
export async function sendAccountUpdateNotification(
  email: string,
  updatedFields: string[],
  options?: {
    userName?: string;
    accountSettingsUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-account-update', {
      body: {
        email,
        userName: options?.userName || 'there',
        updatedFields,
        updatedAt: new Date().toISOString(),
        accountSettingsUrl: options?.accountSettingsUrl || 'https://theenclosure.co.uk/settings',
      },
    });

    if (error) {
      console.error('Error sending account update notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending account update notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send failed payment alert
 */
export async function sendFailedPaymentAlert(
  email: string,
  payment: PaymentDetails,
  options?: {
    userName?: string;
    retryDate?: string;
    updatePaymentMethodUrl?: string;
    billingUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-failed-payment', {
      body: {
        email,
        userName: options?.userName || 'Customer',
        payment,
        retryDate: options?.retryDate,
        updatePaymentMethodUrl: options?.updatePaymentMethodUrl || 'https://theenclosure.co.uk/dashboard/payment-methods',
        billingUrl: options?.billingUrl || 'https://theenclosure.co.uk/dashboard/billing',
      },
    });

    if (error) {
      console.error('Error sending failed payment alert:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending failed payment alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Notify admin of new user signup
 */
export async function notifyAdminNewUser(
  adminEmail: string,
  userData: {
    email: string;
    name?: string;
    role: string;
  },
  options?: {
    adminName?: string;
    adminDashboardUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-new-user-alert', {
      body: {
        adminEmail,
        adminName: options?.adminName || 'Admin',
        userEmail: userData.email,
        userName: userData.name,
        signupDate: new Date().toISOString(),
        userRole: userData.role,
        adminDashboardUrl: options?.adminDashboardUrl || 'https://theenclosure.co.uk/admin/users',
      },
    });

    if (error) {
      console.error('Error sending admin alert:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending admin alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send account deletion confirmation email
 */
export async function sendAccountDeletionConfirmation(
  email: string,
  deletionDate: string,
  options?: {
    userName?: string;
    recoveryUrl?: string;
    recoveryExpiryDate?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-account-deletion', {
      body: {
        email,
        userName: options?.userName || 'there',
        deletionDate,
        recoveryUrl: options?.recoveryUrl,
        recoveryExpiryDate: options?.recoveryExpiryDate,
      },
    });

    if (error) {
      console.error('Error sending account deletion confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending account deletion confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Notify admin of new order
 */
export async function notifyAdminNewOrder(
  adminEmail: string,
  order: OrderDetails,
  options?: {
    adminName?: string;
    adminDashboardUrl?: string;
  }
): Promise<EmailResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('send-new-order-alert', {
      body: {
        adminEmail,
        adminName: options?.adminName || 'Admin',
        order: {
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            total: item.total,
          })),
          total: order.total,
          currency: order.currency || 'GBP',
          orderDate: order.orderDate,
        },
        adminDashboardUrl: options?.adminDashboardUrl || 'https://theenclosure.co.uk/admin/orders',
      },
    });

    if (error) {
      console.error('Error sending new order alert:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.messageId };
  } catch (error) {
    console.error('Error sending new order alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

