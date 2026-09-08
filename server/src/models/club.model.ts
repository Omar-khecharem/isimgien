import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClubSocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface IClubSettings {
  requireRegistrationValidation: boolean;
  defaultTrainingCapacity: number | null;
  membershipFee: number;
  membershipPeriodMonths: number;
}

export interface IClub extends Document {
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  coverImage: string | null;
  leader: mongoose.Types.ObjectId | null;
  establishedDate: Date | null;
  isActive: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  socialLinks: IClubSocialLinks;
  settings: IClubSettings;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      unique: true,
      trim: true,
      maxlength: [200, "Club name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"],
    },
    description: {
      type: String,
      required: [true, "Club description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    logo: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    establishedDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    contactEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      default: null,
      trim: true,
    },
    socialLinks: {
      type: {
        website: { type: String, default: undefined },
        facebook: { type: String, default: undefined },
        instagram: { type: String, default: undefined },
        linkedin: { type: String, default: undefined },
      },
      default: {},
    },
    settings: {
      type: {
        requireRegistrationValidation: { type: Boolean, default: false },
        defaultTrainingCapacity: { type: Number, default: null, min: 0 },
        membershipFee: { type: Number, default: 0, min: 0 },
        membershipPeriodMonths: { type: Number, default: 12, min: 1 },
      },
      default: {},
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

clubSchema.index({ isActive: 1 });
clubSchema.index({ leader: 1 });

export const Club: Model<IClub> = mongoose.model<IClub>("Club", clubSchema);
