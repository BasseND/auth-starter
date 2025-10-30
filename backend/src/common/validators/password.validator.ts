import { 
  registerDecorator, 
  ValidationOptions, 
  ValidatorConstraint, 
  ValidatorConstraintInterface,
  ValidationArguments 
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (!password) return false;

    // Vérifications de base
    const minLength = 12;
    const hasMinLength = password.length >= minLength;
    const hasMaxLength = password.length <= 128;
    
    // Vérifications de complexité
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Vérifications de sécurité avancées
    const noRepeatingChars = !/(.)\1{2,}/.test(password); // Pas plus de 2 caractères identiques consécutifs
    const noSequentialChars = !this.hasSequentialChars(password);
    const noCommonPatterns = !this.hasCommonPatterns(password);
    const noPersonalInfo = !this.hasPersonalInfo(password, args);

    return hasMinLength && 
           hasMaxLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar && 
           noRepeatingChars && 
           noSequentialChars && 
           noCommonPatterns && 
           noPersonalInfo;
  }

  private hasSequentialChars(password: string): boolean {
    // Vérifier les séquences de 3+ caractères consécutifs (abc, 123, etc.)
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);
      
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
    }
    return false;
  }

  private hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /password/i,
      /123456/,
      /qwerty/i,
      /azerty/i,
      /admin/i,
      /login/i,
      /user/i,
      /test/i,
      /guest/i,
      /welcome/i,
      /letmein/i,
      /monkey/i,
      /dragon/i,
      /master/i,
      /shadow/i,
      /superman/i,
      /batman/i,
      /football/i,
      /baseball/i,
      /basketball/i,
      /soccer/i,
      /princess/i,
      /sunshine/i,
      /iloveyou/i,
      /trustno1/i,
      /starwars/i
    ];

    return commonPatterns.some(pattern => pattern.test(password));
  }

  private hasPersonalInfo(password: string, args: ValidationArguments): boolean {
    const object = args.object as any;
    const personalFields = ['firstName', 'lastName', 'email'];
    
    for (const field of personalFields) {
      if (object[field]) {
        const value = object[field].toString().toLowerCase();
        if (value.length >= 3 && password.toLowerCase().includes(value)) {
          return true;
        }
        
        // Vérifier aussi sans les domaines d'email
        if (field === 'email') {
          const emailPart = value.split('@')[0];
          if (emailPart.length >= 3 && password.toLowerCase().includes(emailPart)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return this.getDetailedMessage(args.value, args);
  }

  private getDetailedMessage(password: string, args: ValidationArguments): string {
    if (!password) return 'Le mot de passe est requis';

    const errors: string[] = [];
    
    if (password.length < 12) {
      errors.push('au moins 12 caractères');
    }
    
    if (password.length > 128) {
      errors.push('maximum 128 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('au moins une lettre majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('au moins une lettre minuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('au moins un chiffre');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('au moins un caractère spécial');
    }
    
    if (/(.)\1{2,}/.test(password)) {
      errors.push('pas plus de 2 caractères identiques consécutifs');
    }
    
    if (this.hasSequentialChars(password)) {
      errors.push('pas de séquences de caractères (abc, 123, etc.)');
    }
    
    if (this.hasCommonPatterns(password)) {
      errors.push('éviter les mots de passe courants');
    }
    
    if (this.hasPersonalInfo(password, args)) {
      errors.push('ne pas inclure d\'informations personnelles');
    }

    if (errors.length > 0) {
      return `Le mot de passe doit contenir : ${errors.join(', ')}`;
    }

    return 'Mot de passe invalide';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

// Fonction utilitaire pour vérifier la force d'un mot de passe
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  // Longueur
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('Utilisez au moins 12 caractères');

  // Complexité
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Ajoutez des lettres majuscules');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Ajoutez des lettres minuscules');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Ajoutez des chiffres');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Ajoutez des caractères spéciaux');

  // Bonus pour la diversité
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  // Pénalités
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Évitez les caractères répétés');
  }

  const isStrong = score >= 6 && feedback.length === 0;

  return {
    score: Math.max(0, Math.min(10, score)),
    feedback,
    isStrong
  };
}