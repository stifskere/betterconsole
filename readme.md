# BetterConsole

![](https://cdn.memw.es/betterConsoleExample.png)

This is a simple package that adds useful info to your console logs

## installation

Using npm
```shell
npm install @memw/betterconsole
```
## Usage

You need to import the module and run it as a function

```js
require('@memw/betterconsole')(); // for cjs
(await import('@memw/betterconsole')).load(); // for es22
```


Then you can just use the normal console methods

```js
console.log("hello");
console.trace("hello");
console.debug("hello");
console.info("hello");
console.warn("hello");
console.error(true, "hello"); //first bool defines if it's gonna show stack trace (optional) true by default
```

If you want some custom log there is an alternative you might like
```js
console.customLog({color: "cyan", text: "whatever"}, "your log");
```


The configuration is entirely optional, if you don't put text it will simply not show, and if you don't set a color it will simply be white.

There is also an alternative method if you don't want to use the package function for that exact log
```js
console.normalLog("hello");
```

