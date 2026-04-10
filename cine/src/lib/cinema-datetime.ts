export const CINEMA_TIME_ZONE = "America/Bogota";

const CINEMA_UTC_OFFSET = "-05:00";

function buildCinemaIso(showDate: string, showTime: string) {
  return `${showDate}T${showTime}:00${CINEMA_UTC_OFFSET}`;
}

export function parseCinemaDateTime(showDate: string, showTime: string) {
  const value = new Date(buildCinemaIso(showDate, showTime));

  if (Number.isNaN(value.getTime())) {
    throw new Error("La fecha u hora de la funcion no es valida.");
  }

  return value;
}

export function parseCinemaDay(showDate: string) {
  const value = new Date(buildCinemaIso(showDate, "00:00"));

  if (Number.isNaN(value.getTime())) {
    throw new Error("La fecha de la funcion no es valida.");
  }

  return value;
}
