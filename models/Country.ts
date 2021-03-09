import { model, Schema, Document } from 'mongoose';

export interface ILangStringValue extends Document {
  lang: string;
  value: string;
}

export interface IUserRating extends Document {
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

const CountrySchema: Schema = new Schema({
  name: [
    {
      lang: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  capital: [
    {
      lang: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  description: [
    {
      lang: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  photoUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  sights: [
    {
      name: [
        {
          lang: { type: String, required: true },
          value: { type: String, required: true }
        }
      ],
      description: [
        {
          lang: { type: String, required: true },
          value: { type: String, required: true }
        }
      ],
      photoUrl: { type: String, required: true },
      userRating: [
        {
          userId: { type: Schema.Types.ObjectId, required: true },
          rating: { type: Number, min: 1, max: 5, required: true },
        }
      ]
    }
  ]
});

// Export the model and return ICountry interface
export default model<ICountry>('Country', CountrySchema);
