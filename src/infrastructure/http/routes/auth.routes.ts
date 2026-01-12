import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.ts';

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/register', async (request, reply) => {
        return authController.register(request, reply);
    });

}