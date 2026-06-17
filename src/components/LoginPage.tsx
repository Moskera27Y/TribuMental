import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Lock } from 'lucide-react';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { useTribuApi } from '../hooks/useTribuApi';

export default function LoginPage() {
  const api = useTribuApi();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.login("Usuario", email);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    console.log("Iniciando Google Login nativo...");
    try {
      const result = await GoogleSignIn.signIn({
        clientId: '285411670721-hjuem1ghq6i4ppbl07ikbvi81iri3kba.apps.googleusercontent.com',
      });

      console.log("Resultado de Google Login:", result);

      if (result.authentication && result.authentication.idToken) {
        const googleEmail = result.email;
        await api.login(result.givenName || "Usuario Google", googleEmail);
        navigate('/dashboard');
      } else {
        throw new Error("No se obtuvo el token de autenticación");
      }
    } catch (err: any) {
      console.error("Error en Google Login:", err);
      const errorMsg = err.code === "10"
        ? "Error 10: Verifica que tu SHA-1 esté en Google Cloud y el Client ID sea correcto."
        : (err.message || 'Error al iniciar sesión con Google');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft size={16} />
          Volver al inicio
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🌸</span>
          <h2 className="text-3xl font-heading text-foreground">Bienvenida de nuevo</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Nos alegra verte de nuevo en tu espacio.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-border rounded-3xl shadow-warm sm:px-10 animate-slide-up">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-2xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-muted-foreground hover:text-foreground transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-2xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-background bg-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground transition-all disabled:opacity-50"
              >
                {loading ? 'Iniciando sesión...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">O continuar con</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full inline-flex justify-center py-3 px-4 rounded-full border border-border bg-background text-sm font-medium text-foreground hover:bg-muted/50 transition-colors gap-2 items-center"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                <span>Google</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-medium text-foreground hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
