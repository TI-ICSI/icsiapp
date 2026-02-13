import { 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '@core/config/firebase.config';

class PasswordService {
  // Cambiar contraseña (usuario autenticado)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No hay usuario autenticado');
      }

      // Reautenticar
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Actualizar contraseña
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw new Error(this.handlePasswordError(error));
    }
  }

  // Resetear contraseña (público)
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(this.handlePasswordError(error));
    }
  }

  // Validar fortaleza de contraseña
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    requirements: {
      minLength: boolean;
      hasUpperCase: boolean;
      hasLowerCase: boolean;
      hasNumber: boolean;
      hasSpecialChar: boolean;
    };
  } {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const isValid = score >= 4; // Mínimo 4 de 5 requisitos

    return { isValid, score, requirements };
  }

  private handlePasswordError(error: any): string {
    switch (error.code) {
      case 'auth/wrong-password':
        return 'Contraseña actual incorrecta';
      case 'auth/weak-password':
        return 'La nueva contraseña es muy débil';
      case 'auth/requires-recent-login':
        return 'Por seguridad, vuelve a iniciar sesión';
      default:
        return error.message || 'Error al cambiar contraseña';
    }
  }
}

export const passwordService = new PasswordService();