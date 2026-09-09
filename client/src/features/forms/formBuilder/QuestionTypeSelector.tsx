import { FormQuestionType, QUESTION_TYPE_LABELS } from "./types";
import styles from "./FormBuilder.module.css";

interface QuestionTypeSelectorProps {
  value: FormQuestionType;
  onChange: (type: FormQuestionType) => void;
  disabled?: boolean;
}

const TYPE_GROUPS: { label: string; types: FormQuestionType[] }[] = [
  {
    label: "Texte",
    types: [FormQuestionType.SHORT_TEXT, FormQuestionType.LONG_TEXT],
  },
  {
    label: "Saisie",
    types: [FormQuestionType.EMAIL, FormQuestionType.NUMBER, FormQuestionType.DATE],
  },
  {
    label: "Choix",
    types: [
      FormQuestionType.SINGLE_CHOICE,
      FormQuestionType.MULTIPLE_CHOICE,
      FormQuestionType.DROPDOWN,
    ],
  },
];

export function QuestionTypeSelector({
  value,
  onChange,
  disabled,
}: QuestionTypeSelectorProps) {
  return (
    <div className={styles.typeSelector}>
      <label className={styles.typeSelectorLabel}>Type de question</label>
      <div className={styles.typeSelectorGrid}>
        {TYPE_GROUPS.map((group) => (
          <div key={group.label} className={styles.typeGroup}>
            <span className={styles.typeGroupLabel}>{group.label}</span>
            <div className={styles.typeGroupItems}>
              {group.types.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.typeOption} ${value === type ? styles["typeOption--active"] : ""}`}
                  onClick={() => onChange(type)}
                  disabled={disabled}
                  aria-pressed={value === type}
                >
                  {QUESTION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
