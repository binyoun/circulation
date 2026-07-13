# Circulation: Cupping-Form Sensing Devices as Cosmotechnical Interface for Collective Physiological Portraiture
## Draft Paper (v0.1) + Figure Plan with Generation Prompts

Target: SIGGRAPH Asia 2027 Art Papers (7-page ACM format, structure modelled on Zhang, Hartono and Hall, C&C 2026).
Authors: Bin Youn (lead, corresponding), Patrick Hartono, Renusha Athugala.
Convention: no em-dashes anywhere. Bracketed text = to be completed from the studio deployment and structured triad sessions (October to November 2026).

---

## PART A — DRAFT PAPER

### Abstract (draft, ~150 words)

We present Circulation, an interactive installation reframing cupping therapy (부항 / giác hơi / 拔罐) as bodily interface. Three handheld cupping-form devices read a two-signal portrait of each participant, grip pressure and pulse rhythm, and translate it into one of five colour states drawn from the Five Elements (오행) framework of East Asian medicine. As participants' holds and rhythms converge, the three cups harmonise and an ambient colour field blooms across the room. Deployed across [N] structured triadic sessions in a studio setting ([RMIT Vietnam, Ho Chi Minh City], September to November 2026), the work demonstrated how a traditional care practice can operate as a cosmotechnical interface: a diagnostic gesture, the quality of a hold, becomes the primary interaction, and collective synchronisation becomes a designed, felt outcome rather than a biometric verification. We contribute (1) cupping as cosmotechnical interface, (2) a Five Elements colour-physiology mapping methodology, and (3) design implications for collective biosignal interaction in Asia Pacific cultural contexts.

### 1 Introduction

Traditional East and Southeast Asian care practices carry sophisticated, embodied models of circulation, rhythm, and relational presence, yet they remain almost entirely absent from interaction design research, appearing, when at all, as aesthetic reference rather than as operative logic. Cupping therapy, known as 부항 in Korean and giác hơi in Vietnamese, draws the body upward through negative pressure to promote circulation. Routinely dismissed as unscientific, the practice nonetheless encodes a diagnostic epistemology in which the body's present state is read through touch, hold, and rhythm.

Circulation takes this epistemology seriously as interface design. Following Yuk Hui's account of cosmotechnics, in which technics are always embedded in a cosmology rather than universal [ref], we ask what an interactive system looks like when its sensing logic is derived from an East Asian diagnostic gesture rather than translated into one. The project lead's background in East Asian traditional medicine, including three years of hand acupuncture study, grounds this translation in practised knowledge rather than cultural citation.

[Paragraph: the deployment in one sentence; the three contributions, mirroring the abstract.]

### 2 Background and Related Work

#### 2.1 Traditional Care Practice as Interface
[Cosmotechnics (Hui); postcolonial computing / decolonial HCI; prior HCI work engaging traditional medicine or ritual, e.g. TCM-inspired interfaces, if identified; the gap: care practices as operative sensing logic, not visual theme.]

#### 2.2 Biosignal Interfaces and Collective Interaction
[PPG/HRV in interactive art and affective computing; social biofeedback and physiological synchrony literature (interpersonal synchrony, collective heart-rate works, e.g. breathing/heartbeat-sharing installations); the reliability problem of genuine synchrony; our position: designed synchrony as invitation, behavioural convergence weighted over biometric convergence.]

#### 2.3 Tangible, Somatic, and Performative Systems
[Soma design (Höök et al.); tangible interaction (TEI lineage); Onycho Lab (Zhang, Hartono and Hall 2026) as directly related prior work by one of the present authors: fingertip pressure sensing redirecting attention from visual display toward somatic experience; Circulation extends this logic from an individual clinical encounter to a triadic collective scale.]

### 3 Cupping as Cosmotechnical Interface

