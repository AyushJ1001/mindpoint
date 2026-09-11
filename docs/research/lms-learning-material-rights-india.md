# Rights and access rules for LMS learning materials in India

_Research date: 11 September 2026_

This note is product-planning research, not legal advice. It considers an India-based, paid LMS for adults. Mind Point should have Indian copyright counsel approve the policy and faculty agreement before launch, particularly the use of the education exception, course recordings, and the takedown process.

## Decision

Build the LMS around a **rights-aware material record**, not an assumption that educational use makes copying lawful.

- Default to a stable link (preferably a DOI, publisher page, library permalink, or creator's official page) when Mind Point does not have documented permission to copy the file.
- Permit Mind Point-hosted files only when the uploader records one of: Mind Point ownership; a written licence or permission; a compatible open licence; verified public-domain status; or a specific, counsel-approved statutory exception.
- Restrict non-public material to the enrolled course run and licensed access period. Access control is a licence-compliance measure, not a substitute for permission.
- Make download, print, adaptation/translation, and onward-sharing separate rights flags. "Viewable in the LMS" must not silently imply any of them.
- Use only a platform's supported embed player. Do not download, re-host, proxy, or strip controls from third-party video merely because embedding is available.
- Record live sessions only after obtaining express contractual permission from faculty and a clear notice/consent flow for students. Give faculty a way to pause recording, and avoid retaining student questions or disclosures longer than needed.
- Preserve attribution and rights-management information, support prompt disablement/takedown, and keep the rights evidence and action log after an asset is withdrawn.

This approach is deliberately more conservative than the outer boundary of India's education exceptions. It gives the product a repeatable rule while reserving fact-sensitive exceptions for review.

## Why a link, an embed, and a hosted copy are different

The Copyright Act gives rightsholders exclusive rights that include reproducing a work, issuing copies, adapting or translating it, and communicating it to the public. The Act defines communication to the public broadly enough to include on-demand availability, even if nobody actually accesses the work. Uploading a PDF or video to Mind Point storage therefore implicates rights that merely citing it does not. ([Copyright Act, 1957, ss. 2(ff) and 14](https://copyright.gov.in/documents/copyright_act_1957.pdf))

Section 52(1)(c) separately protects transient or incidental storage used to provide links, access, or integration when the rightsholder has not expressly prohibited it and the service lacks knowledge or reasonable grounds to believe the copy is infringing. It also specifies a complaint process under which facilitation is suspended for 21 days or until a competent-court order is received. This language supports a materially safer product posture for lawful linking and ordinary technical caching; it does **not** turn a persistent LMS upload into transient storage. ([Copyright Act, 1957, ss. 51 and 52(1)(b)-(c)](https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html); [Copyright Rules, 2013, r. 75](https://copyright.gov.in/Copyright_Rules_2013/chapter_xiv.html))

Product rules should therefore distinguish:

| Delivery mode | Mind Point action | Default rule |
| --- | --- | --- |
| External link | Sends the learner to the rightsholder's or authorised host's page | Allowed after checking that the destination appears lawful; remove or suspend on a credible complaint |
| Supported embed | Displays a provider-controlled player or viewer; incidental caching may occur | Allowed only where the provider enables embedding and its terms are followed |
| Hosted copy | Stores and serves a PDF, ebook, image, audio, or video from Mind Point infrastructure | Requires recorded rights evidence or a counsel-approved exception |
| Adapted copy | Crops, annotates, translates, transcribes, abridges, or changes a work | Requires an adaptation right or an applicable exception; attribution alone is insufficient |

A raw media URL, copied file, screenshot, scan, or stream proxy is a hosted/reproduced copy in substance, even if the interface labels it a "link." The service should also reject links to obviously unauthorised copies and act when it learns that a destination is infringing.

## The education exceptions are useful but not a blanket LMS licence

Section 52 contains several distinct exceptions:

- Fair dealing with a work (other than a computer program) for private or personal use including research, criticism or review, and current-events reporting is not infringement. Electronic storage for those purposes is included. The statutory qualifier is **fair dealing**. ([Copyright Act, 1957, s. 52(1)(a)](https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html))
- Reproduction "by a teacher or a pupil in the course of instruction," in examination questions, or in answers is separately protected. The text contains no fixed page or percentage limit. ([Copyright Act, 1957, s. 52(1)(i)](https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html))
- Performance of a literary, dramatic, or musical work by staff and students in the course of an educational institution's activities, or showing a film or playing a recording to a limited institutional audience, has its own conditions. It should not be treated as permission to publish the recording into a persistent course library. ([Copyright Act, 1957, s. 52(1)(j)](https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html))
- Separate exceptions exist for making accessible-format copies for people with disabilities, with limits on profit and controls against entry into ordinary channels of business. ([Copyright Act, 1957, s. 52(1)(zb)](https://copyright.gov.in/Copyright_Act_1957/chapter_xi.html))

In _The Chancellor, Masters & Scholars of the University of Oxford v. Rameshwari Photocopy Services_, the Delhi High Court read "course of instruction" broadly and treated the instructional purpose, course objective, course content, and teacher-selected readings as central. It nevertheless left factual questions for trial, including whether inclusion was justified by the course purpose and whether entire-book copying was permissible. Its reasoning also distinguished instructional reproduction from publication and discussed the absence of profit on the facts before it. ([Delhi High Court, RFA(OS) 81/2016, paras. 56-61 and 79-80](https://images.assettype.com/barandbench/import/2016/12/PNJ09122016RFAOS812016.pdf))

That judgment is helpful but not a safe automated rule for Mind Point. A paid, persistent, asynchronous LMS; repeated reuse across course runs; whole-book scans; a repository available beyond a defined class; and material that substitutes for a purchase may present facts the decision did not finally settle. Mind Point should not encode a percentage threshold or allow faculty to self-declare "educational use." Counsel should decide when section 52(1)(i) may be used and what evidence, audience, duration, and quantity are defensible.

## Rules by material type

### Faculty-created readings, slides, quizzes, and videos

The author is generally the first copyright owner, subject to statutory exceptions including work made in the course of employment under a contract of service. Contractors and guest faculty therefore do not automatically transfer all rights to Mind Point. A copyright licence must be in writing; section 19's rules require the work and granted rights, duration, territory, and consideration to be specified. ([Copyright Act, 1957, ss. 17 and 19](https://copyright.gov.in/Copyright_Act_1957/chapter_iv.html); [ss. 30-30A](https://copyright.gov.in/Copyright_Act_1957/chapter_vi.html))

The faculty agreement should grant Mind Point the rights needed to host, reproduce, stream/display, and make the material available to authorised learners; create technical formats and accessibility adaptations; retain backups for a defined period; and continue or stop use when the engagement ends. It should identify territory and duration, address sublicensing to infrastructure providers, and warrant that incorporated third-party content is cleared. Do not demand ownership if a tailored non-exclusive licence is sufficient.

Authors retain special rights to claim authorship and object to prejudicial distortion even after assignment. Keep creator credits and use a review path for substantive edits. ([Copyright Act, 1957, s. 57](https://copyright.gov.in/Copyright_Act_1957/chapter_iv.html))

### Reference books and book chapters

Buying a physical or electronic copy is not permission to scan and distribute it. Link to the publisher, bookseller, library catalogue, or authorised ebook service unless an institutional/courseware licence expressly covers Mind Point's audience and delivery method. Do not upload entire books or circumvention-derived ebook files without counsel and written permission.

For public-domain decisions, record the author, death/publication dates, work type, source, and reviewer. The general Indian term for published literary works is the author's life plus 60 years from the beginning of the following calendar year; films and sound recordings generally run for 60 years from the beginning of the year following publication. Other categories have different rules, and a public-domain underlying text does not make a modern translation, annotations, cover, or typesetting free to copy. ([Copyright Act, 1957, ss. 22-29](https://copyright.gov.in/Copyright_Act_1957/chapter_v.html))

### Research papers

Use the DOI or publisher/repository permalink by default. "Available online," "free to read," and "authored by the faculty member" do not establish a right for a commercial LMS to host the publisher PDF. The exact article version matters: preprint, accepted manuscript, and version of record may have different permissions and embargoes.

If an article has an open licence, store the exact licence and version. All six main Creative Commons licences require attribution; BY-SA requires adaptations to use the same licence, NC limits use to noncommercial purposes, and ND prohibits sharing adapted versions. CC BY 4.0 attribution includes creator and supplied notices, a licence link, a source link where practicable, and an indication of changes. It also prohibits legal terms or effective technological measures that prevent recipients from exercising the licensed rights. ([Creative Commons licence overview](https://creativecommons.org/share-your-work/cclicenses/); [CC BY 4.0 legal code, s. 3](https://creativecommons.org/licenses/by/4.0/legalcode))

Because Mind Point sells courses, do not assume an NC licence permits its use; obtain permission or legal review. For SA and ND material, obtain review before adapting, translating, merging into a workbook, or applying access restrictions that conflict with the licence. CC0 does not contractually require attribution, but scholarly citation remains good practice. Third-party figures, photographs, datasets, or supplements may carry separate notices even inside an open article.

Publisher policy is version- and publisher-specific. For example, Elsevier's current policy tells authors to link rather than share the full text of subscription versions of record in general, while allowing specified private/classroom and institutional uses and allowing open-access articles to be shared under their chosen end-user licence. This is an example of why Mind Point must inspect the applicable agreement, not a universal rule for journals. ([Elsevier article-sharing policy](https://www.elsevier.com/en-gb/about/policies-and-standards/sharing))

### Third-party videos and audio

Link or use the provider's documented embed. YouTube's terms permit showing videos through its embeddable player but prohibit downloading, reproducing, distributing, altering, or otherwise using service content unless the service, rightsholders, or law permits it. YouTube also lets owners disable embedding and requires the embedder to send an HTTP Referer. ([YouTube Terms of Service](https://www.youtube.com/static?template=terms); [YouTube embedding instructions](https://support.google.com/youtube/answer/171780))

Accordingly, never use a video downloader, strip ads/branding, bypass an embed restriction, proxy the stream, or retain a copy after the source disappears. Provide a fallback external link. For other platforms, require an allowlisted integration backed by that provider's current terms.

Sections 65A and 65B create criminal exposure for circumvention of effective technological measures with infringing intent and for unauthorised removal/alteration of electronic rights-management information in the specified circumstances. Preserve watermarks, copyright notices, metadata, and player controls. ([Copyright Act, 1957, ss. 65A-65B](https://copyright.gov.in/Copyright_Act_1957/chapter_xiii.html))

### Live-session recordings

A lecture is a copyright "work," a person delivering one is a "performer," and performers have exclusive rights over recording, reproducing, issuing copies of, and communicating their performances, subject to statutory exceptions. Performers also retain attribution and integrity rights. ([Copyright Act, 1957, ss. 2(n), 2(q), and 2(qq)](https://copyright.gov.in/Copyright_Act_1957/chapter_i.html); [ss. 38-39A](https://copyright.gov.in/Copyright_Act_1957/chapter_viii.html))

Before recording, the faculty agreement should expressly cover recording, editing, captions/transcripts, course-run access, reuse in later cohorts, promotional extracts (if any), and deletion. Student participation adds personal-data and privacy issues. Use advance notice plus an affirmative consent or clearly reviewed lawful basis; show a persistent recording indicator; offer an unrecorded/private channel for sensitive questions; and exclude breakout rooms by default. Do not reuse student image, voice, name, chat, or testimonial for marketing without separate, specific permission.

As of the research date, India's Digital Personal Data Protection Act has a staged commencement. Most operational processing obligations in sections 3-17 and corresponding Rules 3 and 5-16 are scheduled for 13 May 2027, while specified institutional provisions commenced on 13 November 2025. The forthcoming regime requires purpose-specific notice/consent or another lawful basis, security safeguards, erasure when consent is withdrawn or the purpose is no longer served unless retention is legally necessary, and processor contracts. Rule 6 will also require certain security logs and relevant personal data to be retained for one year. Build for those rules now, but counsel should verify the operative law again at launch. ([DPDP Act, 2023, ss. 5-8](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf); [official commencement notification G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf); [DPDP Rules, 2025, rr. 1, 3, and 6](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf))

Until the new operational provisions commence, the Information Technology Act and 2011 SPDI Rules remain relevant, especially if a therapy or psychology class captures medical history, mental-health information, or other sensitive data. The Rules require a privacy policy and impose conditions around collection, consent, purpose, retention, security, disclosure, and transfer of sensitive personal data. ([Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011](https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/in/in098en.html); [Government clarification of G.S.R. 313(E)](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=74990))

## Required product controls

### Rights record

Every hosted or embedded material should carry:

- title, work type, creator/rightsholder, source URL, and exact version;
- rights basis: owned, written permission, named licence, public domain, counsel-approved exception, or external link/embed only;
- evidence file or URL, reviewer, review date, and any uncertainty;
- permitted acts: host, stream/display, download, print, adapt, translate, caption/transcribe, and reuse across course runs;
- audience, territory, start/expiry date, embargo, attribution text, and licence URL/version;
- third-party components and their separate rights;
- takedown/status history and deletion/retention dates.

Uploading must be blocked until required fields are complete. "Faculty says it is theirs" is not enough when the file contains publisher layout, stock media, book pages, music, patient/client material, or another person's presentation.

### Access and download

- Use authenticated, course-run-scoped access and short-lived signed URLs for restricted files.
- Keep restricted assets out of search indexing, public previews, analytics payloads, and permanent browser/CDN caches.
- End access when enrolment or the licence ends; revoke links and purge caches/backups according to the recorded terms.
- Expose a download/print control only when the rights record permits it. A disabled button is deterrence, not a guarantee against copying and not a cure for missing rights.
- Do not add DRM or contractual restrictions to CC material where that would prevent recipients from exercising rights the licence grants.
- Log administrative upload, rights changes, publication, access-policy changes, takedown, and deletion. Avoid invasive per-page learner surveillance unless separately justified and disclosed.

### Attribution

Display attribution beside the material and retain it in downloaded files where required. At minimum support title, creator, source, copyright notice, licence name/link, and change indication. Preserve any publisher wording and rights-management information. The course bibliography/citation is useful but may not satisfy a licence that requires notices to accompany each copy.

### Notice and takedown

Provide a visible copyright contact and complaint form that captures the claimant, work, location, ownership evidence, complained-of use, and contact details. On a credible complaint, immediately unpublish or restrict the item while the designated reviewer checks the licence/exception; preserve evidence and notify the uploader. The statutory 21-day link-storage process and Copyright Rules should be implemented with counsel rather than improvised in product code. Repeat problems should affect faculty upload privileges.

## Retention rule

Copyright law does not supply one universal LMS retention period. Retention should be driven by the licence, instructional need, privacy law, dispute hold, and backup mechanics:

1. Set an explicit availability end date for every restricted asset and recording, normally tied to the course run plus a short, disclosed review/appeal window.
2. At expiry, stop learner access immediately and queue primary and cached copies for deletion. Delete processor copies and backups on their documented cycle unless a legal hold applies.
3. Keep only minimal rights evidence, consent/notice evidence, version hash, takedown history, and audit events needed to show why access was authorised and how a complaint was handled. Do not retain the content itself merely to keep evidence when a hash and licence record suffice.
4. For recordings, separate the raw recording from the edited teaching asset. Delete raw recordings quickly after editing; set a new rights and privacy review before reuse in another cohort.
5. Re-review the schedule before 13 May 2027 and whenever a licence, provider term, or law changes.

Counsel must set the final periods for rights evidence, complaints, recordings, backups, and legal holds. The product should make those periods configurable rather than hard-code a single number.

## Questions requiring counsel before launch

1. Does section 52(1)(i) cover each proposed use in a paid, asynchronous Mind Point course, especially persistent digital course packs, repeated cohort reuse, and complete works?
2. When is a closed enrolled class still a "public" for communication/publication analysis, and what controls materially support the instructional-use case?
3. What complaint, counter-notice, 21-day suspension, repeat-uploader, and evidence-preservation process should Mind Point adopt under section 52(1)(c), the Copyright Rules, and the Information Technology Act?
4. What exact faculty employment/contractor terms establish ownership or a sufficient licence for course assets and future cohort reuse, while respecting author and performer rights?
5. May a particular NC, ND, SA, publisher, library, or database licence be used in a paid course with the intended access and download controls?
6. What consent/lawful-basis and retention model applies to faculty and student recordings now and after the DPDP operational provisions commence, especially where sessions may reveal health or mental-health information?
7. What limitation/legal-hold periods apply to rights evidence and complaints, and how should those interact with privacy-driven deletion?

## Sources and status

Primary authorities used above are the current consolidated [Copyright Act, 1957](https://copyright.gov.in/documents/copyright_act_1957.pdf), the official [Copyright Rules, 2013](https://copyright.gov.in/Documents/Copyright_Rules_2013_and_Forms.pdf), the [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf), the [official commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf), and the gazetted [Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf). Platform and licence examples come from their first-party terms. The Delhi High Court judgment link is a mirror of the court-issued judgment because the court's legacy search endpoint does not expose a stable, non-captcha URL for that 2016 file.
