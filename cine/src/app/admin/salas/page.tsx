import { CreateRoomForm } from "@/components/admin/create-room-form";
import { db } from "@/lib/db";
import { listRooms } from "@/server/services/admin.service";

export default async function AdminRoomsPage() {
  const rooms = await listRooms(db);

  return (
    <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
      <CreateRoomForm />

      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">Infraestructura</p>
            <h2 className="mt-3 text-3xl text-white">Salas configuradas</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
            {rooms.length} salas
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <article
                key={room.id}
                className="rounded-3xl border border-white/10 bg-[#181818] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-2xl text-white">{room.name}</h3>
                    <p className="mt-2 text-sm text-white/60">
                      {room.rowsCount} filas x {room.columnsCount} columnas
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/55">
                      {room.description || "Sin descripción operacional."}
                    </p>
                  </div>

                  <div className="text-right text-sm text-white/65">
                    <p>{room.capacity} sillas</p>
                    <p>{room._count.seats} asientos generados</p>
                    <p>{room._count.screenings} funciones programadas</p>
                    <p>{room.isActive ? "Activa" : "Inactiva"}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-[#181818] p-5 text-sm text-white/60">
              No hay salas todavía. Al crear una sala se genera automáticamente su mapa de
              asientos.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
