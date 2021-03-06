import { model, Schema } from 'mongoose';
import { IUser } from './interfaces';

const UserSchema: Schema = new Schema({
  login: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  photoUrl: { type: String },
  photo: {
    data: { type: Buffer },
    contentType: { type: String },
  },
});

// Export the model and return IUser interface
export default model<IUser>('User', UserSchema);
