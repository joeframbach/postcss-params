const buildAst = require("./buildAst");

function compare(ast, obj) {
  const evaluateNode = node => {
    const { any, all, not, feature, value } = node;
    if (feature) {
      const ret = feature in obj && obj[feature] === value;
      return not ? !ret : ret;
    }
    if (any) return any.some(evaluateNode);
    // istanbul ignore else
    if (all) return all.every(evaluateNode);
    // istanbul ignore next
    throw new Error("AST Comparator given an invalid node");
  };
  return evaluateNode(ast);
}

module.exports = function buildComparator(input) {
  const ast = buildAst(input);
  return obj => compare(ast, obj);
};
