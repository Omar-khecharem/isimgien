import type {
  FormBuilderState,
  FormBuilderAction,
  FormBuilderQuestion,
} from "./types";
import { needsOptions, createDefaultOptions } from "./types";

export const initialState: FormBuilderState = {
  form: {
    id: null,
    title: "",
    description: "",
    clubId: "",
    isPublished: false,
    version: 0,
  },
  questions: [],
  selectedQuestionId: null,
  saveStatus: "idle",
  isDirty: false,
  isLoading: false,
  error: null,
  lastSavedAt: null,
};

export function formBuilderReducer(
  state: FormBuilderState,
  action: FormBuilderAction
): FormBuilderState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true, error: null };

    case "LOAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        form: action.form,
        questions: action.questions,
        isDirty: false,
        error: null,
      };

    case "LOAD_ERROR":
      return { ...state, isLoading: false, error: action.error };

    case "UPDATE_FORM_HEADER":
      return {
        ...state,
        form: {
          ...state.form,
          ...(action.title !== undefined && { title: action.title }),
          ...(action.description !== undefined && {
            description: action.description,
          }),
        },
        isDirty: true,
      };

    case "ADD_QUESTION":
      return {
        ...state,
        questions: [...state.questions, action.question],
        selectedQuestionId: action.question.id,
        isDirty: true,
      };

    case "UPDATE_QUESTION": {
      const questions = state.questions.map((q) =>
        q.id === action.id ? { ...q, ...action.updates } : q
      );
      return { ...state, questions, isDirty: true };
    }

    case "DELETE_QUESTION": {
      const filtered = state.questions.filter((q) => q.id !== action.id);
      const reordered = filtered.map((q, i) => ({ ...q, order: i }));
      const wasSelected = state.selectedQuestionId === action.id;
      return {
        ...state,
        questions: reordered,
        selectedQuestionId: wasSelected ? null : state.selectedQuestionId,
        isDirty: true,
      };
    }

    case "DUPLICATE_QUESTION": {
      const source = state.questions.find((q) => q.id === action.id);
      if (!source) return state;

      const newId = `q_${Date.now()}_dup`;
      const duplicate: FormBuilderQuestion = {
        ...source,
        id: newId,
        label: `${source.label} (copie)`,
        options: source.options.map((o) => ({ ...o })),
        order: state.questions.length,
      };

      const insertIndex = state.questions.findIndex(
        (q) => q.id === action.id
      );
      const before = state.questions.slice(0, insertIndex + 1);
      const after = state.questions.slice(insertIndex + 1);
      const all = [...before, duplicate, ...after].map((q, i) => ({
        ...q,
        order: i,
      }));

      return {
        ...state,
        questions: all,
        selectedQuestionId: newId,
        isDirty: true,
      };
    }

    case "REORDER_QUESTIONS": {
      const { fromIndex, toIndex } = action;
      if (fromIndex === toIndex) return state;
      const items = [...state.questions];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      const reordered = items.map((q, i) => ({ ...q, order: i }));
      return { ...state, questions: reordered, isDirty: true };
    }

    case "SELECT_QUESTION":
      return { ...state, selectedQuestionId: action.id };

    case "SAVE_START":
      return { ...state, saveStatus: "saving", error: null };

    case "SAVE_SUCCESS":
      return {
        ...state,
        saveStatus: "saved",
        form: action.form,
        isDirty: false,
        lastSavedAt: Date.now(),
      };

    case "SAVE_ERROR":
      return { ...state, saveStatus: "error", error: action.error };

    case "CLEAR_DIRTY":
      return { ...state, isDirty: false };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function validateForm(
  state: FormBuilderState
): string[] {
  const errors: string[] = [];

  if (!state.form.title.trim()) {
    errors.push("Le titre du formulaire est requis");
  }

  for (let i = 0; i < state.questions.length; i++) {
    const q = state.questions[i];
    if (!q.label.trim()) {
      errors.push(`La question ${i + 1} n'a pas de titre`);
    }
    if (needsOptions(q.type) && q.options.length < 2) {
      errors.push(
        `La question ${i + 1} nécessite au moins 2 options`
      );
    }
  }

  return errors;
}
