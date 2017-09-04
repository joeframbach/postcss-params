const lexer = require("../lexer");
const { L_PAREN, R_PAREN, COMMA, COLON } = require("../tokens");

const pass = (input, output) => expect(lexer(input)).toEqual(output);

describe("lexer", () => {
  test("Implied boolean value", () => {
    pass("(debug)", [L_PAREN, "debug", R_PAREN]);
  });

  test("String value", () => {
    pass("(marketplace: cn)", [L_PAREN, "marketplace", COLON, "cn", R_PAREN]);
  });

  test("Numeric value", () => {
    pass("(negative: -1), (zero: 0), (positive: 1)", [
      L_PAREN,
      "negative",
      COLON,
      "-1",
      R_PAREN,
      COMMA,
      L_PAREN,
      "zero",
      COLON,
      "0",
      R_PAREN,
      COMMA,
      L_PAREN,
      "positive",
      COLON,
      "1",
      R_PAREN
    ]);
  });

  test('OR ("Either cn or jp")', () => {
    pass("(marketplace: cn), (marketplace: jp)", [
      L_PAREN,
      "marketplace",
      COLON,
      "cn",
      R_PAREN,
      COMMA,
      L_PAREN,
      "marketplace",
      COLON,
      "jp",
      R_PAREN
    ]);
  });

  test('OR Shorthand ("Either cn or jp")', () => {
    pass("(marketplace: cn|jp)", [
      L_PAREN,
      "marketplace",
      COLON,
      "cn|jp",
      R_PAREN
    ]);
  });

  test('AND ("Both debug and tablet")', () => {
    pass("(debug) and (device-type: tablet)", [
      L_PAREN,
      "debug",
      R_PAREN,
      "and",
      L_PAREN,
      "device-type",
      COLON,
      "tablet",
      R_PAREN
    ]);
  });

  test("NOT", () => {
    pass("NOT (device-type: tablet)", [
      "NOT",
      L_PAREN,
      "device-type",
      COLON,
      "tablet",
      R_PAREN
    ]);
  });

  test('NOT AND ("Neither cn nor jp")', () => {
    pass("NOT (marketplace: cn) AND (marketplace: jp)", [
      "NOT",
      L_PAREN,
      "marketplace",
      COLON,
      "cn",
      R_PAREN,
      "AND",
      L_PAREN,
      "marketplace",
      COLON,
      "jp",
      R_PAREN
    ]);
  });

  test('NOT AND Shorthand ("Neither cn nor jp")', () => {
    pass("NOT (marketplace: cn|jp)", [
      "NOT",
      L_PAREN,
      "marketplace",
      COLON,
      "cn|jp",
      R_PAREN
    ]);
  });

  test("Tautologically false", () => {
    pass("(anything: a) AND (anything: b)", [
      L_PAREN,
      "anything",
      COLON,
      "a",
      R_PAREN,
      "AND",
      L_PAREN,
      "anything",
      COLON,
      "b",
      R_PAREN
    ]);
  });

  test("Tautologically true", () => {
    pass("NOT (anything), (anything)", [
      "NOT",
      L_PAREN,
      "anything",
      R_PAREN,
      COMMA,
      L_PAREN,
      "anything",
      R_PAREN
    ]);
  });

  test("Valid identifiers", () => {
    const special = "!@#$%^&*'\"`;.?~_-+=[]{}\\|/";
    const spaces = "s p a c e s";
    pass(`(f: ${special})`, [L_PAREN, "f", COLON, special, R_PAREN]);
    pass(`(f: ${spaces})`, [L_PAREN, "f", COLON, spaces, R_PAREN]);
  });

  test("Case sensitivity", () => {
    pass("(lowercase: UPPERCASE)", [
      L_PAREN,
      "lowercase",
      COLON,
      "UPPERCASE",
      R_PAREN
    ]);
  });
});
