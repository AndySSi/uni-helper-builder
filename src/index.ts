import "ts-chained-ast/dist/index.es";
import { buildDto } from "./dto";
import { buildDomain } from "./domain";
import { buildUseCase } from "./use_case";
import { buildApp } from "./app";
import { version } from "../package.json";
import { BuilderCommands } from "./constants";
import { defaultConfiguration } from "./_constants";

try {
  (async () => {
    assert.version(20);

    Context.setEntry("code-build");
    await Context.init(defaultConfiguration);

    Interactive.route(
      BuilderCommands[BuilderCommands.domain].padSuffix(":生成领域模板"),
      buildDomain,
    )
      .route(
        BuilderCommands[BuilderCommands.useCase].padSuffix(":生成单个用例"),
        buildUseCase,
      )
      .route(
        BuilderCommands[BuilderCommands.dto].padSuffix(":生成数据模型"),
        buildDto,
      )
      .route(
        BuilderCommands[BuilderCommands.app].padSuffix(":选择应用开发"),
        buildApp,
      )
      .runner(`Select Generator @${version}`);
  })();
} catch (error) {
  console.error(error);
}
