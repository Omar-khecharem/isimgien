import mongoose, { Schema, Document, Model } from "mongoose";
import { AttendanceStatus } from "../shared/enums";

export interface IAttendanceCheckAction {
  time: Date | null;
  recordedBy: mongoose.Types.ObjectId | null;
  method: "manual" | "qr_code";
}

export interface IAttendance extends Document {
  training: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  checkIn: IAttendanceCheckAction;
  checkOut: IAttendanceCheckAction;
  status: AttendanceStatus;
  qrToken: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceCheckActionSchema = new Schema<IAttendanceCheckAction>(
  {
    time: {
      type: Date,
      default: null,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    method: {
      type: String,
      enum: ["manual", "qr_code"],
      default: "manual",
    },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    training: {
      type: Schema.Types.ObjectId,
      ref: "Training",
      required: [true, "Training is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    checkIn: {
      type: attendanceCheckActionSchema,
      default: () => ({}),
    },
    checkOut: {
      type: attendanceCheckActionSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      default: AttendanceStatus.NOT_ATTENDED,
    },
    qrToken: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

attendanceSchema.index({ training: 1, user: 1 }, { unique: true });
attendanceSchema.index({ user: 1, status: 1 });
attendanceSchema.index({ training: 1, status: 1 });

export const Attendance: Model<IAttendance> =
  mongoose.model<IAttendance>("Attendance", attendanceSchema);
