import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Adresse email de l\'utilisateur',
  })
  @IsEmail({}, { message: 'Format d\'email invalide' })
  email: string;

  @ApiProperty({
    example: 'MySecureP@ssw0rd2024!',
    description: 'Mot de passe sécurisé (minimum 12 caractères, majuscules, minuscules, chiffres, caractères spéciaux)',
    minLength: 12,
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Prénom de l\'utilisateur',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Nom de famille de l\'utilisateur',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  lastName?: string;

  @ApiProperty({
    example: 'USER',
    description: 'Rôle de l\'utilisateur',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Rôle invalide' })
  role?: Role;
}