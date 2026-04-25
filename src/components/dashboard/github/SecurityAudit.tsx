import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function SecurityAudit({ alerts }: { alerts: any[] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const safeAlerts = alerts || [];

  return (
    <div className="bg-surface-primary border border-border-primary rounded-xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold flex items-center gap-2 text-lg">
          {safeAlerts.length > 0 ? <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> : <ShieldCheck className="w-5 h-5 text-green-500" />} 
          Auditoría de Seguridad
        </h4>
        {safeAlerts.length === 0 && (
          <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded font-bold uppercase tracking-wider">
            100% Seguro
          </span>
        )}
      </div>
      
      <div className="grid gap-3">
        {safeAlerts.map((alert: any) => (
          <div key={alert.number} className="p-3 bg-surface-secondary border border-border-secondary rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-sm flex items-center gap-2 text-text-primary">
                {alert.package_name}
                <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-black tracking-wider ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </p>
              <p className="text-[10px] text-text-muted mt-1">Reportado: {new Date(alert.created_at).toLocaleDateString()}</p>
            </div>
            <a href={alert.html_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded uppercase transition-colors shrink-0">
              Reparar
            </a>
          </div>
        ))}
        {safeAlerts.length === 0 && (
          <div className="p-4 text-center text-sm text-text-muted border border-dashed border-border-secondary rounded-lg">
            No hay vulnerabilidades detectadas en dependencias.
          </div>
        )}
      </div>
    </div>
  );
}