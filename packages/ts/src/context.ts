import type { GleamConfig } from '@gleam-tools/utils'
import type tsModule from 'typescript/lib/tsserverlibrary'

export type Context = {
	ts: typeof tsModule
	logger: tsModule.server.Logger
	info: tsModule.server.PluginCreateInfo
	languageServiceHost: tsModule.LanguageServiceHost
	languageService: tsModule.LanguageService
	gleamConfig: GleamConfig
}

export function createContext(
	ts: typeof tsModule,
	info: tsModule.server.PluginCreateInfo,
	gleamConfig: GleamConfig,
): Context {
	const { logger } = info.project.projectService

	const languageServiceHost = new Proxy(info.languageServiceHost, createProxyHandler(logger, 'languageServiceHost'))
	const languageService = new Proxy(ts.createLanguageService(languageServiceHost), createProxyHandler(logger, 'languageService'))

	return {
		ts,
		logger,
		info,
		gleamConfig,
		languageServiceHost,
		languageService,

	}
}

function createProxyHandler<T extends object>(_logger: tsModule.server.Logger, _label: string): ProxyHandler<T> {
	const decorated: Partial<T> = {}

	return {
		get(target, p) {
			// logger.info(`[ts-gleam] ${label} | get ${String(p)} | ${decorated[p as keyof T] ? '0' : '1'}`)
			return (
				decorated[p as keyof T] ?? target[p as keyof T]
			)
		},
		set(_, p, value) {
			decorated[p as keyof T] = value

			return true
		},
	}
}
