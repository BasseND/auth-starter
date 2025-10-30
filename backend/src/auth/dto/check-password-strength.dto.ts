import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckPasswordStrengthDto {
  @ApiProperty({
    example: 'MyTestP@ssw0rd2024!',
    description: 'Mot de passe à vérifier',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}