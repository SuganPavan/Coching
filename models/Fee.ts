import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFee extends Document {
  studentId: Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "upi" | "card" | "netbanking" | "razorpay";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  receiptNumber: string;
  month: string;
  remarks?: string;
  collectedBy?: Types.ObjectId;
  createdAt: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "razorpay"],
      required: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    receiptNumber: { type: String, required: true, unique: true },
    month: { type: String, required: true },
    remarks: { type: String },
    collectedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Fee: Model<IFee> = mongoose.models.Fee || mongoose.model<IFee>("Fee", FeeSchema);

export default Fee;
