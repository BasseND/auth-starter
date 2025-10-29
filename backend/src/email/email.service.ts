import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_SERVER_HOST'),
      port: this.configService.get<number>('EMAIL_SERVER_PORT'),
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: this.configService.get<string>('EMAIL_SERVER_USER'),
        pass: this.configService.get<string>('EMAIL_SERVER_PASSWORD'),
      },
    });
  }

  /**
   * Charge un template HTML depuis le système de fichiers
   */
  private loadTemplate(templateName: string): string {
    // En développement, utiliser le chemin src, en production utiliser dist
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const basePath = isDevelopment 
      ? path.join(process.cwd(), 'src', 'email', 'templates')
      : path.join(__dirname, 'templates');
    
    const templatePath = path.join(basePath, `${templateName}.html`);
    
    try {
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error(`Erreur lors du chargement du template ${templateName}:`, error);
      console.error(`Chemin tenté: ${templatePath}`);
      throw new Error(`Template ${templateName} introuvable`);
    }
  }

  /**
   * Remplace les placeholders dans un template avec les valeurs fournies
   */
  private processTemplate(template: string, variables: Record<string, string>): string {
    let processedTemplate = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(placeholder, value || '');
    });
    
    return processedTemplate;
  }

  async sendEmailVerification(email: string, token: string, firstName?: string) {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200')}/verify-email?token=${token}`;
    
    try {
      // Charger le template HTML
      const template = this.loadTemplate('email-verification');
      
      // Préparer les variables pour le template
      const templateVariables = {
        firstName: firstName || 'Utilisateur',
        verificationUrl: verificationUrl,
      };
      
      // Traiter le template avec les variables
      const htmlContent = this.processTemplate(template, templateVariables);
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: email,
        subject: 'Vérifiez votre adresse email - Auth Starter',
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de vérification envoyé:', result.messageId);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  async sendEmailVerificationResend(email: string, token: string, firstName?: string) {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200')}/verify-email?token=${token}`;
    
    try {
      // Charger le template HTML
      const template = this.loadTemplate('email-verification');
      
      // Préparer les variables pour le template
      const templateVariables = {
        firstName: firstName || 'Utilisateur',
        verificationUrl: verificationUrl,
      };
      
      // Traiter le template avec les variables
      const htmlContent = this.processTemplate(template, templateVariables);
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: email,
        subject: 'Nouveau lien de vérification - Auth Starter',
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de vérification renvoyé:', result.messageId);
      return result;
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
      throw error;
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  async sendPasswordReset(email: string, token: string, firstName?: string) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200')}/reset-password?token=${token}`;
    
    try {
      // Charger le template HTML
      const template = this.loadTemplate('password-reset');
      
      // Préparer les variables pour le template
      const templateVariables = {
        firstName: firstName || 'Utilisateur',
        resetUrl: resetUrl,
      };
      
      // Traiter le template avec les variables
      const htmlContent = this.processTemplate(template, templateVariables);
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM'),
        to: email,
        subject: 'Réinitialisation de votre mot de passe - Auth Starter',
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email de réinitialisation envoyé:', result.messageId);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw error;
    }
  }
}