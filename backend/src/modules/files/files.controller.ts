import type { Request, Response } from "express";
import { FilesService, type UploadPurpose, PURPOSES } from "./files.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";

export class FilesController {
  static async upload(req: Request, res: Response) {
    const file = req.file;
    if (!file) throw ApiError.badRequest("No file uploaded");

    const purpose = (req.query.purpose || req.body.purpose) as UploadPurpose;
    if (!purpose || !PURPOSES.includes(purpose)) {
      throw ApiError.badRequest(`Invalid or missing upload purpose. Must be one of: ${PURPOSES.join(", ")}`);
    }

    const record = await FilesService.uploadFile(file, purpose, (req.user as any).id);
    return sendSuccess(res, record, "File uploaded successfully", 201);
  }

  static async getFile(req: Request, res: Response) {
    const file = await FilesService.getFile(req.params.id as string);
    if (!file) throw ApiError.notFound("File record not found");

    const isAdminRole = (req.user as any).role === "admin" || (req.user as any).role === "super_admin";
    if (!isAdminRole && file.owner.toString() !== (req.user as any).id) {
      throw ApiError.forbidden("Access denied");
    }

    return sendSuccess(res, file, "File record");
  }

  static async deleteFile(req: Request, res: Response) {
    const isAdminRole = (req.user as any).role === "admin" || (req.user as any).role === "super_admin";
    if (!isAdminRole) {
      throw ApiError.forbidden("Only administrators can delete file assets");
    }

    const success = await FilesService.deleteFile(req.params.id as string);
    if (!success) throw ApiError.notFound("File record not found");

    return sendSuccess(res, null, "File asset deleted successfully");
  }
}
