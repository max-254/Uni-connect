const nodemailer = require('nodemailer');
const { promisify } = require('util');
const redis = require('../../config/redis');
const config = require('../../config/config');
const logger = require('../utils/logger');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  },
  tls: {
    rejectUnauthorized: config.email.rejectUnauthorized
  }
});

// Rate limiting for email sending
const rateLimitEmailSending = async (email, type, limit, period) => {
  const key = `email:${type}:${email}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, period);
  }
  
  return count <= limit;
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 * @param {string} language - Preferred language
 * @returns {Promise<void>}
 */
exports.sendVerificationEmail = async (email, token, language = 'en') => {
  try {
    // Apply rate limiting
    const canSendEmail = await rateLimitEmailSending(email, 'verification', 3, 3600); // 3 per hour
    if (!canSendEmail) {
      logger.warn('Email rate limit exceeded', { email, type: 'verification' });
      throw new Error('Email rate limit exceeded');
    }

    const verificationUrl = `${config.app.url}/auth/verify-email/${token}`;
    
    // Get email template based on language
    const subject = getEmailSubject('verification', language);
    const html = getVerificationEmailTemplate(verificationUrl, language);

    const mailOptions = {
      from: `"${config.app.name}" <${config.email.from}>`,
      to: email,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info('Verification email sent', { email });
  } catch (error) {
    logger.error('Error sending verification email', { error: error.message, email });
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 * @param {string} language - Preferred language
 * @returns {Promise<void>}
 */
exports.sendPasswordResetEmail = async (email, token, language = 'en') => {
  try {
    // Apply rate limiting
    const canSendEmail = await rateLimitEmailSending(email, 'passwordReset', 3, 3600); // 3 per hour
    if (!canSendEmail) {
      logger.warn('Email rate limit exceeded', { email, type: 'passwordReset' });
      throw new Error('Email rate limit exceeded');
    }

    const resetUrl = `${config.app.url}/auth/reset-password/${token}`;
    
    // Get email template based on language
    const subject = getEmailSubject('passwordReset', language);
    const html = getPasswordResetEmailTemplate(resetUrl, language);

    const mailOptions = {
      from: `"${config.app.name}" <${config.email.from}>`,
      to: email,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent', { email });
  } catch (error) {
    logger.error('Error sending password reset email', { error: error.message, email });
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Get email subject based on type and language
 * @param {string} type - Email type
 * @param {string} language - Language code
 * @returns {string} Email subject
 */
const getEmailSubject = (type, language) => {
  const subjects = {
    verification: {
      en: `Verify your email for ${config.app.name}`,
      es: `Verifica tu correo electrónico para ${config.app.name}`,
      fr: `Vérifiez votre email pour ${config.app.name}`
    },
    passwordReset: {
      en: `Reset your password for ${config.app.name}`,
      es: `Restablece tu contraseña para ${config.app.name}`,
      fr: `Réinitialisez votre mot de passe pour ${config.app.name}`
    }
  };

  return subjects[type][language] || subjects[type]['en'];
};

/**
 * Get verification email template
 * @param {string} verificationUrl - Verification URL
 * @param {string} language - Language code
 * @returns {string} HTML email template
 */
const getVerificationEmailTemplate = (verificationUrl, language) => {
  const templates = {
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Thank you for registering with ${config.app.name}. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply.</p>
      </div>
    `,
    es: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Verifica tu dirección de correo electrónico</h2>
        <p>Gracias por registrarte en ${config.app.name}. Por favor, haz clic en el botón de abajo para verificar tu dirección de correo electrónico:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar Email</a>
        </div>
        <p>Si no creaste una cuenta con nosotros, puedes ignorar este correo electrónico.</p>
        <p>Este enlace caducará en 10 minutos.</p>
        <p>Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">Este es un correo electrónico automático. Por favor, no responda.</p>
      </div>
    `,
    fr: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Vérifiez votre adresse e-mail</h2>
        <p>Merci de vous être inscrit sur ${config.app.name}. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse e-mail :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Vérifier l'e-mail</a>
        </div>
        <p>Si vous n'avez pas créé de compte chez nous, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        <p>Ce lien expirera dans 10 minutes.</p>
        <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller le lien suivant dans votre navigateur :</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">Ceci est un e-mail automatique. Veuillez ne pas y répondre.</p>
      </div>
    `
  };

  return templates[language] || templates['en'];
};

/**
 * Get password reset email template
 * @param {string} resetUrl - Reset URL
 * @param {string} language - Language code
 * @returns {string} HTML email template
 */
const getPasswordResetEmailTemplate = (resetUrl, language) => {
  const templates = {
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested a password reset for your ${config.app.name} account. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply.</p>
      </div>
    `,
    es: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Restablece tu contraseña</h2>
        <p>Has solicitado un restablecimiento de contraseña para tu cuenta de ${config.app.name}. Por favor, haz clic en el botón de abajo para restablecer tu contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p>Si no solicitaste un restablecimiento de contraseña, puedes ignorar este correo electrónico.</p>
        <p>Este enlace caducará en 1 hora.</p>
        <p>Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">Este es un correo electrónico automático. Por favor, no responda.</p>
      </div>
    `,
    fr: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">Réinitialisez votre mot de passe</h2>
        <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte ${config.app.name}. Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Réinitialiser le mot de passe</a>
        </div>
        <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si le bouton ne fonctionne pas, vous pouvez également copier et coller le lien suivant dans votre navigateur :</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">Ceci est un e-mail automatique. Veuillez ne pas y répondre.</p>
      </div>
    `
  };

  return templates[language] || templates['en'];
};