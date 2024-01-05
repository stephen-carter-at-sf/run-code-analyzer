/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { ArtifactUploader, CommandExecutor, EnvironmentVariables } from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

describe('action', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        errorMock = jest.spyOn(core, 'error').mockImplementation()
        getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
        setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    })

    it('Will need to update the name of this test at some point', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            switch (name) {
                case 'run-command':
                    return 'run'
                case 'run-arguments':
                    return '--normalize-severity --outfile results.json --target .' //Won't need --target in future
                case 'results-artifact-name':
                    return 'code-analyzer-results'
                default:
                    return ''
            }
        })

        const commandExecutor: FakeCommandExecutor = new FakeCommandExecutor()
        const artifactUploader: FakeArtifactUploader = new FakeArtifactUploader()
        await main.run(commandExecutor, artifactUploader)
        expect(runMock).toHaveReturned()

        // Verify that all the core library functions were called correctly
        expect(setOutputMock).toHaveBeenNthCalledWith(1, 'exit-code', 0)
        expect(errorMock).not.toHaveBeenCalled()

        expect(commandExecutor.command).toEqual('sf scanner run --normalize-severity --outfile results.json --target .')
        expect(commandExecutor.envVars).toEqual({
            NODE_OPTIONS: '--max-old-space-size=8192',
            SCANNER_INTERNAL_OUTFILE: './internalResults.json'
        })

        expect(artifactUploader.artifactName).toEqual('code-analyzer-results')
        expect(artifactUploader.artifactFiles).toEqual(['./internalResults.json'])
    })
})

class FakeCommandExecutor implements CommandExecutor {
    command = ''
    envVars: EnvironmentVariables = {}
    async exec(command: string, envVars: EnvironmentVariables): Promise<number> {
        this.command = command
        this.envVars = envVars
        return 0
    }
}

class FakeArtifactUploader implements ArtifactUploader {
    artifactName = ''
    artifactFiles: string[] = []

    async uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void> {
        this.artifactName = artifactName
        this.artifactFiles = artifactFiles
    }
}
