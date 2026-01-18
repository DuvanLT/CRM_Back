import type { FastifyReply, FastifyRequest } from "fastify";
import { CountCompanyUsersUseCase } from "../../../application/use-cases/count-company-users.use-case.ts";
import { ListCompanyUsersUseCase } from "../../../application/use-cases/company-users.use-case.ts";

export class CompanyController {
    constructor(
        private countCompanyUsersUseCase: CountCompanyUsersUseCase,
        private listCompanyUsersUseCase: ListCompanyUsersUseCase
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
            data: { total }
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
}
