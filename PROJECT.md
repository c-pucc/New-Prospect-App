# New Prospect App — Project Brief

## Overview

A call-prep tool for an Account Executive at Databricks covering PwC as a strategic customer account. The user inputs a prospect's LinkedIn profile URL and the app surfaces a structured intelligence brief: the prospect's likely organizational context, the initiatives and business units they support, the metrics they care about, the challenges they're likely facing, and tailored conversation angles for a Databricks sales motion.

---

## Problem Statement

PwC is a large, matrixed professional services firm where job titles on LinkedIn often obscure which Line of Service (LoS) someone belongs to, what practice or capability they sit within, and what they actually own or care about. An AE walking into a first meeting without this context risks misaligning the conversation — pitching the wrong use case, missing the right pain, or failing to connect Databricks value to what matters to that specific person.

---

## Target User

**Role**: Account Executive, Databricks
**Account**: PwC (sell-to motion, not sell-with)
**Use Case**: Pre-call prep for prospects within PwC the AE hasn't met yet but has a scheduled meeting with

---

## Core Workflow

```
1. Paste LinkedIn profile URL (or paste profile text directly)
2. App parses role, title, tenure, stated skills, and any visible project/experience details
3. User tags the Line of Service (or selects Custom)
4. User optionally adds a sub-practice note (e.g., "Advisory > Oracle Practice")
5. App generates a structured brief:
   - Organizational context: likely initiatives and business units this person supports
   - Metrics this role/persona typically owns or is measured against
   - Likely individual challenges they're navigating
   - Databricks-specific conversation angles and talking points
```

---

## PwC Organizational Structure

PwC US operates across four primary Lines of Service (LoS), each with distinct sub-practices, buyer profiles, and data/AI priorities.

### Lines of Service

| LoS | Short Description |
|-----|-------------------|
| **Advisory** | Consulting, deals, technology transformation, risk advisory |
| **Assurance** | External audit, financial reporting, ESG assurance |
| **Tax** | Tax compliance, planning, transfer pricing, legal services |
| **Internal Firm Services (IFS)** | Shared services running PwC as a business: IT, Finance, HR, Marketing, Risk & Quality |
| **Custom** | User-defined for emerging or less common LoS designations |

---

## Feature Requirements

### 1. LinkedIn Profile Input
- Accept a LinkedIn URL or pasted profile text
- Parse: title, current role, tenure, employer history, stated skills, education, any visible certifications
- Flag ambiguity if LoS cannot be inferred from the profile

### 2. Line of Service Tagging
- Radio button or dropdown selection:
  - Advisory
  - Assurance
  - Tax
  - Internal Firm Services
  - Custom (free text field)
- Optional sub-practice / capability note field (free text)
  - Example: "Advisory > Oracle Practice"
  - Example: "Advisory > Financial Crime & Fraud"
  - Example: "Tax > Transfer Pricing"
  - Example: "IFS > Enterprise Technology (ET)"

### 3. Generated Intelligence Brief

The brief is structured into four sections for every prospect:

#### A. Organizational Context
- What initiatives and/or business units this person likely supports
- Where they sit in the PwC hierarchy (Partner, MD, Director, Senior Manager, Manager, etc.)
- Who they likely report to and who likely reports to them
- Internal stakeholders they work with

#### B. Metrics They Care About
- The KPIs, OKRs, or business outcomes this role is typically measured against
- Revenue/margin metrics where relevant (for client-facing roles)
- Operational metrics (project delivery, utilization, headcount) for internal roles

#### C. Individual Challenges
- The friction points, pressures, and pain this persona typically navigates
- Technology gaps, data maturity issues, competitive pressures, regulatory burdens
- People/talent challenges, organizational dynamics

#### D. Databricks Conversation Angles
- Specific Databricks capabilities most relevant to this persona
- How to frame the conversation (ROI, risk reduction, speed-to-insight, competitive differentiation)
- Questions to ask that surface latent pain
- Stories or reference customers that resonate

---

## Lines of Service Deep Dive

### Advisory

**Sub-Practices / Capabilities**
- Management Consulting (Strategy, Operations, Human Capital)
- Technology Consulting (Oracle, SAP, Salesforce, Cloud & Digital, Emerging Tech)
- Deals (M&A Advisory, Valuations, Restructuring, Transaction Services)
- Risk (Financial Crime, Cyber, Regulatory, Internal Audit)
- Forensics

**Key Initiatives They Support**
- Client digital transformation programs (ERP migrations, cloud modernization)
- AI/ML capability build-out for clients
- Data strategy and analytics platform implementations
- Risk and compliance program delivery
- Cost transformation and operational efficiency engagements

