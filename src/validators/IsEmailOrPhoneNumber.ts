import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isEmailOrPhoneNumber', async: false })
export class IsEmailOrPhoneNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(identifier: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return emailRegex.test(identifier) || phoneRegex.test(identifier);
  }

  defaultMessage() {
    return 'id must be either a valid email or phone number';
  }
}
