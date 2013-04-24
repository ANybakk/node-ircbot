var namespace = "ircbot";

module.exports.command = function(str) {
  return namespace + ".command." + str;
};

module.exports.event = function(str) {
  return namespace + ".event." + str;
};

module.exports.util = require("./util.js");
module.exports.Bot  = require("./Bot.js");