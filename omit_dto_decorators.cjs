const classDecoratorKeys = ["Freeze", "List", "Mocker"];
const propertyDecoratorKeys = [
  "Required",
  "Default",
  "OriginalKey",
  "WhenList",
  "WhenMap",
];

/**
 * @typedef IVisitor
 * @type {import("@babel/traverse").Visitor}
 */

/**
 * @typedef ITypes
 * @type {import("@babel/types")}
 */

/**
 * @typedef IOption
 * @property {ITypes} types
 */

/**
 * @typedef IPlugin
 * @type {(option: IOption) => { visitor: IVisitor }}
 */

/** @type {IPlugin} */
module.exports = function ({ types: bt }) {
  return {
    visitor: {
      ClassDeclaration(path) {
        if (path.node.id?.name.includes("Dto")) {
          if (Array.isArray(path.node.decorators)) {
            path.node.decorators = path.node.decorators.reduce((prev, item) => {
              if (
                bt.isIdentifier(item.expression) &&
                !classDecoratorKeys.includes(item.expression.name)
              ) {
                prev.push(item);
              }

              return prev;
            }, []);

            if (!path.node.decorators.length) {
              path.node.decorators = undefined;
            }
          }

          path.node.body.body.forEach((item) => {
            if (Array.isArray(item.decorators)) {
              item.decorators = item.decorators.reduce((prev, item) => {
                if (
                  bt.isCallExpression(item.expression) &&
                  bt.isIdentifier(item.expression.callee) &&
                  !propertyDecoratorKeys.includes(item.expression.callee.name)
                ) {
                  prev.push(item);
                }

                return prev;
              }, []);

              if (!item.decorators.length) {
                item.decorators = undefined;
              }
            }
          });
        }
      },
    },
  };
};
