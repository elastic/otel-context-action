import * as crypto from 'crypto';

/**
 * Generates a trace ID from the run ID and run attempt
 * Based on: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b45f1739c29039a0314b9c97c3ccc578562df36f/receiver/githubactionsreceiver/trace_event_handling.go#L212
 */
export function generateTraceID(runID: string, runAttempt: string): string {
  const input = `${runID}${runAttempt}t`;
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  // Take first 32 hex characters (16 bytes)
  return hash.substring(0, 32);
}

/**
 * Generates a span ID from the run ID, run attempt, job name, step name and optional step number
 * Based on: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b45f1739c29039a0314b9c97c3ccc578562df36f/receiver/githubactionsreceiver/trace_event_handling.go#L262
 */
export function generateSpanID(
  runID: string,
  runAttempt: string,
  jobName: string,
  stepName: string,
  stepNumber = ''
): string {
  let input: string;
  if (stepNumber && parseInt(stepNumber) > 0) {
    input = `${runID}${runAttempt}${jobName}${stepName}${stepNumber}`;
  } else {
    input = `${runID}${runAttempt}${jobName}${stepName}`;
  }

  const hash = crypto.createHash('sha256').update(input).digest('hex');
  // Take characters from index 16 to 32 (8 bytes)
  return hash.substring(16, 32);
}

/**
 * Generates a W3C Trace Context traceparent header
 * Format: version-trace-id-parent-id-trace-flags
 * https://www.w3.org/TR/trace-context-1/#traceparent-header
 */
export function generateTraceparent(
  traceID: string,
  spanID: string,
  sampled = true
): string {
  const version = '00';
  const traceFlags = sampled ? '01' : '00';
  return `${version}-${traceID}-${spanID}-${traceFlags}`;
}
