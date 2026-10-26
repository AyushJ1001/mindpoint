// Where students typically come from, as approved by the owner. Plain names
// only: no logos, and the disclaimer below must stay with the list.
const INSTITUTIONS = [
  { name: "Christ University", place: "Bengaluru" },
  { name: "Tata Institute of Social Sciences", place: "Mumbai" },
  { name: "Modern College", place: "Pune" },
  { name: "Symbiosis", place: "Pune" },
];

export function HomeInstitutions() {
  return (
    <section
      aria-labelledby="institutions-heading"
      className="bg-secondary py-16 sm:py-20"
    >
      <div className="container">
        <h2
          id="institutions-heading"
          className="font-display max-w-2xl text-2xl leading-tight tracking-tight sm:text-4xl"
        >
          Different Campuses. One Shared Curiosity About the Mind.
        </h2>
        <ul className="border-border mt-8 grid grid-cols-2 gap-x-6 border-t border-dashed lg:grid-cols-4">
          {INSTITUTIONS.map((institution) => (
            <li
              key={institution.name}
              className="border-border border-b border-dashed py-5 lg:border-b-0"
            >
              <span className="font-display text-foreground block text-lg leading-snug sm:text-xl">
                {institution.name}
              </span>
              <span className="text-muted-foreground text-sm">
                {institution.place}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-6 max-w-2xl text-xs leading-relaxed">
          Institutions our students have studied at. Listed for context only; no
          affiliation, endorsement or partnership is implied.
        </p>
      </div>
    </section>
  );
}
