import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

// ─── BUTTON ──────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-orange-500 hover:bg-orange-600 text-white",
  secondary: "bg-zinc-700 hover:bg-zinc-600 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300 border border-zinc-700",
};

export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-zinc-100
          placeholder:text-zinc-500 outline-none transition-all
          ${error ? "border-red-500 focus:border-red-400" : "border-zinc-700 focus:border-orange-500"}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        rows={3}
        className={`
          w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-zinc-100
          placeholder:text-zinc-500 outline-none transition-all resize-none
          ${error ? "border-red-500 focus:border-red-400" : "border-zinc-700 focus:border-orange-500"}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

const badgeVariants = {
  default: "bg-zinc-700 text-zinc-300",
  success: "bg-emerald-900/60 text-emerald-400",
  warning: "bg-amber-900/60 text-amber-400",
  danger: "bg-red-900/60 text-red-400",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

// ─── SEARCH INPUT ─────────────────────────────────────────────────────────────

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Buscar..." }: SearchInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-orange-500 transition-all"
      />
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ message = "No hay datos disponibles", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
      <span className="text-4xl">📭</span>
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

export function ErrorState({ message = "Ocurrió un error al cargar los datos" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
      <span className="text-4xl">⚠️</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

export function SkeletonRow() {
  return (
    <div className="flex gap-4 px-4 py-3 animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-1/4" />
      <div className="h-4 bg-zinc-800 rounded w-1/3" />
      <div className="h-4 bg-zinc-800 rounded w-1/5" />
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title="Confirmar acción">
      <p className="text-sm text-zinc-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Eliminar
        </Button>
      </div>
    </Modal>
  );
}
