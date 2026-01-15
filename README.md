# Elastic OTel Context Action

[![usages](https://img.shields.io/badge/usages-white?logo=githubactions&logoColor=blue)](https://github.com/search?q=elastic/otel-context-action/aws/auth+(path:.github/workflows+OR+path:**/action.yml+OR+path:**/action.yaml)&type=code)
[![test](https://github.com/elastic/otel-context-action/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/elastic/otel-context-action/actions/workflows/ci.yml)

Generates OpenTelemetry trace and span IDs for GitHub Actions workflows, allowing you to correlate traces from the [OpenTelemetry GitHub Actions receiver](https://github.com/v1v/opentelemetry-github-actions-receiver/blob/main/trace_event_handling.go#L240-L279).

Automatically detects GitHub context and sets `TRACE_ID`, `SPAN_ID` and `TRACEPARENT` environment variables in your workflow.

## Usage

```yaml
- name: Generate OTel IDs
  uses: elastic/elastic-otel-wrapper-action@v1

- name: Use the IDs
  run: |
    echo "Trace ID: $TRACE_ID"
    echo "Span ID: $SPAN_ID"
    echo "Traceparent: $TRACEPARENT"
```

### Using Outputs

```yaml
- name: Generate OTel IDs
  id: otel
  uses: elastic/elastic-otel-wrapper-action@v1

- name: Access via outputs
  run: |
    echo "Trace: ${{ steps.otel.outputs.trace-id }}"
    echo "Span: ${{ steps.otel.outputs.span-id }}"
```

## Detected Parameters

The action automatically detects these from GitHub context:

- `GITHUB_RUN_ID` - Used for trace ID generation
- `GITHUB_RUN_ATTEMPT` - Used for trace ID generation
- `GITHUB_JOB` - Used for span ID generation

## Outputs

| Output | Description |
|--------|-------------|
| `trace-id` | Generated OpenTelemetry trace ID (32 hex characters) |
| `span-id` | Generated OpenTelemetry span ID (16 hex characters) |
| `traceparent` | W3C Trace Context traceparent header |

## Environment Variables

These are automatically set for use in subsequent steps:

- `TRACE_ID` - The generated trace ID (32 hex characters)
- `SPAN_ID` - The generated span ID (16 hex characters)
- `TRACEPARENT` - W3C Trace Context traceparent header (format: `00-{trace-id}-{span-id}-01`)

## How It Works

**Trace ID**: SHA-256 hash of `{runID}{runAttempt}t`, first 32 hex characters

**Span ID**: SHA-256 hash of `{runID}{runAttempt}{jobName}{stepName}{stepNumber?}`, characters 16-32

Based on the [OTel GitHub Actions receiver](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/receiver/githubactionsreceiver/trace_event_handling.go) implementation.

## Tasks

- [ ] Infer the step number and step name