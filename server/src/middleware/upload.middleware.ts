import multer from "multer";
import path from "path";
import crypto from "crypto";
import { config } from "../config";
import { ApiError, ErrorCode } from "../shared/utils/ApiError";

function createStorage(subDir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(config.upload.dir, subDir));
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = crypto.randomBytes(16).toString("hex");
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

function fileFilter(allowedMimeTypes: readonly string[]) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        ApiError.badRequest(
          `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
        ) as any
      );
    }
  };
}

export const uploadAvatar = multer({
  storage: createStorage("avatars"),
  limits: { fileSize: config.upload.maxSizes.avatar },
  fileFilter: fileFilter(config.upload.allowedImageTypes),
});

export const uploadPoster = multer({
  storage: createStorage("posters"),
  limits: { fileSize: config.upload.maxSizes.poster },
  fileFilter: fileFilter(config.upload.allowedImageTypes),
});

export const uploadFormFile = multer({
  storage: createStorage("forms"),
  limits: { fileSize: config.upload.maxSizes.formFile },
  fileFilter: fileFilter(config.upload.allowedFileTypes),
});

export const uploadReceipt = multer({
  storage: createStorage("receipts"),
  limits: { fileSize: config.upload.maxSizes.receipt },
  fileFilter: fileFilter(config.upload.allowedFileTypes),
});
