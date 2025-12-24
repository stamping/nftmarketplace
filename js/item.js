/* ============================================
   NFT Item Page
   v0.1.4 - Fixed wallet + download button
   ============================================ */

let config = null;
let abis = null;
let networkConfig = null;
let readProvider = null;

let urlChainId = null;
let urlContract = null;
let urlTokenId = null;

let nftOwner = null;
let nftMetadata = null;
let nftTokenURI = null;
let orders = [];
let salesHistory = [];
let listing = null;
let isApproved = false;
let marketplaceFee = 0;
let creatorFee = 0;

let provider = null;
let signer = null;
let address = null;
let chainId = null;
let walletType = null;
let nftContract = null;
let marketplaceContract = null;
let priceChart = null;

// i18n
const translations = {
    en: {
        connectWallet: 'Connect Wallet',
        disconnect: 'Disconnect',
        loading: 'Loading...',
        makeOffer: 'Make Offer',
        listForSale: 'List for Sale',
        cancelListing: 'Cancel',
        updatePrice: 'Update Price',
        buyNow: 'Buy Now',
        offers: 'Offers',
        noOffers: 'No offers yet',
        activity: 'Activity',
        noActivity: 'No activity yet',
        attributes: 'Attributes',
        noAttributes: 'No attributes',
        blockchain: 'Blockchain',
        howItWorks: 'How it Works',
        learnHow: 'Learn how the marketplace smart contract works',
        howOffers: 'How Offers Work',
        howListings: 'How Listings Work',
        howBuy: 'How Buy Now Works',
        howRoyalties: 'How Royalties Work',
        owner: 'Owner',
        ownedBy: 'Owned by',
        lastSale: 'Last Sale',
        currentPrice: 'Current Price',
        you: 'you',
        contract: 'Contract',
        tokenId: 'Token ID',
        network: 'Network',
        creatorFee: 'Creator Fee',
        marketplaceFee: 'Marketplace Fee',
        listedAt: 'Listed at',
        accept: 'Accept',
        cancel: 'Cancel',
        sale: 'Sale',
        listed: 'Listed',
        offer: 'Offer',
        transfer: 'Transfer',
        walletLocked: 'Wallet is locked. Please unlock it and try again.',
        download: 'Download',
        salesReport: 'Sales History',
        transactions: 'transactions',
        from: 'From',
        to: 'To',
        salePrice: 'Sale Price',
        creatorRoyalty: 'Creator Royalty',
        sellerReceived: 'Seller Received',
        saleReceipt: 'Sale Receipt',
        verifyOnBlockchain: 'Verify on Blockchain',
        scanToVerify: 'Scan to verify on blockchain',
        thankYou: 'Thank you for using our marketplace!',
        tokenStandards: 'Token Standards',
        metadataType: 'Metadata Type',
        imageType: 'Image',
        videoType: 'Video',
        audioType: 'Audio',
        modelType: '3D Model',
        documentType: 'Document',
        animationType: 'Animation',
        unknownType: 'Unknown',
        clickToLearn: 'Click to learn more',
        viewOnExplorer: 'View Token on Explorer',
        share: 'Share',
        txError: 'Transaction Error',
        technicalDetails: 'Technical Details',
        sendAnyway: 'Send Anyway'
    },
    es: {
        connectWallet: 'Conectar Wallet',
        disconnect: 'Desconectar',
        loading: 'Cargando...',
        makeOffer: 'Hacer Oferta',
        listForSale: 'Poner en Venta',
        cancelListing: 'Cancelar',
        updatePrice: 'Actualizar Precio',
        buyNow: 'Comprar Ahora',
        offers: 'Ofertas',
        noOffers: 'Sin ofertas aún',
        activity: 'Actividad',
        noActivity: 'Sin actividad aún',
        attributes: 'Atributos',
        noAttributes: 'Sin atributos',
        blockchain: 'Blockchain',
        howItWorks: 'Cómo Funciona',
        learnHow: 'Aprende cómo funciona el contrato inteligente del marketplace',
        howOffers: 'Cómo Funcionan las Ofertas',
        howListings: 'Cómo Funcionan los Listados',
        howBuy: 'Cómo Funciona Comprar Ahora',
        howRoyalties: 'Cómo Funcionan las Regalías',
        owner: 'Propietario',
        ownedBy: 'Propiedad de',
        lastSale: 'Última Venta',
        currentPrice: 'Precio Actual',
        you: 'tú',
        contract: 'Contrato',
        tokenId: 'ID de Token',
        network: 'Red',
        creatorFee: 'Comisión Creador',
        marketplaceFee: 'Comisión Marketplace',
        listedAt: 'Listado a',
        accept: 'Aceptar',
        cancel: 'Cancelar',
        sale: 'Venta',
        listed: 'Listado',
        offer: 'Oferta',
        transfer: 'Transferencia',
        walletLocked: 'Wallet bloqueada. Desbloquéala e intenta de nuevo.',
        download: 'Descargar',
        salesReport: 'Historial de Ventas',
        transactions: 'transacciones',
        from: 'De',
        to: 'Para',
        salePrice: 'Precio de Venta',
        creatorRoyalty: 'Regalía del Creador',
        sellerReceived: 'Vendedor Recibió',
        saleReceipt: 'Recibo de Venta',
        verifyOnBlockchain: 'Verificar en Blockchain',
        scanToVerify: 'Escanea para verificar en blockchain',
        thankYou: '¡Gracias por usar nuestro marketplace!',
        tokenStandards: 'Estándares del Token',
        metadataType: 'Tipo de Metadata',
        imageType: 'Imagen',
        videoType: 'Video',
        audioType: 'Audio',
        modelType: 'Modelo 3D',
        documentType: 'Documento',
        animationType: 'Animación',
        unknownType: 'Desconocido',
        clickToLearn: 'Clic para más información',
        viewOnExplorer: 'Ver Token en Explorer',
        share: 'Compartir',
        txError: 'Error de Transacción',
        technicalDetails: 'Detalles Técnicos',
        sendAnyway: 'Enviar de Todos Modos'
    }
};

let lang = localStorage.getItem('nft-lang') || 'en';

function t(key) {
    return translations[lang]?.[key] || translations.en[key] || key;
}

function updateUILanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
}

// Theme & Language
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('nft-theme', theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
}

function toggleLanguage() {
    lang = lang === 'en' ? 'es' : 'en';
    localStorage.setItem('nft-lang', lang);
    document.getElementById('langToggle').textContent = lang.toUpperCase();
    updateUILanguage();
    renderOrders();
    renderActivity();
    displayDetails();
}

// Accordion
function toggleAccordion(header) {
    header.classList.toggle('active');
    const content = header.nextElementSibling;
    content.classList.toggle('open');
}

// URL Parsing
let basePath = '../../../';

function parseUrl() {
    const path = window.location.pathname;
    console.log('[parseUrl] Full path:', path);
    
    const parts = path.split('/').filter(p => p);
    const itemIdx = parts.indexOf('item');
    
    if (itemIdx >= 0 && parts.length >= itemIdx + 4) {
        urlChainId = parts[itemIdx + 1];
        urlContract = parts[itemIdx + 2];
        urlTokenId = parts[itemIdx + 3];
        
        console.log('[parseUrl] chainId:', urlChainId, 'contract:', urlContract, 'tokenId:', urlTokenId);
    }
    
    return urlChainId && urlContract && urlTokenId && /^0x[a-fA-F0-9]{40}$/.test(urlContract);
}

// Wallet
function getMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        if (window.ethereum.isMetaMask && !window.ethereum.isOxAddress) {
            return window.ethereum;
        }
    }
    return null;
}

function get0xAddress() {
    if (typeof window.oxaddress !== 'undefined') return window.oxaddress;
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isOxAddress) return window.ethereum;
    return null;
}

function showWalletModal() {
    checkWalletAvailability();
    document.getElementById('walletModal').classList.add('visible');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('visible');
}

function checkWalletAvailability() {
    const mm = !!getMetaMask();
    const ox = !!get0xAddress();
    
    const mmStatus = document.getElementById('metamaskStatus');
    const oxStatus = document.getElementById('oxaddressStatus');
    
    if (mmStatus) {
        mmStatus.textContent = mm ? (lang === 'es' ? 'Disponible' : 'Available') : (lang === 'es' ? 'No instalado' : 'Not Installed');
        mmStatus.className = 'wallet-option-status ' + (mm ? 'available' : 'unavailable');
    }
    if (oxStatus) {
        oxStatus.textContent = ox ? (lang === 'es' ? 'Disponible' : 'Available') : (lang === 'es' ? 'No instalado' : 'Not Installed');
        oxStatus.className = 'wallet-option-status ' + (ox ? 'available' : 'unavailable');
    }
    
    document.getElementById('metamaskOption').disabled = !mm;
    document.getElementById('oxaddressOption').disabled = !ox;
}

// Extract address from various wallet response formats
function extractAddress(accounts, wp) {
    let addr = null;
    
    // Array of strings
    if (Array.isArray(accounts) && accounts.length > 0) {
        // Skip null values
        const validAccount = accounts.find(a => a !== null && a !== undefined);
        if (validAccount) {
            if (typeof validAccount === 'string' && validAccount) {
                addr = validAccount;
            } else if (validAccount?.address) {
                addr = validAccount.address;
            }
        }
    }
    // Direct string
    else if (typeof accounts === 'string' && accounts) {
        addr = accounts;
    }
    // Object with address
    else if (accounts?.address) {
        addr = accounts.address;
    }
    
    // Fallbacks from provider
    if (!addr && wp?.selectedAddress) addr = wp.selectedAddress;
    if (!addr && wp?.accounts?.[0]) {
        const acc = wp.accounts[0];
        addr = typeof acc === 'string' ? acc : acc?.address;
    }
    
    return addr;
}

