// src/infrastructure/http/controllers/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { registerUseCase } from '../../../modules/auth.module.ts';
import { RegisterDto } from '../../../application/dtos/register.dto.ts';

export class AuthController {
    async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        console.log('ENTRÉ AL CONTROLLER');
        try {
            const dto = request.body as RegisterDto;

            // Validaciones básicas (podrías usar Zod o @fastify/type-provider-typebox)
            if (!dto.companyName || !dto.ownerName || !dto.ownerEmail || !dto.password) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        message: 'Missing required fields',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            request.log.info('ANTES registerUseCase');
            const result = await registerUseCase.execute(dto);
            request.log.info('DESPUÉS registerUseCase');

            if (!result.success) {
                const statusCode = this.getStatusCode(result.error!.code);
                return reply.status(statusCode).send(result);
            }

            return reply.status(201).send(result);
        } catch (error: unknown) {
            request.log.error('Register Controller Error:');
            return reply.status(500).send({
                success: false,
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }

    private getStatusCode(errorCode: string): number {
        const statusCodes: Record<string, number> = {
            'COMPANY_EMAIL_EXISTS': 409,
            'OWNER_EMAIL_EXISTS': 409,
            'INVALID_LICENSE': 400,
            'VALIDATION_ERROR': 400,
            'REGISTER_ERROR': 500
        };

        return statusCodes[errorCode] || 500;
    }
}