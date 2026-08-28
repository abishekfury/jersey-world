import { Router } from 'express';
import {
  checkServiceability,
  calculateShippingRate,
  getShipmentByOrder,
  generateShipmentAWB,
  getShippingSettings,
  updateShippingSettings,
} from '../controllers/shippingController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Public Shipping Quotes & Serviceability
router.get('/serviceability/:pincode', checkServiceability);
router.post('/rate', calculateShippingRate);
router.get('/settings', getShippingSettings);

// Protected Shipment Tracking (Customer & Admin)
router.get('/shipments/:orderId', requireAuth, getShipmentByOrder);

// Admin Only Shipping Operations
router.post('/shipments/:orderId/generate-awb', requireAuth, requireRole('admin'), generateShipmentAWB);
router.put('/settings', requireAuth, requireRole('admin'), updateShippingSettings);

export default router;

