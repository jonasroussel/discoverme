import FastifyStatic from '@fastify/static'
import FastifyWebsocket from '@fastify/websocket'
import Fastify from 'fastify'

import { WebSocketHandler } from './discovery.js'

const isProduction = process.env.NODE_ENV === 'production'
const host = process.env.HOST || '127.0.0.1'
const port = parseInt(process.env.PORT || '8080')

const fastify = Fastify({
	disableRequestLogging: true,
	logger: isProduction
		? true
		: {
				transport: {
					target: 'pino-pretty',
					options: {
						translateTime: 'HH:MM:ss',
						ignore: 'pid,hostname',
					},
				},
			},
})

await fastify.register(FastifyStatic, {
	root: import.meta.resolve('../web').replace('file://', ''),
	prefix: '/',
	index: 'index.html',
})

await fastify.register(FastifyWebsocket)

await fastify.register(WebSocketHandler)

await fastify.listen({ port, host })
