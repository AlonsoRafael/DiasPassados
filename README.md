# diaspassados — The Life Calendar Lockscreen Wallpaper

Aplicação web moderna, minimalista e de alta precisão inspirada no conceito do **The Life Calendar**. Permite gerar e automatizar papéis de parede personalizados para a tela de bloqueio do celular, representando o progresso do tempo em bolinhas perfeitamente alinhadas (**Dias do Ano Atual** ou **Dias do Mês**).

---

## 📱 Recursos Principais

1. **Modos de Visualização & Metas**:
   - **Dias do Ano Atual**: 365 ou 366 dias dispostos em matriz padronizada de 15 colunas de círculos perfeitos com o indicador sutil e minimalista `57d left · 84%`.
   - **Dias do Mês**: dias do mês corrente (28 a 31 dias) dispostos em grade harmônica de 7 colunas (dias da semana), com círculos perfeitos e contador de dias restantes.
   - **Calendário de Metas (Desafios & Hábitos)**: acompanhamento de metas com duração customizável (30, 60, 75, 90, 100 dias ou valor livre), com data de início e contagem de progresso diário.

2. **Texto Personalizado Acima das Bolinhas (Top Text)**:
   - Permite escrever uma meta, frase de foco, lema ou ano (ex: `DISCIPLINA`, `75 HARD`, `PROJETO 2026`) que é renderizado de forma elegante e centralizado logo acima da matriz de bolinhas em qualquer modo.

3. **Seletor de Plataforma (iPhone iOS vs. Android)**:
   - Alterne instantaneamente entre **iPhone (iOS)** e **Android**.
   - O simulador de tela ajusta o recorte da câmera (Dynamic Island no iPhone e Punch-hole no Android) e a barra de navegação inferior.
   - Lista dinâmica de modelos e resoluções nativas para cada sistema:
     - **iPhone**: iPhone 18 Pro Max, iPhone 18 Pro, iPhone 15/14 Pro Max, iPhone 15/14 Pro, iPhone 14/13/12 Pro, iPhone XS/X, iPhone 13 mini.
     - **Android**: Samsung Galaxy S24 Ultra, Samsung Galaxy S24/S23, Google Pixel 8/9, Google Pixel 8 Pro/9 Pro XL, Xiaomi 14 Pro, Padrão Android FHD+.
     - **Personalizado**: qualquer proporção definida livremente via URL ou campos manuais.

3. **Centralização, Tamanho das Bolinhas e Posicionamento Flexível**:
   - Bolinhas com tamanho ampliado e espaçamento harmônico otimizado (gap ratio de 0.48), proporcionando presença visual marcante na tela de bloqueio.
   - Controle deslizante (**Tamanho das Bolinhas**) ajustável de 80% (compacto) até 125% (ampliado) com sincronização no link dinâmico (`?size=...`).
   - Posição vertical otimizada abaixo do relógio e widgets da tela de bloqueio com respiro de +9.5% por padrão.
   - Controle deslizante (**Posição Vertical na Tela**) de 0% (centro) até +18% (mais baixo) com atualização em tempo real e sincronização no link de automação (`?offset=...`).

4. **Automação Diária no Celular (iOS Shortcuts & Android)**:
   - Em vez de baixar imagens avulsas manualmente todos os dias, a aplicação gera um **Link Dinâmico de Imagem** que atualiza sozinho todo dia às 06:00.
   - **Modal de Instalação (Installation Steps)**:
     - **Passo 1: Definir Wallpaper** (Estilo do período, Plataforma e Modelo do Aparelho).
     - **Passo 2: Criar Automação**:
       - *No iPhone*: Instruções detalhadas para o app Atalhos (Shortcuts) rodar diariamente sem confirmação.
       - *No Android*: Instruções detalhadas para o app MacroDroid ou Tasker atualizar a tela de bloqueio automaticamente via requisição HTTP.
     - **Passo 3: Configurar Ação**: colar a URL gerada e aplicar na Tela de Bloqueio.
   - Endpoint Serverless em `/api/wallpaper` (e rotas `/days` e `/month`) que gera imagens PNG dinâmicas sob demanda com zero dependências externas obrigatórias.

5. **Parâmetros de URL (Query String)**:
   - `?platform=ios` ou `?platform=android`
   - `?view=year` ou `?view=month` ou `?view=goals`
   - `?width=1170&height=2532` (ou `?w=1170&h=2532`)
   - `?bg=%230e0e0e&past=%23a1a1aa&current=%23c85a38&future=%232c2c30` (cores hexadecimais foscas)
   - `?offset=9.5` (posição vertical na tela)
   - `?size=100` (tamanho das bolinhas em porcentagem)
   - Atualização automática da URL ao alterar qualquer configuração.

6. **Design & Estilo**:
   - Paleta padrão Sunset Coral (inspirada no visual minimalista com bolinhas brancas, destaque laranja e bolinhas futuras discretas).
   - Paletas adicionais prontas: Obsidian Minimal, Esmeralda, Âmbar, Violeta e Monocromático Puro.
   - Modo escuro (*Dark Mode*) nativo em tons de zinco e preto profundo.
   - Tailwind CSS com tipografia Inter e JetBrains Mono.

---

## 📁 Estrutura Modular do Projeto

```
DiasPassados/
├── api/
│   └── wallpaper.js       # Função Serverless Vercel (geração dinâmica de PNG/SVG)
├── css/
│   └── style.css          # Estilos customizados (scrollbars, sliders e mockups)
├── js/
│   ├── presets.js         # Paletas de cores, meses e resoluções de aparelhos
│   ├── calculator.js      # Motor matemático de cálculo de dias, períodos e metas
│   ├── renderer.js        # Motor de renderização e download de canvas de alta resolução
│   └── app.js             # Controlador da aplicação, eventos e simulador
├── index.html             # Interface limpa e semântica
├── vercel.json            # Configuração de rewrites e URLs limpas da Vercel
├── package.json           # Dependências do projeto (@resvg/resvg-js, serve)
└── .gitignore             # Arquivos e pastas ignoradas pelo Git
```

---

## 🚀 Como Executar Localmente

### Opção 1: Abrir diretamente no navegador
Basta abrir o arquivo [`index.html`](file:///c:/Users/rafaa/OneDrive/Documentos/GitHub/DiasPassados/index.html) em qualquer navegador moderno.

### Opção 2: Servidor local simples
```bash
# Com npx serve
npx serve .

# Ou com Node
node -e "require('http').createServer((req, res) => require('fs').createReadStream('index.html').pipe(res)).listen(3000)"
```

---

## ☁️ Como Subir no Vercel

1. Faça push do repositório para o GitHub:
   ```bash
   git add .
   git commit -m "feat: suporte a dias do ano, dias do mes e selecao iphone/android"
   git remote add origin https://github.com/AlonsoRafael/DiasPassados.git
   git branch -M main
   git push -u origin main
   ```
2. Acesse o [Vercel](https://vercel.com) e importe o repositório `DiasPassados`.
3. O Vercel detectará automaticamente a configuração estática com o [`vercel.json`](file:///c:/Users/rafaa/OneDrive/Documentos/GitHub/DiasPassados/vercel.json) e publicará imediatamente.


