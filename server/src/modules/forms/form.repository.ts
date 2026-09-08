import mongoose from "mongoose";
import { Form, IForm, IFormQuestion } from "../../models/form.model";

// ─── Form CRUD ───────────────────────────────────────────────────────────────

export async function findFormById(id: string): Promise<IForm | null> {
  return Form.findById(id);
}

export async function findFormByIdLean(id: string) {
  return Form.findById(id).populate("club", "name slug logo").lean();
}

export async function findPublishedFormByIdLean(id: string) {
  return Form.findById(id)
    .populate("club", "name slug logo")
    .select("-__v -createdAt -updatedAt")
    .lean();
}

export async function createForm(data: Partial<IForm>): Promise<IForm> {
  return Form.create(data);
}

export async function updateForm(
  id: string,
  data: Partial<IForm>
): Promise<IForm | null> {
  return Form.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteForm(id: string): Promise<IForm | null> {
  return Form.findByIdAndDelete(id);
}

export async function formExistsByTitle(
  clubId: string,
  title: string,
  excludeId?: string
): Promise<boolean> {
  const query: Record<string, unknown> = { club: clubId, title };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  return Form.exists(query).then(Boolean);
}

export async function findFormsByClub(
  clubId: string,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  skip: number,
  limit: number
) {
  const combinedFilter = { ...filter, club: clubId };
  const [forms, total] = await Promise.all([
    Form.find(combinedFilter)
      .populate("createdBy", "firstName lastName email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Form.countDocuments(combinedFilter),
  ]);
  return { forms, total };
}

// ─── Question Management ─────────────────────────────────────────────────────

export async function addQuestion(
  formId: string,
  question: Omit<IFormQuestion, "_id">
): Promise<IForm | null> {
  return Form.findByIdAndUpdate(
    formId,
    { $push: { questions: question } },
    { new: true, runValidators: true }
  );
}

export async function updateQuestion(
  formId: string,
  questionId: string,
  data: Partial<IFormQuestion>
): Promise<IForm | null> {
  const updateOps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updateOps[`questions.$.${key}`] = value;
    }
  }

  return Form.findOneAndUpdate(
    { _id: formId, "questions._id": questionId },
    { $set: updateOps },
    { new: true, runValidators: true }
  );
}

export async function removeQuestion(
  formId: string,
  questionId: string
): Promise<IForm | null> {
  return Form.findByIdAndUpdate(
    formId,
    { $pull: { questions: { _id: questionId } } },
    { new: true, runValidators: true }
  );
}

export async function reorderQuestions(
  formId: string,
  orderedIds: string[]
): Promise<IForm | null> {
  const form = await Form.findById(formId);
  if (!form) return null;

  const questionMap = new Map(
    form.questions.map((q) => [q._id.toString(), q])
  );

  const reordered: IFormQuestion[] = [];
  for (let i = 0; i < orderedIds.length; i++) {
    const q = questionMap.get(orderedIds[i]);
    if (q) {
      q.order = i;
      reordered.push(q);
    }
  }

  // Add any questions not in orderedIds at the end
  for (const q of form.questions) {
    if (!orderedIds.includes(q._id.toString())) {
      q.order = reordered.length;
      reordered.push(q);
    }
  }

  form.questions = reordered;
  await form.save();
  return form;
}

// ─── Publishing ──────────────────────────────────────────────────────────────

export async function publishForm(formId: string): Promise<IForm | null> {
  const form = await Form.findById(formId);
  if (!form) return null;

  // Deep clone questions into publishedQuestions
  const snapshot = JSON.parse(JSON.stringify(form.questions));
  form.publishedQuestions = snapshot;
  form.isPublished = true;
  form.version = form.version + 1;
  await form.save();
  return form;
}

export async function unpublishForm(formId: string): Promise<IForm | null> {
  return Form.findByIdAndUpdate(
    formId,
    { isPublished: false },
    { new: true, runValidators: true }
  );
}
