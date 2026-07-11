/*
 * Understoria — Federated mutual aid timebank
 * Copyright (C) 2026 Understoria Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { StartCommunityGuide } from "./startCommunity";

// Spanish mirror of content/startCommunity.ts. Same step ids, same
// paragraph counts, and BYTE-IDENTICAL code blocks (commands don't
// translate) — startCommunity.parity.test.ts enforces all three.

export const START_COMMUNITY_ES: StartCommunityGuide = {
  intro: [
    "Tu comunidad usa Understoria. Puedes crear una para tu barrio, " +
      "tu trabajo, tu familia al otro lado de la ciudad — usando " +
      "solo el servidor de tu propia comunidad. Sin cuenta de " +
      "GitHub, sin tienda de aplicaciones, sin Docker obligatorio, " +
      "sin pedirle permiso a nadie.",
    "Esto funciona porque Understoria es software libre (licencia " +
      "AGPL) y cada servidor ofrece su propio código fuente — el " +
      "código exacto que está ejecutando. No es una cortesía: la " +
      "licencia lo exige, y la aplicación lo trae incorporado para " +
      "que ninguna empresa, servicio o repositorio pueda ser jamás " +
      "el único lugar donde vive el software. Cada comunidad es una " +
      "semilla.",
    "Para quién es esto: alguien capaz de seguir instrucciones de " +
      "terminal con cuidado, pero que nunca ha montado un servidor. " +
      "Si las palabras 'terminal' y 'comando' te resultan nuevas, " +
      "hazlo junto a alguien que ya lo haya hecho — así es como se " +
      "supone que viaja este conocimiento.",
  ],
  steps: [
    {
      id: "what-you-need",
      title: "1. Qué necesitas",
      paragraphs: [
        "Una computadora con terminal (los comandos de abajo son " +
          "para Linux o Mac; una Raspberry Pi sirve). Unos 15 " +
          "minutos para probar la aplicación en tu propia máquina. " +
          "Montar un servidor real para miembros es una tarde " +
          "completa y necesita un dominio y un servidor pequeño — " +
          "las guías que vienen dentro de la descarga cubren todo " +
          "eso.",
      ],
    },
    {
      id: "get-the-software",
      title: "2. Consigue el software",
      paragraphs: [
        "La manera fácil: en la comunidad de esta misma página — o " +
          "en cualquier comunidad Understoria que puedas alcanzar — " +
          "abre el Menú (arriba a la derecha) → Infraestructura " +
          "comunitaria → la tarjeta 'El software mismo'. Descarga " +
          "LOS DOS archivos: el archivo fuente y las sumas de " +
          "verificación. Ponlos en la misma carpeta.",
        "La manera por terminal (reemplaza la dirección por la de " +
          "tu comunidad):",
        "Algunos servidores también ofrecen un 'paquete con todo el " +
          "historial'. Es más grande y, si tienes git instalado, es " +
          "la mejor descarga: obtienes todo el historial de " +
          "desarrollo y actualizaciones normales después. Si tomas " +
          "el paquete, desempácalo con git en vez de tar:",
      ],
      code: [
        "mkdir understoria-download && cd understoria-download\n" +
          "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria-source.tar.gz\n" +
          "curl -fsSO https://YOUR-COMMUNITY.example/source/SHA256SUMS",
        "curl -fsSO https://YOUR-COMMUNITY.example/source/understoria.bundle\n" +
          "git clone understoria.bundle understoria",
      ],
    },
    {
      id: "verify",
      title: "3. Verifica lo que descargaste",
      paragraphs: [
        "Una suma de verificación es una huella calculada a partir " +
          "de los bytes exactos del archivo. Si un solo byte cambió " +
          "en el camino — una conexión inestable, una descarga " +
          "cortada — la huella cambia por completo. Compruébala " +
          "antes de construir nada. Quieres ver 'OK'. Cualquier " +
          "otra cosa: borra y vuelve a descargar.",
        "Sé honesta contigo misma sobre lo que esto prueba: la suma " +
          "vino del mismo servidor que el archivo, así que prueba " +
          "que la descarga llegó intacta — no puede probar que " +
          "nadie cambió el código en ese servidor. Esa confianza ya " +
          "se la das a tu operadora cada día (te sirve esta misma " +
          "aplicación). Para una confirmación independiente, trae " +
          "las sumas de una segunda comunidad para la misma versión " +
          "y compara — dos operadoras tendrían que coludirse para " +
          "engañar eso.",
        "Luego desempaca. El archivo se extrae en la carpeta " +
          "actual, así que crea una primero:",
      ],
      code: [
        "# Linux:\nsha256sum -c SHA256SUMS\n# Mac:\nshasum -a 256 -c SHA256SUMS",
        "mkdir understoria\ntar -xzf understoria-source.tar.gz -C understoria\ncd understoria",
      ],
    },
    {
      id: "try-it",
      title: "4. Pruébalo antes de comprometerte con nada",
      paragraphs: [
        "Puedes correr la aplicación completa en tu propia máquina " +
          "y recorrer un intercambio real de principio a fin. La " +
          "carpeta que acabas de desempacar contiene todas las " +
          "guías del proyecto, en su carpeta docs — abre " +
          "docs/quickstart.md en cualquier editor de texto y síguela " +
          "desde su primer paso. Donde diga que clones el " +
          "repositorio, sáltatelo: ya estás dentro de la carpeta " +
          "del código.",
        "Vale la pena aunque estés segura. Te darás de alta, " +
          "publicarás una necesidad y confirmarás un intercambio — " +
          "así, cuando tu primer miembro real se atasque, ya habrás " +
          "visto su pantalla antes.",
      ],
    },
    {
      id: "deploy",
      title: "5. Móntalo para tu comunidad",
      paragraphs: [
        "Las guías completas de servidor están en la misma carpeta " +
          "docs, escritas exactamente para este momento. Elige " +
          "según cómo quieras correrlo: docs/deploy-linode.md " +
          "(Docker en un servidor pequeño de unos cinco dólares — " +
          "el camino más transitado, casi todo automatizado por un " +
          "script) o docs/deploy-alternatives.md (Podman, o Linux " +
          "puro sin contenedores — la forma correcta para hardware " +
          "donado).",
        "Una traducción que hacer mientras las lees, porque ambas " +
          "empiezan clonando del repositorio público: donde una " +
          "guía diga que clones a una carpeta del servidor, en su " +
          "lugar copia allí tu archivo verificado y extráelo. Todo " +
          "lo demás — la llave del sistema, el archivo de " +
          "configuración, las llaves fundadoras, los respaldos, la " +
          "lista de 'antes de abrir al público' — aplica sin " +
          "cambios.",
        "Actualizar después, sin git: descarga el archivo más nuevo " +
          "desde cualquier servidor que corra la versión más nueva, " +
          "verifícalo igual, extráelo en una carpeta fresca, lleva " +
          "tu archivo de configuración y vuelve a desplegar. Los " +
          "datos de tu comunidad están a salvo durante esto — nunca " +
          "viven en la carpeta del código.",
      ],
      code: [
        "scp understoria-source.tar.gz SHA256SUMS root@YOUR-SERVER:/opt/\n" +
          "ssh root@YOUR-SERVER\n" +
          "cd /opt && sha256sum -c SHA256SUMS && mkdir understoria \\\n" +
          "  && tar -xzf understoria-source.tar.gz -C understoria\n" +
          "cd understoria",
      ],
    },
    {
      id: "seed",
      title: "6. Ahora tú también eres una semilla",
      paragraphs: [
        "En cuanto tu servidor esté arriba, ofrece SU propio código " +
          "de la misma manera — automáticamente, desde la misma " +
          "compilación. Tus miembros pueden verificar lo que están " +
          "usando, y el siguiente barrio puede arrancar desde ti " +
          "igual que tú acabas de arrancar desde tu comunidad. " +
          "Ningún punto único — ni GitHub, ni las autoras del " +
          "proyecto, ni ninguna operadora — puede quitarle el " +
          "software a todo el mundo a la vez.",
        "Dos hábitos mantienen fuerte la cadena: vuelve a desplegar " +
          "de vez en cuando (tu servidor ofrece el código de lo que " +
          "corre, así que correr algo reciente es sembrar algo " +
          "reciente), y conoce el servidor de una segunda comunidad " +
          "— la comprobación de comparar dos servidores solo " +
          "funciona si las comunidades pueden nombrarse entre sí.",
      ],
    },
  ],
  closing: [
    "Las preguntas que esta página no responde viven en la carpeta " +
      "docs de la descarga — docs/bootstrap-from-a-node.md es esta " +
      "misma guía con más detalle, y docs/operator-guide.md es el " +
      "manual del día a día para quien mantiene el servidor.",
  ],
};
