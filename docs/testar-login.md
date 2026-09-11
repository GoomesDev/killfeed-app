# Testar Steam no Android

O mobile implementa PKCE S256, state, callback e troca única conforme o contrato Laravel. Token e expiração são salvos no SecureStore. A identidade recebida fica no cache TanStack Query. Nenhum endpoint de Home/current user/logout foi adicionado.

1. Inicie um emulador Android no Android Studio ou conecte um aparelho com depuração USB. Confirme com `adb devices`.
2. Configure `.env.local` no mobile: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000` para emulador padrão, ou `http://<IP-LAN-do-PC>:8000` para aparelho.
3. No backend, configure manualmente APP_URL com a mesma origem e STEAM_CALLBACK_URL com essa origem + `/auth/steam/callback`. Mantenha APP_ENV=local para HTTP. Não misture localhost com IP durante o fluxo: a cookie exige a mesma origem. Se houver cache de configuração, atualize-o pelo processo do backend.
4. Laravel deve escutar em `0.0.0.0:8000`. A migration de autenticação deve estar aplicada.
5. No mobile: `nvm use`, `yarn install --frozen-lockfile` e `npx expo run:android --device`. Requer SDK Android/JDK configurados. O comando cria e instala a build nativa com scheme killfeedmobile. Se solicitar application ID, escolha um identificador estável, por exemplo `com.killfeed.mobile`.
6. Toque Entrar com Steam e conclua no navegador. O retorno esperado mostra “Steam conectada” e “Login concluído. Sessão salva com segurança.” Não exibe token.
7. Feche e reabra o app: deve mostrar sessão salva. Isso é restauração local, não validação de revogação no servidor (current user ainda não existe).

Expo Go e web não suportam este teste: o botão explica a necessidade de build nativa. Para futuras alterações apenas JavaScript, use `yarn start` e abra a build instalada. Alterações nativas exigem recompilar.

Teste também cancelamento e nova tentativa. Só há uma tentativa em andamento; códigos não são repetidos automaticamente após falha de rede. Se o sistema matar o processo durante o navegador, o verificador em memória é descartado e será necessário reiniciar o login. Suspensão normal preserva a tentativa, por até 10 minutos.

Não há logout remoto neste escopo. Sessões expiradas são descartadas ao restaurar o app. Para repetir um teste após sucesso, limpe os dados locais do app nas configurações Android; isso não revoga o token já emitido no servidor.

Se o navegador não alcançar Laravel, abra a origem configurada no navegador do aparelho e verifique rede/porta. HTTPS acessível é preferível se o dispositivo/build restringir HTTP. O túnel Metro não expõe a API Laravel.

## Perfil após login

Após a troca, o aplicativo agora abre o perfil do ID recebido da Steam/Laravel. O ID mínimo é persistido junto da credencial no SecureStore para permitir recarregar o perfil depois de reiniciar, sem persistir um cache paralelo do usuário. Sessões do formato antigo exigem novo login.

A identidade vem de GET /api/get-profile/{userId}. As estatísticas vêm de GET /api/player-stats/weekly-snapshot/{userId}, usando a semana atual do servidor e exibindo o intervalo observado retornado em period. K/D, HS% e Win Rate são calculados exclusivamente no backend. Atualizar perfil apenas consulta esses endpoints; não dispara sincronização com Steam.

Se faltarem snapshots, a mensagem original do backend aparece com opção de tentar novamente. GET /api/player-stats/{userId} ainda grava dados sem retornar estatísticas; por isso não é chamado automaticamente. CS Score e badges continuam aguardando contrato próprio. O perfil não comprova validade do token no servidor: o endpoint de identidade ainda é público e current user não existe.
