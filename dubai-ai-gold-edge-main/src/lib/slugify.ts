export function slugify(text: string) {
  return text
    .replace(/\s+/g, "-") // Replace spaces with -
}