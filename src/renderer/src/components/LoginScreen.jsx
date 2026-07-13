import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const res = await window.api.login({ nome, senha })
      if (res.sucesso) {
        onLogin(res.usuario)
      } else {
        setErro(res.erro)
      }
    } catch (err) {
      setErro('Erro ao conectar com o banco.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text)'
    }}>
      <div style={{
        background: 'var(--surface)',
        padding: '40px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        width: '400px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px', height: '40px', 
            borderRadius: '50%', 
            background: 'var(--red)',
            marginBottom: '10px'
          }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Padaria Tio Irineu</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Acesso ao Sistema</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <input
              type="text"
              className="input"
              placeholder="Usuário"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              style={{ width: '100%', fontSize: '16px', padding: '12px' }}
            />
          </div>
          <div>
            <input
              type="password"
              className="input"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              style={{ width: '100%', fontSize: '16px', padding: '12px' }}
            />
          </div>

          {erro && (
            <div style={{
              color: '#fff',
              background: 'var(--red)',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {erro}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '16px', 
              marginTop: '10px',
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)' }}>
          Precisa de ajuda? Fale com o Tio Irineu.
        </p>
      </div>
    </div>
  )
}
