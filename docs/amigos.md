# Amigos — estado da integração

O menu inferior contém somente Perfil e Amigos. Perfil é a entrada após login; as duas rotas exigem sessão local restaurada. A barra fica fora do scroll e respeita a área de navegação do aparelho.

A tela Amigos apresenta disponibilidade futura, não uma lista vazia atribuída ao usuário. No backend inspecionado, FriendsController está vazio e routes/api.php não publica listagem ou sincronização de amigos. Não foram adicionados mocks, endpoints fictícios ou alterações Laravel.

Para integrar a lista, o backend precisa definir uma rota autenticada e um Resource com identificação local, nome Steam, avatar e estado de participação no app, além de paginação quando aplicável. A visibilidade deve ser restrita aos amigos do usuário autenticado. Caminhos e payload finais precisam ser confirmados antes de adicionar tipos e serviço mobile. A navegação ao perfil de um amigo será implementada com essa integração.
