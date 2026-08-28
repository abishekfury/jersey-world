import { Request, Response, NextFunction } from 'express';
import { Category, Team, Country } from '../models/Category';
import { Product } from '../models/Product';

export const getMetadata = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [categories, teams, countries, leagues, seasons, types, productTeams, productCountries] = await Promise.all([
      Category.find({ active: true }).lean(),
      Team.find({ active: true }).sort({ name: 1 }).lean(),
      Country.find({ active: true }).sort({ name: 1 }).lean(),
      Product.distinct('league', { active: true }),
      Product.distinct('season', { active: true }),
      Product.distinct('type', { active: true }),
      Product.distinct('team', { active: true }),
      Product.distinct('country', { active: true }),
    ]);

    // Merge any product teams not already in Team collection
    const existingTeamNames = new Set(teams.map((t) => t.name.toLowerCase()));
    const allTeams = [...teams];
    for (const pt of productTeams) {
      if (pt && !existingTeamNames.has(pt.toLowerCase())) {
        allTeams.push({ name: pt, slug: pt.toLowerCase().replace(/[^a-z0-9]+/g, '-'), active: true } as any);
        existingTeamNames.add(pt.toLowerCase());
      }
    }
    allTeams.sort((a, b) => a.name.localeCompare(b.name));

    // Merge any product countries not already in Country collection
    const existingCountryNames = new Set(countries.map((c) => c.name.toLowerCase()));
    const allCountries = [...countries];
    for (const pc of productCountries) {
      if (pc && !existingCountryNames.has(pc.toLowerCase())) {
        allCountries.push({ name: pc, code: pc.slice(0, 3).toUpperCase(), flag: '🌐', active: true } as any);
        existingCountryNames.add(pc.toLowerCase());
      }
    }
    allCountries.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      success: true,
      categories,
      teams: allTeams,
      countries: allCountries,
      leagues: leagues.filter(Boolean).sort(),
      seasons: seasons.filter(Boolean).sort(),
      types: types.filter(Boolean).sort(),
    });
  } catch (error) {
    next(error);
  }
};

export const getTeams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const teams = await Team.find({ active: true }).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, teams });
  } catch (error) {
    next(error);
  }
};

export const getCountries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const countries = await Country.find({ active: true }).sort({ name: 1 }).lean();
    res.status(200).json({ success: true, countries });
  } catch (error) {
    next(error);
  }
};
