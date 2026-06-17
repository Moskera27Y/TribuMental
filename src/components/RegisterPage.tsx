import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Lock, User } from 'lucide-react';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { useTribuApi } from '../hooks/useTribuApi';

export default function RegisterPage() {
  const api = useTribuApi();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.signin(name, email);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    console.log("Iniciando registro con Google...");
    try {
      const result = await GoogleSignIn.signIn({
        clientId: '285411670721-hjuem1ghq6i4ppbl07ikbvi81iri3kba.apps.googleusercontent.com',
      });

      console.log("Resultado de Google Login:", result);

      if (result.authentication && result.authentication.idToken) {
        const googleName = (result.givenName || "") + " " + (result.familyName || "");
        const googleEmail = result.email;
        // Registro automático: Si es con Google, creamos la cuenta de inmediato
        await api.login(googleName || "Usuario Google", googleEmail);
        navigate('/onboarding');
      } else {
        throw new Error("No se obtuvo el token de autenticación");
      }
    } catch (err: any) {
      console.error("Error en Google Login:", err);
      const errorMsg = err.code === "10"
        ? "Error de conexión con Google. Verifica tu SHA-1 en la consola."
        : (err.message || 'Error al registrarse con Google');
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
          <h2 className="text-3xl font-heading text-foreground">Crear cuenta</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Únete a la tribu y comienza tu camino con calma.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-border rounded-3xl shadow-warm sm:px-10 animate-slide-up">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Nombre completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-2xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

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
                  placeholder="mama@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
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
                {loading ? 'Creando cuenta...' : 'Comenzar gratis'}
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
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-foreground hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Al registrarte, aceptas nuestros <a href="#" className="underline">Términos</a> y <a href="#" className="underline">Privacidad</a>.
        </p>
      </div>
    </div>
  );
}
