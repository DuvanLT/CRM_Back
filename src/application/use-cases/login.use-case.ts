import type { IUserRepository } from '../../domain/repositories/user.repository.interface.ts';
import type { ICompanyRepository } from '../../domain/repositories/company.repository.interface.ts';
import type { LoginDto, LoginResponseDto } from '../dtos/login.dto.ts';
import { Result, ResultFactory } from '../../shared/interfaces/result.interface.ts';
import * as bcrypt from 'bcrypt';

export class LoginUseCase {
    constructor(
        private userRepo: IUserRepository,
        private companyRepo: ICompanyRepository
    ) { }

    async execute(dto: LoginDto): Promise<Result<LoginResponseDto>> {
        try {
            if (!dto.email || !dto.password) {
                return ResultFactory.failure(
                    'Email and password are required',
                    'MISSING_CREDENTIALS'
                );
            }

            // 2. Buscar usuario por email (en todas las compañías)
            // Nota: Necesitarás agregar este método al repositorio
            const user = await this.userRepo.findByEmailGlobal(dto.email);

            if (!user) {
                return ResultFactory.failure(
                    'Invalid credentials',
                    'INVALID_CREDENTIALS'
                );
            }

            // 3. Verificar contraseña
            const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

            if (!isPasswordValid) {
                return ResultFactory.failure(
                    'Invalid credentials',
                    'INVALID_CREDENTIALS'
                );
            }

            // 4. Verificar que la compañía esté activa
            const company = await this.companyRepo.findById(user.companyId);

            if (!company) {
                return ResultFactory.failure(
                    'Company not found',
                    'COMPANY_NOT_FOUND'
                );
            }

            if (company.status !== 'active' && company.status !== 'demo') {
                return ResultFactory.failure(
                    'Company account is not active',
                    'COMPANY_INACTIVE'
                );
            }

            // 5. Actualizar último login (opcional)
            // await this.userRepo.updateLastLogin(user.id!);

            // 6. Retornar datos del usuario
            const response: LoginResponseDto = {
                user: {
                    id: user.id!,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId
                }
            };

            return ResultFactory.success(response);

        } catch (error) {
            console.error('LoginUseCase Error:', error);
            return ResultFactory.failure(
                'Login failed',
                'LOGIN_ERROR',
                error
            );
        }
    }
}