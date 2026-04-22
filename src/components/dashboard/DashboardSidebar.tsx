import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type DonorDashboardSidebarProps = {
  onLogout: () => void;
  activeItem?: "donor-dashboard" | "requests" | "new-request";
};

type MenuItem = {
  key: "donor-dashboard" | "requests" | "new-request";
  icon: string;
  label: string;
  path: string;
};

export function DonorDashboardSidebar({
  onLogout,
  activeItem = "donor-dashboard",
}: DonorDashboardSidebarProps) {
  const { roles } = useAuth();
  const hasRequesterRole = roles.includes("REQUESTER");
  const hasDonorRole = roles.includes("DONOR");
  const showDonorDashboard = hasDonorRole || roles.includes("SYSTEM_ADMIN");

  const menuItems: MenuItem[] = [
    ...(showDonorDashboard
      ? ([{ key: "donor-dashboard", icon: "dashboard", label: "Dashboard de Doador", path: "/dashboard" }] as MenuItem[])
      : []),
    { key: "requests", icon: "assignment", label: "Suas Requisições", path: "/requests" },
    ...(hasRequesterRole
      ? ([{ key: "new-request", icon: "add_circle", label: "Nova Requisição", path: "/requests/new" }] as MenuItem[])
      : []),
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col bg-[#f3f3f5] p-4 shadow-[32px_0_32px_rgba(26,28,29,0.06)] z-40">
      <div className="mb-8 px-2 py-4">
        <h1 className="headline-font text-xl font-black text-[#ae131a]">Bloodmatch</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Ajude a salvar vidas.</p>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left ${
              item.key === activeItem
                ? "bg-white text-[#ae131a] shadow-sm"
                : "text-[#444748] hover:bg-[#f9f9fb] hover:text-[#ae131a]"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-200 space-y-2">
        {hasDonorRole && (
          <button
            type="button"
            className="w-full bg-[#ae131a] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#ae131a]/20"
          >
            <span className="material-symbols-outlined">add</span>
            Doação Externa
          </button>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#444748] hover:text-[#ae131a] hover:bg-[#f9f9fb] rounded-xl"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
