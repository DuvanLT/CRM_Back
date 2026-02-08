import { IEmailService } from '../../application/use-cases/createInvitation.use-case.js';

export class EmailService implements IEmailService {
    async sendInvitation(): Promise<void> {
        // no-op (por ahora)
        return;
    }
}
