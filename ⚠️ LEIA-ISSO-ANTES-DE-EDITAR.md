# ⚠️ IMPORTANTE - COMO EDITAR O PLUGIN ULANZI

## 🎯 CONFIGURAÇÃO ATUAL (FUNCIONANDO):
- **API**: AwesomeAPI (economia.awesomeapi.com.br)
- **Cálculo**: Média entre `bid` e `high` para aproximar do Google
- **Resultado**: ~5.39 BRL (próximo ao valor do Google)

## 📁 ESTRUTURA DE ARQUIVOS:

### Workspace (desenvolvimento):
```
E:\ssdrepos\ulanzi\UlanziDeckPlugin-SDK-main\com.ulanzi.usdbrlex.ulanziPlugin\
```

### UlanziDeck (produção):
```
C:\Users\jacob\AppData\Roaming\Ulanzi\UlanziDeck\Plugins\com.ulanzi.usdbrlex.ulanziPlugin\
```

### Página que deve ficar aberta:
```
file:///C:/Users/jacob/AppData/Roaming/Ulanzi/UlanziDeck/Plugins/com.ulanzi.usdbrlex.ulanziPlugin/plugin/app.html
```

## 🔄 WORKFLOW DE EDIÇÃO:

### Opção 1: Script automático (RECOMENDADO)
1. Edite os arquivos no workspace
2. Execute `sync-plugin.bat` (duplo clique)
3. Dê refresh (F5) na página app.html

### Opção 2: Comando manual
```cmd
xcopy /Y /E /I com.ulanzi.usdbrlex.ulanziPlugin C:\Users\jacob\AppData\Roaming\Ulanzi\UlanziDeck\Plugins\com.ulanzi.usdbrlex.ulanziPlugin
```

### Opção 3: Edite direto no AppData
Edite diretamente em `C:\Users\jacob\AppData\Roaming\Ulanzi\...`
(não precisa sincronizar, mas perde o controle de versão)

## 🔧 ARQUIVOS PRINCIPAIS:

- **SimpleAPI.js** - Busca cotação da API (média bid+high)
- **ExchangeRateDisplay.js** - Renderiza no botão Ulanzi
- **app.html** - Página principal (deve ficar aberta)
- **app.js** - Gerencia instâncias do plugin

## 🐛 TROUBLESHOOTING:

### Plugin não atualiza após editar:
1. Executou o `sync-plugin.bat`? ✅
2. Deu refresh (F5) na página? ✅
3. Cache do navegador? Use Ctrl+Shift+R

### Valor errado no botão:
- Verifique se está usando a média (bid+high)/2
- Confira os logs no console do navegador (F12)

### Página app.html fecha sozinha:
- Use `install-auto-start.bat` para abrir automaticamente
