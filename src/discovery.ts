import { WebSocket } from '@fastify/websocket'
import { FastifyInstance } from 'fastify'
import OpenAI from 'openai'

type Session = {
	thread?: OpenAI.Beta.Threads.Thread
}

const openai = new OpenAI()

async function onDiscover(msg: string, socket: WebSocket, session: Session) {
	if (!session.thread) {
		const thread = await openai.beta.threads.create()
		session.thread = thread
	}

	console.log('message:', msg)

	await openai.beta.threads.messages.create(session.thread.id, {
		role: 'user',
		content: msg,
	})

	const run = openai.beta.threads.runs.stream(session.thread.id, { assistant_id: process.env.OPENAI_ASSISTANT_ID! })

	run.on('textDelta', (delta) => {
		if (!delta.value || delta.annotations?.length) return
		socket.send(delta.value)
	})

	await run.done()

	socket.send('__END__')
}

export async function WebSocketHandler(fastify: FastifyInstance) {
	fastify.get('/discovery', { websocket: true }, async (socket, req) => {
		const session: Session = {}

		socket.on('message', async (message) => {
			onDiscover(message.toString(), socket, session)
		})

		socket.on('close', async () => {
			if (!session.thread) return
			await openai.beta.threads.del(session.thread.id)
		})
	})
}
