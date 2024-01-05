import * as core from '@actions/core'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(artifactUploader: ArtifactUploader): Promise<void> {
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

        core.startGroup('Uploading artifact')
        await artifactUploader.uploadArtifact('dummy-artifact', ['./README.md'])
        core.endGroup()

        core.startGroup('Setting Outputs')
        core.setOutput('exit-code', 0)
        core.endGroup()
    } catch (error) {
        // Fail the workflow run if an error occurs
        if (error instanceof Error) core.setFailed(error.message)
    }
}

export type Inputs = {
    runCommand: string
    runArgs: string
    resultsArtifactName: string
}

export interface ArtifactUploader {
    uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void>
}
