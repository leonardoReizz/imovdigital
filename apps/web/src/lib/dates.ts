const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export function formatListingDate(createdAt: string | Date, updatedAt: string | Date): string {
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  const now = new Date();

  const createdStr = `${created.getDate()} de ${MONTHS[created.getMonth()]} de ${created.getFullYear()}`;

  const diffMs = now.getTime() - updated.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let updatedStr: string;
  if (diffMin < 1) updatedStr = 'agora';
  else if (diffMin < 60) updatedStr = `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  else if (diffHours < 24) updatedStr = `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  else if (diffDays < 30) updatedStr = `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  else updatedStr = `${updated.getDate()} de ${MONTHS[updated.getMonth()]} de ${updated.getFullYear()}`;

  if (diffMin < 1) {
    return `Anúncio criado em ${createdStr}.`;
  }

  return `Anúncio criado em ${createdStr}, atualizado ${updatedStr}.`;
}
