import { model, Schema } from 'mongoose';
import SightSchema from './Sight';
import { ICountry } from './interfaces';

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
  timezone: { type: String, required: true },
  currency: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  alpha2Code: { type: String, required: true },
  description: [
    {
      lang: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  photoUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  sights: [
    SightSchema.schema
  ]
});

// Export the model and return ICountry interface
export default model<ICountry>('Country', CountrySchema);
