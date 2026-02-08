import { FastifyInstance } from 'fastify';
import { InvitationTokenPayload } from '../dtos/invitation.dto.js';

export class InvitationTokenService {
    private readonly TOKEN_EXPIRATION = '24h';

    constructor(
        private readonly jwtService: FastifyInstance['jwt']
    ) { }

    generateToken(payload: InvitationTokenPayload): string {
        const token = this.jwtService.sign(payload, {
            expiresIn: this.TOKEN_EXPIRATION
        });

        // 🔍 DEBUG: Ver qué contiene el token
        try {
            const decoded = this.jwtService.decode(token) as any;
            console.log('🔑 Token generado:', {
                iat: new Date(decoded.iat * 1000),
                exp: new Date(decoded.exp * 1000),
                email: decoded.email
            });
        } catch (e) {
            console.error('Error decodificando token:', e);
        }

        return token;
    }

    verifyToken(token: string): InvitationTokenPayload {
        try {
            const decoded = this.jwtService.verify<InvitationTokenPayload>(token);

            if (decoded.type !== 'invitation') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error: any) {
            if (error.message?.includes('expired')) {
                throw new Error('Invitation has expired');
            }
            throw new Error('Invalid invitation token');
        }
    }
}