#### 3.1 The Diagnostic Hold
The interaction's core gesture derives from the O-ring test (오링 테스트) of East Asian medicine, in which the quality of a hold, its strength, steadiness, and duration, reveals the body's present state. In Circulation the hold is the interface: how firmly, how steadily, and how long a participant grips the cup constitutes the primary input, with pulse rhythm as the secondary signal. The system reads present state, not constitution; it makes no diagnostic or medical claim. [One sentence distinguishing from 8체질 constitutional diagnosis, which requires a practitioner.]

#### 3.2 The Five Elements Mapping
Each two-signal portrait is mapped to one of the Five Elements (오행): Wood (목, green, building grip and rising pulse), Fire (화, red, strong grip and elevated pulse), Earth (토, yellow, steady grip and regular pulse), Metal (금, white, releasing grip and slowing pulse), Water (수, deep blue, sustained slow hold and calm pulse). The mapping treats the elements as a phenomenological vocabulary of bodily states rather than a physiological ontology. [Table 1 formalises the mapping with thresholds derived from the August calibration study.]

#### 3.3 Inversion: From Drawing Inward to Drawing Together
Cupping draws inward through negative pressure, promoting internal circulation. Circulation inverts the direction while keeping the care logic: the devices draw participants outward into collective synchronisation. As grips steady and rhythms converge, the three cups harmonise toward a shared hue and the ambient field blooms. The room becomes the body; circulation becomes social.

### 4 System and Experience Design

#### 4.1 Installation Staging
[Spatial description: three plinths / three participants facing configuration, ambient wall field, didactic panel with the no-medical-claim statement, staged as a studio installation at RMIT Vietnam exactly as it would be exhibited. Mirror Onycho Lab 4.1 in length.]

#### 4.2 Cupping-Form Devices
Each handheld device houses an ESP32 microcontroller, a MAX30102 PPG sensor positioned in a dedicated fingertip contact well on the rim (separating pulse reading from the gripping palm), [an FSR beneath the palm contact area / a barometric pressure sensor within the sealed dome reading grip through actual negative-pressure physics, per August outcome], an addressable LED ring at the rim, and a rechargeable LiPo cell with dock charging. Shells are [resin/acrylic], sealed and wipeable for public handling. [Dimensions, weight.]

#### 4.3 Sensing, Signal Quality, and Fallback
[Sampling and filtering; signal quality index; graceful neutral "breathing" state on pulse-lock loss; calibration thresholds from the internal pilot (N=~10, M grip styles). One honest paragraph on the grip-occlusion problem and its resolution: this is a strength, not a weakness, in review.]

#### 4.4 Synchronisation Logic and the Ambient Layer
Each cup computes its own element state on-device and streams OSC over Wi-Fi to a sync hub that computes a collective convergence metric weighted toward behavioural convergence (grip steadiness, hold rhythm) with pulse coherence as a secondary term, and republishes to TouchDesigner. State machine: idle, reading, element lock, pairing, triadic sync, bloom. The ambient layer, driven via Art-Net, expands the collective state to room scale; the cups remain self-sufficient if the hub or ambient layer drops. [Rationale sentence: designed synchrony as invitation, ensuring the bloom is dependably reachable within a session.]

#### 4.5 Safety, Hygiene, and Ethics
[Hygiene protocol for handled devices across repeated long sessions; no medical claims in didactics; RMIT ethics approval [number]; anonymised data; separate consent for documentation, mirroring Onycho Lab 4.5.]

