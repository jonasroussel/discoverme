const discoveryWS = new WebSocket('/discovery')

function main($) {
	const music = $('#veridis-quo').get(0)
	music.play()

	function updatePrompt(term) {
		const isPlaying = !music.paused
		const volume = Math.round(music.volume * 100)

		const prompt = `[[;#03A062;]~/discoverme] [[;#9A8A09;]music:(${isPlaying ? volume + '%' : 'off'})] $ `

		if (term) term.set_prompt(prompt)

		return prompt
	}

	$('section.terminal').terminal(
		function (command) {
			command = command.trim()

			// help
			if (command === 'help') {
				this.echo(
					'Discover Me v1.0.0\n\nCommands:\n  music\t\t<on|off|0-100>\n  volume\t<0-100>\n\nOr ask me something about me!'
				)
				return
			}

			// music <on|off>
			if (command.startsWith('music ')) {
				const newStatus = command.split(' ')[1]

				if (newStatus === 'on') {
					music.play()
				} else if (newStatus === 'off') {
					music.pause()
				} else if (!isNaN(parseInt(newStatus))) {
					try {
						music.volume = parseInt(newStatus) / 100
						updatePrompt(this)
					} catch (_) {}
				}

				updatePrompt(this)
				return
			}

			// volume <0-100>
			if (command.startsWith('volume ')) {
				const newVolume = command.split(' ')[1]
				try {
					music.volume = parseInt(newVolume) / 100
					updatePrompt(this)
				} catch (_) {}
				return
			}

			// Else: discovery
			{
				return new Promise((resolve, reject) => {
					discoveryWS.send(command)

					discoveryWS.onmessage = (msg) => {
						if (msg.data === '__END__') {
							this.echo('')
							resolve()
							return
						}

						this.echo(msg.data, { newline: false })
					}
				})
			}
		},
		{
			greetings: '',
			height: '100%',
			prompt: updatePrompt(),
		}
	)
}

window.onload = function () {
	jQuery(function ($, undefined) {
		main($)
	})
}
