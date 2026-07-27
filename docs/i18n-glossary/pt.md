# Portuguese (pt) translation glossary

Reference for every bulk-translation and review pass over `pt.json` and
the Portuguese content modules. Decisions here get applied ~2,900 times —
when in doubt, pick the word a Portuguese-speaking neighbor would say at
a kitchen table, not the word a bank or a ministry would print.

## Global register decisions

1. **One file for all Portuguese speakers.** Locale code is `pt` — no
   `pt-BR`/`pt-PT` fork. Vocabulary is chosen to read naturally in BOTH
   Brazil and Portugal wherever a neutral word exists. Where the variants
   genuinely diverge we pick the Brazilian form (larger speaker base),
   note the road not taken, and stay consistent: **compartilhar** (not
   PT "partilhar"), **arquivo** (not "ficheiro"), **tela** (not "ecrã"),
   **equipe** (not "equipa"), **caixa de diálogo/aplicativo** where en
   says app. Prefer variant-free words when they exist: "dispositivo"
   or "telefone" (never "celular"/"telemóvel"), "guardar" (not
   "salvar"), "apagar" (not "deletar"/"excluir").
2. **Orthography:** Acordo Ortográfico (1990). Where the Acordo admits
   both spellings, use the Brazilian variant: cerimônia, pseudônimo,
   gênero, patrimônio (PT: cerimónia, pseudónimo…). One spelling per
   word, whole file.
