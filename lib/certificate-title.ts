/**
 * The programme line printed on a certificate under "for successfully
 * completing". It names the qualification and the course, e.g.
 * "Certificate Course in Introduction to Sports Psychology", rather than the
 * bare course name.
 */

const QUALIFICATION: Record<string, (name: string) => string> = {
  "pre-recorded": (name) =>
    /^introduction\b/i.test(name)
      ? `Certificate Course in ${name}`
      : `Certificate Course in Introduction to ${name}`,
  certificate: (name) => `Certificate in ${name}`,
  diploma: (name) => `Diploma in ${name}`,
  internship: (name) => `Internship in ${name}`,
  masterclass: (name) => `Masterclass in ${name}`,
};

export function certificateCourseTitle(
  courseName: string,
  courseType?: string,
): string {
  if (!courseType) return courseName;
  const build = QUALIFICATION[courseType];
  return build ? build(courseName) : courseName;
}
