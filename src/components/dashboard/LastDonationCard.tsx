import { AppButton } from "../ui";

type LastDonationCardProps = {
  lastDonationDate: string | null;
  lastDonationHospitalName: string | null;
  hasDonation: boolean;
  onOpenDonationDetails: () => void;
  onCreateExternalDonation: () => void;
};

function formatDate(input: string | null): string {
  if (!input || input === "null") {
    return "Sem registro de doação";
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function LastDonationCard({
  lastDonationDate,
  lastDonationHospitalName,
  hasDonation,
  onOpenDonationDetails,
  onCreateExternalDonation,
}: LastDonationCardProps) {
  const formattedDate = formatDate(lastDonationDate);
  const locationText = lastDonationHospitalName || "hospital nao informado";

  return (
    <section className="col-span-12 lg:col-span-4 rounded-[2rem] p-6 lg:p-8 text-white bg-gradient-to-br from-[#ae131a] to-[#d2312f]">
      <h3 className="headline-font text-xl font-bold mb-4">Última Doação</h3>
      {hasDonation ? (
        <p className="text-red-100 text-sm mb-6">Realizada em {formattedDate} no {locationText}.</p>
      ) : (
        <p className="text-red-100 text-sm mb-6">Nenhuma doação registrada.</p>
      )}

      <AppButton
        variant="light"
        fullWidth
        className="mt-8"
        onClick={hasDonation ? onOpenDonationDetails : onCreateExternalDonation}
      >
        {hasDonation ? "Ver informações detalhadas" : "Registrar Doação Externa"}
      </AppButton>
    </section>
  );
}
