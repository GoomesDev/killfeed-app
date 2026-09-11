# Primeira entrega — inspeção e fundação

Data: 2026-09-05. Fonte da verdade: `../cs-app-backend`. Nenhum arquivo Laravel foi alterado, nenhum `.env` foi lido e nenhum comando de banco, seeder ou job foi executado.

## Status e limite da entrega

A inspeção foi concluída e a fundação mobile foi corrigida. **A vertical slice Steam → sessão → current user → Home → ranking está bloqueada no backend.** A tela de entrada apresenta o login como temporariamente indisponível. Não há login fictício, token manual, dados de demonstração, Home com números inventados ou ranking calculado no dispositivo.

O serviço de perfil público está tipado e preparado, mas não é usado como substituto de current user e ainda não foi validado contra um servidor HTTP em execução. Não foram criadas telas de Amigos, Perfil ou badges completos.

## Backend encontrado

Foram lidos routes, todos os Models, Controllers, migrations, Services, Jobs, seeders (somente leitura), configurações de autenticação/Sanctum, composer, bootstrap e testes Feature. Não existem diretórios de Requests, Resources, Actions ou enums neste checkout.

| Model (arquivo) | Estrutura e relações reais |
| --- | --- |
| `Users` (`Users.php`) | `users`: identidade Steam diretamente no usuário; `friends()` e `addedMe()` são belongsToMany autorreferentes pela pivot `friends`. Cast boolean de `is_active`; oculta email e timestamps de criação/atualização. Usa HasApiTokens, mas estende Model, não Authenticatable. |
| `Friend` (`Friends.php`) | `friends`: user_id, friend_id e created_at; belongsTo Users para ambos; sem timestamps automáticos. Nome de classe diverge do arquivo PSR-4. |
| `UserStatSnapshots` | snapshots cumulativos por usuário/data, únicos por esse par; belongsTo Users. Contadores inteiros, snapshot_date date e métricas decimal:2 (serializadas como strings). |
| `WeeklyRanking` (`WeeklyRankings.php`) | ranking **semanal**, week, user_id, rating decimal:2; belongsTo Users. Nome de classe diverge do arquivo. Não há posição persistida ou ranking mensal. |
| `Badges` | code, name, description e icon; sem relações declaradas. |
| `UserBadge` (`UserBadges.php`) | belongsTo Users e Badges; reference_month normalizado para YYYY-MM; created_at datetime. Nome de classe diverge do arquivo. |

Não foram encontrados `steam_profiles`, `matches`, `player_match_stats` nem `monthly_rankings`. Uma factory SteamProfile existe, mas não comprova entidade/model ou endpoint ativo.

### Rotas e contratos

| Método e caminho | Comportamento encontrado | Uso mobile |
| --- | --- | --- |
| GET `/auth/steam/redirect` | Redireciona para Steam OpenID; return_to aponta para callback Laravel. | Mapeado, não acionado enquanto autenticação estiver incompleta. |
| GET `/auth/steam/callback` | Identifica/cria Users; gera token Sanctum `mobile`; responde `{ token, steam_id, user }` como JSON. Erros `{ error }`. | Mapeado; não existe retorno ao app. |
| GET `/api/get-profile/{userId}` | Modelo Users diretamente, sem envelope data; 404 `{ error: "Usuário não encontrado" }`. Público. | DTO Zod e queryOptions preparados em `src/features/profile/api.ts`. Identificador é ID numérico local. |
| GET `/api/player-stats/{userId}` | Consulta Steam e grava snapshot; não retorna o resultado de createSnapshot, portanto sucesso sem payload útil. | Não integrado; GET tem efeito de escrita. |
| GET `/api/player-stats/daily-snapshot/{userId}/{date}` | Fonte em routes/api.php exige data; tenta comparar dois snapshots filtrados pela mesma data. | Não integrado, contrato/algoritmo inconsistentes. |

`php artisan route:list --json --except-vendor` mostrou a rota diária **sem `{date}`**, embora o método exija esse argumento. Há divergência entre rotas efetivamente carregadas e fonte (compatível com cache desatualizado). Nenhum cache Laravel foi limpo. As três rotas API têm apenas middleware `api`, sem `auth:sanctum`.

### Auth

Sanctum 4 está instalado; o callback chama createToken(...)->plainTextToken e a configuração Sanctum contempla Bearer. Porém:

1. A resposta de `check_authentication` da Steam é ignorada: não é comprovado `is_valid:true` antes de emitir credenciais.
2. Não há vínculo seguro de uma tentativa mobile com o callback, nem deep link, código de troca ou endpoint de conclusão.
3. JSON exibido no navegador não é uma sessão que WebBrowser pode recuperar no React Native.
4. Não há current user protegido ou logout/revogação expostos.
5. O provider padrão aponta para `App\Models\User`, inexistente neste checkout; `Users` não implementa o contrato Authenticatable. Overrides de ambiente não foram inspecionados.

