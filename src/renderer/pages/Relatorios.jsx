import { useState, useEffect } from 'react'

// Formatador de moeda
const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Relatorios({ Icon }) {
  const [lancamentos, setLancamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroPeriodo, setFiltroPeriodo] = useState('TUDO')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    const carregar = async () => {
      const res = await window.api.listarLancamentos()
      if (res.sucesso) setLancamentos(res.lancamentos)
      setLoading(false)
    }
    carregar()
  }, [])

  const obterDadosFiltrados = () => {
    const hoje = new Date()
    return lancamentos.filter((l) => {
      if (filtroPeriodo === 'TUDO') return true
      const dataLancamento = new Date(l.criadoEm)

      if (filtroPeriodo === 'HOJE') return dataLancamento.toDateString() === hoje.toDateString()

      if (filtroPeriodo === '7DIAS' || filtroPeriodo === '30DIAS') {
        const diffTempo = Math.abs(hoje - dataLancamento)
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24))
        if (filtroPeriodo === '7DIAS') return diffDias <= 7
        if (filtroPeriodo === '30DIAS') return diffDias <= 30
      }

      if (filtroPeriodo === 'CUSTOM') {
        if (!dataInicio || !dataFim) return true
        const dInicio = new Date(dataInicio + 'T00:00:00')
        const dFim = new Date(dataFim + 'T23:59:59')
        return dataLancamento >= dInicio && dataLancamento <= dFim
      }

      return true
    })
  }

  const dadosFiltrados = obterDadosFiltrados()

  const obterPeriodoTexto = () => {
    if (filtroPeriodo === 'HOJE') return 'Hoje'
    if (filtroPeriodo === '7DIAS') return 'Últimos 7 Dias'
    if (filtroPeriodo === '30DIAS') return 'Últimos 30 Dias'
    if (filtroPeriodo === 'CUSTOM') {
      if (dataInicio && dataFim) {
        return `${new Date(dataInicio + 'T12:00:00').toLocaleDateString('pt-BR')} até ${new Date(dataFim + 'T12:00:00').toLocaleDateString('pt-BR')}`
      }
      return 'Período Personalizado'
    }
    return 'Todo o Período'
  }

  // ─── CÁLCULOS DE BUSINESS INTELLIGENCE (BI) ─────────────
  const concluidos = dadosFiltrados.filter((l) => l.pago)
  const faturamento = concluidos
    .filter((l) => l.tipo === 'ENTRADA')
    .reduce((acc, l) => acc + l.valor, 0)
  const despesas = concluidos.filter((l) => l.tipo === 'SAIDA').reduce((acc, l) => acc + l.valor, 0)
  const lucroLiquido = faturamento - despesas
  const prejuizo = lucroLiquido < 0
  const margemLucro = faturamento > 0 ? (lucroLiquido / faturamento) * 100 : 0
  const qtdVendas = concluidos.filter((l) => l.tipo === 'ENTRADA').length
  const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0

  const maxBarra = Math.max(faturamento, despesas) || 1
  const pctFaturamento = (faturamento / maxBarra) * 100
  const pctDespesas = (despesas / maxBarra) * 100

  // ─── PLANILHAS (CSV) ────────────────────────────────────
  const exportarPlanilhaSimples = () => {
    if (dadosFiltrados.length === 0) return alert('Não há dados neste período!')
    let csv = '\uFEFFTIPO;DESCRICAO;VALOR;STATUS;DATA\n'
    dadosFiltrados.forEach((l) => {
      const data = new Date(l.criadoEm).toLocaleDateString('pt-BR')
      const status = l.pago ? 'PAGO' : 'PENDENTE'
      const valorFmt = l.valor.toFixed(2).replace('.', ',')
      csv += `${l.tipo};"${l.descricao}";${valorFmt};${status};${data}\n`
    })
    baixarArquivo(csv, `Dados_Atlas_${filtroPeriodo}.csv`)
  }

  const exportarPlanilhaDetalhada = () => {
    if (dadosFiltrados.length === 0) return alert('Não há dados neste período!')
    let csv = '\uFEFFATLAS PDV - RELATÓRIO FINANCEIRO\n'
    csv += `Período Analisado:;${obterPeriodoTexto()}\n`
    csv += `Data da Exportação:;${new Date().toLocaleDateString('pt-BR')}\n\n`
    csv += `--- RESUMO DO PERÍODO ---\n`
    csv += `Faturamento Bruto:;${faturamento.toFixed(2).replace('.', ',')}\n`
    csv += `Despesas / Custos:;${despesas.toFixed(2).replace('.', ',')}\n`
    csv += `Resultado Líquido:;${lucroLiquido.toFixed(2).replace('.', ',')}\n`
    csv += `Margem de Lucro:;${margemLucro.toFixed(1).replace('.', ',')}%\n\n`
    csv += `--- DETALHAMENTO DE LANÇAMENTOS ---\n`
    csv += 'TIPO;DESCRICAO;VALOR;STATUS;DATA\n'
    dadosFiltrados.forEach((l) => {
      const data = new Date(l.criadoEm).toLocaleDateString('pt-BR')
      const status = l.pago ? 'PAGO' : 'PENDENTE'
      const valorFmt = l.valor.toFixed(2).replace('.', ',')
      csv += `${l.tipo};"${l.descricao}";${valorFmt};${status};${data}\n`
    })
    baixarArquivo(csv, `Relatorio_Atlas_${filtroPeriodo}.csv`)
  }

  const baixarArquivo = (conteudo, nomeArquivo) => {
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', nomeArquivo)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── IMPRESSÃO / PDF (INTELIGENTE) ──────────────────────
  const gerarPDF = async (detalhado = false) => {
    if (dadosFiltrados.length === 0) return alert('Não há dados neste período para gerar o PDF!')

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    const periodoTexto = obterPeriodoTexto()

    // 👇 Se for detalhado, criamos a tabela de lançamentos HTML
    let tabelaHtml = ''
    if (detalhado) {
      tabelaHtml = `
        <h3 style="margin-top: 40px; text-transform: uppercase; font-size: 14px; color: #666; text-align: center; letter-spacing: 1px;">Auditoria de Lançamentos</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background: #f1f1f1; border-bottom: 2px solid #ddd;">
              <th style="padding: 10px;">Data</th>
              <th style="padding: 10px;">Tipo</th>
              <th style="padding: 10px;">Descrição</th>
              <th style="padding: 10px; text-align: center;">Status</th>
              <th style="padding: 10px; text-align: right;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${dadosFiltrados
              .map(
                (l) => `
              <tr style="border-bottom: 1px solid #eee; page-break-inside: avoid;">
                <td style="padding: 10px; color: #555;">${new Date(l.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td style="padding: 10px; font-weight: bold; color: ${l.tipo === 'ENTRADA' ? '#27ae60' : '#ff4d4d'};">${l.tipo === 'ENTRADA' ? '↑ Entrada' : '↓ Saída'}</td>
                <td style="padding: 10px;">${l.descricao}</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="background: ${l.pago ? '#e8f8f5' : '#fdf2e9'}; color: ${l.pago ? '#27ae60' : '#e67e22'}; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">
                    ${l.pago ? 'PAGO' : 'PENDENTE'}
                  </span>
                </td>
                <td style="padding: 10px; text-align: right; font-family: monospace; font-size: 14px;">${fmt(l.valor)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
    }

    // HTML Mestre
    const conteudoHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório Gerencial - ATLAS</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: 800; color: #111; letter-spacing: -1px; }
            .subtitle { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; }
            .period-badge { display: inline-block; background: #eee; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }

            .grid { display: flex; gap: 20px; margin-bottom: 30px; }
            .card { flex: 1; background: #f9f9f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #eee; }
            .card-title { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 10px; font-weight: bold;}
            .card-value { font-size: 24px; font-weight: bold; color: #111; }

            .dre-box { border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
            .dre-line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #eee; font-size: 15px; }
            .dre-total { display: flex; justify-content: space-between; padding-top: 15px; font-size: 20px; font-weight: bold; }

            .btn-imprimir { display: block; width: 100%; padding: 15px; background: #c8f135; color: #000; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 30px; transition: 0.2s; text-transform: uppercase;}
            .btn-imprimir:hover { background: #b5de2a; }

            @media print {
              .btn-imprimir { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-imprimir" onclick="window.print()">🖨️ Clique aqui para Imprimir ou Salvar PDF</button>

          <div class="header">
            <div class="title">ATLAS PDV</div>
            <div class="subtitle">Relatório ${detalhado ? 'Detalhado' : 'Gerencial'} - Gerado em ${dataAtual}</div>
            <div class="period-badge">Período Analisado: ${periodoTexto}</div>
          </div>

          <div class="grid">
            <div class="card"><div class="card-title">Faturamento Bruto</div><div class="card-value">${fmt(faturamento)}</div></div>
            <div class="card"><div class="card-title">Ticket Médio</div><div class="card-value">${fmt(ticketMedio)}</div></div>
            <div class="card"><div class="card-title">Margem Líquida</div><div class="card-value" style="color: ${prejuizo ? '#ff4d4d' : '#27ae60'};">${margemLucro.toFixed(1)}%</div></div>
          </div>

          <div class="dre-box">
            <h3 style="margin-top: 0; text-transform: uppercase; font-size: 14px; color: #666; text-align: center; letter-spacing: 1px;">Demonstração de Resultado (DRE)</h3>
            <div class="dre-line"><span>(+) Receita Operacional (Vendas)</span><span style="font-family: monospace;">${fmt(faturamento)}</span></div>
            <div class="dre-line"><span>(-) Despesas e Custos</span><span style="font-family: monospace; color: #ff4d4d;">${fmt(despesas)}</span></div>
            <div class="dre-total"><span>= Resultado Líquido</span><span style="font-family: monospace; color: ${prejuizo ? '#ff4d4d' : '#27ae60'};">${fmt(lucroLiquido)}</span></div>
          </div>

          ${tabelaHtml}

          <div style="text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
            Documento gerado automaticamente pelo sistema Atlas PDV.
          </div>
        </body>
      </html>
    `
    const res = await window.api.abrirNoNavegador(conteudoHtml)
    if (!res.sucesso) alert('Erro ao tentar abrir o relatório: ' + res.erro)
  }

  if (loading)
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Analisando dados...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      {/* ─── CABEÇALHO COM FILTROS E BOTÕES ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '10px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>
            Dashboard Gerencial
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px' }}>
            Visão geral de faturamento, ticket médio e lucratividade.
          </p>
        </div>

        {/* GRUPO DE BOTÕES (ORGANIZADOS PARA FICAR BONITO) */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}
        >
          {filtroPeriodo === 'CUSTOM' && (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <input
                type="date"
                className="input"
                style={{ margin: 0, padding: '8px', fontSize: '12px' }}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>até</span>
              <input
                type="date"
                className="input"
                style={{ margin: 0, padding: '8px', fontSize: '12px' }}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          )}

          <select
            className="input"
            style={{ margin: 0, width: '160px', padding: '10px', marginRight: '10px' }}
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
          >
            <option value="TUDO">Todo o Período</option>
            <option value="HOJE">Apenas Hoje</option>
            <option value="7DIAS">Últimos 7 Dias</option>
            <option value="30DIAS">Últimos 30 Dias</option>
            <option value="CUSTOM">Personalizado...</option>
          </select>

          <button
            onClick={exportarPlanilhaSimples}
            title="Baixar dados brutos em CSV"
            style={btnStyle('var(--surface2)', 'var(--text)')}
          >
            <Icon.Chart /> CSV Dados
          </button>

          <button
            onClick={exportarPlanilhaDetalhada}
            title="Baixar relatório formatado em CSV"
            style={btnStyle('var(--surface2)', 'var(--accent)', '1px solid var(--accent)')}
          >
            <Icon.Chart /> CSV Relatório
          </button>

          <button
            onClick={() => gerarPDF(false)}
            title="Gerar PDF apenas com os Totais"
            style={btnStyle('var(--accent)', '#000')}
          >
            <Icon.FileText /> PDF Resumo
          </button>

          <button
            onClick={() => gerarPDF(true)}
            title="Gerar PDF com Totais e Lista de Transações"
            style={btnStyle('#fff', '#000')}
          >
            <Icon.FileText /> PDF Detalhado
          </button>
        </div>
      </div>

      {/* ─── INDICADORES CHAVE (KPIs) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            Faturamento Bruto{' '}
            <span style={{ color: 'var(--accent)' }}>
              <Icon.ArrowUp />
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
            {fmt(faturamento)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            {qtdVendas} vendas registradas
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            Ticket Médio{' '}
            <span style={{ color: 'var(--text-dim)' }}>
              <Icon.Cart />
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text)' }}>
            {fmt(ticketMedio)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px' }}>
            Gasto médio por cliente
          </div>
        </div>

        <div
          className="card"
          style={{ padding: '24px', borderColor: prejuizo ? 'var(--red)' : 'var(--accent)' }}
        >
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            Margem Líquida{' '}
            <span style={{ color: prejuizo ? 'var(--red)' : 'var(--accent)' }}>
              <Icon.Chart />
            </span>
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: prejuizo ? 'var(--red)' : 'var(--accent)'
            }}
          >
            {margemLucro.toFixed(1)}%
          </div>
          <div
            style={{
              fontSize: '12px',
              color: prejuizo ? 'var(--red)' : 'var(--accent)',
              marginTop: '8px'
            }}
          >
            {prejuizo ? 'Operando no vermelho' : 'Operação lucrativa'}
          </div>
        </div>
      </div>

      {/* ─── DRE (DEMONSTRAÇÃO DE RESULTADO) E GRÁFICOS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3
            style={{
              fontSize: '14px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '25px',
              letterSpacing: '1px'
            }}
          >
            Entradas vs Saídas
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '13px'
              }}
            >
              <span>Receitas (Vendas)</span>
              <span className="mono">{fmt(faturamento)}</span>
            </div>
            <div
              style={{
                width: '100%',
                background: 'var(--surface2)',
                height: '12px',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${pctFaturamento}%`,
                  background: 'var(--accent)',
                  height: '100%',
                  borderRadius: '6px',
                  transition: '1s ease-out'
                }}
              ></div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '13px'
              }}
            >
              <span>Despesas (Custos/Contas)</span>
              <span className="mono">{fmt(despesas)}</span>
            </div>
            <div
              style={{
                width: '100%',
                background: 'var(--surface2)',
                height: '12px',
                borderRadius: '6px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${pctDespesas}%`,
                  background: 'var(--red)',
                  height: '100%',
                  borderRadius: '6px',
                  transition: '1s ease-out'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3
            style={{
              fontSize: '14px',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              letterSpacing: '1px'
            }}
          >
            Resumo do DRE
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px dashed var(--border)'
              }}
            >
              <span style={{ color: 'var(--text-dim)' }}>(+) Receita Operacional</span>
              <span className="mono" style={{ color: 'var(--accent)' }}>
                {fmt(faturamento)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px dashed var(--border)'
              }}
            >
              <span style={{ color: 'var(--text-dim)' }}>(-) Despesas / Custos</span>
              <span className="mono" style={{ color: 'var(--red)' }}>
                {fmt(despesas)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                fontSize: '18px',
                fontWeight: 800
              }}
            >
              <span>= Resultado Líquido</span>
              <span className="mono" style={{ color: prejuizo ? 'var(--red)' : 'var(--accent)' }}>
                {fmt(lucroLiquido)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Estilo auxiliar para padronizar os 4 botões novos
const btnStyle = (bg, color, border = 'none') => ({
  padding: '10px 15px',
  background: bg,
  color: color,
  border: border,
  borderRadius: '8px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  transition: '0.2s',
  textTransform: 'uppercase',
  fontSize: '11px',
  letterSpacing: '0.05em'
})
