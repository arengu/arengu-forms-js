module.exports = {

  parseDef: function parseFieldDef (fieldModel) {
    const { config } = fieldModel;

    const attributes = [];

    switch (fieldModel.type) {
      case 'EMAIL':
        attributes.push({name: 'autocomplete', value: 'email'});
        break;
      case 'TEL':
        attributes.push({name: 'autocomplete', value: 'tel-national'});
        break;
    }

    if (fieldModel.required) {
      attributes.push({name: 'required', value: 'true'});
    }
    if (config.defaultValue) {
      attributes.push({name: 'value', value: config.defaultValue});
    }
    if (config.minLength) {
      attributes.push({name: 'minlength', value: config.minLength});
    }
    if (config.maxLength) {
      attributes.push({name: 'maxlength', value: config.maxLength});
    }
    if (config.minValue) {
      attributes.push({name: 'min', value: config.minValue});
    }
    if (config.maxValue) {
      attributes.push({name: 'max', value: config.maxValue});
    }

    return attributes;
  }

};
