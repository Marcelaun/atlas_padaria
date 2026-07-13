import { useState, useEffect, useRef } from 'react'
import Comandas from './components/Comandas'
import Relatorios from '../pages/Relatorios'
import Encomendas from './components/Encomendas'
import Contratos from './components/Contratos'
import LoginScreen from './components/LoginScreen'
import UsuariosConfig from './components/UsuariosConfig'
import Tutorial from './components/Tutorial'
import TitleBar from './components/TitleBar'

const style = document.createElement('style')
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { 
    --bg: #0f0f11; --surface: #18181c; --surface2: #202025; --border: #2a2a32; 
    --accent: #c8f135; --accent-dim: rgba(200,241,53,0.12); --accent-dim2: rgba(200,241,53,0.06); 
    --text: #f0f0f0; --text-muted: #666; --text-dim: #999; 
    --red: #ff4d4d; --red-dim: rgba(255,77,77,0.1); 
    --yellow: #f59e0b; --yellow-dim: rgba(245,158,11,0.1); 
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
    --shadow-md: 0 8px 24px rgba(0,0,0,0.5);
    --font-ui: 'Outfit', 'Inter', -apple-system, system-ui, sans-serif; 
    --font-mono: 'Cascadia Code', 'Fira Code', 'monospace'; 
    --radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px;
  }
  .light-theme { 
    --bg: #f8f6f0; --surface: #ffffff; --surface2: #ffffff; 
    --border: transparent; 
    --accent: #e85d75; --accent-dim: rgba(232, 93, 117, 0.1); --accent-dim2: rgba(232, 93, 117, 0.05); 
    --text: #1a1514; --text-muted: #4a3f3c; --text-dim: #5c504d; 
    --red: #e85d75; --red-dim: rgba(232, 93, 117, 0.1); 
    --yellow: #f4c033; --yellow-dim: rgba(244, 192, 51, 0.2); 
    --shadow-sm: 0 4px 12px rgba(139, 126, 122, 0.08);
    --shadow-md: 0 12px 32px rgba(139, 126, 122, 0.12);
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-ui); overflow: hidden; transition: background 0.4s ease, color 0.4s ease; }
  .atlas-root { display: flex; flex-direction: row; height: 100vh; width: 100vw; }
  .atlas-sidebar { width: 260px; background: var(--surface); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; padding: 30px 16px; flex-shrink: 0; z-index: 10; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; }
  .atlas-sidebar.fechado { width: 0; padding: 0; overflow: hidden; opacity: 0; }
  .atlas-logo { font-weight: 900; font-size: 24px; color: var(--accent); display: flex; align-items: center; gap: 14px; padding: 0 12px; margin-bottom: 50px; white-space: nowrap; letter-spacing: -0.5px; }
  .atlas-logo-dot { width: 12px; height: 12px; background: var(--accent); border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 12px var(--accent-dim); }
  .nav-menu { display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .nav-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: none; background: transparent; color: var(--text-muted); font-size: 14px; font-weight: 600; border-radius: var(--radius-sm); cursor: pointer; text-align: left; transition: all 0.3s ease; white-space: nowrap; }
  .nav-item:hover { background: var(--surface2); box-shadow: var(--shadow-sm); color: var(--text); transform: translateX(4px); }
  .nav-item.ativo { color: #fff; background: var(--yellow); font-weight: 700; box-shadow: 0 6px 16px var(--yellow-dim); transform: translateX(4px); }
  
  .atlas-main { flex: 1; padding: 30px 40px 100px 40px; overflow-y: auto; background: var(--bg); height: 100vh; display: flex; flex-direction: column; }
  
  .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .topbar-btn { background: var(--surface); box-shadow: var(--shadow-sm); border: none; color: var(--text); padding: 10px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
  .topbar-btn:hover { background: var(--surface); color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
  
  .card { background: var(--surface); border: none; border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--shadow-md); transition: transform 0.3s ease; }
  .card-header { padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); }
  .card-title { font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim); }
  
  .dual-layout { display: grid; grid-template-columns: 500px 1fr; gap: 30px; align-items: start; }
  .pdv-layout { display: grid; grid-template-columns: 1fr 400px; gap: 30px; flex: 1; min-height: 0; }
  
  .search-wrap { position: relative; margin-bottom: 20px; }
  .search-input { width: 100%; padding: 16px 50px; background: var(--surface); border: none; box-shadow: var(--shadow-sm); border-radius: var(--radius-sm); color: var(--text); outline: none; font-size: 15px; font-weight: 500; transition: all 0.3s ease; }
  .search-input:focus { box-shadow: 0 0 0 2px var(--accent), var(--shadow-md); }
  .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: color 0.3s; }
  
  .resultado-item { display: flex; justify-content: space-between; padding: 16px 20px; background: var(--surface); border: none; box-shadow: var(--shadow-sm); border-radius: var(--radius-sm); cursor: pointer; margin-bottom: 10px; transition: all 0.2s ease; }
  .resultado-item:hover { transform: scale(1.01); box-shadow: 0 0 0 2px var(--accent), var(--shadow-md); background: var(--surface); }
  
  .cart-item { display: flex; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.03); align-items: center; transition: background 0.2s; }
  .cart-item:hover { background: rgba(0,0,0,0.01); }
  .total-value { font-size: 36px; font-weight: 900; color: var(--yellow); letter-spacing: -1.5px; text-shadow: 0 4px 12px var(--yellow-dim); }
  
  .input { width: 100%; padding: 14px 16px; background: var(--surface); border: none; box-shadow: var(--shadow-sm); border-radius: var(--radius-sm); color: var(--text); margin-bottom: 16px; outline: none; font-size: 14px; transition: all 0.3s ease; }
  .input:focus { box-shadow: 0 0 0 2px var(--accent), var(--shadow-md); }
  select.input { cursor: pointer; appearance: auto; }
  
  .btn-primary { width: 100%; padding: 16px; background: var(--accent); color: #0f0f11; border: none; border-radius: var(--radius-sm); font-weight: 900; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; font-size: 14px; letter-spacing: 0.08em; box-shadow: 0 8px 20px var(--accent-dim); display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 24px var(--accent-dim); filter: brightness(1.05); }
  .btn-primary:active { transform: translateY(0); box-shadow: 0 4px 10px var(--accent-dim); }
  
  .tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
  .tbl th { padding: 16px 24px; text-align: left; font-size: 12px; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.04); font-weight: 700; letter-spacing: 0.05em; }
  .tbl td { padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.02); font-size: 14px; font-weight: 500; }
  .tbl tr { transition: background 0.2s; }
  .tbl tr:hover { background: rgba(0,0,0,0.01); }
  
  .badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge-ok { background: var(--accent-dim); color: var(--accent); box-shadow: 0 4px 10px var(--accent-dim); }
  .badge-low { background: var(--red-dim); color: var(--red); box-shadow: 0 4px 10px var(--red-dim); }
  .mono { font-family: var(--font-mono); }
  
  .btn-icon { padding: 8px; background: var(--surface); box-shadow: var(--shadow-sm); border: none; color: var(--text-muted); border-radius: 8px; cursor: pointer; margin-left: 8px; transition: all 0.2s ease; }
  .btn-icon:hover { color: var(--accent); box-shadow: var(--shadow-md); transform: translateY(-2px); }
  
  .fin-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
  .fin-card { padding: 24px; border: none; border-radius: var(--radius-md); background: var(--surface); box-shadow: var(--shadow-sm); transition: transform 0.3s; }
  .fin-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .fin-card-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 800; margin-bottom: 16px; display: flex; justify-content: space-between; letter-spacing: 0.05em; }
  .fin-card-value { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
  
  .fin-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .fin-filtro-btn { padding: 10px 20px; border-radius: var(--radius-sm); border: none; background: var(--surface); box-shadow: var(--shadow-sm); color: var(--text-muted); font-size: 13px; cursor: pointer; font-weight: 700; transition: all 0.3s; }
  .fin-filtro-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); color: var(--text); }
  .fin-filtro-btn.ativo { background: var(--yellow); color: #fff; box-shadow: 0 6px 16px var(--yellow-dim); }
  
  .status-pago { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; background: var(--accent-dim); color: var(--accent); }
  .status-pendente { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; background: var(--yellow-dim); color: var(--yellow); }
  
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); }
  .modal-box { background: var(--surface); border: none; border-radius: var(--radius-lg); width: 440px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.15); transform: scale(0.98); animation: modal-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; }
  @keyframes modal-in { to { transform: scale(1); } }
  
  .tipo-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .tipo-btn { padding: 14px; border-radius: var(--radius-sm); border: none; background: var(--surface); box-shadow: var(--shadow-sm); color: var(--text-muted); font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s; }
  .tipo-btn:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .tipo-btn-entrada.ativo { box-shadow: 0 0 0 2px var(--accent), var(--shadow-md); background: var(--accent-dim); color: var(--accent); }
  .tipo-btn-saida.ativo { box-shadow: 0 0 0 2px var(--red), var(--shadow-md); background: var(--red-dim); color: var(--red); }
  
  .pay-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 20px; }
  .pay-btn { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; background: var(--surface); border: none; box-shadow: var(--shadow-sm); border-radius: var(--radius-sm); color: var(--text); font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
  .pay-btn:hover { box-shadow: 0 0 0 2px var(--accent), var(--shadow-md); background: var(--surface); transform: translateX(6px); }
  .pay-key { background: rgba(0,0,0,0.04); padding: 6px 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 14px; color: var(--accent); box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
  
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
  
  .tag-material { background: var(--surface); border: none; box-shadow: var(--shadow-sm); padding: 10px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; margin-bottom: 10px;}
  
  .tab-bar { display: flex; gap: 12px; margin-bottom: 24px; overflow-x: auto; flex-shrink: 0; padding-bottom: 4px; }
  .tab-item { display: flex; align-items: center; gap: 10px; padding: 12px 24px; border: none; box-shadow: var(--shadow-sm); background: var(--surface); color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); white-space: nowrap; border-radius: 30px; }
  .tab-item:hover { color: var(--text); transform: translateY(-3px); box-shadow: var(--shadow-md); }
  .tab-item.ativo { background: var(--yellow); color: #fff; box-shadow: 0 8px 20px var(--yellow-dim); transform: translateY(-3px); }
  .tab-close { padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; line-height: 1; transition: 0.2s; }
  .tab-close:hover { background: rgba(0,0,0,0.1); color: #fff; }
  .resultado-list { max-height: 320px; overflow-y: auto; padding: 4px; }
`
document.head.appendChild(style)

const Icon = {
  Cart: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Box: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  Users: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  Money: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  Chart: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Search: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),
  Check: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  Plus: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Clock: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  X: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  Menu: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
  Maximize: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
    </svg>
  ),
  ChefHat: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" x2="18" y1="17" y2="17" />
    </svg>
  ),
  Download: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Cloud: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  )
}

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—')

const showAviso = (msg) => {
  alert(msg)
  setTimeout(() => {
    window.focus()
    document.body.focus()
  }, 50)
}
const askConfirmacao = (msg) => {
  const res = confirm(msg)
  setTimeout(() => {
    window.focus()
    document.body.focus()
  }, 50)
  return res
}

// ─── COMPONENTE FINANCEIRO ─────────────────────────────────────────
function Financeiro() {
  const [lancamentos, setLancamentos] = useState([])
  const [resumo, setResumo] = useState({ entradas: 0, saidas: 0, saldo: 0, pendentes: 0 })
  const [filtro, setFiltro] = useState('TODOS')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    tipo: 'SAIDA',
    descricao: '',
    valor: '',
    vencimento: '',
    pago: false
  })

  const carregar = async () => {
    const [resL, resR] = await Promise.all([
      window.api.listarLancamentos(),
      window.api.resumoFinanceiro()
    ])
    if (resL.sucesso) setLancamentos(resL.lancamentos)
    if (resR.sucesso) setResumo(resR)
  }

  useEffect(() => {
    carregar()
  }, [])

  const handleSalvar = async (e) => {
    e.preventDefault()
    const res = await window.api.salvarLancamento(form)
    if (res.sucesso) {
      setModal(false)
      setForm({ tipo: 'SAIDA', descricao: '', valor: '', vencimento: '', pago: false })
      carregar()
    }
  }

  const listaFiltrada = lancamentos.filter((l) => {
    if (filtro === 'ENTRADA') return l.tipo === 'ENTRADA'
    if (filtro === 'SAIDA') return l.tipo === 'SAIDA'
    if (filtro === 'PENDENTE') return !l.pago
    return true
  })

  return (
    <div>
      <div className="fin-grid">
        <div className="card fin-card">
          <div className="fin-card-label">
            Entradas <Icon.ArrowUp />
          </div>
          <div className="fin-card-value" style={{ color: 'var(--accent)' }}>
            {fmt(resumo.entradas)}
          </div>
        </div>
        <div className="card fin-card">
          <div className="fin-card-label">
            Saídas <Icon.ArrowDown />
          </div>
          <div className="fin-card-value" style={{ color: 'var(--red)' }}>
            {fmt(resumo.saidas)}
          </div>
        </div>
        <div className="card fin-card" style={{ borderColor: 'var(--accent)' }}>
          <div className="fin-card-label">
            Saldo Real <Icon.Check />
          </div>
          <div className="fin-card-value">{fmt(resumo.saldo)}</div>
        </div>
        <div className="card fin-card">
          <div className="fin-card-label">
            Pendentes <Icon.Clock />
          </div>
          <div className="fin-card-value" style={{ color: 'var(--yellow)' }}>
            {fmt(resumo.pendentes)}
          </div>
        </div>
      </div>
      <div className="fin-toolbar">
        <div style={{ display: 'flex', gap: '8px' }}>
          {['TODOS', 'ENTRADA', 'SAIDA', 'PENDENTE'].map((f) => (
            <button
              key={f}
              className={`fin-filtro-btn ${filtro === f ? 'ativo' : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          style={{
            width: 'auto',
            padding: '10px 20px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}
          onClick={() => setModal(true)}
        >
          <Icon.Plus /> Novo Lançamento
        </button>
      </div>
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((l) => (
                <tr key={l.id}>
                  <td>
                    {l.tipo === 'ENTRADA' ? (
                      <span style={{ color: 'var(--accent)' }}>↑ Entrada</span>
                    ) : (
                      <span style={{ color: 'var(--red)' }}>↓ Saída</span>
                    )}
                  </td>
                  <td>{l.descricao}</td>
                  <td className="mono">{fmt(l.valor)}</td>
                  <td>
                    <span className={l.pago ? 'status-pago' : 'status-pendente'}>
                      {l.pago ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {!l.pago && (
                        <button
                          className="btn-icon"
                          title="Pagar"
                          onClick={async () => {
                            await window.api.marcarPago(l.id)
                            carregar()
                          }}
                        >
                          <Icon.Check />
                        </button>
                      )}
                      <button
                        className="btn-icon"
                        title="Excluir"
                        onClick={async () => {
                          const confirmou = await window.api.pedirConfirmacao('Excluir lançamento?')
                          if (confirmou) {
                            await window.api.excluirLancamento(l.id)
                            carregar()
                          }
                        }}
                      >
                        <Icon.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="card-header">
              <span className="card-title">Novo Lançamento</span>
              <button
                onClick={() => setModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSalvar} style={{ padding: '24px' }}>
              <div className="tipo-toggle">
                <button
                  type="button"
                  className={`tipo-btn tipo-btn-entrada ${form.tipo === 'ENTRADA' ? 'ativo' : ''}`}
                  onClick={() => setForm({ ...form, tipo: 'ENTRADA' })}
                >
                  <Icon.ArrowUp /> Entrada
                </button>
                <button
                  type="button"
                  className={`tipo-btn tipo-btn-saida ${form.tipo === 'SAIDA' ? 'ativo' : ''}`}
                  onClick={() => setForm({ ...form, tipo: 'SAIDA' })}
                >
                  <Icon.ArrowDown /> Saída
                </button>
              </div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Descrição</label>
              <input
                className="input"
                placeholder="Ex: Aluguel, Fornecedor..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valor R$</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Vencimento</label>
                  <input
                    className="input"
                    type="date"
                    value={form.vencimento}
                    onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                  />
                </div>
              </div>
              <label
                style={{
                  display: 'flex',
                  gap: '10px',
                  fontSize: '13px',
                  margin: '10px 0 20px 0',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={form.pago}
                  onChange={(e) => setForm({ ...form, pago: e.target.checked })}
                />{' '}
                Já está pago
              </label>
              <button type="submit" className="btn-primary">
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────
function App() {
  const [abasAbertas, setAbasAbertas] = useState(['pdv'])
  const [aba, setAba] = useState('pdv')
  const [menuAberto, setMenuAberto] = useState(true)
  const [tema, setTema] = useState(localStorage.getItem('tema') || 'claro')
  const [unidadesCadastradas, setUnidadesCadastradas] = useState('KG,UN,G,LT,ML,CX,PCT,Fatias')
  const [modalNovaMedida, setModalNovaMedida] = useState({ aberta: false, target: '' })
  const [novaMedidaTextGlobal, setNovaMedidaTextGlobal] = useState('')

  const abrirAba = (id) => {
    setAba(id)
    setAbasAbertas((prev) => prev.includes(id) ? prev : [...prev, id])
  }

  const fecharAba = (id) => {
    setAbasAbertas((prev) => {
      const novas = prev.filter((a) => a !== id)
      if (novas.length === 0) return ['pdv']
      if (aba === id) setAba(novas[novas.length - 1])
      return novas
    })
  }

  useEffect(() => {
    localStorage.setItem('tema', tema)
    if (tema === 'claro') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [tema])

  const [usuarioLogado, setUsuarioLogado] = useState(null)
  
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [materiais, setMateriais] = useState([])
  const [listaTags, setListaTags] = useState([])

  const [carrinho, setCarrinho] = useState([])
  const [busca, setBusca] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [showModalClientesPdv, setShowModalClientesPdv] = useState(false)
  const inputBuscaRef = useRef(null)

  // FILTROS CRM
  const [filtroTag, setFiltroTag] = useState('TODAS')
  const [filtroInatividade, setFiltroInatividade] = useState('TODOS')
  const [filtroAniversario, setFiltroAniversario] = useState('TODOS')

  // 👇 AQUI ESTÃO OS ESTADOS CORRIGIDOS DA LICENÇA
  const [licenca, setLicenca] = useState('CARREGANDO')
  const [senhaLicenca, setSenhaLicenca] = useState('')
  const [codigoMaquina, setCodigoMaquina] = useState('') // Essa era a que estava faltando!

  const [showModalFornada, setShowModalFornada] = useState(false)
  const [caixaAtivo, setCaixaAtivo] = useState(null)
  const [valorAberturaCaixa, setValorAberturaCaixa] = useState('')
  const [fornadaForm, setFornadaForm] = useState({
    origemId: '',
    destinoId: '',
    quantidade: '',
    quantidadeUsada: '',
    perda: 0
  })
  const [modalAdicionalItemPdv, setModalAdicionalItemPdv] = useState(null)
  
  const handleSelectAdicional = (produtoAdicional) => {
    setCarrinho((prev) =>
      prev.map((i) => {
        if (i.id === modalAdicionalItemPdv) {
          const texto = i.adicionaisTexto ? `${i.adicionaisTexto}, + ${produtoAdicional.nome}` : `+ ${produtoAdicional.nome}`
          const valor = (i.adicionaisValor || 0) + produtoAdicional.precoVenda
          return { ...i, adicionaisTexto: texto, adicionaisValor: valor }
        }
        return i
      })
    )
    setModalAdicionalItemPdv(null)
  }

  const handleLancarFornada = async (e) => {
    e.preventDefault()
    const res = await window.api.lancarFornada(fornadaForm)
    if (res.sucesso) {
      setShowModalFornada(false)
      setFornadaForm({ origemId: '', destinoId: '', quantidade: '', quantidadeUsada: '', perda: 0 })
      carregarDados()
    } else {
      window.api.mostrarAviso(res.erro)
    }
  }

  // ESTADOS PRODUTOS
  const [editandoId, setEditandoId] = useState(null)
  const [prodForm, setProdForm] = useState({
    nome: '',
    barras: '',
    custo: '',
    venda: '',
    estoque: '',
    unidadeMedida: 'UN',
    isAdicional: false, // Novo campo aqui
    materiaisUsados: []
  })

  const [matSelecionado, setMatSelecionado] = useState('')
  const [matQtd, setMatQtd] = useState('')

  const [editandoMaterialId, setEditandoMaterialId] = useState(null)
  const [matForm, setMatForm] = useState({
    nome: '',
    custoPorMedida: '',
    unidadeMedida: 'KG',
    estoqueAtual: '',
    calcularPacote: false,
    precoPacote: '',
    quantidadePacote: ''
  })

  const [editandoClienteId, setEditandoClienteId] = useState(null)
  const [cliForm, setCliForm] = useState({
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    endereco: '', // Inicializado aqui
    dataNascimento: '',
    tags: [],
    metadata: ''
  })

  // ─── LOGICA DE RANKING DE CLIENTES (CORRIGIDA) ─────────────────
  const rankingClientes = (clientes || []).map(c => {
    const vendas = Array.isArray(c.vendas) ? c.vendas : []
    const totalGasto = vendas.reduce((acc, v) => acc + (v.total || 0), 0)
    const qtdCompras = vendas.length
    
    const produtosContador = {}
    vendas.forEach(v => {
      const itens = Array.isArray(v.itens) ? v.itens : []
      itens.forEach(i => {
        const nomeProd = i.produto?.nome || 'Produto'
        produtosContador[nomeProd] = (produtosContador[nomeProd] || 0) + (i.quantidade || 0)
      })
    })
    
    const favoritoArr = Object.entries(produtosContador).sort((a, b) => b[1] - a[1])
    const favorito = favoritoArr.length > 0 ? favoritoArr[0] : null
    
    return {
      ...c,
      totalGasto,
      qtdCompras,
      produtoFavorito: favorito ? `${favorito[0]} (${favorito[1]}x)` : '—'
    }
  }).sort((a, b) => b.totalGasto - a.totalGasto)

  const carregarDados = async () => {
    if (!window.api) return

    // VERIFICAÇÃO DE LICENÇA
    const statusLicenca = await window.api.verificarLicenca()
    setLicenca(statusLicenca.status)
    if (statusLicenca.codigo) setCodigoMaquina(statusLicenca.codigo)

    if (statusLicenca.status !== 'AUTORIZADO') return

    // CARREGA OS DADOS SE AUTORIZADO
    const [resP, resC, resM, resT, resCaixa, resU] = await Promise.all([
      window.api.listarProdutos(),
      window.api.listarClientes(),
      window.api.listarMateriais(),
      window.api.listarTags(),
      window.api.caixaStatus(),
      window.api.listarUnidades ? window.api.listarUnidades() : { sucesso: false }
    ])

    if (!resP.sucesso)
      window.api.mostrarAviso('Erro no banco de dados ao buscar Produtos: ' + resP.erro)
    if (!resM.sucesso)
      window.api.mostrarAviso('Erro no banco de dados ao buscar Materiais: ' + resM.erro)

    if (resP.sucesso) setProdutos(resP.produtos)
    if (resC.sucesso) setClientes(resC.clientes)
    if (resM.sucesso) setMateriais(resM.materiais)
    if (resT?.sucesso) setListaTags(resT.tags)
    if (resCaixa?.sucesso) setCaixaAtivo(resCaixa.caixa)
    if (resU && resU.sucesso) setUnidadesCadastradas(resU.unidades)
  }

  useEffect(() => {
    carregarDados()
    const handleKey = (e) => {
      if (aba !== 'pdv') return
      if (!showCheckout) {
        if (e.key === 'F10') {
          e.preventDefault()
          if (carrinho.length > 0) setShowCheckout(true)
        }
        if (e.key === 'Escape') setBusca('')
      } else {
        if (['1', '2', '3', '4', '5', 'Escape'].includes(e.key)) {
          e.preventDefault()
        }
        if (e.key === 'Escape') setShowCheckout(false)
        if (e.key === '1') confirmarVenda('DINHEIRO')
        if (e.key === '2') confirmarVenda('PIX')
        if (e.key === '3') confirmarVenda('CARTAO_CREDITO')
        if (e.key === '4') confirmarVenda('CARTAO_DEBITO')
        if (e.key === '5') confirmarVenda('FIADO')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [carrinho, aba, showCheckout, clienteSelecionado])

  const handleBuscaKeyDown = (e) => {
    if (e.key === 'Enter' && busca !== '') {
      if (busca.startsWith('2') && busca.length === 13) {
        const codigoBanca = busca.substring(1, 5)
        const pesoOuPreco = parseInt(busca.substring(6, 11), 10)
        const match = produtos.find((p) => p.codigoBarras === codigoBanca)
        if (match) {
          let qtdCalculada = 1
          if (match.unidadeMedida === 'KG') {
            qtdCalculada = pesoOuPreco / 1000 
          } else {
            qtdCalculada = (pesoOuPreco / 100) / match.precoVenda 
          }
          adicionarAoCarrinhoObj(match, qtdCalculada)
          return
        }
      }
      const match = produtos.find((p) => p.codigoBarras === busca)
      if (match) adicionarAoCarrinhoObj(match, null)
    }
  }

  const adicionarAoCarrinhoObj = (p, qtdPreDefinida) => {
    let qtd = qtdPreDefinida
    if (qtd === null) {
      if (p.unidadeMedida === 'KG') {
        const peso = prompt(`Digite o peso para ${p.nome} (ex: 0.500):`, '1.000')
        if (peso === null) return
        qtd = parseFloat(peso.replace(',', '.'))
        if (isNaN(qtd) || qtd <= 0) return
      } else {
        qtd = 1
      }
    }
    setCarrinho((prev) => {
      const existe = prev.find((i) => i.id === p.id)
      if (existe)
        return prev.map((i) => (i.id === p.id ? { ...i, quantidade: i.quantidade + qtd } : i))
      return [...prev, { ...p, quantidade: qtd }]
    })
    setBusca('')
  }

  const adicionarAoCarrinho = (p) => adicionarAoCarrinhoObj(p, null)

  const removerDoCarrinho = (id) => setCarrinho((c) => c.filter((i) => i.id !== id))
  const alterarQtdCarrinho = (id, delta) => setCarrinho((prev) =>
    prev.map((i) => i.id === id ? { ...i, quantidade: i.quantidade + delta } : i)
      .filter((i) => i.quantidade > 0)
  )
  const totalVenda = carrinho.reduce((acc, i) => acc + (i.precoVenda + (i.adicionaisValor || 0)) * i.quantidade, 0)

  const confirmarVenda = async (metodo) => {
    if (metodo === 'FIADO' && !clienteSelecionado) {
      window.api.mostrarAviso('Para vender na caderneta (FIADO), você precisa selecionar um cliente primeiro.')
      return
    }
    const res = await window.api.finalizarVenda({
      total: totalVenda,
      metodoPagto: metodo,
      itens: carrinho,
      clienteId: clienteSelecionado?.id
    })
    if (res.sucesso) {
      setCarrinho([])
      setBusca('')
      setShowCheckout(false)
      setClienteSelecionado(null)
      carregarDados()
      setTimeout(() => inputBuscaRef.current?.focus(), 100)
    } else {
      window.api.mostrarAviso('Erro ao finalizar venda: ' + res.erro)
    }
  }

  const verificarEAdicionarUnidade = async (novaUnidade) => {
    if (!novaUnidade) return
    const un = novaUnidade.trim().toUpperCase()
    const arr = unidadesCadastradas.split(',').map(u => u.trim().toUpperCase())
    if (!arr.includes(un)) {
      const newList = unidadesCadastradas ? `${unidadesCadastradas},${un}` : un
      setUnidadesCadastradas(newList)
      if (window.api.salvarUnidades) {
        await window.api.salvarUnidades(newList)
      }
    }
  }

  const handleSalvarMaterial = async (e) => {
    e.preventDefault()
    await verificarEAdicionarUnidade(matForm.unidadeMedida)

    const res = editandoMaterialId
      ? await window.api.editarMaterial({ ...matForm, id: editandoMaterialId })
      : await window.api.salvarMaterial(matForm)

    if (res.sucesso) {
      setEditandoMaterialId(null)
      setMatForm({ nome: '', custoPorMedida: '', unidadeMedida: '', estoqueAtual: '', calcularPacote: false, precoPacote: '', quantidadePacote: '' })
      carregarDados()
    } else {
      window.api.mostrarAviso('Erro ao salvar material: ' + res.erro)
    }
  }

  const prepararEdicaoMaterial = (m) => {
    setEditandoMaterialId(m.id)
    setMatForm({
      nome: m.nome,
      custoPorMedida: m.custoPorMedida,
      unidadeMedida: m.unidadeMedida || '',
      estoqueAtual: m.estoqueAtual
    })
  }

  const handleExcluirMaterial = async (id) => {
    const confirmou = await window.api.pedirConfirmacao(
      'Tem certeza que deseja excluir este ingrediente? Isso vai removê-lo das fichas técnicas de todos os produtos.'
    )
    if (confirmou) {
      const res = await window.api.excluirMaterial(id)
      if (res.sucesso) {
        carregarDados()
      } else {
        window.api.mostrarAviso('Atenção: ' + res.erro)
      }
    }
  }

  const adicionarMaterialAoProduto = () => {
    const mat = materiais.find((m) => m.id === Number(matSelecionado))
    if (mat && matQtd) {
      const custoAdicional = mat.custoPorMedida * parseFloat(matQtd)
      setProdForm((prev) => ({
        ...prev,
        materiaisUsados: [
          ...prev.materiaisUsados,
          {
            id: mat.id,
            nome: mat.nome,
            unidade: mat.unidadeMedida,
            qtdUsada: parseFloat(matQtd),
            custoCalculado: custoAdicional
          }
        ],
        custo: (parseFloat(prev.custo || 0) + custoAdicional).toFixed(2)
      }))
      setMatSelecionado('')
      setMatQtd('')
    }
  }

  const removerMaterialDoProduto = (indexParaRemover) => {
    setProdForm((prev) => {
      const materialRemovido = prev.materiaisUsados[indexParaRemover]
      return {
        ...prev,
        materiaisUsados: prev.materiaisUsados.filter((_, i) => i !== indexParaRemover),
        custo: Math.max(0, parseFloat(prev.custo || 0) - materialRemovido.custoCalculado).toFixed(2)
      }
    })
  }

  const handleSalvarProduto = async (e) => {
    e.preventDefault()
    await verificarEAdicionarUnidade(prodForm.unidadeMedida)
    
    const payload = {
      nome: prodForm.nome,
      codigoBarras: prodForm.barras,
      precoCusto: Number(prodForm.custo),
      precoVenda: Number(prodForm.venda),
      estoqueAtual: Number(prodForm.estoque),
      unidadeMedida: prodForm.unidadeMedida,
      isAdicional: prodForm.isAdicional,
      materiaisUsados: prodForm.materiaisUsados
    }

    try {
      const res = editandoId
        ? await window.api.editarProduto({ ...payload, id: editandoId })
        : await window.api.salvarProduto(payload)
      if (res.sucesso) {
        setEditandoId(null)
        setProdForm({
          nome: '',
          barras: '',
          custo: '',
          venda: '',
          estoque: '',
          materiaisUsados: []
        })
        carregarDados()
      } else {
        window.api.mostrarAviso('Erro ao salvar produto: ' + res.erro)
      }
    } catch (error) {
      console.error(error)
      window.api.mostrarAviso('Erro inesperado.')
    }
  }

  const prepararEdicaoProduto = (p) => {
    setEditandoId(p.id)
    setProdForm({
      nome: p.nome,
      barras: p.codigoBarras || '',
      custo: p.precoCusto,
      venda: p.precoVenda,
      estoque: p.estoqueAtual,
      unidadeMedida: p.unidadeMedida || '',
      isAdicional: p.isAdicional || false,
      materiaisUsados: (p.materiais || []).map((pm) => ({
        id: pm.material.id,
        nome: pm.material.nome,
        unidade: pm.material.unidadeMedida,
        qtdUsada: pm.quantidade,
        custoCalculado: pm.material.custoPorMedida * pm.quantidade
      }))
    })
  }

  const handleExcluirProduto = async (id) => {
    const confirmou = await window.api.pedirConfirmacao(
      'Tem certeza que deseja apagar este produto? Essa ação não pode ser desfeita.'
    )
    if (confirmou) {
      const res = await window.api.excluirProduto(id)
      if (res.sucesso) {
        carregarDados()
      } else {
        window.api.mostrarAviso('Atenção: ' + res.erro)
      }
    }
  }

  const handleSalvarCliente = async (e) => {
    e.preventDefault()
    const res = editandoClienteId
      ? await window.api.editarCliente({ ...cliForm, id: editandoClienteId })
      : await window.api.salvarCliente(cliForm)
    if (res.sucesso) {
      setEditandoClienteId(null)
      setCliForm({ nomeCompleto: '', cpf: '', telefone: '', dataNascimento: '', tags: [], metadata: '' })
      carregarDados()
    } else {
      window.api.mostrarAviso('Erro ao salvar cliente: ' + res.erro)
    }
  }

  const prepararEdicaoCliente = (c) => {
    setEditandoClienteId(c.id)
    setCliForm({
      nomeCompleto: c.nomeCompleto,
      cpf: c.cpf,
      telefone: c.telefone || '',
      dataNascimento: c.dataNascimento ? new Date(c.dataNascimento).toISOString().split('T')[0] : '',
      tags: c.tags ? c.tags.map(t => t.nome) : [],
      metadata: c.metadata || ''
    })
  }

  const handleExcluirCliente = async (id) => {
    const confirmou = await window.api.pedirConfirmacao(
      'Tem certeza que deseja apagar este cliente?'
    )
    if (confirmou) {
      const res = await window.api.excluirCliente(id)
      if (res.sucesso) {
        carregarDados()
      } else {
        window.api.mostrarAviso('Atenção: ' + res.erro)
      }
    }
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err))
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const prodFiltrados = produtos.filter(
    (p) =>
      busca !== '' &&
      (p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigoBarras === busca)
  )

  const todosMenuItems = [
    { id: 'pdv', label: 'Frente de Caixa', icon: <Icon.Cart /> },
    { id: 'produtos', label: 'Estoque Produtos', icon: <Icon.Box /> },
    { id: 'materiais', label: 'Ingredientes / Receitas', icon: <Icon.ChefHat /> },
    { id: 'clientes', label: 'Clientes (CRM)', icon: <Icon.Users /> },
    { id: 'financeiro', label: 'Financeiro', icon: <Icon.Money /> },
    { id: 'contratos', label: 'Contratos (Mensalistas)', icon: <Icon.FileText /> },
    { id: 'comandas', label: 'Comandas / Mesas', icon: <Icon.FileText /> },
    { id: 'encomendas', label: 'Encomendas de Bolos', icon: <Icon.Clock /> },
    { id: 'relatorios', label: 'Relatórios (BI)', icon: <Icon.Chart /> },
    { id: 'configuracoes', label: 'Configurações', icon: <Icon.Settings /> },
    { id: 'tutorial', label: 'Tutorial (Ajuda)', icon: <Icon.Help /> }
  ]

  const menuItems = todosMenuItems.filter(item => {
    if (!usuarioLogado) return false
    if (usuarioLogado.role === 'dono') return true
    // Funcionário vê apenas:
    return ['pdv', 'comandas', 'encomendas', 'produtos', 'tutorial'].includes(item.id)
  })

  if (licenca === 'CARREGANDO') {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)'
        }}
      >
        <h2>Carregando Sistema...</h2>
      </div>
    )
  }

  if (licenca === 'BLOQUEADO' || licenca === 'PENDENTE') {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0c',
          color: 'white'
        }}
      >
        <h1 style={{ marginBottom: '10px', color: licenca === 'BLOQUEADO' ? 'var(--red)' : 'var(--accent)' }}>
          {licenca === 'BLOQUEADO' ? 'ACESSO NEGADO' : 'ATLAS PDV'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {licenca === 'BLOQUEADO' 
            ? 'Esta cópia do sistema está vinculada a outro hardware. Insira uma nova chave.' 
            : 'Este computador ainda não está autorizado.'}
        </p>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
          Envie o código abaixo para o suporte para receber sua chave de liberação.
        </p>

        {/* 👇 AQUI ESTÁ O NOVO BOTÃO DE COPIAR */}
        <div
          style={{
            background: '#1b1b1f',
            padding: '15px 30px',
            borderRadius: '8px',
            border: '1px dashed #32363f',
            marginBottom: '30px',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>
            CÓDIGO DESTA MÁQUINA
          </div>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                fontFamily: 'monospace',
                color: '#fff'
              }}
            >
              {codigoMaquina || 'CARREGANDO...'}
            </div>
            {codigoMaquina && (
              <button
                className="btn-icon"
                title="Copiar Código"
                onClick={() => {
                  navigator.clipboard.writeText(codigoMaquina)
                  window.api.mostrarAviso('Código copiado com sucesso!')
                }}
                style={{
                  background: 'var(--accent)',
                  color: '#000',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                COPIAR
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="password"
            placeholder="Chave de Ativação"
            value={senhaLicenca}
            onChange={(e) => setSenhaLicenca(e.target.value)}
            className="input"
            style={{ 
              width: '250px', 
              margin: 0,
              backgroundColor: '#1b1b1f',
              color: '#ffffff',
              border: '1px solid #32363f'
            }}
          />
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '0 20px' }}
            onClick={async () => {
              const res = await window.api.ativarLicenca(senhaLicenca)
              if (res.sucesso) {
                setLicenca('AUTORIZADO')
                carregarDados()
              } else {
                window.api.mostrarAviso(res.erro)
              }
            }}
          >
            Ativar
          </button>
        </div>
      </div>
    )
  }

  if (!usuarioLogado) {
    return <LoginScreen onLogin={setUsuarioLogado} />
  }

  return (
    <>
    <TitleBar />
    <datalist id="unidades-list">
      {unidadesCadastradas.split(',').map(u => u.trim()).filter(Boolean).map(u => (
        <option key={u} value={u}>{u}</option>
      ))}
    </datalist>
    <div className={`atlas-root ${tema === 'claro' ? 'light-theme' : ''}`} style={{ marginTop: '32px', height: 'calc(100vh - 32px)' }}>
      <aside className={`atlas-sidebar ${menuAberto ? '' : 'fechado'}`}>
        <div className="atlas-logo">
          <div className="atlas-logo-dot" /> ATLAS
        </div>
        <nav className="nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${aba === item.id ? 'ativo' : ''}`}
              onClick={() => abrirAba(item.id)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div style={{ padding: '0 10px', marginBottom: '15px', color: 'var(--text-dim)', fontSize: '12px' }}>
            Usuário logado: <br/><strong style={{ color: 'var(--text)' }}>{usuarioLogado?.nome} ({usuarioLogado?.role})</strong>
          </div>
          <button
            className="nav-item"
            style={{ color: 'var(--red)' }}
            onClick={() => {
              setUsuarioLogado(null)
              setAba('pdv')
            }}
          >
            <Icon.X /> Sair
          </button>
        </div>
      </aside>

      <main className="atlas-main">
        <header className="topbar">
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="topbar-btn" title="Menu" onClick={() => setMenuAberto(!menuAberto)}>
              <Icon.Menu />
            </button>
            <button
              className="topbar-btn"
              title={`Mudar para tema ${tema === 'escuro' ? 'claro' : 'escuro'}`}
              onClick={() => setTema(tema === 'escuro' ? 'claro' : 'escuro')}
            >
              {tema === 'escuro' ? <Icon.Sun /> : <Icon.Moon />}
            </button>
          </div>
          <button className="topbar-btn" title="Tela Cheia" onClick={toggleFullScreen}>
            <Icon.Maximize />
          </button>
        </header>

        {/* Barra de abas com botão fechar */}
        <div className="tab-bar">
          {abasAbertas.map((idAba) => {
            const item = menuItems.find((m) => m.id === idAba)
            if (!item) return null
            return (
              <button
                key={idAba}
                className={`tab-item ${aba === idAba ? 'ativo' : ''}`}
                onClick={() => setAba(idAba)}
              >
                {item.icon} {item.label.replace('Frente de Caixa', 'PDV').replace('Assistência Técnica', 'O.S.')}
                {abasAbertas.length > 1 && (
                  <span
                    className="tab-close"
                    onClick={(e) => { e.stopPropagation(); fecharAba(idAba); }}
                  >
                    ×
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {aba === 'pdv' && !caixaAtivo && (
          <div className="pdv-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
              <h2 style={{ marginBottom: '20px', color: 'var(--accent)' }}>Caixa Fechado</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Abra o caixa informando o valor de troco inicial.</p>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const res = await window.api.abrirCaixa(valorAberturaCaixa || 0)
                if (res.sucesso) {
                  setValorAberturaCaixa('')
                  carregarDados()
                } else {
                  window.api.mostrarAviso(res.erro)
                }
              }}>
                <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px', fontSize: '12px' }}>Fundo de Troco Inicial (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="input" 
                  style={{ marginBottom: '20px', fontSize: '20px', textAlign: 'center' }} 
                  value={valorAberturaCaixa} 
                  onChange={(e) => setValorAberturaCaixa(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px' }}>ABRIR CAIXA</button>
              </form>
            </div>
          </div>
        )}

        {aba === 'pdv' && caixaAtivo && (
          <div className="pdv-layout">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Buscar Produto</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="topbar-btn" 
                    style={{ height: '32px', fontSize: '11px', gap: '5px', border: '1px solid var(--red)', color: 'var(--red)' }}
                    onClick={async () => {
                      const confirmou = await window.api.pedirConfirmacao('Deseja fechar o caixa?')
                      if (confirmou) {
                        const valorFechamento = prompt('Digite o valor final em gaveta:')
                        if (valorFechamento !== null) {
                          await window.api.fecharCaixa({ id: caixaAtivo.id, valorFechamento: valorFechamento || 0 })
                          carregarDados()
                        }
                      }
                    }}
                  >
                    <Icon.X /> Fechar Caixa
                  </button>
                  <button 
                    className="topbar-btn" 
                    style={{ height: '32px', fontSize: '11px', gap: '5px' }}
                    onClick={() => setShowModalClientesPdv(true)}
                  >
                    <Icon.Users /> {clienteSelecionado ? clienteSelecionado.nomeCompleto.split(' ')[0] : 'Selecionar Cliente'}
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="search-wrap">
                  <span className="search-icon">
                    <Icon.Search />
                  </span>
                  <input
                    ref={inputBuscaRef}
                    className="search-input"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyDown={handleBuscaKeyDown}
                    placeholder="Bipe ou digite aqui..."
                    autoFocus
                  />
                </div>
                {prodFiltrados.map((p) => (
                  <div key={p.id} className="resultado-item" onClick={() => adicionarAoCarrinho(p)}>
                    <span>{p.nome}</span>
                    <span className="mono">{fmt(p.precoVenda)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <span className="card-title">CARRINHO</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {carrinho.map((i) => (
                  <div key={i.id} className="cart-item">
                    <div>
                      <span>{i.nome}</span>
                      {i.adicionaisTexto && <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '2px' }}>{i.adicionaisTexto}</div>}
                      <button 
                        className="btn-icon" 
                        style={{ fontSize: '10px', padding: '2px 4px', marginTop: '4px', border: '1px solid var(--accent)', color: 'var(--accent)' }} 
                        onClick={() => setModalAdicionalItemPdv(i.id)}
                      >
                        + Adicional
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn-icon"
                        style={{ padding: '2px 6px', minWidth: '28px' }}
                        onClick={() => alterarQtdCarrinho(i.id, -1)}
                      >
                        <span style={{ fontSize: '14px', lineHeight: 1 }}>−</span>
                      </button>
                      <span style={{ minWidth: '18px', textAlign: 'center', fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                        {i.quantidade}
                      </span>
                      <button
                        className="btn-icon"
                        style={{ padding: '2px 6px', minWidth: '28px' }}
                        onClick={() => alterarQtdCarrinho(i.id, 1)}
                      >
                        <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
                      </button>
                      <span className="mono" style={{ minWidth: '80px', textAlign: 'right' }}>{fmt((i.precoVenda + (i.adicionaisValor || 0)) * i.quantidade)}</span>
                      <button
                        className="btn-icon"
                        onClick={() => removerDoCarrinho(i.id)}
                        style={{ borderColor: 'transparent' }}
                      >
                        <Icon.X />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '12px' }}>
                    TOTAL A PAGAR
                  </span>
                  <span className="total-value">{fmt(totalVenda)}</span>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    carrinho.length > 0
                      ? setShowCheckout(true)
                      : window.api.mostrarAviso('Carrinho vazio!')
                  }}
                >
                  FECHAR VENDA (F10)
                </button>
              </div>
            </div>

            {showCheckout && (
              <div className="modal-overlay">
                <div className="modal-box" style={{ padding: '30px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total da Venda</h2>
                    <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--accent)' }}>
                      {fmt(totalVenda)}
                    </div>
                  </div>
                  <div className="pay-grid">
                    <button className="pay-btn" onClick={() => confirmarVenda('DINHEIRO')}>
                      <span>💵 Dinheiro</span> <span className="pay-key">1</span>
                    </button>
                    <button className="pay-btn" onClick={() => confirmarVenda('PIX')}>
                      <span>⚡ Pix</span> <span className="pay-key">2</span>
                    </button>
                    <button className="pay-btn" onClick={() => confirmarVenda('CARTAO_CREDITO')}>
                      <span>💳 Crédito</span> <span className="pay-key">3</span>
                    </button>
                    <button className="pay-btn" onClick={() => confirmarVenda('CARTAO_DEBITO')}>
                      <span>💳 Débito</span> <span className="pay-key">4</span>
                    </button>
                    <button className="pay-btn" style={{ borderColor: 'var(--yellow)', color: 'var(--yellow)' }} onClick={() => confirmarVenda('FIADO')}>
                      <span>📝 Fiado / Caderneta</span> <span className="pay-key">5</span>
                    </button>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                      onClick={() => setShowCheckout(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      Cancelar (ESC)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {aba === 'materiais' && (
          <div className="dual-layout">
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>
                {editandoMaterialId ? '📝 Editar' : '📦 Novo'} Ingrediente
              </h3>
              <form onSubmit={handleSalvarMaterial}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Nome do Ingrediente
                </label>
                <input
                  className="input"
                  placeholder="Ex: Farinha de Trigo"
                  value={matForm.nome}
                  onChange={(e) => setMatForm({ ...matForm, nome: e.target.value })}
                  required
                />

                <div style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '12px', cursor: 'pointer', alignItems: 'center', color: 'var(--accent)' }}>
                  <input 
                    type="checkbox" 
                    checked={matForm.calcularPacote} 
                    onChange={(e) => setMatForm({ ...matForm, calcularPacote: e.target.checked })}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  Calcular custo a partir de fardo/pacote?
                </div>

                {matForm.calcularPacote && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', background: 'var(--surface2)', padding: '10px', borderRadius: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Preço do Fardo/Pacote R$</label>
                      <input
                        className="input"
                        type="number"
                        step="0.01"
                        value={matForm.precoPacote}
                        onChange={(e) => {
                          const p = parseFloat(e.target.value) || 0
                          const q = parseFloat(matForm.quantidadePacote) || 1
                          setMatForm({ ...matForm, precoPacote: e.target.value, custoPorMedida: (p / q).toFixed(4) })
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quantidade no Fardo</label>
                      <input
                        className="input"
                        type="number"
                        step="0.001"
                        value={matForm.quantidadePacote}
                        onChange={(e) => {
                          const q = parseFloat(e.target.value) || 1
                          const p = parseFloat(matForm.precoPacote) || 0
                          setMatForm({ ...matForm, quantidadePacote: e.target.value, custoPorMedida: (p / q).toFixed(4) })
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Custo Unitário R$ {matForm.calcularPacote && "(Calculado)"}
                    </label>
                    <input
                      className="input"
                      type="number"
                      step="0.0001"
                      value={matForm.custoPorMedida}
                      onChange={(e) => setMatForm({ ...matForm, custoPorMedida: e.target.value })}
                      required
                      readOnly={matForm.calcularPacote}
                      style={matForm.calcularPacote ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Unidade (Medida)
                    </label>
                    <select
                      className="input"
                      value={matForm.unidadeMedida}
                      onChange={(e) => setMatForm({ ...matForm, unidadeMedida: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {unidadesCadastradas.split(',').map(u => u.trim()).filter(Boolean).map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    <button 
                      className="btn-primary"
                      style={{ marginTop: '8px', padding: '10px', fontSize: '12px', background: 'var(--surface2)', color: 'var(--text)' }}
                      onClick={(e) => { e.preventDefault(); setModalNovaMedida({ aberta: true, target: 'mat' }); }}
                    >
                      + Nova Medida
                    </button>
                  </div>
                </div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Estoque Atual
                </label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={matForm.estoqueAtual}
                  onChange={(e) => setMatForm({ ...matForm, estoqueAtual: e.target.value })}
                  required
                />

                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                  {editandoMaterialId ? 'Atualizar Ingrediente' : 'Salvar Ingrediente'}
                </button>
                {editandoMaterialId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoMaterialId(null)
                      setMatForm({
                        nome: '',
                        custoPorMedida: '',
                        unidadeMedida: 'UN',
                        estoqueAtual: ''
                      })
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      width: '100%',
                      marginTop: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Estoque de Materiais</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Custo Base</th>
                      <th>Estoque</th>
                      <th style={{ textAlign: 'right' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materiais.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          Nenhum material cadastrado.
                        </td>
                      </tr>
                    ) : (
                      materiais.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 500 }}>{m.nome}</td>
                          <td className="mono" style={{ color: 'var(--text-dim)' }}>
                            {fmt(m.custoPorMedida)} / {m.unidadeMedida}
                          </td>
                          <td>
                            <span
                              className={`badge ${m.estoqueAtual < 5 ? 'badge-low' : 'badge-ok'}`}
                            >
                              {m.estoqueAtual} {m.unidadeMedida}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn-icon" onClick={() => prepararEdicaoMaterial(m)}>
                              <Icon.Edit />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => handleExcluirMaterial(m.id)}
                            >
                              <Icon.Trash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {aba === 'produtos' && (
          <div className="dual-layout">
            <div className="card" style={{ padding: '24px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>
                {editandoId ? '📝 Editar' : '➕ Novo'} Produto
              </h3>
              <div
                style={{
                  background: 'var(--surface2)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid var(--border)'
                }}
              >
                <h4 style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '10px' }}>
                  Ficha Técnica (Materiais)
                </h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <select
                    className="input"
                    style={{ margin: 0, flex: 2 }}
                    value={matSelecionado}
                    onChange={(e) => setMatSelecionado(e.target.value)}
                  >
                    <option value="">Selecione o material...</option>
                    {materiais.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({fmt(m.custoPorMedida)}/{m.unidadeMedida})
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    style={{ margin: 0, flex: 1 }}
                    placeholder="Qtd"
                    value={matQtd}
                    onChange={(e) => setMatQtd(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={adicionarMaterialAoProduto}
                    className="btn-icon"
                    style={{
                      background: 'var(--accent)',
                      color: '#000',
                      margin: 0,
                      padding: '0 12px'
                    }}
                  >
                    <Icon.Plus />
                  </button>
                </div>
                <div>
                  {prodForm.materiaisUsados.map((m, index) => (
                    <div key={index} className="tag-material">
                      <span>
                        {m.qtdUsada} {m.unidade} de <strong>{m.nome}</strong>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="mono">{fmt(m.custoCalculado)}</span>
                        <button
                          type="button"
                          onClick={() => removerMaterialDoProduto(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--red)',
                            cursor: 'pointer'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <form onSubmit={handleSalvarProduto}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Nome do Produto Final
                </label>
                <input
                  className="input"
                  value={prodForm.nome}
                  onChange={(e) => setProdForm({ ...prodForm, nome: e.target.value })}
                  required
                />
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Código de Barras
                </label>
                <input
                  className="input"
                  value={prodForm.barras}
                  onChange={(e) => setProdForm({ ...prodForm, barras: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Custo R$</label>
                    <input
                      data-testid="input-custo"
                      className="input"
                      type="number"
                      step="0.01"
                      value={prodForm.custo}
                      onChange={(e) => setProdForm({ ...prodForm, custo: e.target.value })}
                      required
                      readOnly={prodForm.materiaisUsados.length > 0}
                      style={
                        prodForm.materiaisUsados.length > 0
                          ? { color: 'var(--accent)', fontWeight: 'bold' }
                          : {}
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lucro %</label>
                    <input
                      data-testid="input-margem"
                      className="input"
                      type="number"
                      step="0.1"
                      value={
                        (prodForm.venda && prodForm.custo && Number(prodForm.custo) > 0)
                          ? (((Number(prodForm.venda) - Number(prodForm.custo)) / Number(prodForm.custo)) * 100).toFixed(1)
                          : ''
                      }
                      onChange={(e) => {
                        const margem = Number(e.target.value)
                        const custo = Number(prodForm.custo)
                        if (custo > 0) {
                          setProdForm({ ...prodForm, venda: (custo * (1 + margem / 100)).toFixed(2) })
                        }
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Venda R$</label>
                    <input
                      data-testid="input-venda"
                      className="input"
                      type="number"
                      step="0.01"
                      value={prodForm.venda}
                      onChange={(e) => setProdForm({ ...prodForm, venda: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unidade</label>
                    <select
                      className="input"
                      value={prodForm.unidadeMedida}
                      onChange={(e) => setProdForm({ ...prodForm, unidadeMedida: e.target.value })}
                      required
                    >
                      <option value="">Selecione...</option>
                      {unidadesCadastradas.split(',').map(u => u.trim()).filter(Boolean).map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>

                    <button 
                      className="btn-primary"
                      style={{ marginTop: '8px', padding: '10px', fontSize: '12px', background: 'var(--surface2)', color: 'var(--text)' }}
                      onClick={(e) => { e.preventDefault(); setModalNovaMedida({ aberta: true, target: 'prod' }); }}
                    >
                      + Nova Medida
                    </button>
                  </div>
                </div>
                <label style={{ display: 'flex', gap: '8px', fontSize: '12px', marginBottom: '12px', cursor: 'pointer', alignItems: 'center', color: 'var(--accent)' }}>
                  <input 
                    type="checkbox" 
                    checked={prodForm.isAdicional} 
                    onChange={e => setProdForm({...prodForm, isAdicional: e.target.checked})}
                  />
                  Este produto é um Adicional (Ex: Ovo extra, Queijo extra)
                </label>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Estoque Inicial do Produto Pronto
                </label>
                <input
                  className="input"
                  type="number"
                  value={prodForm.estoque}
                  onChange={(e) => setProdForm({ ...prodForm, estoque: e.target.value })}
                  required
                />
                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                  {editandoId ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
                {editandoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoId(null)
                      setProdForm({
                        nome: '',
                        barras: '',
                        custo: '',
                        venda: '',
                        estoque: '',
                        materiaisUsados: []
                      })
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      width: '100%',
                      marginTop: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">Listagem de Produtos</span>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '6px 15px', fontSize: '11px', background: 'var(--yellow)', color: '#000' }}
                  onClick={() => setShowModalFornada(true)}
                >
                  🍞 LANÇAR FORNADA
                </button>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Venda</th>
                    <th>Estoque</th>
                    <th style={{ textAlign: 'right' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.nome}
                        <br />
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                          {p.materiais?.length || 0} materiais na receita
                        </span>
                      </td>
                      <td className="mono">{fmt(p.precoVenda)}</td>
                      <td>
                        <span className={`badge ${p.estoqueAtual < 5 ? 'badge-low' : 'badge-ok'}`}>
                          {p.estoqueAtual} {p.unidadeMedida}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-icon" onClick={() => prepararEdicaoProduto(p)}>
                          <Icon.Edit />
                        </button>
                        <button className="btn-icon" onClick={() => handleExcluirProduto(p.id)}>
                          <Icon.Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === 'clientes' && (
          <div className="dual-layout">
            <div className="card" style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
              <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>
                {editandoClienteId ? '📝 Editar' : '👥 Novo'} Cliente
              </h3>
              <form onSubmit={handleSalvarCliente}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Nome Completo</label>
                <input
                  className="input"
                  value={cliForm.nomeCompleto}
                  onChange={(e) => setCliForm({ ...cliForm, nomeCompleto: e.target.value })}
                  required
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CPF</label>
                    <input
                      className="input"
                      value={cliForm.cpf}
                      onChange={(e) => setCliForm({ ...cliForm, cpf: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>WhatsApp</label>
                    <input
                      className="input"
                      value={cliForm.telefone}
                      onChange={(e) => setCliForm({ ...cliForm, telefone: e.target.value })}
                    />
                  </div>
                </div>
                
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Endereço Completo</label>
                <input
                  className="input"
                  placeholder="Rua, Número, Bairro, Cidade..."
                  value={cliForm.endereco}
                  onChange={(e) => setCliForm({ ...cliForm, endereco: e.target.value })}
                />

                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Data de Nascimento</label>
                <input
                  className="input"
                  type="date"
                  value={cliForm.dataNascimento}
                  onChange={(e) => setCliForm({ ...cliForm, dataNascimento: e.target.value })}
                />

                <div style={{ margin: '15px 0', padding: '15px', background: 'var(--accent-dim2)', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '10px', textTransform: 'uppercase' }}>Perfil do Cliente (Obrigatório/Mais Usadas)</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                    {['VAREJO', 'ATACADO', 'REENDEDOR', 'VIP', 'RECORRENTE', 'FIEL'].map(tag => {
                       const ativa = cliForm.tags.includes(tag)
                       return (
                         <button 
                           key={tag}
                           type="button" 
                           onClick={() => {
                             if (ativa) setCliForm({ ...cliForm, tags: cliForm.tags.filter(t => t !== tag) })
                             else setCliForm({ ...cliForm, tags: [...cliForm.tags, tag] })
                           }}
                           className="fin-filtro-btn"
                           style={{ 
                             padding: '10px 15px', 
                             borderColor: ativa ? 'var(--accent)' : 'var(--border)',
                             background: ativa ? 'var(--accent)' : 'transparent',
                             color: ativa ? '#000' : 'var(--text-muted)',
                             fontSize: '11px'
                           }}
                         >
                           {tag}
                         </button>
                       )
                    })}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '8px' }}>Adicionar outras tags personalizadas:</div>
                  <input 
                    className="input" 
                    style={{ margin: 0 }} 
                    placeholder="Digite e dê Enter..." 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const val = e.target.value.trim().toUpperCase()
                        if (val && !cliForm.tags.includes(val)) {
                          setCliForm({ ...cliForm, tags: [...cliForm.tags, val] })
                          e.target.value = ''
                        }
                      }
                    }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {cliForm.tags.filter(t => !['VAREJO', 'ATACADO', 'REENDEDOR', 'VIP', 'RECORRENTE', 'FIEL'].includes(t)).map(t => (
                      <span key={t} className="badge badge-ok" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {t} <span style={{ cursor: 'pointer' }} onClick={() => setCliForm({ ...cliForm, tags: cliForm.tags.filter(tag => tag !== t) })}>×</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ margin: '15px 0', padding: '15px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '11px', color: 'var(--accent)', marginBottom: '10px', textTransform: 'uppercase' }}>Observações do Cliente</h4>
                  <textarea 
                    className="input" 
                    style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Ficha de perfil, tamanhos, preferências..."
                    value={cliForm.metadata}
                    onChange={(e) => setCliForm({ ...cliForm, metadata: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                  {editandoClienteId ? 'Atualizar Cadastro' : 'Salvar Cliente'}
                </button>
                {editandoClienteId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditandoClienteId(null)
                      setCliForm({ nomeCompleto: '', cpf: '', telefone: '', endereco: '', dataNascimento: '', tags: [], metadata: '' })
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', width: '100%', marginTop: '15px', cursor: 'pointer' }}
                  >
                    Cancelar Edição
                  </button>
                )}
              </form>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
              {/* RANKING DE MELHORES CLIENTES */}
              <div className="card" style={{ border: '2px solid var(--accent)' }}>
                <div className="card-header" style={{ background: 'var(--accent-dim)' }}>
                  <span className="card-title" style={{ color: '#000' }}>🏆 Melhores Clientes (Ranking de Gasto)</span>
                </div>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Cliente</th>
                      <th>Total Comprado</th>
                      <th>Vendas</th>
                      <th>Gosta Mais de:</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingClientes.slice(0, 5).map((c, i) => (
                      <tr key={c.id}>
                        <td className="mono" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>#{i+1}</td>
                        <td style={{ fontWeight: 'bold' }}>{c.nomeCompleto}</td>
                        <td className="mono">{fmt(c.totalGasto)}</td>
                        <td>{c.qtdCompras} compras</td>
                        <td style={{ fontSize: '11px', color: 'var(--accent)' }}>{c.produtoFavorito}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-title">Base de Clientes</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{clientes.length} Total</span>
                    </div>
                  </div>
                  
                  {/* TOOLBAR DE FILTROS */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <select className="input" style={{ margin: 0 }} value={filtroTag} onChange={(e) => setFiltroTag(e.target.value)}>
                      <option value="TODAS">Todas as Tags</option>
                      {listaTags.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
                    </select>
                    <select className="input" style={{ margin: 0 }} value={filtroInatividade} onChange={(e) => setFiltroInatividade(e.target.value)}>
                      <option value="TODOS">Qualquer Atividade</option>
                      <option value="1">Inativo 1 mês</option>
                      <option value="2">Inativo 2 meses</option>
                      <option value="3">Inativo 3+ meses</option>
                      <option value="NUNCA">Nunca Compraram</option>
                    </select>
                    <select className="input" style={{ margin: 0 }} value={filtroAniversario} onChange={(e) => setFiltroAniversario(e.target.value)}>
                      <option value="TODOS">Todos Aniversários</option>
                      <option value="HOJE">Hoje 🎂</option>
                      <option value="MES">Do Mês</option>
                    </select>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Cliente / Perfil</th>
                        <th>Relacionamento</th>
                        <th>Endereço / Contato</th>
                        <th style={{ textAlign: 'right' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.filter(c => {
                        if (filtroTag !== 'TODAS' && !c.tags?.some(t => t.nome === filtroTag)) return false
                        if (c.dataNascimento) {
                          const hoje = new Date(); const niver = new Date(c.dataNascimento)
                          if (filtroAniversario === 'HOJE') { if (hoje.getUTCDate() !== niver.getUTCDate() || hoje.getUTCMonth() !== niver.getUTCMonth()) return false }
                          if (filtroAniversario === 'MES') { if (hoje.getUTCMonth() !== niver.getUTCMonth()) return false }
                        } else if (filtroAniversario !== 'TODOS') return false
                        if (filtroInatividade !== 'TODOS') {
                          if (filtroInatividade === 'NUNCA') { if (c.vendas && c.vendas.length > 0) return false }
                          else {
                            const meses = parseInt(filtroInatividade)
                            if (!c.vendas || c.vendas.length === 0) return true
                            const ultima = new Date(c.vendas[0].data)
                            const diffMeses = (new Date() - ultima) / (1000 * 60 * 60 * 24 * 30)
                            if (meses === 3) { if (diffMeses < 3) return false } else { if (diffMeses < meses) return false }
                          }
                        }
                        return true
                      }).map((c) => {
                        const hoje = new Date()
                        const niver = c.dataNascimento ? new Date(c.dataNascimento) : null
                        const ehAniversario = niver && hoje.getUTCDate() === niver.getUTCDate() && hoje.getUTCMonth() === niver.getUTCMonth()

                        return (
                          <tr key={c.id} style={ehAniversario ? { background: 'var(--accent-dim2)' } : {}}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{c.nomeCompleto} {ehAniversario && '🎂'}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.metadata || 'Sem obs'}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {c.tags?.map(t => <span key={t.id} className="badge" style={{ fontSize: '9px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>{t.nome}</span>)}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '11px' }}>{c.telefone || 'Sem tel'}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{c.endereco || 'Sem endereço'}</div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn-icon" onClick={() => prepararEdicaoCliente(c)}><Icon.Edit /></button>
                              <button className="btn-icon" onClick={() => handleExcluirCliente(c.id)}><Icon.Trash /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {aba === 'encomendas' && <Encomendas />}
        {aba === 'financeiro' && <Financeiro />}
        {aba === 'contratos' && <Contratos clientes={clientes} Icon={Icon} />}
        {aba === 'comandas' && <Comandas produtos={produtos} clientes={clientes} Icon={Icon} />}
        {aba === 'relatorios' && <Relatorios Icon={Icon} />}
        {aba === 'tutorial' && <Tutorial />}

        {aba === 'configuracoes' && (
          <div className="card" style={{ padding: '30px', maxWidth: '700px', marginBottom: '40px', flexShrink: 0 }}>
            <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon.Settings /> Configurações do Sistema
            </h2>
            
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '15px' }}>Aparência</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  className={`tipo-btn ${tema === 'escuro' ? 'ativo' : ''}`}
                  style={{ flex: 1, padding: '20px', flexDirection: 'column', gap: '10px' }}
                  onClick={() => setTema('escuro')}
                >
                  <Icon.Moon />
                  Tema Escuro
                </button>
                <button 
                  className={`tipo-btn ${tema === 'claro' ? 'ativo' : ''}`}
                  style={{ flex: 1, padding: '20px', flexDirection: 'column', gap: '10px' }}
                  onClick={() => setTema('claro')}
                >
                  <Icon.Sun />
                  Tema Claro
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '25px', marginBottom: '30px' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '15px' }}>Unidades de Medida</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Defina as unidades de medida que você mais usa (separadas por vírgula). Elas aparecerão automaticamente nos cadastros.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={unidadesCadastradas}
                  onChange={(e) => setUnidadesCadastradas(e.target.value)}
                  placeholder="Ex: KG, UN, LT, PCT, Fatias"
                />
                <button 
                  className="btn-primary" 
                  onClick={async () => {
                    if (window.api.salvarUnidades) {
                      const res = await window.api.salvarUnidades(unidadesCadastradas)
                      if (res.sucesso) window.api.mostrarAviso('Unidades salvas com sucesso!')
                      else window.api.mostrarAviso('Erro ao salvar unidades: ' + res.erro)
                    }
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '25px', paddingBottom: '25px' }}>
              <h4 style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '15px' }}>Backup do Sistema (Segurança)</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>Backup Local (Pendrive)</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px', minHeight: '36px' }}>Salva uma cópia do banco no seu computador para colocar em um pendrive.</p>
                  <button
                    className="btn-primary"
                    style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', display: 'flex', gap: '8px', padding: '10px 16px', width: '100%', justifyContent: 'center' }}
                    onClick={async () => {
                      const res = await window.api.exportarBanco()
                      if (res.sucesso) window.api.mostrarAviso('Backup local salvo com sucesso no seu computador!')
                    }}
                  >
                    <Icon.Download /> Baixar Cópia Local
                  </button>
                </div>

                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>Backup na Nuvem (Backblaze B2)</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px', minHeight: '36px' }}>Envia o banco criptografado direto para a nuvem. (Automático às 20h00)</p>
                  <button
                    className="btn-primary"
                    style={{ display: 'flex', gap: '8px', padding: '10px 16px', width: '100%', justifyContent: 'center' }}
                    onClick={async () => {
                      const res = await window.api.forceBackup()
                      if (res.sucesso) window.api.mostrarAviso(res.mensagem || 'Backup salvo na nuvem com sucesso!')
                      else window.api.mostrarAviso('Erro no backup online: ' + res.erro)
                    }}
                  >
                    <Icon.Cloud /> Enviar para Nuvem Agora
                  </button>
                </div>
              </div>
            </div>

            <UsuariosConfig Icon={Icon} />
          </div>
        )}

        {showModalClientesPdv && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ width: '500px' }}>
              <div className="card-header">
                <span className="card-title">Selecionar Cliente</span>
                <button className="btn-icon" onClick={() => setShowModalClientesPdv(false)}><Icon.X /></button>
              </div>
              <div style={{ padding: '20px' }}>
                <input 
                  className="input" 
                  placeholder="Pesquisar cliente por nome ou CPF..." 
                  autoFocus
                  onChange={(e) => {
                    const v = e.target.value.toLowerCase()
                    setBuscaCliente(v)
                  }}
                />
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <div 
                    className="resultado-item" 
                    style={{ borderStyle: 'dashed', justifyContent: 'center', color: 'var(--accent)' }}
                    onClick={() => {
                      setClienteSelecionado(null)
                      setShowModalClientesPdv(false)
                      setBuscaCliente('')
                    }}
                  >
                    <span>CONSUMIDOR NÃO IDENTIFICADO</span>
                  </div>
                  {clientes.filter(c => c.nomeCompleto.toLowerCase().includes(buscaCliente.toLowerCase()) || c.cpf.includes(buscaCliente)).map(c => (
                    <div key={c.id} className="resultado-item" onClick={() => {
                      setClienteSelecionado(c)
                      setShowModalClientesPdv(false)
                      setBuscaCliente('')
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{c.nomeCompleto}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>CPF: {c.cpf}</div>
                      </div>
                      <Icon.Check />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {showModalFornada && (
          <div className="modal-overlay" onClick={() => setShowModalFornada(false)}>
            <div className="modal-box" style={{ width: '450px' }} onClick={e => e.stopPropagation()}>
              <div className="card-header">
                <span className="card-title">Lançar Fornada (Produção)</span>
                <button className="btn-icon" onClick={() => setShowModalFornada(false)}><Icon.X /></button>
              </div>
              <form onSubmit={handleLancarFornada} style={{ padding: '24px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  Use esta função para tirar produtos do estoque de <strong>Congelados (KG)</strong> e dar entrada no <strong>Assado (UN)</strong>.
                </p>
                
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1. Produto de Origem (Massa/Ingrediente)</label>
                <select 
                  data-testid="select-origem"
                  className="input" 
                  value={fornadaForm.origemId} 
                  onChange={e => setFornadaForm({...fornadaForm, origemId: e.target.value})}
                  required
                >
                  <option value="">Selecione a origem...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoqueAtual} {p.unidadeMedida})</option>
                  ))}
                </select>

                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2. Produto Produzido (Destino)</label>
                <select 
                  data-testid="select-destino"
                  className="input" 
                  value={fornadaForm.destinoId} 
                  onChange={e => setFornadaForm({...fornadaForm, destinoId: e.target.value})}
                  required
                >
                  <option value="">Selecione o produto pronto...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.estoqueAtual} {p.unidadeMedida})</option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Qtd. Usada {fornadaForm.origemId ? `(${produtos.find(p => p.id === fornadaForm.origemId)?.unidadeMedida || ''})` : ''}
                    </label>
                    <input 
                      className="input" 
                      type="number" 
                      step="0.001" 
                      placeholder="Ex: 5.000"
                      value={fornadaForm.quantidadeUsada}
                      onChange={e => setFornadaForm({...fornadaForm, quantidadeUsada: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Qtd. Produzida {fornadaForm.destinoId ? `(${produtos.find(p => p.id === fornadaForm.destinoId)?.unidadeMedida || ''})` : ''}
                    </label>
                    <input 
                      className="input" 
                      type="number" 
                      placeholder="Ex: 100"
                      value={fornadaForm.quantidade}
                      onChange={e => setFornadaForm({...fornadaForm, quantidade: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ background: 'var(--yellow)', color: '#000' }}>
                  Confirmar Fornada
                </button>
              </form>
            </div>
          </div>
        )}

        {modalAdicionalItemPdv !== null && (
          <div className="modal-overlay" onClick={() => setModalAdicionalItemPdv(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="card-header">
                <span className="card-title">Selecione o Adicional</span>
                <button className="btn-icon" onClick={() => setModalAdicionalItemPdv(null)}><Icon.X /></button>
              </div>
              <div style={{ padding: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                {produtos.filter(p => p.isAdicional).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                    Nenhum produto marcado como 'Adicional' foi encontrado no estoque.
                  </p>
                ) : (
                  produtos.filter(p => p.isAdicional).map(p => (
                    <div 
                      key={p.id} 
                      className="resultado-item" 
                      onClick={() => handleSelectAdicional(p)}
                      style={{ marginBottom: '8px' }}
                    >
                      <span>+ {p.nome}</span>
                      <span className="mono" style={{ color: 'var(--accent)' }}>+ {fmt(p.precoVenda)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
      {modalNovaMedida.aberta && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-box" style={{ width: '320px' }}>
            <div className="card-header">
              <span className="card-title">Nova Medida</span>
              <button
                onClick={() => setModalNovaMedida({ aberta: false, target: '' })}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}
              >×</button>
            </div>
            <div style={{ padding: '24px' }}>
              <input
                className="input"
                autoFocus
                value={novaMedidaTextGlobal}
                onChange={(e) => setNovaMedidaTextGlobal(e.target.value.toUpperCase())}
                placeholder="Ex: PCT, FARDO, LATA..."
              />
              <button 
                className="btn-primary" 
                style={{ marginTop: '15px' }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (novaMedidaTextGlobal) {
                    await verificarEAdicionarUnidade(novaMedidaTextGlobal);
                    if (modalNovaMedida.target === 'mat') {
                      setMatForm({ ...matForm, unidadeMedida: novaMedidaTextGlobal });
                    } else if (modalNovaMedida.target === 'prod') {
                      setProdForm({ ...prodForm, unidadeMedida: novaMedidaTextGlobal });
                    }
                  }
                  setModalNovaMedida({ aberta: false, target: '' });
                  setNovaMedidaTextGlobal('');
                }}
              >
                Salvar Medida
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
