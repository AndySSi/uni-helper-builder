import * as bt from '@babel/types';

/** Preserve import order; only add missing bindings and promote required runtime bindings. */
export function mergeDependencyImports(ast: bt.File, source: string, runtime: string[], types: string[] = []) {
  const body = ast.program.body;
  for (const node of body) {
    if (!bt.isImportDeclaration(node) || node.source.value === source) continue;
    const conflict = node.specifiers.find(item => [...runtime, ...types].includes(item.local.name));
    if (conflict) {
      throw new Error(`Dependency configuration mismatch: ${conflict.local.name} is already imported from ${node.source.value}, but dependencyName is ${source}. Check code-build.config.ts before generating.`);
    }
  }
  const imports = body.filter(
    (node): node is bt.ImportDeclaration => bt.isImportDeclaration(node) && node.source.value === source,
  );
  let target = imports.find(
    (node) => node.importKind !== 'type' && !node.specifiers.some((item) => bt.isImportNamespaceSpecifier(item)),
  );
  function add(specifier: bt.ImportSpecifier) {
    if (!target) {
      target = bt.importDeclaration([], bt.stringLiteral(source));
      const last = imports[imports.length - 1];
      body.splice(last ? body.indexOf(last) + 1 : 0, 0, target);
      imports.push(target);
    }
    specifier.importKind = 'value';
    target.specifiers.push(specifier);
  }
  for (const name of new Set([...runtime, ...types])) {
    const owner = imports.find((node) => node.specifiers.some((item) => item.local.name === name));
    const existing = owner?.specifiers.find((item) => item.local.name === name);
    if (existing && owner) {
      if (
        !bt.isImportSpecifier(existing) ||
        (bt.isIdentifier(existing.imported) ? existing.imported.name : existing.imported.value) !== name
      ) {
        throw new Error(`Cannot import ${name} from ${source}: the local name is already bound to another export`);
      }
      if (runtime.includes(name)) {
        if (owner.importKind === 'type') {
          owner.specifiers.splice(owner.specifiers.indexOf(existing), 1);
          add(existing);
          if (!owner.specifiers.length) body.splice(body.indexOf(owner), 1);
        } else {
          existing.importKind = 'value';
        }
      }
      continue;
    }
    add(bt.importSpecifier(bt.identifier(name), bt.identifier(name)));
  }
}
