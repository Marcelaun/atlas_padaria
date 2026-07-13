import { useState, useEffect } from 'react'

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STATUS_CONFIG = {
  PENDENTE: { label: 'Pendente', color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
  PRODUCAO: { label: 'Em Produção', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  ENTREGUE: { label: 'Entregue', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  PAGO: { label: 'Pago Total', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  CANCELADA: { label: 'Cancelada', color: 'var(--red)', bg: 'var(--red-dim)' }
}

const STATUS_ORDER = ['PENDENTE', 'PRODUCAO', 'ENTREGUE', 'PAGO', 'CANCELADA']

const fmtData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—')

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export default function Encomendas() {
  const [encomendas, setEncomendas] = useState([])
  const [modalForm, setModalForm] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({
    clienteNome: '',
    clienteCpf: '',
    clienteWhatsapp: '',
    descricao: '',
    valorTotal: '',
    valorSinal: '',
    dataEntrega: ''
  })

  const carregar = async () => {
    const res = await window.api.listarEncomendas()
    if (res.sucesso) setEncomendas(res.encomendas)
  }

  useEffect(() => { carregar() }, [])

  const handleSalvar = async (e) => {
    e.preventDefault()
    const res = editandoId
      ? await window.api.editarEncomenda({ ...form, id: editandoId })
      : await window.api.salvarEncomenda(form)
    
    if (res.sucesso) {
      setModalForm(false)
      setEditandoId(null)
      setForm({ clienteNome: '', clienteCpf: '', clienteWhatsapp: '', descricao: '', valorTotal: '', valorSinal: '', dataEntrega: '' })
      carregar()
    } else {
      window.api.mostrarAviso('Erro ao salvar encomenda: ' + res.erro)
    }
  }

  const handleAvancarStatus = async (enc) => {
    const idx = STATUS_ORDER.indexOf(enc.status)
    if (idx < STATUS_ORDER.length - 1) {
      const res = await window.api.atualizarStatusEncomenda(enc.id, STATUS_ORDER[idx + 1])
      if (res.sucesso) carregar()
    }
  }

  const prepararEdicao = (enc) => {
    setEditandoId(enc.id)
    setForm({
      clienteNome: enc.clienteNome,
      clienteCpf: enc.clienteCpf,
      clienteWhatsapp: enc.clienteWhatsapp,
      descricao: enc.descricao,
      valorTotal: enc.valorTotal,
      valorSinal: enc.valorSinal,
      dataEntrega: new Date(enc.dataEntrega).toISOString().split('T')[0]
    })
    setModalForm(true)
  }

  const listaFiltrada = encomendas.filter(e => 
    e.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
    e.numero.toString().includes(busca)
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><IconSearch /></span>
          <input
            className="search-input"
            placeholder="Buscar encomenda..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setModalForm(true)}>
          + Nova Encomenda
        </button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((enc) => (
              <tr key={enc.id}>
                <td className="mono" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#{enc.numero}</td>
                <td>{enc.clienteNome}</td>
                <td style={{ fontSize: '12px' }}>{enc.descricao}</td>
                <td>{fmtData(enc.dataEntrega)}</td>
                <td className="mono">{fmt(enc.valorTotal)}</td>
                <td>
                  <span className="badge" style={{ background: STATUS_CONFIG[enc.status].bg, color: STATUS_CONFIG[enc.status].color }}>
                    {STATUS_CONFIG[enc.status].label}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => handleAvancarStatus(enc)}>▶</button>
                  <button className="btn-icon" onClick={() => prepararEdicao(enc)}>✎</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalForm && (
        <div className="modal-overlay" onClick={() => setModalForm(false)}>
          <div className="modal-box" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <span className="card-title">Nova Encomenda</span>
            </div>
            <form onSubmit={handleSalvar} style={{ padding: '20px' }}>
              <input className="input" placeholder="Nome do Cliente" value={form.clienteNome} onChange={e => setForm({...form, clienteNome: e.target.value})} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input className="input" placeholder="CPF" value={form.clienteCpf} onChange={e => setForm({...form, clienteCpf: e.target.value})} />
                <input className="input" placeholder="WhatsApp" value={form.clienteWhatsapp} onChange={e => setForm({...form, clienteWhatsapp: e.target.value})} />
              </div>
              <textarea className="input" placeholder="O que foi encomendado? (Ex: Bolo de Chocolate 2kg)" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <input className="input" type="number" placeholder="Valor Total" value={form.valorTotal} onChange={e => setForm({...form, valorTotal: e.target.value})} required />
                <input className="input" type="number" placeholder="Sinal (Pago)" value={form.valorSinal} onChange={e => setForm({...form, valorSinal: e.target.value})} />
                <input className="input" type="date" value={form.dataEntrega} onChange={e => setForm({...form, dataEntrega: e.target.value})} required />
              </div>
              <button type="submit" className="btn-primary">Salvar Encomenda</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
