import find from 'lodash/find';
import includes from 'lodash/includes';
import isNil from 'lodash/isNil';

import { UID } from '../../../../lib/UID';

const KEY_CODE = {
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  ESCAPE: 27,
  ENTER: 13,
  BACKSPACE: 8,
  DELETE: 46,

};

const CLASSES = {
  HOVER: 'af-hover',
  FILTERED: 'af-filtered',
  ACTIVE: 'af-active',
  DISPLAY: 'af-display',
};

const INDEX_ATTRIBUTE = 'data-af-dropdown-index';

const NO_RESULTS_FOUND = 'No results found';

/* eslint-disable */

class LegacyDropdown {
  constructor(model, listener) {
    this.model = model;
    this.listener = listener;

    this.multiple = model.config.multiple;
    this.hiddenDropdown = undefined;
    this.hiddenDropdownOptions = undefined;
    this.dropdown = undefined;
    this.dropdownOptions = undefined;
    this.search = undefined;
    this.dropdownText = undefined;
    this.html = undefined;
  }

  _buildHiddenDropdown() {
    const node = document.createElement('select');

    const { id } = this.model;

    node.setAttribute('name', id);
    node.setAttribute('id', UID.create());
    node.setAttribute('tabindex', '-1');

    if (this.multiple) {
      node.setAttribute('multiple', 'multiple');
    }

    if (this.model.required) {
      node.setAttribute('required', true);
    }

    return node;
  }

  _buildHiddenDropdownOptions() {
    const { options, defaultValue, multiple } = this.model.config;

    const node = options
      .map((o, i) => {
        const optionId = UID.create();

        const selected = defaultValue && (multiple
          ? includes(defaultValue, o.value) : defaultValue === o.value);

        return this._buildHiddenDropdownOption(optionId, o.label, o.value, selected);
      });

    if (!defaultValue && !multiple) {
      /*
       * Old browsers set the first option as selected for non multiple dropdowns
       * when no default value is provided, so we have to add an empty option and
       * set it as selected when the field does not have a default one.
       */
      node.push(this._buildHiddenDropdownOption(UID.create(), '', '', true));
    }

    return node;
  }

  _buildHiddenDropdownOption(optionId, label, value, selected) {
    const node = document.createElement('option');
    node.setAttribute('id', optionId);
    node.setAttribute('value', value);
    node.textContent = label;

    if (selected) {
      node.selected = true;
    }

    return node;
  }

  _buildSearch() {
    const node = document.createElement('input');
    node.classList.add('af-dropdown-search');
    node.setAttribute('type', 'search');
    node.setAttribute('autocomplete', 'off');

    this._addSearchListeners(node);

    return node;
  }

  _addSearchListeners(node) {
    const self = this;

    node.onfocus = function () {
      self._showDropdownOptions();
      const tagOptions = self.html.querySelectorAll('a');
      self.dropdownText.style.opacity = tagOptions.length > 0 ? '0' : '0.5';
    };

    node.onblur = function () {
      self._hideDropdownOptions();
      self._showDropdownText();
      node.value = '';
      self._filterDropdownOptions(node);
      const tagOptions = self.html.querySelectorAll('a');
      self.dropdownText.style.opacity = tagOptions.length > 0 ? '0' : '1';
    };

    node.onkeyup = function () {
      self._filterDropdownOptions(node);
    };

    node.onkeydown = function (e) {
      self._autoResize(node);
      self._hideDropdownText();

      switch (e.keyCode) {
        case KEY_CODE.DELETE:
        case KEY_CODE.BACKSPACE:
          return self._removeDropdownTag(e);
        case KEY_CODE.ESCAPE:
          return node.blur();
        case KEY_CODE.ENTER:
          return self._selectHoverDropdownOption(e);
        case KEY_CODE.DOWN_ARROW:
          return self._hoverNextDropdownOption(e);
        case KEY_CODE.UP_ARROW:
          return self._hoverPrevDropdownOption(e);
        case KEY_CODE.LEFT_ARROW:
          return self._hoverPrevDropdownTag(e);
        case KEY_CODE.RIGHT_ARROW:
          return self._hoverNextDropdownTag(e);
      }
    };
  }

