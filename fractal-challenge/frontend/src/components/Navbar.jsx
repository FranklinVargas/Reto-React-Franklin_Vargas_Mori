import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/my-orders", label: "Mis pedidos" },
  { to: "/add-order", label: "Crear pedido" },
  { to: "/products", label: "Inventario" },
  { to: "/add-product", label: "Nuevo producto" }
];

const linkBase =
  "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70";

const linkClasses = ({ isActive }) =>
  `${linkBase} ${
    isActive
      ? "bg-white/25 text-white shadow-lg shadow-sky-500/30"
      : "text-slate-100/80 hover:text-white hover:bg-white/10"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/my-orders" className="flex items-center gap-3 text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/90 to-indigo-500/90 font-bold text-lg shadow-lg shadow-sky-500/40">
            RM
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
              Reto React
            </span>
            <span className="text-lg font-semibold">Panel de gestión</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
