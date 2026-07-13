import '@testing-library/jest-dom'

let caixaAberta = false
window.resetCaixaMock = () => { caixaAberta = false }

// Mocking do window.api para que os testes do React não quebrem ao tentar chamar o back-end do Electron
window.api = {
  mostrarAviso: (msg) => console.log('Mock aviso:', msg),
  listarProdutos: async () => ({
    sucesso: true,
    produtos: [
      {
        id: '1',
        nome: 'Pão com Ovo',
        precoCusto: 2.0,
        precoVenda: 5.0,
        unidadeMedida: 'UN',
        isAdicional: false,
        estoqueAtual: 10
      },
      {
        id: '2',
        nome: 'Presunto',
        precoCusto: 1.0,
        precoVenda: 2.0,
        unidadeMedida: 'UN',
        isAdicional: true,
        estoqueAtual: 10
      },
      {
        id: 'id_massa',
        nome: 'Massa',
        precoCusto: 2.0,
        precoVenda: 5.0,
        unidadeMedida: 'KG',
        isAdicional: false,
        estoqueAtual: 10
      },
      {
        id: 'id_pao_assado',
        nome: 'Pão Assado',
        precoCusto: 1.0,
        precoVenda: 2.0,
        unidadeMedida: 'UN',
        isAdicional: false,
        estoqueAtual: 0
      }
    ]
  }),
  listarCategorias: async () => ({ sucesso: true, categorias: [] }),
  listarClientes: async () => ({ sucesso: true, clientes: [] }),
  listarMateriais: async () => ({ sucesso: true, materiais: [] }),
  listarTags: async () => ({ sucesso: true, tags: [] }),
  caixaStatus: async () => ({ sucesso: true, caixa: caixaAberta ? { status: 'ABERTO' } : null }),
  verificarLicenca: async () => ({ status: 'AUTORIZADO', codigo: 'ABC-123' }),
  lancarFornada: async () => ({ sucesso: true }),
  abrirCaixa: async () => {
    caixaAberta = true
    return { sucesso: true }
  }
  // Você pode adicionar mais mocks conforme for testando outras funcionalidades!
}
