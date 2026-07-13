import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('Padaria Tio Irineu - App Principal', () => {
  beforeEach(() => {
    if (window.resetCaixaMock) window.resetCaixaMock()
  })

  it('deve renderizar a tela inicial com abas', async () => {
    render(<App />)
    expect(await screen.findByText(/Caixa Fechado/i)).toBeInTheDocument()
  })

  it('deve calcular a Margem de Lucro dinamicamente no cadastro', async () => {
    render(<App />)
    // Esperar o app carregar
    expect(await screen.findByText(/Caixa Fechado/i)).toBeInTheDocument()
    
    // Mudar para a aba de Produtos
    const navButtons = await screen.findAllByRole('button')
    const btnProdutos = navButtons.find(b => b.textContent.includes('Produtos'))
    fireEvent.click(btnProdutos)
    
    // Clicar em "Novo Produto"
    fireEvent.click(await screen.findByText(/Novo Produto/i))
    
    // Preencher Custo (10) e Margem (50)
    const custoInput = await screen.findByTestId('input-custo')
    const margemInput = await screen.findByTestId('input-margem')

    // Testar cenário
    fireEvent.change(custoInput, { target: { value: '10' } })
    fireEvent.change(margemInput, { target: { value: '50' } })

    // O preço de venda deve ter ido para 15 automaticamente
    const vendaInput = await screen.findByTestId('input-venda')
    expect(vendaInput.value).toBe('15.00')
  })

  it('deve permitir adicionar itens adicionais no carrinho', async () => {
    render(<App />)
    expect(await screen.findByText(/Caixa Fechado/i)).toBeInTheDocument()
    const caixaInput = await screen.findByRole('spinbutton')
    fireEvent.change(caixaInput, { target: { value: '100' } })
    fireEvent.click(screen.getByText('ABRIR CAIXA'))

    const searchInput = await screen.findByPlaceholderText(/Bipe/i, {}, { timeout: 3000 })
    fireEvent.change(searchInput, { target: { value: 'Pão' } })

    expect(await screen.findByText(/Pão com Ovo/i, {}, { timeout: 3000 })).toBeInTheDocument()

    fireEvent.click(screen.getByText(/Pão com Ovo/i))
    
    const btnAdicional = await screen.findByText(/\+ Adicional/i)
    fireEvent.click(btnAdicional)

    expect(await screen.findByText(/\+ Presunto/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/\+ Presunto/i))
    
    // Check if total is formatted correctly
    const els = await screen.findAllByText(/7,00/)
    expect(els.length).toBeGreaterThan(0)
  })

  it('deve chamar o backend ao confirmar Fornada', async () => {
    const fornadaSpy = vi.spyOn(window.api, 'lancarFornada')
    
    render(<App />)
    expect(await screen.findByText(/Caixa Fechado/i)).toBeInTheDocument()
    
    const navButtons = await screen.findAllByRole('button')
    const btnProdutos = navButtons.find(b => b.textContent.includes('Produtos'))
    fireEvent.click(await screen.findByText(/Estoque Produtos/i))
    
    // Garantir que os produtos carregaram na tabela antes de prosseguir
    await screen.findByText('Massa', {}, { timeout: 3000 })
    await screen.findByText('Pão Assado', {}, { timeout: 3000 })

    fireEvent.click(await screen.findByText(/LANÇAR FORNADA/i))
    
    const origemSelect = await screen.findByTestId('select-origem')
    const destinoSelect = await screen.findByTestId('select-destino')
    
    // Esperar produtos carregarem no select
    await waitFor(() => {
      expect(origemSelect.options.length).toBeGreaterThan(1)
    }, { timeout: 3000 })
    
    fireEvent.change(origemSelect, { target: { value: 'id_massa' } })
    fireEvent.change(destinoSelect, { target: { value: 'id_pao_assado' } })

    const qtdUsada = await screen.findByPlaceholderText('Ex: 5.000')
    const qtdProduzida = await screen.findByPlaceholderText('Ex: 100')
    
    fireEvent.change(qtdUsada, { target: { value: '2' } })
    fireEvent.change(qtdProduzida, { target: { value: '50' } })

    const btnSubmit = screen.getByText('Confirmar Fornada')
    fireEvent.submit(btnSubmit.closest('form'))

    await waitFor(() => {
      expect(fornadaSpy).toHaveBeenCalledWith(expect.objectContaining({
        origemId: 'id_massa',
        destinoId: 'id_pao_assado',
        quantidadeUsada: '2',
        quantidade: '50'
      }))
    })
  })
})
