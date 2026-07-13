import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import crypto from 'crypto'
import { execSync } from 'child_process'
import cron from 'node-cron'
import archiver from 'archiver'
import dns from 'dns'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { autoUpdater } from 'electron-updater'

import { PrismaClient } from '@prisma/client'

// ─── MONITORAMENTO DE ERROS VIA WEBHOOK (DISCORD/TELEGRAM) ───────
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1526339387007439028/RSmXBYFRMNQWUgo9KYCY-wCqQhoo71lZSimH9unow_jI9teRKkPdOkvMUAjJBCCj5HtM' // <-- COLOQUE SUA URL DO WEBHOOK DO DISCORD AQUI

function reportarErroGlobal(erro, contexto) {
  console.error(`[${contexto}]`, erro)
  if (!WEBHOOK_URL) return

  const env = is.dev ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'
  const os = require('os')
  const machine = os.hostname()

  const payload = {
    content: `🚨 **ERRO NO ATLAS PDV** 🚨`,
    embeds: [{
      title: `Erro em ${env}`,
      color: 16711680, // Vermelho
      fields: [
        { name: 'Máquina', value: machine, inline: true },
        { name: 'Contexto', value: contexto, inline: true },
        { name: 'Mensagem', value: erro.message || String(erro) }
      ],
      description: `\`\`\`javascript\n${erro.stack ? erro.stack.substring(0, 1000) : 'Sem stack trace'}\n\`\`\``,
      timestamp: new Date().toISOString()
    }]
  }

  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error('Falha ao enviar erro pro webhook:', err))
}

process.on('uncaughtException', (err) => reportarErroGlobal(err, 'uncaughtException'))
process.on('unhandledRejection', (reason) => reportarErroGlobal(reason, 'unhandledRejection'))
// ─────────────────────────────────────────────────────────────────

// ─── A MÁGICA DA PERSISTÊNCIA DO BANCO DE DADOS ─────────────────
app.setPath('userData', join(app.getPath('appData'), 'AtlasPDV_Pro'))

const userDataPath = app.getPath('userData')
const dbPath = join(userDataPath, 'atlas.db')

const originalDbPath = is.dev
  ? join(__dirname, '../../prisma/dev.db')
  : join(process.resourcesPath, 'prisma/dev.db')

