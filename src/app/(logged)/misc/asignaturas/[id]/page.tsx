'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { GET_SUBJECT_CATALOG, CREATE_CATALOG_ITEM, DELETE_CATALOG_ITEM } from '@/graphql/subjects/operations';
import { ArrowLeft, Loader2, Plus, Server, Trash2, Calendar, Clock, Package } from 'lucide-react';
import { toast } from 'sonner';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  cycle: 'ONE_TIME' | 'WEEKLY' | 'MONTHLY';
}

export default function AsignaturaCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [cycle, setCycle] = useState<'ONE_TIME' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const cycleLabels = {
    ONE_TIME: 'Cobro Único',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual'
  };

  const loadCatalog = async () => {
    try {
      const response = await fetchGraphQL({
        query: GET_SUBJECT_CATALOG,
        variables: { subjectId }
      });
      const data = response.data || response;
      if (data && data.getSubjectCatalog) {
        setItems(data.getSubjectCatalog);
      }
    } catch (error) {
      toast.error('Error al cargar el catálogo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [subjectId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) return toast.error('Precio inválido');

    setIsSubmitting(true);
    try {
      await fetchGraphQL({
        query: CREATE_CATALOG_ITEM,
        variables: { input: { subjectId, name, description, basePrice: price, cycle } }
      });
      toast.success('Recurso añadido al catálogo');
      setName(''); setDescription(''); setBasePrice(''); setCycle('MONTHLY');
      loadCatalog();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este recurso del catálogo? Los proyectos que ya lo tengan contratado no se verán afectados.')) return;
    
    try {
      await fetchGraphQL({
        query: DELETE_CATALOG_ITEM,
        variables: { id }
      });
      toast.success('Recurso eliminado');
      loadCatalog();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver a mis asignaturas
        </button>
        <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
          <Server className="w-8 h-8 text-brand" /> Catálogo Financiero
        </h1>
        <p className="text-text-muted mt-2 max-w-2xl text-lg">
          Define los costos base de infraestructura, APIs o licencias. Los equipos podrán contratar estos servicios simulados para sus proyectos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1">
          <div className="bg-surface-primary border border-border-primary rounded-3xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand" /> Añadir Recurso
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">NOMBRE DEL SERVICIO</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  placeholder="Ej: Instancia EC2 AWS"
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-brand"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">PRECIO SIMULADO</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                  <input 
                    type="number" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required
                    placeholder="25000"
                    className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 pl-8 pr-4 text-text-primary focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">CICLO DE COBRO</label>
                <select 
                  value={cycle} onChange={(e: any) => setCycle(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-brand"
                >
                  <option value="MONTHLY">Mensual</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="ONE_TIME">Cobro Único</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">DESCRIPCIÓN (Opcional)</label>
                <textarea 
                  value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  placeholder="2 vCPUs, 4GB RAM..."
                  className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-brand resize-none"
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-text-primary text-surface-primary font-semibold py-3 rounded-xl hover:bg-text-secondary transition-colors disabled:opacity-70 mt-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar en Catálogo'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: LISTADO DE RECURSOS */}
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="bg-surface-primary border border-border-primary border-dashed rounded-3xl p-12 text-center h-full flex flex-col justify-center items-center">
              <Package className="w-12 h-12 text-border-secondary mb-4" />
              <h3 className="font-bold text-text-primary text-lg">Catálogo Vacío</h3>
              <p className="text-text-muted max-w-sm mt-1">Añade tu primer recurso desde el panel lateral para que los estudiantes puedan contratarlo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="bg-surface-primary border border-border-primary rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-4 right-4 text-text-muted hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar recurso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="flex flex-col h-full">
                    <h3 className="font-bold text-text-primary text-lg pr-8 leading-tight">{item.name}</h3>
                    {item.description && <p className="text-sm text-text-muted mt-2 line-clamp-2">{item.description}</p>}
                    
                    <div className="mt-auto pt-5 flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-black text-text-primary">{formatCurrency(item.basePrice)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold bg-surface-secondary px-2.5 py-1.5 rounded-lg text-text-muted">
                        {item.cycle === 'ONE_TIME' ? <Clock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                        {cycleLabels[item.cycle]}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}