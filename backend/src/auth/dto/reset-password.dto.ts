import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de réinitialisation reçu par email',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;

  @ApiProperty({
    example: 'MyNewSecureP@ssw0rd2024!',
    description: 'Nouveau mot de passe sécurisé (minimum 12 caractères, majuscules, minuscules, chiffres, caractères spéciaux)',
    minLength: 12,
  })
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}