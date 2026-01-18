import type { ICompanyRepository } from "../../domain/repositories/company.repository.interface.ts";
import type { IUserRepository } from "../../domain/repositories/user.repository.interface.ts";

export class CountCompanyUsersUseCase {
    constructor(
        private companyRepository: ICompanyRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(companyId: string): Promise<number> {
        const company = await this.companyRepository.findById(companyId)

        if (!company) {
            throw new Error('Company not found')
        }

        return this.userRepository.countByCompanyId(companyId)
    }
}
