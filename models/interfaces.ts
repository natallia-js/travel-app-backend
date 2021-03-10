import { Document } from 'mongoose';

export interface ILangStringValue {
  lang: string;
  value: string;
}

export interface IUserRating {
  userId: string;
  rating: number;
}

export interface ISight extends Document {
  name: Array<ILangStringValue>;
  description: Array<ILangStringValue>;
  photoUrl: string;
  userRating: Array<IUserRating>;
}

export interface ICountry extends Document {
  name: Array<ILangStringValue>;
  capital: Array<ILangStringValue>;
  description: Array<ILangStringValue>;
  photoUrl: string;
  videoUrl: string;
  sights: Array<ISight>;
}

export interface IUser extends Document {
  login: string;
  password: string;
  name: string;
  photoUrl: string;
}