**Metrics They Care About**
- Engagement revenue and margin (billable hours, realization rate)
- Utilization rate
- Client satisfaction / Net Promoter Score (internal)
- New business pipeline from existing engagements (cross-sell)
- Headcount and capability mix on engagements
- Time-to-delivery on client deliverables
- Quality / rework rate on deliverables

**Individual Challenges**
- Scaling delivery without proportionally growing headcount (AI-assisted delivery)
- Differentiating PwC's tech offerings from Deloitte, EY, Accenture, and McKinsey
- Building proprietary IP and accelerators to win and deliver faster
- Managing subcontractor and third-party data on engagements
- Keeping practitioners current on fast-moving AI/data tooling
- Selling and delivering AI projects where client data is messy or siloed
- Demonstrating ROI on large transformation programs

**Databricks Conversation Angles**
- Databricks as the platform Advisory builds on when delivering data & AI engagements for clients
- Accelerator and IP development: can PwC build reusable assets on Databricks (Mosaic AI, notebooks, Delta sharing)?
- AI-assisted delivery: using Databricks internally to speed up engagement analytics and reporting
- Winning deals: PwC + Databricks as a joint solution story for client proposals
- Reference: how other Big 4 / consulting firms are using Databricks to differentiate delivery

---

### Assurance

**Sub-Practices / Capabilities**
- External Audit (financial statement audit)
- Capital Markets & Accounting Advisory (CMAAS)
- ESG & Sustainability Assurance
- Trust & Transparency (data/AI audit)

**Key Initiatives They Support**
- Annual audit cycles across client portfolios
- ESG reporting and assurance mandates (SEC climate rules, CSRD)
- Audit quality and efficiency improvement programs
- AI-assisted audit tool development (Aura, Halo)
- Risk-based audit methodology transformation

**Metrics They Care About**
- Audit quality ratings (PCAOB inspection results)
- Audit efficiency: hours per engagement, automation rate
- On-time delivery of audit opinions
- Regulatory compliance: zero material weaknesses or findings
- Revenue per partner
- Staff retention and pipeline (audit has high turnover)

**Individual Challenges**
- Increasing regulatory scrutiny from PCAOB and SEC
- Talent shortage — audit is hard to staff and has high attrition
- Pressure to automate repetitive audit procedures without sacrificing quality
- Growing volume of unstructured and non-financial data to audit (ESG, AI systems)
- Clients pushing for faster close cycles, shortening audit windows
- Keeping up with client complexity: crypto, SPACs, international entities

**Databricks Conversation Angles**
- Audit analytics at scale: processing large client datasets (GL, sub-ledgers, transactions) faster than sampling
- ESG data management: ingesting, transforming, and assuring non-financial data
- AI-assisted audit procedures: ML anomaly detection on journal entries, revenue recognition
- Internal efficiency: Databricks for internal audit operations data
- Caution: Assurance has strict independence rules — position carefully around client data usage

---

### Tax

**Sub-Practices / Capabilities**
- Tax Compliance & Reporting (corporate, partnership, international)
- Transfer Pricing
- Mergers & Acquisitions Tax
- Indirect Tax (VAT, sales tax)
- Global Mobility / Employment Tax
- Legal Services
- Tax Technology & Transformation

**Key Initiatives They Support**
- Tax provision and ASC 740 reporting
- Pillar Two / OECD global minimum tax compliance (major right now)
- ERP-driven tax transformation (SAP, Oracle tax modules)
- Transfer pricing documentation and defense
- Tax data and technology modernization
- Cross-border transaction structuring

**Metrics They Care About**
- Effective tax rate management for clients
- Compliance filing accuracy and on-time delivery
- Revenue per engagement
- Penalty exposure avoided for clients
- Tax savings / cash tax benefit delivered to clients
- Utilization rate
- Automation rate of compliance workflows

**Individual Challenges**
- Pillar Two compliance is generating enormous data complexity — gathering data from 100+ jurisdictions
- Tax data is fragmented across ERPs, spreadsheets, and local country systems
- Talent: tax professionals are not data engineers; bridging that gap is hard
- Increasing regulatory complexity globally
- Clients demanding real-time tax reporting vs. annual cycles
- Building scalable tax technology solutions without losing subject matter control

**Databricks Conversation Angles**
- Pillar Two data aggregation: ingesting multi-jurisdiction ERP data into a unified platform for OECD compliance calculations
- Tax data lakehouse: replacing fragmented spreadsheet-based processes
- Transfer pricing analytics: large-volume transaction data analysis at scale
- Tax technology modernization: Databricks as the backend for PwC's proprietary tax tools
- Partner / alliance angle: does PwC Tax have a technology practice that builds on Databricks?

---

