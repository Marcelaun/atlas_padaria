import { useState, useEffect, useRef } from 'react'

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Comandas({ produtos, clientes, Icon }) {
  const [comandas, setComandas] = useState([])
  const [modalNova, setModalNova] = useState(false)
  const [numeroComanda, setNumeroComanda] = useState('')
  const [comandaAtiva, setComandaAtiva] = useState(null)
  const [comandaDetalhe, setComandaDetalhe] = useState(null)
  
  const [carrinho, setCarrinho] = useState([])
  const [busca, setBusca] = useState('')
  const inputBuscaRef = useRef(null)

  const carregar = async () => {
    const res = await window.api.listarComandas()
    if (res.sucesso) setComandas(res.comandas)
  }

  useEffect(() => { carregar() }, [])

  const handleAbrirComanda = async (e) => {
    e.preventDefault()
    const res = await window.api.abrirComanda(numeroComanda)
    if (res.sucesso) {
      setModalNova(false)
      setNumeroComanda('')
      carregar()
    } else {
      window.api.mostrarAviso(res.erro)
    }
  }

  const adicionarAoCarrinho = (p) => {
    let qtd = 1
    if (p.unidadeMedida === 'KG') {
      const peso = prompt(`Digite o peso para ${p.nome} (ex: 0.500):`, '1.000')
      if (peso === null) return
      qtd = parseFloat(peso.replace(',', '.'))
      if (isNaN(qtd) || qtd <= 0) return
    }
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.id === p.id)
      if (existe)
        return prev.map((i) => (i.id === p.id ? { ...i, quantidade: i.quantidade + qtd } : i))
      return [...prev, { ...p, quantidade: qtd }]
    })
    setBusca('')
  }

  const lancarNaComanda = async () => {
    if (!comandaAtiva || carrinho.length === 0) return
    const res = await window.api.adicionarItemComanda(comandaAtiva.id, {
      total: carrinho.reduce((acc, i) => acc + i.precoVenda * i.quantidade, 0),
      itens: carrinho
    })
    if (res.sucesso) {
      setCarrinho([])
      setComandaAtiva(null)
      carregar()
    } else {
      window.api.mostrarAviso('Erro ao lançar: ' + res.erro)
    }
  }

  const fecharComanda = async (comanda) => {
    const metodo = prompt('Método de Pagamento (DINHEIRO, PIX, CARTAO):', 'DINHEIRO')
    if (!metodo) return
    const res = await window.api.fecharComanda(comanda.id, metodo.toUpperCase())
    if (res.sucesso) {
      carregar()
    } else {
      window.api.mostrarAviso(res.erro)
    }
  }

  const prodFiltrados = produtos.filter(
    (p) => busca !== '' && p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--accent)' }}>Comandas Abertas</h2>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setModalNova(true)}>+ Abrir Comanda</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {comandas.map(c => (
          <div key={c.id} className="card" style={{ padding: '15px', border: comandaAtiva?.id === c.id ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 900, fontSize: '20px' }}>#{c.numero}</span>
              <span className="mono" style={{ color: 'var(--accent)' }}>{fmt(c.total)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
              <button className="btn-primary" style={{ padding: '12px', fontSize: '14px' }} onClick={() => setComandaAtiva(c)}>Lançar</button>
              <button className="btn-primary" style={{ padding: '12px', fontSize: '14px', background: 'var(--surface2)', color: 'var(--text)' }} onClick={() => setComandaDetalhe(c)}>Ver</button>
              <button className="btn-primary" style={{ padding: '12px', fontSize: '14px', background: 'var(--surface2)', color: 'var(--red)' }} onClick={() => fecharComanda(c)}>Fechar</button>
            </div>
          </div>
        ))}
      </div>

      {comandaAtiva && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '600px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '20px', borderRight: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '15px' }}>Lançar na Comanda #{comandaAtiva.numero}</h3>
              <input className="input" placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} />
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {prodFiltrados.map(p => (
                  <div key={p.id} className="resultado-item" onClick={() => adicionarAoCarrinho(p)}>
                    <span>{p.nome}</span>
                    <span className="mono">{fmt(p.precoVenda)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '15px' }}>Itens a Lançar</h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {carrinho.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                    <span>{i.quantidade}x {i.nome}</span>
                    <span>{fmt(i.precoVenda * i.quantidade)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>Total:</strong>
                  <strong style={{ color: 'var(--accent)' }}>{fmt(carrinho.reduce((acc, i) => acc + i.precoVenda * i.quantidade, 0))}</strong>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={lancarNaComanda}>Confirmar</button>
                  <button className="btn-primary" style={{ background: 'var(--surface2)', color: 'var(--text)' }} onClick={() => setComandaAtiva(null)}>Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {comandaDetalhe && (
        <div className="modal-overlay" onClick={() => setComandaDetalhe(null)}>
          <div className="modal-box" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <span className="card-title">Comanda #{comandaDetalhe.numero} - Itens</span>
              <button className="btn-icon" onClick={() => setComandaDetalhe(null)}>X</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {comandaDetalhe.vendas && comandaDetalhe.vendas.length > 0 ? (
                comandaDetalhe.vendas.map(v => (
                  <div key={v.id} style={{ marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    {v.itens && v.itens.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                        <span>{item.quantidade}x {item.produto?.nome || 'Produto Desconhecido'}</span>
                        <span>{fmt(item.precoUnitario * item.quantidade)}</span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum item lançado ainda.</p>
              )}
              <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total da Comanda:</span>
                <span style={{ color: 'var(--yellow)' }}>{fmt(comandaDetalhe.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalNova && (
        <div className="modal-overlay" onClick={() => setModalNova(false)}>
          <div className="modal-box" style={{ width: '300px' }} onClick={e => e.stopPropagation()}>
            <div className="card-header"><span className="card-title">Nova Comanda</span></div>
            <form onSubmit={handleAbrirComanda} style={{ padding: '20px' }}>
              <input className="input" placeholder="Número da Comanda / Mesa" value={numeroComanda} onChange={e => setNumeroComanda(e.target.value)} autoFocus required />
              <button type="submit" className="btn-primary">Abrir</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
