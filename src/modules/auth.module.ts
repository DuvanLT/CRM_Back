
import { PrismaCompanyRepository } from '../infrastructure/persistence/repositories/prisma-company.repository.js';
import { PrismaUserRepository } from '../infrastructure/persistence/repositories/prisma-user.repository.js';
import { PrismaLicenseRepository } from '../infrastructure/persistence/repositories/prisma-license.repository.js';
import { RegisterUseCase } from '../application/use-cases/register.use-case.js';
import { LoginUseCase } from '../application/use-cases/login.use-case.js';
import { AuthController } from '../infrastructure/http/controllers/auth.controller.js';
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