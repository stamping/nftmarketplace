# NFT Marketplace v0.1.1

Un marketplace de NFTs descentralizado con soporte para múltiples blockchains, diseñado para trabajar con la wallet 0xAddress y MetaMask.

## 🏗️ Estructura del Proyecto

```
nft-marketplace/
├── index.html              # Página principal (lista de NFTs)
├── css/
│   ├── styles.css          # Estilos globales (variables, header, grid, modals)
│   └── item.css            # Estilos específicos de la página de item
├── js/
│   ├── index.js            # Lógica de la página principal
│   └── item.js             # Lógica de la página de detalle de NFT
├── json/
│   ├── config.json         # Configuración de redes y colecciones
│   └── abis.json           # ABIs de los contratos (NFT y Marketplace)
├── item/
│   ├── index.html          # Página de detalle de NFT
│   └── .htaccess           # Reglas de reescritura para URLs limpias
├── contracts/
│   ├── NFTMarketplace.sol  # Contrato del marketplace
│   └── DemoNFT.sol         # Contrato de NFT de ejemplo
└── README.md               # Esta documentación
```

## 🔧 Configuración

### config.json

```json
{
  "networks": {
    "570": {
      "name": "Rollux",
      "chainIdHex": "0x23a",
      "rpc": "https://rpc.rollux.com",
      "explorer": "https://explorer.rollux.com",
      "nativeCurrency": { "name": "Syscoin", "symbol": "SYS", "decimals": 18 },
      "marketplace": "0x...",  // Dirección del contrato marketplace
      "color": "#7c5cff",
      "icon": "⚡"
    }
  },
  "collections": [
    {
      "chainId": "570",
      "contract": "0x...",     // Dirección del contrato NFT
      "name": "Mi Colección"
    }
  ]
}
```

### abis.json

Contiene los ABIs mínimos necesarios:
- `nft`: Funciones ERC-721 estándar + royaltyInfo (EIP-2981)
- `marketplace`: Funciones del contrato NFTMarketplace

## 📁 Archivos Principales

### index.js (Página Principal)

**Funciones principales:**
- `init()` - Inicialización, carga tema/idioma, setup de eventos
- `loadCollections()` - Carga config.json y abis.json, itera colecciones
- `loadNFTs(col, net)` - Lee NFTs de blockchain (ownerOf, tokenURI)
- `renderNFTs()` - Genera HTML de cards de NFTs
- `getMetaMask()` / `get0xAddress()` - Detecta wallets disponibles
- `connectWallet(type)` - Conecta wallet seleccionada
- `toggleTheme()` / `toggleLanguage()` - Cambia tema/idioma

**Variables globales:**
- `config` - Configuración cargada
- `abis` - ABIs de contratos
- `allNFTs` - Array de NFTs cargados
- `provider`, `signer`, `address` - Conexión wallet

### item.js (Página de Detalle)

**Funciones principales:**
- `init()` - Parsea URL, carga config, inicializa todo
- `parseUrl()` - Extrae chainId, contract, tokenId de la URL
- `loadNFT()` - Carga metadatos del NFT (ownerOf, tokenURI, name)
- `displayMetadata(meta)` - Muestra imagen, nombre, descripción, atributos
- `loadOrders()` - Carga ofertas activas del marketplace
- `loadListing()` - Carga listing activo (precio fijo)
- `loadSalesHistory()` - Carga historial de ventas
- `makeOffer()` - Crea nueva oferta (createOrder)
- `acceptOrder(orderId)` - Acepta oferta como owner
- `cancelOrder(orderId)` - Cancela oferta propia
- `createListing()` - Lista NFT a precio fijo
- `cancelListing()` - Cancela listing
- `buyNow()` - Compra instantánea

**Variables globales:**
- `urlChainId`, `urlContract`, `urlTokenId` - Parseados de URL
- `basePath` - Ruta base para fetch de configs
- `networkConfig` - Config de la red actual
- `readProvider` - Provider de solo lectura (JsonRpcProvider)
- `nftContract`, `marketplaceContract` - Instancias de contratos
- `nftOwner` - Dirección del owner actual
- `orders`, `listing`, `salesHistory` - Datos del marketplace

## 🎨 Sistema de Estilos

### Variables CSS (styles.css)

