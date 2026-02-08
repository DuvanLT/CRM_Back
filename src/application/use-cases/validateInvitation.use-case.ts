import { InvitationTokenService } from "../services/invitationToken.service.js";
import { ValidateInvitationResponseDto } from "../dtos/invitation.dto.js";

export class ValidateInvitationUseCase {
    constructor(private readonly tokenService: InvitationTokenService) { }

    async execute(token: string): Promise<ValidateInvitationResponseDto> {
        const payload = this.tokenService.verifyToken(token);

        return {
            email: payload.email,
            companyId: payload.companyId,
            companyName: payload.companyName
        };
    }
}