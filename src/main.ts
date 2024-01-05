import { DefaultArtifactClient } from '@actions/artifact'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { ArtifactClient } from '@actions/artifact/lib/internal/client'
import fs from 'fs'

export type Inputs = {
    runCommand: string
    runArgs: string
    resultsArtifactName: string
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
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

        core.startGroup('Running Code Analyzer')
        const execOptions: exec.ExecOptions = {
            env: {
                NODE_OPTIONS: '--max-old-space-size=8192',
                SCANNER_INTERNAL_OUTFILE: './internalResults.json'
            }
        }
        const exitCode: number = await exec.exec('sf', ['scanner', inputs.runCommand, inputs.runArgs], execOptions)
        core.endGroup()

        core.startGroup('Uploading artifact')
        if (fs.existsSync('./internalResults.json')) {
            const artifact: ArtifactClient = new DefaultArtifactClient()
            await artifact.uploadArtifact(inputs.resultsArtifactName, ['./internalResults.json'], '.')
        } else {
            core.error('No result file found to upload as an artifact.')
        }
        core.endGroup()

        core.startGroup('Setting Outputs')
        core.setOutput('exit-code', exitCode.toString())
        core.endGroup()
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message)
        }
    }
}
