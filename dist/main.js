"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const artifact_1 = require("@actions/artifact");
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs_1 = __importDefault(require("fs"));
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        core.startGroup('Validate Inputs');
        const inputs = {
            runCommand: core.getInput('run-command'),
            runArgs: core.getInput('run-arguments'),
            resultsArtifactName: core.getInput('results-artifact-name')
        };
        // TODO: Add validation here
        core.info(JSON.stringify(inputs));
        core.endGroup();
        core.startGroup('Running Code Analyzer');
        const execOptions = {
            env: {
                NODE_OPTIONS: '--max-old-space-size=8192',
                SCANNER_INTERNAL_OUTFILE: './internalResults.json'
            }
        };
        const exitCode = await exec.exec('sf', ['scanner', inputs.runCommand, inputs.runArgs], execOptions);
        core.endGroup();
        core.startGroup('Uploading artifact');
        if (fs_1.default.existsSync('./internalResults.json')) {
            const artifact = new artifact_1.DefaultArtifactClient();
            await artifact.uploadArtifact(inputs.resultsArtifactName, ['./internalResults.json'], '.');
        }
        else {
            core.error('No result file found to upload as an artifact.');
        }
        core.endGroup();
        core.startGroup('Setting Outputs');
        core.setOutput('exit-code', exitCode.toString());
        core.endGroup();
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}
exports.run = run;
//# sourceMappingURL=main.js.map