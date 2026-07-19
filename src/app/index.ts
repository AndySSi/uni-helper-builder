import { configuration } from "src/configuration";

export async function buildApp() {
  const dirname = Context.config.apps.entry.findDirectories({
    excludes: configuration.excludes,
  });

  if (!dirname) {
    "未配置可切换的应用主体".printError();
    return;
  }

  const children = dirname.dirChildren({ mode: 0 });

  if (!children.length) {
    "未配置可切换的应用主体".printError();
    return;
  }

  const body = await Interactive.select(children, false);
  const bodyName = children[body];

  const bodyPath = [dirname, bodyName].toPath;
  const projectPath = [process.cwd(), Context.config.apps.root].toPath;

  bodyPath.copyTo(process.cwd());

  bodyName.printSuccess("watching");
  let throughBody = false;
  let throughProject = false;
  process.cwd().watch(
    (path) => {
      if (path.includes(bodyPath)) {
        if (throughProject) {
          throughProject = false;
          return;
        }

        throughBody = true;
        const targetPath = path.replace(bodyPath, process.cwd());
        if (targetPath.isFile) {
          targetPath.write(path.toUtf8Code);
          targetPath.printInfo("Recode");
        } else {
          throughBody = false;
        }
      } else {
        if (throughBody) {
          throughBody = false;
          return;
        }

        throughProject = true;
        const targetPath = path.replace(process.cwd(), bodyPath);
        if (targetPath.isFile) {
          targetPath.write(path.toUtf8Code);
          targetPath.printInfo("Recode");
        } else {
          throughProject = false;
        }
      }
    },
    configuration.excludes,
    [bodyPath, projectPath],
  );
}
