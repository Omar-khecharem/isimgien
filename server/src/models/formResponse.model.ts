import mongoose, { Schema, Document, Model } from "mongoose";
import { FormQuestionType } from "../shared/enums";

export interface IFormAnswer {
  questionId: mongoose.Types.ObjectId;
  value: string | string[] | number | Date | null;
}

export interface IFormResponseQuestionSnapshot {
  _id: mongoose.Types.ObjectId;
  type: FormQuestionType;
  label: string;
  description: string | null;
  required: boolean;
  options: { label: string; value: string }[] | null;
  validation: { min?: number; max?: number; pattern?: string };
  order: number;
}

export interface IFormResponse extends Document {
  form: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  formVersion: number;
  questionDefinitions: IFormResponseQuestionSnapshot[];
  answers: IFormAnswer[];
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const formResponseQuestionSnapshotSchema = new Schema<IFormResponseQuestionSnapshot>(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: Object.values(FormQuestionType),
      required: true,
    },
    label: { type: String, required: true },
    description: { type: String, default: null },
    required: { type: Boolean, default: false },
    options: {
      type: [
        new Schema(
          { label: { type: String, required: true }, value: { type: String, required: true } },
          { _id: false }
        ),
      ],
      default: null,
    },
    validation: {
      type: {
        min: { type: Number },
        max: { type: Number },
        pattern: { type: String },
      },
      default: {},
    },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const formAnswerSchema = new Schema<IFormAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { _id: false }
);

const formResponseSchema = new Schema<IFormResponse>(
  {
    form: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: [true, "Form is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    formVersion: {
      type: Number,
      required: [true, "Form version is required"],
      min: 1,
    },
    questionDefinitions: {
      type: [formResponseQuestionSnapshotSchema],
      required: true,
      validate: {
        validator: function (val: IFormResponseQuestionSnapshot[]) {
          return val.length > 0;
        },
        message: "Question definitions snapshot is required",
      },
    },
    answers: {
      type: [formAnswerSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
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

formResponseSchema.index({ form: 1, user: 1 }, { unique: true });
formResponseSchema.index({ form: 1, formVersion: 1 });
formResponseSchema.index({ user: 1 });

export const FormResponse: Model<IFormResponse> =
  mongoose.model<IFormResponse>("FormResponse", formResponseSchema);
