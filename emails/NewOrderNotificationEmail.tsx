/**
 * New Order Notification Email Template
 * Admin notification when new order is placed
 * 
 * Subject: New Order Received: [Order Number]
 */
import {
  Text,
  Section,
  Heading,
  Row,
  Column,
} from '@react-email/components';
import { EmailLayout } from './shared/EmailLayout';
import { EmailButton } from './shared/EmailButton';
import { BRAND, COLORS, TYPOGRAPHY, SPACING } from './shared/constants';
import { OrderDetails } from './shared/types';

interface NewOrderNotificationEmailProps {
  adminName?: string;
  order: OrderDetails;
  adminDashboardUrl: string;
}

export function NewOrderNotificationEmail({
  adminName = 'Admin',
  order,
  adminDashboardUrl,
}: NewOrderNotificationEmailProps) {
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <EmailLayout preview={`New order received: ${order.orderNumber} - ${formatCurrency(order.total, order.currency)}`}>
      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_HEADING, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          New Order Received
        </Heading>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          Hi {adminName},
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, lineHeight: TYPOGRAPHY.LINE_HEIGHT }}>
          A new order has been placed and requires your attention.
        </Text>
      </Section>

      <Section style={{ marginBottom: SPACING.SECTION_SPACING }}>
        <Heading style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, margin: '0 0 16px 0' }}>
          Order Summary
        </Heading>
        
        <Section style={{ backgroundColor: COLORS.BACKGROUND_GRAY, padding: SPACING.PADDING_MOBILE, borderRadius: '4px', marginBottom: SPACING.GAP }}>
          <Row style={{ marginBottom: '8px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Order Number:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, fontWeight: 'bold', margin: '0' }}>
                {order.orderNumber}
              </Text>
            </Column>
          </Row>
          <Row style={{ marginBottom: '8px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Order Date:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {new Date(order.orderDate).toLocaleString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Column>
          </Row>
          <Row style={{ marginBottom: '8px' }}>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Items:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.GRAY, margin: '0' }}>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column style={{ width: '40%' }}>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_BASE, color: COLORS.LIGHT_GRAY, margin: '0' }}>
                Total:
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: TYPOGRAPHY.FONT_SIZE_LARGE, color: COLORS.DARK_GREEN, fontWeight: 'bold', margin: '0' }}>
                {formatCurrency(order.total, order.currency)}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: SPACING.SECTION_SPACING }}>
        <EmailButton href={adminDashboardUrl}>
          View Order Details
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

export default NewOrderNotificationEmail;

