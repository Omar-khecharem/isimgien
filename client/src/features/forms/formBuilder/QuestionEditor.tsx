import { Input, Textarea } from "../../../components/ui";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { QuestionOptionEditor } from "./QuestionOptionEditor";
import { needsOptions } from "./types";
import type { FormBuilderQuestion, FormQuestionType } from "./types";
import styles from "./FormBuilder.module.css";

interface QuestionEditorProps {
  question: FormBuilderQuestion | null;
  isPublished: boolean;
  onUpdate: (id: string, updates: Partial<FormBuilderQuestion>) => void;
}

export function QuestionEditor({
  question,
  isPublished,
  onUpdate,
}: QuestionEditorProps) {
  if (!question) {
    return (
      <div className={styles.editorEmpty}>
        <div className={styles.editorEmptyIcon}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11h10M11 16h10M11 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className={styles.editorEmptyText}>
          Sélectionnez une question pour la modifier
        </p>
      </div>
    );
  }

  const handleTypeChange = (type: FormQuestionType) => {
    onUpdate(question.id, { type });
  };

  return (
    <div className={styles.editor}>
      <div className={styles.editorSection}>
        <QuestionTypeSelector
          value={question.type}
          onChange={handleTypeChange}
          disabled={isPublished}
        />
      </div>

      <div className={styles.editorSection}>
        <Input
          label="Titre de la question"
          value={question.label}
          onChange={(e) => onUpdate(question.id, { label: e.target.value })}
          placeholder="Ex: Quel est votre nom ?"
          disabled={isPublished}
        />
      </div>

      <div className={styles.editorSection}>
        <Textarea
          label="Description (optionnel)"
          value={question.description}
          onChange={(e) =>
            onUpdate(question.id, { description: e.target.value })
          }
          placeholder="Instructions supplémentaires pour cette question..."
          rows={2}
          disabled={isPublished}
        />
      </div>

      <div className={styles.editorSection}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) =>
              onUpdate(question.id, { required: e.target.checked })
            }
            disabled={isPublished}
            className={styles.toggleInput}
          />
          <span className={styles.toggleSwitch} />
          <span className={styles.toggleText}>Question requise</span>
        </label>
      </div>

      {needsOptions(question.type) && (
        <div className={styles.editorSection}>
          <QuestionOptionEditor
            options={question.options}
            onChange={(options) => onUpdate(question.id, { options })}
            disabled={isPublished}
          />
        </div>
      )}

      {question.type === "number" && (
        <div className={styles.editorSection}>
          <div className={styles.validationRow}>
            <Input
              label="Min"
              type="number"
              value={question.validation.min?.toString() || ""}
              onChange={(e) =>
                onUpdate(question.id, {
                  validation: {
                    ...question.validation,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              disabled={isPublished}
            />
            <Input
              label="Max"
              type="number"
              value={question.validation.max?.toString() || ""}
              onChange={(e) =>
                onUpdate(question.id, {
                  validation: {
                    ...question.validation,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              disabled={isPublished}
            />
          </div>
        </div>
      )}
    </div>
  );
}
