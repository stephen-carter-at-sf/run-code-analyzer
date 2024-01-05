import * as core from '@actions/core'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(commandExecutor: CommandExecutor, artifactUploader: ArtifactUploader): Promise<void> {
    try {
        core.startGroup('Validate Inputs')
        const inputs: Inputs = {
            runCommand: core.getInput('run-command'),
            runArgs: core.getInput('run-arguments'),
            resultsArtifactName: core.getInput('results-artifact-name')
        }
        // TODO: Add validation here
        core.info(JSON.stringify(inputs))
        core.endGroup()

        // core.startGroup('Confirming Salesforce CLI is installed')
        // TODO
        // core.endGroup()

        core.startGroup('Running Code Analyzer')

        // ISSUE TO FIX: For some reason I keep getting :
        //    env: 'node': No such file or directory
        // So maybe we need to fix this ourselves by updating the node path
        // maybe next I'll check internally what commandExecutor.exec("which node") gives.
        const command = `sf scanner ${inputs.runCommand} ${inputs.runArgs}`
        const envVars: EnvironmentVariables = {
            NODE_OPTIONS: '--max-old-space-size=8192',
            SCANNER_INTERNAL_OUTFILE: './internalResults.json'
        }
        const exitCode: number = await commandExecutor.exec(command, envVars)
        core.endGroup()

        core.startGroup('Uploading artifact')
        await artifactUploader.uploadArtifact(inputs.resultsArtifactName, ['./internalResults.json'])
        core.endGroup()

        core.startGroup('Setting Outputs')
        core.setOutput('exit-code', exitCode)
        core.endGroup()
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message)
    }
}

type Inputs = {
    runCommand: string
    runArgs: string
    resultsArtifactName: string
}

export type EnvironmentVariables = { [key: string]: string }

export interface CommandExecutor {
    exec(command: string, envVars: EnvironmentVariables): Promise<number>
}

export interface ArtifactUploader {
    uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void>
}
