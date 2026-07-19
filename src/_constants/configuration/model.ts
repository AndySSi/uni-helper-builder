export interface BaseConfiguration {
  readonly entry: string;
  readonly dirname: string;
}

export interface BaseHookConfiguration<T = unknown> {
  readonly hookName: string;
  namespace: string | ((original: string) => string);
  override: T;
}

export interface RestfulApiConfiguration {
  readonly getById: string;
  readonly getAll: string;
  readonly create: string;
  readonly update: string;
  readonly remove: string;
}

export interface AnnotationConfiguration<T> {
  annotation: T;
}