  _hoverPrevDropdownTag(e) {
    let caretPosition = e.target.selectionStart;
    if (caretPosition === 0 || !caretPosition) {
      const activeOption = this.html.querySelector(`a.${CLASSES.ACTIVE}`);
      const selectedOptions = this.html.querySelectorAll('a');
      if (activeOption) {
        const prev = activeOption.previousElementSibling;
        if (prev.getAttribute(INDEX_ATTRIBUTE)) {
          activeOption.classList.remove(CLASSES.ACTIVE);
          activeOption.removeAttribute('tabindex');
          prev.classList.add(CLASSES.ACTIVE);
          prev.setAttribute('tabindex', '0');
          prev.focus();
          this._showDropdownOptions();
        }
      } else if (selectedOptions.length > 0) {
        const prev = selectedOptions[selectedOptions.length - 1];
        prev.classList.add(CLASSES.ACTIVE);
        prev.setAttribute('tabindex', '0');
        prev.focus();
        this._showDropdownOptions();
      }
    } else {
      caretPosition--;
    }
  }

  _hoverNextDropdownTag(e) {
    const caretPosition = e.target.selectionStart;
    const activeOption = this.html.querySelector(`a.${CLASSES.ACTIVE}`);
    if ((caretPosition === 0 || !caretPosition) && activeOption) {
      e.preventDefault();
      const next = activeOption.nextElementSibling;
      activeOption.classList.remove(CLASSES.ACTIVE);
      activeOption.removeAttribute('tabindex');
      if (next.getAttribute(INDEX_ATTRIBUTE)) {
        next.classList.add(CLASSES.ACTIVE);
        next.setAttribute('tabindex', '0');
        next.focus();
        this._showDropdownOptions();
      } else {
        this.search.focus();
      }
    }
  }

  _selectHoverDropdownOption(e) {
    e.preventDefault();
    const hover = this.dropdown.querySelector(`.${CLASSES.HOVER}`);

    if (hover) {
      const index = hover.getAttribute(INDEX_ATTRIBUTE);
      const label = hover.textContent;

      if (!this.multiple) {
        this._setDropdownText(label);
      }

      this._prevAvailableDropdownOption(hover);
      this._selectDropdownOption(index, label);
    }
  }

  _hoverNextDropdownOption(e) {
    e.preventDefault();
    const hover = this.dropdown.querySelector(`.${CLASSES.HOVER}`);

    if (hover) {
      this._nextAvailableDropdownOption(hover);
      this._scrollDropdownOptions();
    } else {
      const findNode = this.dropdownOptions.find(e => !includes(e.classList.value, CLASSES.FILTERED)
        && !includes(e.classList.value, CLASSES.ACTIVE));
      if (findNode) {
        findNode.classList.add(CLASSES.HOVER);
        this._scrollDropdownOptions();
      }
    }
  }

  _hoverPrevDropdownOption(e) {
    e.preventDefault();
    const hover = this.dropdown.querySelector(`.${CLASSES.HOVER}`);

    if (hover) {
      this._prevAvailableDropdownOption(hover);
      this._scrollDropdownOptions();
    }
  }

  _removeHoverDropdownOption() {
    const hover = this.dropdown.querySelector(`.${CLASSES.HOVER}`);

    if (hover) {
      hover.classList.remove(CLASSES.HOVER);
    }
  }

  _scrollDropdownOptions() {
    const menuScroll = this.dropdown.scrollTop;
    const menuHeight = this.dropdown.offsetHeight;
    const item = this.dropdown.querySelector(`.${CLASSES.HOVER}`);
    const itemOffset = item.offsetTop;
    const itemHeight = item.offsetHeight;
    const offset = menuHeight + menuScroll - itemOffset - itemHeight;
    if (offset < 0) {
      this.dropdown.scrollTop = menuScroll - offset;
    }
    if (itemOffset < menuScroll) {
      this.dropdown.scrollTop = itemOffset;
    }
  }

  _showDropdownText() {
    const node = this.dropdownText;
    node.style.display = 'inline-block';

    return node;
  }

  _hideDropdownText() {
    const node = this.dropdownText;
    node.style.display = 'none';

    return node;
  }

  _autoResize(node) {
    return node.style.width = `${(node.value.length + 2) * 8}px`;
  }

