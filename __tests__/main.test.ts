import * as main from '../src/main'
import { FakeDependencies } from './fakes'

describe('action', () => {
    it('Test default values', async () => {
        process.env['JAVA_HOME_11_X64'] = 'SomeJavaPath'
        const dependencies: FakeDependencies = new FakeDependencies()
        await main.run(dependencies)

        expect(dependencies.execCommandCallHistory).toHaveLength(1)
        expect(dependencies.execCommandCallHistory).toContainEqual({
            command: 'sf scanner run --normalize-severity',
            envVars: {
                NODE_OPTIONS: '--max-old-space-size=8192',
                SCANNER_INTERNAL_OUTFILE: 'salesforceCodeAnalyzerResults.json',
                JAVA_HOME: 'SomeJavaPath'
            }
        })

        expect(dependencies.uploadArtifactCallHistory).toHaveLength(1)
        expect(dependencies.uploadArtifactCallHistory).toContainEqual({
            artifactName: 'code-analyzer-results',
            artifactFiles: ['salesforceCodeAnalyzerResults.json']
        })

        expect(dependencies.setOutputCallHistory).toHaveLength(1)
        expect(dependencies.setOutputCallHistory).toContainEqual({
            name: 'exit-code',
            value: '0'
        })

        expect(dependencies.failCallHistory).toHaveLength(0)
    })
})
