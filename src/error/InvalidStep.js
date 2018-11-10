const SDKError = require('./SDKError');

class InvalidStep extends SDKError {

  static create () {
    return new InvalidStep(...arguments);
  }

  static fromResponse (body) {
    return InvalidStep.create(body.code, body.message);
  }

}

module.exports = InvalidStep;
