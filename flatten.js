module.exports = function flatten(ast) {
  const flattenNode = node => {
    const { any, all, not, feature } = node;
    if (not || feature) return node;
    const children = (any || all || []).map(flattenNode);
    if (any) return any.length > 1 ? { any: children } : children[0];
    if (all) return all.length > 1 ? { all: children } : children[0];
    console.log("Throwing!");
    throw new Error("Invalid node found in ast");
  };
  return flattenNode(ast);
};
