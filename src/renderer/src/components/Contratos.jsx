import { useState, useEffect } from 'react'

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Contratos({ clientes, Icon }) {
  const [contratos, setContratos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    clienteId: '',
    titulo: 'Pão Diário / Mensalista',
    valorMensal: '',
    diaVencimento: '10'
  })

  const carregar = async () => {
    const res = await window.api.listarContratos()
    if (res.sucesso) setContratos(res.contratos)
  }

  useEffect(() => { carregar() }, [])

  const handleSalvar = async (e) => {
    e.preventDefault()
    if (!form.clienteId || !form.valorMensal) return window.api.mostrarAviso('Preencha os campos obrigatórios!')
    
    const res = await window.api.salvarContrato(form)
    if (res.sucesso) {
      setModal(false)
      setForm({ clienteId: '', titulo: 'Pão Diário / Mensalista', valorMensal: '', diaVencimento: '10' })
      carregar()
    } else {
      window.api.mostrarAviso(res.erro)
    }
  }

  const gerarLancamentoFinanceiro = async (contrato) => {
    const confirmou = await window.api.pedirConfirmacao(`Deseja lançar o pagamento mensal de ${fmt(contrato.valorMensal)} para o cliente ${contrato.cliente.nomeCompleto}?`)
    if (confirmou) {
      const res = await window.api.salvarLancamento({
        tipo: 'ENTRADA',
        descricao: `Mensalidade: ${contrato.titulo} - ${contrato.cliente.nomeCompleto}`,
        valor: contrato.valorMensal,
        pago: true,
        vencimento: new Date().toISOString().split('T')[0]
      })
      if (res.sucesso) window.api.mostrarAviso('Mensalidade lançada com sucesso no Financeiro!')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--accent)' }}>Contratos e Mensalistas</h2>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setModal(true)}>+ Novo Mensalista</button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Título / Descrição</th>
              <th>Valor Mensal</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contratos.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhum contrato ativo encontrado.</td>
              </tr>
            ) : (
              contratos.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{c.cliente.nomeCompleto}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{c.cliente.cpf}</div>
                  </td>
                  <td>{c.titulo}</td>
                  <td className="mono" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{fmt(c.valorMensal)}</td>
                  <td>Dia {c.diaVencimento}</td>
                  <td><span className="badge badge-ok">{c.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" title="Lançar Pagamento" onClick={() => gerarLancamentoFinanceiro(c)}>
                       <Icon.Money />
                    </button>
                    <button className="btn-icon" title="Excluir"><Icon.Trash /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" style={{ width: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="card-header"><span className="card-title">Novo Contrato Mensalista</span></div>
            <form onSubmit={handleSalvar} style={{ padding: '24px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Selecionar Cliente</label>
              <select className="input" value={form.clienteId} onChange={e => setForm({...form, clienteId: e.target.value})} required>
                <option value="">Escolha um cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nomeCompleto}</option>
                ))}
              </select>

              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Título do Contrato</label>
              <input className="input" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} placeholder="Ex: Pão Francês Diário" required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valor Mensal R$</label>
                  <input className="input" type="number" step="0.01" value={form.valorMensal} onChange={e => setForm({...form, valorMensal: e.target.value})} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dia Vencimento</label>
                  <input className="input" type="number" min="1" max="31" value={form.diaVencimento} onChange={e => setForm({...form, diaVencimento: e.target.value})} required />
                </div>
              </div>

              <button type="submit" className="btn-primary">Ativar Contrato</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
