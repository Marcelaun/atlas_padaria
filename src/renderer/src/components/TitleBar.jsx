import React from 'react'

const Icon = {
  Minus: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Square: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  ),
  X: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

function TitleBar() {
  const handleMinimize = () => {
    if (window.api && window.api.windowMinimize) {
      window.api.windowMinimize()
    }
  }

  const handleMaximize = () => {
    if (window.api && window.api.windowMaximize) {
      window.api.windowMaximize()
    }
  }

  const handleClose = () => {
    if (window.api && window.api.windowClose) {
      window.api.windowClose()
    }
  }

  return (
    <div
      style={{
        height: '32px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1b1b1f',
        WebkitAppRegion: 'drag', // Permite arrastar a janela por essa barra
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        borderBottom: '1px solid #282828'
      }}
    >
      <div style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 'bold', color: 'rgba(255, 255, 245, 0.86)' }}>
        Atlas PDV Pro
      </div>

      <div style={{ display: 'flex', height: '100%', WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={handleMinimize}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 245, 0.86)',
            width: '46px',
            height: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Icon.Minus size={14} />
        </button>

        <button
          onClick={handleMaximize}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 245, 0.86)',
            width: '46px',
            height: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Icon.Square size={12} />
        </button>

        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 245, 0.86)',
            width: '46px',
            height: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e81123'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'rgba(255, 255, 245, 0.86)'
          }}
        >
          <Icon.X size={16} />
        </button>
      </div>
    </div>
  )
}

export default TitleBar
