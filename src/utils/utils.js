export function calculationImageSize(imageSize) {
  const result = imageSize / 1024;
  return `${Math.round(result)} кб`;
}

export const formatUploadedAt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
}).format(new Date());
