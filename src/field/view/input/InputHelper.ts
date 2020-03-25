import isNil from 'lodash/isNil';

import { IFieldModel } from '../../model/FieldModel';
import { IHTMLInputListener } from '../InputView';
import { UID } from '../../../lib/UID';

export enum InputMode {
  TEL = 'tel',
  NUMBER = 'decimal',
  EMAIL = 'email',
  URL = 'url',
}

interface IInputOptions {
  inputMode?: InputMode;
}

export const InputHelper = {
  isChecked(elem: HTMLInputElement): boolean {
    return elem.checked;
  },

  getValue(elem: HTMLInputElement): string {
    return elem.value;
  },

  resetCheck(elem: HTMLInputElement): void {
    elem.checked = elem.defaultChecked; // eslint-disable-line no-param-reassign
  },
};

export const InputCreator = {
  input(fieldM: IFieldModel, inputType: string, options: IInputOptions = {}): HTMLInputElement {
    const elem = document.createElement('input');

    elem.type = inputType;
    elem.id = UID.create();
    elem.name = fieldM.id;

    if (options.inputMode) {
      elem.inputMode = options.inputMode;
    }

    return elem;
  },

  textarea(fieldM: IFieldModel): HTMLTextAreaElement {
    const elem = document.createElement('textarea');

    elem.id = UID.create();
    elem.name = fieldM.id;

    return elem;
  },
};

export type IStringInputElement = HTMLInputElement | HTMLTextAreaElement;

export interface IFieldWithPlaceholder {
  readonly config: {
    readonly placeholder?: string;
  };
}
export interface IFieldWithDefaultValue {
  readonly config: {
    readonly defaultValue?: number | string;
  };
}
export interface IFieldWithLengthRules {
  readonly config: {
    readonly minLength: number;
    readonly maxLength?: number;
  };
}
export interface IFieldWithRangeRules {
  config: {
    minValue?: number;
    maxValue?: number;
  };
}

interface IListenableHTMLElement extends HTMLElement {
  readonly type: string;
}

export const InputConfigurator = {
  placeholder(elem: IStringInputElement, fieldM: IFieldWithPlaceholder): void {
    const { placeholder } = fieldM.config;

    if (placeholder) {
      elem.placeholder = placeholder; // eslint-disable-line no-param-reassign
    }
  },

  defaultValue(elem: IStringInputElement, fieldM: IFieldWithDefaultValue): void {
    const { defaultValue } = fieldM.config;

    if (!isNil(defaultValue)) {
      elem.value = defaultValue.toString(); // eslint-disable-line no-param-reassign
    }
  },

  lengthRules(elem: IStringInputElement, fieldM: IFieldWithLengthRules): void {
    const { minLength, maxLength } = fieldM.config;

    if (minLength > 0) {
      elem.minLength = minLength; // eslint-disable-line no-param-reassign
    }
    if (!isNil(maxLength) && maxLength >= 0) {
      elem.maxLength = maxLength; // eslint-disable-line no-param-reassign
    }
  },

  rangeRules(elem: HTMLInputElement, fieldM: IFieldWithRangeRules): void {
    const { minValue, maxValue } = fieldM.config;

    if (!isNil(minValue)) {
      elem.min = minValue.toString(); // eslint-disable-line no-param-reassign
    }
    if (!isNil(maxValue)) {
      elem.max = maxValue.toString(); // eslint-disable-line no-param-reassign
    }
  },

  /*
   * Old browsers do not support onInput event when input type is radio or checkbox,
   * so we have to check it and use a different event when needed.
   */
  supportsOnInput(elem: IListenableHTMLElement): boolean {
    return elem.type !== 'radio' && elem.type !== 'checkbox';
  },

  addListeners(elem: IListenableHTMLElement, inputL: IHTMLInputListener): void {
    elem.addEventListener('blur', () => inputL.onBlur());
    elem.addEventListener('change', () => inputL.onChange());
    elem.addEventListener('focus', () => inputL.onFocus());
    elem.addEventListener(
      this.supportsOnInput(elem) ? 'input' : 'change',
      () => inputL.onInput(),
    );
  },
};
