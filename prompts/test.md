Gere a estratégia de testes para esta solução.

Quero cobertura para:
- testes unitários do domínio
- testes unitários do motor de elegibilidade
- testes de integração de repositórios
- testes de API
- contract tests para integrações externas
- testes de idempotência
- testes de eventos
- casos negativos

Inclua cenários mínimos:
1. Cliente elegível para oferta A e seleciona Cashback
2. Cliente elegível para oferta B e seleciona Sala VIP + Pontos
3. Cliente tenta selecionar Cashback e Pontos juntos
4. Cliente tenta Seguro de viagem com oferta A
5. Cliente não elegível para a oferta escolhida
6. Falha na criação do cartão
7. O cartão é criado, mas falha a ativação de um benefício
8. Repetição do mesmo submit com a mesma idempotency key

Entrega:
- matriz de casos de teste
- estrutura de arquivos de teste
- exemplos com Jest
- recomendações de fixtures e builders