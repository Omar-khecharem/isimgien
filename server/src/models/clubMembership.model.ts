import mongoose, { Schema, Document, Model } from "mongoose";
import { MembershipStatus } from "../shared/enums";

export interface IClubMembership extends Document {
  club: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  academicYear: string;
  status: MembershipStatus;
  amountPaid: number;
  paymentDate: Date | null;
  receiptNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const clubMembershipSchema = new Schema<IClubMembership>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      match: [/^\d{4}-\d{4}$/, "Academic year format: YYYY-YYYY"],
    },
    status: {
      type: String,
      enum: Object.values(MembershipStatus),
      default: MembershipStatus.PENDING_PAYMENT,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount paid cannot be negative"],
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    receiptNumber: {
      type: String,
      default: null,
      trim: true,
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

clubMembershipSchema.index({ club: 1, user: 1, academicYear: 1 }, { unique: true });
clubMembershipSchema.index({ user: 1, status: 1 });
clubMembershipSchema.index({ club: 1, status: 1 });

export const ClubMembership: Model<IClubMembership> =
  mongoose.model<IClubMembership>("ClubMembership", clubMembershipSchema);
