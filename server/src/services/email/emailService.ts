import sgMail from '@sendgrid/mail';
import { config } from '../../config/env';
import { logger } from '../../config/logger';

if (config.SENDGRID_API_KEY) {
  sgMail.setApiKey(config.SENDGRID_API_KEY);
  logger.info('📧 SendGrid Email Service initialized.');
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export const sendOrderEmail = async (user: any, order: any): Promise<boolean> => {
  const recipientEmail = user?.email || order.shippingAddress?.email;
  const recipientName = user?.name || order.shippingAddress?.fullName || 'Valued Customer';
  const orderIdentifier = order.orderNumber || order._id;

  if (!recipientEmail) {
    logger.warn(`[SendGrid] Cannot send order email: no recipient email for order ${orderIdentifier}`);
    return false;
  }

  const itemsListHtml = (order.items || [])
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <strong>${item.productName || 'Authentic Jersey'}</strong><br/>
          <span style="color: #666; font-size: 13px;">Size: ${item.size || 'M'} ${
        item.customization?.playerName
          ? `| Custom: ${item.customization.playerName} #${item.customization.playerNumber || ''}`
          : ''
      }</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">₹${item.price || 0}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 24px; color: #111;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div style="background-color: #0d0f11; padding: 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">GOALZA</h1>
            <p style="color: #FF5722; margin: 4px 0 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">OFFICIAL MATCHWEAR</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 20px; margin-top: 0;">Thanks ${recipientName}! Your order is confirmed.</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.5;">
              We have received your payment for order <strong>#${orderIdentifier}</strong>. Your authentic matchwear is now being prepared for express dispatch.
            </p>

            <div style="margin: 28px 0; padding: 16px; background-color: #f9f9f9; border-radius: 8px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #ddd; text-align: left; font-size: 12px; color: #777;">
                    <th style="padding-bottom: 8px;">ITEM</th>
                    <th style="padding-bottom: 8px; text-align: center;">QTY</th>
                    <th style="padding-bottom: 8px; text-align: right;">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding-top: 16px; font-weight: bold;">Grand Total:</td>
                    <td style="padding-top: 16px; font-weight: bold; text-align: right; color: #FF5722; font-size: 16px;">₹${order.grandTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style="color: #666; font-size: 13px; line-height: 1.5;">
              <strong>Delivery Address:</strong><br/>
              ${order.shippingAddress?.fullName || recipientName}<br/>
              ${order.shippingAddress?.address || order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}<br/>
              ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || order.shippingAddress?.postalCode || ''}
            </p>

            <div style="margin-top: 32px; text-align: center;">
              <a href="${config.CLIENT_URL}/account/orders" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; letter-spacing: 0.5px;">
                View Order Status
              </a>
            </div>
          </div>
          <div style="background-color: #fafafa; padding: 16px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee;">
            GOALZA &bull; Authentic Matchwear & Kits &bull; Support: support@goalza.in
          </div>
        </div>
      </body>
    </html>
  `;

  if (config.SENDGRID_API_KEY) {
    try {
      await sgMail.send({
        to: recipientEmail,
        from: config.SENDGRID_FROM_EMAIL || 'orders@goalza.in',
        subject: `Order #${orderIdentifier} Confirmed`,
        html: htmlContent,
      });
      logger.info(`[SendGrid] ✅ Order confirmation email sent to ${recipientEmail} for Order #${orderIdentifier}`);
      return true;
    } catch (error) {
      logger.error(`[SendGrid] ❌ Failed to send order confirmation email:`, error);
      return false;
    }
  } else {
    // Development / Simulator fallback logging
    logger.info(
      `[SendGrid Simulated] Order #${orderIdentifier} confirmation email delivered to ${recipientEmail} (HTML generated, ${order.items?.length || 0} items, Grand Total: ₹${order.grandTotal})`
    );
    return true;
  }
};

export class EmailService {
  public static sendOrderEmail = sendOrderEmail;
}

