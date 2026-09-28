// Module assignments extracted from the TMP intro practice workbooks:
// the fictional case and its four tasks for each module.

export interface AssignmentSeed {
  moduleNumber: number;
  caseBrief: string;
  tasks: string[];
}

export const INTRO_ASSIGNMENT_BANK: Record<string, AssignmentSeed[]> = {
  PRCP: [
    {
      moduleNumber: 1,
      caseBrief:
        "Compare explanations without labelling a person A fictional teenager is accused of damaging school equipment after an argument. A discussion group blames the teenager\u2019s body build, single-parent family and neighbourhood. Another learner says that peer approval, the immediate conflict and available support should be investigated. No allegation has been established through the relevant process, and the teenager\u2019s account is not yet available.",
      tasks: [
        "Separate allegation from established information.",
        "Reject unsupported appearance and group-based conclusions.",
        "Use two theoretical lenses to generate questions, not diagnoses.",
        "Add protective resources and missing evidence to the discussion.",
      ],
    },
    {
      moduleNumber: 2,
      caseBrief:
        "Information quality, not confession production A fictional interview summary says that the interviewee looked away, therefore lied; that a broad personality profile matched; and that the person finally agreed after repeated accusations. A separate record contains one potentially relevant time discrepancy. The conditions of questioning and source of the record are not documented. This is a written analysis, not an interrogation role-play.",
      tasks: [
        "Identify observations and conclusions that exceed them.",
        "Explain why agreement does not end the evidence review.",
        "Rewrite one leading question as an open clarification.",
        "Use the PEACE stages to list process questions, without teaching coercive tactics.",
      ],
    },
    {
      moduleNumber: 3,
      caseBrief:
        "Separate clinical needs, risk and legal findings A fictional referral concerns Imran, aged seventeen, after an allegation of threatening another student. The referral mentions exclusion at school and possible communication difficulty but contains no assessment. A draft report calls him a future serial offender and assumes that a mental health label would settle legal responsibility. A trusted teacher is available and Imran wants to remain in education.",
      tasks: [
        "Identify the unsupported prediction and diagnostic claims.",
        "Separate safety, clinical, developmental and legal questions.",
        "Include the young person\u2019s account and protective resources.",
        "Draft a provisional formulation that can change with new information.",
      ],
    },
    {
      moduleNumber: 4,
      caseBrief:
        "Plan support without forcing reconciliation A fictional programme wants to arrange a meeting after damage to a shop. The owner wants restitution but declines contact. The person responsible wants to apologise publicly. A trainee proposes requiring the owner to attend so that everyone can achieve closure. The same trainee advertises independent forensic assessment after completing this introductory course.",
      tasks: [
        "Identify whose choices are being overridden.",
        "Distinguish accountability, restitution, forgiveness and reconciliation.",
        "State what specialist safeguards and legal context must be considered.",
        "Correct the trainee\u2019s professional claim and create a realistic learning goal.",
      ],
    },
  ],
  PRCVCP: [
    {
      moduleNumber: 1,
      caseBrief:
        "Role, setting, method or authority? A fictional college requests three services: a study-planning workshop, assessment of a student with persistent concentration difficulties, and immediate help for a student who may be unsafe. Its advertisement says that a friendly trainee can provide all three because counselling is for mild problems. The trainee has completed introductory study but has not been authorised to conduct assessments or manage crises independently.",
      tasks: [
        "Separate the three requested tasks.",
        "Identify what the advertisement assumes about counselling psychology.",
        "For each task, state what competence, authorisation or escalation arrangement must be",
        "Rewrite the advertisement in two sentences without inventing credentials or services.",
      ],
    },
    {
      moduleNumber: 2,
      caseBrief:
        "Match the contribution to the need Sana is considering leaving a demanding job. She supports a parent financially and reports poor sleep. She wants a way to compare options rather than being told what to choose. A friend recommends counselling \u201cto remove all doubt\u201d. Another friend says a medical assessment would make counselling unnecessary. No assessment, diagnosis or financial advice has yet occurred.",
      tasks: [
        "Identify Sana\u2019s stated goal and two relevant constraints.",
        "Distinguish possible psychological, practical and medical contributions.",
        "Write two questions that preserve her decision-making.",
        "Explain what additional information would change the proposed next step.",
      ],
    },
    {
      moduleNumber: 3,
      caseBrief:
        "Repair a premature interpretation In a fictional skills demonstration, Priya says, \u201cI avoid speaking because the class has laughed at my accent.\u201d The trainee replies, \u201cThat is a negative thought. Tell yourself everyone likes you.\u201d Priya becomes quiet. The observer does not know whether the ridicule occurred, but the trainee has not asked. The agreed exercise is a low-intensity conversation, not treatment.",
      tasks: [
        "Identify the unsupported reassurance and the missed information.",
        "Write a tentative reflection that does not decide whether the report is true or false.",
        "Negotiate a possible task connected to Priya\u2019s priorities.",
        "Repeat the opening in pairs using only the fictional case; an observer records checking",
      ],
    },
    {
      moduleNumber: 4,
      caseBrief:
        "A focused referral for Kavya Kavya reports three months of episodes of intense anxiety and difficulty meeting work deadlines. She also wants help negotiating workload. A draft note states that she definitely has GAD caused by childhood neglect and must finish all clinical treatment before receiving any support with work. The case provides no completed assessment. Kavya has agreed to discuss the referral purpose, but information-sharing details remain to be settled.",
      tasks: [
        "Mark which conclusions exceed the supplied information.",
        "Write a provisional description without a diagnosis.",
        "Identify possible parallel contributions and a question for the responsible practitioner.",
        "Draft a four-sentence handover that states the sharing basis still to be confirmed.",
      ],
    },
    {
      moduleNumber: 5,
      caseBrief:
        "Build a verifiable learning plan Aarav is choosing between two psychology programmes. One advertisement promises an easy career and immediate independent practice. The other lists modules and supervised placements but does not explain professional eligibility. Aarav is interested in research and direct work with students. He has not yet checked either official prospectus or spoken with the relevant regulator.",
      tasks: [
        "Separate interests from assumptions about lifestyle.",
        "Identify the evidence needed for each programme\u2019s claims.",
        "Draft three questions for an informational interview.",
        "Create one observable learning goal for a supervised simulation.",
      ],
    },
  ],
  PRSP: [
    {
      moduleNumber: 1,
      caseBrief:
        "Map demands before recommending motivation Farah misses two early badminton sessions after the bus route changes. She enjoys the sport and wants to reach the next tournament round, but she cannot afford daily taxi travel. Her coach suggests a confidence exercise and describes missed practice as low commitment. The case provides no clinical assessment or evidence about other attendance problems.",
      tasks: [
        "Separate the observed attendance from the inferred attitude.",
        "Map the task, athlete, relationships, setting and support.",
        "Write one outcome goal and one feasible process goal.",
        "Identify the practical problem a psychological exercise cannot solve.",
      ],
    },
    {
      moduleNumber: 2,
      caseBrief:
        "Test a coping cue Dev uses the phrase \u201cI will definitely win\u201d before practice. After an error, he repeats it more loudly and becomes distracted. He would like a brief instruction that helps him return to the next task. He dislikes guided visualisation but is comfortable with verbal rehearsal. There is no injury or crisis in this fictional exercise.",
      tasks: [
        "Identify why the existing statement may not fit the task.",
        "Write two brief, believable action cues.",
        "Rehearse a neutral task using one cue, or observe instead.",
        "Review usefulness and distraction without treating the result as a clinical score.",
      ],
    },
    {
      moduleNumber: 3,
      caseBrief:
        "Evaluate a claim about participation A fictional school reports that girls\u2019 hockey enrolment rose after a film discussion. In the same month it also provided equipment, changed practice times and arranged transport. A newsletter claims that the film alone transformed attitudes. No interviews or comparison data were collected.",
      tasks: [
        "List the changes that occurred.",
        "Separate increased enrolment from a proven cause.",
        "Draft two questions for participants.",
        "Suggest a modest conclusion and an ethical behaviour the club could review.",
      ],
    },
    {
      moduleNumber: 4,
      caseBrief:
        "Repair a role misunderstanding A fictional team enjoys spending time together but repeatedly confuses roles during a drill. Instructions are delivered quickly in a language not equally familiar to everyone. The captain says the team needs stronger friendship. A player asks for a demonstration and a brief check of the agreed positions.",
      tasks: [
        "Distinguish task cohesion from social cohesion.",
        "Identify a communication barrier.",
        "Write a respectful check-back question.",
        "Draft a two-point team agreement about feedback and clarification.",
      ],
    },
    {
      moduleNumber: 5,
      caseBrief:
        "Audit a programme advertisement A fictional online programme promises that six introductory lessons qualify graduates to diagnose all athlete mental health problems and clear athletes after concussion. Its page lists several prestigious workplaces but gives no placement terms, supervisor details or registration information.",
      tasks: [
        "Mark claims that require evidence or exceed an introductory course.",
        "Separate clinical care, mental-skills education and medical clearance.",
        "List documents needed to verify the programme.",
        "Write an accurate learning outcome for this course.",
      ],
    },
    {
      moduleNumber: 6,
      caseBrief:
        "Separate three kinds of claim A fictional runner asks whether a teammate\u2019s pain medicine can be used before competition. Another person says it is safe because it is legal and sold locally. The runner has not had the current pain assessed. No information is available about the medicine, prescription, competition rules or the runner\u2019s health.",
      tasks: [
        "Distinguish legality, anti-doping status and individual safety.",
        "Explain why the missing information matters without giving medication advice.",
        "Identify medical and anti-doping verification routes.",
        "Draft a non-judgemental response and a boundary statement.",
      ],
    },
    {
      moduleNumber: 7,
      caseBrief:
        "Keep readiness and clearance separate Meera has a staged rehabilitation plan after an injury. She is anxious about the next step and asks for clarification. A teammate tells her to push harder to prove confidence. Meera is also considering a future outside competitive sport but feels pressured to say the injury has made her stronger.",
      tasks: [
        "Identify medical, psychological and practical questions.",
        "Explain why anxiety alone does not settle clearance.",
        "Draft two questions Meera can take to the treating team.",
        "Discuss transition without requiring a positive meaning.",
      ],
    },
  ],
  PRPFA: [
    {
      moduleNumber: 1,
      caseBrief:
        "Look, Listen and Link at a reception centre After a fictional evacuation, a reception centre is open in an approved safe area. Leela wants to charge her phone and contact her sister. An older person nearby appears newly confused and unwell. A volunteer tells everyone that they must describe the event before receiving support and promises that a shelter has beds without checking. You are practising an information-desk role, not acting as a medical professional.",
      tasks: [
        "Identify the concern requiring the appropriate medical pathway.",
        "Apply Look, Listen and Link to Leela\u2019s stated request.",
        "Correct the compulsory-disclosure and unverified-resource statements.",
        "Write a role introduction that asks permission without promising outcomes.",
      ],
    },
    {
      moduleNumber: 2,
      caseBrief:
        "Rewrite an intrusive response In a fictional support conversation, a person says, \u201cI do not want to explain it again.\u201d A helper insists on closed eyes and a breath-holding exercise, then says, \u201cYou are safe now; this will pass.\u201d The helper has not checked medical concerns or the actual safety situation. The exercise is a written critique; no participant should enact distress or altered breathing.",
      tasks: [
        "Identify assumptions, guarantees and imposed actions.",
        "Write a response that respects the refusal.",
        "Offer a practical or external-focus alternative without requiring it.",
        "State when support must shift to medical or specialist assistance.",
      ],
    },
    {
      moduleNumber: 3,
      caseBrief:
        "Repair a broken referral pathway A fictional family is given a clinic number after displacement. The phone is out of service, transport is inaccessible and no one has agreed to follow up. A volunteer calls the family unmotivated. A separate team asks exhausted helpers to recount every distressing event in a mandatory group meeting. The organisation has no verified resource directory or backup contact route.",
      tasks: [
        "Identify barriers that are not explained by motivation.",
        "Design a resource-verification record.",
        "Draft a closed-loop handover.",
        "Distinguish operational review and voluntary support from compelled emotional",
      ],
    },
  ],
};
