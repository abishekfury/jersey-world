import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String },
    image: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);

export interface ITeamDocument extends Document {
  name: string;
  slug: string;
  country: string;
  league: string;
  logo: string;
  banner?: string;
  primaryColor: string;
  active: boolean;
}

const TeamSchema = new Schema<ITeamDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    country: { type: String, required: true, index: true },
    league: { type: String, required: true, index: true },
    logo: { type: String, required: true },
    banner: { type: String },
    primaryColor: { type: String, default: '#FFFFFF' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Team = mongoose.model<ITeamDocument>('Team', TeamSchema);

export interface ICountryDocument extends Document {
  name: string;
  code: string;
  flag: string;
  confederation: string;
  active: boolean;
}

const CountrySchema = new Schema<ICountryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    flag: { type: String, required: true },
    confederation: { type: String, default: 'FIFA' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Country = mongoose.model<ICountryDocument>('Country', CountrySchema);
