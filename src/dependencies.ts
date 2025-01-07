import { mergeWithProcessEnvVars } from './utils'
import { DefaultArtifactClient } from '@actions/artifact'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { CommandOutput, EnvironmentVariables, Inputs } from './types'
import { ArtifactClient } from '@actions/artifact/lib/internal/client'
import fs from 'fs'

const COMMAND_NOT_FOUND_EXIT_CODE = 127

/**
 * Interface to extract out dependencies used by the action
 */
export interface Dependencies {
    startGroup(name: string): void

    endGroup(): void

    getInputs(): Inputs

    execCommand(command: string, envVars?: EnvironmentVariables, runSilently?: boolean): Promise<CommandOutput>

    uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void>

    setOutput(name: string, value: string): void

    info(infoMessage: string): void

    warn(warnMessage: string): void

    error(errorMessage: string): void

    fail(failMessage: string): void

    fileExists(file: string): boolean

    writeSummary(summaryMarkdown: string): Promise<void>
}

/**
 * Class that wires up the runtime dependencies
 */
export class RuntimeDependencies implements Dependencies {
    private readonly artifactClient: ArtifactClient
    constructor(artifactClient: ArtifactClient = new DefaultArtifactClient()) {
        this.artifactClient = artifactClient
    }

    startGroup(name: string): void {
        core.startGroup(name)
    }

    endGroup(): void {
        core.endGroup()
    }

    getInputs(): Inputs {
        return {
            runArguments: core.getInput('run-arguments'),
            resultsArtifactName: core.getInput('results-artifact-name')
        }
    }

    async execCommand(command: string, envVars: EnvironmentVariables = {}, silent = false): Promise<CommandOutput> {
        try {
            return await exec.getExecOutput(command, [], {
                env: mergeWithProcessEnvVars(envVars),
                ignoreReturnCode: true,
                failOnStdErr: false,
                silent
            })
        } catch (err) {
            // A try/catch is needed here due to issue: https://github.com/actions/toolkit/issues/1625
            return {
                exitCode: COMMAND_NOT_FOUND_EXIT_CODE,
                stdout: '',
                stderr: (err as Error).message
            }
        }
    }

    async uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void> {
        await this.artifactClient.uploadArtifact(artifactName, artifactFiles, '.')
    }

    setOutput(name: string, value: string): void {
        core.setOutput(name, value)
    }

    info(infoMessage: string): void {
        core.info(infoMessage)
    }

    warn(warnMessage: string): void {
        core.warning(warnMessage)
    }

    error(errorMessage: string): void {
        core.error(errorMessage)
    }

    fail(failMessage: string): void {
        core.setFailed(failMessage)
    }

    fileExists(file: string): boolean {
        return fs.existsSync(file)
    }

    async writeSummary(summaryMarkdown: string): Promise<void> {
        core.summary.addRaw(summaryMarkdown)
        await core.summary.write()
    }
}
