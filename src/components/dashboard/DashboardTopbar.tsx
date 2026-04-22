type DonorDashboardTopbarProps = {
  title: string;
  onLogout: () => void;
};

export function DonorDashboardTopbar({ title, onLogout }: DonorDashboardTopbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 h-16 bg-[#f9f9fb]/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between border-b border-gray-100">
      <h2 className="headline-font text-xl font-bold text-[#ae131a]">{title}</h2>

      <div className="flex items-center gap-3 lg:gap-5">
        

        <button type="button" className="p-2 rounded-full hover:bg-gray-100 relative">
          <span className="material-symbols-outlined text-gray-600">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ae131a] rounded-full" />
        </button>

        <button type="button" className="p-2 rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined text-gray-600">settings</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="lg:hidden rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
