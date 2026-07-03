import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPendingPayment extends Document {
  name: string;
  phone: string;
  studentClass: string;
  admissionNumber?: string;
  userType: "existing" | "new";
  amount: number;
  utr: string;
  screenshotUrl: string;
  screenshotPublicId: string;
  status: "pending" | "verified" | "rejected";
  studentId?: Types.ObjectId;
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PendingPaymentSchema = new Schema<IPendingPayment>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    studentClass: { type: String, required: true },
    admissionNumber: { type: String, trim: true },
    userType: { type: String, enum: ["existing", "new"], required: true },
    amount: { type: Number, required: true },
    utr: { type: String, required: true, trim: true },
    screenshotUrl: { type: String, required: true },
    screenshotPublicId: { type: String, required: true },
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reviewNotes: { type: String },
  },
  { timestamps: true }
);

PendingPaymentSchema.index({ status: 1, createdAt: -1 });

const PendingPayment: Model<IPendingPayment> =
  mongoose.models.PendingPayment || mongoose.model<IPendingPayment>("PendingPayment", PendingPaymentSchema);

export default PendingPayment;
