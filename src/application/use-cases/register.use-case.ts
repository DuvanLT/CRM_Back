// src/application/use-cases/register.use-case.ts
import type { ICompanyRepository } from '../../domain/repositories/company.repository.interface.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { ILicenseRepository } from '../../domain/repositories/license.repository.interface.js';
import { Company } from '../../domain/entities/company.entity.js';
import { User } from '../../domain/entities/user.entity.js';
import type { RegisterDto, RegisterResponseDto } from '../dtos/register.dto.js';
import { Result, ResultFactory } from '../../shared/interfaces/result.interface.js';
import * as bcrypt from 'bcrypt';

export class RegisterUseCase {
    constructor(
        private companyRepo: ICompanyRepository,
        private userRepo: IUserRepository,
        private licenseRepo: ILicenseRepository
    ) { }

    async execute(dto: RegisterDto): Promise<Result<RegisterResponseDto>> {
        console.log('UC: inicio');
        try {
            console.log('UC: dentro del try');

            const hasCreatedCompany = await this.userRepo.hasCreatedCompany(dto.ownerEmail);
            if (hasCreatedCompany) {
                return ResultFactory.failure(
                    'You have already created a company. A user can only create one company.',
                    'OWNER_ALREADY_EXISTS'
                );
            }
            // 1. Validar que el email de la compañía no exista
            if (dto.companyEmail) {
                const emailExists = await this.companyRepo.existsByEmail(dto.companyEmail);
                if (emailExists) {
                    return ResultFactory.failure(
                        'Company email already exists',
                        'COMPANY_EMAIL_EXISTS'
                    );
                }
            }

            // 2. Validar licencia (o usar una por defecto)
            const licenseId = dto.licenseId || await this.getDefaultLicenseId();

            // ✅ Validar que licenseId no esté vacío ANTES de buscar
            if (!licenseId) {
                return ResultFactory.failure(
                    'No license provided and no default license found',
                    'NO_LICENSE_AVAILABLE'
                );
            }

            const license = await this.licenseRepo.findById(licenseId);

            if (!license) {
                return ResultFactory.failure(
                    'Invalid license',
                    'INVALID_LICENSE'
                );
            }

            // 2.1 Validar que el password tenga al menos 8 caracteres
            if (dto.password.length < 8) {
                return ResultFactory.failure(
                    'Password must have at least 8 characters',
                    'PASSWORD_TOO_SHORT'
                );
            }

            if (dto.password) {
                const hasUpperCase = /[A-Z]/.test(dto.password);
                const hasLowerCase = /[a-z]/.test(dto.password);
                const hasNumber = /[0-9]/.test(dto.password);
                const hasSpecialChar = /[^a-zA-Z0-9]/.test(dto.password);
                if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
                    return ResultFactory.failure(
                        'Password must have at least an mayus letter, a number and a special character',
                        'PASSWORD_TOO_WEAK'
                    );
                }
            }

            // 3. Hash de password
            const passwordHash = await bcrypt.hash(dto.password, 10);

            // 4. Crear compañía
            const company = Company.create(
                dto.companyName,
                licenseId,
                dto.companyEmail,
                dto.companyPhone,
                dto.taxId,
                dto.country
            );

            const createdCompany = await this.companyRepo.create(company);

            // 6. Crear usuario owner
            const owner = User.create(
                createdCompany.id!,  // ✅ Agregar ! porque ahora tiene ID
                dto.ownerName,
                dto.ownerEmail,
                passwordHash,
                'owner'
            );

            const createdOwner = await this.userRepo.create(owner);

            // 7. Retornar respuesta
            const response: RegisterResponseDto = {
                company: {
                    id: createdCompany.id!,  // ✅ Agregar !
                    name: createdCompany.name,
                    email: createdCompany.email,
                    status: createdCompany.status
                },
                user: {
                    id: createdOwner.id!,  // ✅ Agregar !
                    name: createdOwner.name,
                    email: createdOwner.email,
                    role: createdOwner.role
                },
                message: 'Company and owner registered successfully'
            };

            return ResultFactory.success(response);

        } catch (error) {
            console.error('RegisterUseCase Error:', error);
            return ResultFactory.failure(
                'Failed to register company',
                'REGISTER_ERROR',
                error
            );
        }
    }

    private async getDefaultLicenseId(): Promise<string | null> {  // ✅ Cambia a string | null
        // Aquí puedes buscar una licencia "Free" o "Demo" por defecto
        const defaultLicense = await this.licenseRepo.findByName('Demo');
        return defaultLicense?.id || null;  // ✅ Retorna null en lugar de ''
    }
}