// Check if wallet is locked - only return true if explicitly locked
function isWalletLocked(accounts) {
    // Only consider locked if we have an array with ONLY null values
    if (!Array.isArray(accounts)) return false;
    if (accounts.length === 0) return false;
    
    // Check if ALL elements are null
    return accounts.every(a => a === null);
}

async function connectWallet(type) {
    console.log('[connectWallet] Starting with type:', type);
    const wp = type === 'metamask' ? getMetaMask() : get0xAddress();
    if (!wp) { 
        showToast(lang === 'es' ? 'No instalado' : 'Not installed', 'error'); 
        return; 
    }
    
    try {
        closeModal('walletModal');
        
        console.log('[connectWallet] Requesting accounts...');
        const accounts = await wp.request({ method: 'eth_requestAccounts' });
        console.log('[connectWallet] Accounts received:', accounts);
        
        // Check if wallet is locked (all null)
        if (isWalletLocked(accounts)) {
            console.log('[connectWallet] Wallet appears to be locked');
            showToast(t('walletLocked'), 'error');
            return;
        }
        
        let accountAddress = extractAddress(accounts, wp);
        
        // If still no address, wait and retry once
        if (!accountAddress) {
            console.log('[connectWallet] No address found, waiting...');
            await new Promise(r => setTimeout(r, 500));
            accountAddress = wp.selectedAddress;
        }
        
        if (!accountAddress) {
            console.log('[connectWallet] Still no address after retry');
            showToast(t('walletLocked'), 'error');
            return;
        }
        
        address = accountAddress;
        walletType = type;
        console.log('[connectWallet] Address:', address);
        
        // Create provider
        provider = new ethers.BrowserProvider(wp);
        
        // Get chainId
        const network = await provider.getNetwork();
        chainId = Number(network.chainId);
        console.log('[connectWallet] ChainId:', chainId, 'Expected:', urlChainId);
        
        // Switch network if needed
        if (chainId !== parseInt(urlChainId)) {
            console.log('[connectWallet] Switching network...');
            await switchNetwork(wp);
            provider = new ethers.BrowserProvider(wp);
        }
        
        // Get signer
        signer = await provider.getSigner();
        console.log('[connectWallet] Signer obtained');
        
        setupListeners(wp);
        await initContracts();
        await updateWalletUI();
        checkOwnership();
        await loadOrders();
        await loadListing();
        
        showToast(lang === 'es' ? '¡Conectado!' : 'Connected!', 'success');
    } catch (e) {
        console.error('[connectWallet] Error:', e);
        // Don't show toast for user rejection
        if (e.code !== 4001) {
            showToast(e.reason || e.message || 'Error', 'error');
        }
    }
}

async function switchNetwork(wp) {
    if (!networkConfig) return;
    try {
        await wp.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: networkConfig.chainIdHex }] });
    } catch (e) {
        if (e.code === 4902) {
            await wp.request({
                method: 'wallet_addEthereumChain',
                params: [{ chainId: networkConfig.chainIdHex, chainName: networkConfig.name, nativeCurrency: networkConfig.nativeCurrency, rpcUrls: [networkConfig.rpc], blockExplorerUrls: [networkConfig.explorer] }]
            });
        }
    }
}

function setupListeners(wp) {
    if (!wp?.on) return;
    wp.on('accountsChanged', async (accounts) => {
        if (accounts.length) { address = accounts[0]; signer = await provider.getSigner(); await initContracts(); await updateWalletUI(); checkOwnership(); }
        else disconnect();
    });
    wp.on('chainChanged', () => window.location.reload());
}

async function initContracts() {
    if (!signer || !abis) return;
    nftContract = new ethers.Contract(urlContract, abis.nft, signer);
    if (networkConfig?.marketplace && networkConfig.marketplace !== '0x0000000000000000000000000000000000000000') {
        marketplaceContract = new ethers.Contract(networkConfig.marketplace, abis.marketplace, signer);
        await checkApproval();
    }
}

async function checkApproval() {
    if (!nftContract || !address || !networkConfig?.marketplace) return;
    try { isApproved = await nftContract.isApprovedForAll(address, networkConfig.marketplace); } catch { isApproved = false; }
}

async function updateWalletUI() {
    if (!address) return;
    document.getElementById('walletInfo').classList.remove('hidden');
    document.getElementById('connectBtn').classList.add('hidden');
    document.getElementById('disconnectBtn').classList.remove('hidden');
    document.getElementById('walletAddress').textContent = address.slice(0, 6) + '...' + address.slice(-4);
    
    const sym = networkConfig?.nativeCurrency?.symbol || 'ETH';
    try {
        const bal = await provider.getBalance(address);
        document.getElementById('walletBalance').textContent = parseFloat(ethers.formatEther(bal)).toFixed(4) + ' ' + sym;
    } catch {}
}

