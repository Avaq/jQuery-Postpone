/**
 * @fileOverview jQuery Postpone
 * Copyright (c) 2012 Aldwin "Avaq" Vlasblom, https://github.com/Avaq
 * Licensed under the MIT license (/LICENSE)
 *
 * @author Aldwin "Avaq" Vlasblom <aldwin.vlasblom@gmail.com>, https://github.com/Avaq
 * @version 1.0
 * @homepage https://github.com/Avaq/jQuery-Postpone
 */
 
;(function($){

  var
    
    //The regular expression used to substract the number and the unit from a time string.
    timeRegex = /^([0-9]+)\s*(.*)?$/,
    
    //The regular expression used to split a string containing multiple time strings.
    timeSplitRegex = /(?:\s+and\s+|\s*,\s*)/,
    
    //A map of the multipliers used to multiply a value when suffixed with certain time-unit-abbreviations.
    multipliers = {
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
      
      milisecond: multipliers.ms,
      miliseconds: multipliers.ms,
      ms: multipliers.ms,
      
      centisecond: multipliers.cs,
      centiseconds: multipliers.cs,
      cs: multipliers.cs,
      
      decisecond: multipliers.ds,
      deciseconds: multipliers.ds,
      ds: multipliers.ds,
      
      second: multipliers.s,
      seconds: multipliers.s,
      sec: multipliers.s,
      secs: multipliers.s,
      s: multipliers.s,
      
      decasecond: multipliers.das,
      decaseconds: multipliers.das,
      das: multipliers.das,
      
      hectasecond: multipliers.hs,
      hectaseconds: multipliers.hs,
      hs: multipliers.hs,
      
      kilosecond: multipliers.ks,
      kiloseconds: multipliers.ks,
      kiloseconds: multipliers.ks,
      
      minute: multipliers.m,
      minutes: multipliers.m,
      min: multipliers.m,
      mins: multipliers.m,
      m: multipliers.m,
      
      hour: multipliers.h,
      hours: multipliers.h,
      h: multipliers.h,
      
      day: multipliers.d,
      days: multipliers.d,
      d: multipliers.d
      
    },
    
    //The function that parses an input and returns the associated amount of miliseconds.
    timeParse = function(value){
      
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
      
    },
    
    //The function used for both every (setInterval) and after (setTimeout).
    postpone = function(args, interval){
      
      //Create a new Deferred.
      var D = $.Deferred();
      
      //Reference the deferred's promise.
      var P = D.promise();
      
      //Turn args into a real array, so we can .shift()
      var args = $.makeArray(args);
      
      //The first argument is the time.
      var time = args.shift();
      
      //Parse the time to miliseconds
      var ms = timeParse(time);
      
      //Create an empty timeout
      var timeout;
      
      //Define the function we are using
      var func = (interval ? setInterval : setTimeout);
      
      //The parsing failed. Reject the timeout.
      if(typeof ms != "number" || isNaN(ms)) D.reject("'"+time+"' could not be recognised as a valid indication of time.");
      
      //Set the timeout.
      timeout = func(function(){
        //Use "notify" when we are using an interval, and "resolve" when we are using a timeout.
        D[(interval ? 'notifyWith' : 'resolveWith')](P, args);
      }, ms);
      
      //Extend the promise object
      $.extend(P, {
        
        //Clear the timeout and reject the Deferred.
        clear: function(){
          clearTimeout(timeout);
          D.reject("The timeout was cleared.");
          return this;
        },
        
        //Clear the timeout and resolve the Deferred.
        complete: function(){
          clearTimeout(timeout);
          D.resolveWith(P, args);
          return this;
        }
        
      });
      
      //Return the extended promise interface.
      return P;
      
    };
    
  $.extend({
    
    //return a Deferred.promise() that automatically resolves after [time] time using any other arguments passed as arguments.
    after: function(){
      return postpone(arguments);
    },
    
    //return a Deferred.promise() that calls the progress callbacks every [time] using any other arguments passed as arguments.
    every: function(time){
      return postpone(arguments, true);
    }
    
  });

})(jQuery);