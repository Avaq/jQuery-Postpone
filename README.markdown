# jQuery Postpone (version 1.0.0)

jQuery Postpone is an API extension for <code>jQuery.Deferred</code> that allows
you to use the deferred mechanism in combination with <code>setTimeout</code> and
<code>setInterval</code>.

## Introduction

Wether you want a prettier way of writing timeouts in javascript, or
advanced timing events; jQuery.postpone is something for you!
It adds two methods to jQuery (<code>jQuery.after</code> and <code>jQuery.every</code>)
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

### clear()

This method clears timeouts before they complete, or intervals while they are still running.

```javascript
var timeout = $.after('1s');
timeout.clear();
//Nothing happens after one second.
```

### complete()

This method flags an interval as "complete". Stopping it from repeating and resolving the deferred.

```
var interval = $.every(250);
interval.complete();
//The interval has stopped and any .done() callbacks will be fired.
```

## In depth

I will show you in some steps what you can make with this, and what the advantages
of using <code>jQuery.Deferred</code> in combination with timeouts are.

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

## Future plans

-   Add a larger variety of mutipliers so arguments like <code>"10 minutes"</code> will
be accepted.