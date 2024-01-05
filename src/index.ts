/**
 * The entrypoint for the action.
 */
import { ArtifactUploader, CommandExecutor, EnvironmentVariables, run } from './main'
import { DefaultArtifactClient } from '@actions/artifact'
import * as exec from '@actions/exec'
import * as core from '@actions/core'

class RuntimeCommandExecutor implements CommandExecutor {
    async exec(command: string, envVars: EnvironmentVariables): Promise<number> {
        console.info(JSON.stringify(process.env))
        const execOutput: exec.ExecOutput = await exec.getExecOutput(command, [], {
            env: mergeWithProcessEnvVars(envVars),
            ignoreReturnCode: true,
            failOnStdErr: false
        })
        core.error(execOutput.stderr)
        core.info(execOutput.stdout)
        core.info(`Exit Code: ${execOutput.exitCode}`)
        return Promise.resolve(0)
    }
}

function mergeWithProcessEnvVars(envVars: EnvironmentVariables): EnvironmentVariables {
    const mergedEnvVars: EnvironmentVariables = {}
    for (const k in envVars) {
        mergedEnvVars[k] = envVars[k]
    }
    for (const k in process.env) {
        if (process.env[k] !== undefined) {
            mergedEnvVars[k] = process.env[k] as string
        }
    }
    return mergedEnvVars
}

class RuntimeArtifactUploader implements ArtifactUploader {
    private readonly artifactClient: DefaultArtifactClient
    constructor() {
        this.artifactClient = new DefaultArtifactClient()
    }

    async uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void> {
        await this.artifactClient.uploadArtifact(artifactName, artifactFiles, '.')
    }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run(new RuntimeCommandExecutor(), new RuntimeArtifactUploader())
