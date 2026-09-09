import { useState, useCallback, useRef } from "react";
import { Button, EmptyState } from "../../../components/ui";
import { QuestionBlock } from "./QuestionBlock";
import type { FormBuilderQuestion } from "./types";
import styles from "./FormBuilder.module.css";

interface QuestionListProps {
  questions: FormBuilderQuestion[];
  selectedQuestionId: string | null;
  isPublished: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onAddQuestion: () => void;
}

export function QuestionList({
  questions,
  selectedQuestionId,
  isPublished,
  onSelect,
  onDuplicate,
  onDelete,
  onReorder,
  onAddQuestion,
}: QuestionListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (isPublished) return;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    [isPublished]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = dragIndex;
      if (fromIndex !== null && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (isPublished) return;

      if (e.key === "ArrowUp" && (e.altKey || e.ctrlKey)) {
        e.preventDefault();
        if (index > 0) onReorder(index, index - 1);
      }
      if (e.key === "ArrowDown" && (e.altKey || e.ctrlKey)) {
        e.preventDefault();
        if (index < questions.length - 1) onReorder(index, index + 1);
      }
    },
    [isPublished, questions.length, onReorder]
  );

  if (questions.length === 0) {
    return (
      <div className={styles.emptyForm}>
        <EmptyState
          title="Aucune question"
          description="Commencez à créer votre formulaire en ajoutant des questions."
          action={
            <Button variant="primary" size="sm" onClick={onAddQuestion}>
              Ajouter une question
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={styles.questionList}
      role="listbox"
      aria-label="Liste des questions"
      onKeyDown={(e) => {
        const idx = questions.findIndex((q) => q.id === selectedQuestionId);
        if (idx >= 0) handleKeyDown(e, idx);
      }}
    >
      {questions.map((question, index) => (
        <div
          key={question.id}
          className={`${styles.questionListItem} ${dragOverIndex === index ? styles["questionListItem--dragOver"] : ""} ${dragIndex === index ? styles["questionListItem--dragging"] : ""}`}
          role="option"
          aria-selected={question.id === selectedQuestionId}
        >
          <QuestionBlock
            question={question}
            index={index}
            isSelected={question.id === selectedQuestionId}
            isPublished={isPublished}
            onSelect={() => onSelect(question.id)}
            onDuplicate={() => onDuplicate(question.id)}
            onDelete={() => onDelete(question.id)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onMoveUp={() => index > 0 && onReorder(index, index - 1)}
            onMoveDown={() =>
              index < questions.length - 1 && onReorder(index, index + 1)
            }
            canMoveUp={index > 0}
            canMoveDown={index < questions.length - 1}
          />
        </div>
      ))}

      <button
        type="button"
        className={styles.addQuestionBtn}
        onClick={onAddQuestion}
        disabled={isPublished}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Ajouter une question
      </button>
    </div>
  );
}
