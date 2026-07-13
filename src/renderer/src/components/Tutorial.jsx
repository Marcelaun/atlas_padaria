import React from 'react'

function Tutorial() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--accent)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Tutorial do Sistema
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Guia rápido de como utilizar as principais funções do Atlas PDV.</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <span className="card-title">1. Frente de Caixa (PDV)</span>
        </div>
        <div style={{ padding: '24px', lineHeight: '1.6', color: 'var(--text)' }}>
          <p>O <strong>PDV</strong> é onde você registra as vendas. Antes de vender, é necessário <strong>Abrir o Caixa</strong> informando o troco inicial.</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '8px' }}><strong>Buscar Produto:</strong> Digite o nome ou passe o leitor de código de barras.</li>
            <li style={{ marginBottom: '8px' }}><strong>Itens por Quilo (KG):</strong> Ao bipar um produto que seja vendido por KG, o sistema pedirá o peso exato.</li>
            <li style={{ marginBottom: '8px' }}><strong>Adicionais:</strong> Clique no botão "+ Adicional" no item do carrinho para incluir extras (ex: bacon, ovo, queijo).</li>
            <li><strong>Fechar Venda:</strong> Aperte <code>F10</code> ou clique em "FECHAR VENDA" para escolher a forma de pagamento (Dinheiro, Cartão, PIX, Caderneta).</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <span className="card-title">2. Produtos e Ingredientes</span>
        </div>
        <div style={{ padding: '24px', lineHeight: '1.6', color: 'var(--text)' }}>
          <p>O sistema divide o estoque para facilitar o cálculo do lucro:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '8px' }}><strong>Ingredientes / Receitas:</strong> Aquilo que você usa para produzir. Ex: Farinha, Ovos, Embalagens.</li>
            <li><strong>Estoque Produtos:</strong> O que você vende no balcão no PDV. Ex: Pão Francês, Bolo, Coca-Cola. Ao cadastrar um produto, você pode vincular os ingredientes que ele gasta para calcular o custo.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <span className="card-title">3. Fornadas (Produção)</span>
        </div>
        <div style={{ padding: '24px', lineHeight: '1.6', color: 'var(--text)' }}>
          <p>Se você tem um produto que vem congelado (KG) e vira assado (UN), use a função de <strong>Fornada</strong> (no PDV).</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', color: 'var(--text-muted)' }}>
            <li>Isso vai descontar a massa congelada do seu estoque e dar entrada automaticamente nos pães assados prontos para venda, evitando perdas.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <span className="card-title">4. Backup e Segurança</span>
        </div>
        <div style={{ padding: '24px', lineHeight: '1.6', color: 'var(--text)' }}>
          <p>Seus dados são preciosos! Na aba <strong>Configurações</strong> você pode gerenciar os dados do sistema:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px', color: 'var(--text-muted)' }}>
            <li style={{ marginBottom: '8px' }}>Fazer o download de uma <strong>Cópia Local</strong> (ideal para salvar num Pen Drive ao fim do expediente).</li>
            <li>Enviar um backup forçado para a <strong>Nuvem (Backblaze)</strong>. Lembrando que o sistema também faz isso automaticamente às 20h00.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Tutorial
