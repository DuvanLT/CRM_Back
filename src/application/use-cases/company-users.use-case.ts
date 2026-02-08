import type { ICompanyRepository } from "../../domain/repositories/company.repository.interface.js";
import type { IUserRepository } from "../../domain/repositories/user.repository.interface.js";
import type { User } from "../../domain/entities/user.entity.js";

export class ListCompanyUsersUseCase {
    constructor(
        private companyRepository: ICompanyRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(companyId: string): Promise<User[]> {
        const company = await this.companyRepository.findById(companyId)

        if (!company) {
            throw new Error('Company not found')
        }

        return this.userRepository.listUsersByCompanyId(companyId)
    }
}
