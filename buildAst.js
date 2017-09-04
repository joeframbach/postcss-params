const lexer = require("./lexer");
const parser = require("./parser");
const flatten = require("./flatten");

module.exports = function buildAst(input) {
  return flatten(parser(lexer(input)));
};
