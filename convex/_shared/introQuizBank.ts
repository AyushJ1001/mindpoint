// Quiz bank extracted from the TMP intro practice workbooks.
// Each module's five questions, with the workbook's answer key as `correct`.
// Generated from the practice PDFs; regenerate with scripts if the workbooks change.

export interface QuizQuestionSeed {
  prompt: string;
  /** Four options in order; exactly one has correct: true. */
  options: { label: string; correct: boolean }[];
}

export interface QuizModuleSeed {
  moduleNumber: number;
  questions: QuizQuestionSeed[];
}

export const INTRO_QUIZ_BANK: Record<string, QuizModuleSeed[]> = {
  PRCP: [
    {
      moduleNumber: 1,
      questions: [
        {
          prompt: "What does a theory provide in a short case?",
          options: [
            { label: "Permission to ignore other evidence.", correct: false },
            {
              label:
                "A framework for questions, not automatic proof of cause or guilt.",
              correct: true,
            },
            { label: "A diagnosis from one incident.", correct: false },
            { label: "A legal verdict.", correct: false },
          ],
        },
        {
          prompt: "How should body-type theories be used here?",
          options: [
            {
              label: "As reliable tools for identifying offenders.",
              correct: false,
            },
            { label: "As current diagnostic criteria.", correct: false },
            {
              label: "As historical ideas to examine critically.",
              correct: true,
            },
            { label: "As grounds for accusing classmates.", correct: false },
          ],
        },
        {
          prompt: "What is a protective resource?",
          options: [
            {
              label:
                "A potentially supportive relationship, opportunity or service to examine.",
              correct: true,
            },
            { label: "A substitute for legal evidence.", correct: false },
            { label: "A guarantee that no harm can occur.", correct: false },
            { label: "Proof that an allegation is false.", correct: false },
          ],
        },
        {
          prompt: "What does Moffitt\u2019s taxonomy describe?",
          options: [
            { label: "A body-type classification.", correct: false },
            {
              label: "A certainty about every child\u2019s future.",
              correct: false,
            },
            {
              label: "Two legal categories used to convict children.",
              correct: false,
            },
            {
              label:
                "A theoretical account of developmental patterns, not a diagnosis from one act.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which statement keeps levels of explanation distinct?",
          options: [
            { label: "A neighbourhood label proves guilt.", correct: false },
            {
              label:
                "An area-level association cannot identify an individual offender.",
              correct: true,
            },
            {
              label: "A population statistic replaces a case assessment.",
              correct: false,
            },
            {
              label: "Every group member shares the same behaviour.",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 2,
      questions: [
        {
          prompt: "What can an offender profile establish by itself?",
          options: [
            { label: "A complete motive.", correct: false },
            {
              label: "The offender\u2019s identity with certainty.",
              correct: false,
            },
            { label: "A clinical diagnosis.", correct: false },
            {
              label: "A possible hypothesis or lead, not guilt.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which is an open question?",
          options: [
            { label: "What did you notice near the entrance?", correct: true },
            { label: "You were angry, were you not?", correct: false },
            {
              label: "Was the man in the red jacket waiting there?",
              correct: false,
            },
            { label: "Why did you hide the item?", correct: false },
          ],
        },
        {
          prompt: "What does nervousness prove?",
          options: [
            { label: "A particular personality disorder.", correct: false },
            {
              label: "Neither deception nor truthfulness by itself.",
              correct: true,
            },
            { label: "A lie in every case.", correct: false },
            { label: "Guilt if the person looks away.", correct: false },
          ],
        },
        {
          prompt: "What is the goal of an accountable investigative interview?",
          options: [
            { label: "A confession at any cost.", correct: false },
            {
              label:
                "Accurate relevant information within legal and ethical safeguards.",
              correct: true,
            },
            { label: "Making the person emotional.", correct: false },
            {
              label: "Confirming the interviewer\u2019s first theory.",
              correct: false,
            },
          ],
        },
        {
          prompt: "How should legal-rights information be handled?",
          options: [
            {
              label: "Assume safeguards are optional when inconvenient.",
              correct: false,
            },
            {
              label: "Let a psychology worksheet determine the law.",
              correct: false,
            },
            { label: "Repeat any old section number.", correct: false },
            {
              label:
                "Check the applicable current law and qualified legal advice.",
              correct: true,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 3,
      questions: [
        {
          prompt: "What should assessment begin with?",
          options: [
            { label: "A preferred label.", correct: false },
            { label: "A prediction based on appearance.", correct: false },
            {
              label: "A defined question within a qualified role.",
              correct: true,
            },
            { label: "A fixed conclusion to confirm.", correct: false },
          ],
        },
        {
          prompt:
            "What does a clinical diagnosis establish about legal responsibility?",
          options: [
            { label: "The correct sentence.", correct: false },
            { label: "Automatic guilt.", correct: false },
            { label: "Automatic lack of responsibility.", correct: false },
            {
              label: "It does not determine the legal conclusion by itself.",
              correct: true,
            },
          ],
        },
        {
          prompt: "How should a so-called childhood warning triad be treated?",
          options: [
            { label: "As a classroom diagnostic exercise.", correct: false },
            {
              label: "As sufficient proof of a future offence.",
              correct: false,
            },
            {
              label: "As a reason to ignore current health needs.",
              correct: false,
            },
            {
              label: "Not as a test predicting future serial offending.",
              correct: true,
            },
          ],
        },
        {
          prompt:
            "Which statement about psychopathy and sociopathy is appropriate?",
          options: [
            {
              label:
                "Sociopathy is a precise explanation for every unusual behaviour.",
              correct: false,
            },
            {
              label: "A single unpleasant act establishes either label.",
              correct: false,
            },
            { label: "Both can be diagnosed by a classmate.", correct: false },
            {
              label:
                "Terms require careful definition and are not interchangeable shortcuts for diagnosis.",
              correct: true,
            },
          ],
        },
        {
          prompt:
            "What is wrong with calling a failed referral noncompliance without inquiry?",
          options: [
            { label: "Every person is guaranteed transport.", correct: false },
            { label: "The label proves motivation.", correct: false },
            {
              label:
                "Access, communication and service barriers may explain the failure.",
              correct: true,
            },
            { label: "Referrals never matter.", correct: false },
          ],
        },
      ],
    },
    {
      moduleNumber: 4,
      questions: [
        {
          prompt: "What must not be required as a restorative outcome?",
          options: [
            { label: "Clarity about responsibility.", correct: false },
            { label: "Appropriate safeguards.", correct: false },
            { label: "Attention to safety.", correct: false },
            {
              label: "Forgiveness or reconciliation by the person harmed.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What does an introductory course establish?",
          options: [
            { label: "Police powers.", correct: false },
            { label: "Guaranteed employment.", correct: false },
            {
              label: "Qualification to give any expert opinion.",
              correct: false,
            },
            {
              label:
                "Specified educational learning, not automatic independent forensic authority.",
              correct: true,
            },
          ],
        },
        {
          prompt: "How should an educational programme be verified?",
          options: [
            { label: "Treat salary examples as guarantees.", correct: false },
            {
              label:
                "Check the exact award, current official requirements and supervised-practice terms.",
              correct: true,
            },
            {
              label:
                "Assume every forensic degree grants clinical registration.",
              correct: false,
            },
            { label: "Rely only on a job-title list.", correct: false },
          ],
        },
        {
          prompt: "What makes a rehabilitation plan coherent?",
          options: [
            { label: "Only a motivational slogan.", correct: false },
            {
              label: "A promise that every external barrier will disappear.",
              correct: false,
            },
            {
              label:
                "Any positive activity is assumed to prevent all reoffending.",
              correct: false,
            },
            {
              label:
                "A link between assessed needs, feasible contributions and review.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What does success in a role-play demonstrate?",
          options: [
            {
              label:
                "Performance in that exercise, not guaranteed generalisation to real settings.",
              correct: true,
            },
            { label: "Independent clinical competence.", correct: false },
            { label: "A legal finding.", correct: false },
            { label: "Permanent behaviour change.", correct: false },
          ],
        },
      ],
    },
  ],
  PRCVCP: [
    {
      moduleNumber: 1,
      questions: [
        {
          prompt:
            "Which statement best distinguishes a speciality from a role?",
          options: [
            {
              label: "A role is simply the name of a therapy.",
              correct: false,
            },
            {
              label: "A speciality guarantees competence in every task.",
              correct: false,
            },
            {
              label: "A workplace determines professional registration.",
              correct: false,
            },
            {
              label:
                "A speciality describes a field; a role specifies responsibilities in a setting.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which comparison is most accurate?",
          options: [
            {
              label: "Counselling psychology excludes mental disorders.",
              correct: false,
            },
            {
              label:
                "Clinical and counselling psychology overlap in clients, methods and settings.",
              correct: true,
            },
            {
              label: "Only clinical psychologists use evidence.",
              correct: false,
            },
            {
              label: "Only counselling psychologists need relationship skills.",
              correct: false,
            },
          ],
        },
        {
          prompt:
            "An urgent safety concern arrives during a general workshop. What is the appropriate",
          options: [
            {
              label: "Give the person a worksheet instead of escalating.",
              correct: false,
            },
            {
              label: "Ask the class to vote on the level of risk.",
              correct: false,
            },
            {
              label: "Continue because workshops are non-clinical.",
              correct: false,
            },
            {
              label:
                "Use the institution\u2019s appropriate immediate safety pathway.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What does \u201cuses CBT\u201d establish by itself?",
          options: [
            { label: "A guaranteed positive outcome.", correct: false },
            {
              label:
                "The stated approach, not independent competence or authorisation.",
              correct: true,
            },
            { label: "A recognised clinical qualification.", correct: false },
            { label: "Permission to treat every condition.", correct: false },
          ],
        },
        {
          prompt: "Which question best supports a career comparison?",
          options: [
            {
              label:
                "What training and supervised experience support the tasks I want to perform?",
              correct: true,
            },
            {
              label: "Which speciality guarantees easier clients?",
              correct: false,
            },
            { label: "Which title lets me avoid research?", correct: false },
            {
              label: "Which speciality never encounters serious distress?",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 2,
      questions: [
        {
          prompt: "Which goal is most suitable for collaborative discussion?",
          options: [
            { label: "Remove every uncomfortable feeling.", correct: false },
            {
              label:
                "Compare two realistic work options and identify the next information needed.",
              correct: true,
            },
            {
              label: "Guarantee that the chosen job will be ideal.",
              correct: false,
            },
            { label: "Persuade Sana to resign.", correct: false },
          ],
        },
        {
          prompt: "What does a screening result usually contribute?",
          options: [
            { label: "A legal finding about capacity.", correct: false },
            { label: "A guaranteed treatment plan.", correct: false },
            {
              label: "An indication that further assessment may be needed.",
              correct: true,
            },
            { label: "A complete diagnosis in every case.", correct: false },
          ],
        },
        {
          prompt:
            "A person reports intimidation in a relationship. What should not be assumed?",
          options: [
            { label: "That safety may affect the next step.", correct: false },
            {
              label:
                "That communication rehearsal alone is a suitable response.",
              correct: true,
            },
            { label: "That the report deserves attention.", correct: false },
            { label: "That context matters.", correct: false },
          ],
        },
        {
          prompt: "How can counselling and medical care relate?",
          options: [
            {
              label: "Counselling replaces investigation of physical symptoms.",
              correct: false,
            },
            { label: "They always exclude one another.", correct: false },
            {
              label:
                "They can address complementary needs when appropriately coordinated.",
              correct: true,
            },
            {
              label: "Medical care is needed only when counselling fails.",
              correct: false,
            },
          ],
        },
        {
          prompt:
            "A person misses a planned task. Which response is most useful?",
          options: [
            {
              label:
                "Ask about fit, resources, understanding and what happened.",
              correct: true,
            },
            { label: "End support without discussion.", correct: false },
            { label: "Conclude they lack motivation.", correct: false },
            { label: "Increase the task immediately.", correct: false },
          ],
        },
      ],
    },
    {
      moduleNumber: 3,
      questions: [
        {
          prompt: "What is validation?",
          options: [
            { label: "Avoiding any discussion of behaviour.", correct: false },
            {
              label: "Confirming every interpretation as fact.",
              correct: false,
            },
            { label: "Promising that distress will stop.", correct: false },
            {
              label:
                "Acknowledging experience without necessarily endorsing every conclusion.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which statement is an actionable coping instruction?",
          options: [
            { label: "Nothing can go wrong.", correct: false },
            { label: "I must never feel nervous.", correct: false },
            { label: "Everyone will admire me.", correct: false },
            {
              label: "Read the task, identify the first step and begin there.",
              correct: true,
            },
          ],
        },
        {
          prompt:
            "What distinguishes a behavioural experiment from a graded task?",
          options: [
            {
              label: "A graded task always tests a diagnosis.",
              correct: false,
            },
            { label: "An experiment must be dangerous.", correct: false },
            {
              label:
                "An experiment tests a prediction; grading adjusts the size or sequence of a task.",
              correct: true,
            },
            {
              label: "There is no possible overlap or difference.",
              correct: false,
            },
          ],
        },
        {
          prompt: "What can one test score establish without further context?",
          options: [
            {
              label: "Less than a complete diagnosis or formulation.",
              correct: true,
            },
            { label: "The cause of all symptoms.", correct: false },
            {
              label: "The correct treatment for every setting.",
              correct: false,
            },
            { label: "The person\u2019s full personality.", correct: false },
          ],
        },
        {
          prompt:
            "What should a beginner do with exposure methods in this course?",
          options: [
            { label: "Assume every fear is unrealistic.", correct: false },
            {
              label: "Force a friend into a feared situation.",
              correct: false,
            },
            {
              label:
                "Understand their purpose and limits without independently treating others.",
              correct: true,
            },
            {
              label: "Remove every safety aid without assessment.",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 4,
      questions: [
        {
          prompt: "Why is the draft diagnosis unsupported?",
          options: [
            {
              label: "Workplace concerns exclude mental disorders.",
              correct: false,
            },
            {
              label:
                "The vignette does not provide a complete diagnostic assessment.",
              correct: true,
            },
            {
              label: "Childhood experiences are always irrelevant.",
              correct: false,
            },
            { label: "Anxiety can never be diagnosed.", correct: false },
          ],
        },
        {
          prompt: "What makes a referral focused?",
          options: [
            {
              label: "It includes every detail known about the person.",
              correct: false,
            },
            {
              label:
                "It states the purpose, relevant information, sharing basis and next decision.",
              correct: true,
            },
            {
              label: "It guarantees acceptance by the next service.",
              correct: false,
            },
            { label: "It avoids naming who is responsible.", correct: false },
          ],
        },
        {
          prompt: "Which statement about integrated work is sound?",
          options: [
            {
              label:
                "Contributions may occur in parallel or sequence according to need.",
              correct: true,
            },
            {
              label:
                "Clinical work must always end before practical support starts.",
              correct: false,
            },
            {
              label: "Every person requires two psychologists.",
              correct: false,
            },
            {
              label: "A referral removes the need for follow-up.",
              correct: false,
            },
          ],
        },
        {
          prompt:
            "What should be checked before relying on a qualification for an Indian clinical role?",
          options: [
            {
              label:
                "The exact recognised award, applicable registration and role requirements.",
              correct: true,
            },
            { label: "Only the course title on social media.", correct: false },
            { label: "Only the number of downloaded notes.", correct: false },
            {
              label: "Whether the provider uses the word international.",
              correct: false,
            },
          ],
        },
        {
          prompt: "Which statement about international pathways is accurate?",
          options: [
            {
              label:
                "Requirements must be checked in the intended jurisdiction.",
              correct: true,
            },
            {
              label: "A job title guarantees equivalent authority worldwide.",
              correct: false,
            },
            {
              label: "A short course replaces professional registration.",
              correct: false,
            },
            {
              label:
                "One country\u2019s supervised-hour rule applies everywhere.",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 5,
      questions: [
        {
          prompt: "Which is an observable learning goal?",
          options: [
            { label: "Become a perfect psychologist.", correct: false },
            { label: "Choose the most prestigious title.", correct: false },
            { label: "Never feel uncertain.", correct: false },
            {
              label:
                "Explain the trainee role, invite a question and check understanding in the next simulation.",
              correct: true,
            },
          ],
        },
        {
          prompt:
            "Which claim about work-life balance is justified by a speciality name alone?",
          options: [
            { label: "Counselling always has shorter hours.", correct: false },
            { label: "Research roles never involve pressure.", correct: false },
            {
              label: "None; actual roles and conditions must be examined.",
              correct: true,
            },
            {
              label: "Clinical work always has worse balance.",
              correct: false,
            },
          ],
        },
        {
          prompt: "What distinguishes observation from independent practice?",
          options: [
            {
              label: "Both always require identical responsibilities.",
              correct: false,
            },
            {
              label: "Observation counts as independent treatment.",
              correct: false,
            },
            {
              label:
                "Watching authorised work does not establish competence to perform it independently.",
              correct: true,
            },
            {
              label: "There is no need to record them separately.",
              correct: false,
            },
          ],
        },
        {
          prompt: "What should a strong programme comparison include?",
          options: [
            {
              label:
                "Current official information and the applicable professional requirements.",
              correct: true,
            },
            { label: "Only fees.", correct: false },
            { label: "Only the word certified.", correct: false },
            { label: "Only testimonials.", correct: false },
          ],
        },
        {
          prompt:
            "How should an unresolved eligibility question affect a decision?",
          options: [
            {
              label: "Ignore it if the marketing looks professional.",
              correct: false,
            },
            { label: "Assume the most favourable answer.", correct: false },
            {
              label: "Treat uncertainty as evidence of fraud.",
              correct: false,
            },
            {
              label: "Keep the relevant conclusion provisional until verified.",
              correct: true,
            },
          ],
        },
      ],
    },
  ],
  PRSP: [
    {
      moduleNumber: 1,
      questions: [
        {
          prompt: "Which is a process goal?",
          options: [
            {
              label: "Use an agreed cue before each practice attempt.",
              correct: true,
            },
            { label: "Be selected ahead of another player.", correct: false },
            { label: "Guarantee a medal.", correct: false },
            { label: "Win the championship.", correct: false },
          ],
        },
        {
          prompt: "What does a winning result prove about mental health?",
          options: [
            {
              label: "It does not establish mental health status.",
              correct: true,
            },
            { label: "The athlete has no distress.", correct: false },
            { label: "Every coping strategy was effective.", correct: false },
            { label: "The athlete needs no support.", correct: false },
          ],
        },
        {
          prompt:
            "What should be checked before interpreting missed training as low motivation?",
          options: [
            {
              label: "Only the coach\u2019s first impression.",
              correct: false,
            },
            {
              label: "Practical circumstances and the athlete\u2019s account.",
              correct: true,
            },
            { label: "Whether the athlete smiles.", correct: false },
            { label: "The athlete\u2019s body type.", correct: false },
          ],
        },
        {
          prompt: "Can intrinsic and extrinsic motivation coexist?",
          options: [
            {
              label: "Yes; enjoyment and external rewards can both matter.",
              correct: true,
            },
            { label: "No; they always cancel each other.", correct: false },
            { label: "Only in professional athletes.", correct: false },
            { label: "Only when motivation is unhealthy.", correct: false },
          ],
        },
        {
          prompt: "Which role distinction matters?",
          options: [
            {
              label: "All sport-related roles have identical training.",
              correct: false,
            },
            {
              label:
                "Mental-performance support does not automatically confer clinical authority.",
              correct: true,
            },
            {
              label: "A medal qualifies someone to treat depression.",
              correct: false,
            },
            { label: "Every coach can diagnose disorders.", correct: false },
          ],
        },
      ],
    },
    {
      moduleNumber: 2,
      questions: [
        {
          prompt: "Which cue is most actionable?",
          options: [
            { label: "I must never feel nervous.", correct: false },
            { label: "I cannot lose.", correct: false },
            { label: "Everyone will admire me.", correct: false },
            { label: "Attend to the next relevant task.", correct: true },
          ],
        },
        {
          prompt: "A learner cannot form vivid images. What is appropriate?",
          options: [
            { label: "Offer verbal or written rehearsal.", correct: true },
            { label: "Require closed eyes for longer.", correct: false },
            { label: "Mark the learner as resistant.", correct: false },
            { label: "Diagnose a memory disorder.", correct: false },
          ],
        },
        {
          prompt: "What is a useful routine designed to support?",
          options: [
            { label: "Avoidance of medical assessment.", correct: false },
            { label: "A guarantee that no mistake occurs.", correct: false },
            { label: "A ritual that must never change.", correct: false },
            {
              label: "Preparation and attention, with room for adaptation.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Persistent fatigue should be interpreted as what?",
          options: [
            { label: "Proof of weak motivation.", correct: false },
            {
              label:
                "A concern with several possible contributors that may need assessment.",
              correct: true,
            },
            { label: "Always a need for more training.", correct: false },
            { label: "Always burnout.", correct: false },
          ],
        },
        {
          prompt: "How should mental toughness be understood here?",
          options: [
            { label: "Ignoring injury.", correct: false },
            { label: "Never expressing distress.", correct: false },
            {
              label: "Following every demand without question.",
              correct: false,
            },
            {
              label: "Flexible coping that can include rest and help-seeking.",
              correct: true,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 3,
      questions: [
        {
          prompt: "What does the enrolment increase establish?",
          options: [
            {
              label: "Every participant\u2019s attitude improved.",
              correct: false,
            },
            { label: "Equipment was irrelevant.", correct: false },
            { label: "The film alone caused the change.", correct: false },
            {
              label: "Participation rose; the cause remains uncertain.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which statement is an observation?",
          options: [
            {
              label: "A player declined the celebration invitation.",
              correct: true,
            },
            { label: "The player has a poor attitude.", correct: false },
            { label: "The player dislikes the team.", correct: false },
            { label: "The player is ungrateful.", correct: false },
          ],
        },
        {
          prompt: "What is an original classroom rating?",
          options: [
            { label: "A diagnostic test.", correct: false },
            {
              label: "A reliable selection measure by default.",
              correct: false,
            },
            { label: "Proof of treatment effectiveness.", correct: false },
            {
              label:
                "A reflection aid, not automatically a validated instrument.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which response addresses sporting conduct specifically?",
          options: [
            { label: "Label the whole person as bad.", correct: false },
            { label: "Ignore harm if the team wins.", correct: false },
            {
              label: "Assume a positive self-description proves fairness.",
              correct: false,
            },
            {
              label:
                "Describe the action, its impact and what repair is needed.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Why ask about the environment when participation is low?",
          options: [
            {
              label:
                "Access and treatment can affect participation independently of stated attitude.",
              correct: true,
            },
            { label: "A questionnaire reveals every cause.", correct: false },
            { label: "Every athlete has the same barriers.", correct: false },
            { label: "Attitudes never matter.", correct: false },
          ],
        },
      ],
    },
    {
      moduleNumber: 4,
      questions: [
        {
          prompt: "What does task cohesion concern?",
          options: [
            { label: "Identical personalities.", correct: false },
            { label: "Only friendship.", correct: false },
            { label: "Agreement with every decision.", correct: false },
            { label: "Coordination around shared objectives.", correct: true },
          ],
        },
        {
          prompt: "Which is a useful check-back?",
          options: [
            {
              label: "What role have we agreed for this drill?",
              correct: true,
            },
            { label: "Do you admit you lack commitment?", correct: false },
            { label: "Are you the weakest player?", correct: false },
            { label: "Why do you never listen?", correct: false },
          ],
        },
        {
          prompt: "How should language access be handled?",
          options: [
            {
              label: "Assume one language suits everyone equally.",
              correct: false,
            },
            {
              label: "Ask which explanation or demonstration format helps.",
              correct: true,
            },
            { label: "Treat clarification as low ability.", correct: false },
            { label: "Avoid explaining the task.", correct: false },
          ],
        },
        {
          prompt: "What does a leadership-style label establish?",
          options: [
            {
              label:
                "A broad description, not a complete judgement of the leader.",
              correct: true,
            },
            { label: "A guarantee of winning.", correct: false },
            { label: "A fixed personality diagnosis.", correct: false },
            { label: "Permission to ignore safeguarding.", correct: false },
          ],
        },
        {
          prompt: "Which team agreement respects privacy?",
          options: [
            { label: "Let captains publish private concerns.", correct: false },
            {
              label: "Require all diagnoses to be shared with teammates.",
              correct: false,
            },
            {
              label:
                "Explain a separate appropriate process for sensitive clinical information.",
              correct: true,
            },
            {
              label: "Make disclosure a condition of belonging.",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 5,
      questions: [
        {
          prompt: "What is the strongest basis for checking a programme?",
          options: [
            { label: "Only a claim of global recognition.", correct: false },
            {
              label:
                "Current official award and professional eligibility information.",
              correct: true,
            },
            { label: "Only testimonials.", correct: false },
            { label: "Only workplace logos.", correct: false },
          ],
        },
        {
          prompt: "Which activity can belong in a beginner\u2019s portfolio?",
          options: [
            {
              label: "A critical analysis of a fictional performance case.",
              correct: true,
            },
            {
              label: "An unauthorised diagnostic report on a teammate.",
              correct: false,
            },
            { label: "Invented client hours.", correct: false },
            {
              label: "Private athlete records copied without permission.",
              correct: false,
            },
          ],
        },
        {
          prompt: "Who determines medical return-to-play clearance?",
          options: [
            { label: "The athlete\u2019s classmates.", correct: false },
            { label: "Any person who teaches confidence.", correct: false },
            {
              label: "The appropriately qualified healthcare pathway.",
              correct: true,
            },
            { label: "An introductory quiz score.", correct: false },
          ],
        },
        {
          prompt:
            "What does a programme containing sports modules automatically establish?",
          options: [
            { label: "A protected title in every country.", correct: false },
            { label: "Guaranteed employment.", correct: false },
            { label: "Permission to diagnose.", correct: false },
            {
              label: "Its content, not every professional authority.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which career question is most useful?",
          options: [
            {
              label: "Which course removes the need for supervision?",
              correct: false,
            },
            {
              label:
                "What preparation supports the specific tasks and setting I am considering?",
              correct: true,
            },
            { label: "Which title guarantees prestige?", correct: false },
            { label: "Which job never involves pressure?", correct: false },
          ],
        },
      ],
    },
    {
      moduleNumber: 6,
      questions: [
        {
          prompt: "Which statement is correct?",
          options: [
            {
              label:
                "A teammate\u2019s prescription applies to the whole team.",
              correct: false,
            },
            {
              label:
                "A legal substance can still be unsafe for a particular athlete.",
              correct: true,
            },
            { label: "Legal means safe for everyone.", correct: false },
            {
              label:
                "Over-the-counter status guarantees competition permission.",
              correct: false,
            },
          ],
        },
        {
          prompt:
            "What is needed for a prevalence percentage to be meaningful?",
          options: [
            { label: "A confident tone.", correct: false },
            {
              label:
                "An identifiable source, population, definition and timeframe.",
              correct: true,
            },
            { label: "A large number alone.", correct: false },
            { label: "A celebrity example.", correct: false },
          ],
        },
        {
          prompt: "How should anti-doping rules be checked?",
          options: [
            { label: "Use any old list.", correct: false },
            {
              label: "Assume all sports use identical conditions.",
              correct: false,
            },
            {
              label:
                "Use the edition and conditions applicable to the competition date.",
              correct: true,
            },
            { label: "Rely on a product advertisement.", correct: false },
          ],
        },
        {
          prompt:
            "What is the priority in suspected overdose or severe withdrawal?",
          options: [
            { label: "A promise of secrecy instead of help.", correct: false },
            { label: "A class vote.", correct: false },
            {
              label: "Appropriate emergency or medical assistance.",
              correct: true,
            },
            { label: "A motivation worksheet first.", correct: false },
          ],
        },
        {
          prompt: "Which prevention approach addresses the organisation?",
          options: [
            { label: "Focus only on individual willpower.", correct: false },
            { label: "Reward hiding injuries.", correct: false },
            {
              label:
                "Make it possible to decline substances and seek help without avoidable pressure.",
              correct: true,
            },
            {
              label: "Treat every concern as misconduct before assessment.",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 7,
      questions: [
        {
          prompt: "What is psychological readiness?",
          options: [
            {
              label:
                "A relevant consideration that is not identical to medical clearance.",
              correct: true,
            },
            {
              label: "A score any classmate can use to approve sport.",
              correct: false,
            },
            { label: "Proof that tissue has healed.", correct: false },
            { label: "A replacement for medical assessment.", correct: false },
          ],
        },
        {
          prompt: "How should emotional responses to injury be understood?",
          options: [
            { label: "Everyone must show denial first.", correct: false },
            {
              label: "They vary and need not follow fixed stages.",
              correct: true,
            },
            {
              label: "Positive meaning is required before support.",
              correct: false,
            },
            { label: "Sadness proves failed rehabilitation.", correct: false },
          ],
        },
        {
          prompt: "What should happen after a suspected concussion?",
          options: [
            { label: "Judge safety only by confidence.", correct: false },
            {
              label: "Assume no visible injury means no concern.",
              correct: false,
            },
            {
              label:
                "Use the appropriate healthcare pathway rather than pushing through.",
              correct: true,
            },
            {
              label: "Use a motivational speech as clearance.",
              correct: false,
            },
          ],
        },
        {
          prompt: "Which transition conversation preserves choice?",
          options: [
            {
              label: "Insist that every athlete become a coach.",
              correct: false,
            },
            { label: "Require gratitude for the loss.", correct: false },
            { label: "Promise an effortless new career.", correct: false },
            {
              label:
                "Explore values, practical needs and several possible futures.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What does a missed rehabilitation task establish?",
          options: [
            {
              label: "Permission for a trainee to increase the exercise.",
              correct: false,
            },
            { label: "That the person will never recover.", correct: false },
            { label: "That the plan and barriers need review.", correct: true },
            { label: "A lack of character.", correct: false },
          ],
        },
      ],
    },
  ],
  PRPFA: [
    {
      moduleNumber: 1,
      questions: [
        {
          prompt: "What is PFA in this course?",
          options: [
            { label: "A guarantee against PTSD.", correct: false },
            {
              label:
                "Humane, supportive and practical help with attention to dignity and choice.",
              correct: true,
            },
            { label: "A replacement for emergency medicine.", correct: false },
            { label: "A compulsory trauma interview.", correct: false },
          ],
        },
        {
          prompt: "Which action belongs to Look?",
          options: [
            { label: "Assume calm people need nothing.", correct: false },
            { label: "Collect a detailed childhood history.", correct: false },
            {
              label: "Enter an unsafe scene without training.",
              correct: false,
            },
            {
              label:
                "Notice hazards and urgent needs before ordinary supportive contact.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Must Leela discuss the event to receive practical support?",
          options: [
            { label: "Only if she cries.", correct: false },
            { label: "Yes, otherwise support is ineffective.", correct: false },
            { label: "Only if a volunteer requests it.", correct: false },
            {
              label:
                "No; her immediate request can be addressed without disclosure.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What should happen before promising a shelter place?",
          options: [
            {
              label: "Assume yesterday\u2019s information is unchanged.",
              correct: false,
            },
            {
              label: "Ask the family to travel without checking.",
              correct: false,
            },
            { label: "Repeat a rumour confidently.", correct: false },
            {
              label:
                "Verify availability and access through the responsible service.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What makes Link more than handing over a number?",
          options: [
            { label: "Taking over every decision.", correct: false },
            {
              label: "Checking suitability, access and the agreed next action.",
              correct: true,
            },
            { label: "Guaranteeing long-term recovery.", correct: false },
            {
              label: "Collecting unnecessary private information.",
              correct: false,
            },
          ],
        },
      ],
    },
    {
      moduleNumber: 2,
      questions: [
        {
          prompt: "Which statement separates report from interpretation?",
          options: [
            {
              label:
                "The person says they feel unreal; the cause has not been established.",
              correct: true,
            },
            { label: "The person is refusing to recover.", correct: false },
            { label: "The person has PTSD.", correct: false },
            { label: "The person is definitely dissociating.", correct: false },
          ],
        },
        {
          prompt: "When is \u201cYou are safe now\u201d appropriate?",
          options: [
            { label: "Whenever it sounds reassuring.", correct: false },
            { label: "Whenever the person is crying.", correct: false },
            {
              label:
                "Only when the relevant safety conditions are actually known.",
              correct: true,
            },
            { label: "Before checking the environment.", correct: false },
          ],
        },
        {
          prompt:
            "What should happen if a grounding exercise increases discomfort?",
          options: [
            { label: "Treat refusal as noncompliance.", correct: false },
            { label: "Increase the intensity.", correct: false },
            { label: "Insist on completion.", correct: false },
            {
              label:
                "Stop and reconsider practical support or the appropriate professional pathway.",
              correct: true,
            },
          ],
        },
        {
          prompt: "What is the response to serious breathing difficulty?",
          options: [
            {
              label:
                "Use the appropriate medical pathway rather than assuming anxiety.",
              correct: true,
            },
            {
              label: "Ignore it until a worksheet is finished.",
              correct: false,
            },
            { label: "Prescribe breath-holding.", correct: false },
            { label: "Diagnose panic from appearance.", correct: false },
          ],
        },
        {
          prompt: "Which is a useful listening summary?",
          options: [
            { label: "You will be fine after this exercise.", correct: false },
            {
              label:
                "You want phone access and do not want to discuss the event; have I understood?",
              correct: true,
            },
            { label: "I know exactly how you feel.", correct: false },
            { label: "You secretly need to talk about it.", correct: false },
          ],
        },
      ],
    },
    {
      moduleNumber: 3,
      questions: [
        {
          prompt: "What is a closed-loop handover?",
          options: [
            { label: "Guaranteeing that no barrier remains.", correct: false },
            { label: "Sharing every personal detail.", correct: false },
            {
              label: "Checking receipt, next action and responsibility.",
              correct: true,
            },
            {
              label: "Sending a message and assuming care occurred.",
              correct: false,
            },
          ],
        },
        {
          prompt:
            "How should family reunification involving a child be handled?",
          options: [
            {
              label: "By posting identifying details publicly.",
              correct: false,
            },
            {
              label:
                "By allowing an untrained learner to investigate an allegation.",
              correct: false,
            },
            {
              label:
                "Through authorised safeguarding and verification procedures.",
              correct: true,
            },
            {
              label:
                "By handing the child to any adult claiming a relationship.",
              correct: false,
            },
          ],
        },
        {
          prompt: "What does a disability establish about decision-making?",
          options: [
            { label: "That consent is unnecessary.", correct: false },
            {
              label: "That the person cannot provide useful information.",
              correct: false,
            },
            {
              label: "That the helper must take over all choices.",
              correct: false,
            },
            {
              label:
                "Nothing automatic; abilities, preferences and access needs must be considered.",
              correct: true,
            },
          ],
        },
        {
          prompt: "Which statement about helper wellbeing is most appropriate?",
          options: [
            { label: "Only personal resilience matters.", correct: false },
            {
              label:
                "Workload, supervision and organisational conditions matter alongside individual care.",
              correct: true,
            },
            {
              label: "Mandatory emotional recounting is always required.",
              correct: false,
            },
            { label: "Breaks show weakness.", correct: false },
          ],
        },
        {
          prompt: "What does attendance at a community workshop show directly?",
          options: [
            { label: "That every participant recovered.", correct: false },
            { label: "That the programme prevented PTSD.", correct: false },
            { label: "That referrals are all effective.", correct: false },
            {
              label:
                "Its reach, not necessarily a reduction in mental illness.",
              correct: true,
            },
          ],
        },
      ],
    },
  ],
};
