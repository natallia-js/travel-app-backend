import { model, Schema, Document } from 'mongoose';

export interface IUser extends Document {
  login: string;
  password: string;
  name: string;
  photoUrl: string;
}

const UserSchema: Schema = new Schema({
  login: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  photoUrl: { type: String },
});

// Export the model and return IUser interface
export default model<IUser>('User', UserSchema);
