export const buildImports = (items: Array<[source: string, specifiers: string | string[], unnamed?: boolean]>) =>
  items.map(([source, specifiers, unnamed]) => {
    const _specifiers = typeof specifiers === 'string' ? [specifiers] : specifiers;

    return Object.stringLiteral({ text: source }).importDeclaration({
      importClause: unnamed
        ? Object.identifier({ text: _specifiers[0] }).importClause({})
        : _specifiers
            .map((specifier) => Object.identifier({ text: specifier }).importSpecifier({}))
            .namedImports()
            .importClause({}),
    });
  });