Não foram adicionados interceptors Bearer ou persistência de tokens desconectados de um login real. A store anterior, que aceitava qualquer usuário como autenticado, foi removida. Zustand permanece instalado para o estado mínimo de sessão quando o contrato estiver disponível; os dados do usuário deverão ficar no TanStack Query.

Para credenciais nativas, a escolha avaliada é [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/), que usa armazenamento criptografado Android/Keychain iOS. Instalação e integração ficam para a conclusão da autenticação. AsyncStorage permanece reservado a dados não sensíveis. Não haverá fallback de token para AsyncStorage ou token em URL.

### Stats e CS Score

ScoreCalculator implementa K/D, HS%, Win Rate, rating customizado, impact_score e KDD. O mobile não replica nenhum cálculo. Não há contrato dizendo se **CS Score** corresponde a rating, impact_score ou outra métrica.

Snapshots têm matches, wins, losses, rounds, kills, deaths, MVPs, bombas e headshots. Não há ADR ou assists expostos. O endpoint de sincronização não devolve estatísticas, e não há endpoint de leitura do último snapshot.

A consulta diária restringe pela mesma data apesar da unicidade user_id/snapshot_date, impedindo obter dois snapshots distintos. As métricas derivadas da instância temporária não são calculadas por accessors. getWeeklyStats não tem rota e referencia Carbon sem import. RecalculateSnapshotScoresJob usa updateOrCreate sem chave de identidade apropriada e redispara a si mesmo; não foi executado.

### Ranking, amigos, badges e perfil

FriendsController, WeeklyRankingsController, BadgesController e UserBadgesController estão vazios e sem rotas. Não há importação Steam de amigos implementada, classificação mensal, Top 3 oficial, atribuição de badges, destaque do mês ou histórico via API. O perfil público retorna apenas identidade, sem stats, score ou badges.

O teste GetProfileApiTest usa RefreshDatabase e espera `name`, campo ausente no schema atual. Não executei a suíte Laravel porque ela pode recriar tabelas e a configuração de banco de teste não foi autorizada/verificada. O teste Example também espera `/`, rota não encontrada na fonte web atual.

## Fundação mobile

| Item | Resultado |
| --- | --- |
| Node / Yarn | 22.23.1 (`.nvmrc`) / 1.22.22; somente Yarn para dependências |
| Expo | 57.0.20, atualizado via `npx expo install expo@^57.0.20 --yarn --fix`, depois `npx expo install --fix --yarn` |
| React / React Native | 19.2.3 / 0.86.3, alinhados pelo Expo |
| Expo Router | 57.0.19 |
| NativeWind / Tailwind | 4.2.6 / 3.4.17 |
| Reanimated / Worklets | 4.5.1 / 0.10.1 |
| Axios / Query / Zustand | 1.20.0 / 5.102.8 / 5.0.15 |
| React Hook Form / Zod | 7.87.0 / 4.5.4; nenhum formulário de senha criado |

Expo 57 era e continua sendo o SDK estável confirmado no registro. A atualização de patches corrige a regressão Hermes apontada pelo Doctor. React/RN não foram atualizados independentemente. NativeWind 5 é preview; Tailwind 4 exige migração incompatível com a base NativeWind 4. TypeScript 6 foi preservado; não foi feita migração arbitrária para 7.

ESLint foi ajustado de 10 para 9.39.5 por incompatibilidade declarada dos plugins react/import usados pelo eslint-config-expo. A linha 9 emite aviso de fim de suporte; fica como limitação da cadeia de lint e deve ser atualizada quando os plugins Expo suportarem 10. Não se usou --force ou supressão de checks.

### Configurações

- Babel: babel-preset-expo com jsxImportSource nativewind + preset nativewind/babel. Sem expo-router/babel, module-resolver ou plugin Reanimated redundante. O preset Expo detecta Worklets automaticamente (confirmado no código instalado).
- Metro: getDefaultConfig + withNativeWind e src/global.css.
- NativeWind: preset v4, content src/**/*.{ts,tsx}, referência de tipos, CSS importado no root layout. Classes de layout usadas na entrada; tokens visuais centralizados em theme.
- TypeScript strict; paths `@/*` → `src/*`, sem baseUrl obsoleto ou resolução via Babel.
- AppProvider usa a única instância QueryClient existente, retry 1 e staleTime 5 minutos.
- Axios usa EXPO_PUBLIC_API_URL, timeout 10 segundos, Accept/Content-Type JSON; rejeita URL ausente em vez de enviar requests relativas acidentalmente. Erros originais permanecem disponíveis, e o formatador preserva mensagens/validação Laravel 422.
- Design system: colors, spacing, radius, typography e arquivo shadows sem efeitos desnecessários; Inter empacotada localmente pela dependência de fontes.
- app.json: identidade Killfeed e modo escuro; removidas referências a assets inexistentes. Ícones de distribuição definitivos permanecem pendentes.

