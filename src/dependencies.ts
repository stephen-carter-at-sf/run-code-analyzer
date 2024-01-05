import { mergeWithProcessEnvVars } from './utils'
import { DefaultArtifactClient } from '@actions/artifact'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { EnvironmentVariables, Inputs } from './types'

/**
 * Interface to extract out dependencies used by the action
 */
export interface Dependencies {
    startGroup(name: string): void

    endGroup(): void

    getInputs(): Inputs

    execCommand(command: string, envVars?: EnvironmentVariables): Promise<number>

    uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void>

    setOutput(name: string, value: string): void

    fail(failMessage: string): void
}

/**
 * Class that wires up the runtime dependencies
 */
export class RuntimeDependencies implements Dependencies {
    private readonly artifactClient: DefaultArtifactClient
    constructor() {
        this.artifactClient = new DefaultArtifactClient()
    }

    startGroup(name: string): void {
        core.startGroup(name)
    }

    endGroup(): void {
        core.endGroup()
    }

    getInputs(): Inputs {
        return {
            runCommand: core.getInput('run-command'),
            runArgs: core.getInput('run-arguments'),
            resultsArtifactName: core.getInput('results-artifact-name')
        }
    }

    async execCommand(command: string, envVars: EnvironmentVariables = {}): Promise<number> {
        const execOutput: exec.ExecOutput = await exec.getExecOutput(command, [], {
            env: mergeWithProcessEnvVars(envVars),
            ignoreReturnCode: true,
            failOnStdErr: false
        })
        return Promise.resolve(execOutput.exitCode)
    }

    async uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void> {
        await this.artifactClient.uploadArtifact(artifactName, artifactFiles, '.')
    }

    setOutput(name: string, value: string): void {
        core.setOutput(name, value)
    }

    fail(failMessage: string): void {
        core.setFailed(failMessage)
    }
}
