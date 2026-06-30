import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnquiry extends Document {
  name: string;
  phone: string;
  class: string;
  message?: string;
  status: "new" | "contacted" | "enrolled" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    class: { type: String, required: true },
    message: { type: String },
    status: { type: String, enum: ["new", "contacted", "enrolled", "closed"], default: "new" },
  },
  { timestamps: true }
);

const Enquiry: Model<IEnquiry> = mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;
