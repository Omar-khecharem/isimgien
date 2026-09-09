import { useReducer, useCallback, useEffect, useRef } from "react";
import { formsService, type Form, type FormQuestion } from "../formsService";
import {
  formBuilderReducer,
  initialState,
  validateForm,
} from "./formBuilderReducer";
import type {
  FormBuilderForm,
  FormBuilderQuestion,
  SaveStatus,
} from "./types";
import {
  FormQuestionType,
  needsOptions,
  createDefaultOptions,
  generateQuestionId,
  createDefaultQuestion,
} from "./types";

function mapServerForm(form: Form): {
  fbForm: FormBuilderForm;
  fbQuestions: FormBuilderQuestion[];
} {
  return {
    fbForm: {
      id: form._id,
      title: form.title,
      description: form.description,
      clubId: form.club,
      isPublished: form.isPublished,
      version: form.version,
    },
    fbQuestions: form.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        id: q._id,
        type: q.type as FormQuestionType,
        label: q.label,
        description: q.description || "",
        required: q.required,
        options: q.options || [],
        validation: q.validation || {},
        order: q.order,
      })),
  };
}

function mapToServer(questions: FormBuilderQuestion[]): FormQuestion[] {
  return questions.map((q, i) => ({
    _id: q.id.startsWith("q_") ? "" : q.id,
    type: q.type,
    label: q.label,
    description: q.description || null,
    required: q.required,
    options: needsOptions(q.type) ? q.options : null,
    validation: q.validation,
    order: i,
  }));
}

export function useFormBuilder(clubId?: string, formId?: string) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  const loadForm = useCallback(
    async (cId: string, fId: string) => {
      dispatch({ type: "LOAD_START" });
      try {
        const response = await formsService.getById(cId, fId);
        const { fbForm, fbQuestions } = mapServerForm(response.data);
        dispatch({ type: "LOAD_SUCCESS", form: fbForm, questions: fbQuestions });
      } catch (err: any) {
        dispatch({
          type: "LOAD_ERROR",
          error: err?.error?.message || "Erreur lors du chargement du formulaire",
        });
      }
    },
    []
  );

  useEffect(() => {
    if (clubId && formId && isInitialLoad.current) {
      isInitialLoad.current = false;
      loadForm(clubId, formId);
    }
  }, [clubId, formId, loadForm]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  const updateFormHeader = useCallback(
    (updates: { title?: string; description?: string }) => {
      dispatch({ type: "UPDATE_FORM_HEADER", ...updates });
    },
    []
  );

  const addQuestion = useCallback(
    (afterIndex?: number) => {
      const insertAt =
        afterIndex !== undefined ? afterIndex + 1 : state.questions.length;
      const question = createDefaultQuestion(insertAt);
      if (needsOptions(question.type)) {
        question.options = createDefaultOptions();
      }
      dispatch({ type: "ADD_QUESTION", question });
    },
    [state.questions.length]
  );

  const updateQuestion = useCallback(
    (id: string, updates: Partial<FormBuilderQuestion>) => {
      const current = state.questions.find((q) => q.id === id);
      if (!current) return;

      const nextType = updates.type ?? current.type;
      const typeChanged = updates.type && updates.type !== current.type;

      const finalUpdates = { ...updates };

      if (typeChanged) {
        if (needsOptions(nextType) && (!updates.options || updates.options.length < 2)) {
          finalUpdates.options = createDefaultOptions();
        } else if (!needsOptions(nextType)) {
          finalUpdates.options = [];
        }
      }

      dispatch({ type: "UPDATE_QUESTION", id, updates: finalUpdates });
    },
    [state.questions]
  );

  const deleteQuestion = useCallback((id: string) => {
    dispatch({ type: "DELETE_QUESTION", id });
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    dispatch({ type: "DUPLICATE_QUESTION", id });
  }, []);

  const reorderQuestions = useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: "REORDER_QUESTIONS", fromIndex, toIndex });
    },
    []
  );

  const selectQuestion = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_QUESTION", id });
  }, []);

  const save = useCallback(async () => {
    if (!clubId) return;

    const validationErrors = validateForm(state);
    if (validationErrors.length > 0) {
      dispatch({ type: "SAVE_ERROR", error: validationErrors.join(". ") });
      return;
    }

    dispatch({ type: "SAVE_START" });

    try {
      const serverQuestions = mapToServer(state.questions);

      if (state.form.id) {
        await formsService.update(clubId, state.form.id, {
          title: state.form.title,
          description: state.form.description,
        } as any);

        for (const q of serverQuestions) {
          if (q._id && !q._id.startsWith("q_")) {
            await fetch(
              `/api/v1/clubs/${clubId}/forms/${state.form.id}/questions/${q._id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                credentials: "include",
                body: JSON.stringify({
                  type: q.type,
                  label: q.label,
                  description: q.description,
                  required: q.required,
                  options: q.options,
                  validation: q.validation,
                }),
              }
            );
          }
        }

        const response = await formsService.getById(clubId, state.form.id);
        const { fbForm, fbQuestions } = mapServerForm(response.data);
        dispatch({ type: "SAVE_SUCCESS", form: fbForm });
        dispatch({ type: "LOAD_SUCCESS", form: fbForm, questions: fbQuestions });
      } else {
        const response = await formsService.create(clubId, {
          title: state.form.title || "Nouveau formulaire",
          description: state.form.description,
          questions: serverQuestions as any,
        });
        const { fbForm, fbQuestions } = mapServerForm(response.data);
        dispatch({ type: "SAVE_SUCCESS", form: fbForm });
        dispatch({ type: "LOAD_SUCCESS", form: fbForm, questions: fbQuestions });
      }
    } catch (err: any) {
      dispatch({
        type: "SAVE_ERROR",
        error: err?.error?.message || "Erreur lors de la sauvegarde",
      });
    }
  }, [clubId, state]);

  const publish = useCallback(async () => {
    if (!clubId || !state.form.id) return;
    await save();
    try {
      await formsService.publish(clubId, state.form.id);
      const response = await formsService.getById(clubId, state.form.id);
      const { fbForm, fbQuestions } = mapServerForm(response.data);
      dispatch({ type: "LOAD_SUCCESS", form: fbForm, questions: fbQuestions });
    } catch (err: any) {
      dispatch({
        type: "SAVE_ERROR",
        error: err?.error?.message || "Erreur lors de la publication",
      });
    }
  }, [clubId, state.form.id, save]);

  const unpublish = useCallback(async () => {
    if (!clubId || !state.form.id) return;
    try {
      await formsService.unpublish(clubId, state.form.id);
      const response = await formsService.getById(clubId, state.form.id);
      const { fbForm, fbQuestions } = mapServerForm(response.data);
      dispatch({ type: "LOAD_SUCCESS", form: fbForm, questions: fbQuestions });
    } catch (err: any) {
      dispatch({
        type: "SAVE_ERROR",
        error: err?.error?.message || "Erreur lors de la dépublication",
      });
    }
  }, [clubId, state.form.id]);

  return {
    state,
    updateFormHeader,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    selectQuestion,
    save,
    publish,
    unpublish,
    loadForm,
  };
}
