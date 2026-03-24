"use client";

import * as React from "react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Tooltip from "@radix-ui/react-tooltip";

type SeatAvailability = "available" | "occupied";

export type CinemaSeat = {
  id: string;
  rowLabel: string;
  columnNumber: number;
  label: string;
  state: SeatAvailability;
};

type CinemaSeatGridProps = {
  seats: CinemaSeat[];
  defaultSelectedSeatIds?: string[];
  maxSelectable?: number;
  disabled?: boolean;
  onSelectionChange?: (seatIds: string[]) => void;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function buildSeatMap(seats: CinemaSeat[]) {
  const groupedSeats = new Map<string, CinemaSeat[]>();

  for (const seat of seats) {
    const currentRow = groupedSeats.get(seat.rowLabel) ?? [];
    currentRow.push(seat);
    groupedSeats.set(seat.rowLabel, currentRow);
  }

  return Array.from(groupedSeats.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([rowLabel, rowSeats]) => ({
      rowLabel,
      seats: rowSeats.sort((left, right) => left.columnNumber - right.columnNumber),
    }));
}

export function CinemaSeatGrid({
  seats,
  defaultSelectedSeatIds = [],
  maxSelectable = 8,
  disabled = false,
  onSelectionChange,
}: CinemaSeatGridProps) {
  const [selectedSeatIds, setSelectedSeatIds] = React.useState(defaultSelectedSeatIds);
  const rows = buildSeatMap(seats);
  const occupiedSeatIds = new Set(
    seats.filter((seat) => seat.state === "occupied").map((seat) => seat.id),
  );

  function handleSelectionChange(nextSeatIds: string[]) {
    const sanitizedSeatIds = nextSeatIds.filter((seatId) => !occupiedSeatIds.has(seatId));

    if (sanitizedSeatIds.length > maxSelectable) {
      return;
    }

    setSelectedSeatIds(sanitizedSeatIds);
    onSelectionChange?.(sanitizedSeatIds);
  }

  return (
    <Tooltip.Provider delayDuration={80}>
      <section className="rounded-3xl border border-white/10 bg-[#141414] p-4 text-[#FFFFFF] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-6">
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">Sala de cine</p>
              <h2 className="text-2xl font-semibold text-white">Selecciona tus asientos</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              {selectedSeatIds.length} seleccionados
            </div>
          </div>

          <div className="grid gap-2 text-sm text-white/70 md:grid-cols-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-3 w-3 rounded-sm bg-white/80" />
              Disponible
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-3 w-3 rounded-sm bg-[#E50914]" />
              Seleccionado
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-3 w-3 rounded-sm bg-[#2F2F2F]" />
              Ocupado
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-full border border-[#E50914]/25 bg-gradient-to-r from-[#2F2F2F] via-[#3B3B3B] to-[#2F2F2F] px-6 py-3 text-center text-xs uppercase tracking-[0.5em] text-white/70">
          Pantalla
        </div>

        <ToggleGroup.Root
          type="multiple"
          value={selectedSeatIds}
          onValueChange={handleSelectionChange}
          className="space-y-2"
          disabled={disabled}
          aria-label="Selector de asientos"
        >
          {rows.map((row) => (
            <div
              key={row.rowLabel}
              className="grid grid-cols-[28px_repeat(15,minmax(0,1fr))] gap-2 md:grid-cols-[36px_repeat(15,minmax(0,1fr))]"
            >
              <span className="flex items-center justify-center text-xs font-medium text-white/45">
                {row.rowLabel}
              </span>

              {row.seats.map((seat) => {
                const isOccupied = seat.state === "occupied";

                return (
                  <Tooltip.Root key={seat.id}>
                    <Tooltip.Trigger asChild>
                      <ToggleGroup.Item
                        value={seat.id}
                        disabled={isOccupied || disabled}
                        aria-label={`Asiento ${seat.label}`}
                        className={cn(
                          "flex h-10 items-center justify-center rounded-md border text-xs font-semibold transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]",
                          "data-[state=on]:border-[#E50914] data-[state=on]:bg-[#E50914] data-[state=on]:text-white",
                          isOccupied
                            ? "cursor-not-allowed border-white/5 bg-[#2F2F2F] text-white/35"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-[#E50914]/60 hover:bg-white/10",
                        )}
                      >
                        {seat.columnNumber}
                      </ToggleGroup.Item>
                    </Tooltip.Trigger>

                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        sideOffset={8}
                        className="rounded-md border border-white/10 bg-[#1C1C1C] px-3 py-2 text-xs text-white shadow-lg"
                      >
                        {seat.label} · {isOccupied ? "Ocupado" : "Disponible"}
                        <Tooltip.Arrow className="fill-[#1C1C1C]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                );
              })}
            </div>
          ))}
        </ToggleGroup.Root>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <p className="font-medium text-white">Resumen</p>
          <p className="mt-1">
            Asientos elegidos:{" "}
            {selectedSeatIds.length > 0
              ? seats
                  .filter((seat) => selectedSeatIds.includes(seat.id))
                  .map((seat) => seat.label)
                  .join(", ")
              : "ninguno"}
          </p>
          <p className="mt-1 text-white/55">
            Puedes seleccionar hasta {maxSelectable} asientos por compra.
          </p>
        </div>
      </section>
    </Tooltip.Provider>
  );
}
