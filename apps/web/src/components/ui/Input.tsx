import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

const base = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
      <input ref={ref} className={`${base} ${error ? 'border-red-500' : ''} ${className}`} {...props}/>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
      <textarea ref={ref} rows={4} className={`${base} resize-none ${error ? 'border-red-500' : ''} ${className}`} {...props}/>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}
export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
      <select className={`${base} ${error ? 'border-red-500' : ''} ${className}`} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
