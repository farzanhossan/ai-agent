import { isArrayHasSameObject } from '@src/shared';
import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const ARRAY_OBJECT_CAN_NOT_BE_SAME = 'arrayObjectCanNotBeSame';

function isValidated<T>(value: T[], keyProperty: keyof T): boolean {
  let validated = false;
  if (value && value.length > 0) {
    const hasSameObject = isArrayHasSameObject<T>(value, keyProperty);
    if (hasSameObject) {
      validated = false;
    } else {
      validated = true;
    }
  }
  return validated;
}

export function ArrayObjectCanNotBeSame<T>(
  keyProperty: keyof T,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: ARRAY_OBJECT_CAN_NOT_BE_SAME,
      constraints: [keyProperty],
      validator: {
        validate: (value, args): boolean => isValidated<T>(value, args?.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property array object can not be same',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
