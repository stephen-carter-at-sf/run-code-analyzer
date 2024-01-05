/**
 * The entrypoint for the action.
 */
import { ArtifactUploader, run } from './main'
import { DefaultArtifactClient } from '@actions/artifact'

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
run(new RuntimeArtifactUploader())
