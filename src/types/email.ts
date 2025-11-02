/**
 * Email Types
 * Shared TypeScript types for email functionality
 */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderDetails {
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
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
  billingAddress?: {
    name: string;
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
}

export interface PaymentDetails {
  transactionId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface SubscriptionDetails {
  planName: string;
  renewalDate: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
}

