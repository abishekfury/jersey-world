import { z } from 'zod';

export const productFilterQuerySchema = z.object({
  search: z.string().optional(),
  team: z.string().optional(),
  country: z.string().optional(),
  league: z.string().optional(),
  season: z.string().optional(),
  type: z.string().optional(),
  size: z.string().optional(),
  minPrice: z.union([z.number(), z.string().transform((v) => parseFloat(v))]).optional(),
  maxPrice: z.union([z.number(), z.string().transform((v) => parseFloat(v))]).optional(),
  color: z.string().optional(),
  inStock: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  rating: z.union([z.number(), z.string().transform((v) => parseFloat(v))]).optional(),
  isFeatured: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  isBestSeller: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  isNewArrival: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).optional(),
  sortBy: z.enum(['featured', 'newest', 'price-asc', 'price-desc', 'popular', 'rating']).optional(),
  page: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]).optional(),
  limit: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(3),
  team: z.string().min(2),
  country: z.string().min(2),
  league: z.string().min(2),
  season: z.string().min(4),
  type: z.enum([
    'Home',
    'Away',
    'Third Kit',
    'Training',
    'Retro',
    'Goalkeeper',
    'Limited Edition',
    'Fan Version',
    'Player Version',
    'Custom Jersey',
  ]),
  description: z.string().min(10),
  material: z.string().optional(),
  fit: z.string().optional(),
  washingInstructions: z.string().optional(),
  authenticityInfo: z.string().optional(),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  sizes: z.array(z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'])).default(['S', 'M', 'L', 'XL', 'XXL']),
  totalStock: z.number().min(0).default(50),
  colors: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.object({
    front: z.string().min(1),
    back: z.string().min(1),
    detail: z.string().optional(),
    lifestyle: z.string().optional(),
  }),
  aiAsset: z.object({
    frontImage: z.string().min(1),
    backImage: z.string().optional(),
    referenceImage: z.string().min(1),
    category: z.string().default('upper_body'),
  }),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isCustomizable: z.boolean().optional(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']),
  quantity: z.number().int().min(1).max(20).default(1),
  customization: z
    .object({
      playerName: z.string().max(16).optional(),
      playerNumber: z.string().max(2).optional(),
    })
    .optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20),
});

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(2),
    street: z.string().min(5),
    apartment: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(4),
    country: z.string().min(2),
    phone: z.string().min(8),
  }),
  paymentMethod: z.string().default('Razorpay'),
  couponCode: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const addReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().min(2).max(100),
  comment: z.string().min(10).max(1000),
});