function disconnect() {
    provider = signer = address = nftContract = marketplaceContract = null;
    document.getElementById('walletInfo').classList.add('hidden');
    document.getElementById('connectBtn').classList.remove('hidden');
    document.getElementById('disconnectBtn').classList.add('hidden');
    checkOwnership();
    showToast(lang === 'es' ? 'Desconectado' : 'Disconnected', 'success');
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastIcon').textContent = type === 'success' ? '✓' : '✕';
    document.getElementById('toastText').textContent = msg;
    toast.className = 'toast visible toast-' + type;
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

// NFT Loading
function fixURI(url) {
    if (!url) return '';
    if (url.startsWith('ipfs://')) return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    const m = url.match(/https?:\/\//g);
    if (m && m.length > 1) return url.substring(url.lastIndexOf('http'));
    return url;
}

function isImage(url) {
    if (!url) return false;
    const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return ext.some(e => url.toLowerCase().split('?')[0].endsWith(e));
}

async function loadNFT() {
    console.log('[loadNFT] Starting...');
    const titleEl = document.getElementById('nftTitle');
    const imageEl = document.getElementById('nftImage');
    const containerEl = document.getElementById('imageContainer');
    
    titleEl.textContent = t('loading');
    
    imageEl.onload = () => { imageEl.classList.add('loaded'); containerEl.classList.remove('loading'); };
    imageEl.onerror = () => { imageEl.src = `https://picsum.photos/seed/${urlContract}${urlTokenId}/600`; imageEl.classList.add('loaded'); containerEl.classList.remove('loading'); };
    
    try {
        const contract = new ethers.Contract(urlContract, abis.nft, readProvider);
        
        try {
            nftOwner = await contract.ownerOf(urlTokenId);
            updateOwnerDisplay();
        } catch (e) {
            console.error('[loadNFT] ownerOf error:', e);
            titleEl.textContent = `Token #${urlTokenId} not found`;
            containerEl.classList.remove('loading');
            return;
        }
        
        try { document.getElementById('collectionName').textContent = await contract.name() || 'Collection'; } catch {}
        try { const [, r] = await contract.royaltyInfo(urlTokenId, ethers.parseEther('1')); creatorFee = Number(r) / 1e18 * 100; } catch {}
        
        let tokenURI = '';
        try { 
            tokenURI = await contract.tokenURI(urlTokenId);
            nftTokenURI = tokenURI; // Save original URI
            tokenURI = fixURI(tokenURI);
        } catch {}
        
        if (!tokenURI) {
            titleEl.textContent = `Token #${urlTokenId}`;
        } else if (tokenURI.startsWith('data:application/json')) {
            nftTokenURI = 'data:application/json'; // On-chain
            try { displayMetadata(JSON.parse(atob(tokenURI.split(',')[1]))); } catch { titleEl.textContent = `Token #${urlTokenId}`; }
        } else if (isImage(tokenURI)) {
            imageEl.src = tokenURI;
            titleEl.textContent = `Token #${urlTokenId}`;
        } else if (tokenURI.startsWith('http')) {
            try {
                const res = await fetch(tokenURI);
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('image')) { imageEl.src = tokenURI; titleEl.textContent = `Token #${urlTokenId}`; }
                else {
                    const txt = await res.text();
                    if (txt.startsWith('{')) displayMetadata(JSON.parse(txt));
                    else titleEl.textContent = `Token #${urlTokenId}`;
                }
            } catch { imageEl.src = tokenURI; titleEl.textContent = `Token #${urlTokenId}`; }
        } else {
            titleEl.textContent = `Token #${urlTokenId}`;
        }
        
        checkOwnership();
        displayDetails();
        await detectTokenStandards();
        console.log('[loadNFT] Done');
    } catch (e) {
        console.error('[loadNFT] Error:', e);
        titleEl.textContent = 'Error loading NFT';
        containerEl.classList.remove('loading');
    }
    
    // Always ensure ownership check runs
    checkOwnership();
}

function displayMetadata(meta) {
    nftMetadata = meta;
    if (meta.image || meta.image_url) document.getElementById('nftImage').src = fixURI(meta.image || meta.image_url);
    document.getElementById('nftTitle').textContent = meta.name || `Token #${urlTokenId}`;
    document.getElementById('nftDescription').textContent = meta.description || '';
    
    const grid = document.getElementById('attributesGrid');
    const attrs = meta.attributes || meta.traits || [];
    if (attrs.length) {
        grid.innerHTML = attrs.map(a => `<div class="attribute-item"><div class="attribute-type">${a.trait_type || a.name}</div><div class="attribute-value">${a.value}</div></div>`).join('');
    } else {
        grid.innerHTML = `<p class="text-muted">${t('noAttributes')}</p>`;
    }
    
    // Update OG tags for social sharing
    const nftTitle = meta.name || `Token #${urlTokenId}`;
    const nftDescription = meta.description || `NFT on ${networkConfig?.name || 'blockchain'} - View on 0xAddress Marketplace`;
    const nftImage = fixURI(meta.image || meta.image_url || '');
    updateOGTags(`${nftTitle} - 0xAddress Marketplace`, nftDescription, nftImage);
}

function displayDetails() {
    const sym = networkConfig?.nativeCurrency?.symbol || 'ETH';
    const explorer = networkConfig?.explorer || '';
    
    document.getElementById('detailsList').innerHTML = `
        <div class="detail-row"><span class="detail-label">${t('contract')}</span><span class="detail-value"><a href="${explorer}/address/${urlContract}" target="_blank">${urlContract.slice(0, 8)}...${urlContract.slice(-6)}</a></span></div>
        <div class="detail-row"><span class="detail-label">${t('tokenId')}</span><span class="detail-value">${urlTokenId}</span></div>
        <div class="detail-row"><span class="detail-label">${t('network')}</span><span class="detail-value">${networkConfig?.name || urlChainId}</span></div>
        <div class="detail-row"><span class="detail-label">${t('creatorFee')}</span><span class="detail-value">${creatorFee > 0 ? creatorFee.toFixed(1) + '%' : '—'}</span></div>
        <div class="detail-row"><span class="detail-label">${t('marketplaceFee')}</span><span class="detail-value">${marketplaceFee > 0 ? (marketplaceFee / 100).toFixed(1) + '%' : '—'}</span></div>
    `;
    
    document.getElementById('offerSymbol').textContent = sym;
    document.getElementById('listingSymbol').textContent = sym;
}

// EIP Standards definitions
const EIP_STANDARDS = {
    'ERC-721': {
        name: 'ERC-721',
        icon: '🖼️',
        description: 'Non-Fungible Token Standard',
        url: 'https://eips.ethereum.org/EIPS/eip-721',
        check: async (contract) => {
            try {
                // Check supportsInterface for ERC721 (0x80ac58cd)
                return await contract.supportsInterface('0x80ac58cd');
            } catch { return false; }
        }
    },
    'ERC-721-Metadata': {
        name: 'ERC-721 Metadata',
        icon: '📝',
        description: 'NFT Metadata Extension',
        url: 'https://eips.ethereum.org/EIPS/eip-721',
        check: async (contract) => {
            try {
                // Check supportsInterface for ERC721Metadata (0x5b5e139f)
                return await contract.supportsInterface('0x5b5e139f');
            } catch { return false; }
        }
    },
    'ERC-721-Enumerable': {
        name: 'ERC-721 Enumerable',
        icon: '🔢',
        description: 'NFT Enumeration Extension',
        url: 'https://eips.ethereum.org/EIPS/eip-721',
        check: async (contract) => {
            try {
                // Check supportsInterface for ERC721Enumerable (0x780e9d63)
                return await contract.supportsInterface('0x780e9d63');
            } catch { return false; }
        }
    },
    'ERC-2981': {
        name: 'ERC-2981',
        icon: '👑',
        description: 'NFT Royalty Standard',
        url: 'https://eips.ethereum.org/EIPS/eip-2981',
        check: async (contract) => {
            try {
                // Check supportsInterface for ERC2981 (0x2a55205a)
                return await contract.supportsInterface('0x2a55205a');
            } catch { return false; }
        }
    },
    'ERC-165': {
        name: 'ERC-165',
        icon: '🔍',
        description: 'Standard Interface Detection',
        url: 'https://eips.ethereum.org/EIPS/eip-165',
        check: async (contract) => {
            try {
                // Check supportsInterface for ERC165 (0x01ffc9a7)
                return await contract.supportsInterface('0x01ffc9a7');
            } catch { return false; }
        }
    },
    'ERC-4906': {
        name: 'ERC-4906',
        icon: '🔄',
        description: 'Metadata Update Extension',
        url: 'https://eips.ethereum.org/EIPS/eip-4906',
        check: async (contract) => {
            try {
                // Check supportsInterface for ERC4906 (0x49064906)
                return await contract.supportsInterface('0x49064906');
            } catch { return false; }
        }
    }
};

// Media type detection
const MEDIA_TYPES = {
    image: { icon: '🖼️', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'], mimePrefix: 'image/' },
    video: { icon: '🎬', extensions: ['.mp4', '.webm', '.ogg', '.mov', '.avi'], mimePrefix: 'video/' },
    audio: { icon: '🎵', extensions: ['.mp3', '.wav', '.ogg', '.flac', '.aac'], mimePrefix: 'audio/' },
    model: { icon: '🎮', extensions: ['.glb', '.gltf', '.obj', '.fbx'], mimePrefix: 'model/' },
    document: { icon: '📄', extensions: ['.pdf', '.doc', '.docx', '.txt'], mimePrefix: 'application/pdf' },
    animation: { icon: '✨', extensions: ['.json', '.lottie'], mimePrefix: 'application/json' }
};

function detectMediaType(url, mimeType) {
    if (!url && !mimeType) return { type: 'unknown', icon: '❓', label: t('unknownType') };
    
    const urlLower = (url || '').toLowerCase();
    
    for (const [type, config] of Object.entries(MEDIA_TYPES)) {
        // Check by extension
        if (config.extensions.some(ext => urlLower.includes(ext))) {
            return { type, icon: config.icon, label: t(`${type}Type`) };
        }
        // Check by mime type
        if (mimeType && mimeType.startsWith(config.mimePrefix)) {
            return { type, icon: config.icon, label: t(`${type}Type`) };
        }
    }
    
    // Default to image if it looks like a URL
    if (url && (url.startsWith('http') || url.startsWith('ipfs'))) {
        return { type: 'image', icon: '🖼️', label: t('imageType') };
    }
    
    return { type: 'unknown', icon: '❓', label: t('unknownType') };
}

async function detectTokenStandards() {
    console.log('[detectTokenStandards] Starting...');
    
    const standardsList = document.getElementById('standardsList');
    const metadataStorage = document.getElementById('metadataStorage');
    
    if (!standardsList) {
        console.log('[detectTokenStandards] standardsList not found');
        return;
    }
    
    const explorer = networkConfig?.explorer || '';
    
    // Detect EIP standards
    const detectedStandards = [];
    
    try {
        const contract = new ethers.Contract(urlContract, [
            'function supportsInterface(bytes4 interfaceId) view returns (bool)'
        ], readProvider);
        
        for (const [key, standard] of Object.entries(EIP_STANDARDS)) {
            try {
                const supported = await standard.check(contract);
                if (supported) {
                    detectedStandards.push(standard);
                    console.log(`[detectTokenStandards] ${key}: ✓`);
                }
            } catch (e) {
                console.log(`[detectTokenStandards] ${key}: error -`, e.message);
            }
        }
    } catch (e) {
        console.log('[detectTokenStandards] Contract error:', e.message);
    }
    
    // Render standards badges
    let html = '<div class="standards-tags">';
    
    if (detectedStandards.length > 0) {
        html += detectedStandards.map(s => `
            <a href="${s.url}" target="_blank" class="standard-tag" title="${s.description}">
                <span class="standard-tag-icon">${s.icon}</span>
                <span class="standard-tag-name">${s.name}</span>
            </a>
        `).join('');
    } else {
        html += `<span class="standard-tag basic">
            <span class="standard-tag-icon">🖼️</span>
            <span class="standard-tag-name">ERC-721</span>
        </span>`;
    }
    
    html += '</div>';
    standardsList.innerHTML = html;
    
    // Detect storage type
    if (metadataStorage) {
        let storageHtml = '<div class="storage-info">';
        
        // Determine storage type from tokenURI
        let storageType = { icon: '❓', name: t('unknownType'), color: 'gray' };
        let metadataUrl = nftTokenURI || '';
        let imageUrl = nftMetadata?.image || nftMetadata?.image_url || '';
        
        // Metadata storage
        if (metadataUrl.startsWith('ipfs://') || metadataUrl.includes('ipfs.io') || metadataUrl.includes('/ipfs/')) {
            storageType = { icon: '📦', name: 'IPFS', color: '#65c3c8', description: 'InterPlanetary File System - Decentralized' };
        } else if (metadataUrl.startsWith('data:')) {
            storageType = { icon: '⛓️', name: 'On-Chain', color: '#22c55e', description: 'Stored directly on blockchain' };
        } else if (metadataUrl.startsWith('https://') || metadataUrl.startsWith('http://')) {
            storageType = { icon: '🌐', name: 'HTTPS', color: '#3b82f6', description: 'Traditional web server' };
        } else if (metadataUrl.startsWith('ar://') || metadataUrl.includes('arweave.net')) {
            storageType = { icon: '🏔️', name: 'Arweave', color: '#9333ea', description: 'Permanent decentralized storage' };
        }
        
        // Image storage
        let imageStorageType = { icon: '❓', name: t('unknownType'), color: 'gray' };
        if (imageUrl.startsWith('ipfs://') || imageUrl.includes('ipfs.io') || imageUrl.includes('/ipfs/')) {
            imageStorageType = { icon: '📦', name: 'IPFS', color: '#65c3c8' };
        } else if (imageUrl.startsWith('data:')) {
            imageStorageType = { icon: '⛓️', name: 'On-Chain', color: '#22c55e' };
        } else if (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) {
            imageStorageType = { icon: '🌐', name: 'HTTPS', color: '#3b82f6' };
        } else if (imageUrl.startsWith('ar://') || imageUrl.includes('arweave.net')) {
            imageStorageType = { icon: '🏔️', name: 'Arweave', color: '#9333ea' };
        }
        
        // Detect media type
        const mediaType = detectMediaType(nftMetadata?.animation_url || imageUrl);
        
        storageHtml += `
            <div class="storage-row">
                <span class="storage-label">${t('metadataType')}:</span>
                <span class="storage-badge" style="--badge-color: ${storageType.color}" title="${storageType.description || ''}">
                    ${storageType.icon} ${storageType.name}
                </span>
                ${metadataUrl && metadataUrl !== 'data:application/json' ? `
                <a href="${fixURI(metadataUrl)}" target="_blank" class="storage-link" title="View Metadata">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </a>` : ''}
            </div>
            
            <div class="storage-row">
                <span class="storage-label">${mediaType.icon} ${mediaType.label}:</span>
                <span class="storage-badge" style="--badge-color: ${imageStorageType.color}">
                    ${imageStorageType.icon} ${imageStorageType.name}
                </span>
                ${imageUrl ? `
                <a href="${fixURI(imageUrl)}" target="_blank" class="storage-link" title="View Image">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </a>` : ''}
            </div>
        `;
        
        // Add link to token on explorer
        if (explorer) {
            storageHtml += `
                <div class="storage-row">
                    <span class="storage-label">🔍 Explorer:</span>
                    <a href="${explorer}/token/${urlContract}?a=${urlTokenId}" target="_blank" class="storage-explorer-link">
                        ${t('viewOnExplorer')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>
                </div>
            `;
        }
        
        storageHtml += '</div>';
        metadataStorage.innerHTML = storageHtml;
    }
    
    console.log('[detectTokenStandards] Done');
}

function updateOwnerDisplay() {
    if (!nftOwner) return;
    const explorer = networkConfig?.explorer || '';
    const shortAddr = nftOwner.slice(0, 6) + '...' + nftOwner.slice(-4);
    const isYou = address && nftOwner.toLowerCase() === address.toLowerCase();
    
    const ownerShort = document.getElementById('ownerAddressShort');
    const ownerLink = document.getElementById('ownerLink');
    
    if (ownerShort) {
        ownerShort.textContent = isYou ? `${shortAddr} (${t('you')})` : shortAddr;
    }
    if (ownerLink && explorer) {
        ownerLink.href = `${explorer}/address/${nftOwner}`;
    }
}

function checkOwnership() {
    console.log('[checkOwnership] address:', address, 'nftOwner:', nftOwner);
    
    const listingCard = document.getElementById('listingCard');
    const actionsCard = document.getElementById('actionsCard');
    
    // Determine if current user is owner
    // Only true if both addresses exist and match
    const isOwner = !!(address && nftOwner && address.toLowerCase() === nftOwner.toLowerCase());
    console.log('[checkOwnership] isOwner:', isOwner);
    
    // Show listing card only to owner
    if (listingCard) {
        if (isOwner) {
            listingCard.classList.remove('hidden');
        } else {
            listingCard.classList.add('hidden');
        }
    }
    
    // Show actions card (make offer) to non-owners
    // This should be visible if: not connected OR connected but not owner
    if (actionsCard) {
        if (isOwner) {
            actionsCard.classList.add('hidden');
        } else {
            actionsCard.classList.remove('hidden');
        }
    }
    
    updateOwnerDisplay();
}

// Marketplace Functions
async function loadMarketplaceFee() {
    console.log('[loadMarketplaceFee] Starting...');
    if (!networkConfig?.marketplace || networkConfig.marketplace === '0x0000000000000000000000000000000000000000') {
        console.log('[loadMarketplaceFee] No marketplace configured');
        return;
    }
    try { 
        marketplaceFee = Number(await new ethers.Contract(networkConfig.marketplace, abis.marketplace, readProvider).marketplaceFee()); 
        console.log('[loadMarketplaceFee] Fee:', marketplaceFee);
    } catch (e) {
        console.log('[loadMarketplaceFee] Error:', e.message);
    }
}

async function loadOrders() {
    console.log('[loadOrders] Starting...', {
        marketplaceContract: !!marketplaceContract,
        networkConfig: !!networkConfig,
        marketplace: networkConfig?.marketplace
    });
    
    // Use marketplaceContract if available, otherwise create one with readProvider
    let marketplace = marketplaceContract;
    if (!marketplace && networkConfig?.marketplace && networkConfig.marketplace !== '0x0000000000000000000000000000000000000000') {
        try {
            marketplace = new ethers.Contract(networkConfig.marketplace, abis.marketplace, readProvider);
            console.log('[loadOrders] Created marketplace contract with readProvider');
        } catch (e) {
            console.log('[loadOrders] Could not create marketplace contract:', e.message);
        }
    }
    
    if (!marketplace) { 
        console.log('[loadOrders] No marketplace contract available');
        orders = []; 
        renderOrders(); 
        return; 
    }
    
    try { 
        console.log('[loadOrders] Fetching orders for:', urlContract, urlTokenId);
        const allOrders = await marketplace.getActiveOrders(urlContract, urlTokenId);
        console.log('[loadOrders] Raw orders:', allOrders);
        orders = allOrders.filter(o => o.active);
        console.log('[loadOrders] Active orders:', orders.length);
    } catch (e) { 
        console.log('[loadOrders] Error fetching orders:', e.message);
        orders = []; 
    }
    renderOrders();
}

function renderOrders() {
    console.log('[renderOrders] Starting with', orders.length, 'orders');
    console.log('[renderOrders] address:', address, 'nftOwner:', nftOwner);
    
    const list = document.getElementById('ordersList');
    if (!list) {
        console.log('[renderOrders] ordersList element not found!');
        return;
    }
    
    const sym = networkConfig?.nativeCurrency?.symbol || 'ETH';
    
    if (!orders.length) { 
        console.log('[renderOrders] No orders to display');
        list.innerHTML = `<p class="text-muted">${t('noOffers')}</p>`; 
        return; 
    }
    
    const isOwner = address && nftOwner && address.toLowerCase() === nftOwner.toLowerCase();
    console.log('[renderOrders] isOwner:', isOwner);
    
    const html = orders.map((o, i) => {
        const price = ethers.formatEther(o.price);
        const date = new Date(Number(o.createdAt) * 1000).toLocaleDateString();
        const isMine = address && o.buyer.toLowerCase() === address.toLowerCase();
        
        console.log(`[renderOrders] Order ${i}:`, { orderId: o.orderId, price, buyer: o.buyer, isMine });
        
        return `<div class="order-item">
            <div class="order-info">
                <span class="order-price">${parseFloat(price).toFixed(4)} ${sym}</span>
                <span class="order-from">${o.buyer.slice(0, 6)}...${o.buyer.slice(-4)}</span>
                <span class="order-date">${date}</span>
            </div>
            ${isOwner ? `<button class="btn btn-sm btn-primary" onclick="acceptOrder(${o.orderId})">${t('accept')}</button>` : ''}
            ${isMine ? `<button class="btn btn-sm btn-secondary" onclick="cancelOrder(${o.orderId})">${t('cancel')}</button>` : ''}
        </div>`;
    }).join('');
    
    console.log('[renderOrders] Setting innerHTML');
    list.innerHTML = html;
    console.log('[renderOrders] Done');
}

async function loadListing() {
    console.log('[loadListing] Starting...', { marketplaceContract: !!marketplaceContract });
    
    // Use marketplaceContract if available, otherwise create one with readProvider
    let marketplace = marketplaceContract;
    if (!marketplace && networkConfig?.marketplace && networkConfig.marketplace !== '0x0000000000000000000000000000000000000000') {
        try {
            marketplace = new ethers.Contract(networkConfig.marketplace, abis.marketplace, readProvider);
            console.log('[loadListing] Created marketplace contract with readProvider');
        } catch (e) {
            console.log('[loadListing] Could not create marketplace contract:', e.message);
        }
    }
    
    if (!marketplace) { 
        console.log('[loadListing] No marketplace contract');
        listing = null; 
        updateListingUI(); 
        return; 
    }
    
    try { 
        listing = await marketplace.getListing(urlContract, urlTokenId); 
        console.log('[loadListing] Got listing:', listing);
        if (!listing.active) {
            console.log('[loadListing] Listing not active');
            listing = null;
        }
    } catch (e) { 
        console.log('[loadListing] Error:', e.message);
        listing = null; 
    }
    updateListingUI();
}

function updateListingUI() {
    const sym = networkConfig?.nativeCurrency?.symbol || 'ETH';
    const isOwner = address && nftOwner && address.toLowerCase() === nftOwner.toLowerCase();
    
    const listingForm = document.getElementById('listingForm');
    const listingActive = document.getElementById('listingActive');
    const buyCard = document.getElementById('buyCard');
    const currentPrice = document.getElementById('currentPrice');
    const priceSymbol = document.getElementById('priceSymbol');
    const buyPrice = document.getElementById('buyPrice');
    const lastPrice = document.getElementById('lastPrice');
    
    // Always hide buy card for owner
    if (buyCard) {
        if (isOwner) {
            buyCard.classList.add('hidden');
        }
    }
    
    if (listing && listing.active) {
        const price = parseFloat(ethers.formatEther(listing.price)).toFixed(4);
        
        if (isOwner) {
            // Owner sees listing management
            if (listingForm) listingForm.classList.add('hidden');
            if (listingActive) listingActive.classList.remove('hidden');
            if (currentPrice) currentPrice.textContent = price;
            if (priceSymbol) priceSymbol.textContent = sym;
            if (buyCard) buyCard.classList.add('hidden'); // Never show buy to owner
        } else {
            // Non-owner sees buy option
            if (buyCard) buyCard.classList.remove('hidden');
            if (buyPrice) buyPrice.textContent = `${price} ${sym}`;
        }
        if (lastPrice) lastPrice.textContent = `${price} ${sym}`;
    } else {
        // No active listing
        if (isOwner) {
            if (listingForm) listingForm.classList.remove('hidden');
            if (listingActive) listingActive.classList.add('hidden');
        }
        if (buyCard) buyCard.classList.add('hidden');
    }
}

async function loadSalesHistory() {
    console.log('[loadSalesHistory] Starting...', { marketplaceContract: !!marketplaceContract, networkConfig: !!networkConfig });
    
    // Use read provider if no signer
    let marketplace = marketplaceContract;
    if (!marketplace && networkConfig?.marketplace && networkConfig.marketplace !== '0x0000000000000000000000000000000000000000') {
        try {
            marketplace = new ethers.Contract(networkConfig.marketplace, abis.marketplace, readProvider);
            console.log('[loadSalesHistory] Using readProvider');
        } catch (e) {
            console.log('[loadSalesHistory] Could not create marketplace contract:', e.message);
        }
    }
    
    if (!marketplace) { 
        console.log('[loadSalesHistory] No marketplace contract');
        salesHistory = []; 
        renderActivity(); 
        drawChart(); 
        return; 
    }
    
    try { 
        salesHistory = await marketplace.getSalesHistory(urlContract, urlTokenId); 
        console.log('[loadSalesHistory] Got history:', salesHistory.length, 'items');
    } catch (e) { 
        console.log('[loadSalesHistory] Error:', e.message);
        salesHistory = []; 
    }
    
    renderActivity();
    drawChart();
}

function renderActivity() {
    console.log('[renderActivity] Starting with', salesHistory.length, 'sales');
    
    const list = document.getElementById('activityList');
    const countEl = document.getElementById('salesCount');
    
    if (!list) {
        console.log('[renderActivity] activityList element not found!');
        return;
    }
    
    // Update count badge
    if (countEl) countEl.textContent = salesHistory.length;
    
    const sym = networkConfig?.nativeCurrency?.symbol || 'ETH';
    const explorer = networkConfig?.explorer || '';
    
    if (!salesHistory.length) { 
        console.log('[renderActivity] No sales history');
        list.innerHTML = `<p class="text-muted">${t('noActivity')}</p>`; 
        return; 
    }
    
    // Calculate royalty info
    const royaltyPercent = creatorFee || 0;
    const marketFeePercent = marketplaceFee ? marketplaceFee / 100 : 0;
    
    // Default QR link (NFT transactions on explorer)
    const nftExplorerUrl = explorer ? `${explorer}/token/${urlContract}?a=${urlTokenId}` : '';
    
    console.log('[renderActivity] Rendering', salesHistory.length, 'items');
    
    list.innerHTML = [...salesHistory].reverse().map((s, idx) => {
        const price = parseFloat(ethers.formatEther(s.price));
        const royaltyAmount = price * (royaltyPercent / 100);
        const marketFeeAmount = price * (marketFeePercent / 100);
        const sellerReceived = price - royaltyAmount - marketFeeAmount;
        const date = new Date(Number(s.timestamp) * 1000);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const txHash = s.txHash || null;
        const txLink = txHash && explorer ? `${explorer}/tx/${txHash}` : null;
        const sellerLink = explorer ? `${explorer}/address/${s.seller}` : '#';
        const buyerLink = explorer ? `${explorer}/address/${s.buyer}` : '#';
        
        // QR code URL - use transaction if available, otherwise NFT page
        const qrUrl = txLink || nftExplorerUrl;
        const qrCodeUrl = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}` : '';
        
        const txNum = salesHistory.length - idx;
        const sellerShort = `${s.seller.slice(0, 6)}...${s.seller.slice(-4)}`;
        const buyerShort = `${s.buyer.slice(0, 6)}...${s.buyer.slice(-4)}`;
        
        return `
        <div class="tx-accordion" id="txAccordion${txNum}">
            <button class="tx-accordion-header" onclick="toggleTxAccordion(${txNum})">
                <div class="tx-accordion-summary">
                    <span class="tx-accordion-date">${dateStr} ${timeStr}</span>
                    <span class="tx-accordion-parties">${sellerShort} → ${buyerShort}</span>
                    <span class="tx-accordion-price">${price.toFixed(4)} ${sym}</span>
                </div>
                <svg class="tx-accordion-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            <div class="tx-accordion-content">
                <div class="tx-receipt">
                    <div class="tx-receipt-header">
                        <div class="tx-receipt-logo">🧾</div>
                        <div class="tx-receipt-title">${t('saleReceipt')}</div>
                        <div class="tx-receipt-number">#${String(txNum).padStart(6, '0')}</div>
                    </div>
                    
                    <div class="tx-receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                    
                    <div class="tx-receipt-datetime">
                        ${dateStr} ${timeStr}
                    </div>
                    
                    <div class="tx-receipt-parties">
                        <div class="tx-receipt-party">
                            <span class="tx-receipt-party-label">${t('from')}</span>
                            <a href="${sellerLink}" target="_blank" class="tx-receipt-party-address">${sellerShort}</a>
                        </div>
                        <div class="tx-receipt-arrow">↓</div>
                        <div class="tx-receipt-party">
                            <span class="tx-receipt-party-label">${t('to')}</span>
                            <a href="${buyerLink}" target="_blank" class="tx-receipt-party-address">${buyerShort}</a>
                        </div>
                    </div>
                    
                    <div class="tx-receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                    
                    <div class="tx-receipt-breakdown">
                        <div class="tx-receipt-row">
                            <span>${t('salePrice')}</span>
                            <span>${price.toFixed(4)} ${sym}</span>
                        </div>
                        ${royaltyPercent > 0 ? `
                        <div class="tx-receipt-row deduction">
                            <span>${t('creatorRoyalty')} (${royaltyPercent.toFixed(1)}%)</span>
                            <span>-${royaltyAmount.toFixed(4)} ${sym}</span>
                        </div>` : ''}
                        ${marketFeePercent > 0 ? `
                        <div class="tx-receipt-row deduction">
                            <span>${t('marketplaceFee')} (${marketFeePercent.toFixed(1)}%)</span>
                            <span>-${marketFeeAmount.toFixed(4)} ${sym}</span>
                        </div>` : ''}
                    </div>
                    
                    <div class="tx-receipt-divider">= = = = = = = = = = = = = = = = = = = =</div>
                    
                    <div class="tx-receipt-total">
                        <span>${t('sellerReceived')}</span>
                        <span>${sellerReceived.toFixed(4)} ${sym}</span>
                    </div>
                    
                    <div class="tx-receipt-divider">- - - - - - - - - - - - - - - - - - - -</div>
                    
                    ${qrCodeUrl ? `
                    <div class="tx-receipt-qr">
                        <a href="${qrUrl}" target="_blank" title="${t('verifyOnBlockchain')}">
                            <img src="${qrCodeUrl}" alt="QR Code" class="tx-receipt-qr-img" />
                        </a>
                        <div class="tx-receipt-qr-label">${t('scanToVerify')}</div>
                    </div>
                    ` : ''}
                    
                    ${txHash ? `
                    <div class="tx-receipt-hash-container">
                        <span class="tx-receipt-hash-label">TX:</span>
                        <a href="${txLink}" target="_blank" class="tx-receipt-hash">${txHash.slice(0, 16)}...${txHash.slice(-8)}</a>
                    </div>
                    ` : ''}
                    
                    <div class="tx-receipt-footer">
                        ${t('thankYou')}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Toggle individual transaction accordion
function toggleTxAccordion(num) {
    const accordion = document.getElementById(`txAccordion${num}`);
    if (accordion) {
        accordion.classList.toggle('open');
    }
}

// Toggle sales history accordion
function toggleSalesHistory() {
    const accordion = document.getElementById('salesHistoryAccordion');
    if (accordion) {
        accordion.classList.toggle('open');
    }
}

function drawChart() {
    const ctx = document.getElementById('priceChart')?.getContext('2d');
    if (!ctx) return;
    
    const sym = networkConfig?.nativeCurrency?.symbol || 'ETH';
    if (priceChart) priceChart.destroy();
    
    // Create data with transaction number on X axis
    const prices = salesHistory.map(s => parseFloat(ethers.formatEther(s.price)));
    const maxPrice = Math.max(...prices, 0.1);
    const minPrice = Math.min(...prices, 0);
    
    const data = salesHistory.length 
        ? salesHistory.map((s, i) => ({ 
            x: i + 1,
            y: parseFloat(ethers.formatEther(s.price)),
            date: new Date(Number(s.timestamp) * 1000).toLocaleDateString()
        })) 
        : [{ x: 1, y: 0, date: '-' }];
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: { 
            datasets: [{ 
                label: `${t('price')} (${sym})`, 
                data, 
                borderColor: '#7c5cff', 
                backgroundColor: 'rgba(124, 92, 255, 0.1)', 
                fill: true, 
                tension: 0.3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#7c5cff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const item = items[0];
                            return `#${item.raw.x} - ${item.raw.date}`;
                        },
                        label: (item) => `${item.raw.y.toFixed(4)} ${sym}`
                    }
                }
            }, 
            scales: { 
                x: { 
                    type: 'linear',
                    title: {
                        display: true,
                        text: lang === 'es' ? 'Venta #' : 'Sale #',
                        color: 'rgba(255,255,255,0.5)',
                        font: { size: 10 }
                    },
                    ticks: {
                        stepSize: 1,
                        callback: (value) => `#${value}`,
                        color: 'rgba(255,255,255,0.5)'
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    min: 0.5,
                    max: Math.max(salesHistory.length, 1) + 0.5
                }, 
                y: { 
                    beginAtZero: minPrice > 0.5 ? false : true,
                    suggestedMin: minPrice * 0.9,
                    suggestedMax: maxPrice * 1.1,
                    title: {
                        display: true,
                        text: sym,
                        color: 'rgba(255,255,255,0.5)',
                        font: { size: 10 }
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.5)',
                        callback: (value) => value.toFixed(2)
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' } 
                } 
            } 
        }
    });
}

// Transactions
let pendingTransaction = null; // Store pending tx for retry

// Check if wallet is connected, show modal if not
function requireWallet() {
    if (!signer || !address) {
        showWalletModal();
        return false;
    }
    return true;
}

// Show transaction error modal
function showTxErrorModal(error, txFunction) {
    pendingTransaction = txFunction;
    
    // Parse error message
    let userMessage = '';
    let technicalDetails = '';
    
    if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        userMessage = lang === 'es' 
            ? '💸 Saldo insuficiente para completar esta transacción. Necesitas más fondos en tu wallet.'
            : '💸 Insufficient balance to complete this transaction. You need more funds in your wallet.';
    } else if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        // User rejected - don't show modal
        showToast(lang === 'es' ? 'Transacción cancelada' : 'Transaction cancelled', 'error');
        return;
    } else if (error.code === 'CALL_EXCEPTION') {
        userMessage = lang === 'es'
            ? '❌ La transacción falló en el contrato. Esto puede deberse a permisos insuficientes o condiciones no cumplidas.'
            : '❌ Transaction failed in the contract. This may be due to insufficient permissions or unmet conditions.';
    } else if (error.message?.includes('gas')) {
        userMessage = lang === 'es'
            ? '⛽ Error de gas. La transacción requiere más gas del estimado.'
            : '⛽ Gas error. The transaction requires more gas than estimated.';
    } else {
        userMessage = lang === 'es'
            ? '⚠️ Ocurrió un error al procesar la transacción.'
            : '⚠️ An error occurred while processing the transaction.';
    }
    
    // Build technical details
    technicalDetails = JSON.stringify({
        code: error.code,
        reason: error.reason,
        message: error.message,
        data: error.data?.message || error.data,
        transaction: error.transaction ? {
            to: error.transaction.to,
            data: error.transaction.data?.slice(0, 100) + '...'
        } : null
    }, null, 2);
    
    document.getElementById('txErrorMessage').textContent = userMessage;
    document.getElementById('txErrorDetailsText').textContent = technicalDetails;
    document.getElementById('txErrorModal').classList.add('visible');
    
    // Reset accordion
    document.querySelector('.tx-error-accordion')?.classList.remove('open');
    document.getElementById('txErrorDetails')?.classList.add('hidden');
}

