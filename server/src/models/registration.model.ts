import mongoose, { Schema, Document, Model } from "mongoose";
import { RegistrationStatus, RegistrationTargetType } from "../shared/enums";

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId;
  targetType: RegistrationTargetType;
  target: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  formResponse: mongoose.Types.ObjectId | null;
  validatedBy: mongoose.Types.ObjectId | null;
  validatedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    targetType: {
      type: String,
      enum: Object.values(RegistrationTargetType),
      required: [true, "Target type is required"],
    },
    target: {
      type: Schema.Types.ObjectId,
      required: [true, "Target is required"],
      refPath: "targetType",
    },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.PENDING,
    },
    formResponse: {
      type: Schema.Types.ObjectId,
      ref: "FormResponse",
      default: null,
    },
    validatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    validatedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
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

registrationSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
registrationSchema.index({ targetType: 1, target: 1, status: 1 });
registrationSchema.index({ user: 1, status: 1 });

export const Registration: Model<IRegistration> =
  mongoose.model<IRegistration>("Registration", registrationSchema);
