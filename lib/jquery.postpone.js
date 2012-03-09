;(function($){

  var
    
    timeRegex = /^([0-9]+)\s*(.*s)?$/,
    
    powers = {
      "ms": 1,
      "cs": 10,
      "ds": 100,
      "s": 1000,
      "das": 10000,
      "hs": 100000,
      "ks": 1000000
    },
    
    timeParse = function(value){
      
      var result, num, multiplier;
      
      if(value == undefined || value == null){
        return false;
      }
      
      if(!isNaN(value)){
        return parseInt(value, 10);
      }
      
      result = timeRegex.exec(jQuery.trim(value.toString())) || [];
      
      if(result[2]){
        num = parseInt(result[1], 10);
        multiplier = powers[result[2]] || 1;
        return (num * multiplier);
      }
      
      else if(result[1]) {
        return parseInt(value, 10);
      }
      
      else{
        return false;
      }
      
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
        },
        complete: function(){
          clearTimeout(timeout);
          D.resolveWith(P, args);
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