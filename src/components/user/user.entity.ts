import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {
  IsString,
  IsInt,
  MinLength,
  MaxLength,
  Validate,
  IsNotEmpty,
} from 'class-validator';
import { IsEmailOrPhoneNumberConstraint } from '@/validators/IsEmailOrPhoneNumber';
import { RefreshToken } from './refreshToken.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  @Validate(IsEmailOrPhoneNumberConstraint)
  identifier: string;

  @Column()
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  password: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: string | null;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  firstName: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  lastName: string;

  @Column()
  @IsNotEmpty()
  @IsInt()
  @MinLength(18)
  @MaxLength(120)
  age: number;
}
