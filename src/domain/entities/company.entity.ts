import type { CompanyStatus } from "../../shared/types/company.types.ts";

export class Company {
    constructor(
        public readonly id: string | null,
        public name: string,
        public email: string | null,
        public phone: string | null,
        public taxId: string | null,
        public country: string | null,
        public licenseId: string,
        public status: CompanyStatus,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(
        name: string,
        licenseId: string,
        email?: string,
        phone?: string,
        taxId?: string,
        country?: string
    ): Company {
        return new Company(
            null,
            name,
            email || null,
            phone || null,
            taxId || null,
            country || null,
            licenseId,
            'demo',
            new Date(),
            new Date()
        );
    }
}