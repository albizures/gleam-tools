import type { Context } from '../context'

export function decorateNavigateToItems(context: Context): void {
	const { languageService, info, logger } = context
	const getNavigateToItems = info.languageService.getNavigateToItems

	languageService.getNavigateToItems = (
		searchValue: string,
		maxResultCount?: number,
		fileName?: string,
		excludeDtsFiles?: boolean,
	) => {
		const navigationToItems = getNavigateToItems(
			searchValue,
			maxResultCount,
			fileName,
			excludeDtsFiles,
		)

		logger.info(`[ts-gleam] ${JSON.stringify(navigationToItems)}`)

		return navigationToItems
	}
}