// Toggle error details accordion
function toggleTxErrorDetails() {
    const accordion = document.querySelector('.tx-error-accordion');
    const details = document.getElementById('txErrorDetails');
    if (accordion && details) {
        accordion.classList.toggle('open');
        details.classList.toggle('hidden');
    }
}

// Retry transaction
async function retryTransaction() {
    closeModal('txErrorModal');
    if (pendingTransaction) {
        await pendingTransaction();
    }
}

async function makeOffer() {
    if (!requireWallet()) return;
    
    const amount = document.getElementById('offerAmount').value;
    if (!amount || parseFloat(amount) <= 0) { 
        showToast(lang === 'es' ? 'Monto inválido' : 'Invalid amount', 'error'); 
        return; 
    }
    
    try {
        showToast(lang === 'es' ? 'Enviando...' : 'Submitting...', 'success');
        const tx = await marketplaceContract.createOrder(urlContract, urlTokenId, { value: ethers.parseEther(amount) });
        await tx.wait();
        showToast(lang === 'es' ? '¡Oferta enviada!' : 'Offer submitted!', 'success');
        document.getElementById('offerAmount').value = '';
        await loadOrders();
    } catch (e) { 
        showTxErrorModal(e, () => makeOffer());
    }
}

async function acceptOrder(orderId) {
    if (!requireWallet()) return;
    
    try {
        if (!isApproved) { 
            showToast(lang === 'es' ? 'Aprobando...' : 'Approving...', 'success'); 
            await (await nftContract.setApprovalForAll(networkConfig.marketplace, true)).wait(); 
            isApproved = true; 
        }
        showToast(lang === 'es' ? 'Aceptando...' : 'Accepting...', 'success');
        await (await marketplaceContract.acceptOrder(orderId)).wait();
        showToast(lang === 'es' ? '¡Aceptada!' : 'Accepted!', 'success');
        window.location.reload();
    } catch (e) { 
        showTxErrorModal(e, () => acceptOrder(orderId));
    }
}

