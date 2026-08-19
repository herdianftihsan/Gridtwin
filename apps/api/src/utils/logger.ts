type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogPayload {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context: this.sanitizeContext(context) }),
    };

    if (error) {
      payload.error = {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      };
    }

    return payload;
  }

  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'key', 'gemini_api_key'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(JSON.stringify(this.formatLog('info', message, context)));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(JSON.stringify(this.formatLog('warn', message, context)));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(JSON.stringify(this.formatLog('error', message, context, error)));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify(this.formatLog('debug', message, context)));
    }
  }
}

export const logger = new Logger();