  _removeDropdownTag(e) {
    const selectedOptions = this.html.querySelectorAll('a');
    const activeOption = this.html.querySelector(`a.${CLASSES.ACTIVE}`);
    const caretPosition = e.target.selectionStart;
    const noResultsMessage = this._doesNoResultsMessageExists();

    if (noResultsMessage) {
      this._removeNoResultsMessage();
    }

    if (activeOption) {
      const index = activeOption.getAttribute(INDEX_ATTRIBUTE);
      this._unselectDropdownOption(index);
      const nextIndex = activeOption.nextElementSibling.getAttribute(INDEX_ATTRIBUTE);
      if (activeOption && nextIndex) {
        activeOption.nextElementSibling.classList.add(CLASSES.ACTIVE);
        activeOption.nextElementSibling.setAttribute('tabindex', '0');
        activeOption.nextElementSibling.focus();
      } else {
        this.search.focus();
      }
      activeOption.remove();
      this._showDropdownOptions();
    }

    if (selectedOptions.length && caretPosition === 0 && !activeOption) {
      const index = selectedOptions[selectedOptions.length - 1].getAttribute(INDEX_ATTRIBUTE);
      this._unselectDropdownOption(index);
      selectedOptions[selectedOptions.length - 1].remove();
    }
  }

  _buildDropdownText() {
    const { config: { placeholder, options, defaultValue } } = this.model;

    const node = document.createElement('div');
    node.classList.add('af-dropdown-text');

    if (placeholder) {
      node.textContent = placeholder;
      node.classList.add('af-default');
    }

    if (defaultValue && !this.multiple) {
      const option = find(options, { value: defaultValue });

      if (option) {
        node.textContent = option.label;
        node.classList.remove('af-default');
      }
    }

    this._addDropdownTextListeners(node);

    return node;
  }

  _addDropdownTextListeners(node) {
    const self = this;

    node.onmousedown = function (e) {
      e.preventDefault();
      self.search.focus();
    };
  }

  _setDropdownText(value) {
    const node = this.dropdownText;
    node.classList.remove('af-default');
    node.textContent = value;

    return node;
  }

  _buildDropdown() {
    const node = document.createElement('div');
    node.classList.add('af-dropdown-search-options');

    return node;
  }

  _buildDropdownOptions(search, container) {
    const { options, defaultValue, multiple } = this.model.config;

    const node = options
      .map((o, i) => {
        const selected = defaultValue && (multiple
          ? includes(defaultValue, o.value) : defaultValue === o.value);

        return this._buildDropdownOption(i, o.label, selected, search, container);
      });

    return node;
  }

  _buildDropdownOption(i, label, selected, search, container) {
    const node = document.createElement('div');
    node.textContent = label;

    if (selected && this.multiple) {
      node.classList.add(CLASSES.ACTIVE);

      const tag = this._buildDropdownOptionTag(i, label);
      container.insertBefore(tag, search);
    }

    node.setAttribute(INDEX_ATTRIBUTE, i);

    this._addDropdownOptionListeners(node);

    return node;
  }

  _addDropdownOptionListeners(node) {
    node.onmousedown = (e) => {
      e.preventDefault();

      const label = node.textContent;
      const index = node.getAttribute(INDEX_ATTRIBUTE);

      if (!this.multiple) {
        this._setDropdownText(label);
        this._hideDropdownOptions();
      }

      this._selectDropdownOption(index, label);
    };
  }

  _buildDropdownIcon() {
    const node = document.createElement('i');
    node.classList.add('af-dropdown-icon');

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 451.847 451.847');
    icon.setAttribute('width', '100%');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751 c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0 c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z');
    icon.appendChild(path);

    node.appendChild(icon);

    this._addDropdownIconListeners(node);

    return node;
  }

  _addDropdownIconListeners(node) {
    const self = this;
    node.onmousedown = function (e) {
      e.preventDefault();

      const classes = self.dropdown.classList.value;

      includes(classes, CLASSES.DISPLAY)
        ? self._hideDropdownOptions()
        : self._showDropdownOptions();

      self.search.focus();
    };
  }


  _selectDropdownOption(index, label) {
    const node = this.hiddenDropdown;

    node.options[index].selected = true;

    this.listener.onInput(this);
    this.listener.onChange(this);

    if (this.multiple) {
      const tag = this._buildDropdownOptionTag(index, label);
      this.dropdownText.style.opacity = '0';
      this.html.insertBefore(tag, this.search);
    } else {
      this.search.blur();
    }

    this._addActiveDropdownOptionClass(index);
    this._checkAllDropdownOptionsSelected();

    return node;
  }

  _checkAllDropdownOptionsSelected() {
    const activeOptions = this.dropdown.querySelectorAll(`.${CLASSES.ACTIVE}`);

    if (activeOptions.length == this.dropdownOptions.length) {
      this.search.blur();
    }
  }

