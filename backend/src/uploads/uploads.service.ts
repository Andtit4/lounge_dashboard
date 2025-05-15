import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadsService {
  constructor() {
    // Créer le dossier uploads/images s'il n'existe pas
    const uploadPath = join(process.cwd(), 'uploads/images');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
  }

  getFileUrl(filename: string): string {
    return `${
      process.env.API_URL || 'http://localhost:6610'
    }/uploads/images/${filename}`;
  }
}
