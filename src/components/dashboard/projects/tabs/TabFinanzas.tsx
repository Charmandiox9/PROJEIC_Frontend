'use client';

import { useState, useEffect } from 'react';
import { fetchGraphQL } from '@/lib/graphQLClient';
import { FUND_PROJECT, PAY_MEMBER, GET_MY_PROJECT_EARNINGS, APPLY_PENALTY, SUBSCRIBE_CATALOG_ITEM, CANCEL_SUBSCRIPTION } from '@/graphql/misc/operations';
import { GET_SUBJECT_CATALOG } from '@/graphql/subjects/operations';
import { Wallet, ArrowDownRight, ArrowUpRight, Landmark, Loader2, PlusCircle, Receipt, Users, UserCircle, AlertTriangle, ShoppingCart, PackageOpen, Activity, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectMember {
  user: { id: string; name: string; };
  role: string;
}

interface ProjectCost {
  id: string;
  name: string;
  amount: number;
  cycle: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'FUNDING' | 'PAYROLL' | 'EXPENSE' | 'PENALTY' | 'REFUND';
  description: string;
  createdAt: string;
  executorId: string;
}

interface ProjectWallet {
  id: string;
  balance: number;
  currency: string;
  transactions?: Transaction[];
  costs?: ProjectCost[];
}

interface TabFinanzasProps {
  projectId: string;
  subjectId?: string;
  isLeader: boolean;
  isSupervisor: boolean;
  wallet?: ProjectWallet | null;
  onRefresh: () => void;
  members: ProjectMember[];
}

export default function TabFinanzas({ projectId, subjectId, isLeader, isSupervisor, wallet, members, onRefresh }: TabFinanzasProps) {
  const [isFunding, setIsFunding] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundDescription, setFundDescription] = useState('');

  const [isPaying, setIsPaying] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payRecipient, setPayRecipient] = useState('');
  const [payDescription, setPayDescription] = useState('');

  const [myEarnings, setMyEarnings] = useState<number | null>(null);
  const [isPenalizing, setIsPenalizing] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState<string | null>(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount).replace('CLP', currency);
  };

  useEffect(() => {
    if (!wallet) return;

    const loadMyEarnings = async () => {
      try {
        const response = await fetchGraphQL({ query: GET_MY_PROJECT_EARNINGS, variables: { projectId } });
        const data = response.data || response;
        if (data && data.getMyProjectEarnings !== undefined) setMyEarnings(data.getMyProjectEarnings);
      } catch (error) { console.error("Error al cargar ganancias personales:", error); }
    };
    loadMyEarnings();
  }, [projectId, wallet]);

  useEffect(() => {
    if (!wallet || !subjectId || !isLeader) return;

    const loadCatalog = async () => {
      setIsLoadingCatalog(true);
      try {
        const response = await fetchGraphQL({ query: GET_SUBJECT_CATALOG, variables: { subjectId } });
        const data = response.data || response;
        if (data && data.getSubjectCatalog) setCatalogItems(data.getSubjectCatalog);
      } catch (error) { console.error("Error al cargar el catálogo:", error); }
      finally { setIsLoadingCatalog(false); }
    };
    loadCatalog();
  }, [subjectId, isLeader, wallet]);

  const handleFundProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Ingresa un monto válido mayor a 0');
    setIsFunding(true);
    try {
      await fetchGraphQL({ query: FUND_PROJECT, variables: { input: { projectId, amount, description: fundDescription || 'Fondeo inicial del supervisor' } } });
      toast.success('Fondos transferidos exitosamente');
      setFundAmount(''); setFundDescription(''); onRefresh(); 
    } catch (error: any) { toast.error(error.message || 'Error al inyectar fondos'); } 
    finally { setIsFunding(false); }
  };

  const handlePayMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Monto inválido');
    if (!payRecipient) return toast.error('Selecciona a un miembro');
    if (wallet && amount > wallet.balance) {
      const confirm = window.confirm('⚠️ La bóveda no tiene fondos suficientes. El saldo quedará en negativo. ¿Continuar?');
      if (!confirm) return;
    }
    setIsPaying(true);
    try {
      await fetchGraphQL({ query: PAY_MEMBER, variables: { input: { projectId, recipientId: payRecipient, amount, description: payDescription || 'Pago de planilla' } } });
      toast.success('Pago emitido correctamente');
      setPayAmount(''); setPayRecipient(''); setPayDescription(''); onRefresh(); 
    } catch (error: any) { toast.error(error.message); } 
    finally { setIsPaying(false); }
  };

  const handleApplyPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(penaltyAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Monto inválido');
    setIsPenalizing(true);
    try {
      await fetchGraphQL({ query: APPLY_PENALTY, variables: { input: { projectId, amount, reason: penaltyReason } } });
      toast.success('Multa aplicada correctamente');
      setPenaltyAmount(''); setPenaltyReason(''); onRefresh();
    } catch (error) { toast.error('Error al aplicar multa'); }
    finally { setIsPenalizing(false); }
  };

  const handleSubscribe = async (catalogItemId: string, price: number, name: string) => {
    if (wallet && price > wallet.balance) {
      const confirm = window.confirm(`⚠️ La bóveda no tiene fondos suficientes para contratar "${name}". Entrarán en números rojos. ¿Proceder de todos modos?`);
      if (!confirm) return;
    }

    setSubscribingTo(catalogItemId);
    try {
      await fetchGraphQL({
        query: SUBSCRIBE_CATALOG_ITEM,
        variables: { input: { projectId, catalogItemId } }
      });
      toast.success(`Recurso "${name}" contratado exitosamente.`);
      onRefresh(); 
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la contratación.');
    } finally {
      setSubscribingTo(null);
    }
  };

  const handleCancelSubscription = async (costId: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas cancelar la suscripción a "${name}"? El servicio se apagará y no se volverá a cobrar.`)) return;

    setIsCanceling(costId);
    try {
      await fetchGraphQL({
        query: CANCEL_SUBSCRIPTION,
        variables: { input: { projectId, costId } }
      });
      toast.success(`Suscripción a "${name}" cancelada exitosamente.`);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar la suscripción');
    } finally {
      setIsCanceling(null);
    }
  };

  if (!wallet) {
    return (
      <div className="p-12 text-center bg-surface-primary rounded-3xl border border-border-primary border-dashed max-w-2xl mx-auto mt-8">
        <Landmark className="w-16 h-16 mx-auto text-border-secondary mb-4" />
        <h3 className="text-xl font-bold text-text-primary">Proyecto No Institucional</h3>
        <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
          El módulo de finanzas simuladas solo está disponible para proyectos creados bajo el alero de una asignatura universitaria.
        </p>
      </div>
    );
  }

  const hasAdminActions = isLeader || isSupervisor;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* SECCIÓN 1: RESUMEN FINANCIERO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-brand/90 to-brand-hover p-8 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <Wallet className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10" />
          <div className="relative z-10">
            <p className="text-brand-50 font-medium text-sm flex items-center gap-2 uppercase tracking-wider">
              <Landmark className="w-4 h-4" /> Balance Institucional
            </p>
            <h2 className="text-4xl lg:text-5xl font-black mt-2 mb-1 tracking-tight truncate">
              {formatCurrency(wallet.balance, '')} <span className="text-xl lg:text-2xl text-brand-100 font-medium">{wallet.currency}</span>
            </h2>
            <p className="text-sm text-brand-100 mt-4 max-w-sm">
              {wallet.balance >= 0 
                ? 'Fondos disponibles para pagos de planillas y recursos.'
                : '⚠️ Atención: El proyecto se encuentra en números rojos.'}
            </p>
          </div>
        </div>

        <div className="bg-surface-primary p-8 rounded-3xl border border-border-primary shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-500/10 p-3 rounded-2xl text-green-600">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-lg">Mis Ingresos del Proyecto</h3>
              <p className="text-sm text-text-muted">Total ganado por honorarios</p>
            </div>
          </div>
          <div>
            {myEarnings === null ? (
              <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
            ) : (
              <h2 className="text-4xl lg:text-5xl font-black text-green-600 truncate">
                {formatCurrency(myEarnings, wallet.currency)}
              </h2>
            )}
          </div>
        </div>
      </div>

      {/* SUSCRIPCIONES ACTIVAS */}
      {wallet.costs && wallet.costs.length > 0 && (
        <div className="bg-surface-primary p-6 rounded-3xl border border-border-primary shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-text-primary text-lg">Suscripciones Activas</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wallet.costs.map(cost => (
              <div key={cost.id} className="bg-surface-secondary border border-border-primary rounded-2xl p-4 flex flex-col relative overflow-hidden group">
                {isLeader && (
                  <button 
                    onClick={() => handleCancelSubscription(cost.id, cost.name)}
                    disabled={isCanceling === cost.id}
                    className="absolute top-2 right-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors z-20 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Cancelar Suscripción"
                  >
                    {isCanceling === cost.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <X className="w-4 h-4" />}
                  </button>
                )}
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -z-0"></div>
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>

                <div className="relative z-10">
                  <p className="font-bold text-text-primary text-sm line-clamp-1">{cost.name}</p>
                  <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                    {cost.cycle === 'WEEKLY' ? 'Semanal' : 'Mensual'}
                  </p>
                  <div className="mt-4 pt-3 border-t border-border-primary">
                    <span className="font-bold text-lg text-text-primary">
                      {formatCurrency(cost.amount, wallet.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: ACCIONES Y LIBRO MAYOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {hasAdminActions && (
          <div className="lg:col-span-1 space-y-6">
            
            {/* SUPERVISOR: INYECTAR Y MULTAR */}
            {isSupervisor && (
              <>
                <div className="bg-surface-primary p-6 rounded-2xl border border-border-primary shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <PlusCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold text-text-primary">Inyectar Presupuesto</h3>
                  </div>
                  <form onSubmit={handleFundProject} className="space-y-4">
                    <div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                        {/* 🔥 MEJORA 2: Inputs deshabilitados durante la carga */}
                        <input type="number" min="1" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} disabled={isFunding} className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 pl-8 pr-4 text-text-primary focus:ring-2 focus:ring-brand disabled:opacity-50" placeholder="Ej: 50000" required />
                      </div>
                    </div>
                    <div>
                      <input type="text" value={fundDescription} onChange={(e) => setFundDescription(e.target.value)} disabled={isFunding} className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-brand disabled:opacity-50" placeholder="Descripción (Ej: Presupuesto inicial)" />
                    </div>
                    <button type="submit" disabled={isFunding} className="w-full flex items-center justify-center gap-2 bg-text-primary text-surface-primary font-semibold py-3 rounded-xl hover:bg-text-secondary transition-colors disabled:opacity-70">
                      {isFunding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aprobar Transacción'}
                    </button>
                  </form>
                </div>

                <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 shadow-sm mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-red-600 dark:text-red-400">Aplicar Multa</h3>
                  </div>
                  <form onSubmit={handleApplyPenalty} className="space-y-4">
                    <div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                        <input type="number" min="1" value={penaltyAmount} onChange={(e) => setPenaltyAmount(e.target.value)} disabled={isPenalizing} required className="w-full bg-surface-primary border border-border-primary rounded-xl py-2.5 pl-8 pr-4 text-text-primary focus:ring-2 focus:ring-red-500 disabled:opacity-50" placeholder="Ej: 10000" />
                      </div>
                    </div>
                    <div>
                      <input type="text" value={penaltyReason} onChange={(e) => setPenaltyReason(e.target.value)} disabled={isPenalizing} required className="w-full bg-surface-primary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-red-500 disabled:opacity-50" placeholder="Motivo (Ej: Bug crítico)" />
                    </div>
                    <button type="submit" disabled={isPenalizing} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70">
                      {isPenalizing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Descontar de la Bóveda'}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* LÍDER: PAGOS Y TIENDA */}
            {isLeader && (
              <>
                <div className="bg-surface-primary p-6 rounded-2xl border border-border-primary shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-text-primary">Pago de Planilla</h3>
                  </div>
                  <form onSubmit={handlePayMember} className="space-y-4">
                    <div>
                      <select value={payRecipient} onChange={(e) => setPayRecipient(e.target.value)} disabled={isPaying} className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-brand disabled:opacity-50" required>
                        <option value="">-- Seleccionar Destinatario --</option>
                        {members.map(m => (<option key={m.user.id} value={m.user.id}>{m.user.name} ({m.role})</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                        <input type="number" min="1" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} disabled={isPaying} className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 pl-8 pr-4 text-text-primary focus:ring-2 focus:ring-brand disabled:opacity-50" placeholder="Ej: 15000" required />
                      </div>
                    </div>
                    <div>
                      <input type="text" value={payDescription} onChange={(e) => setPayDescription(e.target.value)} disabled={isPaying} className="w-full bg-surface-secondary border border-border-primary rounded-xl py-2.5 px-4 text-text-primary focus:ring-2 focus:ring-brand disabled:opacity-50" placeholder="Concepto (Ej: Pago Sprint 1)" />
                    </div>
                    <button type="submit" disabled={isPaying} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70">
                      {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Emitir Pago'}
                    </button>
                  </form>
                </div>

                {/* BOTÓN PARA ABRIR MODAL DEL CATÁLOGO */}
                <div className="bg-surface-primary p-6 rounded-2xl border border-border-primary shadow-sm mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-text-primary">Contratar Recursos</h3>
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    Adquiere infraestructura simulada del catálogo del profesor para el proyecto.
                  </p>
                  <button 
                    onClick={() => setIsCatalogModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <PackageOpen className="w-5 h-5" />
                    Ver Catálogo de Servicios
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* LIBRO MAYOR */}
        <div className={`bg-surface-primary rounded-2xl border border-border-primary overflow-hidden shadow-sm h-fit ${hasAdminActions ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="p-6 border-b border-border-primary flex justify-between items-center bg-surface-secondary/30">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-text-primary" />
              <h3 className="font-bold text-text-primary">Libro Mayor (Historial)</h3>
            </div>
          </div>

          {(!wallet.transactions || wallet.transactions.length === 0) ? (
            <div className="p-12 text-center text-text-muted flex flex-col items-center">
              <Receipt className="w-12 h-12 mb-3 text-border-secondary" />
              <p>No hay movimientos registrados.</p>
              <p className="text-xs mt-1">Las transacciones aparecerán aquí de forma inmutable.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-primary max-h-[600px] overflow-y-auto nice-scrollbar">
              {wallet.transactions.map((tx) => {
                const isIncome = tx.type === 'FUNDING' || tx.type === 'REFUND';
                return (
                  <li key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-surface-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${isIncome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">{tx.description}</p>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                          <span className="uppercase tracking-wider font-medium">{tx.type}</span>
                          <span>•</span>
                          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold whitespace-nowrap ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), wallet.currency)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* MODAL DEL CATÁLOGO DE SERVICIOS */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-primary rounded-3xl border border-border-primary shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-border-primary flex items-center justify-between bg-surface-secondary/50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg leading-tight">Tienda de Recursos</h3>
                  <p className="text-xs text-text-muted">Asignatura institucional</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCatalogModalOpen(false)} 
                className="text-text-muted hover:text-text-primary bg-surface-primary hover:bg-border-primary p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto nice-scrollbar flex-1">
              <div className="space-y-3">
                {isLoadingCatalog ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
                ) : !subjectId ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium text-text-primary">Proyecto sin asignatura</p>
                    <p className="text-xs text-text-muted mt-1 max-w-[250px] mx-auto">Este proyecto no está vinculado a una asignatura institucional, por lo que no hay catálogo disponible.</p>
                  </div>
                ) : catalogItems.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center opacity-50">
                    <PackageOpen className="w-12 h-12 mb-3 text-text-muted" />
                    <h4 className="font-semibold text-text-primary mb-1">Catálogo Vacío</h4>
                    <p className="text-xs text-text-muted max-w-[200px]">El profesor aún no ha añadido recursos para esta asignatura.</p>
                  </div>
                ) : (
                  catalogItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => handleSubscribe(item.id, item.basePrice, item.name)}
                      disabled={subscribingTo !== null}
                      className="w-full flex justify-between items-center p-4 border border-border-primary rounded-2xl hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left disabled:opacity-50 group"
                      title={item.description}
                    >
                      <div>
                        <p className="font-bold text-sm text-text-primary flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                          {item.name}
                          {subscribingTo === item.id && <Loader2 className="w-3 h-3 animate-spin text-purple-500" />}
                        </p>
                        <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></span>
                          {item.cycle === 'ONE_TIME' ? 'Cobro Único' : item.cycle === 'WEEKLY' ? 'Semanal' : 'Mensual'}
                        </p>
                      </div>
                      <span className="font-black text-purple-600 bg-purple-500/10 px-3 py-1.5 rounded-lg">
                        {formatCurrency(item.basePrice, wallet.currency)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}