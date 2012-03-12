# jQuery Postpone (version 1.1.0 beta)

jQuery Postpone is an API extension for <code>jQuery.Deferred</code> that allows
you to use the deferred mechanism in combination with <code>setTimeout</code> and
<code>setInterval</code>.

## Introduction

Wether you want a prettier way of writing timeouts in javascript, or
advanced timing events; jQuery.postpone is something for you!
It adds three methods to jQuery (`jQuery.after`, `jQuery.every` and `jQuery.recur`)
which can be used to set a timeout with a deferred object handling its callbacks.

## Methods

### after(time[, argument[, ...]])

Returns a Deferred.promise() that automatically resolves after [time] using any other
arguments passed as arguments.

```javascript
$.after('2s', 'world').done(function(thing){
  console.log('Hello '+thing+'!');
});
```

### every(time[, argument[, ...]])

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

### recur(time[, argument[, ...]])

Does exactly the same as `$.every`, is slightly (very slightly) less precise when
it comes to timing but it ensures that scipt execution does not clog up (see
[issue #1](https://github.com/Avaq/jQuery-Postpone/issues/1)).

```javascript
$.recur(250, 'Avaq').progress(function(name){
  console.log(name+' has made progress.');
});
```

When the callbacks take up less time than the interval time given, this method goes
almost precisely in sync with `$.every`. When the callbacks take longer however,
the next timeout will be postponed to until the script has finished executing. Therefore
it does not clog up.

### clear()

This method clears the timeout and rejects the deferred.

```javascript
var timeout = $.after('1s');
timeout.clear();
//The timeout has been prevented from ever calling any done() callbacks and any fail() callbacks are called.
```

### complete()

This method clears the timeout and resolves the deferred.

```javascript
var interval = $.every(250);
interval.complete();
//The interval has stopped and any .done() callbacks will be fired.
```

## In depth

Here are some examples of what you can make with this, and the advantages
of using <code>jQuery.Deferred</code> in combination with timeouts.

### Use semantic time indication

Both <code>$.after()</code> and <code>$.every()</code> accept an integer as first argument, or a string
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

You can (continuously) add callbacks to one single timeout. And even when the timeout
has already well.. timed out, the callbacks will still well.. get called.

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

jQuery offers its own functions for this, we just enable the use of them by using Deferreds.

```javascript
var timeout1 = $.after('1s');
var timeout2 = $.after(20);
$.when(timeout1, timeout2).done(function(){
  console.log('Both timeouts have well.. timed out!');
});
```

### Add events to failures of the timeout

Using <code>jQuery.Deferred.fn.fail()</code> you can add callbacks to when a deferred object is rejected.
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

### Easy access

Use the <code>this</code> keyword to reference the timeout(/promise) object from inside a callback funtion.
This allows for the chaining of callbacks and triggers without ever having to put the object in a variable.

```javascript
var i = 0;
$.every(250).progress(function(){
  if(i>9){
    this.complete();
    return;
  }
  console.log('Progress was made.');
  i++;
})
.done(function(){
  console.log('Completed.');
});
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

#### 1.1

-   Added `$.recur` to resolve [issue #1](https://github.com/Avaq/jQuery-Postpone/issues/1).

#### [1.0](https://github.com/Avaq/jQuery-Postpone/tree/0bd898674c75ad64ef288401a68eceb7e9c6ec0e)

-   First stable release.

## Future plans

-   
-   Extend the list of Future plans with great ideas from me or the community.

## License

Copyright (c) 2012 Avaq, https://github.com/Avaq

jQuery Postpone is licensed under the MIT license. The license is included as LICENSE in this directory.