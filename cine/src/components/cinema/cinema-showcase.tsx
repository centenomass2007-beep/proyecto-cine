"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

import { CinemaSeatGrid, type CinemaSeat } from "@/components/cinema/cinema-seat-grid";

type CinemaShowcaseProps = {
  screeningId: number;
  seats: CinemaSeat[];
  pricePerSeat: number;
  screeningLabel: string;
  movieTitle: string;
  roomLabel: string;
};

type PurchasedTicket = {
  id: string;
  code: string;
  status: "ACTIVE" | "USED";
  totalAmount: string | number;
  seatsCount: number;
  purchasedAt: string;
  details: Array<{
    id: string;
    seat: {
      id: number;
      label: string;
    };
  }>;
  screening: {
    id: number;
    movie: {
      title: string;
    };
    room: {
      id: number;
      name: string;
    };
  };
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function CinemaShowcase({
  screeningId,
  seats,
  pricePerSeat,
  screeningLabel,
  movieTitle,
  roomLabel,
}: CinemaShowcaseProps) {
  const router = useRouter();
  const [selectedSeatIds, setSelectedSeatIds] = React.useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [purchasedTicket, setPurchasedTicket] = React.useState<PurchasedTicket | null>(null);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle");
  const [isPending, startTransition] = React.useTransition();

  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.id));
  const total = selectedSeats.length * pricePerSeat;
  const purchasedSeatLabels =
    purchasedTicket?.details.map((detail) => detail.seat.label).join(", ") ?? "";
  const purchasedTotal = purchasedTicket
    ? currencyFormatter.format(Number(purchasedTicket.totalAmount))
    : null;

  React.useEffect(() => {
    if (!purchasedTicket?.code) {
      setQrDataUrl(null);
      return;
    }

    let isMounted = true;

    QRCode.toDataURL(purchasedTicket.code, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#141414",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrDataUrl(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [purchasedTicket?.code]);

  React.useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyState]);

  function canOpenConfirmation() {
    return (
      selectedSeats.length > 0 &&
      customerName.trim().length > 0 &&
      customerEmail.trim().length > 0
    );
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      setPurchasedTicket(null);
      setQrDataUrl(null);
      setCopyState("idle");
      setError(null);
    }
  }

  async function handleCopyCode() {
    if (!purchasedTicket?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(purchasedTicket.code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  function handlePurchase() {
    setFeedback(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/purchases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            screeningId,
            seatIds: selectedSeats.map((seat) => Number(seat.id)),
            customerName,
            customerEmail,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message ?? "No fue posible completar la compra.");
          return;
        }

        setPurchasedTicket(result);
        setFeedback(
          `Compra exitosa. Tiquete ${result.code} generado con QR para validación.`,
        );
        setSelectedSeatIds([]);
        router.refresh();
      } catch {
        setError("No fue posible comunicarse con el servidor para emitir el tiquete.");
      }
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
      <CinemaSeatGrid seats={seats} onSelectionChange={setSelectedSeatIds} />

      <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogChange}>
        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">Compra</p>
          <h3 className="mt-3 text-3xl font-semibold">{movieTitle}</h3>
          <p className="mt-2 text-sm text-white/65">{screeningLabel}</p>

          <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-[#1A1A1A] p-5">
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Asientos</span>
              <span>{selectedSeats.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Precio unitario</span>
              <span>{currencyFormatter.format(pricePerSeat)}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-[#E50914]">{currencyFormatter.format(total)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-[#161616] p-5">
            <p className="text-sm font-medium text-white">Selección actual</p>
            <p className="mt-2 text-sm text-white/65">
              {selectedSeats.length > 0
                ? selectedSeats.map((seat) => seat.label).join(", ")
                : "Todavía no has elegido asientos."}
            </p>
          </div>

          <div className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-[#161616] p-5">
            <p className="text-sm font-medium text-white">Datos del comprador</p>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Nombre completo"
              className="h-12 rounded-2xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#E50914]"
            />
            <input
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              type="email"
              placeholder="correo@ejemplo.com"
              className="h-12 rounded-2xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition placeholder:text-white/30 focus:border-[#E50914]"
            />
          </div>

          <Dialog.Trigger asChild>
            <button
              type="button"
              disabled={!canOpenConfirmation()}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35"
            >
              Confirmar compra
            </button>
          </Dialog.Trigger>

          {(feedback || error) && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                error
                  ? "border-[#E50914]/25 bg-[#E50914]/10 text-white"
                  : "border-white/10 bg-white/5 text-white/80"
              }`}
            >
              {error ?? feedback}
            </div>
          )}

          <p className="mt-3 text-xs leading-6 text-white/45">
            La confirmación visual existe en frontend, pero la reserva real debe pasar por la
            transacción del backend para bloquear asientos y evitar sobreventa.
          </p>
        </aside>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/10 bg-[#141414] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] focus:outline-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-2xl font-semibold">
                  {purchasedTicket ? "Tiquete emitido" : "Confirmar compra"}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 text-white/65">
                  {purchasedTicket
                    ? "Presenta este QR en el ingreso. El escáner leerá el código del tiquete para validarlo una sola vez."
                    : "Revisa la función, los asientos elegidos y el total antes de enviar la compra al backend."}
                </Dialog.Description>
              </div>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white/70 transition hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </Dialog.Close>
            </div>

            {purchasedTicket ? (
              <>
                <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[28px] border border-white/10 bg-white p-5 text-[#141414] shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
                    <div className="rounded-[24px] border border-[#141414]/10 bg-white p-4">
                      {qrDataUrl ? (
                        <Image
                          src={qrDataUrl}
                          alt={`QR del tiquete ${purchasedTicket.code}`}
                          width={320}
                          height={320}
                          unoptimized
                          className="mx-auto h-auto w-full max-w-[280px]"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center rounded-[20px] bg-[#F3F3F3] text-sm text-[#141414]/60">
                          Generando QR...
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.32em] text-[#141414]/55">
                      Código listo para escanear
                    </p>
                  </div>

                  <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-white/72">
                    <div className="rounded-3xl border border-[#E50914]/25 bg-[#E50914]/10 px-4 py-3 text-sm text-white">
                      El QR contiene el código exacto del tiquete para validación en la entrada.
                    </div>

                    <div className="grid gap-4 rounded-3xl border border-white/10 bg-[#191919] p-5">
                      <div className="flex items-center justify-between gap-4">
                        <span>Código</span>
                        <span className="text-right font-semibold text-white">
                          {purchasedTicket.code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Película</span>
                        <span className="text-right font-medium text-white">
                          {purchasedTicket.screening.movie.title}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Función</span>
                        <span className="text-right font-medium text-white">{screeningLabel}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Sala</span>
                        <span className="text-right font-medium text-white">
                          {purchasedTicket.screening.room.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Asientos</span>
                        <span className="text-right font-medium text-white">
                          {purchasedSeatLabels}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Estado</span>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                          {purchasedTicket.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Total</span>
                        <span className="text-right text-lg font-semibold text-[#E50914]">
                          {purchasedTotal}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                      >
                        {copyState === "copied"
                          ? "Código copiado"
                          : copyState === "error"
                            ? "No se pudo copiar"
                            : "Copiar código"}
                      </button>
                      <Dialog.Close asChild>
                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D]"
                        >
                          Cerrar
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                  <div className="flex items-center justify-between gap-4">
                    <span>Película</span>
                    <span className="text-right font-medium text-white">{movieTitle}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Función</span>
                    <span className="text-right font-medium text-white">{screeningLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Asientos</span>
                    <span className="text-right font-medium text-white">
                      {selectedSeats.map((seat) => seat.label).join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Sala</span>
                    <span className="text-right font-medium text-white">{roomLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Comprador</span>
                    <span className="text-right font-medium text-white">{customerName}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Total</span>
                    <span className="text-right text-lg font-semibold text-[#E50914]">
                      {currencyFormatter.format(total)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Seguir eligiendo
                    </button>
                  </Dialog.Close>
                  <button
                    type="button"
                    onClick={handlePurchase}
                    disabled={isPending}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#E50914] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#F6121D]"
                  >
                    {isPending ? "Procesando compra..." : "Comprar boletas"}
                  </button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
