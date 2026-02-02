// Helper function to format price
export default function formatPrice(price?: number): string {
  if (!price) return "N/A";

  if (price >= 1000000) {
    const millions = price / 1000000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  } else if (price >= 1000) {
    const thousands = price / 1000;
    return `${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
  }

  return price.toLocaleString();
}