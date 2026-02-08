import prisma from 'infrastructure/db/prisma.js';// importa la instancia configurada
import { ILicenseRepository } from 'domain/repositories/license.repository.interface.js';
import { License } from 'domain/entities/license.entity.js';

export class PrismaLicenseRepository implements ILicenseRepository {
    async findById(id: string): Promise<License | null> {
        const license = await prisma.license.findUnique({
            where: { id }
        });

        if (!license) return null;

        return new License(
            license.id,
            license.name,
            license.maxUsers,
            license.maxMessagesMonth,
            license.maxCampaignsMonth,
            license.maxStorageMb,
            license.priceMonthly?.toNumber() || null,
            license.priceYearly?.toNumber() || null,
            license.createdAt
        );
    }

    async findByName(name: string): Promise<License | null> {
        const license = await prisma.license.findFirst({
            where: { name }
        });

        if (!license) return null;

        return new License(
            license.id,
            license.name,
            license.maxUsers,
            license.maxMessagesMonth,
            license.maxCampaignsMonth,
            license.maxStorageMb,
            license.priceMonthly?.toNumber() || null,
            license.priceYearly?.toNumber() || null,
            license.createdAt
        );
    }
}
