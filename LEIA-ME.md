# GameX — projeto completo com BukioPay

## Publicar na Vercel

1. Extraia o ZIP e abra a pasta `GameX-BukioPay`.
2. Envie **todo o conteúdo dessa pasta** para um novo repositório no GitHub. Na raiz devem estar `package.json`, `vercel.json` e as pastas `public`, `api`, `lib` e `scripts`.
3. Importe o repositório na Vercel. Framework: **Other**. Root Directory: raiz do repositório. A instalação, o build e a pasta de publicação já estão configurados em `vercel.json`.
4. Cadastre somente esta variável em **Environment Variables**:

   **Nome:** `BUKIOPAY_API_KEY`  
   **Valor:** sua chave da BukioPay, sem aspas e sem escrever `Bearer`.

   A chave precisa das permissões **`payments:create`** e **`payments:get`**. Use uma chave da conta onde a GameX deve receber os pagamentos.
5. Clique em **Deploy**. Se cadastrar a chave depois da publicação, faça **Redeploy**.

O domínio é o que a Vercel fornecer. Não é necessário editar endereço no código, configurar banco de dados, cadastrar webhook ou usar outra chave. Não adicione a chave em arquivos, no GitHub ou na pasta `public`.

## O que está incluído

- Site inteiro: catálogo com 24 produtos, preços em laranja, categorias, animações, avaliações, suporte e carrinho.
- Os três banners e o `community.css` correto, corrigindo o pacote publicado com JavaScript no lugar do CSS.
- Pix BukioPay: QR gerado no navegador a partir do Copia e Cola real, copiar código e confirmação consultada no servidor.
- Valores calculados no servidor, incluindo os cupons GAMEX, F0RCE e NASA (10%). Se a conta BukioPay cobrar tarifa do pagador, a tela mostra o total retornado e a tarifa antes do pagamento.
- Repetições da mesma tentativa recuperam a mesma cobrança usando Idempotency-Key. A tentativa fica salva no mesmo navegador.
- Consulta protegida por recibo criptografado, sem colocar a chave API no navegador. Trocar a chave API invalida recibos anteriores; clientes que já pagaram devem procurar o suporte.

## Conferir a configuração

Abra `https://SEU-DOMINIO/api/health`. `configured: true` indica que a variável está presente, **não** que a conta foi aprovada nem que uma cobrança real já foi validada.

Se houver erro, confira a chave e suas permissões na BukioPay. A conta também deve estar habilitada para receber Pix; eventuais exigências de verificação são feitas no painel da BukioPay.

## Entrega dos produtos

Este pacote recebe e confirma pagamentos. **A entrega dos créditos continua a cargo da equipe da GameX; não há integração com fornecedor de Robux ou envio automático por e-mail.**

No painel da BukioPay, a descrição registra o pedido GameX, os itens (código e quantidade), o e-mail e o telefone fornecidos pelo cliente. A equipe pode usar esses dados para localizar a compra e entregar. Confira também o valor e o status no painel antes da entrega.

Os códigos dos itens estão em `lib/catalog.cjs`: `r` = Robux, `vb` = V-Bucks, `vp` = Valorant Points, `d` = Diamantes. Exemplo: `2xr1200` representa 2 pacotes de 1200 Robux.

## Estrutura

- `public/`: páginas e imagens; preserva a pasta `public/assets/` inteira.
- `api/`: funções de criação, consulta e diagnóstico da configuração.
- `lib/`: integração BukioPay e catálogo de preços do servidor.
- `scripts/`: verificação executada durante o build.

Este ZIP é completo. Não misture seus arquivos com ZIPs anteriores de GoatPay/Netlify. Um novo repositório evita deixar arquivos antigos ativos.

## Validação realizada

Testes com respostas simuladas: 24 produtos, cupons, tarifas, recuperação de resposta perdida sem cobrança duplicada, aprovação consultada na API, expiração, reembolso, recibo adulterado, troca de chave, erros de API, QR decodificado e cópia do Pix. Nenhuma cobrança real foi criada e o projeto não foi publicado automaticamente.

Integração baseada no mesmo contrato usado no projeto OSUK: `https://bukio.up.railway.app/v1/payments`, autenticação Bearer, valores em centavos e permissões payments:create/payments:get.
