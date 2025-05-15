import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { LoungesService } from './lounges.service';
import { CreateLoungeDto } from './dto/create-lounge.dto';
import { UpdateLoungeDto } from './dto/update-lounge.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Role, Roles } from '../middlewares/role.guard';
import { Public } from '../auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from '../uploads/uploads.service';

@ApiTags('lounges')
@Controller('lounges')
@UseGuards(JwtAuthGuard)
export class LoungesController {
  constructor(
    private readonly loungesService: LoungesService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lounge' })
  @ApiResponse({ status: 201, description: 'Lounge successfully created.' })
  create(@Body() createLoungeDto: CreateLoungeDto, @Request() req) {
    console.log('POST /lounges - Create new lounge request');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('User from request:', req.user);
    console.log('Data:', JSON.stringify(createLoungeDto));

    return this.loungesService.create(createLoungeDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all lounges or search by query' })
  @ApiResponse({
    status: 200,
    description: 'Return all lounges or search results.',
  })
  findAll(
    @Query('query') query?: string,
    @Query('airport') airport?: string,
    @Query('country') country?: string,
  ) {
    if (query) {
      return this.loungesService.search(query);
    } else if (airport) {
      return this.loungesService.findByAirport(airport);
    } else if (country) {
      return this.loungesService.findByCountry(country);
    }
    return this.loungesService.findAll();
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lounge analytics' })
  @ApiResponse({ status: 200, description: 'Return analytics data.' })
  getAnalytics() {
    return this.loungesService.getAnalytics();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a lounge by id' })
  @ApiResponse({ status: 200, description: 'Return the lounge.' })
  @ApiResponse({ status: 404, description: 'Lounge not found.' })
  findOne(@Param('id') id: string) {
    return this.loungesService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics for a specific lounge' })
  @ApiResponse({ status: 200, description: 'Return lounge statistics.' })
  getLoungeStats(@Param('id') id: string) {
    return this.loungesService.getLoungeStats(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lounge' })
  @ApiResponse({ status: 200, description: 'Lounge successfully updated.' })
  @ApiResponse({ status: 404, description: 'Lounge not found.' })
  update(@Param('id') id: string, @Body() updateLoungeDto: UpdateLoungeDto) {
    return this.loungesService.update(id, updateLoungeDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lounge' })
  @ApiResponse({ status: 200, description: 'Lounge successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Lounge not found.' })
  remove(@Param('id') id: string) {
    return this.loungesService.remove(id);
  }

  @Post(':id/upload-image')
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image for a lounge' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    console.log(`POST /lounges/${id}/upload-image - Upload image request`);
    
    // Log les headers et infos utilisateur de manière sécurisée
    try {
      console.log('Headers:', req.headers ? JSON.stringify(req.headers) : 'No headers');
      console.log('User from request:', req.user ? JSON.stringify(req.user) : 'No user');
    } catch (error) {
      console.error('Error logging request data:', error);
    }
    
    // Vérifier si le fichier existe
    if (!file) {
      console.error('Erreur: Le fichier est undefined ou null');
      return {
        success: false,
        message: "Aucun fichier n'a été reçu",
      };
    }
    
    // Log détaillé du fichier - inspectons tous les champs
    console.log('Fichier reçu:', file);
    console.log('Champs disponibles:', Object.keys(file));
    
    try {
      // Vérifier si filename existe et lui donner un nom si nécessaire
      if (!file.filename) {
        console.warn("Le fichier n'a pas de nom, attribution d'un nom généré");
        // Générer un nom unique basé sur le timestamp et l'extension de l'original
        const now = Date.now();
        let ext = '';
        
        // Essayer de récupérer l'extension du fichier original
        if (file.originalname) {
          const originalExt = file.originalname.split('.').pop();
          if (originalExt) {
            ext = `.${originalExt}`;
          }
        }
        
        // Si pas d'extension depuis le nom original, essayer depuis le type MIME
        if (!ext && file.mimetype) {
          if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            ext = '.jpg';
          } else if (file.mimetype === 'image/png') {
            ext = '.png';
          } else if (file.mimetype === 'image/gif') {
            ext = '.gif';
          } else {
            ext = '.jpg'; // extension par défaut
          }
        }
        
        // Créer le nom du fichier
        file.filename = `manual-${now}${ext}`;
        console.log('Nom de fichier attribué manuellement:', file.filename);
        
        // Nous devons déplacer le fichier manuellement
        const fs = require('fs');
        const path = require('path');
        
        // Créer le dossier s'il n'existe pas
        const uploadDir = './uploads/images';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Chemin complet du fichier destination
        const destPath = path.join(uploadDir, file.filename);
        
        // Si file.buffer existe, l'écrire dans le fichier destination
        if (file.buffer) {
          fs.writeFileSync(destPath, file.buffer);
          console.log('Fichier sauvegardé manuellement à:', destPath);
        } else {
          console.error('Impossible de sauvegarder le fichier: pas de buffer disponible');
          return {
            success: false,
            message: "Erreur lors de la sauvegarde du fichier: pas de données d'image",
          };
        }
      }
      
      const imageUrl = this.uploadsService.getFileUrl(file.filename);
      console.log("URL de l'image générée:", imageUrl);
      
      await this.loungesService.update(id, { imageUrl });
      console.log("Salon mis à jour avec la nouvelle URL d'image");
      
      return {
        success: true,
        filename: file.filename,
        url: imageUrl,
      };
    } catch (error) {
      // Convertir l'erreur en objet standard pour éviter les problèmes de sérialisation
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      console.error('Erreur lors de la mise à jour du salon:', errorMessage);
      return {
        success: false,
        message: "Erreur lors de la mise à jour du salon avec l'image",
        error: errorMessage,
      };
    }
  }
}
