import { Dependencies } from '../src/dependencies'
import { CommandOutput, EnvironmentVariables, Inputs } from '../src/types'
import { CommandExecutor } from '../src/commands'
import { Results, ResultsFactory, Violation, ViolationLocation } from '../src/results'
import { Summarizer } from '../src/summary'

export class FakeDependencies implements Dependencies {
    startGroupCallHistory: { name: string }[] = []
    startGroup(name: string): void {
        this.startGroupCallHistory.push({ name })
    }

    endGroupCallCount = 0
    endGroup(): void {
        this.endGroupCallCount++
    }

    execCommandReturnValue: CommandOutput = { exitCode: 0, stdout: '', stderr: '' }
    execCommandCallHistory: { command: string; envVars: EnvironmentVariables; runSilently: boolean }[] = []
    async execCommand(command: string, envVars: EnvironmentVariables, runSilently: boolean): Promise<CommandOutput> {
        this.execCommandCallHistory.push({ command, envVars, runSilently })
        return this.execCommandReturnValue
    }

    // We should match the default input values from action.yml here:
    getInputsReturnValue: Inputs = {
        runCommand: 'run',
        runArgs: '--normalize-severity',
        resultsArtifactName: 'code-analyzer-results'
    }
    getInputsCallCount = 0
    getInputs(): Inputs {
        this.getInputsCallCount++
        return this.getInputsReturnValue
    }

    uploadArtifactCallHistory: { artifactName: string; artifactFiles: string[] }[] = []
    async uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void> {
        this.uploadArtifactCallHistory.push({ artifactName, artifactFiles })
        return Promise.resolve()
    }

    setOutputCallHistory: { name: string; value: string }[] = []
    setOutput(name: string, value: string): void {
        this.setOutputCallHistory.push({ name, value })
    }

    infoCallHistory: { infoMessage: string }[] = []
    info(infoMessage: string): void {
        this.infoCallHistory.push({ infoMessage })
    }

    warnCallHistory: { warnMessage: string }[] = []
    warn(warnMessage: string): void {
        this.warnCallHistory.push({ warnMessage })
    }

    failCallHistory: { failMessage: string }[] = []
    fail(failMessage: string): void {
        this.failCallHistory.push({ failMessage })
    }

    fileExistsReturnValue = true
    fileExistsCallHistory: { file: string }[] = []
    fileExists(file: string): boolean {
        this.fileExistsCallHistory.push({ file })
        return this.fileExistsReturnValue
    }

    writeSummaryCallHistory: { summaryMarkdown: string }[] = []
    async writeSummary(summaryMarkdown: string): Promise<void> {
        this.writeSummaryCallHistory.push({ summaryMarkdown })
    }
}

export class FakeCommandExecutor implements CommandExecutor {
    isSalesforceCliInstalledCallCount = 0
    isSalesforceCliInstalledReturnValue = true
    async isSalesforceCliInstalled(): Promise<boolean> {
        this.isSalesforceCliInstalledCallCount++
        return this.isSalesforceCliInstalledReturnValue
    }

    installSalesforceCliCallCount = 0
    installSalesforceCliReturnValue = true
    async installSalesforceCli(): Promise<boolean> {
        this.installSalesforceCliCallCount++
        return this.installSalesforceCliReturnValue
    }

    isMinimumScannerPluginInstalledReturnValue = true
    isMinimumScannerPluginInstalledCallHistory: { minVersion: string }[] = []
    async isMinimumScannerPluginInstalled(minVersion: string): Promise<boolean> {
        this.isMinimumScannerPluginInstalledCallHistory.push({ minVersion })
        return this.isMinimumScannerPluginInstalledReturnValue
    }

    installScannerPluginCallCount = 0
    installScannerPluginReturnValue = true
    async installScannerPlugin(): Promise<boolean> {
        this.installScannerPluginCallCount++
        return this.installScannerPluginReturnValue
    }

    runCodeAnalyzerReturnValue: CommandOutput = { exitCode: 0, stdout: '', stderr: '' }
    runCodeAnalyzerCallHistory: { runCmd: string; runArgs: string; internalOutfile: string }[] = []
    async runCodeAnalyzer(runCmd: string, runArgs: string, internalOutfile: string): Promise<CommandOutput> {
        this.runCodeAnalyzerCallHistory.push({ runCmd, runArgs, internalOutfile })
        return this.runCodeAnalyzerReturnValue
    }
}

export class FakeResultsFactory implements ResultsFactory {
    createResultsReturnValue: Results = new FakeResults()
    createResultsCallHistory: { resultsFile: string; isDfa: boolean }[] = []
    createResults(resultsFile: string, isDfa: boolean): Results {
        this.createResultsCallHistory.push({ resultsFile, isDfa })
        return this.createResultsReturnValue
    }
}

export class FakeResults implements Results {
    getSev1ViolationCountReturnValue = 1
    getSev1ViolationCountCallCount = 0
    getSev1ViolationCount(): number {
        this.getSev1ViolationCountCallCount++
        return this.getSev1ViolationCountReturnValue
    }

    getSev2ViolationCountReturnValue = 2
    getSev2ViolationCountCallCount = 0
    getSev2ViolationCount(): number {
        this.getSev2ViolationCountCallCount++
        return this.getSev2ViolationCountReturnValue
    }

    getSev3ViolationCountReturnValue = 3
    getSev3ViolationCountCallCount = 0
    getSev3ViolationCount(): number {
        this.getSev3ViolationCountCallCount++
        return this.getSev3ViolationCountReturnValue
    }

    getTotalViolationCountReturnValue = 6
    getTotalViolationCountCallCount = 0
    getTotalViolationCount(): number {
        this.getTotalViolationCountCallCount++
        return this.getTotalViolationCountReturnValue
    }

    getViolationsSortedBySeverityReturnValue: Violation[] = []
    getViolationsSortedBySeverityCallCount = 0
    getViolationsSortedBySeverity(): Violation[] {
        this.getViolationsSortedBySeverityCallCount++
        return this.getViolationsSortedBySeverityReturnValue
    }
}

export class FakeViolationLocation implements ViolationLocation {
    compareToReturnValue = 0
    compareToCallHistory: { other: ViolationLocation }[] = []
    compareTo(other: ViolationLocation): number {
        this.compareToCallHistory.push({ other })
        return this.compareToReturnValue
    }

    toStringReturnValue = 'someLocation'
    toStringCallCount = 0
    toString(): string {
        this.toStringCallCount++
        return this.toStringReturnValue
    }
}

export class FakeSummarizer implements Summarizer {
    createSummaryMarkdownReturnValue = 'someSummaryMarkdown'
    createSummaryMarkdownCallHistory: { results: Results }[] = []
    createSummaryMarkdown(results: Results): string {
        this.createSummaryMarkdownCallHistory.push({ results })
        return this.createSummaryMarkdownReturnValue
    }
}
