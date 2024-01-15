import { run } from './main'
import { Dependencies, RuntimeDependencies } from './dependencies'
import { CommandExecutor, RuntimeCommandExecutor } from './commands'
import { ResultsFactory, RuntimeResultsFactory } from './results'

/**
 * The entrypoint for the action.
 */
const runtimeDependencies: Dependencies = new RuntimeDependencies()
const commandExecutor: CommandExecutor = new RuntimeCommandExecutor(runtimeDependencies)
const resultsFactory: ResultsFactory = new RuntimeResultsFactory()
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run(runtimeDependencies, commandExecutor, resultsFactory)
