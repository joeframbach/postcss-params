[![npm version](https://img.shields.io/npm/v/postcss-params.svg)](https://www.npmjs.com/package/postcss-params)
[![Build Status](https://img.shields.io/travis/joeframbach/postcss-params.svg)](https://travis-ci.org/joeframbach/postcss-params)
[![Coverage Status](https://img.shields.io/coveralls/joeframbach/postcss-params.svg)](https://coveralls.io/github/joeframbach/postcss-params?branch=master)
[![Code Climate](https://img.shields.io/codeclimate/github/joeframbach/postcss-params.svg)](https://codeclimate.com/github/joeframbach/postcss-params)
[![dependencies Status](https://img.shields.io/david/joeframbach/postcss-params.svg)](https://david-dm.org/joeframbach/postcss-params)
[![devDependencies Status](https://img.shields.io/david/dev/joeframbach/postcss-params.svg)](https://david-dm.org/joeframbach/postcss-params?type=dev)

# PostCSS Params

`postcss-params` has two usage modes:

1. Target devices/clients based on a build configuration, much like media queries.
2. Pass strings from css to your PostCSS plugin, using a familiar syntax.

Some sites serve different assets to different clients.
For example, you may have some IE-specific css hacks that you only want to serve to IE browsers.
Or you want to load certain fonts for certain countries.
PostCSS is a good way to keep all your code in one file, then generate separate assets.

```scss
@my-plugin (browser: ie) {
  button {
    background-color: red;
  }
}
@my-plugin not (browser: ie) {
  button {
    background-color: green;
  }
}
```

`postcss-params` helps you write a plugin which reads the `(browser: ie)` parameter string, and keep or discard the block accordingly.

Build two assets, with configurations `{browser: ie}` and `{}`.
PostCSS will generate two assets. One you can serve to your locked-in
customers browsing from their lunch breaks at BigCorp. The other asset
you can serve to the rest of the civilized world.

---

## `buildComparator`

`buildComparator` accepts a param string and returns a function.
The resulting *comparator* function accepts a configuration object,
and returns `true` if the params match the configuration, and
`false` otherwise.

See the tests in `tests/buildComparator` for more examples.

CSS:
```scss
@my-plugin (region: cn) {
  body {
    font-family: ".PingFang-SC-Regular", sans-serif;
  }
}
@my-plugin not (region: cn) {
  body {
    font-family: "Helvetica Neue", Arial, sans-serif !default;
  }
}
```

Plugin:
```js
const { buildComparator } = require('postcss-params');
postcss.plugin('my-plugin', (configuration) => (root) => {
  root.walkAtRules('my-plugin', (atRule) => {
    const comparator = buildComparator(atRule.params);
    if (comparator(configuration)) {
      atRule.replaceWith(atRule.nodes);
    } else {
      atRule.remove();
    }
  });
});
```

Running PostCSS with various configuration objects will result in css assets
suitable for separate intended audiences. For example, you may serve a different font-family in China, but not want to load this asset for all countries.

`configuration` is provided to PostCSS through your build tool.

Example configuration:
```js
{
  debug:  true,
  region: "us",
  theme:  "blue"
}
```

---

## `buildAst`

`buildAst` gives you finer control and access to the params written in css.

Given this simple rule:
```scss
@my-plugin (theme: red) {
  body {
    background-color: theme-color;
  }
}
```

and this plugin:
```js
const { buildAst } = require('postcss-params');
postcss.plugin('my-plugin', (configuration) => (root) => {
  root.walkAtRules('my-plugin', (atRule) => {
    const ast = buildAst(atRule.params);
    console.log(ast);
  });
});
```

This AST is generated:
```js
{ feature: "theme", value: "red" }
```

---

Given this more complicated rule:
```scss
@my-plugin (debug),
           (region: cn) and (theme: red),
           (region: us) and (theme: blue),
           not (production) and (staging) {
  body {
    background-color: red;
  }
}
```

Plugin:
```js
const { buildAst } = require('postcss-params');
postcss.plugin('my-plugin', (configuration) => (root) => {
  root.walkAtRules('my-plugin', (atRule) => {
    const ast = buildAst(atRule.params);
    console.log(ast);
  });
});
```

This AST is generated:

    any
    ├─ { feature: debug, value: true }
    ├─ all
    │  ├─ { feature: region, value: cn }
    │  └─ { feature: theme, value: red }
    ├─ all
    │  ├─ { feature: region, value: us }
    │  └─ { feature: theme, value: blue }
    └─ all
       ├─ { feature: production, not: true }
       └─ { feature: staging, not: true }

Now your PostCSS plugin can make use of this AST to pull values into variables,
or decide to keep or discard the block.

Limitations:

* Feature names and values must NOT contain characters `(),:`
* Errors are fairly opaque (`'Expected L_PAREN'`)
* Feature values are optional, so comparators must expect String or Undefined
* Feature can only have one value. `(f: a), (f: b)` can't be `(f: a, b)`
  - As a hack, `(f: a|b)` is legal, and the comparator can split on `|`

---

## AST Object Reference

The resulting AST from `buildAst` is a tree structure. There are three possible
nodes in this tree:

- `any`: if any item resolves true, return true.
- `all`: if all items resolve true, return true.
- `feature`: compare the param value with the config value.
  - `not`: if feature returns true, return false. And vice-versa.

  Given this contrived rule:

```scss
@my-plugin (debug),
           (region: cn) and (theme: red),
           (region: us) and (theme: blue),
           not (production) and (staging) {
  body {
    background-color: red;
  }
}
```

This AST is generated:

    any
    ├─ { feature: debug, value: true }
    ├─ all
    │  ├─ { feature: region, value: cn }
    │  └─ { feature: theme, value: red }
    ├─ all
    │  ├─ { feature: region, value: us }
    │  └─ { feature: theme, value: blue }
    └─ all
       ├─ { feature: production, not: true }
       └─ { feature: staging, not: true }

See the tests in `tests/buildAst` for more examples.

---

## About the syntax

All PostCSS at-rules follow the structure `@plugin-name params { body }`.
Plugins are given the `params` as a string, with no provisions for
parsing, or even a standard format for clients to write params.

CSS already has an analogous structure for media queries:

- `@media media-query [, media-query]* { rule-list }`

where `media-query` can take either form:

- `[NOT|ONLY]? media-type [AND (media-feature[: value]?)]*`
- `(media-feature[: value]?) [AND (media-feature[: value]?)]*`

However, this has some limitations:

1. `media-type` is not meant for general-purpose use. It accepts specific values, e.g., `all`, `screen`, `print`. We are only interested in `media-feature` usage.
2. `NOT` must be used with `media-type`. (`NOT (media-feature)` is illegal).
3. `ONLY` was a hack for older browsers.

So we have defined a similar grammar which:

1. removes `media-type` entirely.
2. allows `NOT` to be juxtaposed with `media-feature`.
3. removes `ONLY`.


---

## ASTs are automatically flattened

`any` and `all` nodes with a single child are replaced
with that child node.

    any
    └─ all
       └─ { feature: debug, value: true }

is the same as

    { feature: debug, value: true }


---

## LL(1) Grammar Reference - Please do not LL(2+)

    CommaSeparatedList
     : MediaQuery [ COMMA MediaQuery ]*
    MediaQuery
     : [NOT]? Feature [ AND Feature ]*
    Feature
     : L_PAREN IDENT [ COLON IDENT ]? R_PAREN
