type DonorHeroSectionProps = {
  userName: string;
  bloodType: string;
  daysRemaining: number;
  livesImpacted: number;
};

export function DonorHeroSection({ userName, bloodType, daysRemaining}: DonorHeroSectionProps) {
  return (
    <section className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-red-100 opacity-60 rounded-full" />

      <div className="relative z-10 flex-1 space-y-4 text-center md:text-left">
        <span className="inline-flex px-4 py-1.5 rounded-full bg-red-100 text-[#ae131a] font-bold text-xs uppercase tracking-widest">
          Perfil de Doador
        </span>

        <h3 className="headline-font text-4xl font-extrabold leading-tight">Olá, {userName}</h3>
        

        <div className="flex gap-3 pt-2 justify-center md:justify-start">
          <div className="rounded-2xl bg-[#f3f3f5] px-5 py-3 text-center">
            <p className="headline-font text-3xl font-black text-[#ae131a]">{bloodType}</p>
            <p className="text-[10px] font-bold uppercase text-gray-500">Tipo Sanguíneo</p>
          </div>

          <div className="rounded-2xl bg-[#f3f3f5] px-5 py-3 text-center">
            <p className="headline-font text-3xl font-black text-gray-900">{daysRemaining}</p>
            <p className="text-[10px] font-bold uppercase text-gray-500">Dias Restantes</p>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="h-40 w-40 lg:h-48 lg:w-48 rounded-[2rem] overflow-hidden rotate-3 shadow-2xl">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY7rbWgZ536stRW1Pu9gZPUbZJMnX6QUkLqXn9v3UNR0cggPAwnDCijt2GX6jzgUW0NTYOGkP6m12O-bNoNUFf_ilW7sFNZSxn1ynZ3js6dwIpXZ8ujc7bX2woor8D1Jw3kjf-04QKXdn_YQr8ygYcCfWacC8K-otP4fD0L3cmNUELWM5IUSoIRt6Qhvyn9oDCVjfcSjuwhkJ4IXHp9J0VpRnUx-Xl1Onru_-9jIjWnZ87pukq1hzgWmuW9Wwj0c0ZOATpztSUdDA"
            alt="Medical Lab"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
