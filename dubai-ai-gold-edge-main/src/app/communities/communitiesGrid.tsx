// "use client";

// import { useState } from "react";
// import Link from "next/link";

// type Community = {
//   id: number;
//   name: string;
//   slug: string | null;
// };

// export default function CommunityGrid({
//   communities,
// }: {
//   communities: Community[];
// }) {
//   const [query, setQuery] = useState("");

//   const filtered = communities.filter((c) =>
//     c.name.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <section className="container mx-auto px-4 py-16">
//       {/* SEARCH */}
//       <div className="max-w-md mx-auto mb-10">
//         <input
//           type="text"
//           placeholder="Search communities..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
//         />
//       </div>

//       {/* GRID */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filtered.map((c) => (
//           <div
//             key={c.id}
//             className="rounded-xl border p-6 flex flex-col justify-between hover:shadow-lg transition"
//           >
//             <h3 className="text-xl font-semibold mb-4">{c.name}</h3>

//             <div className="flex gap-3 mt-auto">
//               <Link
//                 href={`/communities/${c.slug}`}
//                 className="flex-1 text-center rounded-lg bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90"
//               >
//                 Explore Community
//               </Link>

//               <Link
//                 href={`/communities/${c.slug}/projects`}
//                 className="flex-1 text-center rounded-lg border border-primary text-primary py-2 text-sm font-medium hover:bg-primary/10"
//               >
//                 View Projects
//               </Link>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filtered.length === 0 && (
//         <p className="text-center text-muted-foreground mt-12">
//           No communities found.
//         </p>
//       )}
//     </section>
//   );
// }
