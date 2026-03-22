'use client';

import { useEffect, useState } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_PROFILE } from '@/graphql/misc/operations';

export default function DashboardPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await fetchGraphQL({ query: GET_PROFILE });
        setPerfil(data.me);
      } catch (err: any) {
        setError(err.message);
      }
    };

    cargarPerfil();
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!perfil) return <p>Cargando perfil... ⏳</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Panel Privado 🔒</h1>
      <p>Bienvenido, <strong className="text-blue-600">{perfil.name}</strong></p>
      <p className="text-gray-600">Email: {perfil.email}</p>
    </div>
  );
}