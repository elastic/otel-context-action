/**
 * Generates a trace ID from the run ID and run attempt
 * Based on: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b45f1739c29039a0314b9c97c3ccc578562df36f/receiver/githubactionsreceiver/trace_event_handling.go#L212
 */
export declare function generateTraceID(runID: string, runAttempt: string): string;
/**
 * Generates a span ID from the run ID, run attempt, job name, step name and optional step number
 * Based on: https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/b45f1739c29039a0314b9c97c3ccc578562df36f/receiver/githubactionsreceiver/trace_event_handling.go#L262
 */
export declare function generateSpanID(runID: string, runAttempt: string, jobName: string, stepName: string, stepNumber?: string): string;
/**
 * Generates a W3C Trace Context traceparent header
 * Format: version-trace-id-parent-id-trace-flags
 * https://www.w3.org/TR/trace-context-1/#traceparent-header
 */
export declare function generateTraceparent(traceID: string, spanID: string, sampled?: boolean): string;
