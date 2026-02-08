import type { CreateInvitationDto } from "../dtos/invitation.dto.js";
import { InvitationTokenService } from "../services/invitationToken.service.js";
import { IUserRepository } from "../../domain/repositories/user.repository.interface.js";

export interface IEmailService {
    sendInvitation(params: {
        to: string;
        invitationLink: string;
        companyName: string;
    }): Promise<void>;
}

export interface ICompanyRepository {
    findById(id: string): Promise<{ id: string; name: string } | null>;
}

export class CreateInvitationUseCase {
    constructor(
        private readonly companyRepository: ICompanyRepository,
        private readonly userRepository: IUserRepository,
        private readonly tokenService: InvitationTokenService,
        private readonly emailService: IEmailService
    ) { }

    async execute(
        companyId: string,
        invitedBy: string,
        dto: CreateInvitationDto
    ): Promise<{ invitationLink: string }> {
        const { email } = dto;

        const company = await this.companyRepository.findById(companyId);
        if (!company) {
            throw new Error('Company not found');
        }

        const existingUser = await this.userRepository.findByEmailAndCompany(
            email.toLowerCase(),
            companyId
        );
        if (existingUser) {
            throw new Error('User already exists in this company');
        }

        const token = this.tokenService.generateToken({
            email: email.toLowerCase(),
            companyId,
            companyName: company.name,
            invitedBy,
            type: 'invitation',
        });

        const invitationLink = `${process.env.FRONTEND_URL}/invitation?token=${token}`;
        console.log(token);
        await this.emailService.sendInvitation({
            to: email,
            invitationLink,
            companyName: company.name,
        });

        return { invitationLink };
    }
}
