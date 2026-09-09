import {
  requireSuperAdmin as _requireSuperAdmin,
  requireAuthenticated,
} from "../../middleware/policies.middleware";

export const requireSuperAdmin = _requireSuperAdmin;
export { requireAuthenticated as requireStudentOrAbove };
