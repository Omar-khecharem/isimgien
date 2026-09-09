import { Button } from "../../../components/ui";
import type { QuestionOption } from "./types";
import styles from "./FormBuilder.module.css";

interface QuestionOptionEditorProps {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
  disabled?: boolean;
}

export function QuestionOptionEditor({
  options,
  onChange,
  disabled,
}: QuestionOptionEditorProps) {
  const addOption = () => {
    const newLabel = `Option ${options.length + 1}`;
    const newValue = `option_${options.length + 1}`;
    onChange([...options, { label: newLabel, value: newValue }]);
  };

  const updateOption = (index: number, label: string) => {
    const updated = options.map((o, i) =>
      i === index ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "_") } : o
    );
    onChange(updated);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const moveOption = (from: number, to: number) => {
    if (to < 0 || to >= options.length) return;
    const items = [...options];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    onChange(items);
  };

  return (
    <div className={styles.optionEditor}>
      <label className={styles.optionEditorLabel}>Options</label>
      <div className={styles.optionList}>
        {options.map((opt, index) => (
          <div key={index} className={styles.optionRow}>
            <span className={styles.optionIndex}>{index + 1}</span>
            <input
              type="text"
              value={opt.label}
              onChange={(e) => updateOption(index, e.target.value)}
              disabled={disabled}
              className={styles.optionInput}
              aria-label={`Option ${index + 1}`}
            />
            <div className={styles.optionActions}>
              <button
                type="button"
                className={styles.optionActionBtn}
                onClick={() => moveOption(index, index - 1)}
                disabled={disabled || index === 0}
                aria-label="Monter l'option"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3v8M4 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.optionActionBtn}
                onClick={() => moveOption(index, index + 1)}
                disabled={disabled || index === options.length - 1}
                aria-label="Descendre l'option"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 11V3M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.optionActionBtn} ${styles.optionActionBtn--danger}`}
                onClick={() => removeOption(index)}
                disabled={disabled || options.length <= 2}
                aria-label={`Supprimer l'option ${index + 1}`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="xs"
        onClick={addOption}
        disabled={disabled}
        icon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        }
      >
        Ajouter une option
      </Button>
    </div>
  );
}
