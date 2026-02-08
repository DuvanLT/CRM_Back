import type { UserRole } from '../../shared/types/user.types.js';

export class User {
    constructor(
        public readonly id: string | null,
        public companyId: string,
        public name: string,
        public email: string,
        public passwordHash: string | null,
        public role: UserRole,
        public lastLoginAt: Date | null,
        public readonly createdAt: Date
    ) { }

    static create(
        companyId: string,
        name: string,
        email: string,
        passwordHash: string,
        role: UserRole = 'owner'
    ): User {
        return new User(
            null,
            companyId,
            name,
            email,
            passwordHash,
            role,
            null,
            new Date()
        );
    }

    isOwner(): boolean {
        return this.role === 'owner';
    }
}