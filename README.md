# PokeMulti

**Português** · [English](README.en.md) · [⬇ Baixar a última versão](../../releases/latest)

Gerenciador de múltiplas contas do **[PokeIdle](https://pokeidle.io)** para Windows: jogue **até 4 sessões ao mesmo tempo, numa única janela**, cada uma com seu próprio login e seus próprios dados.

> Projeto de fã, **não oficial**. Sem afiliação com o PokeIdle, Nintendo, Game Freak, Creatures ou The Pokémon Company.

<!-- Capturas de tela (reais, sem dados de conta): ![Grade de sessões](docs/grade.png) ![Janela de Lives](docs/lives.png) -->

## Funcionalidades

- Até **4 sessões** em grade, com login e dados separados em cada uma.
- **Barra inferior** com uma aba por sessão: mostrar só uma, renomear, silenciar, zoom, recarregar, janela própria e fechar.
- **Botão direito** (na aba ou dentro do jogo) com as mesmas ações e mais algumas.
- **Fechar uma sessão sem perder o login**: ao abrir de novo no **+**, ela volta já logada.
- **Janela própria** para qualquer sessão.
- **Lives**: abre as transmissões que dão bônus, cada uma numa aba silenciada, em qualidade mínima por padrão (para gastar menos memória) e sem abrir anúncios no seu navegador.
- **Idioma** em Português ou English, pelo menu (botão ☰).
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
| Silenciar uma sessão | Botão 🔊 / 🔇 da aba |
| Dar zoom (50% a 200%) | Botões − e + da barra (clique no valor para voltar a 100%) |
| Abrir em janela própria | Botão ⧉, `Shift+F1` a `Shift+F4` ou botão direito |
| Alternar entre 2 e 4 sessões | `F8` ou menu **Sessões** |
| Recarregar | `Ctrl+R` (botão ↻ na barra). `Ctrl+Shift+R` recarrega todas sem cache |
| Abrir as lives com bônus | Botão **Lives** ou `F9` |
| Tela cheia | `F11` |
| Ver os atalhos | `F12` |

### Sobre as Lives
O botão **Lives** abre uma janela com as transmissões que dão bônus de XP, cada uma numa aba **sem som**. Na primeira vez, faça login na Twitch (e na Kick, se usar) dentro dessa janela, com a mesma conta vinculada ao jogo. O login fica salvo.

- **Qualidade e memória:** no menu ☰ → **Exibir**, escolha a **Qualidade das lives** (a mínima, 160p, é o padrão) e o **Limite de lives da Twitch** (padrão: 6). Cada live é um player de vídeo, então é o que mais pesa.
- **Login:** a janela se apresenta como um Chrome comum. O login por e-mail e senha deve funcionar; o login por Google/Apple/Facebook abre janelas extras que o app bloqueia e pode não funcionar.
- **Anúncios:** popups e redirecionamentos das páginas de live são bloqueados (não abrem mais abas no seu navegador), e alguns domínios de rastreamento são cancelados. Os anúncios em vídeo da própria Twitch não são bloqueados.

## Segurança e privacidade

Comportamentos confirmados no código:

- Cada sessão usa uma partição própria do navegador interno, salva no seu computador, então cookies e login não se misturam.
- O app só carrega o site do jogo e as páginas de lives (Twitch e Kick). Links para outros endereços abrem no navegador padrão.
- Sem telemetria e sem verificação automática de atualização: o app não envia seus dados a terceiros.
- Câmera, microfone, localização e notificações são negados.
- Fechar uma sessão **não apaga** os dados dela. Para apagar, use **Resetar dados da sessão**.
- O código é público, mas isso não é garantia de segurança: confira você mesmo se quiser.

**Posso ser banido?** Use de acordo com os [termos do PokeIdle](https://pokeidle.io/terms). O app não burla regras do jogo, mas a responsabilidade pelo uso é sua, e quem publica o projeto não responde por penalidades aplicadas pelo jogo.

**Pesa muito?** Cada sessão e cada live é uma "aba" do navegador interno, então a memória sobe com a quantidade. Se o PC sofrer, use 2 sessões e feche a janela de Lives quando não precisar.

**Isso é pago?** Não. O projeto é gratuito e de código aberto. Ele abre o jogo com o **código de indicação do autor** (visível em ☰ → **Ajuda → Sobre**), e é assim que o autor pode receber diamantes no jogo.

## Ajude o projeto

Se você ainda não tem conta no PokeIdle e quer ajudar o autor, crie a sua pelo link de indicação: **[pokeidle.io/?ref=656DPSE](https://pokeidle.io/?ref=656DPSE)**. É opcional, não muda nada para você, e o autor recebe diamantes no jogo. O app já abre o jogo com esse código.

## Solução de problemas

- **Uma sessão ficou em branco ou travada:** botão ↻, `F5` ou, se precisar, `Ctrl+F5` (ignora o cache).
- **Pede login de novo:** use **Resetar dados da sessão** só se estiver com problema, porque isso apaga o login.
- **As Lives não aparecem:** espere alguns segundos depois de abrir as sessões e confirme que está logado no jogo.
- **A Twitch diz que o navegador não é suportado:** abra a janela de Lives de novo e use login por e-mail e senha. Se persistir, abra uma issue com a mensagem exata.
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

Sem Node na sua máquina: suba o projeto no GitHub e rode **Actions → Build e Release**, ou crie uma tag. **A tag deve ser igual à `version` do `package.json`** (por exemplo, versão `1.1.0` → tag `v1.1.0`), porque o nome do instalador vem do `package.json`.

- Link de indicação: constante `GAME_URL` em `src/config.js`. Troque pelo seu se fizer uma versão própria.
- Domínios permitidos para navegação: `GAME_HOSTS` e `LIVE_HOSTS` em `src/config.js`.
- Textos da interface: `src/i18n.js` (português e inglês) e `ui/help.*.html`.
- Atalhos: todos em `src/shortcuts.js`. Para trocar uma tecla, edite só esse arquivo.
- Domínios de rastreamento bloqueados nas Lives: `LIVE_BLOCKED_HOSTS` em `src/config.js`.

## Licença
[MIT](LICENSE)
