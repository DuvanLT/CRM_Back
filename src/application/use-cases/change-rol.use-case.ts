import type { IUserRepository } from "../../domain/repositories/user.repository.interface.ts";
import type { ValidateOwnerLimitUseCase } from "./validate-owner-limit.use-case.ts";
import { Result, ResultFactory } from "../../shared/interfaces/result.interface.ts";
import type { User } from "../../domain/entities/user.entity.ts";

export class ChangeRolUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly validateOwnerLimitUseCase: ValidateOwnerLimitUseCase
    ) { }

    async execute(userId: string, newRole: string): Promise<Result<User>> {
        try {
            const user = await this.userRepository.findById(userId);

            if (!user) {
                return ResultFactory.failure('User not found', 'USER_NOT_FOUND');
            }

            if (user.role === newRole) {
                return ResultFactory.success(user);
            }

            if (newRole === 'owner') {
                try {
                    await this.validateOwnerLimitUseCase.execute(user.companyId);
                } catch (error: any) {
                    return ResultFactory.failure(error.message, 'MAX_OWNERS_REACHED');
                }
            }

            const updatedUser = await this.userRepository.updateRole(userId, newRole);
            return ResultFactory.success(updatedUser);

        } catch (error) {
            return ResultFactory.failure('Failed to change role', 'CHANGE_ROLE_ERROR', error);
        }
    }
}
