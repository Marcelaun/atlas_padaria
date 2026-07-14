import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // ─── CONTROLE DE JANELA ───
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),

  // ─── DIÁLOGOS NATIVOS DO WINDOWS ───
  mostrarAviso: (msg) => ipcRenderer.invoke('mostrar-aviso', msg),
  pedirConfirmacao: (msg) => ipcRenderer.invoke('pedir-confirmacao', msg),

  // ─── UNIDADES ───
  listarUnidades: () => ipcRenderer.invoke('listar-unidades'),
  salvarUnidades: (unidades) => ipcRenderer.invoke('salvar-unidades', unidades),

  // ─── CLIENTES ───
  salvarCliente: (dados) => ipcRenderer.invoke('salvar-cliente', dados),
  listarClientes: () => ipcRenderer.invoke('listar-clientes'),
  listarTags: () => ipcRenderer.invoke('listar-tags'),
  editarCliente: (dados) => ipcRenderer.invoke('editar-cliente', dados),
  excluirCliente: (id) => ipcRenderer.invoke('excluir-cliente', id),

  // 🛡️ USUÁRIOS E LOGIN 🛡️
  login: (credenciais) => ipcRenderer.invoke('login', credenciais),
  listarUsuarios: () => ipcRenderer.invoke('listar-usuarios'),
  salvarUsuario: (dados) => ipcRenderer.invoke('salvar-usuario', dados),
  excluirUsuario: (id) => ipcRenderer.invoke('excluir-usuario', id),

  // 🍞 PRODUTOS 🍞───
  salvarProduto: (dados) => ipcRenderer.invoke('salvar-produto', dados),
  listarProdutos: () => ipcRenderer.invoke('listar-produtos'),
  editarProduto: (dados) => ipcRenderer.invoke('editar-produto', dados),
  excluirProduto: (id) => ipcRenderer.invoke('excluir-produto', id),

  // ─── MATERIAIS ───
  salvarMaterial: (dados) => ipcRenderer.invoke('salvar-material', dados),
  listarMateriais: () => ipcRenderer.invoke('listar-materiais'),
  editarMaterial: (dados) => ipcRenderer.invoke('editar-material', dados),
  excluirMaterial: (id) => ipcRenderer.invoke('excluir-material', id),

  // ─── VENDAS / PDV ───
  finalizarVenda: (dados) => ipcRenderer.invoke('finalizar-venda', dados),

  // ─── FINANCEIRO ───
  salvarLancamento: (dados) => ipcRenderer.invoke('salvar-lancamento', dados),
  listarLancamentos: () => ipcRenderer.invoke('listar-lancamentos'),
  marcarPago: (id) => ipcRenderer.invoke('marcar-pago', { id }),
  excluirLancamento: (id) => ipcRenderer.invoke('excluir-lancamento', { id }),
  resumoFinanceiro: () => ipcRenderer.invoke('resumo-financeiro'),

  // ─── UTILITÁRIOS / BACKUP ───
  exportarBanco: () => ipcRenderer.invoke('exportar-banco'), // 👈 NOVO AQUI
  forceBackup: () => ipcRenderer.invoke('force-backup'),
  abrirNoNavegador: (html) => ipcRenderer.invoke('abrir-no-navegador', html),
  // ─── ENCOMENDAS (PADARIA) ───
  salvarEncomenda: (dados) => ipcRenderer.invoke('salvar-encomenda', dados),
  listarEncomendas: () => ipcRenderer.invoke('listar-encomendas'),
  buscarEncomendaPorId: (id) => ipcRenderer.invoke('buscar-encomenda-por-id', id),
  editarEncomenda: (dados) => ipcRenderer.invoke('editar-encomenda', dados),
  atualizarStatusEncomenda: (id, status) => ipcRenderer.invoke('atualizar-status-encomenda', { id, status }),
  excluirEncomenda: (id) => ipcRenderer.invoke('excluir-encomenda', id),

  // ─── COMANDAS (CONSUMO LOCAL) ───
  abrirComanda: (numero) => ipcRenderer.invoke('abrir-comanda', numero),
  listarComandas: () => ipcRenderer.invoke('listar-comandas'),
  adicionarItemComanda: (comandaId, vendaDados) => ipcRenderer.invoke('adicionar-item-comanda', { comandaId, vendaDados }),
  fecharComanda: (comandaId, metodoPagto) => ipcRenderer.invoke('fechar-comanda', { comandaId, metodoPagto }),

  // ─── PRODUÇÃO E CONTRATOS ───
  lancarFornada: (dados) => ipcRenderer.invoke('lancar-fornada', dados),
  salvarContrato: (dados) => ipcRenderer.invoke('salvar-contrato', dados),
  listarContratos: (clienteId) => ipcRenderer.invoke('listar-contratos', clienteId),

  // ─── SEGURANÇA E LICENÇA ───
  verificarLicenca: () => ipcRenderer.invoke('verificar-licenca'),
  ativarLicenca: (senha) => ipcRenderer.invoke('ativar-licenca', senha),

  // ─── CAIXA ───
  caixaStatus: () => ipcRenderer.invoke('caixa-status'),
  abrirCaixa: (valorInicial) => ipcRenderer.invoke('abrir-caixa', valorInicial),
  fecharCaixa: (dados) => ipcRenderer.invoke('fechar-caixa', dados),
  movimentarCaixa: (dados) => ipcRenderer.invoke('movimentar-caixa', dados),

  // ─── AUTO UPDATER ───
  onUpdateAvailable: (callback) => ipcRenderer.on('updater:update-available', (_, info) => callback(info)),
  onDownloadProgress: (callback) => ipcRenderer.on('updater:download-progress', (_, progressObj) => callback(progressObj)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('updater:update-downloaded', (_, info) => callback(info)),
  instalarAtualizacao: () => ipcRenderer.invoke('instalar-atualizacao')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
