import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IGallery extends Document {
  title: string;
  imageUrl: string;
  publicId: string;
  category?: string;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    category: { type: String, default: "General" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Gallery: Model<IGallery> = mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);

export default Gallery;
