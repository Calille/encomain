/**
 * Payment Helper Utilities
 * Functions for handling payments with email notifications
 */
import { supabase } from '../lib/supabase';
import { sendPaymentReceipt, sendFailedPaymentAlert } from './emailHelpers';
import { PaymentDetails } from '../types/email';
import { toast } from '../hooks/use-toast';

/**
 * Process successful payment and send receipt email
 * @param paymentData - Payment data to save
 * @param userEmail - User's email address
 * @param userName - User's name (optional)
 * @returns Created payment data
 */
export async function processPaymentWithNotification(
  paymentData: {
    user_id: string;
    amount: number;
    currency?: string;
    payment_method: string;
    transaction_id: string;
    invoice_id?: string;
    invoice_number?: string;
    order_id?: string;
  },
  userEmail: string,
  userName?: string
) {
  try {
    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: paymentData.user_id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'GBP',
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id,
        invoice_id: paymentData.invoice_id,
        order_id: paymentData.order_id,
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Prepare payment details for email
    const paymentDetails: PaymentDetails = {
      transactionId: paymentData.transaction_id,
      invoiceId: paymentData.invoice_id,
      invoiceNumber: paymentData.invoice_number,
      amount: paymentData.amount,
      currency: paymentData.currency || 'GBP',
      paymentMethod: paymentData.payment_method,
      paymentDate: payment.created_at || new Date().toISOString(),
      status: 'completed',
    };

    // Send payment receipt email (fire and forget)
    try {
      await sendPaymentReceipt(userEmail, paymentDetails, {
        userName: userName || 'Customer',
        receiptUrl: `https://theenclosure.co.uk/receipts/${paymentData.transaction_id}`,
        invoiceUrl: paymentData.invoice_number 
          ? `https://theenclosure.co.uk/invoices/${paymentData.invoice_number}`
          : undefined,
      }).catch((error) => {
        console.error('Failed to send payment receipt email:', error);
      });
    } catch (error) {
      console.error('Error triggering payment receipt email:', error);
    }

    toast({
      title: 'Payment successful!',
      description: 'Check your email for payment receipt.',
    });

    return payment;
  } catch (error) {
    console.error('Error processing payment:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
      variant: 'destructive',
    });
    throw error;
  }
}

/**
 * Handle failed payment and send alert email
 * @param paymentData - Failed payment data
 * @param userEmail - User's email address
 * @param userName - User's name (optional)
 * @param retryDate - Optional retry date
 */
export async function handleFailedPaymentWithNotification(
  paymentData: {
    user_id: string;
    amount: number;
    currency?: string;
    payment_method: string;
    transaction_id: string;
    invoice_number?: string;
  },
  userEmail: string,
  userName?: string,
  retryDate?: string
) {
  try {
    // Save failed payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: paymentData.user_id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'GBP',
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id,
        status: 'failed',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving failed payment:', paymentError);
      // Continue even if save fails
    }

    // Prepare payment details for email
    const paymentDetails: PaymentDetails = {
      transactionId: paymentData.transaction_id,
      invoiceNumber: paymentData.invoice_number,
      amount: paymentData.amount,
      currency: paymentData.currency || 'GBP',
      paymentMethod: paymentData.payment_method,
      paymentDate: new Date().toISOString(),
      status: 'failed',
    };

    // Send failed payment alert email (fire and forget)
    try {
      await sendFailedPaymentAlert(userEmail, paymentDetails, {
        userName: userName || 'Customer',
        retryDate: retryDate,
        updatePaymentMethodUrl: 'https://theenclosure.co.uk/dashboard/payment-methods',
        billingUrl: 'https://theenclosure.co.uk/dashboard/billing',
      }).catch((error) => {
        console.error('Failed to send failed payment alert:', error);
      });
    } catch (error) {
      console.error('Error triggering failed payment alert:', error);
    }

    toast({
      title: 'Payment failed',
      description: 'Check your email for details and next steps.',
      variant: 'destructive',
    });

    return payment;
  } catch (error) {
    console.error('Error handling failed payment:', error);
    toast({
      title: 'Error',
      description: 'Failed to record payment failure. Please contact support.',
      variant: 'destructive',
    });
    throw error;
  }
}

