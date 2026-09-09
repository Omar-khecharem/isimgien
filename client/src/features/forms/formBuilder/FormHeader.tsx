import { Input, Textarea, Badge } from "../../../components/ui";
import styles from "./FormBuilder.module.css";

interface FormHeaderProps {
  title: string;
  description: string;
  isPublished: boolean;
  onChange: (updates: { title?: string; description?: string }) => void;
}

export function FormHeader({
  title,
  description,
  isPublished,
  onChange,
}: FormHeaderProps) {
  return (
    <div className={styles.formHeader}>
      <div className={styles.formHeaderTop}>
        <Input
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Titre du formulaire"
          className={styles.titleInput}
        />
        <Badge variant={isPublished ? "success" : "default"} size="sm">
          {isPublished ? "Publié" : "Brouillon"}
        </Badge>
      </div>
      <Textarea
        value={description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description du formulaire (optionnel)"
        rows={2}
        className={styles.descriptionInput}
      />
    </div>
  );
}
