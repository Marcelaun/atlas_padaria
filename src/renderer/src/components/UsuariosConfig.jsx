import { useState, useEffect } from 'react'

export default function UsuariosConfig({ Icon }) {
  const [usuarios, setUsuarios] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ id: null, nome: '', senha: '', role: 'funcionario' })

  const carregarUsuarios = async () => {
    const res = await window.api.listarUsuarios()
    if (res.sucesso) {
      setUsuarios(res.usuarios)
    }
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await window.api.salvarUsuario(form)
    if (res.sucesso) {
      setShowForm(false)
      setForm({ id: null, nome: '', senha: '', role: 'funcionario' })
      carregarUsuarios()
    } else {
      window.api.mostrarAviso(res.erro)
    }
  }

  const handleDelete = async (id) => {
    const conf = await window.api.pedirConfirmacao('Deseja excluir este usuário?')
    if (conf) {
      await window.api.excluirUsuario(id)
      carregarUsuarios()
    }
  }

  return (
    <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '25px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Gerenciar Usuários (Login)</h4>
        <button 
          className="btn-primary" 
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={() => {
            setForm({ id: null, nome: '', senha: '', role: 'funcionario' })
            setShowForm(true)
          }}
        >
          <Icon.Plus size={14} /> Novo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface2)', padding: '15px', borderRadius: 'var(--radius-sm)', marginBottom: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Usuário (Login)</label>
              <input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Senha</label>
              <input className="input" type="text" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nível de Acesso</label>
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="funcionario">Funcionário (Apenas Vendas)</option>
                <option value="dono">Dono (Acesso Total)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '10px' }}>Salvar</button>
              <button type="button" className="btn-icon" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      <table className="tbl" style={{ marginTop: '10px' }}>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Nível de Acesso</th>
            <th style={{ textAlign: 'right' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td style={{ fontWeight: 600 }}>{u.nome}</td>
              <td>
                <span className="badge" style={{ background: u.role === 'dono' ? 'var(--red)' : 'var(--yellow)', color: u.role === 'dono' ? '#fff' : '#000' }}>
                  {u.role.toUpperCase()}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn-icon" onClick={() => { setForm(u); setShowForm(true); }}><Icon.Edit size={16} /></button>
                <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleDelete(u.id)}><Icon.Trash size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  )
}
