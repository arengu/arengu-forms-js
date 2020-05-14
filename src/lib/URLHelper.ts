import isNil from 'lodash/isNil';

const searchParams = new URLSearchParams(document.location.search);

export const URLHelper = {
  getParam(name: string): string | undefined {
    const urlValue = searchParams.get(name);

    if (isNil(urlValue)) {
      return undefined;
    }

    return urlValue.trim();
  },

  getAllParams(): Record<string, string | string[]> {
    const entries = searchParams;
    const params: Record<string, string | string[]> = {};

    entries.forEach((newVal, key): void => {
      const currVal = params[key];

      if (isNil(currVal)) {
        params[key] = newVal;
      } else if (typeof (currVal) === 'string') {
        params[key] = [currVal, newVal];
      } else if (currVal instanceof Array) {
        params[key] = currVal.concat(newVal);
      } else {
        throw new Error('Unexpected value');
      }
    });

    return params;
  },
};
