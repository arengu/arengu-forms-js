const BaseModel = require('./BaseModel');

const MODEL_NAME = 'Field';

class FieldModel extends BaseModel {

  constructor (data) {
    super(data);
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.required = data.required;
    this.config = data.config;
  }

  static create () {
    return new FieldModel(...arguments);
  }

}

module.exports = FieldModel;
