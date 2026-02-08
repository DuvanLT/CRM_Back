// src/infrastructure/http/controllers/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterDto } from '../../../application/dtos/register.dto.js';
import { LoginDto } from '../../../application/dtos/login.dto.js';
import type { RegisterUseCase } from '../../../application/use-cases/register.use-case.js';
import type { LoginUseCase } from '../../../application/use-cases/login.use-case.js';

export class AuthController {
    constructor(
        private registerUseCase: RegisterUseCase,
        private loginUseCase: LoginUseCase
    ) { }

    async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const dto = request.body as RegisterDto;

            // Validaciones básicas
            if (!dto.companyName || !dto.ownerName || !dto.ownerEmail || !dto.password) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        message: 'Missing required fields',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            const result = await this.registerUseCase.execute(dto);

            if (!result.success) {
                const statusCode = this.getStatusCode(result.error!.code);
                return reply.status(statusCode).send(result);
            }

            return reply.status(201).send(result);

        } catch (error: unknown) {
            return reply.status(500).send({
                success: false,
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR'
                }
            });
        }
    }

    async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const dto = request.body as LoginDto;

            // Validaciones básicas
            if (!dto.email || !dto.password) {
                return reply.status(400).send({
                    success: false,
                    error: {
                        message: 'Email and password are required',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            // Ejecutar caso de uso
            const result = await this.loginUseCase.execute(dto);

            if (!result.success) {
                const statusCode = this.getStatusCode(result.error!.code);
                return reply.status(statusCode).send(result);
            }

            if (!result.data) {
                return reply.status(500).send({
                    success: false,
                    error: {
                        message: 'Login succeeded but no user data returned',
                        code: 'INVALID_RESPONSE'
                    }
                });
            }

            // ✅ Generar token JWT
            const token = request.server.jwt.sign({
                userId: result.data.user.id,
                companyId: result.data.user.companyId,
                role: result.data.user.role,
                name: result.data.user.name,
                email: result.data.user.email,
            });

            // ✅ Guardar token en cookie HttpOnly
            reply.setCookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 // 7 días en segundos
            });

            // ✅ Retornar datos del usuario (sin el token)
            return reply.send({
                success: true,
                data: {
                    user: result.data.user
                }
            });

        } catch (error: unknown) {
            return reply.status(500).send({
                success: false,
                error: {
                    message: 'Login failed',
                    code: 'LOGIN_ERROR'
                }
            });
        }
    }

    async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            // ✅ Eliminar cookie
            reply.clearCookie('auth_token', {
                path: '/'
            });

            return reply.send({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error: unknown) {
            return reply.status(500).send({
                success: false,
                error: {
                    message: 'Logout failed',
                    code: 'LOGOUT_ERROR'
                }
            });
        }
    }

    async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            // El middleware de autenticación agregará request.user
            const user = (request as any).user;

            if (!user) {
                return reply.status(401).send({
                    success: false,
                    error: {
                        message: 'Not authenticated',
                        code: 'NOT_AUTHENTICATED'
                    }
                });
            }

            return reply.send({
                success: true,
                data: { user }
            });

        } catch (error: unknown) {
            return reply.status(500).send({
                success: false,
                error: {
                    message: 'Failed to get user',
                    code: 'GET_USER_ERROR'
                }
            });
        }
    }

    private getStatusCode(errorCode: string): number {
        const statusCodes: Record<string, number> = {
            // Register errors
            'COMPANY_EMAIL_EXISTS': 409,
            'OWNER_EMAIL_EXISTS': 409,
            'INVALID_LICENSE': 400,
            'NO_LICENSE_AVAILABLE': 400,
            'VALIDATION_ERROR': 400,
            'REGISTER_ERROR': 500,

            // Login errors
            'MISSING_CREDENTIALS': 400,
            'INVALID_CREDENTIALS': 401,
            'COMPANY_NOT_FOUND': 404,
            'COMPANY_INACTIVE': 403,
            'LOGIN_ERROR': 500,

            // Auth errors
            'NOT_AUTHENTICATED': 401,
            'INVALID_TOKEN': 401,
            'EXPIRED_TOKEN': 401
        };

        return statusCodes[errorCode] || 500;
    }
}