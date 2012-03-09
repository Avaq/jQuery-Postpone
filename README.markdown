# jQuery Postpone (version 1.0.0)

jQuery Postpone is an API extension for <code>jQuery.Deferred</code> that allows
you to use the deferred mechanism in combination with <code>setTimeout</code> and <code>setInterval</code>.

## Introduction

Wether you want a prettier way of wrting timeouts in javascript, or
advanced timing events; jQuery.postpone is something for you!
It adds two methods to jQuery (<code>jQuery.after</code> and <code>jQuery.every</code>)
which can be used to set a timeout with a deferred object handling its callbacks.

## Methods

### after(time[, argument[, ...]])

Returns a Deferred.promise() that automatically resolves after [time] using any other arguments passed as arguments.

```javascript
$.after('2s', 'world').done(function(thing){
  console.log('Hello '+thing+'!');
});
```

### every(time[, argument[, ...]])

Returns a Deferred.promise() that calls the progress callbacks every [time] using any other arguments passed as arguments.

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

## Future plans

-   Add a larger variety of mutipliers so arguments like <code>"10 minutes"</code> will be accepted.