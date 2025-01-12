import type { UserConfig } from 'vite'

export async function ignoreBuildFolder(config: UserConfig) {
	// if there is not watch config, let's not add the build folder
	if (!config.build?.watch) {
		return
	}

	const current = config.build.watch.exclude

	let origin: Array<string | RegExp> = []

	if (Array.isArray(current)) {
		origin.push(...current)
	}
	else if (current) {
		origin.push(current)
	}

	origin.push('build/**')
	config.build.watch.exclude = origin
}
