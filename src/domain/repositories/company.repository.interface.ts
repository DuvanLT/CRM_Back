import { Company } from "../entities/company.entity.js";

export interface ICompanyRepository {
    create(company: Company): Promise<Company>;
    findById(id: string): Promise<Company | null>;
    existsByEmail(email: string): Promise<boolean>;
}