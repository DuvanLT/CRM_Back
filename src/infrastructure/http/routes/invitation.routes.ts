import { CreateInvitationUseCase } from '../../../application/use-cases/createInvitation.use-case.js';
import { ValidateInvitationUseCase } from '../../../application/use-cases/validateInvitation.use-case.js';
import { AcceptInvitationUseCase } from '../../../application/use-cases/acceptInvitation.use-case.js';
import { FastifyInstance } from 'fastify';

export async function invitationRoutes(
    fastify: FastifyInstance,
    options: {
        createInvitationUseCase: CreateInvitationUseCase;
        validateInvitationUseCase: ValidateInvitationUseCase;
        acceptInvitationUseCase: AcceptInvitationUseCase;
    }
) {
    console.log('--- Registering invitation routes ---');
    fastify.get('/ping', async () => 'pong');
    // Crear invitación
    fastify.post<{
        Body: { email: string };
    }>(
        '/invitations',
        {
            onRequest: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email' }
                    }
                }
            }
        },
        async (request, reply) => {
            try {
                const { email } = request.body;
                const { companyId, id: userId } = request.user;

                const result = await options.createInvitationUseCase.execute(
                    companyId,
                    userId,
                    { email }
                );

                return reply.code(201).send({
                    success: true,
                    message: 'Invitation sent successfully',
                    data: result
                });
            } catch (error: any) {
                return reply.code(400).send({
                    success: false,
                    error: error.message
                });
            }
        }
    );

    // Validar token de invitación (público)
    fastify.get('/invitations/validate/*', async (request, reply) => {
        try {
            const token = (request.params as any)['*'];
            console.log('🔍 Validating token:', token);

            if (!token || token === '/') {
                console.log('Token is required');
                return reply.code(400).send({
                    success: false,
                    error: 'Token is required'
                });
            }

            const invitationData = await options.validateInvitationUseCase.execute(token);

            return reply.send({
                success: true,
                data: invitationData
            });
        } catch (error: any) {
            console.log('Error al validar el token', error);
            return reply.code(400).send({
                success: false,
                error: error.message
            });
        }
    });

    // Manejar caso sin token para evitar 404
    fastify.get('/invitations/validate/', async (request, reply) => {
        return reply.code(400).send({
            success: false,
            error: 'Token is required'
        });
    });

    // Aceptar invitación (público)
    fastify.post<{
        Body: {
            token: string;
            ownerName: string;
            password: string;
        };
    }>(
        '/invitations/accept',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['token', 'ownerName', 'password'],
                    properties: {
                        token: { type: 'string' },
                        ownerName: { type: 'string' },
                        password: { type: 'string', minLength: 8 }
                    }
                }
            }
        },
        async (request, reply) => {
            try {
                const result = await options.acceptInvitationUseCase.execute(request.body);

                return reply.code(201).send({
                    success: true,
                    data: result,
                    message: 'User registered successfully'
                });
            } catch (error: any) {
                return reply.code(400).send({
                    success: false,
                    error: error.message
                });
            }
        }
    );
}
