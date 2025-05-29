// src/components/Clasificaciones.tsx
import React, { useState, useEffect } from 'react';

interface Clasificacion {
  id: number;
  filename: string;
  label: string;
  probability: number;
}

const Clasificaciones: React.FC = () => {
  const [items, setItems]     = useState<Clasificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string>();

  useEffect(() => {
    fetch('/api/clasificaciones')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Clasificacion[]) => setItems(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500 p-4">Cargando clasificaciones…</p>;
  if (error)   return <p className="text-red-500 p-4">Error: {error}</p>;
  if (!items.length) return <p className="text-gray-500 p-4">Sin clasificaciones</p>;

  return (
    <section className="p-6 bg-green-50 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-green-800">Últimas 5 Clasificaciones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ id, filename, label, probability }) => {
          const ts = filename.replace('.jpg', '').replace('_', ' ').slice(0, 17);
          const imgSrc = `${import.meta.env.BASE_URL}imagenes/${filename}`;

          return (
            <div
              key={id}
              className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-green-100"
            >
              <img
                src={imgSrc}
                alt={label}
                className="w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4 flex-shrink-0"
              />
              <div className="flex-1 w-full">
                <div className="text-sm text-green-600 font-semibold">ID: {id}</div>
                <div className="text-lg font-bold text-green-800">{label.toUpperCase()}</div>
                <div className="text-sm text-gray-500 mb-2">{ts}</div>
              </div>
              <div className="text-center sm:text-right mt-4 sm:mt-0">
                <div className="text-sm text-gray-600">Probabilidad</div>
                <div className="text-2xl font-bold text-green-700">
                  {(probability * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Clasificaciones;
