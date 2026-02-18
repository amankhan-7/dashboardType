import mongoose, { Schema, models, Model } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  refreshTokenExpiry?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, required: true },
    refreshTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const User: Model<IUser> = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
