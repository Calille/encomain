/**
 * Order Helper Utilities
 * Functions for handling orders with email notifications
 */
import { supabase } from '../lib/supabase';
import { sendOrderConfirmation, notifyAdminNewOrder } from './emailHelpers';
import { OrderDetails } from '../types/email';
import { toast } from '../hooks/use-toast';

/**
 * Create an order and send confirmation emails
 * @param orderData - Order data to save
 * @param userEmail - User's email address
 * @param userName - User's name (optional)
 * @returns Created order data
 */
export async function createOrderWithNotifications(
  orderData: {
    user_id: string;
    items: Array<{
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
    shipping_address?: any;
    billing_address?: any;
  },
  userEmail: string,
  userName?: string
) {
  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id,
        order_number: orderNumber,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        currency: orderData.currency || 'GBP',
        status: 'pending',
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Prepare order details for email
    const orderDetails: OrderDetails = {
      orderId: order.id,
      orderNumber: orderNumber,
      items: orderData.items.map(item => ({
        id: item.name.toLowerCase().replace(/\s+/g, '-'),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping: orderData.shipping,
      total: orderData.total,
      currency: orderData.currency || 'GBP',
      orderDate: order.created_at || new Date().toISOString(),
      shippingAddress: orderData.shipping_address,
      billingAddress: orderData.billing_address,
    };

    // Send order confirmation email (fire and forget)
    try {
      await sendOrderConfirmation(userEmail, orderDetails, {
        userName: userName || 'Customer',
        orderDetailsUrl: `https://theenclosure.co.uk/orders/${order.id}`,
      }).catch((error) => {
        console.error('Failed to send order confirmation email:', error);
      });
    } catch (error) {
      console.error('Error triggering order confirmation email:', error);
    }

    // Notify admin of new order (fire and forget)
    try {
      await notifyAdminNewOrder('admin@theenclosure.co.uk', orderDetails, {
        adminName: 'Admin',
        adminDashboardUrl: 'https://theenclosure.co.uk/admin/orders',
      }).catch((error) => {
        console.error('Failed to send admin order notification:', error);
      });
    } catch (error) {
      console.error('Error triggering admin order notification:', error);
    }

    toast({
      title: 'Order confirmed!',
      description: 'Check your email for order details.',
    });

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to create order. Please try again.',
      variant: 'destructive',
    });
    throw error;
  }
}

