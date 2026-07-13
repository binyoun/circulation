# Circulation: Cupping, Colour, and Collective Sensing
## Pre-Drafted Monthly WIP Reports: August, September, October, November 2026

Each draft follows the RMIT SCD Seed Funding WIP template. Square brackets mark values to fill from actuals before submission. Written so that each month's report only needs 30 to 60 minutes of editing, not writing. No em-dashes used anywhere.

---

# REPORT 1 — Submitted first week of AUGUST (covers July)

## Section 1. Grant Information
| | |
|---|---|
| Project Title | Circulation: Cupping, Colour, and Collective Sensing |
| Project Lead | Bin Youn |
| Project Members | Dr. Patrick Hartono, Dr. Renusha Athugala |
| Meeting date | [date] August 2026 |

## 1. Project Milestones

| No. | Milestone | Status | PIC | Description of impact / justification |
|---|---|---|---|---|
| 1 | Hardware procurement (ESP32, FSR, MAX30102, LED) | Complete | Bin Youn | All core components received and individually verified (June). |
| 2 | Installation concept and spatial sketch | Complete | Bin Youn | Triadic interaction model, device form, and ambient layer established (June). |
| 3 | Ethics application for participant interaction data | Complete / In Progress | Bin Youn | Application submitted [date] July to RMIT ethics, covering anonymised grip-pressure and pulse-rhythm data collection in structured studio sessions (October to November 2026). Approval expected [expected date]. Early submission protects the publication plan. |
| 4 | Research tool and software activation | Complete | Bin Youn | Claude AI (Anthropic) research subscription, Flux.ai AI-assisted PCB design, and TouchDesigner licence activated [dates] July. All development tooling in place ahead of the August build phase; expenditure recorded on Workday within this period. |
| 5 | Research assistant recruitment | Complete / In Progress | Bin Youn | Role posted via RMIT TALENTNET [date] July; [candidate identified / interviews held]; engagement begins 1 August through mid September, aligned with firmware development and installation. |
| 6 | Sensor validation and simulation setup | In Progress | Bin Youn | Initial MAX30102 placement test conducted confirming the fingertip-well approach [adjust to actual finding]. Wokwi simulation project established for ESP32 interaction logic; recorded PPG datasets sourced for replay testing prior to hardware integration. |

## 2. Contribution from listed partners
Patrick Hartono contributed to the OSC communication schema and the treatment of grip gesture and pulse rhythm as compositional material, drawing on his NIME and electroacoustic background. Renusha Athugala contributed to the interaction vocabulary for the August internal pilot, defining grip-style categories drawn from gesture-based interaction design.

## 3. Project progress (200-300 words)
July was designed as a preparation month with three administrative objectives, all completed on schedule.

First, the project's research infrastructure was activated. AI research subscriptions (Claude AI for research and development support, Flux.ai for AI-assisted PCB design) and the TouchDesigner licence were purchased in early July, ensuring the full software toolchain is in place before the intensive August build phase and that expenditure under budget lines 2 and 4 is recorded within this reporting period.

Second, the ethics application covering collection of anonymised physiological interaction data was submitted on [date]. This is the critical-path item for the publication plan, since both the target paper and the non-traditional research output depend on ethics-approved participant data from the structured triad sessions planned for October and November. Submitting in July provides [X] weeks of lead time before those sessions.

Third, research assistant recruitment was completed via RMIT TALENTNET. The engagement has been scheduled for 1 August to mid September, a deliberate revision from the original September-October window, so that embedded systems expertise directly supports firmware development and fabrication rather than arriving after the core build.

Technical groundwork also began: an initial sensor placement test [describe one-line result], and a Wokwi simulation environment was established for testing interaction logic against recorded PPG datasets before hardware integration.

The project remains on schedule. August is the primary build month: firmware, the sync hub, enclosure fabrication, and an internal pilot with approximately ten colleagues.

## 4. Expenditures (fill from Workday)
| No | Item | Approved (VND) | Workday | Rate |
|---|---|---|---|---|
| 1 | Hardware and electronics | 20,000,000 | [ ] | [ ] |
| 2 | AI research tool subscriptions | 10,000,000 | [ ] | [ ] |
| 3 | Fabrication and prototyping | 10,000,000 | [ ] | [ ] |
| 4 | Software licences | 10,000,000 | [ ] | [ ] |
| 5 | Research assistant | 20,000,000 | [ ] | [ ] |
| 6 | Exhibition, workshop, documentation | 15,000,000 | [ ] | [ ] |
| 7 | Website and archive | 5,000,000 | [ ] | [ ] |
| | **Total** | **90,000,000** | [ ] | [ ] |

