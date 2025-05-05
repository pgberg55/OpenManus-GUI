import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { path: "/", label: "Dashboard" },
  { path: "/run", label: "Run Task" },
  { path: "/history", label: "History" },
  { path: "/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-card border-r border-border">
      <div className="p-4">
        <h1 className="text-2xl font-bold">OpenManus GUI</h1>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}