import { model, Schema } from 'mongoose';
import { ISight } from './interfaces';

const SightSchema: Schema = new Schema({
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
});

// Export the model and return ISight interface
export default model<ISight>('Sight', SightSchema);
