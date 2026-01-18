// src/types/fastify.d.ts
import 'fastify'
import '@fastify/jwt'
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        user: {
            id: string
            companyId: string
            role: string
            email: string
        }
    }
}