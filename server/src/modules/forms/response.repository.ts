import mongoose from "mongoose";
import {
  FormResponse,
  IFormResponse,
  IFormResponseQuestionSnapshot,
} from "../../models/formResponse.model";

// ─── Response CRUD ───────────────────────────────────────────────────────────

export async function findResponseById(id: string): Promise<IFormResponse | null> {
  return FormResponse.findById(id);
}

export async function findResponseByIdLean(id: string) {
  return FormResponse.findById(id)
    .populate("user", "firstName lastName email studentId avatar")
    .populate("form", "title description")
    .lean();
}

export async function createResponse(
  data: Partial<IFormResponse>
): Promise<IFormResponse> {
  return FormResponse.create(data);
}

export async function findResponseByFormAndUser(
  formId: string,
  userId: string
): Promise<IFormResponse | null> {
  return FormResponse.findOne({ form: formId, user: userId });
}

export async function findResponsesByForm(
  formId: string,
  skip: number,
  limit: number
) {
  const filter = { form: formId };
  const [responses, total] = await Promise.all([
    FormResponse.find(filter)
      .populate("user", "firstName lastName email studentId avatar")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormResponse.countDocuments(filter),
  ]);
  return { responses, total };
}

export async function findResponsesByFormAndVersion(
  formId: string,
  formVersion: number,
  skip: number,
  limit: number
) {
  const filter = { form: formId, formVersion };
  const [responses, total] = await Promise.all([
    FormResponse.find(filter)
      .populate("user", "firstName lastName email studentId avatar")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormResponse.countDocuments(filter),
  ]);
  return { responses, total };
}

export async function countResponsesByForm(formId: string): Promise<number> {
  return FormResponse.countDocuments({ form: formId });
}

export async function countResponsesByFormAndVersion(
  formId: string,
  formVersion: number
): Promise<number> {
  return FormResponse.countDocuments({ form: formId, formVersion });
}

export async function findUserResponses(userId: string, skip: number, limit: number) {
  const filter = { user: userId };
  const [responses, total] = await Promise.all([
    FormResponse.find(filter)
      .populate("form", "title description club")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FormResponse.countDocuments(filter),
  ]);
  return { responses, total };
}
