export interface StudySlot {
  id: string; // e.g., "day1-slot1"
  name: string; // "Slot 1"
  timeRange: string; // "07:00 AM – 10:00 AM"
  baseStartMinutes: number; // minutes from midnight: 7 AM = 420
  baseEndMinutes: number; // minutes from midnight: 10 AM = 600
  topics: string;
  trendAnalysis?: string;
  marks?: number;
  draftingFocus?: string;
}

export interface DayPlan {
  id: number; // 1 to 7
  date: string; // "May 24", "May 25", etc.
  dayName: string; // "Sunday", "Monday", etc.
  title: string; // "ESG: The 65-Mark Governance Core"
  trendAnalysis: string;
  slots: StudySlot[];
}

export const scheduleData: DayPlan[] = [
  {
    id: 1,
    date: "May 24",
    dayName: "Sunday",
    title: "ESG: The 65-Mark Governance Core",
    trendAnalysis: "ICSI almost always dedicates Part I (65 Marks) to Board composition, Board Committees (Audit, NRC, Stakeholder), and CSR/Sustainability policies. Questions are usually structured as: 'Advise the Board on whether this specific committee composition is valid under LODR.'",
    slots: [
      {
        id: "day1-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Board Effectiveness, independent directors' criteria, and mandatory board committees (Composition, quorum, and powers under Companies Act vs. SEBI LODR).",
        marks: 65,
        trendAnalysis: "Look for questions checking independent director criteria (Section 149(6) vs LODR Reg 16)."
      },
      {
        id: "day1-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Scan past questions on Corporate Governance failures. Master the legislative frameworks (Companies Act, 2013 and global trends like OECD principles).",
        trendAnalysis: "Master the Satyam, Enron, and Maxwell corporate failures. OECD principles are tested direct as short notes."
      },
      {
        id: "day1-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "The 15-Mark Draft: Deed of Sale, Lease Deed, or Gift Deed in Question 1 or 2.",
        draftingFocus: "Practice drafting core clauses (Consideration, Habendum, Covenant for quiet enjoyment, Testimonium) for commercial deeds.",
        marks: 15
      }
    ]
  },
  {
    id: 2,
    date: "May 25",
    dayName: "Monday",
    title: "CMADD: The 40-Mark Compliance & Sign-offs",
    trendAnalysis: "Part I of CMADD frequently tests the establishment of a Compliance Dashboard and the legal consequences of non-compliance, specifically corporate relief options and compounding.",
    slots: [
      {
        id: "day2-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Scope of compliance framework, establishing corporate compliance dashboards, and tracking dynamic regulatory changes.",
        marks: 40,
        trendAnalysis: "Focus on corporate compliance framework components and dynamic compliance tracking."
      },
      {
        id: "day2-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Compounding of Offences (Section 441), seeking absolute/conditional relief, and resolving structural non-compliances.",
        trendAnalysis: "Compounding of offences is a major practical area. Study who can compound (NCLT vs RD) and limits."
      },
      {
        id: "day2-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "Pleadings & Court Formats: Plaint or a Written Statement for a recovery suit.",
        draftingFocus: "Master the 'Verification' and 'Affidavit' components that follow pleadings. This is a regular 10-mark question.",
        marks: 10
      }
    ]
  },
  {
    id: 3,
    date: "May 26",
    dayName: "Tuesday",
    title: "Elective: CSR Section 135 Calculations",
    trendAnalysis: "In the CSR elective, ICSI rarely asks direct theory. Instead, they give a company's financial data for the last 3 years and ask you to compute the mandatory CSR spend, identify if a CSR committee is needed, and handle unspent amounts.",
    slots: [
      {
        id: "day3-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Section 135 in absolute detail. Net Worth (>= 500 Cr), Turnover (>= 1000 Cr), and Net Profit (>= 5 Cr) criteria. Practice the 3-year average net profit calculation.",
        marks: 50,
        trendAnalysis: "Practice adjustments under Section 198 (exclusion of overseas branch profits and inter-corporate dividends)."
      },
      {
        id: "day3-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Unspent CSR Account rules (Ongoing vs. Other projects timelines), treatment of surplus generated from CSR assets, and set-off provisions. Schedule VII permitted/prohibited activities.",
        trendAnalysis: "Study the timeline: 30 days for ongoing projects to Unspent CSR A/c, 6 months for other projects to Schedule VII Fund."
      },
      {
        id: "day3-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "Company Law Drafts: Board Resolutions and AGM Notices.",
        draftingFocus: "Practice drafting Board Resolutions (approving financial statements, shifting registered office) and notices for Annual General Meetings (AGM).",
        marks: 10
      }
    ]
  },
  {
    id: 4,
    date: "May 27",
    dayName: "Wednesday",
    title: "CMADD: Secretarial Audit (MR-3) & Diligence",
    trendAnalysis: "Part II of CMADD is the highest-yielding section. ICSI routinely gives a practical scenario where a Company Secretary uncovers a fraud/non-compliance and asks: 'How will you qualify this in your Secretarial Audit Report (Form MR-3)?'",
    slots: [
      {
        id: "day4-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Secretarial Audit applicability, the process of conducting the audit, and the structure/modules of Form MR-3. Auditor’s liability for false statements.",
        marks: 60,
        trendAnalysis: "Applicability is tested: Listed companies, Public companies with Capital >= 50Cr or Turnover >= 250Cr, or outstanding loans >= 100Cr."
      },
      {
        id: "day4-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Takeover Due Diligence, Legal Due Diligence, and Issue Due Diligence checklists. Review specific hidden liabilities an auditor must look for during M&A.",
        trendAnalysis: "Master M&A checklists, hidden liabilities (contingent tax claims, environmental claims, undisclosed warranties)."
      },
      {
        id: "day4-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "Appeals & Petitions: Formatting of an Appeal to NCLAT or SAT.",
        draftingFocus: "Memorize the standard format for indexing, stating the grounds of appeal, and the prayer clause.",
        marks: 10
      }
    ]
  },
  {
    id: 5,
    date: "May 28",
    dayName: "Thursday",
    title: "ESG Risk & Reporting & CSR Social Audit",
    trendAnalysis: "Recent papers are hyper-focused on BRSR (Business Responsibility and Sustainability Reporting) and the Social Stock Exchange (SSE). Expect analytical questions combining ESG reporting obligations with CSR spending metrics.",
    slots: [
      {
        id: "day5-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Risk Management frameworks (ERM), sustainability reporting models (GRI, Integrated Reporting framework), and the mandatory pillars of BRSR Core.",
        marks: 35,
        trendAnalysis: "Master the 9 principles of National Guidelines on Responsible Business Conduct (NGRBC) which form BRSR."
      },
      {
        id: "day5-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Social Governance frameworks, Social Stock Exchange (SSE) listing requirements for NPOs, and the methodologies used in a Social Audit.",
        marks: 50,
        trendAnalysis: "Focus on SSE eligibility for NPOs (registration, annual disclosure) and social impact assessment methods."
      },
      {
        id: "day5-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "Power of Attorney & Miscellaneous Drafts: General vs. Special Power of Attorney, Indemnity Bonds, and Guarantee Deeds.",
        draftingFocus: "Practice drafting General vs. Special POA, Indemnity Bonds, and Guarantee Deeds. Compulsory 5-mark short-notes.",
        marks: 5
      }
    ]
  },
  {
    id: 6,
    date: "May 29",
    dayName: "Friday",
    title: "Full-Scale Past Paper Simulation",
    trendAnalysis: "Time management is where most students falter in CMADD and ESG because the case studies are lengthy. Reading past papers comprehensively on this day trains your brain to spot the relevant sections quickly.",
    slots: [
      {
        id: "day6-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Sit with the June 2025 and December 2024 papers for ESG. Don't write full answers, but mentally map out the sections/provisions for every question.",
        trendAnalysis: "Practice spotting the core provisions. Look for board composition traps and CSR committee triggers in old papers."
      },
      {
        id: "day6-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Do the exact same mental mapping exercise for the CMADD papers. Check your answers against the ICSI Suggested Answers to see if your conclusions match.",
        trendAnalysis: "Review suggested answers to understand the exact keywords ICSI examiners expect (e.g. Section numbers, landmark cases)."
      },
      {
        id: "day6-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "Art of Advocacy & Appearances. Revise the theoretical chapters of Drafting.",
        draftingFocus: "Study professional conduct, dress code (gown, bands), courtroom etiquette, and regular applications before NCLT, NCLAT, and CCI."
      }
    ]
  },
  {
    id: 7,
    date: "May 30",
    dayName: "Saturday",
    title: "The 'Master Checklist' Consolidation",
    trendAnalysis: "Run through your lists, limits, templates, and final skeleton layouts on this last day. Ensure memory retention of specific legal sections.",
    slots: [
      {
        id: "day7-slot1",
        name: "Slot 1",
        timeRange: "07:00 AM – 10:00 AM",
        baseStartMinutes: 420,
        baseEndMinutes: 600,
        topics: "Formula and limit list consolidation. Run through CSR (Section 135) and Corporate Governance (LODR limits for independent directors, meeting frequency, audit committee quorums).",
        trendAnalysis: "Revise limits: LODR Reg 17 (Board), Reg 18 (Audit), Reg 19 (NRC), Reg 20 (SRC). Write down CSR net profit adjustments."
      },
      {
        id: "day7-slot2",
        name: "Slot 2",
        timeRange: "01:00 PM – 04:00 PM",
        baseStartMinutes: 780,
        baseEndMinutes: 960,
        topics: "Secretarial Audit Report (MR-3) Structure. Revise the 5 distinct components of MR-3 and core compliance penalties from CMADD.",
        trendAnalysis: "MR-3 structure check: 1. Companies Act, 2. SCRA, 3. Depositories Act, 4. FEMA, 5. SEBI Act & Regulations."
      },
      {
        id: "day7-slot3",
        name: "Slot 3 (Drafting)",
        timeRange: "06:30 PM – 09:30 PM",
        baseStartMinutes: 1110,
        baseEndMinutes: 1290,
        topics: "Deed Skeleton Layout Visualization.",
        draftingFocus: "Visualize the skeleton layout of drafts. Ensure you can replicate the exact opening recitals, testatum, habendum, redendum, covenants, and testimonium."
      }
    ]
  }
];

