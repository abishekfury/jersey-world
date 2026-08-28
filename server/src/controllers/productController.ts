import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { AppError } from '../middleware/errorHandler';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search,
      team,
      country,
      league,
      season,
      type,
      size,
      minPrice,
      maxPrice,
      color,
      inStock,
      rating,
      isFeatured,
      isBestSeller,
      isNewArrival,
      sortBy = 'featured',
      page = 1,
      limit = 16,
    } = req.query as any;

    const filter: Record<string, any> = { active: true };

    // Search text query (safe regex escaping across product attributes)
    if (search && String(search).trim()) {
      const trimmedSearch = String(search).trim();
      const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { name: searchRegex },
        { team: searchRegex },
        { country: searchRegex },
        { league: searchRegex },
        { tags: searchRegex },
        { season: searchRegex },
        { description: searchRegex },
      ];
    }

    // Facet filters
    if (team) {
      const teamList = (Array.isArray(team) ? team : String(team).split(','))
        .map((t: string) => t.trim().replace(/\+/g, ' '))
        .filter(Boolean);
      if (teamList.length > 0) {
        const teamRegexes = teamList.map((t: string) => {
          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const unhyphenated = escaped.replace(/-/g, ' ');
          return new RegExp(`^(${escaped}|${unhyphenated})$`, 'i');
        });
        filter.team = { $in: teamRegexes };
      }
    }

    if (country) {
      const countryList = (Array.isArray(country) ? country : String(country).split(','))
        .map((c: string) => c.trim().replace(/\+/g, ' '))
        .filter(Boolean);
      if (countryList.length > 0) {
        const countryRegexes = countryList.map((c: string) => {
          const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const unhyphenated = escaped.replace(/-/g, ' ');
          return new RegExp(`^(${escaped}|${unhyphenated})$`, 'i');
        });
        filter.country = { $in: countryRegexes };
      }
    }

    if (league) {
      const leagueList = (Array.isArray(league) ? league : String(league).split(','))
        .map((l: string) => l.trim().replace(/\+/g, ' '))
        .filter(Boolean);
      if (leagueList.length > 0) {
        const leagueRegexes = leagueList.map((l: string) => {
          const escaped = l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const unhyphenated = escaped.replace(/-/g, ' ');
          return new RegExp(`^(${escaped}|${unhyphenated})$`, 'i');
        });
        filter.league = { $in: leagueRegexes };
      }
    }

    if (season) {
      const seasonList = (Array.isArray(season) ? season : String(season).split(','))
        .map((s: string) => s.trim())
        .filter(Boolean);
      if (seasonList.length > 0) {
        filter.season = { $in: seasonList };
      }
    }

    if (type) {
      const typeAliases: Record<string, string> = {
        'player issue': 'Player Version',
        'player edition': 'Player Version',
        'retro kits': 'Retro',
        'retro classic': 'Retro',
      };
      const rawTypes = (Array.isArray(type) ? type : String(type).split(','))
        .map((t: string) => t.trim().replace(/\+/g, ' '))
        .filter(Boolean);
      if (rawTypes.length > 0) {
        const resolvedTypes = rawTypes.map((t: string) => typeAliases[t.toLowerCase()] || t);
        const typeRegexes = resolvedTypes.map((t: string) => {
          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp(`^${escaped}$`, 'i');
        });
        filter.type = { $in: typeRegexes };
      }
    }

    if (size) {
      const sizes = (Array.isArray(size) ? size : String(size).split(','))
        .map((s: string) => s.trim().toUpperCase())
        .filter(Boolean);
      if (sizes.length > 0) {
        filter.sizes = { $in: sizes };
      }
    }

    if (color) {
      const colors = (Array.isArray(color) ? color : String(color).split(','))
        .map((c: string) => c.trim())
        .filter(Boolean);
      if (colors.length > 0) {
        const colorRegexes = colors.map((c: string) => new RegExp(`^${c}$`, 'i'));
        filter.colors = { $in: colorRegexes };
      }
    }

    if (inStock === 'true' || inStock === true) {
      filter.totalStock = { $gt: 0 };
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (isBestSeller !== undefined) {
      filter.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    }

    if (isNewArrival !== undefined) {
      filter.isNewArrival = isNewArrival === 'true' || isNewArrival === true;
    }

    // Effective price filter (respects discountPrice if present, fallback to price)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = minPrice !== undefined ? Number(minPrice) : undefined;
      const max = maxPrice !== undefined ? Number(maxPrice) : undefined;

      const priceCond: Record<string, any> = {};
      const discountCond: Record<string, any> = {};
      if (min !== undefined) {
        priceCond.$gte = min;
        discountCond.$gte = min;
      }
      if (max !== undefined) {
        priceCond.$lte = max;
        discountCond.$lte = max;
      }

      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          // Case 1: Product has active discountPrice > 0, match discountPrice
          { discountPrice: { $gt: 0, ...discountCond } },
          // Case 2: Product has no discountPrice, match regular price
          {
            $and: [
              { $or: [{ discountPrice: { $exists: false } }, { discountPrice: null }, { discountPrice: 0 }] },
              { price: priceCond },
            ],
          },
        ],
      });
    }

    // Sorting
    let sortOptions: Record<string, any> = { isFeatured: -1, isBestSeller: -1, createdAt: -1 };
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'price-asc':
        sortOptions = { discountPrice: 1, price: 1 };
        break;
      case 'price-desc':
        sortOptions = { discountPrice: -1, price: -1 };
        break;
      case 'popular':
        sortOptions = { numReviews: -1, rating: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, numReviews: -1 };
        break;
      case 'featured':
      default:
        sortOptions = { isFeatured: -1, isBestSeller: -1, createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 16));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugOrId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier } = req.params;

    let product;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    } else {
      product = await Product.findOne({ slug: identifier });
    }

    if (!product) {
      return next(new AppError('Jersey not found.', 404, 'PRODUCT_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedJerseys = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [featured, trending, retro] = await Promise.all([
      Product.find({ active: true, isFeatured: true }).limit(8).lean(),
      Product.find({ active: true, isBestSeller: true }).limit(8).lean(),
      Product.find({ active: true, type: 'Retro' }).limit(8).lean(),
    ]);

    res.status(200).json({
      success: true,
      featured,
      trending,
      retro,
    });
  } catch (error) {
    next(error);
  }
};

export const getRelatedJerseys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      active: true,
      $or: [{ team: product.team }, { country: product.country }, { league: product.league }],
    })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      related,
    });
  } catch (error) {
    next(error);
  }
};
