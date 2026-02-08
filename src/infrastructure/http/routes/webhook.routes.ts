import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

// Webhook secret for HMAC signature verification - should be set in environment variables
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
// WaSenderAPI configuration
const WASENDER_API_URL = 'https://api.wasenderapi.com';
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || '';

export async function webhookRoutes(fastify: FastifyInstance) {
    // Configure to receive raw body for signature verification
    fastify.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body, done) => {
        done(null, body);
    });

    // GET endpoint to fetch message logs from WaSenderAPI
    fastify.get('/messages/:sessionId', async (request: FastifyRequest<{
        Params: { sessionId: string };
        Querystring: { page?: string; limit?: string };
    }>, reply: FastifyReply) => {
        try {
            const { sessionId } = request.params;
            const { page = '1', limit = '50' } = request.query;

            if (!API_ACCESS_TOKEN) {
                return reply.status(500).send({
                    success: false,
                    error: 'API Access Token not configured'
                });
            }

            const response = await fetch(
                `${WASENDER_API_URL}/api/whatsapp-sessions/${sessionId}/message-logs?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${API_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return reply.status(response.status).send({
                    success: false,
                    error: 'Failed to fetch messages from WaSenderAPI',
                    details: errorData
                });
            }

            const data = await response.json();

            return reply.status(200).send({
                success: true,
                data
            });
        } catch (error) {
            fastify.log.error({ err: error, message: 'Error fetching messages' });
            return reply.status(500).send({
                success: false,
                error: 'Internal server error fetching messages'
            });
        }
    });

    // GET endpoint to fetch a specific message info
    fastify.get('/messages/:sessionId/:msgId', async (request: FastifyRequest<{
        Params: { sessionId: string; msgId: string };
    }>, reply: FastifyReply) => {
        try {
            const { msgId } = request.params;

            if (!API_ACCESS_TOKEN) {
                return reply.status(500).send({
                    success: false,
                    error: 'API Access Token not configured'
                });
            }

            const response = await fetch(
                `${WASENDER_API_URL}/api/messages/${msgId}/info`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${API_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return reply.status(response.status).send({
                    success: false,
                    error: 'Failed to fetch message info from WaSenderAPI',
                    details: errorData
                });
            }

            const data = await response.json();

            return reply.status(200).send({
                success: true,
                data
            });
        } catch (error) {
            fastify.log.error({ err: error, message: 'Error fetching message info' });
            return reply.status(500).send({
                success: false,
                error: 'Internal server error fetching message info'
            });
        }
    });

    // POST endpoint to receive webhook data with signature verification
    fastify.post('/receive', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const signature = request.headers['x-webhook-signature'] as string;
            const rawBody = request.body as Buffer;

            if (!signature) {
                return reply.status(401).send({
                    success: false,
                    error: 'Unauthorized: Missing webhook signature'
                });
            }

            // Calculate expected signature
            const expectedSignature = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(rawBody)
                .digest('hex');

            // Verify signature
            if (signature !== expectedSignature) {
                fastify.log.warn({
                    message: 'Invalid webhook signature',
                    received: signature,
                    expected: expectedSignature
                });
                return reply.status(401).send({
                    success: false,
                    error: 'Unauthorized: Invalid signature'
                });
            }

            // Parse the body as JSON
            let payload: unknown;
            try {
                payload = JSON.parse(rawBody.toString());
            } catch {
                payload = rawBody.toString();
            }

            const timestamp = new Date().toISOString();

            // Log the incoming webhook for debugging
            fastify.log.info({
                message: 'Webhook received and verified',
                timestamp,
                headers: {
                    'content-type': request.headers['content-type'],
                    'user-agent': request.headers['user-agent']
                },
                payload
            });

            // Here you can process the webhook data as needed
            // For now, we just acknowledge receipt

            return reply.status(200).send({
                success: true,
                message: 'Webhook received successfully',
                receivedAt: timestamp,
                data: payload
            });
        } catch (error) {
            fastify.log.error({ err: error, message: 'Webhook processing error' });
            return reply.status(500).send({
                success: false,
                error: 'Internal server error processing webhook'
            });
        }
    });

    // GET endpoint for webhook verification (some services require this)
    fastify.get('/receive', async (request: FastifyRequest, reply: FastifyReply) => {
        return reply.status(200).send({
            success: true,
            message: 'Webhook endpoint is active',
            timestamp: new Date().toISOString()
        });
    });
}
