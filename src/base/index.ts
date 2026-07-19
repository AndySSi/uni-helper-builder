export abstract class BaseBuildProcess {
  abstract run(...args: any[]): Promise<void>;
}

export abstract class BaseBuildCommand<T = any> {
  // abstract runnerType: T;
}

export abstract class BaseContext {
  static throughGet(...args: any[]): void {}
}
