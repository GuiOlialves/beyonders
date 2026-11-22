# Arquivo Beyonder — Lord of the Mysteries RPG (v0.1)

Sistema independente de RPG de mesa inspirado no universo de *Lord of the Mysteries* (de Cuttlefish That Loves Diving), acompanhado de **dois aplicativos offline (PWA + Android)** — um para **Jogadores** e outro para o **Mestre** —, além do **Livro de Regras v0.1** completo e do cofre de campanha no **Obsidian**.

> **Recorte do cenário:** Quinta Época, 1352 (imediatamente após os acontecimentos centrais do primeiro livro). Jogo focado em **investigação, sobrevivência, horror sobrenatural e poder** nas **Sequências 9, 8 e 7**.

---

## 1. Aplicativo do Jogador (`app-jogadores/`)

Aplicação web/PWA (também empacotada como APK Android em `br.com.arquivobeyonder.ficha`) feita para acompanhar toda a ficha do personagem na mesa — **100% offline**, com salvamento automático no dispositivo (`localStorage`) e exportação/importação de backup em JSON.

### Principais recursos
- **Três barras interativas com cálculos automáticos:**
  - **Vida** (`10 + 4 × VIT + 2 × Grau`)
  - **Sanidade** (máximo fixo `100`, com verificação automática de gatilhos de **Crise** e **Perda de Controle**)
  - **Espiritualidade** (`10 + 3 × VON + 2 × INT + 5 × Grau`), com cálculo automático do **Limiar de Fadiga** (`teto(Esp. máx. ÷ 3)`), aplicação de **Fadiga I–III** e suporte à **Sobrecarga de emergência** (1× por cena).
- **Valores derivados em tempo real:** Defesa Física (`DF`), Defesa Mental (`DM`), Resistência Mental (`RM`), bônus de Iniciativa, Redução Física por armadura equipada e controle de carga.
- **Cinco abas organizadas:**
  1. **Ficha:** Identidade, Caminho e Sequência (9 a 7), atributos (`VIT`, `FOR`, `INT`, `VON`), as 16 perícias (com teto automático por Sequência), trilha de **Digestão (0/8)**, **Avanço de Sequência**, Corrupção (0–6), Falhas de morte (0–2), condições, ferimentos graves, Âncoras pessoais e ajustes manuais.
  2. **Habilidades:** Cadastro de capacidades do Caminho, técnicas espirituais comuns, habilidades Beyonder preparadas e técnicas próprias, com botão de ativação que já debita Espiritualidade e calcula Fadiga.
  3. **Inventário:** Armas, armaduras (redução de dano), munição/recarga, dinheiro em moeda de Loen (`£ / s / d`), cálculo de espaços de carga e registro de itens sobrenaturais (incluindo efeito negativo e protocolo de contenção).
  4. **Diário:** Princípios de interpretação (Acting Method), pistas confirmadas, hipóteses, contatos, traumas, relógio de investigação e histórico automático de rolagens/alterações.
  5. **Dados:** Rolador de `2d6` (normal, vantagem `3d6` mantendo os 2 maiores, desvantagem `3d6` mantendo os 2 menores), classificação automática de ataques (erro, acerto comum, acerto superior, acerto crítico e falha crítica) e rolador de dano.
- **Extras:** Personagem de exemplo pré-carregada (*Helena Ward — Vidente*), impressão limpa da ficha, download integrado de `regras-essenciais.pdf` e suporte nativo Android via bridge `BeyonderAndroid`.

---

## 2. Aplicativo do Mestre (`app-mestre/`)

Aplicação web/PWA (empacotada como APK Android em `br.com.arquivobeyonder.mestre`) projetada como **painel de comando offline para conduzir sessões** sem depender de internet ou sincronização externa.

### Principais recursos
- **Gestão de Sessões e Histórico (`Undo`):** Alternância entre múltiplas sessões, criação de novas sessões, botão de **Desfazer** para a última alteração e exportação/importação de backup completo em JSON.
- **Fichas de NPCs, Ameaças e Jogadores:** Criação e edição de personagens/inimigos (modo simples ou completo), importação de fichas de jogadores, controle rápido de Vida, Sanidade, Espiritualidade, Corrupção e Condições.
- **Rastreador de Combate e Iniciativa:** Montagem de encontros, rolagem de iniciativa (`2d6 + INT + Prontidão`), controle de turnos, ataques com classificação automática de acerto/margem/crítico, aplicação de dano, recarga e testes de sobrevivência/crise mental.
- **Investigação, Pistas e Relógios:** Painel de cenas, matriz de pistas (evitando travar a investigação em um único teste), **Relógios de Ameaça de 6 segmentos** e ferramenta de **Teste Rápido** sempre acessível no cabeçalho.
- **Mapas Interativos e Biblioteca Integrada:**
  - Plantas vetoriais do *Instituto Vauquelin* em versão limpa para jogadores ([`planta-jogadores.svg`](./app-mestre/maps/planta-jogadores.svg)) e anotada para o mestre ([`planta-mestre.svg`](./app-mestre/maps/planta-mestre.svg)).
  - **Dossiê completo da Sessão 1 (*"A resposta que não é sua"*)** pré-carregado via [`seed.js`](./app-mestre/seed.js): 11 entidades, 8 cenas, 46 notas de biblioteca e 3 fluxogramas em SVG.
  - Downloads embutidos: guia do mestre em PDF, handouts dos jogadores em PDF, regras essenciais e o cofre zipado do Obsidian.

