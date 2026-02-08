import { FastifyInstance } from 'fastify';
import { InvitationTokenService } from '../../application/services/invitationToken.service.js';
import { CreateInvitationUseCase } from '../../application/use-cases/createInvitation.use-case.js';
import { ValidateInvitationUseCase } from '../../application/use-cases/validateInvitation.use-case.js';
import { AcceptInvitationUseCase } from '../../application/use-cases/acceptInvitation.use-case.js';
import { invitationRoutes } from '../../infrastructure/http/routes/invitation.routes.js';

export async function setupInvitationModule(
    fastify: FastifyInstance,
    dependencies: {
        companyRepository: any;
        userRepository: any;
        emailService: any;
    }
) {
    // Token Service usando fastify-jwt
    const tokenService = new InvitationTokenService(fastify.jwt);

    // Casos de uso
    const createInvitationUseCase = new CreateInvitationUseCase(
        dependencies.companyRepository,
        dependencies.userRepository,
        tokenService,
        dependencies.emailService
    );

    const validateInvitationUseCase = new ValidateInvitationUseCase(tokenService);

    const acceptInvitationUseCase = new AcceptInvitationUseCase(
        tokenService,
        dependencies.userRepository
    );

    // Registrar rutas
    await fastify.register(
        async (instance) => {
            await invitationRoutes(instance, {
                createInvitationUseCase,
                validateInvitationUseCase,
                acceptInvitationUseCase
            });
        },
        { prefix: '/api/v1' }
    );
}