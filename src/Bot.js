var pkg     = module.parent;
var irc     = require('../lib/irc/lib/irc.js');

var command = pkg.exports.command;
var event   = pkg.exports.event;
var util    = pkg.exports.util;



/**
 * This Bot type extends node-irc's (forked) Client type.
 * You may pass any of Client's options. Additionally, "actions" can be overridden.
 * For each channel the bot has visited, a "data" object is added to the corresponding entry in the "chans" property.
 * The bot supports multiple commands in the same IRC message.
 */
module.exports = function() {
  
  var opt = {
    
    actions: {
      "DO"    : '!',
      "HELP"  : '?'
    }
    
  };
  
  if (typeof arguments[0] == 'object') {
    //Merge with defaults
    var key;
    for(key in arguments[0]) {
      opt[key] = arguments[0][key];
    }
  }
  
  irc.Client.call(this, opt);
  
  this._matcher = null;
  this._updateMatcher();
  
  this.addListener("error", this._onError.bind(this))
  
};

module.exports.prototype = new irc.Client();
module.exports.prototype.constructor = module.exports;



/**
 * Connects to IRC server. Normally, actions like joning channels should be bound to the "ircbot.ready" event.
 */
module.exports.prototype.connect = function () {
  
  irc.Client.prototype.connect.call(this, this._onIrcConnect.bind(this));
  
  return this;
  
};



/**
 * Builds an array of the currently bound commands.
 */
module.exports.prototype.getCommands = function () {
  
  var bindings  = this._events;
  var binding   ;
  var commands  = [];
  
  for(binding in bindings) {
  
    if(binding.match(new RegExp(cmd("")))) {
    
      commands.push(binding);
      
    }
    
  }
  
  return commands;
  
};



/**
 * Retrieves the data stored for a particular channel, or null if none.
 */
module.exports.prototype.getData = function (channel) {
  
  if(this.chans[channel] && this.chans[channel].hasOwnProperty("data")) {
    return this.chans[channel].data;
  } else {
    return null;
  }
  
};



/**
 *
 */
module.exports.prototype._onError = function(message) {

  console.log('An error occurred: ', message);
  
};



/**
 * IRC Connect handler
 */
module.exports.prototype._onIrcConnect = function(){

  this
    .on("irc.message",    this._onIrcMessage.bind(this))
    .on("irc.join",       this._onIrcJoin.bind(this))
    .on(command("!help"), this._onCmdDoHelp.bind(this))
    .on(command("?help"), this._onCmdHelpHelp.bind(this))
    .emit(event("ready"))
  ;

};



/**
 *
 */
module.exports.prototype._onIrcMessage = function (from, to, message) {

  var match;
  
  while((match = this._matcher.exec(message)) !== null) {
  
    var cmd = match[1].toLowerCase();
    var args = match[2].trim().split(/\s+/);
    this.emit(command(cmd), args, from, to);
    
  }
  
};



/**
 * Handles "join" events. If it was the bot that joined a channel, create data object and emit "joined" event.
 */
module.exports.prototype._onIrcJoin = function(channel, nick, message) {

  if(nick == this.nick) {
  
    if(!this.chans[channel].data) {
      this.chans[channel].data = { joinCount:1 };
    } else {
      this.chans[channel].data.joinCount++;
    }
    
    this.emit(event("joined"), channel);
    
  }
  
};



/**
 *
 */
module.exports.prototype._onCmdDoHelp = function(args, from, to) {

  var bold          = util.wrapBold;
  var commands      = this.getCommands();
  var command       ;
  var action        ;
  var listActions   = "";
  var listCommands  = "";
  var i             = 0;

  for(action in this.opt.actions) {
  
    if(i!==0) {
      listActions += ", ";
    }
    listActions += bold(this.opt.actions[action]) + ' (' + action + ')';
    i++;
    
  }
  
  i=0;
  
  for(command in commands) {
  
    if(i!==0) {
      listCommands += ", ";
    }
    listCommands += bold(command);
    i++;
    
  }
  
  this.notice(from, "Prefixes: " + listActions.toLowerCase() + " Commands: " + listCommands.toLowerCase());
  
};



/**
 *
 */
module.exports.prototype._onCmdHelpHelp = function(args, from, to) {

  this.notice(from, 'This is a generic help function. Call it by writing "!help"');
  
};



/**
 * Updates the matcher object
 */
module.exports.prototype._updateMatcher = function () {

  var key       ;
  var prefixes  = "";
  
  for(key in this.opt.actions) {
    prefixes += this.opt.actions[key];
  }
  
  this._matcher = new RegExp("([" + prefixes + "]\\S+)\\s*([^" + prefixes + "]*)", "ig");
  
};