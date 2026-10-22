# PokeMulti (local)

Várias contas do PokeIdle em uma janela, cada uma com sessão isolada (`persist:conta1..4`).
Abre o jogo pelo seu link de indicação (constante `GAME_URL` em `src/config.js`).

## Para quem só quer usar
Baixe `PokeMulti-Setup-<versão>.exe` na página de Releases e instale. Não precisa de Node nem npm.
Confira o hash com `SHA256SUMS.txt` (PowerShell: `Get-FileHash <arquivo> -Algorithm SHA256`).
O instalador não é assinado: o SmartScreen avisa na 1ª vez ("Mais informações" > "Executar assim mesmo").

## Rodar a partir do código
```
npm install
npm start
```

## Gerar o instalador (Windows)
Duplo clique em `Construir-Instalador.bat` (precisa do Node LTS instalado uma vez), ou sem Node na sua máquina: suba o projeto no GitHub e rode o workflow **Build e Release**.
Manualmente:
```
npm run dist        # gera dist/PokeMulti-Setup-<versão>.exe (NSIS, instala só para o seu usuário)
```
Rode no Windows. Ou use o workflow `.github/workflows/build.yml` (Actions → Build instalador).
Antes de publicar: troque `appId` em `package.json` e confira em `electronFuses` se a sua versão do electron-builder aceita as chaves.

## Atalhos
Veja `ui/help.html` (F1 no app). Ctrl+Alt+1…4 abre a conta numa janela própria; Ctrl+T abre as Lives silenciadas.

## Segurança (resumo)
- sandbox + contextIsolation em todas as views; nenhuma tem nodeIntegration.
- Permissões (câmera, microfone, localização, notificações) negadas em todas as sessões.
- Navegação restrita a uma lista de domínios; o resto abre no navegador padrão.
- Dados vindos da página do jogo são validados (`src/lives-parse.js`, com testes).
- Sem extensões `local.js`, sem checagem de atualização, sem telemetria; IPC com checagem de origem e lista fechada de ações.
- Fuses do Electron e criptografia de cookies no disco habilitados no build.

Crédito: a ideia e o formato das mensagens de live do jogo foram observados no projeto MIT
robertcristianoo/multi-pokeidle-io; o código aqui é uma reescrita.

## Memória
Cada conta e cada live é um processo do Chromium. O que mais pesa são os players de vídeo das Lives.
Para limitar, crie/edite `config.json` na pasta de dados do app (`%APPDATA%\pokemulti-local`) com `{ "maxTwitch": 4 }`.
Fechar a janela de Lives libera a memória das lives na hora.

## Transparência
Este app abre o jogo com o código de indicação do autor (`GAME_URL` em `src/config.js`). Troque por o seu se publicar uma versão sua.
Projeto de fã, não oficial; sem afiliação com o PokeIdle ou com a The Pokémon Company.
