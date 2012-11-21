# jQuery Postpone (version 1.1.1)

jQuery Postpone is an API extension for `jQuery.Deferred` that allows
you to use the deferred mechanism in combination with `setTimeout` and
`setInterval`.

## Introduction

Wether you want a prettier way of writing timeouts in javascript, or advanced timing
events; jQuery.postpone is something for you! It adds three methods to jQuery
(`jQuery.after`, `jQuery.every` and `jQuery.recur`) which can be used to set a timeout
with a deferred object handling its callbacks.

## Download

-   [latest.zip](https://github.com/Avaq/jQuery-Postpone/zipball/master)
-   [latest-stable.zip](https://github.com/Avaq/jQuery-Postpone/zipball/v1.1.0) (recommended)
-   [all available downloads](https://github.com/Avaq/jQuery-Postpone/tags)

## jQuery methods

### jQuery.after(time[, argument[, ...]])

Returns a Deferred.promise() that automatically resolves after [time] using any other
arguments passed as arguments.

```javascript
$.after('2s', 'world').done(function(thing){
  console.log('Hello '+thing+'!');
});
```

### jQuery.every(time[, argument[, ...]])

Returns a Deferred.promise() that calls the progress callbacks every [time] using any
other arguments passed as arguments.

```javascript
$.every(250, 'Avaq').progress(function(name){
  console.log(name+' has made progress.');
});
```

This function uses `setInterval` internally. This means the precission of the timer is
spot-on because setInterval executes every [time] regardless of what's going on in the
thread (see [issue #1](https://github.com/Avaq/jQuery-Postpone/issues/1)).

If you want the safety of callbacks not overlapping in the thread (and thus clogging
script execution) use `$.recur` instead.

### jQuery.recur(time[, argument[, ...]])

Does exactly the same as `$.every`, but it ensures that scipt execution does not clog up
(see [issue #1](https://github.com/Avaq/jQuery-Postpone/issues/1)).

```javascript
$.recur(250, 'Avaq').progress(function(name){
  console.log(name+' has made progress.');
});
```

When the callbacks take up less time than the interval time given, this method goes
almost precisely in sync with `$.every`. When the callbacks take longer however,
the next timeout will be postponed to until the script has finished executing. Therefore
it does not clog up.

## Timeout object methods

### timeout.clear()

This method clears the timeout and rejects the deferred.

```javascript
var timeout = $.after('1s');
timeout.clear();
//The timeout stops and any .fail() callbacks will get called.
```

### timeout.complete()

This method clears the timeout and resolves the deferred.

```javascript
var interval = $.every(250);
interval.complete();
//The interval has stopped and any .done() callbacks will get called.
```

### timeout.times(n)

This method allows the every() or recur() to autoresolve itself after n progress callbacks.

```javascript
var interval = $.every(250).times(5);

interval.progress(function(){
  console.log(this.i);
});

interval.done(function(){
  console.log('And we\'re off!');
});

//This will log: "1, 2, 3, 4, 5, And we're off!", with 250 miliseconds in between every logged number.
```

## In depth

Here are some examples of what you can make with this, and the advantages
of using `jQuery.Deferred` in combination with timeouts.

### Use semantic time indication

Both `$.after()` and `$.every()` accept an integer as first argument, or a string
containing a time indication. The example below makes it pretty clear. If you want to know all the
supported units, you can have a look at the supported unit list at the bottom of this README.

```javascript
//100 miliseconds
$.after(100);

//2004 miliseconds
$.every('2 seconds and 4 miliseconds');

//1408 miliseconds
$.after('1 sec, 4 deciseconds and 8 ms');
```

### Add multiple callbacks

You can (continuously) add callbacks to one single timeout. And even when the timeout has
already well.. timed out, the callbacks will still well.. get called.

```javascript
var timeout = $.after('1s');

timeout.done(function(){
  console.log('Timed out!');
});

//Fire the following event on dom-ready, or after one second.
$(function(){
  timeout.done(function(){
    console.log('The DOM is ready, and one second has passed since the script started running.');
  });
});
```

### Combine multiple timeouts

jQuery offers its own functions for this, we just enable the use of them by using
Deferreds.

```javascript
var timeout1 = $.after('1s');
var timeout2 = $.after(20);
$.when(timeout1, timeout2).done(function(){
  console.log('Both timeouts have well.. timed out!');
});
```

### Add events to failures of the timeout

Using `jQuery.Deferred.fn.fail()` you can add callbacks to when a deferred object is rejected.
Postpone rejects a deferred when the timeout is canceled or it could not start.

Clearing a timeout:

```javascript
var timeout = $.after('1s').fail(function(error){
  console.log(error);
});
timeout.clear();
//The console will log: "The timeout has been cleared." or something in that fashion.
```

Providing invalid arguments:

```javascript
var timeout = $.after('Avaq').fail(function(error){
  console.log(error);
});
//The console will log: "Could not recognise 'Avaq' as valid indication of time." or something in that fashion.
```

## Supported time units

```
miliseconds (ms) (default)
centiseconds (cs)
deciseconds (ds)
seconds (sec) (s)
decaseconds (das)
hectaseconds (hs)
kiloseconds (ks)
minutes (min) (m)
hours (h)
days (d)
```

## Tested in

```
Internet Explorer 9
Chrome
Firefox
```

## Changelog

##### [1.1.1]

-   Added the `timeout.times()`-method.

#### [1.1](https://github.com/Avaq/jQuery-Postpone/tree/8e97b376a859f0580aa9566394c6fa35e9592ad7)

-   Added `$.recur` to resolve [issue #1](https://github.com/Avaq/jQuery-Postpone/issues/1).
-   Fixed [issue #2](https://github.com/Avaq/jQuery-Postpone/issues/2).

#### [1.0](https://github.com/Avaq/jQuery-Postpone/tree/0bd898674c75ad64ef288401a68eceb7e9c6ec0e)

-   First stable release.

## Future plans

-   Implement a `timeout.trigger()`-method that will progress an `every` or `recur`.
-   Implement a `timeout.reset()`-method that will restart the timeout.
-   Implement a `timeout.postpone()`-method that will increase the time it takes before the timeout completes.
-   Implement a `timeout.advance()`-method that will decrease the time it takes before the timeout completes.
-   Implement a `timeout.pause()`-method that will prevent the timeout from completing.
-   Implement a `timeout.stop()`-method that sets the timeout back to its original delay and pauses it.
-   Implement a `timeout.play()`-method that will unpause a timeout, allowing it to complete. Possible aliases: unpause, fire or go.
-   Extend the list of Future plans with great ideas from me or the community.

## License

Copyright (c) 2012 Avaq, https://github.com/Avaq

jQuery Postpone is licensed under the MIT license. The license is included as LICENSE in
this directory.
