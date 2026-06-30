import type { FormEvent } from 'react';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Replace the browser's native (browser-locale, e.g. English) constraint
 * validation messages with localized ones. Spread onto each required field:
 *
 *   const vh = validationHandlers(t);
 *   <input required {...vh} />
 *
 * `onInvalid` sets a localized message when the field fails validation;
 * `onInput` clears it so the field can become valid again as the user types.
 */
export function validationHandlers(t: (key: string) => string) {
  return {
    onInvalid: (e: FormEvent<Field>) => {
      const el = e.currentTarget;
      if (el.validity.valueMissing) el.setCustomValidity(t('required'));
      else if (el.validity.typeMismatch) el.setCustomValidity(t('email'));
      else el.setCustomValidity('');
    },
    onInput: (e: FormEvent<Field>) => {
      e.currentTarget.setCustomValidity('');
    },
  };
}
