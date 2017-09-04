const { L_PAREN, R_PAREN, COMMA, COLON } = require("./tokens");

module.exports = function lexer(input) {
  return input
    .split(/([(),:])/)
    .map(t => {
      switch (t) {
        case "(":
          return L_PAREN;
        case ")":
          return R_PAREN;
        case ",":
          return COMMA;
        case ":":
          return COLON;
        default:
          return t.trim();
      }
    })
    .filter(t => t);
};
