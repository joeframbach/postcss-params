const buildComparator = require("../buildComparator");

const pass = (input, obj) => expect(buildComparator(input)(obj)).toEqual(true);
const fail = (input, obj) => expect(buildComparator(input)(obj)).toEqual(false);

describe("buildComparator", () => {
  test("Implied boolean value", () => {
    pass("(debug)", { debug: true });
    fail("(debug)", { debug: false });
    fail("(debug)", { nonSequitur: "foo" });
  });

  test("Implied NOT boolean value", () => {
    fail("not (debug)", { debug: true });
    pass("not (debug)", { debug: false });
    pass("not (debug)", { nonSequitur: "foo" });
  });

  test("String value", () => {
    pass("(marketplace: cn)", { marketplace: "cn" });
    fail("(marketplace: cn)", { marketplace: "us" });
    fail("(marketplace: cn)", { nonSequitur: "foo" });
  });

  test("Numeric values are treated as strings", () => {
    pass("(negative: -1)", { negative: "-1" });
    pass("(zero: 0)", { zero: "0" });
    pass("(positive: 1)", { positive: "1" });

    fail("(negative: -1)", { negative: -1 });
    fail("(zero: 0)", { zero: 0 });
    fail("(positive: 1)", { positive: 1 });
  });

  test('OR ("Either cn or jp")', () => {
    pass("(marketplace: cn), (marketplace: jp)", { marketplace: "cn" });
    pass("(marketplace: cn), (marketplace: jp)", { marketplace: "jp" });
    fail("(marketplace: cn), (marketplace: jp)", { marketplace: "us" });
    fail("(marketplace: cn), (marketplace: jp)", { nonSequitur: "foo" });
  });

  test('AND ("Both debug and tablet")', () => {
    fail("(debug) and (device-type: tablet)", { debug: true });
    fail("(debug) and (device-type: tablet)", { "device-type": "tablet" });
    pass("(debug) and (device-type: tablet)", {
      debug: true,
      "device-type": "tablet"
    });
    pass("(debug) and (device-type: tablet)", {
      debug: true,
      "device-type": "tablet",
      nonSequitur: "foo"
    });
  });

  test("NOT", () => {
    fail("NOT (device-type: tablet)", { "device-type": "tablet" });
    pass("NOT (device-type: tablet)", { "device-type": "mobile" });
    pass("NOT (device-type: tablet)", { nonSequitur: "foo" });
  });

  test('NOT AND ("Neither cn nor jp")', () => {
    fail("NOT (marketplace: cn) AND (marketplace: jp)", { marketplace: "cn" });
    fail("NOT (marketplace: cn) AND (marketplace: jp)", { marketplace: "jp" });
    pass("NOT (marketplace: cn) AND (marketplace: jp)", { marketplace: "us" });
    pass("NOT (marketplace: cn) AND (marketplace: jp)", { nonSequitur: "foo" });
  });

  test("Tautologically false", () => {
    fail("(anything: a) AND (anything: b)", {});
    fail("(anything: a) AND (anything: b)", { nonSequitur: "foo" });
    fail("(anything: a) AND (anything: b)", { literally: "anything" });
  });

  test("Tautologically true", () => {
    pass("NOT (anything), (anything)", {});
    pass("NOT (anything), (anything)", { nonSequitur: "foo" });
    pass("NOT (anything), (anything)", { literally: "anything" });
  });

  test("Valid identifiers", () => {
    const special = "!@#$%^&*'\"`;.?~_-+=[]{}\\|/";
    const spaces = "s p a c e s";
    pass(`(f: ${special})`, { f: special });
    pass(`(f: ${spaces})`, { f: spaces });
  });

  test("Case sensitivity", () => {
    pass("(lowercase: UPPERCASE)", { lowercase: "UPPERCASE" });
  });

  test("Case insensitivity", () => {
    fail("NOT (device-type: tablet)", { "device-type": "tablet" });
    fail("not (device-type: tablet)", { "device-type": "tablet" });
    fail("(debug) and (device-type: tablet)", { debug: true });
    fail("(debug) AND (device-type: tablet)", { debug: true });
  });
});
