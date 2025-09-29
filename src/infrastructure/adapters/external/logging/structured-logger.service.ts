import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  [key: string]: any;
}

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly logLevels: LogLevel[] = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
  ];
  private readonly currentLogLevel: string;

  constructor() {
    this.currentLogLevel = process.env.LOG_LEVEL || 'log';
  }

  private shouldLog(level: string): boolean {
    const levelPriority = this.logLevels.indexOf(level as LogLevel);
    const currentPriority = this.logLevels.indexOf(
      this.currentLogLevel as LogLevel,
    );
    return levelPriority <= currentPriority;
  }

  private formatLog(
    level: string,
    message: string,
    context?: string,
    meta?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...meta,
    };
  }

  private writeLog(level: string, entry: LogEntry) {
    if (!this.shouldLog(level)) return;

    const logEntry = JSON.stringify(entry);

    if (level === 'error') {
      console.error(logEntry);
    } else if (level === 'warn') {
      console.warn(logEntry);
    } else {
      console.log(logEntry);
    }
  }

  log(message: string, context?: string, meta?: any) {
    const entry = this.formatLog('info', message, context, meta);
    this.writeLog('log', entry);
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    const entry = this.formatLog('error', message, context, {
      trace,
      ...meta,
    });
    this.writeLog('error', entry);
  }

  warn(message: string, context?: string, meta?: any) {
    const entry = this.formatLog('warn', message, context, meta);
    this.writeLog('warn', entry);
  }

  debug(message: string, context?: string, meta?: any) {
    const entry = this.formatLog('debug', message, context, meta);
    this.writeLog('debug', entry);
  }

  verbose(message: string, context?: string, meta?: any) {
    const entry = this.formatLog('verbose', message, context, meta);
    this.writeLog('verbose', entry);
  }
}