### Internal Firm Services (IFS)

**Sub-Practices / Capabilities**
- Enterprise Technology (ET) — the internal IT organization
- Finance (CFO org, FP&A, Controller)
- Human Capital (HR, Talent, L&D)
- Marketing & Sales (Markets)
- Risk & Quality (R&Q)
- Legal, General Counsel
- Real Estate & Facilities
- Strategy & Transformation (internal)

**Key Initiatives They Support**
- PwC's own digital transformation (modernizing internal systems)
- AI enablement for the firm (internal AI tools, ChatPwC, etc.)
- People analytics and workforce planning
- Finance transformation (ERP modernization, FP&A automation)
- Cybersecurity and data governance
- Cost optimization across firm operations

**Metrics They Care About**
- Internal cost per transaction / cost of service delivery
- System uptime and reliability
- Headcount and workforce planning accuracy
- Talent acquisition and retention metrics
- Internal NPS / employee satisfaction
- Audit readiness and internal control effectiveness
- Technology adoption rates across the firm

**Individual Challenges**
- Running a global professional services firm's internal systems at scale
- Enabling AI for 70,000+ US staff without compromising independence or confidentiality
- Data fragmentation across dozens of internal systems (HR, Finance, CRM, project management)
- Building internal analytics capabilities when the best talent joins client-facing practices
- Justifying internal technology investment to partner leadership
- Governance and security for a firm with strict confidentiality obligations to clients
- Shadow IT sprawl as individual practices build their own tools

**Databricks Conversation Angles**
- Databricks as PwC's internal data platform — unifying HR, Finance, and operational data
- People analytics: attrition prediction, skills gap analysis, workforce planning
- FP&A modernization: replacing Excel-based models with scalable pipelines
- AI governance: using Unity Catalog and MLflow to govern internal AI/ML models
- IFS buyer is often the fastest path to enterprise-wide adoption — land in IFS, expand to LoS

---

## Data Model (Prospect Brief Schema)

```
Prospect {
  linkedin_url: string
  full_name: string
  current_title: string
  seniority_level: enum [Partner, Managing Director, Director, Senior Manager, Manager, Senior Associate, Associate, Specialist]
  line_of_service: enum [Advisory, Assurance, Tax, IFS, Custom]
  custom_los_label: string?          // populated if LoS = Custom
  sub_practice_note: string?         // free text, e.g. "Advisory > Oracle Practice"
  tenure_at_pwc_years: number
  prior_employers: string[]
  stated_skills: string[]
  certifications: string[]
  education: string[]

  generated_brief {
    organizational_context: {
      likely_initiatives: string[]
      business_units_supported: string[]
      reporting_structure_note: string
      internal_stakeholders: string[]
    }
    metrics_they_care_about: string[]
    individual_challenges: string[]
    databricks_conversation_angles: {
      relevant_capabilities: string[]
      framing_approach: string
      questions_to_ask: string[]
      reference_customers: string[]
    }
  }
}
```

---

## UX Considerations

- **Speed matters**: The AE is prepping between meetings. The brief should be scannable in 5 minutes.
- **Confidence indicators**: Where the app is inferring from the profile vs. the user's tags, show it. "Inferred from title" vs. "User-tagged."
- **Editable brief**: Let the AE annotate or override any section before saving or exporting.
- **Export**: PDF or copy-to-clipboard for pasting into Salesforce / email notes.
- **Session persistence**: Save briefs per prospect so they can be revisited.

---

## Open Questions

1. **LinkedIn scraping**: Does the app accept a URL (requiring a scraper or browser extension) or pasted text from the profile? LinkedIn restricts programmatic access — pasted text may be the safer MVP approach.
2. **LLM backend**: What model powers the brief generation? Claude is the natural fit given the nuanced, persona-specific reasoning required.
3. **PwC org data**: Should the app have a static knowledge base of PwC's practice structure baked in, or rely entirely on LLM knowledge?
4. **Authentication**: Is this a personal tool (no auth needed) or multi-user (other AEs on the Databricks PwC account team)?
5. **CRM integration**: Should briefs sync to Salesforce activity or just live in the app?
6. **Competitive intelligence**: Should the brief include a section on what other platforms/vendors this prospect likely uses or has worked with?

---

## MVP Scope

For the first version, prioritize:

1. Pasted LinkedIn text as input (avoid scraping complexity)
2. Manual LoS tagging + sub-practice note
3. LLM-generated brief covering all four sections (organizational context, metrics, challenges, Databricks angles)
4. Clean, readable output UI
5. Copy-to-clipboard export

Defer for later:
- LinkedIn URL scraping
- CRM sync
- Multi-user / auth
- Saved brief history
- Competitive intelligence section