3. **Address: informal "você", mostly implicit.** The verb carries the
   address ("Vai encontrar isto em…") — write the pronoun "você" only
   when the sentence needs it. This reads informal in Brazil and
   naturally neutral in Portugal. Possessives **seu/sua** (never
   "teu/tua"); **never mix in "tu" verb forms** ("podes", "tens",
   "estás" must not appear). Never "o senhor / a senhora".
   Clitics: sentence-initial and button positions use ênclise
   ("Inscrever-me", "Mostre-me") — the written norm in both variants;
   inside sentences use natural próclise after triggers ("que te
   avisem" → prefer restructuring: "para receber um aviso"). When a
   clitic gets awkward, restructure around it.
4. **Warm, plain, neighborly Portuguese** over administrative
   Portuguese. Banned register: "por favor, queira", "efetuar",
   "realizar o procedimento", "solicitar", "mediante", "prezado(a)",
   "sua solicitação foi registrada". Say "dar uma mão", not "prestar
   auxílio".
5. **No-shame framing.** Never debt/obligation vocabulary: no "dívida",
   no "dever" in the sense of owing ("você deve 3 horas" is forbidden),
   no "saldo devedor", "em débito", "pendência" as reproach. Asking for
   help is never gated and never framed as owing (see *owed help*).
6. **Gender.** Neutral-first phrasing: "membro" (naturally epicene —
   use it hard), "a pessoa fundadora", "quem organiza", "alguém da
   comunidade". Paired forms when a role is named prominently
   ("fundador ou fundadora"); alternate which gender leads across the
   file, as es does. **Never "x", "@", or "-e" morphology**
   ("membrx", "todxs", "amigues") — it garbles read-aloud
   (`lib/speak.ts`) and screen readers. Generic masculine is acceptable
   in running text when pairing would get heavy.
7. **Sentence case.** First word and proper nouns only — no Title Case
   ("Kit de recuperação", not "Kit De Recuperação").
8. **Typography — stated plainly: Portuguese needs no no-break space
   before punctuation.** Plain spaces everywhere; `: ; ! ?` hug the
   word (unlike French — a stray U+00A0 is a bug here). Quotes: curly
   double " " (not guillemets « » — traditional in Portugal, absent in
   Brazil). Em dash — with plain spaces around it, as en/es. Ellipsis:
   … (single char). Straight apostrophe (') on the rare words that
   need one.
9. **"Understoria" is never translated** or accented. Same for file
   names, env vars, and `docs/…` paths quoted in strings.
10. **Interpolation placeholders verbatim**: `{{count}}`, `{{name}}`,
    `{{hours}}`… byte-for-byte identical (parity test enforces this).
11. **Plurals:** Portuguese CLDR needs `_one` and `_other` (plus
    `_many` only if a key can receive ≥ 1 000 000 — rare; the plural
    gate will tell you). Portuguese `_one` covers **BOTH 0 and 1**:
    "0 hora", so every `_one` string must read correctly at zero.

## Term table

| English | Portuguese | Notes / DON'T use |
|---|---|---|
| vouch for (verb) | responder por | What a neighbor says: "eu respondo por ela". Button: "Responder por {{name}}". DON'T: "avalizar" (bank-guarantee register), "apadrinhar" (godparent, paternalistic, collides with invites), "endossar" (checks), "recomendar" (too weak). |
| a vouch (the signed act) | um aval | "Seu aval assinado", "com o aval de dois membros". Plural: **avais**. |
| vouches (count on trust chips) | avais | One vouch = one distinct person: "De confiança ({{count}} avais)", "Você tem {{have}} de {{need}} avais". |
| vouched by | com o aval de / {{name}} respondeu por você | Pick whichever reads naturally in the sentence. |
| fully vouched | de plena confiança | Mirror es "de plena confianza". DON'T: "totalmente avalizado". |
| trust / trusted member | a confiança / membro de confiança | Chip: "De confiança". Web of trust: "a teia de confiança" (not "rede" — overloaded by network). |
| seed balance | saldo inicial | Plain in prose: "todo mundo começa com 5 horas". Keep the seed metaphor where en foregrounds it: "Semente: {{hours}}", "créditos de semente" (es does the same). DON'T: "capital semente" (startup finance), "saldo devedor/credor" (banking). Balance = "saldo". |
| hours (the currency) | horas | Always lowercase; "uma hora de qualquer ajuda vale uma hora". Credit moves → "o crédito circula". |
| node | nó | Keep the teaching gloss: "o nó (o servidor compartilhado que a sua comunidade mantém)". DON'T: leave "node" in English; "servidor" alone only where en itself says just "server". |
| community node | o nó da sua comunidade | Or "um nó comunitário" when generic. Peer nodes: "nós aliados" (es: "nodos aliados"). |
| exchange | troca | Verb: "trocar" / "trocar ajuda". Confirmed: "troca confirmada". DON'T: "intercâmbio" (student-exchange register), "transação" (financial). |
| the commons (section) | os bens comuns | A single one: "um bem comum". DON'T: "os comuns" (theory jargon), "patrimônio" (heritage-administrative, and spelling diverges). |
| tended (commons status) | sob cuidado | Chip: "Sob cuidado"; "Bem comum sob cuidado"; prose: "cuidado pela comunidade". Bare "Cuidado" alone reads as the warning sign — always "sob cuidado". DON'T: "mantido" (IT maintenance), "gerenciado/gerido" (administrative + variant split). |
| retired (commons status) | em repouso | Deliberate non-literal, mirrors fr "au repos": "Colocar este bem comum em repouso" honors the no-shame lifecycle (it can come back). DON'T: "Aposentado"/"Reformado" (jobs + BR/PT split), "Retirado" (collides with member removal), "Desativado" (IT). Distinct from "Arquivado". |
| In my care (nav) | Aos meus cuidados | The natural idiom ("aos cuidados de"). Prose: "Vai encontrar isto em Aos meus cuidados." If the nav pill overflows, wrap — don't truncate. DON'T: "Minhas tarefas" (flattens the care framing), "A meu cargo" (burden/formal). |
| Grow another root (add-a-server flow) | Fazer crescer outra raiz | Mirrors es "Hacer crecer otra raíz". |
| timebank | banco de tempo | Established in both variants (Portugal runs "Bancos de Tempo"). "num banco de tempo, pedir nunca tem barreiras". |
| mutual aid | apoio mútuo | The movement term; es "apoyo mutuo". "Horas de apoio mútuo". "ajuda mútua" is fine in prose but don't alternate — stay on "apoio mútuo". DON'T: "assistência mútua" (insurance). |
| board | mural | Nav: "Mural". First-use gloss: "o mural de avisos da comunidade". Warm corkboard register, and it frees "painel" for dashboard. DON'T: "quadro" (ambiguous: chart/staff), "fórum", "placar" (scoreboard). |
| dashboard | Painel | No board/dashboard collision in Portuguese (board = "Mural"), so no French-style workaround needed; es already uses "Panel". |
| needs | necessidades | Tab/chip: "Necessidades" (es parity). DON'T: "Pedidos" (collides with orders/requests), "Carências" (shame-laden). |
| offers | ofertas | Tab/chip: "Ofertas"; prose "ofertas de ajuda". DON'T: "propostas" (reserved for governance). |
| projects | projetos | Same spelling both variants post-Acordo. |
| post (noun) | anúncio | Notice-board register ("anúncio no mural"), masculine — claimed = "assumido". DON'T: "publicação" (cold/social-media), "postagem"/"post" (anglicism). |
| post (verb) | publicar | "Publicar uma necessidade". DON'T: "postar". |
| claim (a post/task) | assumir | "Assumir esta tarefa", "Assumida por {{name}}" — taking something into your care, matches the nav framing. DON'T: "reclamar" (means to COMPLAIN in pt — classic faux ami), "reivindicar" (protest/legal), "pegar" (too physical/colloquial). |
| shift | turno | Volunteer register, both variants: "Turnos", "Você está neste turno". DON'T: "plantão" (medical/on-call), "expediente" (office hours). |
| sign-up (for a shift) | inscrição | Verb "inscrever-se", button "Inscrever-me", "Remover minha inscrição". Keep this family for shifts ONLY (see RSVP). |
| RSVP | confirmar presença | The standard invitation phrase. Heading "Confirmar presença"; "quem confirmou presença". "presença", never "assistência" (faux ami: assistance/audience). DON'T: keep "RSVP", "inscrever-se" (collides with shifts). |
| proposal | proposta | "Proposta comunitária", page "Propostas". |
| affirm (a proposal) | apoiar | Button "Apoiar"; count noun "apoios" ("Apoios: {{count}}"). Consensus register. Block stays "bloquear / bloqueio". DON'T: "aprovar" (administrative), "afirmar" (calque — means to state), "votar sim". |
| removal (of a member) | retirada | "Retirar um membro da comunidade" — honest, not shame-laden. DON'T: "expulsão", "banimento", "exclusão" (courtroom/forum), "remoção" (IT — files). |
| removal ceremony | cerimônia de retirada | The co-signing ritual; keep "cerimônia" — deliberate in en. (BR spelling; PT: cerimónia — see rule 2.) |
| founder | fundador / fundadora | Neutral in prose: "a pessoa fundadora", "quem fundou a comunidade". |
| co-founder | cofundador / cofundadora | Neutral: "pessoa cofundadora". Ceremony: "cerimônia de cofundação". No hyphen ("cofundador", per Acordo). |
| guardian (shard holder) | guardião / guardiã | Plural "guardiões". "Recuperar com seus guardiões". Pair on first mention per screen, then generic. DON'T: "tutor" (legal guardianship of minors), "responsável". |
| recovery kit | kit de recuperação | "Kit" is universal and short. DON'T: "kit de emergência" (first aid; Emergency section exists), "kit de resgate". |
| pairing / to link a device | vincular um dispositivo | The flow: "Vincular outro dispositivo" (es: "vincular"). DON'T: "parear"/"emparelhar" (Bluetooth jargon + BR/PT split), "sincronizar" (different concept), "conectar"/"ligar" (ambiguous). |
| linked device | dispositivo vinculado | |
| invite (noun) | convite | Verb: "convidar" — "Convidar alguém". Inviter: "a pessoa que enviou seu convite" (restructure rather than fight the clitic). |
| panic (the emergency wipe) | pânico | "Opções de pânico", "botão de pânico"; gloss with "apagamento de emergência" on first use. DON'T: "emergência" alone (the Emergency section is already "Emergência"). |
| read aloud (feature) | leitura em voz alta | Toggle title: "Leitura em voz alta"; verb "ler em voz alta". DON'T: "síntese de voz", "texto para fala" (tech spec, not the promise). |
| seed vault | reserva de sementes | "Este dispositivo é uma reserva de sementes — guarda o arquivo completo da comunidade." DON'T: "banco de sementes" (collides with banco de tempo), "cofre" (bank vault), "bóveda"-style calques. |
| storm hub | abrigo de tempestade | The powered-WiFi gathering spot when infrastructure is down — "abrigo" is the shelter word. DON'T: "hub" (anglicism), "centro da tempestade" (reads as the storm's meteorological center). |
| One small thing | Uma coisa pequena | Button: "Mostre-me uma coisa pequena". Keep it disarming — DON'T inflate to "Uma pequena tarefa". |
| Ways to plug in | Formas de participar | Mirrors es "Formas de participar". DON'T: "Como se envolver" (HR), "Contribuir" (open-source flavor), "se conectar" (literal plug). |
| organizer | organizador / organizadora | Neutral in prose: "quem organiza", "a pessoa que organiza" (es does exactly this). |
| member | membro | Naturally epicene in Portuguese ("o membro" covers everyone) — the workhorse for dodging gendered forms. Never "a membra". |
| neighbor | vizinho / vizinha | Pair when prominent; "a vizinhança" for collective warmth. |
| display name | nome visível | "Seu nome visível (pseudônimos são bem-vindos)". DON'T: "nome de usuário/utilizador" (username + BR/PT split), "apelido" (faux ami: nickname in BR, SURNAME in PT — never safe pan-Portuguese). |
| owed help | ajuda por confirmar | Badge: "a confirmar"; "{{hours}} aguardando sua confirmação". Deliberately NOT "ajuda devida" / "dívida de ajuda" — the app refuses debt framing (register rule 5). |
| dispute | disputa | Page: "Disputas"; status framing stays "em revisão comunitária" ("Under community review"). DON'T: "litígio" (court), "denúncia" (accusation/shame), "conflito". |
| milestone | marco | "Marco alcançado". DON'T: "milestone", "etapa" (just a stage). |
| operator (appears near node) | operador / operadora | "Quem mantém um servidor se torna operador…" — powers-and-limits framing, never "administrador". |

## Quick self-check for translators

- Would a neighbor say this out loud at a kitchen table? If not, redo it.
- `grep` for "tu"-forms — ` podes`, ` tens`, ` estás`, `teu`, `tua` —
  must be zero hits; address is você (mostly implicit), seu/sua.
- `grep` for inclusive morphology — `x`, `@`, `-e` endings ("todxs",
  "membr@s", "amigues") — must be zero hits; neutral-first phrasing
  instead.
- No U+00A0 anywhere — Portuguese punctuation takes plain spaces.
- No "dívida", no "dever/deve" meaning owing, no "saldo devedor".
- `{{…}}` placeholders identical to en; every `_one` string reads
  right at 0 ("0 hora").
- One spelling system: cerimônia, pseudônimo, gênero (BR variants,
  rule 2) — never both spellings in one file.
- "Understoria" untouched.
