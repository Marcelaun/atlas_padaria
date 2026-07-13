# 🍞 Atlas PDV - Versão Padaria Profissional

O **Atlas PDV** é um sistema de Frente de Caixa (PDV) de alto desempenho, desenvolvido em Electron e React, customizado especificamente para as demandas complexas de uma padaria moderna. O sistema une a agilidade da venda rápida com o controle rigoroso de produção (fornada), gestão de quilo/unidade e contratos de mensalistas.

---

## 🚀 Funcionalidades Principais

### 🛒 1. Frente de Caixa (PDV)
*   **Venda Híbrida (Peso/Unidade):** Suporte nativo a produtos vendidos por Quilo (KG) ou Unidade (UN). Ao biper um produto por peso, o sistema solicita automaticamente o valor exato.
*   **Identificação de Cliente:** Seleção rápida de clientes da base CRM para fidelização e histórico de compras.
*   **Atalhos de Teclado:** Operação otimizada para agilidade (F10 para fechar venda, ESC para cancelar).
*   **Múltiplos Métodos de Pagamento:** Dinheiro, Pix, Crédito e Débito integrados ao financeiro.

### 🥐 2. Módulo de Produção (Fornada)
*   **Transformação de Estoque:** Função exclusiva para converter produtos de estoque "Origem" (ex: Pão de Queijo Congelado em KG) para "Destino" (ex: Pão de Queijo Assado em UN).
*   **Baixa Automática:** O sistema calcula a saída do quilo e a entrada das unidades assadas em um único clique, mantendo o estoque real sempre atualizado.

### 📝 3. Comandas e Mesas (Consumo Local)
*   **Gestão de Fichas:** Abertura de comandas numeradas para clientes que consomem no local.
*   **Lançamento Incremental:** Permite adicionar itens à comanda ao longo do tempo (cafés, sanduíches, salgados).
*   **Fechamento Centralizado:** No final do consumo, o sistema consolida todos os lançamentos e gera a venda total no PDV.

### 🎂 4. Encomendas de Bolos e Festas
*   **Agendamento:** Gestão de pedidos com data e hora de entrega/retirada.
*   **Controle de Sinal:** Registro de pagamentos antecipados (sinal) e cálculo automático do saldo devedor na entrega.
*   **Status de Produção:** Acompanhamento do ciclo de vida: Pendente -> Em Produção -> Entregue -> Pago.

### 🤝 5. Contratos (Mensalistas)
*   **Fidelização Corporativa:** Gestão de clientes mensalistas (empresas ou vizinhos) que pagam um valor fixo por mês.
*   **Cobrança Automática:** Botão para gerar automaticamente a entrada no financeiro no dia do vencimento do contrato.

### 📉 6. Gestão de Estoque e Receitas
*   **Ficha Técnica (Ingredientes):** Vincule matérias-primas (farinha, ovos, leite) aos produtos finais. O sistema calcula o custo real do produto com base nos insumos.
*   **Alerta de Estoque Baixo:** Badges visuais indicam quando um produto ou ingrediente está atingindo níveis críticos.

### 👥 7. CRM e Relatórios (BI)
*   **Ranking de Clientes:** Identificação automática dos melhores clientes por volume de gasto.
*   **Filtro de Inatividade:** Saiba quais clientes não aparecem na padaria há mais de 30, 60 ou 90 dias.
*   **Aniversariantes:** Alertas de aniversários para ações de marketing.
*   **Relatórios Financeiros:** Fluxo de caixa detalhado (Entradas vs Saídas) com saldo real e pendentes.

---

## 🛠️ Tecnologias Utilizadas

*   **Runtime:** [Electron](https://www.electronjs.org/) (Aplicação Desktop Nativa)
*   **Frontend:** [React.js](https://reactjs.org/) com Vite
*   **Banco de Dados:** [SQLite](https://www.sqlite.org/) (Local e Rápido)
*   **ORM:** [Prisma](https://www.prisma.io/) (Modelagem de dados robusta)
*   **Segurança:** Sistema de Licenciamento vinculado ao Hardware ID da máquina.

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
*   Node.js (v18 ou superior)
*   NPM ou Yarn

### Instalação
1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Sincronize o banco de dados:
   ```bash
   npx prisma db push
   ```
4. Inicie em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

### Produção (Build)
Para gerar o instalador (.exe) para Windows:
```bash
npm run build:win
```

---

## 🛡️ Sistema de Licença
O Atlas PDV possui um sistema de proteção por hardware. Na primeira execução, o sistema gerará um **Código de Máquina Único**. Este código deve ser enviado ao administrador para a geração da **Chave de Ativação** correspondente.

---

## 📁 Backup e Segurança
O sistema salva o banco de dados na pasta `%AppData%/AtlasPDV_Pro`. 
*   **Backup:** Disponível no menu "Configurações", permitindo exportar todos os dados em formato `.db` ou `.json` (legível).

---
*Desenvolvido para transformar a gestão de panificadoras com tecnologia de ponta.*
