import mongoose, { Schema, Document, Model } from "mongoose";
import { FormQuestionType } from "../shared/enums";

export interface IFormQuestionOption {
  label: string;
  value: string;
}

export interface IFormQuestionValidation {
  min?: number;
  max?: number;
  pattern?: string;
}

export interface IFormQuestion {
  _id: mongoose.Types.ObjectId;
  type: FormQuestionType;
  label: string;
  description: string | null;
  required: boolean;
  options: IFormQuestionOption[] | null;
  validation: IFormQuestionValidation;
  order: number;
}

export interface IForm extends Document {
  title: string;
  description: string;
  club: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  questions: IFormQuestion[];
  isActive: boolean;
  isPublished: boolean;
  version: number;
  publishedQuestions: IFormQuestion[] | null;
  createdAt: Date;
  updatedAt: Date;
}

const formQuestionOptionSchema = new Schema<IFormQuestionOption>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const formQuestionSchema = new Schema<IFormQuestion>(
  {
    type: {
      type: String,
      enum: Object.values(FormQuestionType),
      required: [true, "Question type is required"],
    },
    label: {
      type: String,
      required: [true, "Question label is required"],
      trim: true,
      maxlength: [500, "Label cannot exceed 500 characters"],
    },
    description: {
      type: String,
      default: null,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [formQuestionOptionSchema],
      default: null,
      validate: {
        validator: function (this: IFormQuestion, val: IFormQuestionOption[] | null) {
          const needsOptions = [
            FormQuestionType.SINGLE_CHOICE,
            FormQuestionType.MULTIPLE_CHOICE,
            FormQuestionType.DROPDOWN,
          ];
          if (needsOptions.includes(this.type)) {
            return Array.isArray(val) && val.length >= 2;
          }
          return true;
        },
        message: "Choice-type questions must have at least 2 options",
      },
    },
    validation: {
      type: {
        min: { type: Number },
        max: { type: Number },
        pattern: { type: String },
      },
      default: {},
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const formSchema = new Schema<IForm>(
  {
    title: {
      type: String,
      required: [true, "Form title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: [true, "Club is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [formQuestionSchema],
      default: [],
      validate: {
        validator: function (val: IFormQuestion[]) {
          return val.length <= 50;
        },
        message: "A form cannot have more than 50 questions",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedQuestions: {
      type: [formQuestionSchema],
      default: null,
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

formSchema.index({ club: 1, isActive: 1 });
formSchema.index({ club: 1, isPublished: 1 });

export const Form: Model<IForm> = mongoose.model<IForm>("Form", formSchema);
