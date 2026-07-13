import { useState, useEffect } from 'react'

// ─── Ícones ───────────────────────────────────────────────────────
const Icon = {
  Plus: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Check: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  ArrowUp: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  ArrowDown: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtData = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([])
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0, pendentes: 0 })
  const [filtro, setFiltro] = useState('TODOS') // TODOS | ENTRADA | SAIDA | PENDENTE
  const [modal, setModal] = useState(false)

  // form
  const [tipo, setTipo] = useState('SAIDA')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [pago, setPago] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  const carregar = async () => {
    const [resL, resR] = await Promise.all([
      window.api.listarLancamentos(),
      window.api.resumoFinanceiro()
    ])
    if (resL.sucesso) setLancamentos(resL.lancamentos)
    if (resR.sucesso) setResumo(resR)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    const res = await window.api.salvarLancamento({ tipo, descricao, valor, vencimento, pago })
    if (res.sucesso) {
      setModal(false)
      setDescricao('')
      setValor('')
      setVencimento('')
      setPago(false)
      setTipo('SAIDA')
      carregar()
    } else {
      alert('Erro: ' + res.erro)
    }
  }

  const handlePago = async (id) => {
    await window.api.marcarPago(id)
    carregar()
  }

  const handleExcluir = async (id) => {
    if (!confirm('Excluir este lançamento?')) return
    await window.api.excluirLancamento(id)
    carregar()
  }

  const lista = lancamentos.filter((l) => {
    if (filtro === 'ENTRADA') return l.tipo === 'ENTRADA'
    if (filtro === 'SAIDA') return l.tipo === 'SAIDA'
    if (filtro === 'PENDENTE') return !l.pago
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── CARDS DE RESUMO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <ResumoCard
          label="Entradas Pagas"
          valor={resumo.entradas}
          cor="var(--accent)"
          bg="var(--accent-dim)"
          icon={<Icon.ArrowUp />}
        />
        <ResumoCard
          label="Saídas Pagas"
          valor={resumo.saidas}
          cor="var(--red)"
          bg="var(--red-dim)"
          icon={<Icon.ArrowDown />}
        />
        <ResumoCard
          label="Saldo Real"
          valor={resumo.saldo}
          cor={resumo.saldo >= 0 ? 'var(--accent)' : 'var(--red)'}
          bg={resumo.saldo >= 0 ? 'var(--accent-dim)' : 'var(--red-dim)'}
          icon={resumo.saldo >= 0 ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
          destaque
        />
        <ResumoCard
          label="A Vencer / Pendente"
          valor={resumo.pendentes}
          cor="#f59e0b"
          bg="rgba(245,158,11,0.1)"
          icon={<Icon.Clock />}
        />
      </div>

      {/* ── BARRA DE FILTROS + BOTÃO ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['TODOS', 'ENTRADA', 'SAIDA', 'PENDENTE'].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filtro === f ? 'var(--accent)' : 'var(--border)',
                background: filtro === f ? 'var(--accent-dim)' : 'transparent',
                color: filtro === f ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                letterSpacing: '0.04em'
              }}
            >
              {f === 'TODOS'
                ? 'Todos'
                : f === 'ENTRADA'
                  ? 'Entradas'
                  : f === 'SAIDA'
                    ? 'Saídas'
                    : 'Pendentes'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'var(--accent)',
            color: '#0f0f11',
            border: 'none',
            borderRadius: '8px',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer'
          }}
        >
          <Icon.Plus /> Novo Lançamento
        </button>
      </div>

      {/* ── TABELA ── */}
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <div className="empty-icon">💰</div>
                      <div className="empty-text">Nenhum lançamento encontrado</div>
                    </div>
                  </td>
                </tr>
              ) : (
                lista.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 9px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: l.tipo === 'ENTRADA' ? 'var(--accent-dim)' : 'var(--red-dim)',
                          color: l.tipo === 'ENTRADA' ? 'var(--accent)' : 'var(--red)'
                        }}
                      >
                        {l.tipo === 'ENTRADA' ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
                        {l.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text)', maxWidth: '260px' }}>
                      {l.descricao}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: l.tipo === 'ENTRADA' ? 'var(--accent)' : 'var(--red)'
                      }}
                    >
                      {l.tipo === 'SAIDA' ? '−' : '+'}
                      {fmt(l.valor)}
                    </td>
                    <td
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-dim)'
                      }}
                    >
                      {fmtData(l.vencimento)}
                    </td>
                    <td>
                      {l.pago ? (
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'var(--accent-dim)',
                            color: 'var(--accent)'
                          }}
                        >
                          Pago
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'rgba(245,158,11,0.1)',
                            color: '#f59e0b'
                          }}
                        >
                          Pendente
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {!l.pago && (
                          <button
                            onClick={() => handlePago(l.id)}
                            title="Marcar como pago"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              background: 'var(--accent-dim)',
                              color: 'var(--accent)',
                              border: '1px solid var(--accent)',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            <Icon.Check />
                          </button>
                        )}
                        <button
                          onClick={() => handleExcluir(l.id)}
                          title="Excluir"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: 'var(--red-dim)',
                            color: 'var(--red)',
                            border: '1px solid var(--red)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Icon.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL NOVO LANÇAMENTO ── */}
      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              width: '420px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)'
                }}
              >
                Novo Lançamento
              </span>
              <button
                onClick={() => setModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSalvar}
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {/* Tipo toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['ENTRADA', 'SAIDA'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor:
                        tipo === t
                          ? t === 'ENTRADA'
                            ? 'var(--accent)'
                            : 'var(--red)'
                          : 'var(--border)',
                      background:
                        tipo === t
                          ? t === 'ENTRADA'
                            ? 'var(--accent-dim)'
                            : 'var(--red-dim)'
                          : 'var(--surface2)',
                      color:
                        tipo === t
                          ? t === 'ENTRADA'
                            ? 'var(--accent)'
                            : 'var(--red)'
                          : 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {t === 'ENTRADA' ? <Icon.ArrowUp /> : <Icon.ArrowDown />}
                    {t === 'ENTRADA' ? 'Entrada' : 'Saída'}
                  </button>
                ))}
              </div>

              <div className="field">
                <label>Descrição</label>
                <input
                  className="input"
                  placeholder="Ex: Aluguel do ponto, Fornecedor..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="field">
                  <label>Valor R$</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>Vencimento</label>
                  <input
                    className="input"
                    type="date"
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                  />
                </div>
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-dim)',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={pago}
                  onChange={(e) => setPago(e.target.checked)}
                  style={{ accentColor: 'var(--accent)', width: '15px', height: '15px' }}
                />
                Já foi pago / recebido
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  style={{
                    padding: '11px',
                    background: 'var(--surface2)',
                    color: 'var(--text-dim)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px'
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ margin: 0 }}>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card de resumo ───────────────────────────────────────────────
function ResumoCard({ label, valor, cor, bg, icon, destaque }) {
  return (
    <div className="card" style={{ padding: '16px 20px', borderColor: destaque ? cor : undefined }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: bg,
            color: cor
          }}
        >
          {icon}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 800,
          color: cor,
          letterSpacing: '-0.5px'
        }}
      >
        {fmt(valor)}
      </div>
    </div>
  )
}