### 5 Method
[Deployment account in Onycho Lab's format: studio deployment at RMIT Vietnam, September to November 2026, comprising rehearsal sessions followed by [N] ethics-approved structured triadic sessions with [N] total participants ([demographic note if collected]); session structure and duration; data comprised interaction logs (grip, pulse, state transitions), fieldnotes, voluntary participant reflections gathered conversationally, and media documentation; qualitative thematic analysis aligned with practice-based research; documentation and publication consent.]

### 6 Findings
[To be written from October analysis. Anticipated thematic structure, to be confirmed or replaced by the data:]

#### 6.1 The Hold as Legible Self-Portrait
[How participants read their own colour; moments of recognition, scepticism, play; anonymised quotes.]

#### 6.2 Negotiating Convergence
[How strangers coordinated toward sync: imitation, verbal negotiation, breathing together; whether behavioural convergence preceded pulse coherence; failures and near-misses as findings.]

#### 6.3 Cultural Recognition and Productive Misreading
[Vietnamese, Korean, and international participants' readings of the cupping form and the elements; moments of cross-cultural resonance or friction; connection to the "third authorship" line from the Sacred Tree research.]

### 7 Discussion

#### 7.1 Cosmotechnical Interface Design
[What it means that the sensing logic, not just the aesthetic, derives from the care practice; implications for designing from non-Western technical epistemologies without exoticising them.]

#### 7.2 Designed Synchrony, Honest Synchrony
[The ethics of weighting behavioural convergence: the system invites synchrony rather than verifying it; comparison with biofeedback works that overclaim; what participants' experience suggests about felt versus measured togetherness.]

#### 7.3 Limitations and Future Work
[Self-selected art-context audience; single venue and cultural setting; PPG limits; no longitudinal claims; future: larger collective configurations, generative behaviour from accumulated interaction data, iterations within the Øryn framework.]

### 8 Conclusion
[Mirror the abstract's three contributions in past tense; one closing sentence on circulation as a social, designed, felt phenomenon.]

### References (starter list to expand)
Hui, Y. 2016. The Question Concerning Technology in China: An Essay in Cosmotechnics.
Zhang, K., Hartono, P., Hall, R. 2026. Onycho Lab. C&C '26.
Höök, K. et al. 2016. Somaesthetic Appreciation Design. CHI '16.
Barad, K. 2007. Meeting the Universe Halfway.
[Physiological synchrony in HCI: identify 2-3 key papers]
[Collective biosignal art: identify 2-3 precedent works]
[Decolonial/postcolonial HCI: Irani et al. or similar]
[TCM or traditional-practice HCI precedents if found]

---

## PART B — FIGURE PLAN AND GENERATION PROMPTS

Nine figures, mirroring the Onycho Lab figure logic. Each entry gives: purpose, an image-generation prompt for the concept render (usable now for reports, pitches, publicity), and the corresponding real shot for the October documentation shoot. **Paper rule: photographs in the submitted paper must be real; renders may appear only if explicitly captioned as design visualisations, and any AI-generated imagery must be disclosed per ACM policy.** Figures 7 and 9 (diagram, infographic) are legitimately producible as graphics now.

### Figure 1 — Installation infrastructure (mirrors Onycho Fig. 1)
Purpose: establish the staging. Left: prepared installation; right: contextual view in venue.
Prompt: "Gallery installation documentation photograph, three translucent dome-shaped handheld devices resting on three white minimalist plinths arranged in a triangle, each dome glowing softly from an LED ring at its base in green, red, and deep blue, dark gallery space, large soft ambient colour field washing the back wall in blended gradients, one small didactic panel with QR code, museum documentation photography style, Sony A7 look, natural perspective, no people, realistic materials, subtle reflections on concrete floor"
October/November shot: identical composition in the staged studio installation, empty room, tripod, wide + medium pair.

### Figure 2 — Device concept and exploded view (mirrors Onycho Fig. 2 logic: concept + realised)
Purpose: left, design sketch; right, realised device photograph.
Prompt (left panel): "Technical concept illustration in warm pencil-and-ink style, a handheld dome device inspired by traditional cupping therapy held in an open palm, cutaway exploded view showing ESP32 board, small LiPo battery, PPG pulse sensor in a fingertip well on the rim, pressure sensing at the base, addressable LED ring at the opening edge, neat annotation lines with small hand-lettered labels, cream paper background, product design sketchbook aesthetic"
October shot (right panel): realised device in hand, matching angle, neutral grey backdrop.

### Figure 3 — Hardware interior (mirrors Onycho Fig. 3)
Purpose: credibility of the build.
Prompt: "Top-down product photograph of an open transparent dome device interior on a white seamless background, ESP32 microcontroller board, coin-sized PPG sensor module, force sensitive resistor, ring of addressable RGB LEDs around the perimeter, small LiPo battery with red and black leads, clean cable routing, soft studio lighting, annotated documentation style, high detail electronics macro photography"
October shot: real interior, same framing, before final assembly.

### Figure 4 — Five colour states (your existing Figure 3 render, upgraded)
Purpose: the Five Elements vocabulary in one strip.
Prompt: "Five-panel horizontal photographic strip, the same transparent dome device held in an open palm against a matte black background, each panel glowing a single saturated colour from its base LED ring: deep green, vivid red, warm yellow, cool white, deep blue, single Korean character caption below each panel in the matching colour: 목 화 토 금 수, consistent lighting and hand position across panels, elegant minimal art documentation photography"
Note: Earth is 토 and yellow; ensure no "Soil" label anywhere.
October shot: replicate with real device, one hand model, locked camera.

### Figure 5 — Grip-style study grid (mirrors Onycho Fig. 5, material hardness test)
Purpose: method credibility; visualises the calibration study.
Prompt: "Four-panel photographic grid on plain light grey background, close-up of different hands gripping a translucent dome device in four distinct ways: fingertips only light touch, full palm firm wrap, two-handed cradle, single relaxed open-palm rest, each panel labelled below in small lowercase italic sans-serif: light, firm, cradle, rest, clinical study documentation aesthetic, consistent framing"
October shot: from the August internal pilot, real participants' hands (consented), same grid.

### Figure 6 — PPG placement study (mirrors Onycho Fig. 6, motor placement)
Purpose: shows the fingertip-well design decision empirically.
Prompt: "Four-panel photographic grid, close-up of a hand on a translucent dome device with a small sensor position highlighted in each panel at a different location: palm centre, thumb base, index fingertip well on the rim, dome top, small circular highlight ring around the sensor point in each panel, labels below in lowercase italic: palm, thumb, fingertip well, crown, neutral light background, HCI paper methods figure aesthetic"
August shot: photograph the real placement tests as you run them; this figure should be real by September.

### Figure 7 — System architecture diagram (legitimate to produce now)
Purpose: full pipeline including the collective layer.
Build as vector graphic (not AI photo): Participant grip → [FSR + barometric] + MAX30102 → ESP32 → OSC over Wi-Fi → TouchDesigner (Five Elements mapping, signal quality index, convergence metric, state machine) → cup LED rings; collective layer: three ESP32 nodes → convergence → Art-Net → ambient RGB field. Include the fallback neutral state as a labelled branch; reviewers reward honest failure paths.

### Figure 8 — Session structure strip (mirrors Onycho Fig. 9, procedure structure)
Purpose: the participant journey in seven small panels.
Prompt: "Seven-panel horizontal storyboard strip of photographs, dark gallery setting, sequence showing: 1 visitor reads small didactic panel, 2 visitor lifts glowing dome from plinth, 3 close-up of hold with cup glowing a single colour, 4 two visitors side by side with cups in differing colours, 5 three visitors with cups converging toward one shared warm hue, 6 wide shot of room ambient light blooming in the shared colour, 7 cups returned to plinths dimming to neutral, small numbered captions beneath each panel in light grey sans-serif, documentary exhibition photography style, consistent colour grading"
October shot: this is the single most important documentation sequence for both the paper and the Ars Electronica video; assign one person to capture exactly these seven moments daily.

### Figure 9 — Colour-physiology mapping infographic (Table 1 companion; legitimate to produce now)
Purpose: formal mapping table.
Build as clean vector table: Element (목/木 etc.), English label (Wood, Fire, Earth, Metal, Water), grip quality, pulse quality, hex colour swatch. Use the corrected Earth row. Keep hex values consistent with firmware constants so the figure is literally true.

---

## Production order
Now (July, light effort): Figures 7 and 9 as vector graphics; regenerate any report renders with "Earth" corrected and one public title.
August: Figures 5 and 6 become real during the pilot and placement tests.
September to October, triad rehearsals and structured sessions: Figure 8 sequence captured across sessions; Figure 1 staged-installation shots.
November shoot: Figures 1, 2 (right), 3, 4 finalised on the finished system; Ars video shot from the same list.
