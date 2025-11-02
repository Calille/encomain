/**
 * Shared Types for Email Edge Functions
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

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

export interface AccountUpdateData {
  updatedFields: string[];
  updateDate: string;
  ipAddress?: string;
}

export interface NewsletterContent {
  title: string;
  sections: Array<{
    title: string;
    content: string;
    link?: {
      text: string;
      url: string;
    };
  }>;
}

export interface PromotionalOffer {
  title: string;
  description: string;
  discountCode?: string;
  discountAmount?: number;
  validUntil: string;
  ctaUrl: string;
  ctaText: string;
}

export interface SystemErrorData {
  errorType: string;
  errorMessage: string;
  timestamp: string;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserFeedbackSummary {
  period: string;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  averageRating?: number;
  topComments?: string[];
}

