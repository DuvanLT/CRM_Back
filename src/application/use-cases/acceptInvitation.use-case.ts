import { InvitationTokenService } from "../services/invitationToken.service.ts";
import { IUserRepository } from "../../domain/repositories/user.repository.interface.ts";
import { AcceptInvitationDto } from "../dtos/invitation.dto.ts";
import * as bcrypt from 'bcrypt';
import { User } from "../../domain/entities/user.entity.ts";
export class AcceptInvitationUseCase {
    constructor(
        private readonly tokenService: InvitationTokenService,
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: AcceptInvitationDto) {
        const { token, ownerName, password } = dto;

        // Verificar y decodificar el token
        const payload = this.tokenService.verifyToken(token);

        // Verificar nuevamente que el usuario no exista en esta compañía
        const existingUser = await this.userRepository.findByEmailAndCompany(
            payload.email,
            payload.companyId
        );
        if (existingUser) {
            throw new Error('User already exists in this company');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        // Crear usuario
        const userInvited = User.create(
            payload.companyId,
            ownerName,
            payload.email,
            passwordHash,
            'agent'
        );
        await this.userRepository.create(userInvited);
        return {
            user: {
                id: userInvited.id,
                name: userInvited.name,
                email: userInvited.email,
                role: userInvited.role
            },
            companyId: payload.companyId
        };
    }
}