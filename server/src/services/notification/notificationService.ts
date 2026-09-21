import { logger } from '../../config/logger';
import { sendOrderEmail } from '../email/emailService';

export class NotificationService {
  public static notifyOrderPlaced(order: any, user: any): void {
    logger.info(`[Notification] Order Placed: ${order.orderNumber} for ${user?.email || 'customer'}`, {
      orderId: order._id,
      amount: order.grandTotal,
    });
  }

  public static notifyOrderConfirmed(order: any, user: any): void {
    logger.info(`[Notification] Order Confirmed: ${order.orderNumber} for ${user?.email || 'customer'}`);
    // Trigger SendGrid Order Confirmation Email
    sendOrderEmail(user, order).catch((err) => {
      logger.error(`Failed to send order email for ${order.orderNumber}:`, err);
    });
  }

  public static notifyOrderShipped(order: any, user: any, awb: string, courier: string): void {
    logger.info(`[Notification] Order Shipped: ${order.orderNumber} via ${courier}, AWB: ${awb}`);
  }

  public static notifyOrderDelivered(order: any, user: any): void {
    logger.info(`[Notification] Order Delivered: ${order.orderNumber}`);
  }

  public static notifyOrderCancelled(order: any, user: any, reason: string): void {
    logger.info(`[Notification] Order Cancelled: ${order.orderNumber}. Reason: ${reason}`);
  }

  public static notifyReturnRequested(order: any, user: any, reason: string): void {
    logger.info(`[Notification] Return Requested: ${order.orderNumber}. Reason: ${reason}`);
  }

  public static notifyReturnStatusUpdated(order: any, user: any, status: string, notes?: string): void {
    logger.info(`[Notification] Return Status Updated for ${order.orderNumber}: ${status}. Notes: ${notes || 'N/A'}`);
  }
}
