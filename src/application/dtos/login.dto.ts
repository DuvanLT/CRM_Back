export interface LoginDto {
    email: string;
    password: string;
}

export interface LoginResponseDto {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        companyId: string;
    };
}