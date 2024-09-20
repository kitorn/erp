import { IsEmailOrPhoneNumberConstraint } from '@/validators/IsEmailOrPhoneNumber';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  Validate,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsEmailOrPhoneNumberConstraint)
  id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  lastName: string;

  @IsNotEmpty()
  @IsInt()
  @Min(18)
  @Max(120)
  age: number;
}
