import * as core from '@actions/core';
import { generateTraceID, generateSpanID, generateTraceparent } from './generate';

async function run(): Promise<void> {
  try {
    // Detect parameters from GitHub context environment variables
    const runID = process.env.GITHUB_RUN_ID || '';
    const runAttempt = process.env.GITHUB_RUN_ATTEMPT || '1';
    const jobName = process.env.GITHUB_JOB || '';
    // TODO: Consider using step name and number if available in future GitHub context
    const stepName = '';
    const stepNumber = '';

    if (!runID || !runAttempt || !jobName || !stepName) {
      throw new Error('Missing required GitHub context: GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT, GITHUB_JOB, GITHUB_ACTION');
    }

    core.debug(`Context - runID: ${runID}, runAttempt: ${runAttempt}, jobName: ${jobName}, stepName: ${stepName}, stepNumber: ${stepNumber}`);

    const traceID = generateTraceID(runID, runAttempt);
    const spanID = generateSpanID(runID, runAttempt, jobName, stepName, stepNumber);
    const traceparent = generateTraceparent(traceID, spanID);

    // Set as outputs
    core.setOutput('trace-id', traceID);
    core.setOutput('span-id', spanID);
    core.setOutput('traceparent', traceparent);

    // Set as environment variables
    core.exportVariable('TRACE_ID', traceID);
    core.exportVariable('SPAN_ID', spanID);
    core.exportVariable('TRACEPARENT', traceparent);

    core.info(`✓ Generated TRACE_ID: ${traceID}`);
    core.info(`✓ Generated SPAN_ID: ${spanID}`);
    core.info(`✓ Generated TRACEPARENT: ${traceparent}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

run();
