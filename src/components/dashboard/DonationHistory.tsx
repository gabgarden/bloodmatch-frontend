export type DonationHistoryItem = {
	id: string;
	location: string;
	donationDate: string | null;
	status: string;
};

type DonationHistoryProps = {
	items: DonationHistoryItem[];
	isLoading: boolean;
	errorMessage: string | null;
};

function formatDate(input: string | null): string {
	if (!input) {
		return "Data nao informada";
	}

	const parsed = new Date(input);
	if (Number.isNaN(parsed.getTime())) {
		return input;
	}

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(parsed);
}

function getStatusVisual(status: string): { label: string; className: string } {
	const normalized = status.trim().toUpperCase();

	if (["COMPLETED", "CONCLUIDO", "CONCLUÍDO", "DONE"].includes(normalized)) {
		return {
			label: "Concluido",
			className: "bg-green-100 text-green-700",
		};
	}

	if (["SCHEDULED", "PENDING", "AGENDADO", "EM_ANDAMENTO"].includes(normalized)) {
		return {
			label: "Em andamento",
			className: "bg-amber-100 text-amber-700",
		};
	}

	if (["CANCELLED", "CANCELED", "CANCELADO"].includes(normalized)) {
		return {
			label: "Cancelada",
			className: "bg-rose-100 text-rose-700",
		};
	}

	return {
		label: status || "Desconhecido",
		className: "bg-gray-200 text-gray-700",
	};
}

export function DonationHistory({ items, isLoading, errorMessage }: DonationHistoryProps) {
	return (
		<section className="space-y-4">
			<h3 className="headline-font text-2xl font-extrabold">Histórico de Doações</h3>

			{isLoading && (
				<div className="rounded-[2rem] bg-[#f3f3f5] px-6 py-8 text-sm text-gray-600">Carregando histórico de doações...</div>
			)}

			{!isLoading && errorMessage && (
				<div className="rounded-[2rem] border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">{errorMessage}</div>
			)}

			{!isLoading && !errorMessage && items.length === 0 && (
				<div className="rounded-[2rem] bg-[#f3f3f5] px-6 py-8 text-sm text-gray-600">Nenhuma doação registrada para este doador.</div>
			)}

			{!isLoading && !errorMessage && items.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{items.map((item) => {
						const statusVisual = getStatusVisual(item.status);

						return (
							<article key={item.id} className="rounded-[1.5rem] bg-[#f3f3f5] p-5 flex flex-col gap-4 hover:bg-white transition-colors">
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-center gap-3 min-w-0">
										<div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
											<span className="material-symbols-outlined text-[#ae131a] scale-75">location_on</span>
										</div>
										<p className="text-sm font-bold text-gray-900 truncate">{item.location}</p>
									</div>

									<span className={`rounded-full px-3 py-1 text-[10px] uppercase font-black ${statusVisual.className}`}>
										{statusVisual.label}
									</span>
								</div>

								<div className="text-xs text-gray-500 uppercase tracking-widest">Data da doação</div>
								<div className="text-sm text-gray-700">{formatDate(item.donationDate)}</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}