async function cancelOrder(orderId) {
    if (!requireWallet()) return;
    
    try { 
        showToast(lang === 'es' ? 'Cancelando...' : 'Cancelling...', 'success'); 
        await (await marketplaceContract.cancelOrder(orderId)).wait(); 
        showToast(lang === 'es' ? 'Cancelada' : 'Cancelled', 'success'); 
        await loadOrders(); 
    } catch (e) { 
        showTxErrorModal(e, () => cancelOrder(orderId));
    }
}

async function createListing() {
    if (!requireWallet()) return;
    
    const price = document.getElementById('listingPrice').value;
    if (!price || parseFloat(price) <= 0) { 
        showToast(lang === 'es' ? 'Precio inválido' : 'Invalid price', 'error'); 
        return; 
    }
    
    try {
        if (!isApproved) { 
            showToast(lang === 'es' ? 'Aprobando...' : 'Approving...', 'success'); 
            await (await nftContract.setApprovalForAll(networkConfig.marketplace, true)).wait(); 
            isApproved = true; 
        }
        showToast(lang === 'es' ? 'Listando...' : 'Listing...', 'success');
        await (await marketplaceContract.createListing(urlContract, urlTokenId, ethers.parseEther(price))).wait();
        showToast(lang === 'es' ? '¡Listado!' : 'Listed!', 'success');
        await loadListing();
    } catch (e) { 
        showTxErrorModal(e, () => createListing());
    }
}

