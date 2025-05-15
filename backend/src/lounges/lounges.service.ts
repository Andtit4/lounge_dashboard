import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lounge } from './entities/lounge.entity';
import { CreateLoungeDto } from './dto/create-lounge.dto';

@Injectable()
export class LoungesService {
  constructor(
    @InjectRepository(Lounge)
    private loungesRepository: Repository<Lounge>,
  ) {}

  async create(createLoungeDto: CreateLoungeDto): Promise<Lounge> {
    const lounge = this.loungesRepository.create(createLoungeDto);
    return await this.loungesRepository.save(lounge);
  }

  async findAll(): Promise<Lounge[]> {
    return await this.loungesRepository.find();
  }

  async findOne(id: string): Promise<Lounge> {
    const lounge = await this.loungesRepository.findOne({ where: { id } });
    if (!lounge) {
      throw new NotFoundException('Lounge not found');
    }
    return lounge;
  }

  async update(
    id: string,
    updateLoungeDto: Partial<CreateLoungeDto>,
  ): Promise<Lounge> {
    const lounge = await this.findOne(id);
    Object.assign(lounge, updateLoungeDto);
    return await this.loungesRepository.save(lounge);
  }

  async remove(id: string): Promise<void> {
    const lounge = await this.findOne(id);
    await this.loungesRepository.remove(lounge);
  }

  async findByAirport(airport: string): Promise<Lounge[]> {
    return await this.loungesRepository.find({ where: { airport } });
  }

  async findByCountry(country: string): Promise<Lounge[]> {
    return await this.loungesRepository.find({ where: { country } });
  }

  async search(query: string): Promise<Lounge[]> {
    return await this.loungesRepository
      .createQueryBuilder('lounge')
      .where('lounge.name LIKE :query', { query: `%${query}%` })
      .orWhere('lounge.airport LIKE :query', { query: `%${query}%` })
      .orWhere('lounge.country LIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async getAnalytics() {
    // Récupérer des statistiques globales sur les salons
    const totalLounges = await this.loungesRepository.count();
    const loungesByCountry = await this.loungesRepository
      .createQueryBuilder('lounge')
      .select('lounge.country, COUNT(lounge.id) as count')
      .groupBy('lounge.country')
      .getRawMany();

    const loungesByAirport = await this.loungesRepository
      .createQueryBuilder('lounge')
      .select('lounge.airport, COUNT(lounge.id) as count')
      .groupBy('lounge.airport')
      .getRawMany();

    return {
      totalLounges,
      loungesByCountry,
      loungesByAirport,
      // Vous pourriez ajouter d'autres statistiques ici
    };
  }

  async getLoungeStats(id: string) {
    // Vérifier que le salon existe
    const lounge = await this.findOne(id);

    // Dans un cas réel, vous récupéreriez des statistiques depuis d'autres tables
    // comme les réservations, les avis, etc.

    // Pour cet exemple, nous renvoyons des données fictives
    return {
      loungeId: lounge.id,
      loungeName: lounge.name,
      totalVisits: Math.floor(Math.random() * 1000),
      averageRating: (Math.random() * 2 + 3).toFixed(1), // Note entre 3 et 5
      visitsByMonth: [
        { month: 'Janvier', count: Math.floor(Math.random() * 100) },
        { month: 'Février', count: Math.floor(Math.random() * 100) },
        { month: 'Mars', count: Math.floor(Math.random() * 100) },
        // Ajoutez d'autres mois au besoin
      ],
      // Autres statistiques spécifiques au salon
    };
  }
}
