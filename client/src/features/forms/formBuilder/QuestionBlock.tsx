import { useRef, useCallback } from "react";
import { Badge } from "../../../components/ui";
import { QuestionPreview } from "./QuestionPreview";
import { QUESTION_TYPE_LABELS, needsOptions } from "./types";
import type { FormBuilderQuestion } from "./types";
import styles from "./FormBuilder.module.css";

interface QuestionBlockProps {
  question: FormBuilderQuestion;
  index: number;
  isSelected: boolean;
  isPublished: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function QuestionBlock({
  question,
  index,
  isSelected,
  isPublished,
  onSelect,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: QuestionBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
      if (e.key === "Delete" && !isPublished) {
        onDelete();
      }
      if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onDuplicate();
      }
    },
    [onSelect, onDelete, onDuplicate, isPublished]
  );

  return (
    <div
      ref={blockRef}
      className={`${styles.questionBlock} ${isSelected ? styles["questionBlock--selected"] : ""}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Question ${index + 1}: ${question.label || "sans titre"}`}
      aria-selected={isSelected}
      draggable={!isPublished}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <div className={styles.questionBlockHeader}>
        <div className={styles.dragHandle} aria-label="Glisser pour réordonner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="5" cy="4" r="1" fill="currentColor" />
            <circle cx="11" cy="4" r="1" fill="currentColor" />
            <circle cx="5" cy="8" r="1" fill="currentColor" />
            <circle cx="11" cy="8" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" />
            <circle cx="11" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className={styles.questionBlockActions}>
          <button
            type="button"
            className={styles.blockActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp || isPublished}
            aria-label="Monter la question"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3v8M4 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.blockActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown || isPublished}
            aria-label="Descendre la question"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 11V3M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.blockActionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            disabled={isPublished}
            aria-label="Dupliquer la question"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.blockActionBtn} ${styles.blockActionBtn--danger}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isPublished}
            aria-label="Supprimer la question"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M6 6.5v3M8 6.5v3M4 4l.5 7.5a1 1 0 001 1h3a1 1 0 001-1L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <QuestionPreview question={question} index={index} />

      <div className={styles.questionBlockFooter}>
        <Badge variant="info" size="sm">
          {QUESTION_TYPE_LABELS[question.type]}
        </Badge>
        {question.required && (
          <Badge variant="warning" size="sm">Requis</Badge>
        )}
        {needsOptions(question.type) && (
          <Badge variant="default" size="sm">
            {question.options.length} option{question.options.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}
