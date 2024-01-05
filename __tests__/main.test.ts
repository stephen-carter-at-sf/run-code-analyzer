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

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'milliseconds':
          return '500'
        default:
          return ''
      }
    })

    const artifactUploader: FakeArtifactUploader = new FakeArtifactUploader()
    await main.run(artifactUploader)
    expect(runMock).toHaveReturned()

    // Verify that all the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
    expect(debugMock).toHaveBeenNthCalledWith(2, expect.stringMatching(timeRegex))
    expect(debugMock).toHaveBeenNthCalledWith(3, expect.stringMatching(timeRegex))
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'time', expect.stringMatching(timeRegex))
    expect(errorMock).not.toHaveBeenCalled()
    expect(artifactUploader.artifactName).toEqual('dummy-artifact')
    expect(artifactUploader.artifactFiles).toEqual(['./README.md'])
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        default:
          return ''
      }
    })

    await main.run(new FakeArtifactUploader())
    expect(runMock).toHaveReturned()

    // Verify that all the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, 'milliseconds not a number')
    expect(errorMock).not.toHaveBeenCalled()
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
