
import { PrismaCompanyRepository } from '../infrastructure/persistence/repositories/prisma-company.repository.ts';
import { PrismaUserRepository } from '../infrastructure/persistence/repositories/prisma-user.repository.ts';
import { PrismaLicenseRepository } from '../infrastructure/persistence/repositories/prisma-license.repository.ts';
import { RegisterUseCase } from '../application/use-cases/register.use-case.ts';
import { LoginUseCase } from '../application/use-cases/login.use-case.ts';
import { AuthController } from 'infrastructure/http/controllers/auth.controller.ts';
// Repositorios
const companyRepository = new PrismaCompanyRepository();
const userRepository = new PrismaUserRepository();
const licenseRepository = new PrismaLicenseRepository();

// Casos de uso
export const registerUseCase = new RegisterUseCase(
    companyRepository,
    userRepository,
    licenseRepository
);

export const loginUseCase = new LoginUseCase(
    userRepository,
    companyRepository
);

export const authController = new AuthController(
    registerUseCase,
    loginUseCase
);