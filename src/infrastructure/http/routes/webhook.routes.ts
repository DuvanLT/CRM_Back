import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

// Webhook secret for HMAC signature verification - should be set in environment variables
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret-here';
// WaSenderAPI configuration
const WASENDER_API_URL = 'https://api.wasenderapi.com';
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || '';

export async function webhookRoutes(fastify: FastifyInstance) {
    // Configure to receive raw body for signature verification
    // Must explicitly override application/json to get raw buffer
    fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
        done(null, body);
    });
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
            const body = request.body;

            // Convert body to string/object for processing
            let bodyString: string;
            let payload: unknown;
            if (Buffer.isBuffer(body)) {
                bodyString = body.toString();
                try {
                    payload = JSON.parse(bodyString);
                } catch {
                    payload = bodyString;
                }
            } else if (typeof body === 'object') {
                payload = body;
                bodyString = JSON.stringify(body);
            } else {
                bodyString = String(body);
                payload = bodyString;
            }

            if (!signature) {
                return reply.status(401).send({
                    success: false,
                    error: 'Unauthorized: Missing webhook signature'
                });
            }

            // WaSenderAPI sends the webhook secret directly as verification token
            // Simple comparison instead of HMAC
            if (signature !== WEBHOOK_SECRET) {
                fastify.log.warn({
                    message: 'Invalid webhook signature',
                    received: signature
                });
                return reply.status(401).send({
                    success: false,
                    error: 'Unauthorized: Invalid signature'
                });
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

    // --- Meta (WhatsApp Cloud API) Webhooks ---

    // GET verify token
    fastify.get('/meta', async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as any;

        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];

        // Check if a token and mode is in the query string of the request
        if (mode && token) {
            // Check the mode and token sent is correct
            if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
                // Respond with the challenge token from the request
                fastify.log.info('WEBHOOK_VERIFIED');
                return reply.status(200).send(challenge);
            } else {
                // Respond with '403 Forbidden' if verify tokens do not match
                return reply.code(403).send('Forbidden');
            }
        }
        return reply.code(400).send('Bad Request');
    });

    // POST receive messages
    fastify.post('/meta/receive', async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;

        // Log the incoming webhook for debugging
        fastify.log.info({
            message: 'Meta Webhook received',
            type: 'meta',
            payload: body
        });

        // TODO: Process messages here (extract message, sender, etc.)

        // Meta expects a 200 OK response immediately
        return reply.status(200).send('EVENT_RECEIVED');
    });
}
