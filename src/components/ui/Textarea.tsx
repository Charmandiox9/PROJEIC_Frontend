interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full px-3 py-2 text-sm border border-border-secondary rounded-lg bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors placeholder:text-text-muted resize-none ${className ?? ''}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
