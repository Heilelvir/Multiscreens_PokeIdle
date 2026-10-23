# PokeMulti

**Português** · [English](README.en.md) · [⬇ Baixar a última versão](../../releases/latest)

Gerenciador de múltiplas contas do **[PokeIdle](https://pokeidle.io)** para Windows: jogue **até 4 sessões ao mesmo tempo, numa única janela**, cada uma com seu próprio login e seus próprios dados.

> Projeto de fã, **não oficial**. Sem afiliação com o PokeIdle, Nintendo, Game Freak, Creatures ou The Pokémon Company.

<!-- Capturas de tela (reais, sem dados de conta): ![Grade de sessões](docs/grade.png) ![Janela de Lives](docs/lives.png) -->

## Funcionalidades

- Até **4 sessões** em grade, com login e dados separados em cada uma.
- **Barra inferior** com uma aba por sessão: mostrar só uma, renomear, **arrastar para reordenar**, silenciar, zoom, recarregar, janela própria e fechar.
- **Botão direito** (na aba ou dentro do jogo) com as mesmas ações e mais algumas.
- **Fechar uma sessão sem perder o login**: ao abrir de novo no **+**, ela volta já logada.
- **Janela própria** para qualquer sessão.
- **Lives**: abre as transmissões que dão bônus no navegador padrão do Windows, todas juntas numa nova janela. Se preferir, também dá para abri-las dentro do app, em abas silenciadas.
- **Idioma** em Português ou English, pelo menu (botão ☰).
- **Atualizações pelo próprio app**: avisa quando há versão nova e instala com um clique, sem voltar ao GitHub.
- **Botão "Todas"**: aplica zoom, som e recarregar a todas as sessões de uma vez.
- **Atalhos F1 a F12** que funcionam em qualquer parte do app, inclusive na barra e na janela das Lives.
- Roda localmente, sem telemetria.

## Como instalar (Windows 10/11)

1. Abra a página de **[Releases](../../releases/latest)** deste projeto.
2. Em **Assets**, baixe o **`PokeMulti-Setup-….exe`**.
3. Dê dois cliques no arquivo baixado e siga o assistente (Avançar → Instalar). Ele cria um atalho na área de trabalho.

Não precisa instalar mais nada.

### Aviso do Windows SmartScreen
Como o instalador não tem assinatura digital, o Windows pode exibir **"O Windows protegeu seu PC"**. Esse aviso, por si só, não diz se o arquivo é seguro ou malicioso. Baixe o instalador **somente** da página de Releases deste repositório e, se quiser, confira o hash SHA-256 (veja abaixo). Se confiar na origem e aceitar os riscos, clique em **Mais informações → Executar assim mesmo**.

## Primeiro uso

1. Abra o **PokeMulti** pelo atalho. Ele abre com **2 sessões** lado a lado.
2. **Faça login em cada quadrante** uma vez. O login fica salvo.
3. Aperte **F12** a qualquer momento para ver os atalhos. O botão **☰**, na barra inferior, abre o menu com **Idioma / Language** e as opções das Lives.

### O que dá para fazer

| Quero... | Como |
|---|---|
| Ver só uma sessão | Clique na aba dela, na barra inferior, ou `F1` a `F4` (de novo volta à grade) |
| Voltar para a grade | Botão **Grade** ou `F5` |
| Criar uma sessão | Botão **+** ou `F6` (máximo de 4) |
| Fechar uma sessão | Botão **✕** da aba, `F7` ou botão direito → **Fechar sessão** |
| Renomear uma sessão | Duplo clique na aba, ou botão direito → **Renomear…** |
| Mudar a ordem das sessões | Arraste a aba na barra inferior (a grade acompanha). Alternativas: botão direito → **Mover…** ou `Ctrl+Alt+←/→` |
| Silenciar uma sessão | Botão 🔊 / 🔇 da aba |
| Dar zoom (50% a 200%) | Botões − e + da barra (clique no valor para voltar a 100%) |
| Zoom, som e recarregar em todas de uma vez | Ligue o botão **Todas** na barra inferior, ou use o menu **Sessões** |
| Abrir em janela própria | Botão ⧉, `Shift+F1` a `Shift+F4` ou botão direito |
| Alternar entre 2 e 4 sessões | `F8` ou menu **Sessões** |
| Recarregar | `Ctrl+R` (botão ↻ na barra). `Ctrl+Shift+R` recarrega todas sem cache |
| Abrir as lives com bônus | Botão **Lives** ou `F9` |
| Tela cheia | `F11` |
| Ver os atalhos | `F12` |

### Sobre as Lives
O botão **Lives** (ou `F9`) abre as transmissões que dão bônus de XP **no navegador padrão do Windows**, todas juntas numa **nova janela**, uma aba por live. Como é o seu navegador, você usa o login que já tem na Twitch e na Kick, sem problema de "navegador não suportado".

- **Novas lives:** quando entra uma live nova, o app avisa com uma notificação e o botão ganha um ponto vermelho. Apertar `F9` de novo abre só as que ainda não foram abertas. Para abrir todas outra vez: ☰ → **Exibir** → **Reabrir todas as lives no navegador**.
- **Som:** o app **não consegue silenciar** abas do seu navegador. Silencie você mesmo: no Chrome e no Edge, clique com o botão direito na aba e escolha **Silenciar site**, e o navegador lembra da escolha para a Twitch; no Firefox, clique no ícone de som da aba.
- **Qualidade:** é a do player da Twitch no seu navegador. Escolha uma qualidade baixa (por exemplo 160p) uma vez, e em geral ele lembra. É o que mais reduz o uso de memória e de internet.
- **Limite:** ☰ → **Exibir** → **Limite de lives da Twitch** (padrão: 6).
- **Modo "Dentro do app":** em ☰ → **Exibir** → **Abrir lives em**, dá para voltar a abrir as lives numa janela do próprio app, com as abas silenciadas e a qualidade mínima por padrão (menu **Qualidade das lives**). Nesse modo o login na Twitch e na Kick é feito dentro da janela, e o login por Google/Apple/Facebook pode não funcionar. Popups e redirecionamentos de anúncio são bloqueados, e alguns domínios de rastreamento são cancelados. Os anúncios em vídeo da própria Twitch não são bloqueados.

## Segurança e privacidade

Comportamentos confirmados no código:

- Cada sessão usa uma partição própria do navegador interno, salva no seu computador, então cookies e login não se misturam.
- O app só carrega o site do jogo (e, no modo "Dentro do app", as páginas de lives da Twitch e da Kick). Links para outros endereços abrem no navegador padrão. Por padrão as lives abrem direto no seu navegador.
- Sem telemetria: o app não envia seus dados a terceiros.
- **Atualizações:** o app consulta a página de Releases deste projeto no GitHub para saber se há versão nova. Isso pode ser desligado em ☰ → **Ajuda** → **Verificar atualizações ao iniciar**. Nada é baixado nem instalado sem a sua confirmação, e o pacote é conferido pelo hash publicado na Release. Como o instalador não é assinado digitalmente, a segurança das atualizações depende da conta do autor no GitHub.
- Câmera, microfone, localização e notificações são negados.
- Fechar uma sessão **não apaga** os dados dela. Para apagar, use **Resetar dados da sessão**.
- O código é público, mas isso não é garantia de segurança: confira você mesmo se quiser.

**Posso ser banido?** Use de acordo com os [termos do PokeIdle](https://pokeidle.io/terms). O app não burla regras do jogo, mas a responsabilidade pelo uso é sua, e quem publica o projeto não responde por penalidades aplicadas pelo jogo.

**Pesa muito?** Cada sessão é uma "aba" do navegador interno, então a memória sobe com a quantidade. As lives abertas no seu navegador também gastam memória lá: use qualidade baixa e o limite de lives. Se o PC sofrer, use 2 sessões.

**Isso é pago?** Não. O projeto é gratuito e de código aberto. Ele abre o jogo com o **código de indicação do autor** (visível em ☰ → **Ajuda → Sobre**), e é assim que o autor pode receber diamantes no jogo.

## Ajude o projeto

Se você ainda não tem conta no PokeIdle e quer ajudar o autor, crie a sua pelo link de indicação: **[pokeidle.io/?ref=656DPSE](https://pokeidle.io/?ref=656DPSE)**. É opcional, não muda nada para você, e o autor recebe diamantes no jogo. O app já abre o jogo com esse código.

## Solução de problemas

- **Uma sessão ficou em branco ou travada:** botão ↻, `F5` ou, se precisar, `Ctrl+F5` (ignora o cache).
- **Pede login de novo:** use **Resetar dados da sessão** só se estiver com problema, porque isso apaga o login.
- **As Lives não aparecem:** espere alguns segundos depois de abrir as sessões e confirme que está logado no jogo.
- **As lives abriram numa janela já existente do navegador:** o app tenta abrir uma nova janela com Chrome, Edge, Brave, Opera, Vivaldi e Firefox. Com outro navegador, ele abre uma aba por vez no navegador padrão.
- **Abriu com som:** o app não controla o som do seu navegador. Veja a dica de silenciar em **Sobre as Lives**.
- **A atualização não aparece:** use ☰ → **Ajuda** → **Verificar atualizações…**. Quem tem uma versão **anterior à 1.3.0** precisa baixar o instalador manualmente uma vez; depois disso as atualizações vêm pelo app.
- **Na janela "Dentro do app" a Twitch diz que o navegador não é suportado:** use login por e-mail e senha ou volte ao modo "Navegador padrão".
- **O Windows bloqueou o instalador:** veja o aviso do SmartScreen acima.

## Como reportar problemas

Abra uma [issue](../../issues) com a versão do app (☰ → **Ajuda → Sobre**), o que você fez e o que aconteceu. **Não envie** senhas, tokens, cookies, e-mails ou capturas de tela com dados de conta.

## Para quem quer conferir o arquivo (opcional)

Cada versão traz um `SHA256SUMS.txt`. No PowerShell, na pasta do download:

```
Get-FileHash .\PokeMulti-Setup-<versão>.exe -Algorithm SHA256
```

O resultado deve ser igual ao do arquivo. Isso confirma que o arquivo é o que foi publicado, não que ele seja seguro.

---

## Para desenvolvedores

Requer Node.js 22.12 ou mais novo.

```
npm install
npm start          # roda direto do código
npm test           # sintaxe + testes
npm run dist       # gera dist/PokeMulti-Setup-<versão>.exe
```

Sem Node na sua máquina: suba o projeto no GitHub e rode **Actions → Build e Release**, ou crie uma tag. A Release precisa conter o `latest.yml` e os `.blockmap` (o workflow já publica); sem eles o app não se atualiza. **A tag deve ser igual à `version` do `package.json`** (por exemplo, versão `1.1.0` → tag `v1.1.0`), porque o nome do instalador vem do `package.json`.

- Link de indicação: constante `GAME_URL` em `src/config.js`. Troque pelo seu se fizer uma versão própria.
- Domínios permitidos para navegação: `GAME_HOSTS` e `LIVE_HOSTS` em `src/config.js`.
- Textos da interface: `src/i18n.js` (português e inglês) e `ui/help.*.html`.
- Atalhos: todos em `src/shortcuts.js`. Para trocar uma tecla, edite só esse arquivo.
- Domínios de rastreamento bloqueados nas Lives: `LIVE_BLOCKED_HOSTS` em `src/config.js`.

## Licença
[MIT](LICENSE)
