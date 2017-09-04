const { L_PAREN, R_PAREN, COMMA, COLON } = require("./tokens");

module.exports = function parser(tokens) {
  let index = 0;

  const parseCommaSeparatedList = () => {
    const mediaQueryList = [];
    do {
      mediaQueryList.push(parseMediaQuery());
    } while (maybe(COMMA));
    return { any: mediaQueryList };
  };

  const parseMediaQuery = () => {
    let isNot = false;
    switch (maybeIdent().toLowerCase()) {
      case "not":
        isNot = true;
        break;
      case "":
        break;
      default:
        E_UNEXPECTED("IDENT");
    }
    const featureList = [];
    do {
      const feature = parseFeature();
      if (isNot) feature.not = true;
      featureList.push(feature);
    } while (maybeIdent().toLowerCase() === "and");
    return { all: featureList };
  };

  const parseFeature = () => {
    const expression = {};
    read(L_PAREN);
    expression.feature = readIdent();
    if (maybe(COLON)) {
      expression.value = readIdent();
    } else {
      expression.value = true;
    }
    read(R_PAREN);
    return expression;
  };

  // `read*` methods:
  // - will advance cursor if token is found
  // - will throw an exception if token is not found
  //
  // `maybe*` methods:
  // - will advance cursor if token is found
  // - will return falsy if token is not found

  /* eslint-disable prettier/prettier */
  const E_EXPECTED =   name => { throw new Error('Expected ' + name); };
  const E_UNEXPECTED = name => { throw new Error('Unexpected ' + name); };
  const read       = token => { const t = maybe(token); if (!t) { E_EXPECTED(token.name); } return t; };
  const readIdent  = () => { const i = maybeIdent(); if (!i) { E_EXPECTED('IDENT'); } return i; };
  const maybe      = token => { const t = tokens[index]; if (t === token) { index++; return t; } };
  const maybeIdent = () => { const i = tokens[index]; if (isString(i)) { index++; return i; } return ''; };
  const isString = s => Object.prototype.toString.call(s) === '[object String]';
  /* eslint-enable prettier/prettier */

  return parseCommaSeparatedList();
};
