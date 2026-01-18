import type { FastifyInstance } from "fastify";
import { CompanyController } from "../controllers/company.controller.ts";
export async function companyRoutes(fastify: FastifyInstance, companyController: CompanyController) {
    fastify.get('/company/users/count', {
        preHandler: [fastify.authenticate]
    }, (request, reply) => companyController.countUsers(request, reply))

    fastify.get('/company/users', {
        preHandler: [fastify.authenticate]
    }, (request, reply) => companyController.listUsers(request, reply))
}
