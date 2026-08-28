import {
  IShippingProvider,
  ServiceabilityCheckInput,
  ServiceabilityResult,
  RateCalculationInput,
  RateResult,
  CreateShipmentInput,
  CreateShipmentResult,
} from './shippingProvider';

// Indian PIN Code prefix to region database
const PINCODE_REGIONS: Record<string, { city: string; state: string; days: number; tier: 'metro' | 'tier1' | 'tier2' }> = {
  '11': { city: 'Delhi', state: 'Delhi', days: 3, tier: 'metro' },
  '12': { city: 'Gurgaon', state: 'Haryana', days: 3, tier: 'metro' },
  '20': { city: 'Noida', state: 'Uttar Pradesh', days: 3, tier: 'metro' },
  '40': { city: 'Mumbai', state: 'Maharashtra', days: 2, tier: 'metro' },
  '41': { city: 'Pune', state: 'Maharashtra', days: 2, tier: 'metro' },
  '50': { city: 'Hyderabad', state: 'Telangana', days: 3, tier: 'metro' },
  '56': { city: 'Bengaluru', state: 'Karnataka', days: 3, tier: 'metro' },
  '60': { city: 'Chennai', state: 'Tamil Nadu', days: 3, tier: 'metro' },
  '68': { city: 'Kochi', state: 'Kerala', days: 4, tier: 'tier1' },
  '70': { city: 'Kolkata', state: 'West Bengal', days: 4, tier: 'metro' },
  '38': { city: 'Ahmedabad', state: 'Gujarat', days: 3, tier: 'tier1' },
  '30': { city: 'Jaipur', state: 'Rajasthan', days: 3, tier: 'tier1' },
  '22': { city: 'Lucknow', state: 'Uttar Pradesh', days: 4, tier: 'tier1' },
  '80': { city: 'Patna', state: 'Bihar', days: 5, tier: 'tier2' },
  '78': { city: 'Guwahati', state: 'Assam', days: 6, tier: 'tier2' },
  '16': { city: 'Chandigarh', state: 'Punjab', days: 3, tier: 'tier1' },
  '75': { city: 'Bhubaneswar', state: 'Odisha', days: 4, tier: 'tier1' },
  '45': { city: 'Indore', state: 'Madhya Pradesh', days: 3, tier: 'tier1' },
};

export class MockShippingProvider implements IShippingProvider {
  name = 'BlueDart / Express Logistics (Mock)';

  private validatePincode(pincode: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pincode.trim());
  }

  private resolveRegion(pincode: string): { city: string; state: string; days: number; tier: string } {
    const prefix = pincode.slice(0, 2);
    if (PINCODE_REGIONS[prefix]) {
      return PINCODE_REGIONS[prefix];
    }
    // General fallback for all valid 6-digit Indian PINs
    const firstDigit = pincode[0];
    const statesByZone: Record<string, { city: string; state: string }> = {
      '1': { city: 'Northern Zone', state: 'Delhi NCR / Punjab / HP' },
      '2': { city: 'UP / Uttarakhand Region', state: 'Uttar Pradesh' },
      '3': { city: 'Western Zone', state: 'Rajasthan / Gujarat' },
      '4': { city: 'Maharashtra / Goa Region', state: 'Maharashtra' },
      '5': { city: 'Southern Zone', state: 'Andhra / Telangana / Karnataka' },
      '6': { city: 'Southern Coastal Zone', state: 'Tamil Nadu / Kerala' },
      '7': { city: 'Eastern Zone', state: 'West Bengal / North-East' },
      '8': { city: 'Central East Zone', state: 'Bihar / Jharkhand' },
      '9': { city: 'Defense / Special Territory', state: 'National Transit Hub' },
    };
    const region = statesByZone[firstDigit] || { city: 'India Hub', state: 'India' };
    return { ...region, days: 4, tier: 'tier2' };
  }

  private computeEstimatedDate(days: number): string {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  async checkServiceability(input: ServiceabilityCheckInput): Promise<ServiceabilityResult> {
    const { deliveryPincode } = input;
    if (!this.validatePincode(deliveryPincode)) {
      return {
        available: false,
        message: 'Invalid 6-digit Indian PIN code format.',
        estimatedDeliveryDays: '',
        estimatedDeliveryDate: '',
        codAvailable: false,
        courierPartner: 'None',
      };
    }

    // Explicit non-serviceable test PINs (e.g. Remote high-altitude or embargoed)
    if (deliveryPincode.startsWith('999') || deliveryPincode === '000000') {
      return {
        available: false,
        message: 'Sorry, delivery is currently unavailable to this PIN code.',
        estimatedDeliveryDays: '',
        estimatedDeliveryDate: '',
        codAvailable: false,
        courierPartner: 'None',
      };
    }

    const region = this.resolveRegion(deliveryPincode);
    const estDate = this.computeEstimatedDate(region.days);

    return {
      available: true,
      city: region.city,
      state: region.state,
      estimatedDeliveryDays: `${region.days}–${region.days + 2} business days`,
      estimatedDeliveryDate: estDate,
      codAvailable: true,
      courierPartner: 'BlueDart Express Air',
      message: `Delivery available to ${deliveryPincode} (${region.city}, ${region.state})`,
    };
  }

  async calculateRate(input: RateCalculationInput): Promise<RateResult> {
    const { deliveryPincode, weightGrams, paymentMethod } = input;
    if (!this.validatePincode(deliveryPincode)) {
      return {
        available: false,
        shippingCharge: 0,
        courierCost: 0,
        codCharge: 0,
        estimatedDeliveryDays: '',
        estimatedDeliveryDate: '',
        courierPartner: 'None',
      };
    }

    const region = this.resolveRegion(deliveryPincode);

    // Rate scale based on weight: Base 500g = ₹79, each additional 500g = ₹30
    const weightMultiplier = Math.ceil(Math.max(1, weightGrams) / 500);
    const customerShipping = 49 + weightMultiplier * 30; // e.g. 350g -> ₹79; 950g -> ₹109
    const courierCost = 40 + weightMultiplier * 24;      // e.g. 350g -> ₹64; 950g -> ₹88
    const codFee = paymentMethod === 'COD' ? 25 : 0;

    return {
      available: true,
      shippingCharge: customerShipping,
      courierCost,
      codCharge: codFee,
      estimatedDeliveryDays: `${region.days}–${region.days + 2} days`,
      estimatedDeliveryDate: this.computeEstimatedDate(region.days),
      courierPartner: 'BlueDart Air',
    };
  }

  async createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    const awb = `BD${randomSuffix}IN`;
    const region = this.resolveRegion(input.deliveryPincode);

    return {
      success: true,
      awbNumber: awb,
      trackingUrl: `https://www.bluedart.com/tracking?awb=${awb}`,
      courierName: 'BlueDart Air Express',
      shippingCost: input.shippingCost || 64,
      estimatedDelivery: `${region.days}–${region.days + 2} business days`,
    };
  }
}

