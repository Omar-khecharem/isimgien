import { FormQuestionType, needsOptions } from "./types";
import type { FormBuilderQuestion } from "./types";
import styles from "./FormBuilder.module.css";

interface QuestionPreviewProps {
  question: FormBuilderQuestion;
  index: number;
}

export function QuestionPreview({ question, index }: QuestionPreviewProps) {
  return (
    <div className={styles.preview}>
      <div className={styles.previewHeader}>
        <span className={styles.previewNumber}>{index + 1}</span>
        <span className={styles.previewLabel}>
          {question.label || "Question sans titre"}
        </span>
        {question.required && (
          <span className={styles.previewRequired} aria-label="Requis">*</span>
        )}
      </div>
      {question.description && (
        <p className={styles.previewDescription}>{question.description}</p>
      )}
      <div className={styles.previewInput}>
        {question.type === FormQuestionType.SHORT_TEXT && (
          <div className={styles.previewPlaceholder}>Réponse courte</div>
        )}
        {question.type === FormQuestionType.LONG_TEXT && (
          <div className={styles.previewPlaceholder}>Réponse longue</div>
        )}
        {question.type === FormQuestionType.EMAIL && (
          <div className={styles.previewPlaceholder}>email@exemple.com</div>
        )}
        {question.type === FormQuestionType.NUMBER && (
          <div className={styles.previewPlaceholder}>0</div>
        )}
        {question.type === FormQuestionType.DATE && (
          <div className={styles.previewPlaceholder}>jj/mm/aaaa</div>
        )}
        {question.type === FormQuestionType.SINGLE_CHOICE &&
          needsOptions(question.type) &&
          question.options.map((opt, i) => (
            <label key={i} className={styles.previewOption}>
              <span className={styles.previewRadio} />
              {opt.label}
            </label>
          ))}
        {question.type === FormQuestionType.MULTIPLE_CHOICE &&
          needsOptions(question.type) &&
          question.options.map((opt, i) => (
            <label key={i} className={styles.previewOption}>
              <span className={styles.previewCheckbox} />
              {opt.label}
            </label>
          ))}
        {question.type === FormQuestionType.DROPDOWN &&
          needsOptions(question.type) && (
            <div className={styles.previewPlaceholder}>
              Sélectionnez une option
            </div>
          )}
      </div>
    </div>
  );
}
