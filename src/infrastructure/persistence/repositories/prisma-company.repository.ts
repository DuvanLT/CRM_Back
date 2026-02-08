import prisma from '../../../infrastructure/db/prisma.js';
import { ICompanyRepository } from 'domain/repositories/company.repository.interface.js';
import { Company } from 'domain/entities/company.entity.js';

export class PrismaCompanyRepository implements ICompanyRepository {
    async create(company: Company): Promise<Company> {
        const created = await prisma.company.create({
            data: {
                name: company.name,
                email: company.email,
                phone: company.phone,
                taxId: company.taxId,
                country: company.country,
                licenseId: company.licenseId,
                status: company.status
            }
        });

        return new Company(
            created.id,
            created.name,
            created.email,
            created.phone,
            created.taxId,
            created.country,
            created.licenseId,
            created.status as any,
            created.createdAt,
            created.updatedAt
        );
    }

    async findById(id: string): Promise<Company | null> {
        const company = await prisma.company.findUnique({
            where: { id }
        });

        if (!company) return null;

        return new Company(
            company.id,
            company.name,
            company.email,
            company.phone,
            company.taxId,
            company.country,
            company.licenseId,
            company.status as any,
            company.createdAt,
            company.updatedAt
        );
    }

    async existsByEmail(email: string): Promise<boolean> {
        const count = await prisma.company.count({
            where: { email }
        });
        return count > 0;
    }
}
