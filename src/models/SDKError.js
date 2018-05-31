function SDKError (message) {
  Error.call(this, message);
  this.message = message;
};

SDKError.prototype = Object.create(Error.prototype);

SDKError.matches = function matchesModel (obj) {
  return obj && obj.model === SDKError.name;
}

module.exports = SDKError;
