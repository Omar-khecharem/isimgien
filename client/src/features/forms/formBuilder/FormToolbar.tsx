import { Button } from "../../../components/ui";
import type { SaveStatus } from "./types";
import styles from "./FormBuilder.module.css";

interface FormToolbarProps {
  title: string;
  saveStatus: SaveStatus;
  isDirty: boolean;
  isPublished: boolean;
  questionCount: number;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function FormToolbar({
  title,
  saveStatus,
  isDirty,
  isPublished,
  questionCount,
  onSave,
  onPublish,
  onUnpublish,
}: FormToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <span className={styles.toolbarTitle}>
          {title || "Nouveau formulaire"}
        </span>
        <span className={styles.toolbarMeta}>
          {questionCount} question{questionCount !== 1 ? "s" : ""}
        </span>
        {isDirty && (
          <span className={styles.unsavedBadge}>Non sauvegardé</span>
        )}
        {saveStatus === "saving" && (
          <span className={styles.statusText}>Sauvegarde...</span>
        )}
        {saveStatus === "saved" && (
          <span className={styles.statusText}>Sauvegardé</span>
        )}
        {saveStatus === "error" && (
          <span className={styles.errorText}>Erreur</span>
        )}
      </div>
      <div className={styles.toolbarActions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          disabled={saveStatus === "saving" || !isDirty}
          loading={saveStatus === "saving"}
        >
          Sauvegarder
        </Button>
        {isPublished ? (
          <Button variant="danger" size="sm" onClick={onUnpublish}>
            Dépublier
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onPublish}
            disabled={questionCount === 0}
          >
            Publier
          </Button>
        )}
      </div>
    </div>
  );
}
