const buildAst = require("../buildAst");

const pass = (input, output) => expect(buildAst(input)).toEqual(output);
const error = (input, err) => expect(() => buildAst(input)).toThrow(err);

describe("buildAst", () => {
  test("Implied boolean value", () => {
    pass("(debug)", { feature: "debug", value: true });
  });

  test("Implied NOT boolean value", () => {
    pass("not (debug)", { feature: "debug", value: true, not: true });
  });

  test("String value", () => {
    pass("(marketplace: cn)", {
      feature: "marketplace",
      value: "cn"
    });
  });

  test("Numeric value", () => {
    pass("(negative: -1), (zero: 0), (positive: 1)", {
      any: [
        { feature: "negative", value: "-1" },
        { feature: "zero", value: "0" },
        { feature: "positive", value: "1" }
      ]
    });
  });

  test('OR ("Either cn or jp")', () => {
    pass("(marketplace: cn), (marketplace: jp)", {
      any: [
        { feature: "marketplace", value: "cn" },
        { feature: "marketplace", value: "jp" }
      ]
    });
  });

  test('OR Shorthand ("Either cn or jp")', () => {
    pass("(marketplace: cn|jp)", {
      feature: "marketplace",
      value: "cn|jp"
    });
  });

  test('AND ("Both debug and tablet")', () => {
    pass("(debug) and (device-type: tablet)", {
      all: [
        { feature: "debug", value: true },
        { feature: "device-type", value: "tablet" }
      ]
    });
  });

  test("NOT", () => {
    pass("NOT (device-type: tablet)", {
      feature: "device-type",
      value: "tablet",
      not: true
    });
  });

  test('NOT AND ("Neither cn nor jp")', () => {
    pass("NOT (marketplace: cn) AND (marketplace: jp)", {
      all: [
        { feature: "marketplace", value: "cn", not: true },
        { feature: "marketplace", value: "jp", not: true }
      ]
    });
  });

  test('NOT AND Shorthand ("Neither cn nor jp")', () => {
    pass("NOT (marketplace: cn|jp)", {
      feature: "marketplace",
      value: "cn|jp",
      not: true
    });
  });

  test("Tautologically false", () => {
    pass("(anything: a) AND (anything: b)", {
      all: [
        { feature: "anything", value: "a" },
        { feature: "anything", value: "b" }
      ]
    });
  });

  test("Tautologically true", () => {
    pass("NOT (anything), (anything)", {
      any: [
        { feature: "anything", value: true, not: true },
        { feature: "anything", value: true }
      ]
    });
  });

  test("Valid identifiers", () => {
    const special = "!@#$%^&*'\"`;.?~_-+=[]{}\\|/";
    const spaces = "s p a c e s";
    pass(`(f: ${special})`, {
      feature: "f",
      value: special
    });
    pass(`(f: ${spaces})`, {
      feature: "f",
      value: spaces
    });
  });

  test("Case sensitivity", () => {
    pass("(lowercase: UPPERCASE)", {
      feature: "lowercase",
      value: "UPPERCASE"
    });
  });

  test("Case insensitivity", () => {
    pass("NOT (device-type: tablet)", {
      feature: "device-type",
      value: "tablet",
      not: true
    });
    pass("not (device-type: tablet)", {
      feature: "device-type",
      value: "tablet",
      not: true
    });
    pass("(debug) and (device-type: tablet)", {
      all: [
        { feature: "debug", value: true },
        { feature: "device-type", value: "tablet" }
      ]
    });
    pass("(debug) AND (device-type: tablet)", {
      all: [
        { feature: "debug", value: true },
        { feature: "device-type", value: "tablet" }
      ]
    });
  });

  test("Syntax Errors", () => {
    error("", /Expected L_PAREN/);
    error("x", /Unexpected IDENT/);
    error("()", /Expected IDENT/);
    error("NOT", /Expected L_PAREN/);
    error("NOT ()", /Expected IDENT/);
    error("(feature", /Expected R_PAREN/);
    error("(feature),", /Expected L_PAREN/);
    error("(feature) and", /Expected L_PAREN/);
    error("(feature: 1,2)", /Expected R_PAREN/);
    error("screen", /Unexpected IDENT/);
    error("screen AND (feature)", /Unexpected IDENT/);
    error("ONLY screen", /Unexpected IDENT/);
    error("ONLY screen AND (feature)", /Unexpected IDENT/);
  });
});
