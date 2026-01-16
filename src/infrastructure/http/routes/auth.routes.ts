import { FastifyInstance } from 'fastify';
import { authController } from '../../../modules/auth.module.ts';

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/register', async (request, reply) => {
        return authController.register(request, reply);
    });

    fastify.post('/login', async (request, reply) => {
        return authController.login(request, reply);
    });

    fastify.post('/logout', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        return authController.logout(request, reply);
    });

    fastify.get('/me', {
        preHandler: [fastify.authenticate]
    }, async (request, reply) => {
        return authController.me(request, reply);
    });
}