```css
:root {
  --primary: #7c5cff;           /* Color principal */
  --primary-hover: #6b4fe6;
  --bg-primary: #0f0f15;        /* Fondo oscuro */
  --bg-secondary: #1a1a24;
  --text-primary: #ffffff;
  --text-secondary: #a0a0b0;
  --radius-sm: 8px;
  --transition: 0.2s ease;
}

[data-theme="light"] {
  --bg-primary: #f5f5f7;
  --text-primary: #1a1a24;
  /* ... overrides para tema claro */
}
```

### Clases Principales

- `.header` - Barra superior sticky con blur
- `.hero` - Sección hero con gradiente
- `.nft-grid` - Grid responsive de NFTs
- `.nft-card` - Card de NFT con hover effects
- `.item-layout` - Layout 2 columnas para página de item
- `.item-card` - Card contenedora para secciones
- `.modal-overlay` / `.modal` - Sistema de modales
- `.toast` - Notificaciones toast

## 🔗 Sistema de Rutas

### URLs

- Colecciones: `/dev/nft-marketplace/`
- Item: `/dev/nft-marketplace/item/{chainId}/{contract}/{tokenId}`

### .htaccess (item/)

```apache
RewriteEngine On
RewriteBase /dev/nft-marketplace/item/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]
```

Redirige todas las URLs bajo `/item/` a `item/index.html` para que el JS parseé la URL.

## 🌐 Internacionalización (i18n)

Sistema simple de traducciones en cada JS:

```javascript
const translations = {
  en: { connectWallet: 'Connect Wallet', ... },
  es: { connectWallet: 'Conectar Wallet', ... }
};

function t(key) {
  return translations[lang]?.[key] || key;
}
```

HTML usa `data-i18n` para textos y `data-i18n-placeholder` para placeholders:

```html
<button data-i18n="connectWallet">Connect Wallet</button>
<input data-i18n-placeholder="searchPlaceholder">
```

## 👛 Detección de Wallets

```javascript
// MetaMask (pero no 0xAddress)
function getMetaMask() {
  if (window.ethereum?.isMetaMask && !window.ethereum?.isOxAddress) {
    return window.ethereum;
  }
  return null;
}

// 0xAddress (window.oxaddress o ethereum.isOxAddress)
function get0xAddress() {
  if (window.oxaddress) return window.oxaddress;
  if (window.ethereum?.isOxAddress) return window.ethereum;
  return null;
}
```

## 📜 Contrato Marketplace

### NFTMarketplace.sol

**Funciones principales:**

| Función | Descripción |
|---------|-------------|
| `createOrder(nftContract, tokenId)` | Crear oferta (payable) |
| `acceptOrder(orderId)` | Aceptar oferta (owner) |
| `cancelOrder(orderId)` | Cancelar oferta (buyer) |
| `createListing(nftContract, tokenId, price)` | Listar a precio fijo |
| `updateListing(nftContract, tokenId, newPrice)` | Actualizar precio |
| `cancelListing(nftContract, tokenId)` | Cancelar listing |
| `buyNow(nftContract, tokenId)` | Comprar al precio listado |
| `getActiveOrders(nftContract, tokenId)` | Ver ofertas activas |
| `getListing(nftContract, tokenId)` | Ver listing activo |
| `getSalesHistory(nftContract, tokenId)` | Ver historial de ventas |

**Características:**
- Soporte multi-contrato (cualquier ERC-721)
- Royalties EIP-2981
- Fee configurable del marketplace
- ReentrancyGuard, Pausable, Ownable

## 🚀 Despliegue

1. **Desplegar contrato:**
   ```bash
   # Constructor: fee en basis points (250 = 2.5%), fee recipient
   constructor(250, 0xTuDireccion)
   ```

2. **Actualizar config.json:**
   - Agregar dirección del marketplace en cada red
   - Agregar colecciones NFT

3. **Subir archivos al servidor**

4. **Configurar .htaccess** (si es Apache)

## 🐛 Debugging

El código incluye logs en consola:

```javascript
console.log('[init] NFT Marketplace Item v0.1.1');
console.log('[parseUrl] Full path:', path);
console.log('[loadNFT] Owner:', nftOwner);
```

Abre DevTools (F12) > Console para ver:
- Estado de carga de config
- Parseo de URL
- Detección de wallets
- Carga de NFT
- Errores de contratos

## 📝 Notas

- El marketplace requiere aprobación del NFT antes de aceptar ofertas o listar
- Los fees se deducen automáticamente en cada venta
- Los royalties se pagan si el contrato NFT implementa EIP-2981
- La imagen de fallback usa picsum.photos

---

Desarrollado por [0xAddress.com](https://0xaddress.com)
