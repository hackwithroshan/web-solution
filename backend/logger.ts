
import pino from 'pino';

// Configure Pino logger
// NOTE: pino v9+ requires using pino.transport() for transports.
const transport = process.env.NODE_ENV === 'development'
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    })
  : undefined;

// If a transport is defined, pass it to pino. Otherwise, pino logs to stdout with default settings.
const logger = pino(transport);

export default logger;