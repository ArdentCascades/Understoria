# French (fr) translation glossary

Reference for every bulk-translation and review pass over `fr.json` and
the French content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a French-speaking neighbor would actually
say, not the word an administration would print.

## Global register decisions

1. **Tutoiement everywhere.** The app says "tu" to the member, matching
   Spanish "tú". Never "vous" for one person. Plural "vous" is fine when
   addressing two parties at once ("vous confirmez toutes les deux").
2. **Warm, plain, neighborly French** over administrative French. Banned
   register: "veuillez", "effectuer", "procéder à", "suite à", "il
   convient de", "votre demande a été prise en compte". Say "donner un
   coup de main", not "fournir une prestation d'aide".
3. **No-shame framing.** Never debt/obligation vocabulary: no "dette",
   "dû", "redevable", "solde négatif à régulariser". Asking for help is
   never gated and never framed as owing (see *owed help* below).
4. **Gender.** Prefer épicène phrasing ("membre", "la personne
   fondatrice", "quiconque", "qui organise"); use paired forms when a
   role is named prominently ("fondateur ou fondatrice"). **Never the
   médian point (·)** — it garbles the read-aloud voice (`lib/speak.ts`)
   and screen readers. Generic masculine is acceptable in running text
   when pairing would get heavy; alternate which gender leads across the
   file, as es does ("cofundadora o cofundador").
5. **Sentence case.** Capitalize the first word and proper nouns only —
   no Title Case ("Kit de récupération", not "Kit De Récupération").
6. **Typography — one rule, stated plainly:** put a plain no-break space
   **U+00A0** before `: ; ! ?` and inside guillemets (`« … »`).
   We deliberately use U+00A0, **not** the espace fine insécable U+202F:
   one grep-able character, universal font support, and JSON-safe. Use
   French guillemets « » for quotations; keep the em dash — with plain
   spaces around it, as en/es already do. Straight apostrophe (') as in
   the rest of the codebase. Ellipsis: … (single char), as in en.
7. **"Understoria" is never translated** or accented. Same for file
   names, env vars, and `docs/…` paths quoted in strings.
8. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
   `{{hours}}`… byte-for-byte identical (parity test enforces this).
9. **Plurals:** French CLDR needs `_one` and `_other` (plus `_many` only
   if a key can receive ≥ 1 000 000 — rare; the plural gate will tell
   you). Remember French `_one` covers **0 and 1**: write "0 heure",
   "{{count}} heure" must read correctly for zero.

## Term table

| English | French | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | se porter garant de | Button: "Me porter garant". What a neighbor says. DON'T: "parrainer" (collides with invitations, paternalistic), "cautionner" (money deposit + the negative idiom "je ne cautionne pas"), "recommander" (too weak). |
| a vouch (the signed act) | un aval | "Ton aval signé", "avec l'aval de deux membres". Plural: "avals". |
| vouches (count on trust chips) | garants | One vouch = one distinct person here, so count people: "De confiance ({{count}} garants)", "Tu as {{have}} garants sur {{need}}". |
| vouched by | avec l'aval de / X s'est porté garant de toi | Pick whichever reads naturally in the sentence. |
| fully vouched | de pleine confiance | Mirror es "de plena confianza": "une fois que la communauté t'a pleinement accordé sa confiance". DON'T: "totalement avalisé". |
| trust / trusted member | la confiance / membre de confiance | Chip: "De confiance". Web of trust: "la toile de confiance". |
| seed balance | solde de départ | The seed metaphor doesn't survive in French; plain wins. "Tout le monde commence avec 5 heures." DON'T: "capital de départ" (financial), "solde initial" (bankish). Balance = "solde". |
| hours (the currency) | heures | Always lowercase; "une heure de n'importe quelle aide vaut une heure". Credit moves → "le crédit circule" (es: "el crédito se mueve"). |
| node | nœud | Keep the app's teaching gloss: "le nœud (le serveur partagé que ta communauté fait tourner)". DON'T: leave "node" in English; "serveur" alone only where en itself says just "server". |
| community node | le nœud de ta communauté | Or "un nœud communautaire" when generic. |
| exchange | échange | Verb: "échanger". Confirmed exchange: "échange confirmé". |
| the commons (section) | les biens communs | A single one: "un bien commun". DON'T: "les communs" (activist-theory jargon), "patrimoine" (heritage-administrative). |
| tended (commons status) | entretenu | Chip: "Bien commun entretenu"; prose: "dont la communauté prend soin". DON'T: "maintenu" (IT maintenance), "géré" (administrative). |
| retired (commons status) | au repos | Deliberate non-literal: "Retiré" reads as removed/withdrawn and collides with member removal. "Mettre ce bien commun au repos" honors the no-shame lifecycle (it can come back). Distinct from "Archivé" (archived). |
| In my care (nav) | À mes soins | Short enough for the bottom nav; evokes "confié à mes soins". Prose: "Tu le trouveras dans À mes soins." DON'T: "À ma charge" (burden/dependents), "Mes tâches" (flattens the care framing). |
| Grow another root (add-a-server flow) | Faire pousser une autre racine | Mirrors es "Hacer crecer otra raíz"; "faire pousser" is the natural gardening verb. |
| timebank | banque de temps | "dans une banque de temps, demander n'est jamais bloqué". DON'T: "accorderie" (a specific existing network — not us). |
| mutual aid | entraide | Deliberate non-literal — the one perfect French word. "Heures d'entraide". DON'T: "aide mutuelle" (calque; "mutuelle" evokes insurance). |
| board | tableau | Nav: "Tableau". First-use gloss: "le tableau d'affichage de la communauté". DON'T: "babillard" (Québec-only), "forum", "panneau". |
| needs | besoins | Tab/chip: "Besoins". |
| offers | offres | Tab/chip: "Offres"; prose "offres d'aide". DON'T: "propositions" (reserved for governance proposals). |
| projects | projets | |
| post (noun) | annonce | Corkboard register ("petites annonces"), feminine — claimed = "prise". DON'T: "publication" (cold/social-media), "post" (anglicism). |
| post (verb) | publier | "Publier un besoin". DON'T: "poster". |
| claim (a post/task) | prendre | "Prendre cette tâche", "Prise par {{name}}", es "tomar". DON'T: "réclamer" (complaint), "revendiquer" (protest), "s'attribuer". |
| shift | créneau | Volunteer French: "Créneaux", "Tu es sur ce créneau". DON'T: "quart" (industrial/Québec), "vacation" (faux ami), "poste". |
| sign-up (for a shift) | inscription | Verb "s'inscrire", button "M'inscrire", "Retirer mon inscription". Keep this family for shifts ONLY (see RSVP). |
| RSVP | réponse (de présence) | Verb: "répondre" / "dire si tu viens"; heading "Confirmer ma présence" works when only Going. "Les membres qui ont répondu". DON'T: keep "RSVP" (stiff invitation-card French), "s'inscrire" (collides with shifts). |
| proposal | proposition | "Proposition communautaire", page "Propositions". |
| affirm (a proposal) | soutenir | Button "Soutenir"; count noun "soutiens" ("Soutiens : {{count}}"). Consensus register, not admin. Block stays "bloquer / blocage". DON'T: "approuver" (administrative), "voter oui". |
| removal (of a member) | retrait | "Retirer un membre de la communauté" — honest but not shame-laden. DON'T: "expulsion", "bannissement", "exclusion" (all courtroom/forum register). |
| removal ceremony | cérémonie de retrait | The co-signing ritual; keep "cérémonie" — it is deliberate in en. |
| founder | fondateur / fondatrice | Épicène in prose: "la personne fondatrice", "membre à l'origine de la communauté". |
| co-founder | cofondateur / cofondatrice | Épicène: "personne cofondatrice". Ceremony: "cérémonie de cofondation". |
| guardian (shard holder) | gardien / gardienne | "Récupérer avec tes gardiens". Pair on first mention per screen, then generic. DON'T: "tuteur" (legal guardianship of minors). |
| recovery kit | kit de récupération | "Kit" is universal and short. DON'T: "trousse de secours" (first aid). |
| pairing / to link a device | relier un appareil | The flow: "Relier un nouvel appareil". DON'T: "appairage" (Bluetooth jargon), "jumeler" (QC), "synchroniser" (different concept). |
| linked device | appareil relié | |
| invite (noun) | invitation | Verb: "inviter" — "Inviter quelqu'un". Inviter (person): "la personne qui t'a invité". |
| panic (the emergency wipe) | panique | "Options de panique", "bouton panique"; gloss with "effacement d'urgence" on first use. DON'T: "urgence" alone (the Emergency section is already "Urgence"). |
| read aloud (feature) | lecture à voix haute | Toggle title: "Lecture à voix haute"; verb "lire à voix haute". DON'T: "synthèse vocale" (tech spec, not the promise). |
| seed vault | réserve de semences | Evokes the Svalbard "Réserve mondiale de semences". "Cet appareil est une réserve de semences — il garde l'archive complète de la communauté." DON'T: "coffre-fort" (bank), "voûte" (calque), "bóveda"-style literalism. |
| storm hub | refuge tempête | The powered-WiFi gathering spot when infrastructure is down. DON'T: "hub" (anglicism), "centre de tempête" (reads as the meteorological storm's center). |
| One small thing | Une petite chose | Button: "Montre-moi une petite chose". Keep it disarming — DON'T inflate to "Une petite tâche". |
| Ways to plug in | Des façons de participer | Mirrors es "Formas de participar". DON'T: "S'impliquer" (militant/HR), "Contribuer" (open-source flavor), "se brancher" (literal plug). |
| organizer | organisateur / organisatrice | Épicène in prose: "qui organise", "la personne qui organise" (es does exactly this). |
| member | membre | Naturally épicène — prefer it when dodging gendered forms. |
| neighbor | voisin / voisine | Pair when prominent; "le voisinage" / "les gens du quartier" for collective warmth. |
| display name | nom affiché | "Ton nom affiché (les pseudonymes sont bienvenus)". DON'T: "nom d'utilisateur" (username), "pseudo" as the field label (the field welcomes pseudonyms; it isn't only that). |
| owed help | aide en attente (de confirmation) | Badge: "à confirmer"; "{{hours}} en attente de ta confirmation". Deliberately NOT "aide due" / "dette d'aide" — the app refuses debt framing (see register rule 3). |
| operator (bonus, appears near node) | opérateur / opératrice | "Qui fait tourner un serveur devient opérateur…" — powers-and-limits framing, never "administrateur". |

## Quick self-check for translators

- Would a neighbor say this out loud at a kitchen table? If not, redo it.
- Did "veuillez" sneak in? Delete it.
- `grep` your output for `·` (médian point) — must be zero hits.
- `: ; ! ?` preceded by U+00A0, not a plain space, not U+202F.
- `{{…}}` placeholders identical to en; `_one` strings read right at 0.
- "Understoria" untouched.
