import type { FastifyInstance } from 'fastify';
import type { CreateRoomRequest, CreateRoomResponse } from '../types/index.js';
import { roomStore } from '../store/roomStore.js';

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
                    },
                },
            },
        },
        async (request, reply) => {
            const { name, votingSystem } = request.body;

            const room = roomStore.createRoom(name, votingSystem);

            const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/room/${room.id}`;

            return reply.code(201).send({
                roomId: room.id,
                joinUrl,
            });
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

            const room = roomStore.getRoom(id);

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
