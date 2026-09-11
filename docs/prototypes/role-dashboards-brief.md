# Role dashboard prototype brief

Question: Which account-level dashboard structure helps Students, Faculty, and Administrators find their next permitted action without duplicating the detailed workspace behind it?

This is a throwaway, read-only prototype. It uses synthetic data and makes no backend mutations. Three structures are switchable through `?variant=A|B|C`; `?role=student|faculty|administrator` changes the active role. The bottom switcher is development-only because the entire route returns no interface in production.

## Selected structure

Variant A, Role desk, is the selected direction. It keeps one shared shell for a person with several Roles, but each tab has separately authorized counts and links. A single recommended next action leads, a short attention list follows, and a narrow watchlist provides context. Detailed Course, Faculty-review, and Administrator workflows remain in their existing destinations.

## Alternatives retained

- Variant B, Daily agenda, sequences work by time. It is useful when deadlines dominate, but weak for undated blockers and broad Administrator monitoring.
- Variant C, Domain lanes, separates immediate work, continuation, and monitoring. It makes categories easy to scan but gives the system too much freedom to look like a second work queue.

## Surface contract

Mode: Operate.

The dashboard must state role and scope, reveal only authorized counts, explain the next valid action, show urgent exceptions without gamification, and route every row to its authoritative record. The Student view summarizes Courses, deadlines, answers, and Certificate readiness. The Faculty view summarizes the existing Faculty work queue. The Administrator view summarizes publication, access, rights, accessibility, staffing, migration, and certificate exceptions. No dashboard action silently changes an authoritative record.