  _addActiveDropdownOptionClass(index) {
    if (!this.multiple) {
      const activeOption = this.dropdown.querySelector(`.${CLASSES.ACTIVE}`);
      const activeOptionIndex = activeOption
        ? activeOption.getAttribute(INDEX_ATTRIBUTE)
        : undefined;

      if (activeOptionIndex) {
        this._removeActiveDropdownOptionClass(activeOptionIndex);
      }
    }

    const node = this.dropdown.querySelector(`[${INDEX_ATTRIBUTE}="${index}"]`);
    node.classList.add(CLASSES.ACTIVE, CLASSES.FILTERED);
    node.classList.remove(CLASSES.HOVER);

    return node;
  }

  _removeActiveDropdownOptionClass(index) {
    const node = this.dropdown.querySelector(`[${INDEX_ATTRIBUTE}="${index}"]`);
    node.classList.remove(CLASSES.ACTIVE, CLASSES.FILTERED);

    return node;
  }

  _buildDropdownOptionTag(index, label) {
    const node = document.createElement('a');
    node.setAttribute(INDEX_ATTRIBUTE, index);
    node.textContent = label;

    const icon = document.createElement('i');
    icon.classList.add('af-dropdown-option-delete');
    icon.innerHTML = '×';

    node.appendChild(icon);

    this._addDropdownOptionTagListeners(node, icon);

    return node;
  }

  _addDropdownOptionTagListeners(node, icon) {
    const self = this;

    node.onmousedown = (e) => {
      e.preventDefault();
    };

    node.onclick = () => {
      this._setActiveDropdownTag(node);
      this.search.blur();
    };

    node.onkeydown = (e) => {
      switch (e.keyCode) {
        case KEY_CODE.DELETE:
        case KEY_CODE.BACKSPACE:
          return self._removeDropdownTag(e);
        case KEY_CODE.LEFT_ARROW:
          return self._hoverPrevDropdownTag(e);
        case KEY_CODE.RIGHT_ARROW:
          return self._hoverNextDropdownTag(e);
        case KEY_CODE.DOWN_ARROW:
          return self._hoverNextDropdownOption(e);
        case KEY_CODE.UP_ARROW:
          return self._hoverPrevDropdownOption(e);
        case KEY_CODE.ESCAPE:
          return node.blur();
        case KEY_CODE.ENTER:
          return self._selectHoverDropdownOption(e);
      }
    };

    node.onblur = () => {
      this._removeAllActiveDropdownTags();
      this._hideDropdownOptions();
    };

    icon.onmousedown = (e) => {
      e.preventDefault();
      const index = node.getAttribute(INDEX_ATTRIBUTE);
      const noResultsMessage = this._doesNoResultsMessageExists();

      this._unselectDropdownOption(index);
      node.remove();

      if (noResultsMessage) {
        this._removeNoResultsMessage();
      }
    };
  }

  _setActiveDropdownTag(node) {
    const activeTag = this.html.querySelector(`a.${CLASSES.ACTIVE}`);

    if (activeTag) {
      activeTag.removeAttribute('tabindex');
      activeTag.classList.remove(CLASSES.ACTIVE);
    }

    node.classList.add(CLASSES.ACTIVE);
    node.setAttribute('tabindex', '0');
    this._showDropdownOptions();
    return node.focus();
  }

  _removeAllActiveDropdownTags() {
    const activeTag = this.html.querySelector(`a.${CLASSES.ACTIVE}`);

    if (activeTag) {
      activeTag.removeAttribute('tabindex');
      activeTag.classList.remove(CLASSES.ACTIVE);
    }
  }

  _filterDropdownOptions(node) {
    const input = node.value.toLowerCase();
    const options = this.dropdownOptions;

    options
      .map((value, i) => {
        const optionValue = value.textContent.toLowerCase();

        if (!includes(optionValue, input)) {
          return options[i].classList.add(CLASSES.FILTERED);
        } if (!includes(options[i].classList.value, CLASSES.ACTIVE)) {
          return options[i].classList.remove(CLASSES.FILTERED);
        }
      });

    const filteredOptions = this.dropdown.querySelectorAll(`.${CLASSES.FILTERED}`);
    const noResultsMessage = this._doesNoResultsMessageExists();

    if (!noResultsMessage && filteredOptions.length === options.length) {
      const message = this._buildNoResultsMessage();

      return this.dropdown.appendChild(message);
    }

    if (noResultsMessage && filteredOptions.length !== options.length) {
      return this._removeNoResultsMessage();
    }
  }

  _doesNoResultsMessageExists() {
    const node = this.dropdown.querySelector('.af-dropdown-message');

    return !!node;
  }

  _buildNoResultsMessage() {
    const node = document.createElement('div');
    node.classList.add('af-dropdown-message');
    node.textContent = NO_RESULTS_FOUND;

    return node;
  }

