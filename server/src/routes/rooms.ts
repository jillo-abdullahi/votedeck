import type { CreateRoomRequest, CreateRoomResponse } from '../types/index.js';
import { roomStore } from '../store/roomStore.js';
import { prisma } from '../db/prisma.js';
import type { FastifyInstance } from 'fastify';

export async function roomRoutes(fastify: FastifyInstance) {
    /**
     * POST /rooms
     * Create a new room
     */
    fastify.post<{ Body: CreateRoomRequest; Reply: CreateRoomResponse }>(
        '/rooms',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['name', 'votingSystem'],
                    properties: {
                        name: { type: 'string' },
                        votingSystem: {
                            type: 'string',
                            enum: ['fibonacci', 'modified_fibonacci', 'tshirts', 'powers_2'],
                        },
                        adminId: { type: 'string' },
                        adminName: { type: 'string' },
                    },
                },
            },
        },
        async (request, reply) => {
            const { name, votingSystem, adminId, adminName } = request.body;

            // Determine effective adminId
            // 1. If adminId provided in body, use it
            // 2. If valid JWT token provided, use it (sub)
            // 3. If adminName provided, generate a new ID
            let effectiveAdminId = adminId;

            let recoveryCode: string | undefined;
            if (!effectiveAdminId) {
                try {
                    const decoded = await request.jwtVerify() as { sub: string };
                    effectiveAdminId = decoded.sub;
                } catch (err) {
                    // Not authenticated
                    if (adminName) {
                        const { nanoid } = await import('nanoid');
                        const bcrypt = await import('bcryptjs');

                        // Generate recovery key parts
                        const recoveryId = nanoid(10);
                        const recoverySecret = nanoid(20);
                        const recoverySecretHash = await bcrypt.hash(recoverySecret, 10);

                        effectiveAdminId = nanoid();
                        // Format: [lookup_id].[secret]
                        recoveryCode = `${recoveryId}.${recoverySecret}`;

                        // Persist new user with hash
                        await prisma.user.create({
                            data: {
                                id: effectiveAdminId,
                                name: adminName,
                                recoveryCode: recoveryId, // stored for lookup
                                recoveryHash: recoverySecretHash // stored for verification
                            }
                        });
                    }
                }
            }

            if (!effectiveAdminId) {
                return reply.code(400).send({ error: 'Identification required (adminId or adminName)' } as any);
            }

            const room = await roomStore.createRoom(name, votingSystem, effectiveAdminId);

            // If name provided, register the user
            if (adminName) {
                await roomStore.addUser(room.id, {
                    id: effectiveAdminId,
                    name: adminName,
                    socketId: '', // Will be updated on connect
                });
            }

            // Generate host token
            const hostToken = fastify.jwt.sign({
                sub: effectiveAdminId,
                role: 'host',
                roomId: room.id
            });

            const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${room.id}`;

            return reply.code(201).send({
                roomId: room.id,
                joinUrl,
                accessToken: hostToken,
                userId: effectiveAdminId,
                recoveryCode
            });
        }
    );

    /**
     * GET /rooms/my
     * Get rooms for the authenticated user
     */
    fastify.get<{ Querystring: { limit?: number; offset?: number } }>(
        '/rooms/my',
        async (request, reply) => {
            try {
                const decoded = await request.jwtVerify() as { sub: string };
                const userId = decoded.sub;

                const { limit = 20, offset = 0 } = request.query;

                const result = await roomStore.getUserRooms(userId, limit, offset);

                return reply.send(result);
            } catch (err) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }
        }
    );

    /**
     * GET /rooms/:id
     * Get room metadata
     */
    fastify.get<{ Params: { id: string } }>(
        '/rooms/:id',
        async (request, reply) => {
            const { id } = request.params;

            const room = await roomStore.getRoom(id);

            if (!room) {
                return reply.code(404).send({
                    error: 'Room not found',
                });
            }

            return reply.send({
                id: room.id,
                name: room.name,
                votingSystem: room.votingSystem,
                createdAt: room.createdAt,
            });
        }
    );
}
