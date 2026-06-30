import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAttendanceRecord {
  studentId: Types.ObjectId;
  status: "present" | "absent" | "late";
  remarks?: string;
}

export interface IAttendance extends Document {
  date: Date;
  class: string;
  records: IAttendanceRecord[];
  markedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: { type: String, enum: ["present", "absent", "late"], required: true },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: Date, required: true },
    class: { type: String, required: true },
    records: [AttendanceRecordSchema],
    markedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

AttendanceSchema.index({ date: 1, class: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
