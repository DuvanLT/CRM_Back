export interface CreateInvitationDto {
    email: string;
}

export interface InvitationTokenPayload {
    email: string;
    companyId: string;
    companyName: string;
    invitedBy: string;
    type: 'invitation';
    iat?: number;
    exp?: number;
}

export interface ValidateInvitationResponseDto {
    email: string;
    companyId: string;
    companyName: string;
}

export interface AcceptInvitationDto {
    token: string;
    ownerName: string;
    password: string;
}