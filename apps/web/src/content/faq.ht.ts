/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
// Haitian Creole translation (i18n demand-driven wave). Loaded lazily
// via content/bundles/ht.ts — never import statically from app code.
// Ids are stable and never translated; parity gates enforce structure.
import type { FaqSection } from "./faq";

export const FAQ_SECTIONS_HT: readonly FaqSection[] = [
  {
    "id": "posts",
    "title": "Afich ak echanj",
    "entries": [
      {
        "id": "post-something",
        "question": "Ki jan pou m afiche yon bezwen oswa yon èd?",
        "answer": [
          "Sou Tablo a, peze bouton vèt “+ Afiche yon bezwen” oswa “+ Afiche sa ou ka bay” ki anba ekran an. Mete yon ti tit, esplike sa ou bezwen oswa sa ou ka bay, epi afiche l. Pita, ou ka anile l depi sou paj detay afich la, oswa peze “Afiche l ankò ak chanjman” nan meni afich la."
        ]
      },
      {
        "id": "claim-post",
        "question": "Ki jan pou m pran afich yon lòt moun?",
        "answer": [
          "Peze nenpòt afich sou Tablo a pou louvri paj detay li, epi peze bouton pou pran l lan — “Di w ap ede” sou yon bezwen, “Pran èd sa a” sou yon èd. Afich la pase nan eta “Ap tann konfimasyon”, epi moun ki afiche l la jwenn chans pou konfime anvan okenn èdtan pase.",
          "Si ou chanje lide, ou ka peze “Lage sa ou te pran an” sou menm paj la — afich la louvri ankò pou yon lòt moun."
        ]
      },
      {
        "id": "confirm-exchange",
        "question": "Ki jan konfime yon echanj mache?",
        "answer": [
          "Lè èd la fin fèt toutbon, nou toude peze “Konfime li fini” sou paj detay afich la. Èdtan yo pase sèlman lè nou toude fin konfime.",
          "Lòd la pa gen enpòtans — youn konfime anvan, lòt la wè afich la ap tann li, epi li konfime lè l pare."
        ]
      },
      {
        "id": "other-not-confirmed",
        "question": "Lòt moun nan poko konfime. Ki sa pou m fè?",
        "answer": [
          "Anvan tout bagay, pale avè l andeyò aplikasyon an. Pi souvan, se yon bouton yo bliye peze — se pa yon refi.",
          "Si gen yon vrè dezakò — èske echanj lan te fèt, èske li te konte kòm tout èd la — sèvi ak “Mete sa devan kominote a” sou paj detay afich la. Sa fè l parèt sou paj Dezakò a, kote kominote a ka ede regle sa ansanm — pa gen chèf isit la. Èdtan yo rete ap tann jiskaske sa fin regle.",
          "Ou p ap oblije ret tann pou tout tan non plis. Si kominote ou a mete konfimasyon otomatik, node kominote a antre apre tan tann tout moun te dakò a, epi li fin fè yon konfimasyon ki klè se bliye yo bliye l — konsa èdtan pèsonn pa rete pandye san bout."
        ]
      },
      {
        "id": "cancel-post",
        "question": "Ki jan pou m anile yon afich mwen pa bezwen ankò?",
        "answer": [
          "Louvri afich la depi sou Tablo a epi peze “Anile afich la”. Afich la soti sou tablo a lapoula, kidonk pèsonn pa ka pran l ankò. Li pa efase — pwòp paj li rete la, make kòm anile, epi nenpòt moun ki gen lyen li ka toujou wè sa yo te mande oswa sa yo t ap bay la."
        ]
      }
    ]
  },
  {
    "id": "balance",
    "title": "Èdtan ou yo",
    "entries": [
      {
        "id": "what-is-balance",
        "question": "Ki sa èdtan mwen yo vle di?",
        "answer": [
          "Èdtan ou yo se konte a k ap mache: èdtan ou bay yo mwens èdtan ou resevwa yo. Tout moun kòmanse sou 5 (semans kòmansman an), kidonk yon manm tou nèf sou 5, li pa sou 0.",
          "Si chif la desann anba zewo, pa gen pwoblèm. Mande èd se pa yon dèt — ou pa prete anyen nan men pèsonn. Kominote ou a ka wè èdtan ou yo, men yo pa yon nòt, epi pa gen okenn klasman."
        ]
      },
      {
        "id": "negative-balance",
        "question": "Èske èdtan mwen yo ka desann anba zewo?",
        "answer": [
          "Wi. Resevwa plis pase sa ou bay fè pati jan youn ede lòt mache — rezo a fèt pou l ap sikile. Kominote a ap wè yon siyal sèlman si w ap pwoche limit echanj chak jou a oswa si yon mouvman parèt dwòl; san sa, pèsonn p ap veye chif ou a."
        ]
      }
    ]
  },
  {
    "id": "identity",
    "title": "Idantite ou ak aparèy ou yo",
    "entries": [
      {
        "id": "getting-around",
        "question": "Kote tab Pwofil la pase? Ki jan pou m deplase nan aplikasyon an?",
        "answer": [
          "Senk tab chita anba ekran an (yon kolòn agoch sou yon ekran laj): Tablo, Souf, Kalandriye, Mesaj, ak Sa m ap okipe — tout travay ou pran ak tout pwojè w ap òganize, rasanble yon sèl kote.",
          "Tout sa ki sou ou menm menm ale dèyè bouton Meni an nan kwen anwo adwat la: Pwofil ou (li parèt anba pwòp non ou), Paramèt, Envite yon moun, paj Èd sa a, Chèche, ak Enfrastrikti kominote a.",
          "Chèche jwenn afich, pwojè, evènman, moun, ak repons èd sa yo — tout soti nan sa ki deja sou aparèy ou a. Ak yon klavye, Ctrl+K (⌘K sou yon Mac) louvri l kèlkeswa kote ou ye."
        ]
      },
      {
        "id": "change-name",
        "question": "Ki jan pou m chanje non mwen oswa zòn mwen?",
        "answer": [
          "Pwofil → Kèk mo sou ou. Non se etikèt, se pa papye idantite, kidonk ou ka chanje pa ou lè ou vle. Idantite kriptografik ou rete menm jan an."
        ]
      },
      {
        "id": "lost-passphrase",
        "question": "Ki sa k rive si m pèdi passphrase mwen an?",
        "answer": [
          "Pèsonn pa ka ba ou yon lòt — se espre sa fèt konsa. Kontra a se sa: pa gen okenn otorite santral ki ka li done ou yo, kidonk pa gen okenn otorite santral ki ka vin sove yo pou ou non plis.",
          "Men yon passphrase ou bliye pa oblije vle di ou pèdi tèt ou nan kominote a ankò. Si ou gen yon dezyèm aparèy ki mare, idantite ou sou li toujou. Si ou te fè yon kit pou tounen (Paramèt → Kit pou tounen), li fè kont ou tounen ak pwòp passphrase pa li, yon lòt apa. Si ou te chwazi moun pou sere kle w, ase nan yo ansanm ka fè ou tounen san okenn passphrase menm. Gade “Ki sa k rive si m pèdi telefòn mwen an?” pi ba a pou tout lòd pou eseye a.",
          "Se sèlman si okenn nan sa yo pa la repons lan vin Pwofil → Ijans → Efase nèt (efase tout bagay): efase aparèy la epi rekòmanse ak yon idantite tou nèf, san ansyen istwa èdtan ou yo."
        ]
      },
      {
        "id": "lost-phone",
        "question": "Ki sa k rive si m pèdi telefòn mwen an?",
        "answer": [
          "Kont ou ka tounen — men lòd onèt pou eseye a, pi bon an anvan.",
          "1. Yon dezyèm aparèy ki mare. Si ou te ajoute youn (Pwofil → Ajoute yon lòt aparèy), idantite ou deja rete sou li; annik kontinye sèvi avè l, epi mare yon telefòn ranplasman depi sou li.",
          "2. Yon kit pou tounen. Si ou te fè youn (Paramèt → Kit pou tounen), louvri aplikasyon an sou nenpòt aparèy nèf, chwazi “Ou pèdi aparèy ou men ou gen yon kit pou tounen…”, epi antre passphrase kit la. Èdtan ou yo, pawòl moun te siyen pou ou yo, wòl ou yo, ak plas ou kòm manm — tout tounen; istwa kominote a senkronize tounen depi sou sèvè li.",
          "3. Moun k ap sere kle w yo. Si ou te separe kle ou bay moun k ap sere kle w (Paramèt → Moun k ap sere kle w yo), al jwenn ase nan yo: nouvo aparèy la montre yon kòd demann pou tounen, chak moun bay yon kòd lage moso kle, epi lè kantite a rive, kont ou antre tounen — san kit, san passphrase.",
          "4. Yon nouvo envitasyon. Si okenn nan sa yo pa la, mande yon moun envite ou ankò. W ap yon manm tou nèf: ansyen istwa ou rete vizib pou kominote a anba ansyen non ou, men nouvo kle a kòmanse a zewo. Se egzakteman poutèt sa aplikasyon an ap pouse tout moun mete yon dezyèm aparèy, yon kit, oswa moun pou sere kle yo — depi anvan move semèn nan rive.",
          "Sa ki pa janm tounen sou yon nouvo aparèy: mesaj prive yo ak bouyon ou pa t voye yo — yo te rete sèlman sou telefòn ki pèdi a, epi se espre sa fèt konsa."
        ]
      },
      {
        "id": "install-app",
        "question": "Èske m ka enstale Understoria tankou yon aplikasyon?",
        "answer": [
          "Wi. Understoria se yon aplikasyon wèb ou ka mete sou ekran akèy ou tankou nenpòt lòt aplikasyon: ou jwenn yon ikòn, li louvri tout ekran an san ba navigatè yo, li demare pi vit, epi li kontinye mache san entènèt.",
          "Sou iPhone oswa iPad, louvri Understoria nan Safari, peze bouton Share la, epi chwazi “Add to Home Screen”.",
          "Sou Android, louvri l nan Chrome, peze meni an (⋮) nan kwen anwo a, epi chwazi “Add to Home screen” oswa “Install app”.",
          "Sou yon navigatè òdinatè, chèche ikòn pou enstale a nan pwent dwat ba adrès la.",
          "Sou yon òdinatè Linux, gen yon aplikasyon biwo tou — yon sèl fichye (yon AppImage) kominote ou a ka pataje, ki mache san okenn navigatè menm. Fè l ka egzekite (klik dwat → Properties → bay dwa pou l egzekite, oswa chmod +x), louvri l, epi mare l depi sou telefòn ou: Paramèt → “Ajoute yon lòt aparèy” sou telefòn nan, apre sa chemen kole-kòd la sou òdinatè a. Li konte kòm pwòp aparèy pa li, menm jan ak ka iPhone pi ba a, epi li mete ajou sèlman lè ou ranplase fichye a ak yon vèsyon ki pi nouvo.",
          "Yon bagay pou konnen anvan ou enstale: sou iPhone ak iPad, aplikasyon ou enstale a gen pwòp espas pa li apa, kidonk li kòmanse san kont ou louvri ladan l, menm si kopi navigatè a gen kont ou louvri deja — anyen pa pèdi, ou annik gen de “aparèy” apa sou yon sèl telefòn. Aplikasyon ou enstale a mande ou sa sou premye ekran li menm: chwazi “Mwen deja itilize Understoria nan navigatè telefòn sa a” epi l ap mennen ou etap pa etap pou fè idantite ou vin sou li. (Sou Android ak sou òdinatè, aplikasyon ou enstale a sèvi ak menm espas ak navigatè a, kidonk ou rete konekte.)"
        ]
      },
      {
        "id": "new-device",
        "question": "Ki jan pou m pase sou yon nouvo aparèy?",
        "answer": [
          "Anyen pou tape. Sou nouvo aparèy la, louvri Understoria epi chwazi “Mare aparèy sa a” — l ap montre de emoji epi l ap tann. Sou aparèy ki gen idantite ou deja a, ale nan Pwofil → Ajoute yon lòt aparèy: demann lan ap parèt la poukont li. Tcheke emoji yo matche, peze “Mare l”, epi nouvo aparèy la konekte poukont li. Tou de aparèy yo fèt pou sou menm rezo a (sou yon sèl telefòn, yo toujou sou li). Ou yon lòt kote, oswa pa gen sèvè kominote? “Lòt fason pou mare” gen yon kòd 6 mo ou ka di ak bouch ou, ak yon kòd QR ki pa pase sou okenn sèvè menm.",
          "De bagay pa vin avè w: istwa mesaj ou yo (mesaj yo chifre pou pwòp kle chak aparèy, kidonk yo rete kote yo te resevwa yo a) ak paramèt pa aparèy tankou aparans ak gwosè tèks. Tout rès la — afich, pwojè, evènman, manm, echanj — travèse ak mare a li menm, kidonk nouvo aparèy la sanble ak ansyen an lapoula epi li kontinye senkronize apre sa."
        ]
      },
      {
        "id": "link-safety",
        "question": "Ki sa pou m veye lè m ap mare aparèy?",
        "answer": [
          "Twa ti abitid senp kenbe mare a an sekirite. Premye: peze “Mare l” sèlman lè se ou menm menm ki kenbe aparèy k ap mande a, epi de emoji ki sou ekran ou yo matche ak de ki sou ekran pa li yo. Si yon demann parèt lè ou p ap mare anyen, kite l pase — gen dwa yon moun sou rezo ou ap tante chans li, epi anyen pa fèt toutotan ou pa peze.",
          "Dezyèm: apre nouvo aparèy la fin konekte, voye je sou non li salye ou a. Si se pa ou menm, yon moun glise pwòp idantite pa li nan transfè ou a — yo pa pran anyen nan sa ou genyen, epi bouton “Se pa mwen sa” a efase aparèy la nèt pou ou ka rekòmanse.",
          "Twazyèm, ti detay onèt la: mare ak yon peze pase sou pwòp sèvè kominote ou a, ki annik fè done sele li pa ka li pase — men si ou pa fè moun k ap fè sèvè sa a mache a konfyans, sèvi ak metòd QR la anba “Lòt fason pou mare” pito. Kòd QR la ale dirèk soti nan yon ekran rive nan yon kamera, san okenn sèvè ladan l menm.",
          "Yon ti nòt pratik: mare ak yon peze bezwen tou de aparèy yo parèt tankou yo sou menm rezo a. Yon VPN oswa iCloud Private Relay ka antrave sa san bri — si demann lan pa janm parèt, kanpe VPN an pou yon minit epi peze “Mande ankò”, oswa sèvi ak “Lòt fason pou mare”."
        ]
      }
    ]
  },
  {
    "id": "community",
    "title": "Kominote ak envitasyon",
    "entries": [
      {
        "id": "internet-outage",
        "question": "Ki sa nou tout ka fè toujou lè entènèt koupe — tankou pandan yon siklòn?",
        "answer": [
          "Plis pase sa ou ta kwè, paske se egzakteman pou moman sa a tout aplikasyon an bati. Aparèy ou a deja pote tout bagay: tablo a, kaye tout kominote a, lis manm yo, idantite ou. Ou ka kontinye li, afiche, epi konfime — chak chanjman ret tann an sekirite epi li voye tèt li depi ou rekonekte. Anyen pa pèdi pandan entènèt la koupe.",
          "Si yon moun bò kote ou bezwen èd kounye a menm: ede l, apre sa konfime l ansanm fas a fas. Sou paj afich la, chwazi “Konfime youn devan lòt” — yon telefòn montre yon kòd, lòt la eskane l epi li siyen. Tou de telefòn yo kenbe dosye a epi yo pote l lakay lè entènèt la tounen.",
          "Si kominote ou a gen yon kote pou pare lapli — yon ti sèvè rezèv yon moun kenbe pare pou lè entènèt koupe — konekte sou Wi-Fi li lè entènèt la pa la, epi aplikasyon an annik mache ankò pou tout moun ki la yo: afich yo sikile, èd yo konfime, san okenn enstalasyon. Mande moun k ap fè sèvè kominote ou a mache a si yon kote pou pare lapli egziste; si li pa genyen, docs/offline-resilience.md se resèt pou bati youn pandan tan yo bon.",
          "Ou ka menm envite yon moun tou nèf. Kòd envitasyon ou a mache san okenn entènèt — se ou menm ki siyen l epi li rete bon pou de semèn — kidonk montre yo kòd QR la oswa lonje lyen an ba yo sou papye, epi kite yo kenbe yon foto li. Nan yon kote pou pare lapli, yo ka enstale aplikasyon an epi antre lapoula; san sa, yo fini antre depi yo jwenn nenpòt ti koneksyon. Sèl bagay ki pa ka fèt san okenn rezo okenn kote, se telechaje aplikasyon an li menm — envitasyon an ap tann san pwoblèm jiskaske yo kapab.",
          "Se pandan tan yo bon pou mete sa sou papye: paj Enfrastrikti kominote a ka enprime yon kit pou lè entènèt koupe — yon pankat pou mi an ak kat pou bous ou ki gen etap pou konekte yo — konsa enstriksyon yo chape menm lè batri yo mouri."
        ]
      },
      {
        "id": "add-a-node",
        "question": "Ki sa k pwoteje kominote sa a si yon moun ta sezi sèvè a?",
        "answer": [
          "De bagay, epi se yo ki kè jan Understoria bati yon lòt jan pase sèvis konpayi yo. Premye: aparèy chak manm deja pote yon kopi konplè, siyen, tout kominote a — tablo a, kaye tout kominote a, pwojè yo, tout nèt. Sezi sèvè a pa pran anyen ki pa deja sou telefòn tout moun, epi yon sèvè ranplasman ka replen ak kopi sa yo.",
          "Dezyèm: sèvè a pa oblije yon sèl machin, ni machin yon sèl moun. Nenpòt manm ka fè yon node kominote mache — yon vye òdinatè pòtab nan yon amwa, kouvèti a fèmen, se toutbon ase. Chak node anplis vle di pa gen yon sèl moun yon gwoup ki kont sendika oswa ki kont youn ede lòt ta ka peze pou kraze kominote a. Kat “Rasin kominote a” nan Souf la montre konbyen rasin kominote ou a fè pouse.",
          "Ou pare pou ajoute youn? Gid etap pa etap la nan docs pwojè a — docs/add-a-node.md nan achiv kòd Understoria a montre ki jan pou bay yon vye òdinatè yon lòt travay, epi gid pou moun k ap fè sèvè a mache a kouvri detay yo. Se yon apremidi travay, epi manm ki t ap fè sèvè aktyèl ou a mache a ka ede ou mete de paramèt ki mare node yo ansanm yo an plas."
        ]
      },
      {
        "id": "start-a-community",
        "question": "Èske m ta ka kòmanse yon kominote konsa pou katye mwen?",
        "answer": [
          "Wi — epi ou pa bezwen pèmisyon pèsonn, ni yon kont GitHub, ni yon app store. Understoria se lojisyèl lib, epi pwòp sèvè kominote sa a ofri tout kòd sous li pou telechaje.",
          "Tout wout la ekri anndan aplikasyon an: louvri Meni an (anwo adwat) → Enfrastrikti kominote a → kat ki rele “Lojisyèl la menm” nan → “Kòmanse yon kominote tou nèf ak telechajman sa a”. Li mennen ou soti nan telechaje ak verifye kòd la, rive nan fè pwòp sèvè pa ou mache, nan yon lang tou senp."
        ]
      },
      {
        "id": "invite-someone",
        "question": "Ki jan pou m envite yon moun?",
        "answer": [
          "Dabò: envite moun, se bagay moun konfyans fè. Toutotan de moun konfyans poko reponn pou ou (envitasyon ou te antre sou li a konte kòm premye a), bouton envitasyon an montre ki kote ou rive pito. Sa pwoteje kominote a — yon chenn moun pèsonn pa konnen pa ka envite plis moun pèsonn pa konnen. Pou rive la, fè sa aplikasyon an fèt pou li a: ede moun. Depi vwazen yo konnen ou, nenpòt moun konfyans ka reponn pou ou depi sou pwofil ou.",
          "Wout ki pi rapid la: louvri Meni an (anwo adwat) epi chwazi “Envite yon moun” — li mennen ou tou dwat sou kat envitasyon yo. Wout ki pi long lan se Pwofil → Envitasyon ou bay yo.",
          "Peze “Kreye yon lyen envitasyon” epi w ap jwenn yon lyen ki sèvi yon sèl fwa. Pataje l fas a fas, sou Signal, oswa sou nenpòt kanal kote ou ka konfime li rive jwenn moun ou te vle a toutbon. Pa afiche lyen envitasyon yo an piblik.",
          "Ou ka montre yon envitasyon kòm kòd QR tou, pou pataje fas a fas. Chak envitasyon sèvi yon sèl fwa, li ekspire poukont li, epi ou ka anile l nan Pwofil → Envitasyon ou bay yo toutotan pèsonn poko sèvi avè l. Lè yon moun antre sou envitasyon ou, sa konte kòm ou menm k ap reponn pou li — non ou kanpe dèyè antre li, kidonk envite moun ou konnen toutbon."
        ]
      },
      {
        "id": "how-vouching-works",
        "question": "Ki jan reponn pou yon moun mache?",
        "answer": [
          "Reponn pou yon moun se yon pawòl piblik ou siyen ki di ou konnen moun sa a epi ou kanpe dèyè plas li nan kominote a. Yon moun vin “moun konfyans” depi de manm diferan fin reponn pou li — epi envite yon moun konte otomatikman kòm pawòl ou, kidonk lè ou reponn pou yon moun ak men ou, se konsa ou kanpe dèyè yon moun yon lòt manm te mennen vini.",
          "Ou reponn pou yon moun depi sou paj manm lan: peze non li nenpòt kote nan aplikasyon an epi chèche seksyon “Reponn pou li” a. Bouton an parèt lè pawòl ou ta ajoute konfyans toutbon — ou se moun konfyans ou menm, moun nan poko fin jwenn kantite pawòl li bezwen an, epi ou poko reponn pou li. San sa, seksyon an esplike poukisa li pa la, konsa ou pa janm ap devine.",
          "Sa merite yon ti reflechi: non ou kanpe dèyè pa li a, devan tout moun epi pou tout tan — yon pawòl ou bay pa ka repran nan aplikasyon an. Si pita ou regrèt youn, wout la se yon chita pale ak kominote ou, se pa yon bouton. Reponn pou moun ou konnen toutbon.",
          "Lè moun fin reponn pou ou, pouvwa konfyans kominote a louvri pou ou tou: envite moun tou nèf, reponn pou lòt moun, siyen retire manm — epi lyen ou pataje yo vin ka peze pou tout moun (jiska lè sa a, moun yo wè tout adrès la men yo pa ka peze l — se yon pwoteksyon kont move lyen, se pa yon mak sou ou). Se menm moman an tou limit yon moun ki fèk vini genyen pou afiche chak jou a — li laj, men li la — disparèt."
        ]
      },
      {
        "id": "disagree-with-member",
        "question": "E si m pa dakò ak yon lòt manm?",
        "answer": [
          "Pale avè l anvan. Pifò dezakò pa gen anyen pou wè ak aplikasyon an, epi yo pa bezwen aplikasyon an mele ladan yo.",
          "Si se sou yon echanj byen presi, sèvi ak “Mete sa devan kominote a” sou paj detay afich la. Si se sou konpòtman ki depase yon sèl echanj, ou ka louvri yon dezakò nan Pwofil → Dezakò — dezakò yo pase nan pwosesis pwopozisyon louvri kominote a, paske pa gen chèf isit la pou deside pou ou.",
          "Epi si sa ou bezwen an se annik yon distans ak yon moun, bloke toujou la tou — gade “E si yon moun ap deranje m?” anba Mesaj."
        ]
      },
      {
        "id": "member-removal",
        "question": "Ki jan retire yon moun nan kominote a mache?",
        "answer": [
          "Retire yon manm se bagay ki pi lou kominote sa a ka fè, epi aplikasyon an trete l konsa. Se dènye wout la: yon bloke pèsonèl deja anpeche sa yon moun afiche rive sou ou, yon dezakò ka konteste yon echanj byen presi, epi yon chita pale ranje plis bagay pase tou de.",
          "Pa gen yon sèl moun ki ka retire pèsonn — ni yon moun k ap òganize, ni moun k ap fè sèvè a mache a. Sa mande plizyè manm (kantite a, se kominote ou a ki fikse l epi tout moun wè l), chak ap siyen pwòp non pa yo sou yon sèl dokiman piblik. Pwopoze a kòmanse sou pwofil manm lan; siyen ansanm lan fèt fas a fas, depi sou paj Pwopozisyon an.",
          "Yon retire fèt devan tout kominote a — ki moun yo retire, ki lè, poukisa, ak egzakteman ki moun ki siyen, tout vizib sou paj Pwopozisyon an. Se retire moun an kachèt ki fè kominote pouri.",
          "Se pa yon efase. Ansyen echanj manm yo retire a rete — se yo ki kenbe kaye lòt manm yo an ekilib — epi tout sa ki sou pwòp aparèy li rete pou li. Sa ki fini an, se aksè li: li pa ka li ankò, epi tout nouvo ekri refize. Moun li te envite anvan retire a rete manm; envitasyon li yo ki poko sèvi mouri avè l.",
          "Epi pòt la ka louvri ankò: pou yon moun tounen, sa mande menm kantite siyati a, epi sa kòmanse depi sou dokiman retire a li menm, sou paj Pwopozisyon an."
        ]
      },
      {
        "id": "lurking-ok",
        "question": "Èske m ka annik gade san m pa afiche anyen?",
        "answer": [
          "Wi. Li sa lòt moun ap bay ak sa y ap mande, se yon jan ki bon nèt pou fè pati bagay la. Gen manm ki pase plizyè semèn ap gade anvan yo afiche premye bezwen yo; gen lòt ki pa janm afiche, yo annik reponn sou sa lòt moun afiche. Tou de byenvini."
        ]
      },
      {
        "id": "who-sees-what",
        "question": "Ki moun ki ka wè sa m afiche?",
        "answer": [
          "Tout moun nan node kominote ou a ka wè afich ou yo, non ou, zòn ou (si ou te mete youn), ak istwa echanj ou yo. Kominote zanmi yo resevwa dosye siyen ou voye deyò yo — afich, echanj konfime, evènman — anba kle piblik ou, pa anba non ou. Kòm echanj yo sikile nan tout kominote zanmi yo, yon node zanmi ka wè aktivite echanj kle ou epi kalkile èdtan li yo; men sa ki pa janm kite kominote ou: di si w ap vini yo, non ou mete pou tou yo, travay pwojè yo, moun ou bloke yo, bouyon yo, ak mesaj yo.",
          "Mesaj prive yo apa: yo chifre de bout an bout ant aparèy ou ak aparèy lòt moun nan, kidonk se nou toude sèlman ki ka li yo — ni node la pa ka, ni lòt manm. Gade “Ki jan pou m voye yon mesaj bay yon lòt manm?” anba Mesaj pou detay yo."
        ]
      },
      {
        "id": "beta-status",
        "question": "Ki bout aplikasyon sa a rive? Ki sa pou m pa mete ladan l?",
        "answer": [
          "Understoria se yon aplikasyon beta toujou. Yon gwo pati nan kòd li ekri ak zouti AI epi se moun ki revize l, epi li poko pase yon odit sekirite endepandan.",
          "Pwoteksyon ou wè yo reyèl epi yo teste — mesaj yo chifre de bout an bout, dosye yo siyen, bouton danje a mache. Men beta vle di bòg posib, menm sa pèsonn poko jwenn.",
          "Li fèt pou òganize èd vwazen chak jou. Pa mete anyen ladan l ki ta ka fè ou — oswa yon lòt moun — mal si li ta vin devwale: papye idantite leta, detay sante oswa imigrasyon, oswa nenpòt bagay ou ta di sèlman an prive. Lè ou gen dout, di l fas a fas."
        ]
      }
    ]
  },
  {
    "id": "messages",
    "title": "Mesaj",
    "entries": [
      {
        "id": "message-someone",
        "question": "Ki jan pou m voye yon mesaj bay yon lòt manm?",
        "answer": [
          "Louvri nenpòt afich epi peze bouton “Voye mesaj” la pou kontakte moun nan — li ale jwenn moun ki afiche a, oswa, si se pwòp afich pa ou, moun k ap ede ou a. Konvèsasyon yo kòmanse sou yon afich espre — sa kenbe mesaj yo mare ak èd toutbon, olye de kontak konsa konsa. Louvri Mesaj nan navigasyon an pou wè tout konvèsasyon ou yo epi chèche ladan yo.",
          "Mesaj yo chifre de bout an bout epi yo vwayaje soti sou yon aparèy rive sou lòt la. Se ou menm ak moun w ap ekri a sèlman ki ka li yo — node kominote a fè yo pase, men li pa ka wè anndan yo.",
          "Se espre: pa gen okenn siy ki di ou li yon mesaj, ni okenn siy ki di w ap tape. Pèsonn pa ka wè ki lè (ni menm si) ou li yon mesaj, epi pèsonn p ap gade ou pandan w ap ekri yon repons. Li lè ou li, reponn lè ou gen fòs pou sa — aplikasyon an p ap di anyen sou ou, ni nan yon sans ni nan lòt la."
        ]
      },
      {
        "id": "voice-notes",
        "question": "Ki jan mesaj vwa yo mache? Mikwofòn mwen an pa mache.",
        "answer": [
          "Nan yon konvèsasyon, bouton mikwofòn nan chita nan bwat mesaj la toutotan bwat la vid — kòmanse tape epi li chanje pou “Voye”; efase tèks la epi mikwo a tounen. Peze l pou anrejistre yon mesaj vwa jiska 45 segonn, koute l anvan anyen pati, epi voye l sèlman lè ou kontan avè l. Mesaj vwa yo sele de bout an bout egzakteman tankou mesaj tape yo — se ou menm ak moun w ap pale a sèlman ki ka tande yo.",
          "Vwa sou afich Tablo a mache yon lòt jan. Afich Tablo yo se pou tout kominote a, kidonk yon anrejistreman ou mete sou yon afich, tout kominote a ka tande l — menm moun ki t ap li mo ou ta ekri la yo.",
          "Si mikwofòn nan pa vle demare: navigatè ou oswa telefòn ou mande pèmisyon premye fwa w ap anrejistre a. Si sa te refize — menm pa aksidan — anrejistreman an rete fèmen jiskaske ou bay dwa mikwofòn pou sit sa a nan paramèt navigatè ou oswa telefòn ou. Depi dwa a bay, tounen epi eseye ankò."
        ]
      },
      {
        "id": "someone-bothering-me",
        "question": "E si yon moun ap deranje m?",
        "answer": [
          "Ou ka bloke l. Louvri konvèsasyon ou avè l la epi chwazi “Bloke kontak la” nan meni ki anwo a, oswa sèvi ak opsyon bloke a sou paj manm li.",
          "Bloke fèt lapoula epi li rete prive. Ou sispann wè afich li, evènman li, kòmantè li, ak mesaj li, epi ni youn ni lòt pa ka voye mesaj, reponn pou lòt la, pran afich li, oswa envite l ankò. Yo pa di l sa — pa gen okenn notifikasyon, okenn mak sou pwofil li, anyen okenn lòt moun ka wè.",
          "Bloke pa mete anyen devan kominote a menm. Pèsonn pa jwenn okenn avètisman, okenn dezakò pa louvri, epi ansyen echanj yo rete jan yo te ye. Si ou vle kominote a di mo pa l, louvri yon dezakò nan Pwofil → Dezakò — bloke ak yon dezakò mache byen ansanm. Bloke a ba ou lapè kounye a; dezakò a swiv pwosesis kominote a nan pwòp vitès pa li.",
          "Ou ka gade bloke ou yo, chanje yo, oswa debloke nenpòt lè nan Paramèt → Kontak ou bloke yo."
        ]
      }
    ]
  },
  {
    "id": "events",
    "title": "Evènman ak kalandriye a",
    "entries": [
      {
        "id": "community-events",
        "question": "Ki jan evènman kominote yo mache?",
        "answer": [
          "Nenpòt moun ka kreye yon evènman: louvri Kalandriye a epi peze bouton + la. Ba li yon lè, yon kote, ak yon deskripsyon, epi l ap parèt sou kalandriye kominote a pou tout moun.",
          "Peze yon evènman pou di si w ap vini — “M ap vini”, “Petèt”, oswa “M p ap vini”. Sa ou di a rete sou node kominote sa a: moun k ap òganize a ak lòt moun ki deja di si y ap vini yo ka wè non ou, manm ki poko di anyen yo wè kantite yo sèlman, epi kominote zanmi yo pa janm wè sa ou di a menm. Si ou chanje repons ou pou “M p ap vini”, non ou soti sou lis la lapoula.",
          "Gen evènman ki gen tou ladan yo — moman kote moun k ap òganize a bezwen yon kantite men, tankou yon ekip pou monte plas la oswa moun k ap sèvi manje youn apre lòt. Lè ou mete non w pou yon tou, sa di “M ap vini” pou evènman an tou. Lis tou yo mache tankou lis moun k ap vini yo: li rete sou node kominote sa a, epi si ou chanje repons ou pou “M p ap vini”, non ou soti sou tout tou yo tou.",
          "Yon evènman pa ka chanje apre li fin kreye — yon evènman ki siyen rete egzakteman sa moun yo te di wi pou li a. Si detay yo chanje, moun k ap òganize a anile l epi li mete yon lòt. Lè yon evènman ou te di w ap vini an anile, w ap wè yon ti nòt sou sa (ak rezon moun k ap òganize a, si li te bay youn) pwochen fwa ou louvri aplikasyon an."
        ]
      }
    ]
  },
  {
    "id": "projects",
    "title": "Pwojè ak travay",
    "entries": [
      {
        "id": "task-follows",
        "question": "Poukisa yon travay di “Li vini apre: …”?",
        "answer": [
          "Travay nan yon pwojè ka mete nan yon lòd. “Li vini apre” vle di travay sa a vini natirèlman apre yon lòt — koule fondasyon an anvan ou monte mi yo. Anyen pa kole epi pèsonn pa nan wout pèsonn; se annik yon lòd.",
          "Ou ka toujou pran yon travay ki vini apre lè ou vle. Sèl diferans lan: aplikasyon an p ap vin mande ou nouvèl li espre toutotan travay ki anvan an poko fini — pa gen rezon pou mande ki jan sa ap mache lè baz li chita sou li a poko la. Sistèm nan ap tann ansanm avè w — li pa sou do ou."
        ]
      }
    ]
  }
];
