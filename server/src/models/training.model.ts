import mongoose, { Schema, Document, Model } from "mongoose";
import { TrainingStatus } from "../shared/enums";

export interface ITraining extends Document {
  club: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  poster: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number | null;
  status: TrainingStatus;
  requiresValidation: boolean;
  linkedForm: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  registeredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club is required"],
    },
    title: {
      type: String,
      required: [true, "Training title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [10000, "Description cannot exceed 10000 characters"],
    },
    poster: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      required: [true, "Training date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format: HH:mm"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Time format: HH:mm"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },
    capacity: {
      type: Number,
      default: null,
      min: [0, "Capacity cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(TrainingStatus),
      default: TrainingStatus.DRAFT,
    },
    requiresValidation: {
      type: Boolean,
      default: false,
    },
    linkedForm: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
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

trainingSchema.index({ club: 1, date: 1 });
trainingSchema.index({ status: 1, date: 1 });
trainingSchema.index({ club: 1, status: 1 });
trainingSchema.index({ club: 1, slug: 1 }, { unique: true });

export const Training: Model<ITraining> =
  mongoose.model<ITraining>("Training", trainingSchema);
