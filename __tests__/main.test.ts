/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { ArtifactUploader } from '../src/main'

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

    it('sets the time output', async () => {
        // Set the action's inputs as return values from core.getInput()
        getInputMock.mockImplementation((name: string): string => {
            switch (name) {
                case 'run-command':
                    return 'run'
                default:
                    return ''
            }
        })

        const artifactUploader: FakeArtifactUploader = new FakeArtifactUploader()
        await main.run(artifactUploader)
        expect(runMock).toHaveReturned()

        // Verify that all the core library functions were called correctly
        expect(setOutputMock).toHaveBeenNthCalledWith(1, 'exit-code', 0)
        expect(errorMock).not.toHaveBeenCalled()
        expect(artifactUploader.artifactName).toEqual('dummy-artifact')
        expect(artifactUploader.artifactFiles).toEqual(['./README.md'])
    })
})

class FakeArtifactUploader implements ArtifactUploader {
    artifactName = ''
    artifactFiles: string[] = []

    async uploadArtifact(artifactName: string, artifactFiles: string[]): Promise<void> {
        this.artifactName = artifactName
        this.artifactFiles = artifactFiles
    }
}
