import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    // Configuration du transporteur SMTP pour Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'lirsitogo2021@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'phlelzqtfdpuvalx',
      },
    });

    // Vérification de la connexion au service SMTP
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Connexion au service SMTP établie avec succès');
    } catch (error) {
      this.logger.error(`Erreur de connexion au service SMTP: ${error.message}`);
    }
  }

  /**
   * Envoyer un email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    from: string = process.env.EMAIL_FROM || 'support@lounge-africa.com',
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email envoyé avec succès: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error.message}`);
      return false;
    }
  }

  /**
   * Envoyer un email de bienvenue à un nouvel utilisateur
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<boolean> {
    const subject = 'Bienvenue sur Lounge Africa - Votre compte a été créé';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #333;">Bienvenue sur Lounge Africa</h1>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p>Bonjour ${firstName} ${lastName},</p>
          <p>Nous sommes ravis de vous informer qu'un compte a été créé pour vous sur la plateforme Lounge Africa.</p>
          <p>Vous pouvez dès maintenant vous connecter à votre espace personnel pour accéder à nos salons VIP dans les aéroports en Afrique et profiter de nos services exclusifs.</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin-bottom: 10px;"><strong>Vos informations de connexion :</strong></p>
          <p style="margin: 5px 0;">Email : ${email}</p>
          <p style="margin: 5px 0;">Mot de passe : Celui qui vous a été communiqué par votre administrateur</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <p>Nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
          <p>Pour vous connecter, cliquez sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:6611'}/auth/login" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Se connecter</a>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
          <p>Si vous avez des questions, n'hésitez pas à nous contacter à l'adresse <a href="mailto:support@lounge-africa.com">support@lounge-africa.com</a>.</p>
          <p>&copy; ${new Date().getFullYear()} Lounge Africa. Tous droits réservés.</p>
        </div>
      </div>
    `;

    return this.sendEmail(email, subject, html);
  }
} 