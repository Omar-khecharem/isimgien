import mongoose, { Schema, Document, Model } from "mongoose";
import { TransactionType, TransactionCategory } from "../shared/enums";

export interface ITransaction extends Document {
  club: mongoose.Types.ObjectId;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: Date;
  recordedBy: mongoose.Types.ObjectId;
  relatedMembership: mongoose.Types.ObjectId | null;
  receipt: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club is required"],
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, "Transaction type is required"],
    },
    category: {
      type: String,
      enum: Object.values(TransactionCategory),
      required: [true, "Transaction category is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    relatedMembership: {
      type: Schema.Types.ObjectId,
      ref: "ClubMembership",
      default: null,
    },
    receipt: {
      type: String,
      default: null,
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

transactionSchema.index({ club: 1, date: -1 });
transactionSchema.index({ club: 1, type: 1 });
transactionSchema.index({ club: 1, category: 1 });

export const Transaction: Model<ITransaction> =
  mongoose.model<ITransaction>("Transaction", transactionSchema);