async function cancelListing() {
    if (!requireWallet()) return;
    
    try { 
        showToast(lang === 'es' ? 'Cancelando...' : 'Cancelling...', 'success'); 
        await (await marketplaceContract.cancelListing(urlContract, urlTokenId)).wait(); 
        showToast(lang === 'es' ? 'Cancelado' : 'Cancelled', 'success'); 
        await loadListing(); 
    } catch (e) { 
        showTxErrorModal(e, () => cancelListing());
    }
}

async function buyNow() {
    if (!requireWallet()) return;
    if (!listing) return;
    
    try { 
        showToast(lang === 'es' ? 'Comprando...' : 'Buying...', 'success'); 
        await (await marketplaceContract.buyNow(urlContract, urlTokenId, { value: listing.price })).wait(); 
        showToast(lang === 'es' ? '¡Comprado!' : 'Purchased!', 'success'); 
        window.location.reload(); 
    } catch (e) { 
        showTxErrorModal(e, () => buyNow());
    }
}

// How It Works Modal
const howItWorksData = {
    offer: {
        title: { en: '💰 How Offers Work', es: '💰 Cómo Funcionan las Ofertas' },
        diagram: `sequenceDiagram
    participant Buyer
    participant Marketplace
    participant Blockchain
    
    Buyer->>Marketplace: createOrder(nftContract, tokenId)
    Note over Buyer: Sends ETH with transaction
    Marketplace->>Blockchain: Store order + lock ETH
    Blockchain-->>Marketplace: Order ID
    Marketplace-->>Buyer: Order created!
    
    Note over Marketplace: Owner can accept or buyer can cancel
    
    alt Owner accepts
        Marketplace->>Blockchain: Transfer NFT to buyer
        Marketplace->>Blockchain: Send ETH to seller (minus fees)
    else Buyer cancels
        Marketplace->>Buyer: Refund ETH
    end`,
        code: `function createOrder(address nftContract, uint256 tokenId) 
    external payable nonReentrant whenNotPaused 
{
    require(msg.value > 0, "Price must be > 0");
    
    IERC721 nft = IERC721(nftContract);
    require(nft.ownerOf(tokenId) != msg.sender, "Cannot bid on own NFT");
    
    uint256 orderId = _orderIdCounter++;
    
    orders[orderId] = Order({
        orderId: orderId,
        nftContract: nftContract,
        tokenId: tokenId,
        buyer: msg.sender,      // Who made the offer
        price: msg.value,       // ETH locked in contract
        createdAt: block.timestamp,
        active: true
    });
    
    emit OrderCreated(orderId, nftContract, tokenId, msg.sender, msg.value);
}`,
        explanation: {
            en: `<p><strong>Offers (Buy Orders)</strong> allow anyone to make an offer on any NFT, even if it's not listed for sale.</p>
<ol>
<li><strong>Create Offer:</strong> Buyer calls <code>createOrder()</code> and sends ETH with the transaction</li>
<li><strong>ETH Locked:</strong> The ETH is held in the marketplace contract until the offer is accepted or cancelled</li>
<li><strong>Owner Decision:</strong> The NFT owner can accept the offer at any time</li>
<li><strong>Accept:</strong> NFT transfers to buyer, ETH goes to seller (minus fees and royalties)</li>
<li><strong>Cancel:</strong> Buyer can cancel and get full ETH refund</li>
</ol>
<p>This is different from a listing because the buyer initiates the price negotiation.</p>`,
            es: `<p><strong>Las Ofertas (Buy Orders)</strong> permiten a cualquiera hacer una oferta por cualquier NFT, incluso si no está listado para venta.</p>
<ol>
<li><strong>Crear Oferta:</strong> El comprador llama a <code>createOrder()</code> y envía ETH con la transacción</li>
<li><strong>ETH Bloqueado:</strong> El ETH se mantiene en el contrato hasta que la oferta sea aceptada o cancelada</li>
<li><strong>Decisión del Dueño:</strong> El propietario del NFT puede aceptar la oferta en cualquier momento</li>
<li><strong>Aceptar:</strong> El NFT se transfiere al comprador, el ETH va al vendedor (menos comisiones y regalías)</li>
<li><strong>Cancelar:</strong> El comprador puede cancelar y recibir el reembolso completo</li>
</ol>
<p>Esto es diferente de un listado porque el comprador inicia la negociación del precio.</p>`
        }
    },
    listing: {
        title: { en: '🏷️ How Listings Work', es: '🏷️ Cómo Funcionan los Listados' },
        diagram: `sequenceDiagram
    participant Seller
    participant Marketplace
    participant NFT Contract
    
    Seller->>NFT Contract: setApprovalForAll(marketplace, true)
    Note over Seller: One-time approval
    
    Seller->>Marketplace: createListing(nftContract, tokenId, price)
    Marketplace->>Marketplace: Store listing info
    Note over Marketplace: NFT stays with seller until sold
    
    alt Update price
        Seller->>Marketplace: updateListing(newPrice)
    else Cancel listing
        Seller->>Marketplace: cancelListing()
    end`,
        code: `function createListing(
    address nftContract, 
    uint256 tokenId, 
    uint256 price
) external nonReentrant whenNotPaused {
    require(price > 0, "Price must be > 0");
    
    IERC721 nft = IERC721(nftContract);
    require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
    require(
        nft.isApprovedForAll(msg.sender, address(this)) || 
        nft.getApproved(tokenId) == address(this),
        "Marketplace not approved"
    );
    
    listings[nftContract][tokenId] = Listing({
        seller: msg.sender,
        price: price,
        createdAt: block.timestamp,
        active: true
    });
    
    emit Listed(nftContract, tokenId, msg.sender, price);
}`,
        explanation: {
            en: `<p><strong>Listings</strong> let NFT owners set a fixed price for instant purchase.</p>
<ol>
<li><strong>Approve:</strong> First, approve the marketplace to transfer your NFTs (one-time)</li>
<li><strong>Create Listing:</strong> Set your price - the NFT stays in your wallet</li>
<li><strong>Update:</strong> Change the price anytime with <code>updateListing()</code></li>
<li><strong>Cancel:</strong> Remove the listing with <code>cancelListing()</code></li>
<li><strong>Sale:</strong> When someone buys, the NFT transfers automatically</li>
</ol>
<p><strong>Important:</strong> The NFT never leaves your wallet until it's sold. The approval just allows the marketplace to transfer it when a sale happens.</p>`,
            es: `<p><strong>Los Listados</strong> permiten a los propietarios establecer un precio fijo para compra instantánea.</p>
<ol>
<li><strong>Aprobar:</strong> Primero, aprueba al marketplace para transferir tus NFTs (una sola vez)</li>
<li><strong>Crear Listado:</strong> Establece tu precio - el NFT permanece en tu wallet</li>
<li><strong>Actualizar:</strong> Cambia el precio en cualquier momento con <code>updateListing()</code></li>
<li><strong>Cancelar:</strong> Elimina el listado con <code>cancelListing()</code></li>
<li><strong>Venta:</strong> Cuando alguien compra, el NFT se transfiere automáticamente</li>
</ol>
<p><strong>Importante:</strong> El NFT nunca sale de tu wallet hasta que se vende. La aprobación solo permite al marketplace transferirlo cuando ocurre una venta.</p>`
        }
    },
    buy: {
        title: { en: '🛒 How Buy Now Works', es: '🛒 Cómo Funciona Comprar Ahora' },
        diagram: `sequenceDiagram
    participant Buyer
    participant Marketplace
    participant NFT Contract
    participant Seller
    participant Royalty Receiver
    participant Fee Recipient
    
    Buyer->>Marketplace: buyNow(nftContract, tokenId)
    Note over Buyer: Sends exact listing price
    
    Marketplace->>Marketplace: Calculate fees
    Marketplace->>NFT Contract: Transfer NFT to buyer
    Marketplace->>Royalty Receiver: Send royalties (EIP-2981)
    Marketplace->>Fee Recipient: Send marketplace fee
    Marketplace->>Seller: Send remaining ETH
    
    Marketplace-->>Buyer: Purchase complete!`,
        code: `function buyNow(address nftContract, uint256 tokenId) 
    external payable nonReentrant whenNotPaused 
{
    Listing storage listing = listings[nftContract][tokenId];
    require(listing.active, "Listing not active");
    require(msg.value >= listing.price, "Insufficient payment");
    require(listing.seller != msg.sender, "Cannot buy own NFT");
    
    listing.active = false;
    
    // Execute the sale with fee distribution
    _executeSale(nftContract, tokenId, listing.seller, msg.sender, listing.price);
    
    // Refund excess payment
    if (msg.value > listing.price) {
        payable(msg.sender).call{value: msg.value - listing.price}("");
    }
    
    emit Purchased(nftContract, tokenId, msg.sender, listing.seller, listing.price);
}`,
        explanation: {
            en: `<p><strong>Buy Now</strong> allows instant purchase at the listed price.</p>
<ol>
<li><strong>Check Listing:</strong> Verify the NFT is listed and price is correct</li>
<li><strong>Send ETH:</strong> Send exactly the listing price (or more)</li>
<li><strong>Fee Calculation:</strong>
    <ul>
        <li>Marketplace fee (e.g., 2.5%)</li>
        <li>Creator royalties via EIP-2981</li>
        <li>Remaining goes to seller</li>
    </ul>
</li>
<li><strong>Transfer:</strong> NFT moves from seller to buyer</li>
<li><strong>Refund:</strong> Any excess ETH is returned</li>
</ol>
<p>All of this happens in a single transaction - atomic and secure!</p>`,
            es: `<p><strong>Comprar Ahora</strong> permite la compra instantánea al precio listado.</p>
<ol>
<li><strong>Verificar Listado:</strong> Verificar que el NFT está listado y el precio es correcto</li>
<li><strong>Enviar ETH:</strong> Enviar exactamente el precio del listado (o más)</li>
<li><strong>Cálculo de Comisiones:</strong>
    <ul>
        <li>Comisión del marketplace (ej: 2.5%)</li>
        <li>Regalías del creador vía EIP-2981</li>
        <li>El resto va al vendedor</li>
    </ul>
</li>
<li><strong>Transferencia:</strong> El NFT pasa del vendedor al comprador</li>
<li><strong>Reembolso:</strong> Cualquier ETH extra se devuelve</li>
</ol>
<p>¡Todo esto ocurre en una sola transacción - atómica y segura!</p>`
        }
    },
    royalties: {
        title: { en: '👑 How Royalties Work', es: '👑 Cómo Funcionan las Regalías' },
        diagram: `sequenceDiagram
    participant Marketplace
    participant NFT Contract
    participant Creator
    
    Note over Marketplace: During any sale...
    
    Marketplace->>NFT Contract: royaltyInfo(tokenId, salePrice)
    NFT Contract-->>Marketplace: (receiver, royaltyAmount)
    
    alt Has royalties
        Marketplace->>Creator: Send royalty payment
        Note over Creator: Automatic payment!
    else No royalties
        Note over Marketplace: Full amount to seller
    end`,
        code: `function _executeSale(
    address nftContract, 
    uint256 tokenId, 
    address seller, 
    address buyer, 
    uint256 price
) internal {
    // Calculate marketplace fee
    uint256 marketplaceCut = (price * marketplaceFee) / 10000;
    uint256 sellerAmount = price - marketplaceCut;
    
    // Check for EIP-2981 royalties
    uint256 royaltyAmount = 0;
    address royaltyReceiver = address(0);
    
    try IERC2981(nftContract).royaltyInfo(tokenId, price) 
        returns (address receiver, uint256 amount) 
    {
        if (receiver != address(0) && amount > 0 && amount <= sellerAmount) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
            sellerAmount -= royaltyAmount;
        }
    } catch {}
    
    // Transfer NFT
    IERC721(nftContract).safeTransferFrom(seller, buyer, tokenId);
    
    // Distribute payments
    if (royaltyAmount > 0) {
        payable(royaltyReceiver).call{value: royaltyAmount}("");
    }
    payable(seller).call{value: sellerAmount}("");
    payable(feeRecipient).call{value: marketplaceCut}("");
}`,
        explanation: {
            en: `<p><strong>Royalties (EIP-2981)</strong> ensure creators earn from secondary sales.</p>
<ol>
<li><strong>EIP-2981 Standard:</strong> NFT contracts can implement <code>royaltyInfo()</code></li>
<li><strong>Query:</strong> Marketplace asks the NFT contract: "Who gets royalties and how much?"</li>
<li><strong>Calculation:</strong> Usually a percentage (e.g., 5% of sale price)</li>
<li><strong>Automatic:</strong> Paid automatically during every sale</li>
<li><strong>Fallback:</strong> If no royalties configured, seller gets full amount (minus marketplace fee)</li>
</ol>
<p><strong>Example:</strong> 100 ETH sale with 5% royalty and 2.5% marketplace fee:</p>
<ul>
<li>Creator receives: 5 ETH</li>
<li>Marketplace receives: 2.5 ETH</li>
<li>Seller receives: 92.5 ETH</li>
</ul>`,
            es: `<p><strong>Las Regalías (EIP-2981)</strong> aseguran que los creadores ganen de ventas secundarias.</p>
<ol>
<li><strong>Estándar EIP-2981:</strong> Los contratos NFT pueden implementar <code>royaltyInfo()</code></li>
<li><strong>Consulta:</strong> El marketplace pregunta al contrato NFT: "¿Quién recibe regalías y cuánto?"</li>
<li><strong>Cálculo:</strong> Usualmente un porcentaje (ej: 5% del precio de venta)</li>
<li><strong>Automático:</strong> Se paga automáticamente en cada venta</li>
<li><strong>Alternativa:</strong> Si no hay regalías configuradas, el vendedor recibe el monto completo (menos la comisión)</li>
</ol>
<p><strong>Ejemplo:</strong> Venta de 100 ETH con 5% de regalía y 2.5% de comisión:</p>
<ul>
<li>Creador recibe: 5 ETH</li>
<li>Marketplace recibe: 2.5 ETH</li>
<li>Vendedor recibe: 92.5 ETH</li>
</ul>`
        }
    }
};

