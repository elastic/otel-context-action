import { generateTraceID, generateSpanID, generateTraceparent } from '../src/generate';
import * as crypto from 'crypto';

describe('generateTraceID', () => {
  it('should generate a 32-character hex trace ID', () => {
    const traceID = generateTraceID('12345', '1');
    expect(traceID).toHaveLength(32);
    expect(traceID).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should generate the same trace ID for the same inputs', () => {
    const traceID1 = generateTraceID('12345', '1');
    const traceID2 = generateTraceID('12345', '1');
    expect(traceID1).toBe(traceID2);
  });

  it('should generate different trace IDs for different run IDs', () => {
    const traceID1 = generateTraceID('12345', '1');
    const traceID2 = generateTraceID('67890', '1');
    expect(traceID1).not.toBe(traceID2);
  });

  it('should generate different trace IDs for different run attempts', () => {
    const traceID1 = generateTraceID('12345', '1');
    const traceID2 = generateTraceID('12345', '2');
    expect(traceID1).not.toBe(traceID2);
  });

  it('should match expected hash output', () => {
    const runID = '12345';
    const runAttempt = '1';
    const input = `${runID}${runAttempt}t`;
    const expectedHash = crypto.createHash('sha256').update(input).digest('hex').substring(0, 32);

    const traceID = generateTraceID(runID, runAttempt);
    expect(traceID).toBe(expectedHash);
  });
});

describe('generateSpanID', () => {
  it('should generate a 16-character hex span ID', () => {
    const spanID = generateSpanID('12345', '1', 'build', 'test');
    expect(spanID).toHaveLength(16);
    expect(spanID).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should generate the same span ID for the same inputs', () => {
    const spanID1 = generateSpanID('12345', '1', 'build', 'test');
    const spanID2 = generateSpanID('12345', '1', 'build', 'test');
    expect(spanID1).toBe(spanID2);
  });

  it('should generate different span IDs for different job names', () => {
    const spanID1 = generateSpanID('12345', '1', 'build', 'test');
    const spanID2 = generateSpanID('12345', '1', 'deploy', 'test');
    expect(spanID1).not.toBe(spanID2);
  });

  it('should generate different span IDs for different step names', () => {
    const spanID1 = generateSpanID('12345', '1', 'build', 'test');
    const spanID2 = generateSpanID('12345', '1', 'build', 'lint');
    expect(spanID1).not.toBe(spanID2);
  });

  it('should include step number when provided and greater than 0', () => {
    const spanID1 = generateSpanID('12345', '1', 'build', 'test', '1');
    const spanID2 = generateSpanID('12345', '1', 'build', 'test', '2');
    expect(spanID1).not.toBe(spanID2);
  });

  it('should ignore step number when it is 0', () => {
    const spanID1 = generateSpanID('12345', '1', 'build', 'test', '0');
    const spanID2 = generateSpanID('12345', '1', 'build', 'test');
    expect(spanID1).toBe(spanID2);
  });

  it('should ignore step number when it is empty string', () => {
    const spanID1 = generateSpanID('12345', '1', 'build', 'test', '');
    const spanID2 = generateSpanID('12345', '1', 'build', 'test');
    expect(spanID1).toBe(spanID2);
  });

  it('should match expected hash output without step number', () => {
    const runID = '12345';
    const runAttempt = '1';
    const jobName = 'build';
    const stepName = 'test';
    const input = `${runID}${runAttempt}${jobName}${stepName}`;
    const expectedHash = crypto.createHash('sha256').update(input).digest('hex').substring(16, 32);

    const spanID = generateSpanID(runID, runAttempt, jobName, stepName);
    expect(spanID).toBe(expectedHash);
  });

  it('should match expected hash output with step number', () => {
    const runID = '12345';
    const runAttempt = '1';
    const jobName = 'build';
    const stepName = 'test';
    const stepNumber = '5';
    const input = `${runID}${runAttempt}${jobName}${stepName}${stepNumber}`;
    const expectedHash = crypto.createHash('sha256').update(input).digest('hex').substring(16, 32);

    const spanID = generateSpanID(runID, runAttempt, jobName, stepName, stepNumber);
    expect(spanID).toBe(expectedHash);
  });
});

describe('OpenTelemetry compatibility', () => {
  it('should generate valid OpenTelemetry trace ID format', () => {
    const traceID = generateTraceID('12345', '1');
    // OTel trace ID is 16 bytes (32 hex chars)
    expect(traceID).toHaveLength(32);
    expect(Buffer.from(traceID, 'hex')).toHaveLength(16);
  });

  it('should generate valid OpenTelemetry span ID format', () => {
    const spanID = generateSpanID('12345', '1', 'build', 'test');
    // OTel span ID is 8 bytes (16 hex chars)
    expect(spanID).toHaveLength(16);
    expect(Buffer.from(spanID, 'hex')).toHaveLength(8);
  });
});

describe('generateTraceparent', () => {
  it('should generate valid W3C Trace Context traceparent header', () => {
    const traceID = '0af7651916cd43dd8448eb211c80319c';
    const spanID = 'b9c7c989f97918e1';
    const traceparent = generateTraceparent(traceID, spanID);

    expect(traceparent).toBe('00-0af7651916cd43dd8448eb211c80319c-b9c7c989f97918e1-01');
  });

  it('should have correct format with version-trace-id-span-id-flags', () => {
    const traceID = generateTraceID('12345', '1');
    const spanID = generateSpanID('12345', '1', 'build', 'test');
    const traceparent = generateTraceparent(traceID, spanID);

    const parts = traceparent.split('-');
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('00'); // version
    expect(parts[1]).toBe(traceID);
    expect(parts[2]).toBe(spanID);
    expect(parts[3]).toBe('01'); // sampled flag
  });

  it('should set sampled flag to 01 by default', () => {
    const traceparent = generateTraceparent('0af7651916cd43dd8448eb211c80319c', 'b9c7c989f97918e1');
    expect(traceparent).toMatch(/-01$/);
  });

  it('should set sampled flag to 01 when sampled=true', () => {
    const traceparent = generateTraceparent(
      '0af7651916cd43dd8448eb211c80319c',
      'b9c7c989f97918e1',
      true
    );
    expect(traceparent).toMatch(/-01$/);
  });

  it('should set sampled flag to 00 when sampled=false', () => {
    const traceparent = generateTraceparent(
      '0af7651916cd43dd8448eb211c80319c',
      'b9c7c989f97918e1',
      false
    );
    expect(traceparent).toMatch(/-00$/);
  });

  it('should generate consistent traceparent for same inputs', () => {
    const traceID = generateTraceID('12345', '1');
    const spanID = generateSpanID('12345', '1', 'build', 'test');

    const traceparent1 = generateTraceparent(traceID, spanID);
    const traceparent2 = generateTraceparent(traceID, spanID);

    expect(traceparent1).toBe(traceparent2);
  });

  it('should match W3C spec format regex', () => {
    const traceparent = generateTraceparent('0af7651916cd43dd8448eb211c80319c', 'b9c7c989f97918e1');

    // W3C Trace Context regex pattern
    const w3cPattern = /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/;
    expect(traceparent).toMatch(w3cPattern);
  });
});
