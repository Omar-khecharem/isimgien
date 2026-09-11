import mongoose, { Schema, Document, Model } from "mongoose";
import { EventStatus } from "../shared/enums";

export type EventType = "club" | "faculty";

export interface IEvent extends Document {
  club?: mongoose.Types.ObjectId;
  eventType: EventType;
  title: string;
  slug: string;
  description: string;
  poster: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number | null;
  status: EventStatus;
  isPublic: boolean;
  form?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  registeredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: false,
    },
    eventType: {
      type: String,
      enum: ["club", "faculty"],
      default: "club",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
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
      required: [true, "Event date is required"],
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
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    form: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: false,
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

eventSchema.index({ club: 1, date: 1 });
eventSchema.index({ status: 1, date: 1 });
eventSchema.index({ club: 1, status: 1 });
eventSchema.index({ eventType: 1, date: 1 });
eventSchema.index({ createdBy: 1 });

export const Event: Model<IEvent> = mongoose.model<IEvent>("Event", eventSchema);
