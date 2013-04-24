module.exports.IRC_FORMAT = {
  BOLD      : '\u0002',
  UNDERLINE : '\u001F',
  ITALIC    : '\u0016',
  NORMAL    : '\u000F'
};

module.exports.wrapBold = function(str) {
  return module.exports.IRC_FORMAT.BOLD + str + module.exports.IRC_FORMAT.NORMAL;
};