if (!fs.existsSync(dbPath)) {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }
  fs.copyFileSync(originalDbPath, dbPath)
}

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } }
})
// ─────────────────────────────────────────────────────────────────

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url === 'about:blank') return { action: 'allow' }
    if (details.url.startsWith('http://') || details.url.startsWith('https://')) {
      shell.openExternal(details.url)
    }
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ─── CONTROLE DE JANELA ─────────────────────────────────────────
  ipcMain.handle('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.handle('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) win.unmaximize()
      else win.maximize()
    }
  })

  ipcMain.handle('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  // ─── DIÁLOGOS NATIVOS ───────────────────────────────────────────
  ipcMain.handle('mostrar-aviso', async (event, msg) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    await dialog.showMessageBox(win, { type: 'warning', title: 'Atenção', message: msg })
    return true
  })

  ipcMain.handle('pedir-confirmacao', async (event, msg) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const { response } = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['Cancelar', 'Sim, apagar'],
      defaultId: 1,
      cancelId: 0,
      title: 'Confirmação',
      message: msg
    })
    return response === 1
  })

  // ─── SISTEMA DE LICENÇA (HARDWARE ID ÚNICO) ─────────────────────
  const getMachineId = () => {
    try {
      if (process.platform === 'win32') {
        const uuid = execSync('wmic csproduct get uuid').toString().replace('UUID', '').trim()
        // Pega os 8 primeiros caracteres do ID da máquina para ficar fácil de ler
        return uuid.substring(0, 8).toUpperCase()
      }
      return 'DEV-TEST'
    } catch (e) {
      return 'ERRO-ID'
    }
  }

  // A fórmula mágica secreta: Mistura o ID da máquina com sua palavra chave
  const gerarChaveSecreta = (machineId) => {
    const hash = crypto
      .createHash('md5')
      .update(machineId + 'ATLAS_SECRETO_2026')
      .digest('hex')
    return hash.substring(0, 6).toUpperCase() // Retorna uma chave de 6 dígitos
  }

  ipcMain.handle('verificar-licenca', async () => {
    try {
      const config = await prisma.configuracao.findUnique({ where: { id: 1 } })
      const currentId = getMachineId()

      // Se não tem máquina cadastrada, pede a chave
      if (!config || !config.machineId) return { status: 'PENDENTE', codigo: currentId }

      // 👇 AUTO-MIGRAÇÃO: Se o código salvo for o "gigante" da versão antiga, a gente apaga ele silenciosamente e pede a nova chave!
      if (config.machineId.length > 10) {
        await prisma.configuracao.update({ where: { id: 1 }, data: { machineId: null } })
        return { status: 'PENDENTE', codigo: currentId }
      }

      if (config.machineId === currentId) {
        return { status: 'AUTORIZADO' }
      } else {
        return { status: 'BLOQUEADO', codigo: currentId }
      }
    } catch (erro) {
      return { status: 'ERRO' }
    }
  })

  ipcMain.handle('ativar-licenca', async (_, senhaDigitada) => {
    const currentId = getMachineId()
    const chaveCorreta = gerarChaveSecreta(currentId)

    // Confere se a chave que o cliente digitou bate com a gerada pelo cálculo
    if (senhaDigitada.trim().toUpperCase() === chaveCorreta) {
      await prisma.configuracao.upsert({
        where: { id: 1 },
        update: { machineId: currentId },
        create: { id: 1, machineId: currentId }
      })
      return { sucesso: true }
    }
    return { sucesso: false, erro: 'Chave de Liberação inválida para esta máquina!' }
  })

  // ─── UNIDADES DE MEDIDA ─────────────────────────────────────────
  ipcMain.handle('listar-unidades', async () => {
    try {
      let config = await prisma.configuracao.findUnique({ where: { id: 1 } })
      if (!config) {
        config = await prisma.configuracao.create({ data: { id: 1 } })
      }
      return { sucesso: true, unidades: config.unidadesMedida || "KG,UN,G,LT,ML,CX,PCT,Fatias" }
    } catch (error) {
      return { sucesso: false, erro: error.message }
    }
  })

  ipcMain.handle('salvar-unidades', async (_, unidades) => {
    try {
      await prisma.configuracao.upsert({
        where: { id: 1 },
        update: { unidadesMedida: unidades },
        create: { id: 1, unidadesMedida: unidades }
      })
      return { sucesso: true }
    } catch (error) {
      return { sucesso: false, erro: error.message }
    }
  })

  // ─── MATERIAIS ──────────────────────────────────────────────────
  ipcMain.handle('salvar-material', async (_, dados) => {
    try {
      const material = await prisma.material.create({
        data: {
          nome: dados.nome,
          custoPorMedida: parseFloat(dados.custoPorMedida),
          unidadeMedida: dados.unidadeMedida,
          estoqueAtual: parseFloat(dados.estoqueAtual) || 0
        }
      })
      return { sucesso: true, material }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-materiais', async () => {
    try {
      return {
        sucesso: true,
        materiais: await prisma.material.findMany({ orderBy: { nome: 'asc' } })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── EXPORTAR BANCO DE DADOS (DB ou JSON) ───────────────────────
  ipcMain.handle('exportar-banco', async (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)

      // Abre a janela do Windows com as duas opções de formato
      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Fazer Backup do Sistema',
        defaultPath: `Backup_AtlasPDV_${new Date().toISOString().split('T')[0]}`,
        filters: [
          { name: 'Banco de Dados SQLite', extensions: ['db'] },
          { name: 'Arquivo JSON (Legível)', extensions: ['json'] }
        ]
      })

      if (canceled || !filePath) return { sucesso: false, cancelado: true }

      // Se o cliente escolheu salvar como .json
      if (filePath.endsWith('.json')) {
        // O Prisma puxa absolutamente tudo do banco
        const config = await prisma.configuracao.findUnique({ where: { id: 1 } })
        const clientes = await prisma.cliente.findMany()
        const materiais = await prisma.material.findMany()
        const produtos = await prisma.produto.findMany({
          include: { materiais: { include: { material: true } } }
        })
        const vendas = await prisma.venda.findMany({
          include: { itens: true }
        })
        const lancamentos = await prisma.lancamento.findMany()

        // Montamos um pacotão com todos os dados organizados
        const backupCompleto = {
          dataExportacao: new Date().toISOString(),
          configuracoes: config,
          baseClientes: clientes,
          estoqueMateriais: materiais,
          estoqueProdutos: produtos,
          historicoVendas: vendas,
          financeiro: lancamentos
        }

        // Escreve o pacotão no arquivo JSON, formatado bonitinho (com espaços)
        fs.writeFileSync(filePath, JSON.stringify(backupCompleto, null, 2))
      }
      // Se o cliente escolheu salvar como .db (padrão)
      else {
        fs.copyFileSync(dbPath, filePath)
      }

      return { sucesso: true, caminho: filePath }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('editar-material', async (_, dados) => {
    try {
      const material = await prisma.material.update({
        where: { id: dados.id },
        data: {
          nome: dados.nome,
          custoPorMedida: parseFloat(dados.custoPorMedida),
          unidadeMedida: dados.unidadeMedida,
          estoqueAtual: parseFloat(dados.estoqueAtual)
        }
      })
      return { sucesso: true, material }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── PRODUÇÃO / FORNADA (PADARIA) ──────────────────────────────
  ipcMain.handle('lancar-fornada', async (_, dados) => {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        // 1. Cria o registro da produção
        const prod = await tx.producao.create({
          data: {
            produtoOrigemId: dados.origemId,
            produtoDestinoId: dados.destinoId,
            quantidade: parseFloat(dados.quantidade),
            perda: parseFloat(dados.perda || 0)
          }
        })

        // 2. Tira do estoque de origem (Ex: Congelado em KG)
        // Cálculo: quantidade * pesoUnitario (se houver ficha técnica) ou direto
        await tx.produto.update({
          where: { id: dados.origemId },
          data: { estoqueAtual: { decrement: parseFloat(dados.quantidadeUsada) } }
        })

        // 3. Adiciona no estoque de destino (Ex: Pão Assado em UN)
        await tx.produto.update({
          where: { id: dados.destinoId },
          data: { estoqueAtual: { increment: parseFloat(dados.quantidade) } }
        })

        return prod
      })
      return { sucesso: true, producao: resultado }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── CONTRATOS (MENSALISTAS) ────────────────────────────────────
  ipcMain.handle('salvar-contrato', async (_, dados) => {
    try {
      const contrato = await prisma.contrato.create({
        data: {
          clienteId: dados.clienteId,
          titulo: dados.titulo,
          valorMensal: parseFloat(dados.valorMensal),
          diaVencimento: parseInt(dados.diaVencimento) || 10,
          status: 'ATIVO'
        }
      })
      return { sucesso: true, contrato }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-contratos', async (_, clienteId) => {
    try {
      const where = clienteId ? { clienteId: parseInt(clienteId) } : {}
      const contratos = await prisma.contrato.findMany({ 
        where,
        include: { cliente: true }
      })
      return { sucesso: true, contratos }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── PRODUTOS E FICHA TÉCNICA ───────────────────────────────────
  ipcMain.handle('salvar-produto', async (_, dados) => {
    try {
      const produto = await prisma.produto.create({
        data: {
          nome: dados.nome,
          codigoBarras: dados.codigoBarras || null,
          precoCusto: parseFloat(dados.precoCusto),
          precoVenda: parseFloat(dados.precoVenda),
          estoqueAtual: parseFloat(dados.estoqueAtual) || 0,
          unidadeMedida: dados.unidadeMedida || 'UN',
          isAdicional: dados.isAdicional || false,
          materiais: {
            create:
              dados.materiaisUsados?.map((m) => ({
                materialId: m.id,
                quantidade: parseFloat(m.qtdUsada)
              })) || []
          }
        }
      })
      return { sucesso: true, produto }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('editar-produto', async (_, dados) => {
    try {
      const produto = await prisma.$transaction(async (tx) => {
        await tx.produtoMaterial.deleteMany({ where: { produtoId: dados.id } })

        return await tx.produto.update({
          where: { id: dados.id },
          data: {
            nome: dados.nome,
            codigoBarras: dados.codigoBarras || null,
            precoCusto: parseFloat(dados.precoCusto),
            precoVenda: parseFloat(dados.precoVenda),
            estoqueAtual: parseFloat(dados.estoqueAtual),
            unidadeMedida: dados.unidadeMedida || 'UN',
            isAdicional: dados.isAdicional || false,
            materiais: {
              create:
                dados.materiaisUsados?.map((m) => ({
                  materialId: m.id,
                  quantidade: parseFloat(m.qtdUsada)
                })) || []
            }
          }
        })
      })
      return { sucesso: true, produto }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // 🛡️ USUÁRIOS E LOGIN 🛡️
  ipcMain.handle('login', async (_, { nome, senha }) => {
    try {
      let count = await prisma.usuario.count()
      if (count === 0) {
        await prisma.usuario.create({
          data: { nome: 'admin', senha: 'admin', role: 'dono' }
        })
      }
      
      const usuario = await prisma.usuario.findUnique({ where: { nome } })
      if (!usuario) return { sucesso: false, erro: 'Usuário não encontrado.' }
      if (usuario.senha !== senha) return { sucesso: false, erro: 'Senha incorreta.' }
      
      return { sucesso: true, usuario }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-usuarios', async () => {
    try {
      return {
        sucesso: true,
        usuarios: await prisma.usuario.findMany({ orderBy: { id: 'asc' } })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('salvar-usuario', async (_, dados) => {
    try {
      if (dados.id) {
        await prisma.usuario.update({
          where: { id: dados.id },
          data: { nome: dados.nome, senha: dados.senha, role: dados.role }
        })
      } else {
        await prisma.usuario.create({
          data: { nome: dados.nome, senha: dados.senha, role: dados.role }
        })
      }
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('excluir-usuario', async (_, id) => {
    try {
      await prisma.usuario.delete({ where: { id } })
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-produtos', async () => {
    try {
      return {
        sucesso: true,
        produtos: await prisma.produto.findMany({
          orderBy: { id: 'desc' },
          include: { materiais: { include: { material: true } } }
        })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('excluir-produto', async (_, id) => {
    try {
      const temVenda = await prisma.itemVenda.findFirst({ where: { produtoId: id } })
      if (temVenda) {
        return {
          sucesso: false,
          erro: 'Este produto já possui vendas registradas. Ele não pode ser apagado para não corromper o histórico do caixa.'
        }
      }
      await prisma.produtoMaterial.deleteMany({ where: { produtoId: id } })
      await prisma.movimentacaoEstoque.deleteMany({ where: { produtoId: id } })
      await prisma.produto.delete({ where: { id } })
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── CLIENTES ─────────────────────────────────────────────────────
  ipcMain.handle('salvar-cliente', async (_, dados) => {
    try {
      const cliente = await prisma.cliente.create({
        data: {
          nomeCompleto: dados.nomeCompleto,
          cpf: dados.cpf,
          telefone: dados.telefone || null,
          dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
          metadata: dados.metadata || null,
          endereco: dados.endereco || null, // Novo campo
          tags: {
            connectOrCreate: (dados.tags || []).map(tag => ({
              where: { nome: tag },
              create: { nome: tag }
            }))
          }
        }
      })
      return { sucesso: true, cliente }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('editar-cliente', async (_, dados) => {
    try {
      const cliente = await prisma.cliente.update({
        where: { id: dados.id },
        data: {
          nomeCompleto: dados.nomeCompleto,
          cpf: dados.cpf,
          telefone: dados.telefone || null,
          dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
          metadata: dados.metadata || null,
          endereco: dados.endereco || null, // Novo campo
          tags: {
            set: [], 
            connectOrCreate: (dados.tags || []).map(tag => ({
              where: { nome: tag },
              create: { nome: tag }
            }))
          }
        }
      })
      return { sucesso: true, cliente }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-clientes', async () => {
    try {
      return {
        sucesso: true,
        clientes: await prisma.cliente.findMany({ 
          orderBy: { criadoEm: 'desc' },
          include: { 
            tags: true,
            vendas: {
              include: {
                itens: {
                  include: { produto: true }
                }
              }
            }
          }
        })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-tags', async () => {
    try {
      const tags = await prisma.tag.findMany({ 
        orderBy: { nome: 'asc' },
        include: {
          _count: {
            select: { clientes: true }
          }
        }
      })
      return { sucesso: true, tags }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('excluir-tag', async (_, id) => {
    try {
      await prisma.tag.delete({ where: { id } })
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('renomear-tag', async (_, { id, novoNome }) => {
    try {
      await prisma.tag.update({ 
        where: { id }, 
        data: { nome: novoNome.toUpperCase() } 
      })
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('excluir-cliente', async (_, id) => {
    try {
      await prisma.venda.updateMany({ where: { clienteId: id }, data: { clienteId: null } })
      await prisma.cliente.delete({ where: { id } })
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── PDV / VENDAS ─────────────────────────────────────────────────
  ipcMain.handle('finalizar-venda', async (_, dadosVenda) => {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const caixaAberto = await tx.sessaoCaixa.findFirst({ where: { status: 'ABERTA' } })

        const venda = await tx.venda.create({
          data: {
            total: dadosVenda.total,
            metodoPagto: dadosVenda.metodoPagto,
            clienteId: dadosVenda.clienteId || null,
            sessaoCaixaId: caixaAberto ? caixaAberto.id : null,
            itens: {
              create: dadosVenda.itens.map((item) => ({
                produtoId: item.id,
                quantidade: item.quantidade,
                precoUnitario: item.precoVenda + (item.adicionaisValor || 0),
                adicionais: item.adicionaisTexto || null
              }))
            }
          }
        })
        for (const item of dadosVenda.itens) {
          await tx.produto.update({
            where: { id: item.id },
            data: { estoqueAtual: { decrement: item.quantidade } }
          })
        }

        if (dadosVenda.metodoPagto === 'FIADO') {
          await tx.lancamento.create({
            data: {
              tipo: 'ENTRADA',
              descricao: `Venda FIADO #${venda.id}`,
              valor: dadosVenda.total,
              pago: false,
              clienteId: dadosVenda.clienteId || null,
              sessaoCaixaId: caixaAberto ? caixaAberto.id : null
            }
          })
        } else {
          await tx.lancamento.create({
            data: {
              tipo: 'ENTRADA',
              descricao: `Venda #${venda.id} — ${dadosVenda.metodoPagto}`,
              valor: dadosVenda.total,
              pago: true,
              sessaoCaixaId: caixaAberto ? caixaAberto.id : null
            }
          })
        }
        return venda
      })
      return { sucesso: true, venda: resultado }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── CAIXA ────────────────────────────────────────────────────────
  ipcMain.handle('caixa-status', async () => {
    try {
      const caixa = await prisma.sessaoCaixa.findFirst({
        where: { status: 'ABERTA' },
        include: { lancamentos: true, vendas: true }
      })
      return { sucesso: true, caixa }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('abrir-caixa', async (_, valorInicial) => {
    try {
      const caixa = await prisma.sessaoCaixa.create({
        data: {
          valorAbertura: parseFloat(valorInicial),
          status: 'ABERTA'
        }
      })
      return { sucesso: true, caixa }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('fechar-caixa', async (_, dados) => {
    try {
      const caixa = await prisma.sessaoCaixa.update({
        where: { id: dados.id },
        data: {
          status: 'FECHADA',
          dataFechamento: new Date(),
          valorFechamento: parseFloat(dados.valorFechamento)
        }
      })
      return { sucesso: true, caixa }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('movimentar-caixa', async (_, dados) => {
    try {
      const caixaAberto = await prisma.sessaoCaixa.findFirst({ where: { status: 'ABERTA' } })
      if (!caixaAberto) throw new Error("Nenhum caixa aberto para movimentar")
        
      const lancamento = await prisma.lancamento.create({
        data: {
          tipo: dados.tipo,
          descricao: dados.descricao,
          valor: parseFloat(dados.valor),
          pago: true,
          sessaoCaixaId: caixaAberto.id
        }
      })
      return { sucesso: true, lancamento }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── FINANCEIRO ───────────────────────────────────────────────────
  ipcMain.handle('salvar-lancamento', async (_, dados) => {
    try {
      return {
        sucesso: true,
        lancamento: await prisma.lancamento.create({
          data: {
            tipo: dados.tipo,
            descricao: dados.descricao,
            valor: parseFloat(dados.valor),
            vencimento: dados.vencimento ? new Date(dados.vencimento) : null,
            pago: dados.pago ?? false
          }
        })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-lancamentos', async () => {
    try {
      return {
        sucesso: true,
        lancamentos: await prisma.lancamento.findMany({ orderBy: { criadoEm: 'desc' } })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('marcar-pago', async (_, { id }) => {
    try {
      return {
        sucesso: true,
        lancamento: await prisma.lancamento.update({ where: { id }, data: { pago: true } })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('excluir-lancamento', async (_, { id }) => {
    try {
      await prisma.lancamento.delete({ where: { id } })
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('resumo-financeiro', async () => {
    try {
      const lancamentos = await prisma.lancamento.findMany()
      const entradas = lancamentos
        .filter((l) => l.tipo === 'ENTRADA' && l.pago)
        .reduce((acc, l) => acc + l.valor, 0)
      const saidas = lancamentos
        .filter((l) => l.tipo === 'SAIDA' && l.pago)
        .reduce((acc, l) => acc + l.valor, 0)
      const pendentes = lancamentos.filter((l) => !l.pago).reduce((acc, l) => acc + l.valor, 0)
      return { sucesso: true, entradas, saidas, saldo: entradas - saidas, pendentes }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── ENCOMENDAS (PADARIA) ─────────────────────────────────────────
  ipcMain.handle('salvar-encomenda', async (_, dados) => {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const ultimo = await tx.encomenda.findFirst({
          orderBy: { numero: 'desc' },
          select: { numero: true }
        })
        const proximoNumero = ultimo ? ultimo.numero + 1 : 1

        return await tx.encomenda.create({
          data: {
            numero: proximoNumero,
            clienteNome: dados.clienteNome,
            clienteCpf: dados.clienteCpf,
            clienteWhatsapp: dados.clienteWhatsapp,
            descricao: dados.descricao,
            valorTotal: parseFloat(dados.valorTotal),
            valorSinal: parseFloat(dados.valorSinal || 0),
            dataEntrega: new Date(dados.dataEntrega),
            status: 'PENDENTE'
          }
        })
      })
      return { sucesso: true, encomenda: resultado }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('listar-encomendas', async () => {
    try {
      return {
        sucesso: true,
        encomendas: await prisma.encomenda.findMany({ orderBy: { dataEntrega: 'asc' } })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('atualizar-status-encomenda', async (_, { id, status }) => {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const enc = await tx.encomenda.findUnique({ where: { id } })
        if (status === 'PAGO' && enc.status !== 'PAGO') {
          const lanc = await tx.lancamento.create({
            data: {
              tipo: 'ENTRADA',
              descricao: `Encomenda #${enc.numero} — ${enc.clienteNome}`,
              valor: enc.valorTotal - enc.valorSinal,
              pago: true
            }
          })
          return await tx.encomenda.update({
            where: { id },
            data: { status, lancamentoId: lanc.id }
          })
        }
        return await tx.encomenda.update({ where: { id }, data: { status } })
      })
      return { sucesso: true, encomenda: resultado }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── COMANDAS (CONSUMO LOCAL) ──────────────────────────────────────
  ipcMain.handle('abrir-comanda', async (_, numero) => {
    try {
      const comanda = await prisma.comanda.create({
        data: { numero, status: 'ABERTA' }
      })
      return { sucesso: true, comanda }
    } catch (erro) {
      return { sucesso: false, erro: 'Esta comanda já está aberta ou o número é inválido.' }
    }
  })

  ipcMain.handle('listar-comandas', async () => {
    try {
      return {
        sucesso: true,
        comandas: await prisma.comanda.findMany({
          where: { status: 'ABERTA' },
          include: { vendas: { include: { itens: { include: { produto: true } } } } }
        })
      }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('adicionar-item-comanda', async (_, { comandaId, vendaDados }) => {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const venda = await tx.venda.create({
          data: {
            total: vendaDados.total,
            metodoPagto: 'COMANDA',
            comandaId: comandaId,
            itens: {
              create: vendaDados.itens.map((item) => ({
                produtoId: item.id,
                quantidade: item.quantidade,
                precoUnitario: item.precoVenda
              }))
            }
          }
        })
        for (const item of vendaDados.itens) {
          await tx.produto.update({
            where: { id: item.id },
            data: { estoqueAtual: { decrement: item.quantidade } }
          })
        }
        const comanda = await tx.comanda.findUnique({ where: { id: comandaId }, include: { vendas: true } })
        const novoTotal = comanda.vendas.reduce((acc, v) => acc + v.total, 0)
        await tx.comanda.update({ where: { id: comandaId }, data: { total: novoTotal } })
        return venda
      })
      return { sucesso: true, venda: resultado }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('fechar-comanda', async (_, { comandaId, metodoPagto }) => {
    try {
      const resultado = await prisma.$transaction(async (tx) => {
        const comanda = await tx.comanda.update({
          where: { id: comandaId },
          data: { status: 'PAGA' }
        })
        await tx.lancamento.create({
          data: {
            tipo: 'ENTRADA',
            descricao: `Fechamento Comanda #${comanda.numero}`,
            valor: comanda.total,
            pago: true
          }
        })
        return comanda
      })
      return { sucesso: true, comanda: resultado }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  ipcMain.handle('abrir-no-navegador', async (_, htmlConteudo) => {
    try {
      const caminhoArquivo = join(app.getPath('temp'), `Documento_${Date.now()}.html`)
      fs.writeFileSync(caminhoArquivo, htmlConteudo)
      await shell.openPath(caminhoArquivo)
      return { sucesso: true }
    } catch (erro) {
      return { sucesso: false, erro: erro.message }
    }
  })

  // ─── CLOUD BACKUP (BACKBLAZE B2) ─────────────────────────────────────────
  const verificarConexaoInternet = () => {
    return new Promise((resolve) => {
      dns.lookup('google.com', (err) => {
        if (err && err.code === 'ENOTFOUND') {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  const fazerBackupCloud = async () => {
    try {
      const isOnline = await verificarConexaoInternet()
      if (!isOnline) {
        return { sucesso: false, erro: 'Sem conexão com a internet.' }
      }

      // Em desenvolvimento procura na raiz do projeto, em produção procura na pasta AppData
      const configPathDev = join(__dirname, '../../backblaze_config.json')
      const configPathProd = join(app.getPath('userData'), 'backblaze_config.json')
      const configPath = is.dev && fs.existsSync(configPathDev) ? configPathDev : configPathProd
      
      if (!fs.existsSync(configPath)) {
        return { sucesso: false, erro: 'Arquivo backblaze_config.json não encontrado.' }
      }

      // O arquivo deve conter: { "endpoint": "...", "region": "...", "bucket": "...", "keyId": "...", "applicationKey": "..." }
      const b2Config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      
      if (!b2Config.endpoint || !b2Config.bucket || !b2Config.keyId || !b2Config.applicationKey) {
         return { sucesso: false, erro: 'Arquivo backblaze_config.json está faltando informações.' }
      }

      const s3Client = new S3Client({
        endpoint: b2Config.endpoint,
        region: b2Config.region || 'us-east-005',
        credentials: {
          accessKeyId: b2Config.keyId,
          secretAccessKey: b2Config.applicationKey
        }
      })

      // Criar zip do banco
      const zipPath = join(app.getPath('temp'), `backup_padaria_${Date.now()}.zip`)
      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })
      
      const zipPromise = new Promise((resolve, reject) => {
        output.on('close', resolve)
        archive.on('error', reject)
        archive.pipe(output)
        archive.file(dbPath, { name: 'dev.db' })
        archive.finalize()
      })

      await zipPromise

      const fileBuffer = fs.readFileSync(zipPath)
      const dataAtual = new Date()
      const ano = dataAtual.getFullYear()
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0')
      const dia = String(dataAtual.getDate()).padStart(2, '0')
      const fileName = `backups/${ano}/${mes}/backup_padaria_${ano}-${mes}-${dia}.zip`

      const command = new PutObjectCommand({
        Bucket: b2Config.bucket,
        Key: fileName,
        Body: fileBuffer,
        ContentType: 'application/zip'
      })

      await s3Client.send(command)

      fs.unlinkSync(zipPath) // Limpa o temp
      return { sucesso: true, mensagem: `Backup salvo como ${fileName} no Backblaze B2!` }

    } catch (error) {
      console.error('Erro no backup:', error)
      return { sucesso: false, erro: error.message }
    }
  }

  ipcMain.handle('force-backup', async () => {
    return await fazerBackupCloud()
  })

  // Agendar para rodar todos os dias às 20h00
  cron.schedule('0 20 * * *', () => {
    fazerBackupCloud().catch(console.error)
  })

  createWindow()
  
  // Verifica se há novas atualizações silenciosamente
  autoUpdater.checkForUpdatesAndNotify()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
