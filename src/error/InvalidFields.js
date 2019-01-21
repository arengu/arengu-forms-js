const SDKError = require('./SDKError');
const ErrorCodes = require('./ErrorCodes');
const { DEFAULT_MESSAGES } = require('../lib/Messages');

const DEFAULT_MESSAGE = DEFAULT_MESSAGES.ERR_INVALID_INPUT;

const DEFAULT_CODE = ErrorCodes.ERR_INVALID_INPUT;

const FieldErrorCode = {
  // Common
  ERR_REQUIRED_PROPERTY: 'ERR_REQUIRED_PROPERTY',
  ERR_FIELD_REQUIRED: 'ERR_FIELD_REQUIRED',

  // Text && Email
  ERR_TOO_SHORT_STRING: 'ERR_TOO_SHORT_STRING',
  ERR_TOO_LONG_STRING: 'ERR_TOO_LONG_STRING',

  // Choice && Dropdown
  ERR_NO_OPTION_CHOSEN: 'ERR_NO_OPTION_CHOSEN',
  ERR_ZERO_OPTIONS_CHOSEN: 'ERR_ZERO_OPTIONS_CHOSEN',

  // Legal
  ERR_ACCEPTANCE_REQUIRED: 'ERR_ACCEPTANCE_REQUIRED',

  // Email
  ERR_EMAIL_EXPECTED: 'ERR_EMAIL_EXPECTED',

  // URL
  ERR_URL_EXPECTED: 'ERR_URL_EXPECTED',

  // Number
  ERR_INTEGER_EXPECTED: 'ERR_INTEGER_EXPECTED',

  // Boolean
  INVALID_BOOLEAN: 'ERR_BOOLEAN_EXPECTED',

  // Payment
  MISSING_CARD_INFO: 'ERR_MISSING_CARD_INFO',
  INVALID_CARD: 'ERR_INVALID_CARD',
};

class FieldError extends SDKError {

  constructor (code, message, details) {
    super(code, message);
    this.details = details;
  }

  static get CODE () {
    return FieldErrorCode;
  }

  static create (code, message, details) {
    return new FieldError(code, message, details);
  }

  static fromPropertyError (data) {
    return new FieldError(
      data.code,
      data.message,
      data.details,
    );
  }

}

class InvalidFields extends SDKError {

  constructor (fields) {
    super(DEFAULT_CODE, DEFAULT_MESSAGE);
    this.fields = fields;
  }

  static get FieldError () {
    return FieldError;
  }

  static get EXPECTED_ERROR () {
    return DEFAULT_CODE;
  }

  static fromFields (fields) {
    const self = InvalidFields;

    return new self(fields);
  }

  static fromSchemaError (schemaErr) {
    const self = InvalidFields;

    const invalidProps = schemaErr.details.invalidProperties;

    const invalidFields = {};

    invalidProps
      .forEach((propErr) => {
        const tokens = propErr.path.split('/');
        const errType = tokens[1];

        if (errType !== 'formData') {
          return;
        }

        const fieldId = tokens[2];

        invalidFields[fieldId] = FieldError.fromPropertyError(propErr);
      });

    return self.fromFields(invalidFields);
  }

}

module.exports = InvalidFields;
