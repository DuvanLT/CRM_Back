import type { User } from "../entities/user.entity.ts";

export interface IUserRepository {
    create(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(companyId: string, email: string): Promise<User | null>;
    findByEmailGlobal(email: string): Promise<User | null>;
    hasCreatedCompany(email: string): Promise<boolean>;
}