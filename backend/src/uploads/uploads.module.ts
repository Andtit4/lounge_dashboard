import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          console.log('File en cours de traitement:', file);
          console.log('File originalname:', file.originalname);
          console.log('File MIME type:', file.mimetype);

          try {
            const uniqueSuffix = uuidv4();
            let ext = extname(file.originalname);

            if (!ext && file.mimetype) {
              if (
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/jpg'
              ) {
                ext = '.jpg';
              } else if (file.mimetype === 'image/png') {
                ext = '.png';
              } else if (file.mimetype === 'image/gif') {
                ext = '.gif';
              } else {
                ext = '.jpg';
              }
            }

            if (ext && !ext.startsWith('.')) {
              ext = '.' + ext;
            }

            const filename = `${uniqueSuffix}${ext || '.jpg'}`;

            console.log('Nom de fichier généré:', filename);
            callback(null, filename);
          } catch (error) {
            console.error(
              'Erreur lors de la génération du nom de fichier:',
              error,
            );
            const fallbackName = `${Date.now()}-fallback.jpg`;
            console.log('Nom de fallback utilisé:', fallbackName);
            callback(null, fallbackName);
          }
        },
      }),
      fileFilter: (req, file, callback) => {
        console.log('Vérification du type de fichier:', file.mimetype);

        const validMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/jpg',
        ];
        if (!validMimeTypes.includes(file.mimetype)) {
          console.error('Type MIME non autorisé:', file.mimetype);
          return callback(new Error('Only image files are allowed!'), false);
        }

        if (
          file.originalname &&
          !file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)
        ) {
          console.warn('Extension de fichier non standard:', file.originalname);
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
