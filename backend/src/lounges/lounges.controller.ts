import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LoungesService } from './lounges.service';
import { CreateLoungeDto } from './dto/create-lounge.dto';
import { UpdateLoungeDto } from './dto/update-lounge.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Role, Roles } from '../middlewares/role.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('lounges')
@Controller('lounges')
@UseGuards(JwtAuthGuard)
export class LoungesController {
  constructor(private readonly loungesService: LoungesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Role(Roles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lounge' })
  @ApiResponse({ status: 201, description: 'Lounge successfully created.' })
  create(@Body() createLoungeDto: CreateLoungeDto) {
    return this.loungesService.create(createLoungeDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all lounges or search by query' })
  @ApiResponse({ status: 200, description: 'Return all lounges or search results.' })
  findAll(@Query('query') query?: string, @Query('airport') airport?: string, @Query('country') country?: string) {
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
} 