  _removeNoResultsMessage() {
    const node = this.dropdown.querySelector('.af-dropdown-message');

    return node.remove();
  }


  _unselectDropdownOption(index) {
    const node = this.hiddenDropdown;

    node.options[index].selected = false;

    this.listener.onInput(this);
    this.listener.onChange(this);

    this._removeActiveDropdownOptionClass(index);

    return node;
  }

  _hideDropdownOptions() {
    const node = this.dropdown;
    node.classList.remove(CLASSES.DISPLAY);

    this._removeHoverDropdownOption();

    return node;
  }

  _showDropdownOptions() {
    const node = this.dropdown;
    node.classList.add(CLASSES.DISPLAY);

    return node;
  }

  _nextAvailableDropdownOption(node) {
    let current = node;

    while (current.nextElementSibling) {
      current = current.nextElementSibling;
      if (!includes(current.classList.value, CLASSES.ACTIVE)
        && !includes(current.classList.value, CLASSES.FILTERED)) {
        current.classList.add(CLASSES.HOVER);
        node.classList.remove(CLASSES.HOVER);
        break;
      }
    }
  }

  _prevAvailableDropdownOption(node) {
    let current = node;

    while (current.previousElementSibling) {
      current = current.previousElementSibling;
      if (!includes(current.classList.value, CLASSES.ACTIVE)
        && !includes(current.classList.value, CLASSES.FILTERED)) {
        current.classList.add(CLASSES.HOVER);
        node.classList.remove(CLASSES.HOVER);
        break;
      }
    }
  }

  _resetDropdownActiveTags() {
    const selectedOptions = this.html.querySelectorAll('a');

    if (selectedOptions) {
      selectedOptions.forEach((o) => {
        const noResultsMessage = this._doesNoResultsMessageExists();
        const index = o.getAttribute(INDEX_ATTRIBUTE);

        this._unselectDropdownOption(index);
        o.remove();

        if (noResultsMessage) {
          this._removeNoResultsMessage();
        }
      });
    }
  }

  get value() {
    const choices = this.hiddenDropdownOptions
      .filter(o => o.selected)
      .map(o => o.value);

    if (this.multiple) {
      return choices;
    }

    const firstChoice = choices[0] || undefined;

    return firstChoice;
  }

  get options() {
    return this.hiddenDropdownOptions;
  }

  build() {
    const { config: { defaultValue } } = this.model;

    const container = document.createElement('div');
    container.classList.add('af-dropdown');

    if (this.multiple) {
      container.classList.add('af-dropdown-multiple');
    }

    const self = this;

    container.onmousedown = function (e) {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        self.search.focus();
      }
    };

    const hiddenDropdown = this._buildHiddenDropdown();
    container.appendChild(hiddenDropdown);

    const hiddenDropdownOptions = this._buildHiddenDropdownOptions();
    hiddenDropdownOptions.forEach(o => hiddenDropdown.appendChild(o));

    const search = this._buildSearch(this.model);
    container.appendChild(search);

    const dropdown = this._buildDropdown();
    container.appendChild(dropdown);

    const dropdownText = this._buildDropdownText();
    container.appendChild(dropdownText);

    const dropdownIcon = this._buildDropdownIcon();
    container.appendChild(dropdownIcon);

    const dropdownOptions = this._buildDropdownOptions(search, container);
    dropdownOptions.forEach(n => dropdown.appendChild(n));

    this.hiddenDropdown = hiddenDropdown;
    this.hiddenDropdownOptions = hiddenDropdownOptions;
    this.dropdown = dropdown;
    this.dropdownOptions = dropdownOptions;
    this.dropdownText = dropdownText;
    this.search = search;
    this.html = container;
  }

  render() {
    if (!this.html) {
      this.build();
    }

    if (isNil(this.html)) {
      throw new Error('Unexpected case');
    }

    return this.html;
  }

  reset() {
    const { defaultValue } = this.model.config;

    if (this.multiple) {
      this._resetDropdownActiveTags();
    }

    this.hiddenDropdownOptions
      .forEach((o, index) => {
        const selected = defaultValue && (this.multiple
          ? includes(defaultValue, o.value)
          : defaultValue === o.value);

        o.selected = selected;

        if (!selected) {
          return;
        }

        if (this.multiple) {
          this._selectDropdownOption(index, o.label);
        } else {
          this._setDropdownText(o.label);
        }
      });
  }

  static create(model, listener) {
    return new LegacyDropdown(model, listener);
  }
}

/* eslint-enable */

export default LegacyDropdown;