---

## 3. Livro de Regras v0.1 (`regras-livro/`)

Adaptação completa de 22 capítulos ([`livro-de-regras-v0.1.md`](./regras-livro/livro-de-regras-v0.1.md)) acompanhada da ficha editável em Markdown ([`ficha-editavel-v0.1.md`](./regras-livro/ficha-editavel-v0.1.md)) e dos PDFs de apoio.

### Pilares do Sistema
- **Resolução de Testes:** `2d6 + Atributo + Perícia + modificadores` contra dificuldades fixas (**7** Rotineira sob pressão, **9** Desafiadora, **12** Difícil, **16** Extraordinária). Vantagem/Desvantagem usam `3d6` (2 maiores ou 2 menores).
- **4 Atributos e 16 Perícias:** `VIT` (Vitalidade), `FOR` (Força), `INT` (Intelecto) e `VON` (Vontade), com escala de `0` a `5`.
- **Combate Letal e Tático:** Defesa Física (`DF = 7 + FOR + Luta`) e Defesa Mental (`DM = 7 + VON + Autocontrole`) fixas; 1 ação, 8 m de movimento e 1 reação por rodada; **Acerto Superior** (margem 5–7, `+2` dano), **Acerto Crítico** (dois `6` com acerto ou margem `8+`, `+1` dado básico de dano) e **Falha Crítica** (dois `1`, erro automático + condição *Exposto*). Ferimentos Graves ao sofrer metade da Vida máxima em um único impacto.
- **Espiritualidade, Sanidade e Corrupção:** Gastos concentrados (`>= 1/3` da Espiritualidade máxima) geram **Fadiga**; exposições ao oculto causam dano de Sanidade (reduzido por `RM`), **Crises** e marcas de **Corrupção (0–6)**, com janela de **3 rodadas de intervenção** antes da perda de controle definitiva.
- **6 Caminhos Jogáveis (Sequências 9, 8 e 7):**
  | Caminho | Sequência 9 | Sequência 8 | Sequência 7 | Foco |
  | :--- | :--- | :--- | :--- | :--- |
  | **Vidente** | Vidente (*Seer*) | Palhaço (*Clown*) | Mágico (*Magician*) | Adivinhação, preparação e versatilidade |
  | **Espectador** | Espectador (*Spectator*) | Telepata (*Telepathist*) | Psiquiatra (*Psychiatrist*) | Leitura social e intervenção mental |
  | **Insone** | Insone (*Sleepless*) | Poeta da Meia-Noite (*Midnight Poet*) | Pesadelo (*Nightmare*) | Vigilância, voz e sonhos |
  | **Caçador** | Caçador (*Hunter*) | Provocador (*Provoker*) | Piromaníaco (*Pyromaniac*) | Rastreamento, emboscadas e fogo |
  | **Guerreiro** | Guerreiro (*Warrior*) | Pugilista (*Pugilist*) | Mestre de Armas (*Weapon Master*) | Potência física e domínio de armas |
  | **Saqueador** | Saqueador (*Marauder*) | Trapaceiro (*Swindler*) | Criptólogo (*Cryptologist*) | Furto, fraude e decifração |
- **Progressão e Cenário:** Trilha de **Digestão (0/8)** inspirada no *Acting Method*, requisitos de avanço seguro vs. imprudente, catálogo de armas, itens sobrenaturais, classificação de **Artefatos Selados (Graus de Perigo 3 a 0)**, facções, igrejas, Clube de Tarô e panorama das divindades em 1352.

---

## 4. Estrutura do Repositório

```text
beyonders/
├── app-jogadores/        # PWA/Web App de fichas dos jogadores
├── app-mestre/           # PWA/Web App da mesa do mestre (com seed da Sessão 1)
├── regras-livro/         # Livro de Regras v0.1 (.md), ficha editável (.md) e PDFs
├── obsidian-sessao-1/    # Cofre completo do Obsidian da Sessão 1 + Canvas + SVGs
└── android/              # Wrappers Android (MainActivity.java, Manifests, APKs e repack-apk.ps1)
```

---

## 5. Como Rodar Localmente

Como os dois aplicativos usam **ES Modules** (`<script type="module">`), sirva a pasta desejada com qualquer servidor HTTP local:

### App do Jogador
```powershell
npx --yes serve ./app-jogadores -l 3000
```

### App do Mestre
```powershell
npx --yes serve ./app-mestre -l 3001
```

### Atualizar os APKs Android após editar os arquivos web
```powershell
.\android\repack-apk.ps1
```
O script atualiza `assets/www/` nos APKs base em `android/apks/` e gera os arquivos `*-unsigned.apk` prontos para assinatura com `apksigner`.
