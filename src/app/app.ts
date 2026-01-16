// src/app.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { authRoutes } from '../infrastructure/http/routes/auth.routes.ts';
import prisma from '../infrastructure/db/prisma.ts'
import authPlugin from '../infrastructure/http/plugins/auth.plugin.ts';

export class App {
    private fastify = Fastify({ logger: true });
    private async setupPlugins() {
        await this.fastify.register(cors, {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        });
        // 2. Helmet
        await this.fastify.register(helmet, {
            contentSecurityPolicy: false
        });

        // 3. Cookie
        await this.fastify.register(fastifyCookie, {
            secret: process.env.JWT_SECRET,
            parseOptions: {}
        });

        // 4. JWT
        await this.fastify.register(fastifyJwt, {
            secret: process.env.JWT_SECRET!,
            cookie: {
                cookieName: 'auth_token',
                signed: false
            },
            sign: {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        });
        await this.fastify.register(authPlugin);
    }
    private async setupRoutes() {
        this.fastify.get('/health', async () => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });

        await this.fastify.register(authRoutes, { prefix: '/api/auth' });
    }

    public async start(port: number = 3000) {
        try {
            await this.setupPlugins();
            await this.setupRoutes();

            this.fastify.log.info('Connecting to database...');
            await prisma.$connect();
            this.fastify.log.info('Database connected');

            const address = await this.fastify.listen({
                port,
                host: '0.0.0.0',
            });

            this.fastify.log.info(`Server listening at ${address}`);

            // 🔹 cierre limpio de Prisma
            const close = async () => {
                this.fastify.log.info('Shutting down...');
                await prisma.$disconnect();
                process.exit(0);
            };

            process.on('SIGINT', close);
            process.on('SIGTERM', close);

        } catch (err) {
            this.fastify.log.error(err);
            process.exit(1);
        }
    }
}
