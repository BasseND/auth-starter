const fs = require('fs');
const path = require('path');

// Fonction pour charger un template
function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, 'src', 'email', 'templates', `${templateName}.html`);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Erreur lors du chargement du template ${templateName}:`, error.message);
    return null;
  }
}

// Fonction pour traiter un template
function processTemplate(template, variables) {
  let processedTemplate = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(placeholder, value || '');
  });
  
  return processedTemplate;
}

console.log('=== Test des templates d\'email ===\n');

// Test du template de vérification d'email
console.log('1. Test du template de vérification d\'email...');
const emailVerificationTemplate = loadTemplate('email-verification');
if (emailVerificationTemplate) {
  console.log('✓ Template de vérification d\'email chargé avec succès');
  
  const variables = {
    firstName: 'Jean',
    verificationUrl: 'http://localhost:4200/verify-email?token=abc123'
  };
  
  const processedTemplate = processTemplate(emailVerificationTemplate, variables);
  console.log('✓ Template traité avec succès');
  console.log(`✓ Taille du template traité: ${processedTemplate.length} caractères`);
  
  // Vérifier que les variables ont été remplacées
  if (processedTemplate.includes('{{firstName}}') || processedTemplate.includes('{{verificationUrl}}')) {
    console.log('⚠️  Attention: Des placeholders n\'ont pas été remplacés');
  } else {
    console.log('✓ Tous les placeholders ont été remplacés');
  }
} else {
  console.log('✗ Échec du chargement du template de vérification d\'email');
}

console.log('\n2. Test du template de réinitialisation de mot de passe...');
const passwordResetTemplate = loadTemplate('password-reset');
if (passwordResetTemplate) {
  console.log('✓ Template de réinitialisation de mot de passe chargé avec succès');
  
  const variables = {
    firstName: 'Marie',
    resetUrl: 'http://localhost:4200/reset-password?token=def456'
  };
  
  const processedTemplate = processTemplate(passwordResetTemplate, variables);
  console.log('✓ Template traité avec succès');
  console.log(`✓ Taille du template traité: ${processedTemplate.length} caractères`);
  
  // Vérifier que les variables ont été remplacées
  if (processedTemplate.includes('{{firstName}}') || processedTemplate.includes('{{resetUrl}}')) {
    console.log('⚠️  Attention: Des placeholders n\'ont pas été remplacés');
  } else {
    console.log('✓ Tous les placeholders ont été remplacés');
  }
} else {
  console.log('✗ Échec du chargement du template de réinitialisation de mot de passe');
}

console.log('\n3. Test du template de base...');
const baseTemplate = loadTemplate('base');
if (baseTemplate) {
  console.log('✓ Template de base chargé avec succès');
  console.log(`✓ Taille du template de base: ${baseTemplate.length} caractères`);
} else {
  console.log('✗ Échec du chargement du template de base');
}

console.log('\n=== Fin des tests ===');