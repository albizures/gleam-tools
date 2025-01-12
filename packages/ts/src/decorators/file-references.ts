import type { Context } from '../context'

export function decorateFileReferences(
	context: Context,
): void {
	const { logger, languageService } = context
	const getFileReferences = languageService.getFileReferences.bind(
		languageService,
	)

	languageService.getFileReferences = (fileName: string) => {
		const references = getFileReferences(fileName)

		logger.info(`[ts-gleam] getFileReferences ${JSON.stringify(references)}`)

		return references
	}
}
