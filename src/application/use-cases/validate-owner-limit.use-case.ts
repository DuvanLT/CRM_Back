import type { IUserRepository } from "../../domain/repositories/user.repository.interface.js";

export class ValidateOwnerLimitUseCase {
    private readonly MAX_OWNERS = 2;

    constructor(
        private readonly userRepository: IUserRepository
    ) { }

    async execute(companyId: string): Promise<void> {
        const ownerCount = await this.userRepository.countOwnersByCompanyId(companyId);

        if (ownerCount >= this.MAX_OWNERS) {
            throw new Error(`Maximum number of owners reached (${this.MAX_OWNERS})`);
        }
    }
}