### Arquivos

Criados: `.env.example`, `.nvmrc`, `metro.config.js`, `eslint.config.js`, `nativewind-env.d.ts`, `src/global.css`, tokens radius/shadows, `src/components/ui/Button.tsx`, `src/components/layout/Screen.tsx`, `src/features/auth/LoginScreen.tsx`, `src/app/(auth)/login.tsx`, `src/features/profile/api.ts`, `src/lib/api/errors.ts`, testes de erros HTTP e este relatório.

Modificados: package.json/yarn.lock, app.json, Babel/Tailwind/TypeScript, root layout/index, theme existente, Axios/endpoints, AppProvider e README. Removida a store de login simulado. O cliente público de perfil está preparado; nenhuma API está sendo chamada pela tela de login indisponível.

## Propostas para destravar a próxima entrega (não são APIs existentes)

Os nomes de rota abaixo são **sugestões para revisão do backend**, não constantes nem contratos implementados no app.

| Capacidade proposta | Contrato mínimo sugerido | Responsável sugerido |
| --- | --- | --- |
| Finalização mobile da Steam | Validar OpenID integralmente; vincular tentativa, callback e aplicativo; devolver código curto de uso único por deep link allowlisted e trocá-lo por `{ token, user }` por POST. Validar expiração e impedir replay. Definir caminhos e parâmetros após revisão. | SteamAuthController + FormRequests específicos |
| GET `/api/me` protegido | `{ data: <identidade Users> }`, 401 quando inválido | UsersController + UserResource |
| POST `/api/logout` protegido | Revogar token atual e retornar 204 | Controller de sessão |
| GET `/api/home` protegido | `{ data: { reference_month, cs_score, ranking_position, featured_badge, top_friends } }`; valores indisponíveis null, listas vazias, Top 3/posição selecionados oficialmente pelo servidor | HomeController + HomeResource |
| GET `/api/rankings/current` protegido | `{ data: [{ user_id, position, display_name, avatar, cs_score }], meta: { reference_month } }`; definir paginação e inclusão do próprio usuário | Controller/Resource de ranking mensal a definir |
| Leitura stats | Snapshot/estatísticas do período e nomes/unidades das métricas oficiais, incluindo definição inequívoca de CS Score | UserStatSnapshotsController + StatsResource |

Primeiro corrigir autenticação e publicar current user/logout. Depois definir score/período e disponibilizar Home/ranking mensal com autorização entre amigos. Somente então implementar persistência SecureStore, store de sessão mínima, navegação protegida, Home e ranking com loading/erro/vazio/sucesso. Amigos e Perfil ficam para a entrega seguinte, conforme escopo solicitado.

Referências utilizadas: [upgrade oficial Expo](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/), [NativeWind v4](https://www.nativewind.dev/docs/getting-started/installation), [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/). Contratos de produto vieram exclusivamente do checkout Laravel, não dessas documentações.

## Validação final

- `npx expo-doctor`: **21/21 checks passaram** (inicialmente eram 18/21).
- `npx expo install --fix --yarn`: dependências alinhadas, sem alterações adicionais necessárias.
- `npx tsc --noEmit`: passou após regeneração dos tipos Expo Router pelo Metro.
- `yarn lint`: passou sem erros ou warnings de código. O script usa `--no-cache` para não reutilizar diagnósticos de resolução anteriores às mudanças de tsconfig.
- `node --test tests/api-errors.test.mjs`: passou; cobre mensagens Laravel, validação 422, erro não JSON, rede e configuração.
- `npx expo export --platform all`: bundles Android/iOS e exportação estática web concluídos em dist (ignorado pelo Git).
- `npx expo start --offline --port 8087`: Metro iniciou e gerou tipos das rotas. Servidor temporário encerrado após verificação.
- `git diff --check`: passou.

Não houve execução em dispositivo/emulador nem autenticação real contra Steam. Empacotamento não substitui validação visual/nativa. Não há mocks temporários. Não foram executados testes Laravel com RefreshDatabase.

Em um checkout novo, execute `yarn start` uma vez para o Expo gerar `.expo/types` antes de verificar tipos de rotas com `yarn typecheck`.
