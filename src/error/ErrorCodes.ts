/**
 * Codes that we can receive from backend
 */
export enum AppErrorCode {
  INVALID_INPUT = 'ERR_INVALID_INPUT',
  FORM_NOT_FOUND = 'ERR_FORM_NOT_FOUND',

  /*
   * Unexpected errors
   */
  SERVER_ERROR = 'ERR_SERVER_ERROR',

  /*
   * Code when provided input does not pass validation flow
   */
  STEP_VALIDATION_FAILED = 'ERR_STEP_VALIDATION_FAILED',

  /*
   * Errors due to dirty reads
   */
  VALIDATION_REQUIRED = 'ERR_VALIDATION_REQUIRED',
  MISSING_VALIDATION = 'ERR_MISSING_VALIDATION',
  NO_VALIDATION_REQUIRED = 'ERR_NO_VALIDATION_REQUIRED',
  SIGNATURE_REQUIRED = 'ERR_SIGNATURE_REQUIRED',
  FLOW_NOT_FOUND = 'ERR_FLOW_NOT_FOUND',
  STEP_NOT_FOUND = 'ERR_STEP_NOT_FOUND',

  /*
   * Errors due to request manipulation
   */
  SIGNATURE_MISMATCH = 'ERR_SIGNATURE_MISMATCH',
  WRONG_SIGNATURE = 'ERR_WRONG_SIGNATURE',

  /*
   * Errors due to very long submission
   */
  SIGNATURE_EXPIRED = 'ERR_SIGNATURE_EXPIRED',
}

/**
 * Codes generated exclusively by SDK
 */
export enum SDKErrorCode {
  /*
   * Invalid params on embed
   */
  MISSING_FORM_ID = 'ERR_MISSING_FORM_ID',
  INVALID_NODE = 'ERR_INVALID_NODE',
  MISSING_NODE = 'ERR_MISSING_NODE',
  UNDEFINED_KEY = 'ERR_UNDEFINED_KEY',

  /*
   * Resilience errors
   */
  UNEXPECTED_FIELD_TYPE = 'ERR_UNEXPECTED_FIELD_TYPE',
}

/**
 * Codes related to field errors shared by both backend and SDK
 */
export enum FieldErrorCode {
  /*
   * Common
   */
  REQUIRED_PROPERTY = 'ERR_REQUIRED_PROPERTY',

  /*
   * Value length
   */
  TOO_SHORT_STRING = 'ERR_TOO_SHORT_STRING',
  TOO_LONG_STRING = 'ERR_TOO_LONG_STRING',

  /*
   * Value range
   */
  TOO_SMALL_NUMBER = 'ERR_TOO_SMALL_NUMBER',
  TOO_BIG_NUMBER = 'ERR_TOO_BIG_NUMBER',

  /*
   * Options
   */
  NO_OPTION_CHOSEN = 'ERR_NO_OPTION_CHOSEN',
  ZERO_OPTIONS_CHOSEN = 'ERR_ZERO_OPTIONS_CHOSEN',

  /*
   * Legal
   */
  ACCEPTANCE_REQUIRED = 'ERR_ACCEPTANCE_REQUIRED',

  /*
   * Formats
   */
  EMAIL_EXPECTED = 'ERR_EMAIL_EXPECTED',
  URL_EXPECTED = 'ERR_URL_EXPECTED',
  DATE_EXPECTED = 'ERR_DATE_EXPECTED',
  TIME_EXPECTED = 'ERR_TIME_EXPECTED',
  BOOLEAN_EXPECTED = 'ERR_BOOLEAN_EXPECTED',
  NUMBER_EXPECTED = 'ERR_NUMBER_EXPECTED',
  INTEGER_EXPECTED = 'ERR_INTEGER_EXPECTED',
  DECIMAL_EXPECTED = 'ERR_DECIMAL_EXPECTED',
  CURRENCY_EXPECTED = 'ERR_CURRENCY_EXPECTED',

  /*
   * Payments
   */
  MISSING_CARD_INFO = 'ERR_MISSING_CARD_INFO',
  INVALID_CARD = 'ERR_INVALID_CARD',
  CHARGE_DECLINED = 'ERR_CHARGE_DECLINED', // sent by backend
  EXPIRED_CARD = 'ERR_EXPIRED_CARD', // sent by backend
  WRONG_SEC_CODE = 'ERR_WRONG_SEC_CODE', // sent by backend
  WRONG_FORM_CONFIG = 'ERR_WRONG_FORM_CONFIG', // sent by backend
}
