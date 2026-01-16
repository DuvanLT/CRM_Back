import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'

export default fp(async (fastify) => {
    fastify.decorate(
        'authenticate',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                await request.jwtVerify()
            } catch (err) {
                return reply.status(401).send({
                    success: false,
                    error: {
                        message: 'Not authenticated',
                        code: 'NOT_AUTHENTICATED'
                    }
                })
            }
        }
    )
})
