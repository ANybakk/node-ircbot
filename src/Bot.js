var irc     = require('../lib/irc/lib/irc.js');
var util    = require('./util.js');



/**
 * This Bot type extends node-irc's Client type.
 * You may pass any of Client's options. Additionally, these options are available for this type: "actions", "dommands".
 */
module.exports = function() {

  var self = this;
  
  var opt = {
    
    actions: {
      "DO"    : '!',
      "HELP"  : '?'
    },
    
    commands : {
      "HELP"  : "Basic help command"
    }
    
  };
  
  if (typeof arguments[0] == 'object') {
    //Merge with defaults
    var key;
    for(key in arguments[0]) {
      opt[key] = arguments[0][key];
    }
  }
  
  irc.Client.call(self, opt);
  
  self.matcher = null;
  self._updateMatcher();
  
};

module.exports.prototype = new irc.Client();
module.exports.prototype.contructor = module.exports;



/**
 * Adds additional actions.
 */
module.exports.prototype.connect = function () {

  var callback = arguments[0], self = this;
  
  irc.Client.prototype.connect.call(this, function(){
  
    self.addListener("message", function (from, to, message) { //to = this bot or a channel

      var match = self.matcher.exec(message);
      if(match !== null) {
      
        var action = match[1];
        var cmd = match[2].toUpperCase();
        var args = message.split(/s+/g).splice(1); //TODO: test
        self.emit(cmd, action, args, from);
        
      }

    });
    
    self.addListener('error', function(message) {
      console.log('An error occurred: ', message);
    });

    self.addListener("HELP", function(act, args, from) {

      switch(act) {
      
        case self.opt.actions.DO:

          var bold = util.bold, action, listActions="", command, listCommands="", i=0;
        
          for(action in self.opt.actions) {
            if(i!==0) {
              listActions += ", ";
            }
            listActions += bold(self.opt.actions[action]) + ' (' + action + ')';
            i++;
          }
          
          i=0;
          
          for(command in self.opt.commands) {
            if(i!==0) {
              listCommands += ", ";
            }
            listCommands += bold(command);
            i++;
          }
          
          self.notice(from, "Prefixes: " + listActions.toLowerCase() + " Commands: " + listCommands.toLowerCase());
          
          break;
          
        case self.opt.actions.HELP:
        
          self.notice(from, 'This is a generic help function. Call it by writing "!help"');
          
          break;
      }
        
    });
  
    if(typeof callback === "function") {
      callback();
    }
  
  });
  
  return self;
  
};



/**
 * Adds additional actions.
 */
module.exports.prototype.addActions = function (actions) {

  var action;

  for (action in actions) {
    this.opt.actions[action] = actions[action];
  }
  
  this._updateMatcher();
  
  return this;
  
};



/**
 * Adds additional commands.
 */
module.exports.prototype.addCommands = function (commands) {

  var command;

  for (command in commands) {
    this.opt.commands[command] = commands[command];
  }
  
  this._updateMatcher();
  
  return this;
  
};



/**
 * Updates the matcher object
 */
module.exports.prototype._updateMatcher = function () {

  var pattern="", key, i=0;
  
  pattern = '([';
  
  for(key in this.opt.actions) {
    pattern += this.opt.actions[key];
  }
  
  pattern += '])(';
  
  for(key in this.opt.commands) {
    if(i !== 0) {
      pattern += '|';
    }
    pattern += key;
    i++;
  }
  
  pattern += ')';
  
  this.matcher = new RegExp(pattern, "i");

};