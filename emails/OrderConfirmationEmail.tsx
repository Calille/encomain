/**
 * Order Confirmation Email Template
 * Sent when order is placed
 * 
 * Subject: Order Confirmation - [Order Number]
 */
import {
  Text,
  Section,
  Heading,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import { EmailLayout } from './shared/EmailLayout';
import { EmailButton } from './shared/EmailButton';
import { EmailHeader } from './shared/EmailHeader';
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';
import { OrderDetails } from './shared/types';

interface OrderConfirmationEmailProps {
  userName?: string;
  order: OrderDetails;
  orderDetailsUrl: string;
}

export function OrderConfirmationEmail({
  userName = 'Customer',
  order,
  orderDetailsUrl,
}: OrderConfirmationEmailProps) {
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <EmailLayout preview={`Thank you for your order! Order #${order.orderNumber}`}>
      <EmailHeader title="Order Confirmed!" subtitle={`Order #${order.orderNumber}`} />

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Thank you for your order! We've received your order and will begin processing it shortly.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Order Details
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Row>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Order Number
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0' }}>
                {order.orderNumber}
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '0 0 4px 0' }}>
                Order Date
              </Text>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {new Date(order.orderDate).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </Column>
          </Row>
        </Section>

        <Section style={{ marginBottom: SPACING.GAP }}>
          <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0 0 12px 0' }}>
            Items Ordered:
          </Text>
          {order.items.map((item) => (
            <Row key={item.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${COLORS.BORDER_GRAY}` }}>
              <Column style={{ width: '60%' }}>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_SMALL, color: COLORS.LIGHT_GRAY, margin: '4px 0 0 0' }}>
                  Quantity: {item.quantity}
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0' }}>
                  {formatCurrency(item.total, order.currency)}
                </Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Hr style={{ borderColor: COLORS.BORDER_GRAY, margin: `${SPACING.GAP} 0` }} />

        <Section style={{ marginBottom: SPACING.GAP }}>
          <Row>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
                Subtotal:
              </Text>
              {order.tax !== undefined && (
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
                  Tax:
                </Text>
              )}
              {order.shipping !== undefined && (
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
                  Shipping:
                </Text>
              )}
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '8px 0 0 0' }}>
                Total:
              </Text>
            </Column>
            <Column style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
                {formatCurrency(order.subtotal, order.currency)}
              </Text>
              {order.tax !== undefined && (
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
                  {formatCurrency(order.tax, order.currency)}
                </Text>
              )}
              {order.shipping !== undefined && (
                <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0 0 8px 0' }}>
                  {formatCurrency(order.shipping, order.currency)}
                </Text>
              )}
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '8px 0 0 0' }}>
                {formatCurrency(order.total, order.currency)}
              </Text>
            </Column>
          </Row>
        </Section>

        {order.shippingAddress && (
          <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
            <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 12px 0' }}>
              Shipping Address
            </Heading>
            <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
              {order.shippingAddress.name}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city} {order.shippingAddress.postcode}<br />
              {order.shippingAddress.country}
            </Text>
          </Section>
        )}
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={orderDetailsUrl}>
          View Order Details
        </EmailButton>
      </Section>

      <Section>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          We'll send you another email when your order ships. If you have any questions, please contact us at{' '}
          <a href={`mailto:${BRAND.ordersEmail}`} style={{ color: COLORS.DARK_GREEN, textDecoration: 'underline' }}>
            {BRAND.ordersEmail}
          </a>
          .
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default OrderConfirmationEmail;

