import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  rollNo: string;
  name: string;
  class: string;
  subjects: string[];
  phone: string;
  parentPhone: string;
  email?: string;
  address: string;
  photo?: string;
  dateOfBirth?: Date;
  joiningDate: Date;
  isActive: boolean;
  totalFee: number;
  feesPaid: number;
  pendingFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    rollNo: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    class: {
      type: String,
      required: true,
      enum: ["XI Science", "XI Commerce", "XI Arts", "XII Science", "XII Commerce", "XII Arts"],
    },
    subjects: [{ type: String }],
    phone: { type: String, required: true },
    parentPhone: { type: String, required: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, required: true },
    photo: { type: String },
    dateOfBirth: { type: Date },
    joiningDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    totalFee: { type: Number, required: true, default: 0 },
    feesPaid: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

StudentSchema.virtual("pendingFee").get(function (this: IStudent) {
  return Math.max(this.totalFee - this.feesPaid, 0);
});

StudentSchema.index({ name: "text", rollNo: "text" });

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
