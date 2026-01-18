import { InvitationTokenService } from "../services/invitationToken.service.ts";
import { ValidateInvitationResponseDto } from "../dtos/invitation.dto.ts";

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