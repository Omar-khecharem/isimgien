export enum FormQuestionType {
  SHORT_TEXT = "short_text",
  LONG_TEXT = "long_text",
  EMAIL = "email",
  NUMBER = "number",
  SINGLE_CHOICE = "single_choice",
  MULTIPLE_CHOICE = "multiple_choice",
  DROPDOWN = "dropdown",
  DATE = "date",
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionValidation {
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormBuilderQuestion {
  id: string;
  type: FormQuestionType;
  label: string;
  description: string;
  required: boolean;
  options: QuestionOption[];
  validation: QuestionValidation;
  order: number;
}

export interface FormBuilderForm {
  id: string | null;
  title: string;
  description: string;
  clubId: string;
  isPublished: boolean;
  version: number;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface FormBuilderState {
  form: FormBuilderForm;
  questions: FormBuilderQuestion[];
  selectedQuestionId: string | null;
  saveStatus: SaveStatus;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  lastSavedAt: number | null;
}

export type FormBuilderAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; form: FormBuilderForm; questions: FormBuilderQuestion[] }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "UPDATE_FORM_HEADER"; title?: string; description?: string }
  | { type: "ADD_QUESTION"; question: FormBuilderQuestion }
  | { type: "UPDATE_QUESTION"; id: string; updates: Partial<FormBuilderQuestion> }
  | { type: "DELETE_QUESTION"; id: string }
  | { type: "DUPLICATE_QUESTION"; id: string }
  | { type: "REORDER_QUESTIONS"; fromIndex: number; toIndex: number }
  | { type: "SELECT_QUESTION"; id: string | null }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; form: FormBuilderForm }
  | { type: "SAVE_ERROR"; error: string }
  | { type: "CLEAR_DIRTY" }
  | { type: "RESET" };

export const QUESTION_TYPE_LABELS: Record<FormQuestionType, string> = {
  [FormQuestionType.SHORT_TEXT]: "Texte court",
  [FormQuestionType.LONG_TEXT]: "Texte long",
  [FormQuestionType.EMAIL]: "Email",
  [FormQuestionType.NUMBER]: "Nombre",
  [FormQuestionType.SINGLE_CHOICE]: "Choix unique",
  [FormQuestionType.MULTIPLE_CHOICE]: "Choix multiple",
  [FormQuestionType.DROPDOWN]: "Liste déroulante",
  [FormQuestionType.DATE]: "Date",
};

export const QUESTION_TYPE_ICONS: Record<FormQuestionType, string> = {
  [FormQuestionType.SHORT_TEXT]: "T",
  [FormQuestionType.LONG_TEXT]: "¶",
  [FormQuestionType.EMAIL]: "@",
  [FormQuestionType.NUMBER]: "#",
  [FormQuestionType.SINGLE_CHOICE]: "◉",
  [FormQuestionType.MULTIPLE_CHOICE]: "☑",
  [FormQuestionType.DROPDOWN]: "▾",
  [FormQuestionType.DATE]: "📅",
};

export const CHOICE_TYPES = [
  FormQuestionType.SINGLE_CHOICE,
  FormQuestionType.MULTIPLE_CHOICE,
  FormQuestionType.DROPDOWN,
];

export function needsOptions(type: FormQuestionType): boolean {
  return CHOICE_TYPES.includes(type);
}

let _idCounter = 0;
export function generateQuestionId(): string {
  return `q_${Date.now()}_${++_idCounter}`;
}

export function createDefaultQuestion(order: number): FormBuilderQuestion {
  return {
    id: generateQuestionId(),
    type: FormQuestionType.SHORT_TEXT,
    label: "",
    description: "",
    required: false,
    options: [],
    validation: {},
    order,
  };
}

export function createDefaultOptions(): QuestionOption[] {
  return [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
  ];
}
