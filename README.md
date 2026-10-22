# PokeMulti

**Português** · [English](README.en.md)

Jogue **várias contas do [PokeIdle](https://pokeidle.io) ao mesmo tempo, numa única janela**. Cada conta tem seu próprio login e seus próprios dados, sem misturar nada.

> Projeto de fã, **não oficial**. Sem afiliação com o PokeIdle, Nintendo, Game Freak, Creatures ou The Pokémon Company.

<!-- Coloque aqui as capturas de tela: ![Grade de contas](docs/grade.png) ![Lives](docs/lives.png) -->

## Como instalar (Windows 10/11)

1. Abra a página de **[Releases](../../releases/latest)** deste projeto.
2. Em **Assets**, clique em **`PokeMulti-Setup-….exe`** para baixar.
3. Dê dois cliques no arquivo baixado.
4. Se aparecer **"O Windows protegeu seu PC"**: clique em **Mais informações** e depois em **Executar assim mesmo**. Isso acontece porque o programa não tem assinatura digital (ela é paga), e não porque ele seja perigoso. O código completo está público aqui para qualquer pessoa conferir.
5. Siga o assistente (Avançar → Instalar). Ele cria um atalho na área de trabalho.

Não precisa instalar mais nada.

## Primeiro uso

1. Abra o **PokeMulti** pelo atalho. Ele abre com **2 contas** lado a lado.
2. **Faça login em cada quadrante** uma vez. O login fica salvo, e nas próximas vezes você já entra direto.
3. Aperte **F1** a qualquer momento para ver todos os atalhos.

### O que dá para fazer

| Quero... | Como |
|---|---|
| Ver uma conta em tela cheia | `Ctrl+1` a `Ctrl+4` (de novo volta à grade) |
| Voltar para a grade | `Ctrl+0` ou botão **Grade** |
| Usar 2 ou 4 contas | `Ctrl+Shift+0` ou botão **Contas** |
| Abrir uma conta em janela própria | `Ctrl+Alt+1` a `Ctrl+Alt+4` ou botões ⧉ |
| Abrir as lives que dão bônus | `Ctrl+T` ou botão **Lives** |
| Recarregar a conta atual | `F5` |
| Tela cheia | `F11` |
| Silenciar uma conta | Botão 🔊 / 🔇 do bloco da conta, na barra superior |
| Dar zoom numa conta (50% a 200%) | Botões − e + do bloco da conta (clique no valor para voltar a 100%) |
| Dar um nome a uma conta | Clique no nome dela na barra superior |

### Sobre as Lives
O botão **Lives** abre uma janela com as transmissões que dão bônus de XP, cada uma numa aba **sem som**. Na primeira vez, faça login na Twitch (e na Kick, se usar) dentro dessa janela, com a mesma conta vinculada ao jogo. O login fica salvo.

## Perguntas rápidas

**É seguro?** O programa só abre o site oficial do jogo. Não coleta dados, não tem telemetria e não envia nada para terceiros. Cada conta fica isolada das outras.

**Posso ser banido?** Use de acordo com os [termos do PokeIdle](https://pokeidle.io/terms). O app não burla nenhuma regra do jogo, mas a responsabilidade pelo uso é sua. Quem publica o projeto não se responsabiliza por penalidades aplicadas pelo jogo.

**Pesa muito?** Cada conta e cada live é uma "aba" do navegador interno, então a memória sobe com a quantidade. Se o PC sofrer, use 2 contas e feche a janela de Lives quando não precisar.

**Isso é pago?** Não. O projeto é gratuito e de código aberto. Ele abre o jogo com o código de indicação do autor, e é assim que o autor pode receber diamantes no jogo.

## Para quem quer conferir o arquivo (opcional)

Cada versão traz um `SHA256SUMS.txt`. No PowerShell, na pasta do download:

```
Get-FileHash .\PokeMulti-Setup-<versão>.exe -Algorithm SHA256
```

O resultado deve ser igual ao do arquivo.

---

## Para desenvolvedores

Requer Node.js 22.12 ou mais novo.

```
npm install
npm start          # roda direto do código
npm test           # sintaxe + testes
npm run dist       # gera dist/PokeMulti-Setup-<versão>.exe
```

Sem Node na sua máquina: suba o projeto no GitHub e rode **Actions → Build e Release**, ou crie uma tag `v*` (`git tag v1.0.1 && git push origin v1.0.1`). O instalador e o `SHA256SUMS.txt` são publicados em Releases.

- Link de indicação: constante `GAME_URL` em `src/config.js`. Troque pelo seu se fizer uma versão própria.
- Domínios permitidos para navegação: `GAME_HOSTS` e `LIVE_HOSTS` em `src/config.js`.
- Limite de lives da Twitch (para gastar menos memória): `{ "maxTwitch": 4 }` em `config.json`, na pasta de dados do app (`%APPDATA%\pokemulti-local`).

### Segurança
- Sandbox e `contextIsolation` em todas as views; nenhuma com `nodeIntegration`.
- Permissões (câmera, microfone, localização, notificações) negadas.
- Navegação restrita a uma lista de domínios; o resto abre no navegador padrão.
- Dados vindos da página do jogo são validados (`src/lives-parse.js`, com testes).
- Sem extensões locais, sem verificação de atualização, sem telemetria.
- Fuses do Electron e criptografia de cookies no disco no build.

### Créditos
A ideia e o formato das mensagens de live do jogo foram observados no projeto MIT
[robertcristianoo/multi-pokeidle-io](https://github.com/robertcristianoo/multi-pokeidle-io). O código aqui é uma reescrita.

## Licença
MIT