## 5. Challenges and Solutions
[Keep only what actually occurred; candidates below.]
Ethics timeline: approval lead time remains the main schedule dependency; mitigated by July submission and by using staff participants for the August pilot under standard internal arrangements.
PPG and grip interaction: strong grip can occlude capillary blood flow and degrade pulse signal; mitigated by a dedicated fingertip contact well, a firmware signal quality index with graceful neutral fallback, and weighting the synchrony metric toward behavioural convergence.
[Any sourcing or recruitment issue that actually arose.]

## 6. Publication plan
Unchanged: primary traditional target SIGGRAPH Asia 2027 Art Papers (draft November 2026); primary NTOR target Ars Electronica Festival 2027 open call. Paper structure agreed among authors, modelled on the system-plus-deployment format of Zhang, Hartono and Hall (C&C 2026).

---

# REPORT 2 — Submitted first week of SEPTEMBER (covers August)

## 1. Project Milestones

| No. | Milestone | Status | PIC | Description of impact / justification |
|---|---|---|---|---|
| 1-5 | (Carried milestones) | Complete | | As reported in August. |
| 6 | Sensor validation and signal quality study | Complete | Bin Youn / RA | Fingertip-well PPG placement validated: [one-line result, e.g. reliable pulse lock within X seconds for Y of Z testers]. Sealed-dome barometric sensing tested in enclosure iteration 2: [adopted / retained FSR primary]. |
| 7 | Firmware state machine and sync hub | Complete / In Progress | RA / Bin Youn / Patrick Hartono | Interaction states implemented (idle, reading, element lock, pairing, triadic sync, bloom). Each cup computes its own Five Elements reading on-device; cups communicate over OSC via Wi-Fi to the sync hub, which republishes to TouchDesigner for the ambient layer. [State of completion.] |
| 8 | Enclosure fabrication (two iterations) | Complete / In Progress | Bin Youn / RA | [Iteration 1 and 2 outcomes; material choice; wipeable sealed shells for public handling.] |
| 9 | Internal pilot and calibration (approx. 10 staff) | Complete | All | [N] colleagues tested [M] grip styles; signal quality logged per style forming the calibration dataset; protocol rehearsed ahead of ethics-approved public collection. Key finding: [one line]. |
| 10 | Dry-run installation | In Progress | All | Scheduled [date] early September in [RMIT studio space]; includes charging system, hygiene protocol, ambient calibration. |
| 11 | Ethics approval | [Complete / In Progress] | Bin Youn | [Approval received [date] / status update and contingency]. |

## 2. Contribution from listed partners
Patrick Hartono led the sonic and temporal design of the state transitions and co-developed the Five Elements mapping thresholds with the calibration data. Renusha Athugala designed the pilot protocol and interaction vocabulary, and led participant experience observation during the internal pilot.

## 3. Project progress (200-300 words)
August was the primary build month and the period of research assistant engagement. [Opening line on overall status.]

Firmware development proceeded on schedule. The three devices now run the full interaction state machine, from individual reading through element lock to paired and triadic synchronisation, with a signal quality index that returns the cup to a neutral breathing state whenever pulse lock is lost, ensuring the installation never visibly fails in use. Each cup computes its own reading on-device; collective synchronisation runs in the sync hub, which receives OSC from all three cups and republishes to TouchDesigner for the ambient room layer. Keeping the cups self-sufficient proved [observation on robustness/debuggability].

Enclosure fabrication completed two iterations. [Two to three sentences: materials, the sealed-dome barometric test result, final shell choice, hygiene considerations.]

The internal pilot engaged [N] RMIT colleagues across [M] defined grip styles. [Two to three sentences: signal quality findings, calibration thresholds derived, any surprises.] The pilot doubled as a rehearsal of the data collection protocol ahead of the ethics-approved public deployment.

[Ethics status sentence.]

September is integration month: the triad completed and synchronised through the hub, enclosure iteration two, and rehearsal sessions with real triads in the RMIT studio, preparing the protocol for the ethics-approved data sessions in October and November.

