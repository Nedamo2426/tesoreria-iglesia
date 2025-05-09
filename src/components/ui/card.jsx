export function Card({ children, className = '' }) {
  return <div className={`bg-white shadow rounded-2xl p-2 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-2 ${className}`}>{children}</div>;
}