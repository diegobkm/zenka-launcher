# AGENTS.md — Regras para modelos de IA neste workspace

Este repositório é trabalhado por **vários modelos diferentes**. Todo agente deve seguir estas regras.

## Idioma

- Comunicação com o usuário: **português (Brasil)**, a menos que o usuário peça outro idioma.
- Código, commits e nomes de arquivos: **inglês** (padrão da indústria).
- Comentários no código: só se o usuário pedir; preferir zero comentários.

## Escopo e proatividade

1. **Só altere o que foi pedido.** Não refatore, não renomeie pastas, não “melhore” apps não relacionados.
2. **Não faça commit** a menos que o usuário peça explicitamente.
3. **Não invente secrets**, chaves de API ou URLs de produção.
4. Se a tarefa for ambígua, **pergunte** (stack, nome do app, plataforma alvo).

## Onde colocar o quê

| Tipo                         | Destino                          |
|-----------------------------|----------------------------------|
| App novo (desenvolvimento)  | `apps/<kebab-case-name>/`        |
| App morto / pausado         | `apps/_archive/<name>/`          |
| Mods/configs do celular     | `device/<device-id>/`            |
| GCam (S21 Ultra)            | `device/s21-ultra/gcam/`         |
| UI compartilhada            | `packages/ui/`                   |
| Utils compartilhados        | `packages/utils/`                |
| Cliente HTTP / API          | `packages/api-client/`           |
| Config ESLint/TS/Prettier   | `packages/config/`               |
| Docs do workspace           | `docs/`                          |
| Scripts de automação        | `scripts/`                       |
| Assets globais              | `assets/`                        |
| Template de scaffold        | `templates/<stack>-app/`         |

**Nunca** solte arquivos soltos na raiz do workspace.

## Device mods (S21 Ultra etc.)

- Trabalho em aparelho físico (GCam, configs, Magisk, backups) → `device/<id>/`, **não** em `apps/`.
- S21 Ultra: `device/s21-ultra/` (ver README da pasta).
- Não versionar APKs grandes; versionar XMLs, notas e scripts.
- Não misturar código de app novo com mods de device.

## Stacks e preferências

- **Padrão sugerido:** Expo (React Native) + TypeScript.
- Flutter: use se o usuário pedir Flutter explicitamente.
- RN CLI: só se precisar de módulos nativos que o Expo não cobre bem.
- Antes de adicionar dependência, **verifique** se o projeto já usa algo equivalente.

## Ao criar um app

1. Criar `apps/<nome>/` com a stack escolhida.
2. Incluir `.env.example` (sem valores secretos).
3. Incluir `README.md` curto do app (como rodar, plataformas, scripts).
4. Se o app for Expo: TypeScript + estrutura `src/` (screens, components, hooks, services, theme).
5. Registrar o app mentalmente em `docs/` se houver guia de inventário; senão, só o README do app basta.

## Ao editar um app existente

1. Ler o `README.md` e `package.json` / `pubspec.yaml` do app **antes** de mudar código.
2. Seguir o estilo e libs **já usados** naquele app.
3. Não misturar stacks no mesmo app.
4. Rodar lint/typecheck do app se existir script (`npm run lint`, `flutter analyze`, etc.).

## Multi-app / monorepo

- Packages em `packages/` só quando **2+ apps** precisam do mesmo código.
- Evite acoplar apps entre si; compartilhe via packages, não via imports relativos entre pastas de apps.

## Segurança

- Nunca commitar: `.env`, keystores, `google-services.json` com secrets, tokens.
- Use `.env.example` com placeholders.
- Não logar tokens ou PII em produção.

## Qualidade mínima

- TypeScript strict quando o projeto já for TS.
- Nomes claros; componentes em PascalCase; pastas em kebab-case.
- Sem comentários óbvios ou gerados por IA do tipo “// this function does X”.
- Respostas ao usuário: **curtas e diretas** no CLI.

## Checklist rápido por tarefa

```
[ ] Li AGENTS.md e o README do app alvo
[ ] Sei a stack e a pasta correta
[ ] Não toquei em apps não relacionados
[ ] Não adicionei secrets
[ ] Rodei lint/typecheck se disponível
[ ] Não fiz commit sem pedido
```

## Modelos diferentes, mesmo padrão

Independente do modelo (Grok, Claude, GPT, etc.):

- Mesma estrutura de pastas
- Mesmas convenções de nome
- Mesmo `AGENTS.md` como fonte de verdade
- Se algo no `AGENTS.md` conflitar com o hábito do modelo, **vence o AGENTS.md**

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
