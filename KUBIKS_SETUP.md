# Kubiks OpenTelemetry Setup Guide

This project is configured to send observability data (traces, logs, metrics) directly to Kubiks using OpenTelemetry instrumentation.

## Configuration

### Environment Variables

The following environment variables are required to enable Kubiks observability:

```bash
# Your Kubiks API key (obtain from https://app.kubiks.ai)
KUBIKS_API_KEY=your_kubiks_api_key_here

# Service name for identification in Kubiks dashboard
OTEL_SERVICE_NAME=lifestack-finance

# Kubiks ingest endpoint
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.kubiks.app/v1/traces
```

### Local Development

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `KUBIKS_API_KEY` in `.env.local` with your actual API key

3. Start your development server:
```bash
npm run dev
```

### Production Deployment

For Vercel deployment, add the environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following:
   - `KUBIKS_API_KEY`: Your Kubiks API key
   - `OTEL_SERVICE_NAME`: `lifestack-finance`
   - `OTEL_EXPORTER_OTLP_ENDPOINT`: `https://ingest.kubiks.app/v1/traces`

4. Redeploy your application for changes to take effect

## Instrumentation Details

The `instrumentation.ts` file in the root directory configures OpenTelemetry with:

- **Trace Exporter**: OTLP HTTP exporter sending traces to Kubiks
- **Auto Instrumentation**: Automatic tracing of HTTP requests, database operations, errors, and external API calls
- **Resource Attributes**: Service name and version for identification

## What Gets Traced

Once configured, Kubiks will automatically capture:

- **API Requests**: All HTTP requests to your Next.js application
- **Performance**: Response times and latency
- **Errors**: Unhandled exceptions and error traces
- **Dependencies**: Database queries, external API calls
- **Context**: Request context, user information, trace correlation

## Viewing Traces in Kubiks

1. Go to https://app.kubiks.ai
2. Navigate to your project dashboard
3. Traces will appear in real-time as your application processes requests

## Troubleshooting

### No traces appearing

1. **Verify API Key**: Ensure `KUBIKS_API_KEY` is set correctly
2. **Check Endpoint**: Confirm `OTEL_EXPORTER_OTLP_ENDPOINT` is `https://ingest.kubiks.app/v1/traces`
3. **Environment Variables**: Make sure variables are loaded in your environment
4. **Network**: Verify your application can reach `https://ingest.kubiks.app`

## Additional Resources

- [Kubiks Documentation](https://docs.kubiks.ai)
- [OpenTelemetry Node.js Documentation](https://opentelemetry.io/docs/instrumentation/js/)
