const flatten = require("../flatten");

const pass = (input, expected) => expect(flatten(input)).toEqual(expected);
const error = (input, err) => expect(() => flatten(input)).toThrow(err);

describe("flatten", () => {
  test("already flattened", () => {
    const input = { feature: "A" };
    const expected = { feature: "A" };
    pass(input, expected);
  });

  test("invalid input", () => {
    const input = { garbage: "xyz" };
    error(input, /Invalid node found in ast/);
  });

  test("any A", () => {
    const input = {
      any: [{ feature: "A" }]
    };
    const expected = { feature: "A" };
    pass(input, expected);
  });

  test("any A,B,C", () => {
    const input = {
      any: [{ feature: "A" }, { feature: "B" }, { feature: "C" }]
    };
    const expected = {
      any: [{ feature: "A" }, { feature: "B" }, { feature: "C" }]
    };
    pass(input, expected);
  });

  test("all A", () => {
    const input = {
      any: [{ feature: "A" }]
    };
    const expected = { feature: "A" };
    pass(input, expected);
  });

  test("all A,B,C", () => {
    const input = {
      any: [{ feature: "A" }, { feature: "B" }, { feature: "C" }]
    };
    const expected = {
      any: [{ feature: "A" }, { feature: "B" }, { feature: "C" }]
    };
    pass(input, expected);
  });

  test("any all A", () => {
    const input = {
      any: [{ all: [{ feature: "A" }] }]
    };
    const expected = { feature: "A" };
    pass(input, expected);
  });

  test("any all A,B,C", () => {
    const input = {
      any: [{ all: [{ feature: "A" }, { feature: "B" }, { feature: "C" }] }]
    };
    const expected = {
      all: [{ feature: "A" }, { feature: "B" }, { feature: "C" }]
    };
    pass(input, expected);
  });
});
