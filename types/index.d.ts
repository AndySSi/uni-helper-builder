export interface BaseConfiguration {
  readonly entry: string;
  readonly dirname: string;
}

export interface BaseHookConfiguration<T = unknown> {
  readonly hookName: string;
  namespace: string | ((original: string) => string);
  override: T;
}

export interface RepositoryRestfulApiConfiguration {
  readonly getById: string;
  readonly getAll: string;
  readonly create: string;
  readonly update: string;
  readonly remove: string;
}

export interface AnnotationConfiguration<T> {
  annotation: T;
}

export interface ConfigOption {
  readonly dependencyName: string;
  dependencies: {
    assert: Pick<BaseHookConfiguration, 'hookName'>;
    createSingleton: Pick<BaseHookConfiguration, 'hookName'>;
    httpRequestMethod: Pick<BaseHookConfiguration, 'hookName'>;
    validArray: Pick<BaseHookConfiguration, 'hookName'>;
    validObject: Pick<BaseHookConfiguration, 'hookName'>;
  };
  domain: DomainConfiguration;
  useCase: UseCaseConfiguration;
  entities: EntitiesConfiguration;
  requestParams: RequestParamsConfiguration;
  repository: RepositoryConfiguration;
  apps: AppsConfiguration;
}

export interface DomainEventConfiguration {
  readonly args: string;
  readonly on: string;
}

export interface DomainConfiguration extends BaseConfiguration, BaseHookConfiguration<DomainEventConfiguration> {
  readonly casesKey: string;
  readonly configFile: string;
}

export interface UseCaseRestfulApiConfiguration {
  readonly detail: string;
  readonly paginator: string;
  readonly created: string;
  readonly updated: string;
  readonly deleted: string;
}

export type UseCaseBasicConfiguration = Omit<BaseHookConfiguration<{ readonly onRun: string }>, 'namespace'>;

export type UseCaseModuleConfiguration = UseCaseBasicConfiguration;

export type UseCasePaginatorConfiguration = UseCaseBasicConfiguration & AnnotationConfiguration<{ readonly pagedResultDto: string; readonly pagedQueryParams: string }>;

export interface UseCaseConfiguration extends BaseConfiguration {
  readonly fileSuffix: string;
  readonly aggregateRoot: string;
  restful: UseCaseRestfulApiConfiguration;
  models: {
    basic: UseCaseBasicConfiguration;
    module: UseCaseModuleConfiguration;
    paginator: UseCasePaginatorConfiguration;
  };
}

export interface DtoFormatterConfiguration {
  readonly toList: string;
  readonly fromJson: string;
}

export interface DtoConvertsConfiguration {
  readonly matched: RegExp;
  readonly resultId: string;
  readonly fromId: string;
}

export interface DtoDecoratorsConfiguration {
  readonly required: string;
  readonly default: string;
  readonly originalKey: string;
  readonly freeze: string;
  readonly list: string;
  readonly whenList: string;
  readonly whenMap: string;
}

export interface DtoConfiguration extends BaseHookConfiguration<DtoFormatterConfiguration> {
  readonly fileSuffix: string;
  converts: DtoConvertsConfiguration & BaseConfiguration;
  decorators: DtoDecoratorsConfiguration;
}

export interface EntitiesConfiguration extends BaseConfiguration {
  dto: DtoConfiguration;
}

export interface RequestParamsConfiguration extends BaseConfiguration {}

export interface HttpApiConfiguration extends Omit<BaseConfiguration, 'dirname'>, Omit<BaseHookConfiguration<{ readonly request: string }>, 'namespace'> {
  readonly params: string;
  readonly response: string;
  properties: {
    readonly method: string;
    readonly url: string;
    readonly formatter: string;
    readonly query: string;
    readonly body: string;
  };
}

export interface RepositoryPathBuilderConfiguration {
  pathBuilder: Omit<BaseHookConfiguration<{ readonly resolve: string }>, 'namespace'>;
}

export interface RepositoryConfiguration extends Omit<BaseConfiguration, 'dirname'>, BaseHookConfiguration<RepositoryPathBuilderConfiguration> {
  restful: RepositoryRestfulApiConfiguration;
  httpApi: HttpApiConfiguration;
  enableSingleton: boolean | [source: string, named: string];
}

export interface AppsConfiguration {
  readonly root: string;
  readonly entry: string;
}