function showHowItWorksModal(type) {
    const data = howItWorksData[type];
    if (!data) return;
    
    document.getElementById('howItWorksTitle').textContent = data.title[lang] || data.title.en;
    document.getElementById('contractCode').innerHTML = highlightSolidity(data.code);
    document.getElementById('explanationText').innerHTML = data.explanation[lang] || data.explanation.en;
    
    // Render Mermaid diagram
    const diagramContainer = document.getElementById('mermaidDiagram');
    diagramContainer.innerHTML = `<pre class="mermaid">${data.diagram}</pre>`;
    
    mermaid.initialize({ 
        startOnLoad: false, 
        theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose'
    });
    mermaid.run({ nodes: diagramContainer.querySelectorAll('.mermaid') });
    
    document.getElementById('howItWorksModal').classList.add('visible');
}

function highlightSolidity(code) {
    return code
        .replace(/\b(function|external|internal|public|private|view|pure|payable|returns|require|if|else|try|catch|emit|return)\b/g, '<span class="code-keyword">$1</span>')
        .replace(/\b(uint256|address|bool|string|bytes|mapping)\b/g, '<span class="code-type">$1</span>')
        .replace(/\b(msg\.sender|msg\.value|block\.timestamp|address\(this\))\b/g, '<span class="code-keyword">$1</span>')
        .replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>')
        .replace(/(".*?")/g, '<span class="code-string">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
}

// Check existing connection
async function checkConnection() {
    console.log('[checkConnection] Starting...');
    
    for (const { get, type } of [{ get: get0xAddress, type: 'oxaddress' }, { get: getMetaMask, type: 'metamask' }]) {
        const wp = get();
        if (!wp) continue;
        
        try {
            const accounts = await wp.request({ method: 'eth_accounts' });
            console.log('[checkConnection]', type, 'accounts:', accounts);
            
            const accountAddress = extractAddress(accounts, wp);
            
            if (accountAddress) {
                address = accountAddress;
                walletType = type;
                
                provider = new ethers.BrowserProvider(wp);
                const network = await provider.getNetwork();
                chainId = Number(network.chainId);
                
                if (chainId !== parseInt(urlChainId)) { 
                    await switchNetwork(wp); 
                    provider = new ethers.BrowserProvider(wp);
                }
                
                signer = await provider.getSigner();
                
                setupListeners(wp);
                await initContracts();
                await updateWalletUI();
                checkOwnership();
                
                console.log('[checkConnection] Connected via', type);
                break;
            }
        } catch (e) {
            console.log('[checkConnection]', type, 'error:', e.message);
        }
    }
}

// Init
async function init() {
    console.log('[init] NFT Marketplace Item v0.1.4');
    
    setTheme(localStorage.getItem('nft-theme') || 'light');
    document.getElementById('langToggle').textContent = lang.toUpperCase();
    
    if (!parseUrl()) { 
        document.getElementById('nftTitle').textContent = 'Invalid URL';
        return; 
    }
    
    try {
        const [cfgRes, abiRes] = await Promise.all([
            fetch(basePath + 'json/config.json'),
            fetch(basePath + 'json/abis.json')
        ]);
        if (!cfgRes.ok || !abiRes.ok) throw new Error('Config load failed');
        config = await cfgRes.json();
        abis = await abiRes.json();
    } catch (e) { 
        console.error('[init] Config error:', e);
        showToast('Error loading config', 'error'); 
        return; 
    }
    
    networkConfig = config.networks[urlChainId];
    if (!networkConfig) { document.getElementById('nftTitle').textContent = `Unsupported chain: ${urlChainId}`; return; }
    
    document.getElementById('networkName').textContent = networkConfig.name + ' • #' + urlTokenId;
    const badge = document.getElementById('networkBadge');
    if (badge) { badge.textContent = networkConfig.icon + ' ' + networkConfig.name; badge.style.background = networkConfig.color; }
    
    readProvider = new ethers.JsonRpcProvider(networkConfig.rpc);
    
    // Event listeners
    document.getElementById('themeToggle').onclick = toggleTheme;
    document.getElementById('langToggle').onclick = toggleLanguage;
    document.getElementById('connectBtn').onclick = showWalletModal;
    document.getElementById('disconnectBtn').onclick = disconnect;
    document.getElementById('makeOfferBtn').onclick = makeOffer;
    document.getElementById('listBtn').onclick = createListing;
    document.getElementById('cancelListingBtn').onclick = cancelListing;
    document.getElementById('buyBtn').onclick = buyNow;
    
    document.querySelectorAll('.modal-overlay').forEach(m => { m.onclick = e => { if (e.target === m) m.classList.remove('visible'); }; });
    
    // Initialize accordions (first two open by default)
    document.querySelectorAll('.accordion-header').forEach((h, i) => { if (i < 2) h.classList.add('active'); });
    
    updateUILanguage();
    
    console.log('[init] Loading marketplace fee...');
    await loadMarketplaceFee();
    
    console.log('[init] Loading NFT...');
    await loadNFT();
    
    console.log('[init] Loading orders (before connection)...');
    await loadOrders();
    
    console.log('[init] Loading sales history...');
    await loadSalesHistory();
    
    console.log('[init] Loading listing...');
    await loadListing();
    
    console.log('[init] Checking connection...');
    await checkConnection();
    
    // Re-render orders after connection check (in case address changed)
    console.log('[init] Re-rendering orders after connection check...');
    renderOrders();
    
    console.log('[init] Complete!');
}

// Global functions
window.connectWallet = connectWallet;
window.closeModal = closeModal;
window.acceptOrder = acceptOrder;
window.cancelOrder = cancelOrder;
window.toggleAccordion = toggleAccordion;
window.showHowItWorksModal = showHowItWorksModal;
window.toggleSalesHistory = toggleSalesHistory;
window.toggleTxAccordion = toggleTxAccordion;
window.toggleTxErrorDetails = toggleTxErrorDetails;
window.retryTransaction = retryTransaction;

// Update OG meta tags dynamically for social sharing
function updateOGTags(title, description, imageUrl) {
    const currentUrl = window.location.href;
    
    // Update OG tags
    const ogUrl = document.getElementById('og-url');
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const ogImage = document.getElementById('og-image');
    
    if (ogUrl) ogUrl.content = currentUrl;
    if (ogTitle) ogTitle.content = title;
    if (ogDescription) ogDescription.content = description;
    if (ogImage) ogImage.content = imageUrl;
    
    // Update Twitter tags
    const twitterUrl = document.getElementById('twitter-url');
    const twitterTitle = document.getElementById('twitter-title');
    const twitterDescription = document.getElementById('twitter-description');
    const twitterImage = document.getElementById('twitter-image');
    
    if (twitterUrl) twitterUrl.content = currentUrl;
    if (twitterTitle) twitterTitle.content = title;
    if (twitterDescription) twitterDescription.content = description;
    if (twitterImage) twitterImage.content = imageUrl;
    
    // Update page title
    document.title = title;
    
    // Update AddToAny data
    if (window.a2a) {
        window.a2a_config = window.a2a_config || {};
        window.a2a_config.linkurl = currentUrl;
        window.a2a_config.linkname = title;
    }
}

window.onload = init;
