import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  name: string;
  class: "XI" | "XII" | "XI & XII";
  stream: "Science" | "Commerce" | "Arts" | "All";
  subjects: string[];
  duration: string;
  fee: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    class: { type: String, required: true, enum: ["XI", "XII", "XI & XII"] },
    stream: { type: String, required: true, enum: ["Science", "Commerce", "Arts", "All"] },
    subjects: [{ type: String }],
    duration: { type: String, required: true },
    fee: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
