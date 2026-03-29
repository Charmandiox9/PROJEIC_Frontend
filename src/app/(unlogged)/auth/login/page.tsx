'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '@/graphql/auth/operations';

function AuthContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOAuthLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_OAUTH_URL ?? 'http://localhost:4000/projeic/api/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (activeTab === 'login') {
        const data = await fetchGraphQL({
          query: LOGIN_MUTATION,
          variables: { email: form.email, password: form.password }
        });
        if (data?.login?.accessToken) {
          localStorage.setItem('projeic_accessToken', data.login.accessToken);
          window.location.href = '/projeic';
        } else {
          throw new Error('Credenciales inválidas');
        }
      } else {
        if (form.password !== form.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        const data = await fetchGraphQL({
          query: REGISTER_MUTATION,
          variables: { name: form.name, email: form.email, password: form.password }
        });
        if (data?.register?.accessToken) {
          localStorage.setItem('projeic_accessToken', data.register.accessToken);
          window.location.href = '/projeic';
        } else {
          throw new Error('Error al registrar usuario');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e3a5f] flex flex-col items-center justify-center p-4 relative">
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </Link>

      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
        <span className="text-xl font-bold tracking-tight text-white">PROJEIC</span>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Bienvenido</h1>
          <p className="text-xs text-gray-500">Plataforma de proyectos &middot; EIC</p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'login' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === 'register' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            Registrarse
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {activeTab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-gray-900"
                placeholder="Juan Pérez"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-gray-900"
              placeholder="usuario@ucn.cl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm text-gray-900"
                placeholder="••••••••"
              />
            </div>
          )}

          {activeTab === 'login' && (
            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span>Recordar sesión</span>
              </label>
              <button type="button" className="text-blue-600 hover:text-blue-800 font-medium">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#1e3a5f] hover:bg-blue-900 text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Cargando...' : activeTab === 'login' ? 'Ingresar a PROJEIC' : 'Crear cuenta'}
          </button>
        </form>

        <div className="relative my-4 text-center">
           <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-gray-200"></div>
           </div>
           <div className="relative inline-block bg-white px-4 text-xs text-gray-500">
             o
           </div>
        </div>

        <button
          onClick={handleOAuthLogin}
          type="button"
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 text-sm"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Ingresar con cuenta UCN</span>
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          Solo para miembros de la comunidad EIC
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-xl font-bold tracking-tight text-white">PROJEIC</span>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
