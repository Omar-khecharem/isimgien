import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { Role } from "../shared/enums/roles";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  avatar: string | null;
  phone: string | null;
  studentId: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [100, "First name cannot exceed 100 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [100, "Last name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ lastName: 1, firstName: 1 });

// ─── Password hashing ────────────────────────────────────────────────────────

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Super Admin safeguards ──────────────────────────────────────────────────

// Block role changes involving SUPER_ADMIN through normal save operations.
// The seed script is the only path to create a Super Admin.
userSchema.pre("save", async function (next) {
  if (!this.isModified("role")) return next();

  if (this.isNew && this.role === Role.SUPER_ADMIN) {
    const existingSuperAdmin = await mongoose
      .model<IUser>("User")
      .countDocuments({ role: Role.SUPER_ADMIN });
    if (existingSuperAdmin > 0) {
      return next(
        new Error("A Super Admin already exists. Cannot create another.")
      );
    }
    return next();
  }

  if (this.role === Role.SUPER_ADMIN && !this.isNew) {
    return next(
      new Error("Cannot assign Super Admin role through normal operations")
    );
  }

  next();
});

// Prevent deletion of the Super Admin user via query middleware
userSchema.pre("findOneAndDelete", async function (next) {
  const doc = (await this.model
    .findOne(this.getFilter())
    .lean()) as { role?: string } | null;
  if (doc && doc.role === Role.SUPER_ADMIN) {
    return next(new Error("Super Admin account cannot be deleted"));
  }
  next();
});

// ─── Instance methods ────────────────────────────────────────────────────────

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
