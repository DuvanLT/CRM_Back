import { IEmailService } from '../../application/use-cases/createInvitation.use-case.ts';

export class EmailService implements IEmailService {
    async sendInvitation(): Promise<void> {
        // no-op (por ahora)
        return;
    }
}
