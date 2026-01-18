import type { ICompanyRepository } from "../../domain/repositories/company.repository.interface.ts";
import type { IUserRepository } from "../../domain/repositories/user.repository.interface.ts";
import type { User } from "../../domain/entities/user.entity.ts";

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
