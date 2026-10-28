/**
 * Reference list of Indian institutions where psychology is taught.
 *
 * IMPORTANT: this is not a verified list of TMP students' institutions. It is a
 * neutral statement about the breadth of psychology education in India, shown
 * until enrolment records can substantiate a genuine "Our Learning Community"
 * section. No logos, no partnership or endorsement implied.
 */
const INSTITUTIONS: { name: string; place: string }[] = [
  { name: "Tata Institute of Social Sciences", place: "Mumbai" },
  { name: "Savitribai Phule Pune University", place: "Pune" },
  { name: "Symbiosis College of Arts and Commerce", place: "Pune" },
  { name: "Symbiosis School for Liberal Arts", place: "Pune" },
  { name: "SNDT Women's University", place: "Mumbai" },
  { name: "Modern College of Arts, Science and Commerce", place: "Pune" },
  { name: "Sir Parashurambhau College", place: "Pune" },
  { name: "Fergusson College", place: "Pune" },
  { name: "St. Mira's College for Girls", place: "Pune" },
  { name: "MIT World Peace University", place: "Pune" },
  { name: "University of Mumbai", place: "Mumbai" },
  { name: "St. Xavier's College", place: "Mumbai" },
  { name: "Mithibai College", place: "Mumbai" },
  { name: "Jai Hind College", place: "Mumbai" },
  { name: "Christ (Deemed to be University)", place: "Bengaluru" },
  { name: "University of Delhi", place: "Delhi" },
  { name: "Banaras Hindu University", place: "Varanasi" },
  { name: "Jamia Millia Islamia", place: "New Delhi" },
  { name: "Aligarh Muslim University", place: "Aligarh" },
  { name: "Amity University", place: "Noida" },
  { name: "Manipal Academy of Higher Education", place: "Manipal" },
  { name: "University of Hyderabad", place: "Hyderabad" },
  { name: "University of Calcutta", place: "Kolkata" },
  { name: "University of Madras", place: "Chennai" },
  { name: "Panjab University", place: "Chandigarh" },
  { name: "University of Lucknow", place: "Lucknow" },
  { name: "University of Mysore", place: "Mysuru" },
  { name: "Jain (Deemed-to-be University)", place: "Bengaluru" },
  { name: "Lovely Professional University", place: "Phagwara" },
  { name: "Gujarat University", place: "Ahmedabad" },
];

/**
 * Sits after student testimonials and before the registration call to action.
 * Visually secondary to the January courses: ivory-sage ground, small type,
 * hairline dividers, no imagery.
 */
export function HomeInstitutions() {
  return (
    <section
      aria-labelledby="institutions-heading"
      className="bg-section-mist py-section-sm sm:py-section"
    >
      <div className="container">
        <div className="max-w-2xl">
          <h2
            id="institutions-heading"
            className="font-display text-brand-heading text-2xl leading-tight tracking-tight sm:text-4xl"
          >
            Psychology Learning Across India
          </h2>
          <p className="text-brand-body mt-4 text-base leading-7">
            From established universities to regional colleges, psychology
            education brings together learners from diverse academic
            environments. The Mind Point welcomes curious minds from across
            disciplines and institutions.
          </p>
        </div>

        <ul className="border-brand-gold/25 mt-10 grid grid-cols-2 gap-x-8 border-t sm:grid-cols-3 lg:grid-cols-5">
          {INSTITUTIONS.map((institution) => (
            <li
              key={institution.name}
              className="border-brand-gold/15 border-b py-4"
            >
              <span className="text-brand-heading block text-sm leading-snug sm:text-[0.95rem]">
                {institution.name}
              </span>
              <span className="text-brand-body/70 mt-1 block text-xs">
                {institution.place}
              </span>
            </li>
          ))}
        </ul>

        <p className="text-brand-body/70 mt-6 max-w-2xl text-xs leading-relaxed">
          These institutions are listed for context about psychology education
          in India. No affiliation, endorsement or partnership is implied, and
          this is not a list of our students&rsquo; colleges.
        </p>
      </div>
    </section>
  );
}
