import { Badge } from "../../../components/ui";
import { AttendanceStatus } from "../attendanceService";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "info" }
> = {
  [AttendanceStatus.NOT_ATTENDED]: {
    label: "Non présenté",
    variant: "default",
  },
  [AttendanceStatus.CHECKED_IN]: {
    label: "Présent",
    variant: "primary",
  },
  [AttendanceStatus.CHECKED_OUT]: {
    label: "Sorti",
    variant: "success",
  },
  [AttendanceStatus.ABSENT]: {
    label: "Absent",
    variant: "danger",
  },
  [AttendanceStatus.INCOMPLETE]: {
    label: "Incomplet",
    variant: "warning",
  },
};

export function AttendanceStatusBadge({
  status,
  size = "sm",
}: AttendanceStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[AttendanceStatus.NOT_ATTENDED];

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
}