export const motivationalQuotes = [
  {
    text: "Governance is not about rules; it is about character.",
    author: "ICSI Governance Manual"
  },
  {
    text: "Compliance is the floor, but governance is the ceiling. Aim high.",
    author: "Boardroom wisdom"
  },
  {
    text: "The secret of success is consistency of purpose.",
    author: "Benjamin Disraeli"
  },
  {
    text: "In drafting deeds, precision is your shield; clarity is your sword.",
    author: "Legal Drafting Precedent"
  },
  {
    text: "Drafting is the legal translation of human intention. Make it watertight.",
    author: "Advocacy Principles"
  },
  {
    text: "Auditing is not just checking records; it is establishing trust.",
    author: "Audit Council"
  },
  {
    text: "Success in professional exams is a combination of technical knowledge and mental endurance.",
    author: "CS Ranker Advice"
  },
  {
    text: "A good corporate secretary is the conscience-keeper of the board.",
    author: "Corporate Governance Review"
  },
  {
    text: "The path to becoming a CS is built slot by slot, clause by clause.",
    author: "Pre-exam motivation"
  },
  {
    text: "Responsibility isn't a cost; it's an investment in a sustainable society.",
    author: "Section 135 CSR Philosophy"
  },
  {
    text: "An independent director is the guardian of minority shareholder interests.",
    author: "LODR Commentary"
  },
  {
    text: "Keep pushing. The legal minds of tomorrow are forged in the focused slots of today.",
    author: "Mentorship Quote"
  }
];
