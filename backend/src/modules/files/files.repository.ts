import { FileModel, type IFile } from "../../models/file.model.js";

export class FilesRepository {
  static async create(data: Partial<IFile>): Promise<IFile> {
    return await FileModel.create(data);
  }

  static async findByFileId(fileId: string): Promise<IFile | null> {
    return await FileModel.findOne({ fileId });
  }

  static async delete(fileId: string): Promise<number> {
    const result = await FileModel.deleteOne({ fileId });
    return result.deletedCount || 0;
  }
}