## 4-6. [Expenditure table as above; Challenges from actuals; Publication plan unchanged, add: figure shot list prepared for October documentation.]

---

# REPORT 3 — Submitted first week of OCTOBER (covers September)

## 1. Project Milestones

| No. | Milestone | Status | PIC | Description of impact / justification |
|---|---|---|---|---|
| 10 | Studio installation | Complete | All | Conducted [date]; [one-line outcome; adjustments made]. |
| 11 | Triad integration and rehearsal sessions | Complete | All | Three devices synchronised through the hub in the RMIT studio; [N] complete triadic rehearsal sessions with [N] participants; session protocol finalised for the ethics-approved October and November data sessions. |
| 12 | Documentation and data analysis | In Progress | Bin Youn / Renusha Athugala | Build photography ongoing; professional video shoot scheduled [date] November on the finished system; interaction data pipeline verified on rehearsal logs. |

## 2. Contribution from listed partners
[Patrick: technical operation and sound/ambient calibration during rehearsals. Renusha: session protocol design, participant observation fieldnotes.]

## 3. Project progress (200-300 words)
The project reached its central build milestone: the full triad, three devices synchronised through the hub, running in the studio with real participants.

[Paragraph: integration account. Rehearsal session counts, memorable participant responses (two or three anonymised quotes noted in fieldnotes for the paper), operational notes such as battery rotation and hygiene protocol performance across long sessions.]

[Paragraph: data. Rehearsal sessions logged, signal quality overview, early observed patterns in synchronisation behaviour, element distribution across participants.]

[Paragraph: any technical incidents and fixes, honestly stated, and what they contribute to the paper's design implications.]

October focuses on completion and evidence: the ambient room layer (TouchDesigner), endurance testing of the full system, and the ethics-approved structured data sessions that form the paper's empirical basis.

## 5. Challenges and Solutions
[From actuals. Candidates: studio access and scheduling, participant recruitment for sessions, signal quality across diverse hands, ambient layer calibration.]

## 6. Publication plan
On track. Fieldnotes, participant reflections, and interaction logs from [N] sessions now constitute the empirical basis for the SIGGRAPH Asia 2027 Art Papers submission. Documentation shoot [date] produces the Ars Electronica 2027 dossier material.

---

# REPORT 4 — Submitted first week of NOVEMBER (covers October)

## 1. Project Milestones

| No. | Milestone | Status | PIC | Description of impact / justification |
|---|---|---|---|---|
| 12 | Documentation and data analysis | Complete | Bin Youn / Renusha Athugala | Professional video ([duration]) and photography set complete to submission standard. Interaction data from [N] sessions analysed: [one-line headline finding]. Project website live at [URL] as 10-year archive. |
| 13 | Research outputs | In Progress | All | Full paper draft [X]% complete targeting SIGGRAPH Asia 2027 Art Papers; Ars Electronica 2027 dossier assembled; Tier 1 funding dossier in preparation. |

## 3. Project progress (200-300 words)
October converted the finished system into research evidence: the room layer running, endurance proven, and the structured data sessions completed.

[Paragraph: documentation. Video shoot outcome, photographic set, website launch with archive structure.]

[Paragraph: analysis. Headline findings from interaction data: session durations, synchronisation attainment rates, behavioural versus pulse convergence patterns, element distribution. Two or three sentences maximum, written as findings.]

[Paragraph: writing. Paper draft status, section ownership among the three authors, mentor review scheduled with Dr. Monz [date]. Ars dossier contents: video, image set, concept statement, technical rider.]

November completes the funded period: paper draft finalised and circulated for mentor review, Ars Electronica submission dossier finalised for the [expected January to March 2027] call, Tier 1 application dossier compiled, and the final seed funding report prepared.

## 6. Publication plan
Confirmed targets: SIGGRAPH Asia 2027 Art Papers (submission at 2027 call, deadline to be confirmed when announced); Ars Electronica Festival 2027 open call (historically January to March window). Secondary venues held in reserve: ISEA, ACM TEI, IEEE Haptics Symposium.

---

## Standing reminders for every report
1. Fill every Workday cell; a blank spending rate invites questions.
2. Keep figure captions honest: "Concept render" until real photographs exist, then replace renders with photographs.
3. Consistent naming: Earth (토), never Soil; one public title throughout.
4. Convert any problem into a Challenges entry with a mitigation; named risks read as competence.
5. Delete all grey template text before submission.
