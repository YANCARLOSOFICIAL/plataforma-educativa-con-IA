import resend
from ..config import settings
from typing import Optional


class EmailService:
    """
    Servicio para envío de emails usando Resend
    """

    def __init__(self):
        if settings.RESEND_API_KEY:
            resend.api_key = settings.RESEND_API_KEY

    def send_password_reset_email(
        self,
        to_email: str,
        user_name: str,
        reset_token: str
    ) -> bool:
        """
        Envía un email de recuperación de contraseña

        Args:
            to_email: Email del destinatario
            user_name: Nombre del usuario
            reset_token: Token de recuperación

        Returns:
            bool: True si se envió exitosamente, False en caso contrario
        """
        if not settings.RESEND_API_KEY:
            print(f"⚠️ RESEND_API_KEY no configurada. Email no enviado.")
            print(f"📧 Email que se habría enviado a: {to_email}")
            print(f"🔗 Token de reset: {reset_token}")
            return False

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                    text-align: center;
                }}
                .header h1 {{
                    color: #ffffff;
                    margin: 0;
                    font-size: 28px;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .content h2 {{
                    color: #333;
                    margin-top: 0;
                }}
                .button {{
                    display: inline-block;
                    padding: 14px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    padding: 20px 30px;
                    background-color: #f8f8f8;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Recuperación de Contraseña</h1>
                </div>
                <div class="content">
                    <h2>Hola {user_name},</h2>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                    <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>

                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Restablecer Contraseña</a>
                    </div>

                    <div class="warning">
                        <strong>⚠️ Importante:</strong> Este enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.
                    </div>

                    <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña seguirá siendo la misma.</p>

                    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                        <a href="{reset_link}" style="color: #667eea; word-break: break-all;">{reset_link}</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Este es un email automático, por favor no respondas.</p>
                    <p>&copy; 2025 EduPlatform. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            params = {
                "from": settings.FROM_EMAIL,
                "to": [to_email],
                "subject": "🔐 Recuperación de Contraseña - EduPlatform",
                "html": html_content,
            }

            response = resend.Emails.send(params)
            print(f"✅ Email de recuperación enviado a {to_email}")
            print(f"📧 ID: {response.get('id', 'N/A')}")
            return True

        except Exception as e:
            print(f"❌ Error enviando email a {to_email}: {str(e)}")
            return False

    def send_welcome_email(
        self,
        to_email: str,
        user_name: str
    ) -> bool:
        """
        Envía un email de bienvenida (opcional para futuro)

        Args:
            to_email: Email del destinatario
            user_name: Nombre del usuario

        Returns:
            bool: True si se envió exitosamente
        """
        if not settings.RESEND_API_KEY:
            print(f"⚠️ RESEND_API_KEY no configurada.")
            return False

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                    text-align: center;
                }}
                .header h1 {{
                    color: #ffffff;
                    margin: 0;
                    font-size: 28px;
                }}
                .content {{
                    padding: 40px 30px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👋 ¡Bienvenido a EduPlatform!</h1>
                </div>
                <div class="content">
                    <h2>Hola {user_name},</h2>
                    <p>¡Gracias por registrarte en EduPlatform!</p>
                    <p>Estamos emocionados de tenerte con nosotros. Ahora puedes comenzar a crear contenido educativo con IA.</p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            params = {
                "from": settings.FROM_EMAIL,
                "to": [to_email],
                "subject": "👋 ¡Bienvenido a EduPlatform!",
                "html": html_content,
            }

            response = resend.Emails.send(params)
            print(f"✅ Email de bienvenida enviado a {to_email}")
            return True

        except Exception as e:
            print(f"❌ Error enviando email de bienvenida: {str(e)}")
            return False


# Instancia global del servicio
email_service = EmailService()
