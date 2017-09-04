// Const objects are a cheap way to "intern".
// Comparisons by reference address are faster.
// Memory usage is lower.

module.exports = {
  L_PAREN: { name: "L_PAREN" },
  R_PAREN: { name: "R_PAREN" },
  COMMA: { name: "COMMA" },
  COLON: { name: "COLON" }
};
