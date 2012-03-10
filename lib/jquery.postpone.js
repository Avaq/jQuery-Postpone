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
    
    timeRegex = /^([0-9]+)\s*(.*)?$/,
    timeSplitRegex = /(?:\s+and\s+|\s*,\s*)/,
    
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
    
    timeParse = function(value){
      
      var values, output = 0;
      
      if(value == undefined || value == null){
        return false;
      }
      
      if(!isNaN(value)){
        return parseInt(value, 10);
      }
      
      values = $.trim(value.toString()).split(timeSplitRegex);
      
      if(!values || values.length == 0){
        return false;
      }
      
      for(var i = 0; i < values.length; i++){
      
        var result, num, multiplier, add = 0;
        
        result = timeRegex.exec(values[i]) || [];
        
        if(result[2]){
          num = parseInt(result[1], 10);
          multiplier = abbreviations[result[2]] || 1;
          add = (num * multiplier);
        }
        
        else if(result[1]){
          add = parseInt(value, 10);
        }
        
        else{
          return false;
        }
        
        output += add;
      
      }
      
      return output;
      
    },
    
    postpone = function(args, interval){
      
      var D = $.Deferred();
      var P = D.promise();
      var args = $.makeArray(args);
      var time = args.shift();
      var ms = timeParse(time);
      var timeout;
      var func = (interval ? setInterval : setTimeout);
      
      if(typeof ms != "number" || isNaN(ms)) D.reject("'"+time+"' could not be recognised as a valid indication of time.");
      
      timeout = func(function(){
        D[(interval ? 'notifyWith' : 'resolveWith')](P, args);
      }, ms);
      
      $.extend(P, {
        clear: function(){
          clearTimeout(timeout);
          D.reject("The timeout was cleared.");
          return this;
        },
        complete: function(){
          clearTimeout(timeout);
          D.resolveWith(P, args);
          return this;
        }
      });
      
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