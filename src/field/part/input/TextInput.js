const inputRules = require('./input-rules');

const BaseInput = require('./BaseInput');

class TextInput extends BaseInput {

  /*
   * Private methods
   */
  _buildInput (model) {
    const { id, type, placeholder } = model;

    const node = document.createElement('input');

    node.setAttribute('id', id);
    node.setAttribute('name', id);
    node.setAttribute('type', type);
    node.setAttribute('placeholder', placeholder);

    inputRules.parseDef(model)
      .forEach((a) => node.setAttribute(a.name, a.value));

    return node;
  }

  /*
   * View actions
   */
  build () {
    this.html = this._buildInput(this.model);
  }

  get value () {
    return this.html.value;
  }

  static create () {
    return new TextInput(...arguments);
  }

}

module.exports = TextInput;
