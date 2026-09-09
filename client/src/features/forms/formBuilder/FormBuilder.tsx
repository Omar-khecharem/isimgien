import { Spinner } from "../../../components/ui";
import { useFormBuilder } from "./useFormBuilder";
import { FormToolbar } from "./FormToolbar";
import { FormHeader } from "./FormHeader";
import { QuestionList } from "./QuestionList";
import { QuestionEditor } from "./QuestionEditor";
import styles from "./FormBuilder.module.css";

interface FormBuilderProps {
  clubId: string;
  formId?: string;
}

export function FormBuilder({ clubId, formId }: FormBuilderProps) {
  const {
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
  } = useFormBuilder(clubId, formId);

  const selectedQuestion = state.questions.find(
    (q) => q.id === state.selectedQuestionId
  );

  if (state.isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="lg" />
        <p>Chargement du formulaire...</p>
      </div>
    );
  }

  if (state.error && !state.form.id && !state.isDirty) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorText}>{state.error}</p>
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      <FormToolbar
        title={state.form.title}
        saveStatus={state.saveStatus}
        isDirty={state.isDirty}
        isPublished={state.form.isPublished}
        questionCount={state.questions.length}
        onSave={save}
        onPublish={publish}
        onUnpublish={unpublish}
      />

      <div className={styles.builderBody}>
        <div className={styles.canvas}>
          <FormHeader
            title={state.form.title}
            description={state.form.description}
            isPublished={state.form.isPublished}
            onChange={updateFormHeader}
          />

          <QuestionList
            questions={state.questions}
            selectedQuestionId={state.selectedQuestionId}
            isPublished={state.form.isPublished}
            onSelect={selectQuestion}
            onDuplicate={duplicateQuestion}
            onDelete={deleteQuestion}
            onReorder={reorderQuestions}
            onAddQuestion={() => addQuestion()}
          />

          {state.saveStatus === "error" && state.error && (
            <div className={styles.saveError}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {state.error}
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <QuestionEditor
            question={selectedQuestion || null}
            isPublished={state.form.isPublished}
            onUpdate={updateQuestion}
          />
        </div>
      </div>
    </div>
  );
}
