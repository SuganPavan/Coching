import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaculty extends Document {
  name: string;
  qualification: string;
  subjects: string[];
  experience: number;
  phone: string;
  email?: string;
  photo?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, trim: true },
    qualification: { type: String, required: true },
    subjects: [{ type: String, required: true }],
    experience: { type: Number, required: true, min: 0 },
    phone: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    photo: { type: String },
    bio: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Faculty: Model<IFaculty> = mongoose.models.Faculty || mongoose.model<IFaculty>("Faculty", FacultySchema);

export default Faculty;
