import { buildMessage, ValidateBy } from 'class-validator';

export const IS_SCOPES_VALID = 'isScopesValid';

function isValidated(value: string, validScopes: string[]): boolean {
  let isValidated = true;

  value = value.replace(/\s/g, '');
  const scopes = value.split(',');

  scopes.forEach((scope) => {
    if (!validScopes.includes(scope)) {
      isValidated = false;
    }
  });

  return isValidated;
}

export function IsScopesValid(validScopes: string[]): PropertyDecorator {
  return ValidateBy({
    name: IS_SCOPES_VALID,
    validator: {
      validate: (value, args): boolean => isValidated(value, validScopes),
      defaultMessage: buildMessage(
        (eachPrefix) =>
          eachPrefix + `$property must be valid scopes from the list: ${validScopes.join(', ')}`,
      ),
    },
  });
}
