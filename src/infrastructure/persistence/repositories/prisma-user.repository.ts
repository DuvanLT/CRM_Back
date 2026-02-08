import prisma from '../../../infrastructure/db/prisma.js';
import { IUserRepository } from 'domain/repositories/user.repository.interface.js';
import { User } from 'domain/entities/user.entity.js';

export class PrismaUserRepository implements IUserRepository {
    async create(user: User): Promise<User> {
        const created = await prisma.user.create({
            data: {
                companyId: user.companyId,
                name: user.name,
                email: user.email,
                passwordHash: user.passwordHash!,
                role: user.role
            }
        });

        return new User(
            created.id,
            created.companyId,
            created.name,
            created.email,
            created.passwordHash,
            created.role as any,
            created.lastLoginAt,
            created.createdAt
        );
    }

    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.companyId,
            user.name,
            user.email,
            user.passwordHash,
            user.role as any,
            user.lastLoginAt,
            user.createdAt
        );
    }

    async findByEmail(companyId: string, email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: {
                companyId_email: {
                    companyId,
                    email
                }
            }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.companyId,
            user.name,
            user.email,
            user.passwordHash,
            user.role as any,
            user.lastLoginAt,
            user.createdAt
        );
    }

    async hasCreatedCompany(email: string): Promise<boolean> {
        const ownerUser = await prisma.user.findFirst({
            where: {
                email,
                role: 'owner' // ✅ Solo busca si tiene rol de owner
            }
        });
        return !!ownerUser;
    }

    async findByEmailGlobal(email: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: { email }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.companyId,
            user.name,
            user.email,
            user.passwordHash,
            user.role as any,
            user.lastLoginAt,
            user.createdAt
        );
    }

    async findByEmailAndCompany(email: string, companyId: string): Promise<User | null> {
        const user = await prisma.user.findFirst({
            where: {
                email,
                companyId
            }
        });

        if (!user) return null;

        return new User(
            user.id,
            user.companyId,
            user.name,
            user.email,
            user.passwordHash,
            user.role as any,
            user.lastLoginAt,
            user.createdAt
        );
    }

    async countByCompanyId(companyId: string): Promise<number> {
        return await prisma.user.count({
            where: {
                companyId
            }
        })
    }

    async listUsersByCompanyId(companyId: string): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: {
                companyId
            }
        });

        return users.map(user => new User(
            user.id,
            user.companyId,
            user.name,
            user.email,
            null,
            user.role as any,
            user.lastLoginAt,
            user.createdAt
        ));
    }

    async countOwnersByCompanyId(companyId: string): Promise<number> {
        return await prisma.user.count({
            where: {
                companyId,
                role: 'owner'
            }
        });
    }

    async updateRole(userId: string, role: string): Promise<User> {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: role as any }
        });

        return new User(
            updatedUser.id,
            updatedUser.companyId,
            updatedUser.name,
            updatedUser.email,
            updatedUser.passwordHash,
            updatedUser.role as any,
            updatedUser.lastLoginAt,
            updatedUser.createdAt
        );
    }
}
