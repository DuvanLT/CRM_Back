import type { FastifyReply, FastifyRequest } from "fastify";
import { CountCompanyUsersUseCase } from "../../../application/use-cases/count-company-users.use-case.js";
import { ListCompanyUsersUseCase } from "../../../application/use-cases/company-users.use-case.js";
import { ChangeRolUseCase } from "../../../application/use-cases/change-rol.use-case.js";

export class CompanyController {
    constructor(
        private countCompanyUsersUseCase: CountCompanyUsersUseCase,
        private listCompanyUsersUseCase: ListCompanyUsersUseCase,
        private changeRolUseCase: ChangeRolUseCase
    ) { }

    async countUsers(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user

        if (!user?.companyId) {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Not authenticated',
                    code: 'NOT_AUTHENTICATED'
                }
            })
        }

        const total = await this.countCompanyUsersUseCase.execute(user.companyId)
        return reply.send({
            success: true,
            data: { total: total - 1 }
        })
    }

    async listUsers(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user

        if (!user?.companyId) {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Not authenticated',
                    code: 'NOT_AUTHENTICATED'
                }
            })
        }

        const users = await this.listCompanyUsersUseCase.execute(user.companyId)

        return reply.send({
            success: true,
            data: { users }
        })
    }

    async changeUserRole(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user

        if (!user?.companyId) {
            return reply.status(401).send({
                success: false,
                error: {
                    message: 'Not authenticated',
                    code: 'NOT_AUTHENTICATED'
                }
            })
        }

        const { userId } = request.params as { userId: string }
        const { role } = request.body as { role: string }

        if (!userId || !role) {
            return reply.status(400).send({
                success: false,
                error: {
                    message: 'UserId and role are required',
                    code: 'VALIDATION_ERROR'
                }
            })
        }

        const result = await this.changeRolUseCase.execute(userId, role)

        if (!result.success) {
            return reply.status(400).send(result)
        }

        return reply.send(result)
    }
}
