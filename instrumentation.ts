import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || 'lifestack-finance',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  })
);

// Configure OTLP exporter to send traces directly to Kubiks
const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    'https://ingest.kubiks.app/v1/traces',
  headers: {
    'x-kubiks-key': process.env.KUBIKS_API_KEY || '',
  },
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: resource,
  traceExporter: traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Kubiks OpenTelemetry tracing terminated'))
    .catch((log) =>
      console.log('Error terminating Kubiks OpenTelemetry tracing', log)
    )
    .finally(() => process.exit(0));
});

export function register() {
  // OpenTelemetry instrumentation is registered automatically above
}
