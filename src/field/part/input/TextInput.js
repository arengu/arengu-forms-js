const CharCounter = require('./CharCounter');

const inputRules = require('./input-rules');

const BaseInput = require('./BaseInput');

class TextInput extends BaseInput {

  constructor (model) {
    super(model);

    this.model = model;

    this.node = null;
    this.html = null;
  }

  /*
   * Private methods
   */

  _buildCharCounter (input) {
    const { config: { maxLength, defaultValue } } = this.model;
    const node = CharCounter.create(maxLength, defaultValue);

    input.onkeyup = function () {
      node.setValue(input);
    }

    return node.render();
  }
  
  _buildInput () {
    const { id, uid, type, placeholder, config: { defaultValue, multiline } } = this.model;

    const node = document.createElement(multiline ? 'textarea' : 'input');
    node.setAttribute('id', uid);
    node.setAttribute('name', id);
    
    if (!multiline) {
      node.setAttribute('type', type);
    }

    if (placeholder) {
      node.setAttribute('placeholder', placeholder);
    }

    if (multiline && defaultValue) {
      node.innerText = defaultValue;
    }

    inputRules.parseDef(this.model)
      .filter((a) => !multiline || a.name != 'value')
      .forEach((a) => {
        node.setAttribute(a.name, a.value);
      });

    return node;
  }

  /*
   * View actions
   */
  build () {
    const { config: { maxLength } } = this.model;

    const container = document.createElement('div');
    container.classList.add('af-field-wrapper');

    const node = this._buildInput();
    container.appendChild(node);

    if (maxLength) {
      const counter = this._buildCharCounter(node);
      container.appendChild(counter);
    }

    this.node = node;
    this.html = container;
  }

  get value () {
    return this.node.value;
  }

  static create () {
    return new TextInput(...arguments);
  }

}

module.exports = TextInput;