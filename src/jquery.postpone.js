/**
 * @fileOverview jQuery Postpone
 * Copyright (c) 2012 Aldwin "Avaq" Vlasblom, https://github.com/Avaq
 * Licensed under the MIT license (/LICENSE)
 *
 * @author Aldwin "Avaq" Vlasblom <aldwin.vlasblom@gmail.com>, https://github.com/Avaq
 * @version 1.2.2
 * @homepage https://github.com/Avaq/jQuery-Postpone
 */
 
;(function($){

  var
    
    //The regular expression used to subtract the number and the unit from a time string.
    timeRegex = /^([0-9]+)\s*(.*)?$/,
    
    //The regular expression used to split a string containing multiple time strings.
    timeSplitRegex = /(?:\s+and\s+|\s*,\s*)/,
    
    //A map of the multipliers used to multiply a value when suffixed with certain time-unit-abbreviations.
    m = {
      ms: 1,
      cs: 10,
      ds: 100,
      s: 1000,
      das: 10000,
      hs: 100000,
      ks: 1000000,
      m: 60000,
      h: 3600000,
      d: 86400000
    },
    
    //A map of all supported time-unit-abbreviations.
    abbreviations = {
      
      millisecond: m.ms,
      milliseconds: m.ms,
      ms: m.ms,
      
      centisecond: m.cs,
      centiseconds: m.cs,
      cs: m.cs,
      
      decisecond: m.ds,
      deciseconds: m.ds,
      ds: m.ds,
      
      second: m.s,
      seconds: m.s,
      sec: m.s,
      secs: m.s,
      s: m.s,
      
      decasecond: m.das,
      decaseconds: m.das,
      das: m.das,
      
      hectasecond: m.hs,
      hectaseconds: m.hs,
      hs: m.hs,
      
      kilosecond: m.ks,
      kiloseconds: m.ks,
      kiloseconds: m.ks,
      
      minute: m.m,
      minutes: m.m,
      min: m.m,
      mins: m.m,
      m: m.m,
      
      hour: m.h,
      hours: m.h,
      h: m.h,
      
      day: m.d,
      days: m.d,
      d: m.d
      
    },
  
    //A map of default options used by postpone().
    defaults = {
      type: 0
    }
  
  //The function that parses an input and returns the associated amount of milliseconds.
  function timeParse(value){
    
    var values, output = 0;
    
    if(value == undefined || value == null){
      return false;
    }
    
    //If the value is numeric, make sure it's an integer and return that.
    if(!isNaN(value)){
      return parseInt(value, 10);
    }
    
    //Split the input into time strings.
    values = $.trim(value.toString()).split(timeSplitRegex);
    
    //If that failed; the value must have been invalid.
    if(!values || values.length == 0){
      return false;
    }
    
    //For every time string.
    for(var i = 0; i < values.length; i++){
    
      var result, num, multiplier, add = 0;
      
      //Parse it.
      result = timeRegex.exec(values[i]) || [];
      
      //If we have a suffix; use the value and find the multiplier to get to a result.
      if(result[2]){
        num = parseInt(result[1], 10);
        multiplier = abbreviations[result[2]] || 1;
        add = (num * multiplier);
      }
      
      //Otherwise cast the value to integer and do not multiply.
      else if(result[1]){
        add = parseInt(value, 10);
      }
      
      //The parsing failed so the time string must have been invalid.
      else{
        return false;
      }
      
      //Add the converted timestring to the total time.
      output += add;
    
    }
      
    //Return the total time.
    return output;
    
  }
    
  //The function used for both every (setInterval) and after (setTimeout).
  function postpone(args, options){
    
    //Merge options with defaults
    options = $.extend({}, defaults, options);
    
    //Create a new Deferred.
    var D = $.Deferred()
    
    //Reference the deferred 's promise.
      , P = D.promise()
      
    //Turn args into a real array, so we can .shift()
      , args = $.makeArray(args)
    
    //The first argument is the time.
      , time = args.shift()
      
    //The time the timeout started running.
      , start = -1
      
    //The time left after a timeout has been paused.
      , paused = -1
    
    //Parse the time to milliseconds.
      , ms = timeParse(time)
    
    //Create an empty timeout.
      , timeout
    
    //Define the setter we are using.
      , set = function(callback, time){
        isset = true;
        start = Date.now();
        timeout = (options.type == 1 ? setInterval : setTimeout)(callback, time);
      }
    
    //Define the unsetter we are using.
      , unset = function(){
        isset = false;
        (options.type == 1 ? clearInterval : clearTimeout)(timeout);
        timeout = null;
      }
    
    //A helper function that only sets the timeout if it isn't paused.  
      , setIfNotPaused = function(ms){
        if(paused >= 0){
          paused = ms;
        }else{
          set(callback, ms);
        }
      }
    
    //Used internally by timeout.postpone and timeout.advance.
      , addOrSubtractTime = function(subtract, time){
    
        //Unset the timeout.
        unset();
        
        //Parse the time.
        var change = timeParse(time);
        
        //Check if the parsing succeeded.
        if(typeof ms != "number" || isNaN(ms)){
          D.rejectWith(P, ["Could not recognize '"+time+"' as a valid indication of time."]);
          return this;
        }
        
        //Calculate the total time.
        var total = (this.timeRemaining() + (subtract ? -change : +change));
        
        //Check if we need a custom callback for setInterval.
        if(options.type == 1){
          
          //Remember the old callback.
          var oldCallback = callback;
          
          //Temporarily set the type to this use case.
          options.type = 3;
          
          //Set a custom callback.
          callback = function(){
        
            //Increment.
            P.i++;
            
            //Set the start time stamp.
            start = Date.now();
            
            //Progress.
            D.notifyWith(P, args);
            
            //Set the callback and type back to original.
            callback = oldCallback;
            options.type = 1;
            
            //Auto-resolve?
            if(P.i == autoresolve){
              return D.resolveWith(P, args);
            }
            
            //Set the interval.
            else{
              set(callback, ms);
            }
            
          }
          
        }
        
        //Set the timeout.
        setIfNotPaused(total >= 0 ? total : 0);
        
        //Enable chaining.
        return this;
        
      }
    
    //Define the boolean that will keep track of whether the timeout is set.
      , isset = false
    
    //Define some variables that we may make use of in the callbacks.
      , autoresolve=-1
    
    //Define the callback.
      , callback = (function(){switch(options.type){
      
      //SetTimeout.
      case 0: return function(){
        D.resolveWith(P, args);
      };
      
      //SetInterval.
      case 1: return function(){
        
        P.i++;
        
        //Set the start time stamp.
        start = Date.now();
        
        //Progress.
        D.notifyWith(P, args);
        
        //Auto-resolve?
        if(P.i == autoresolve){
          unset();
          return D.resolveWith(P, args);
        }
        
      };
      
      //Recursive setTimeout.
      case 2: return function(){
      
        var end;
        
        P.i++;
        
        //Set the start time stamp.
        start = Date.now();
        
        //Notify the Deferred.
        D.notifyWith(P, args);
        
        //Set the end time stamp.
        end = Date.now();
        
        //Auto-resolve?
        if(P.i == autoresolve){
          return D.resolveWith(P, args);
        }
        
        //Recur.
        else if(isset){
          set(callback, (ms - Math.abs(end - start)));
        }
        
      };
      
    }})();
    
    //The parsing of time failed. Reject the timeout.
    if(typeof ms != "number" || isNaN(ms)){
      D.rejectWith(P, ["Could not recognise '"+time+"' as a valid indication of time."]);
    }
    
    //Set the timeout.
    else{
      set(callback, ms);
    } 
    
    //Extend the promise object.
    $.extend(P, {
      
      //The amount of times that the interval has executed.
      i: 0,
      
      //Clear the timeout and reject the Deferred.
      clear: function(){
        unset();
        D.rejectWith(P, ["The timeout was cleared."]);
        return this;
      },
      
      //Clear the timeout and resolve the Deferred.
      complete: function(){
        unset();
        D.resolveWith(P, args);
        return this;
      },
      
      //Auto complete the "every" or "recur" after n progress calls. This method resets the "i".
      times: function(n){
        P.i=0;
        autoresolve = parseInt(n, 10);
        return this;
      },
      
      //Trigger the next callback in the timeout.
      trigger: function(){
        unset();
        callback.apply(P, args);
        setIfNotPaused(ms);
        return this;
      },
      
      //Resets the timeout to its initial wait value.
      reset: function(){
        unset();
        setIfNotPaused(ms);
        return this;
      },
      
      //Add time before the timeout expires.
      postpone: function(time){
        return addOrSubtractTime.call(this, false, time);
      },
      
      //Take away time before the timeout expires.
      advance: function(time){
        return addOrSubtractTime.call(this, true, time);
      },
      
      //Pause the timeout, preventing further expiration.
      pause: function(){
        unset();
        paused = this.timeRemaining();
        return this;
      },
      
      //Restart the timeout after it has been paused or stopped.
      play: function(){
        if(paused < 0){
          return this;
        }
        set(callback, paused);
        paused = -1;
        return this;
      },
      
      //Pauses the timeout at full time remaining.
      stop: function(){
        unset();
        paused = ms;
        return this;
      },
      
      //Returns the time remaining before the next expiry of the timeout.
      timeRemaining: function(){
        return (paused >= 0 ? paused : (ms - (Date.now() - start)));
      },
      
      isPaused: function(){
        return paused >= 0;
      }
      
    });
    
    //Return the extended promise interface.
    return P;
    
  }
  
  //Extend jQuery.
  $.extend({
    
    //Return a Deferred.promise() that automatically resolves after [time] time using any other arguments passed as arguments.
    after: function(){
      return postpone(arguments, {
        type: 0 //setTimeout
      });
    },
    
    //Return a Deferred.promise() that calls the progress callbacks every [time] using any other arguments passed as arguments.
    every: function(time){
      return postpone(arguments, {
        type: 1 //setInterval
      });
    },
    
    //Return a Deferred.promise() that calls the progress callbacks every [time] using any other arguments passed as arguments.
    recur: function(){
      return postpone(arguments, {
        type: 2 //recursive setTimeout
      });
    }
    
  });

})(jQuery);
