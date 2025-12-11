export class Logger {
  private readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }
  log(message: string) {
    console.log(`${this.serviceName} - ${message}`);
    // consider shipping the off to a logging service like sentry or datadog
  }
  error(message: string) {
    console.error(`${this.serviceName} - ${message}`);
    // consider shipping the off to a logging service like sentry or datadog
  }
}
