/* ============================================
   NFT Marketplace - Index
   v0.1.4 - Signature + Deploy + Mint
   ============================================ */

let config = null;
let abis = null;
let allNFTs = [];
let nftBytecode = null;
let provider = null;
let signer = null;
let address = null;
let chainId = null;
let currentNetwork = null;
let walletProvider = null;
let isVerified = false;
let ownedContracts = [];

// i18n
const translations = {
    en: {
        connectWallet: 'Connect Wallet',
        disconnect: 'Disconnect',
        searchPlaceholder: 'Search NFTs...',
        price: 'Price',
        offers: 'offers',
        noOffers: 'No offers',
        notListed: 'Not listed',
        noNFTs: 'No NFTs found',
        loading: 'Loading...',
        available: 'Available',
        notInstalled: 'Not Installed',
        walletLocked: 'Wallet is locked. Please unlock it and try again.',
        signToVerify: 'Sign to verify wallet ownership',
        verified: 'Verified!',
        signFailed: 'Signature cancelled',
        deployNFT: 'Deploy NFT Contract',
        mintNFT: 'Mint NFT',
        youAreOwner: 'You own this collection',
        createCollection: 'Create Collection',
        deployDescription: 'Deploy your own NFT contract on the blockchain',
        deploy: 'Deploy',
        mint: 'Mint',
        collectionName: 'Collection Name',
        collectionSymbol: 'Symbol',
        royaltyPercent: 'Royalty % (0-10)',
        deployingContract: 'Deploying contract...',
        contractDeployed: 'Contract deployed!',
        mintingNFT: 'Minting NFT...',
        nftMinted: 'NFT Minted!',
        noBytecode: 'Place nft.bytecode in /contracts/ to enable deployment',
        enterTokenURI: 'Token URI (metadata URL)',
        enterRecipient: 'Recipient address',
        selectWallet: 'Select Wallet',
        chooseWallet: 'Choose how you want to connect',
        download: 'Download',
        deployingOn: 'Deploying on:',
        advancedOptions: 'Advanced Options',
        hintName: 'The display name of your NFT collection',
        hintSymbol: 'Short identifier (like a ticker), 3-5 characters',
        hintBaseURI: 'URL prefix for token metadata (IPFS or HTTP)',
        hintMaxSupply: 'Maximum NFTs that can be minted',
        hintMintPrice: 'Price per mint (0 = free)',
        hintRoyaltyReceiver: 'Address to receive royalties (default: you)',
        hintRoyaltyFee: '% of secondary sales you receive',
        switchNetwork: 'Switch Network',
        switchingNetwork: 'Switching network...',
        lastTx: 'Last Sale',
        noTx: 'No sales',
        owner: 'Owner',
        share: 'Share'
    },
    es: {
        connectWallet: 'Conectar Wallet',
        disconnect: 'Desconectar',
        searchPlaceholder: 'Buscar NFTs...',
        price: 'Precio',
        offers: 'ofertas',
        noOffers: 'Sin ofertas',
        notListed: 'No listado',
        noNFTs: 'No se encontraron NFTs',
        loading: 'Cargando...',
        available: 'Disponible',
        notInstalled: 'No instalado',
        walletLocked: 'Wallet bloqueada. Desbloquéala e intenta de nuevo.',
        signToVerify: 'Firma para verificar propiedad de la wallet',
        verified: '¡Verificado!',
        signFailed: 'Firma cancelada',
        deployNFT: 'Crear Contrato NFT',
        mintNFT: 'Mintear NFT',
        youAreOwner: 'Eres dueño de esta colección',
        createCollection: 'Crear Colección',
        deployDescription: 'Despliega tu propio contrato NFT en la blockchain',
        deploy: 'Desplegar',
        mint: 'Mintear',
        collectionName: 'Nombre de Colección',
        collectionSymbol: 'Símbolo',
        royaltyPercent: 'Regalía % (0-10)',
        deployingContract: 'Desplegando contrato...',
        contractDeployed: '¡Contrato desplegado!',
        mintingNFT: 'Minteando NFT...',
        nftMinted: '¡NFT Minteado!',
        noBytecode: 'Coloca nft.bytecode en /contracts/ para habilitar despliegue',
        enterTokenURI: 'URI del Token (URL de metadata)',
        enterRecipient: 'Dirección del destinatario',
        selectWallet: 'Seleccionar Wallet',
        chooseWallet: 'Elige cómo quieres conectarte',
        download: 'Descargar',
        deployingOn: 'Desplegando en:',
        advancedOptions: 'Opciones Avanzadas',
        hintName: 'El nombre de tu colección NFT',
        hintSymbol: 'Identificador corto (como ticker), 3-5 caracteres',
        hintBaseURI: 'URL base para metadata (IPFS o HTTP)',
        hintMaxSupply: 'Máximo de NFTs que se pueden mintear',
        hintMintPrice: 'Precio por mint (0 = gratis)',
        hintRoyaltyReceiver: 'Dirección para recibir regalías (default: tú)',
        hintRoyaltyFee: '% de ventas secundarias que recibes',
        switchNetwork: 'Cambiar Red',
        switchingNetwork: 'Cambiando red...',
        lastTx: 'Última Venta',
        noTx: 'Sin ventas',
        owner: 'Dueño',
        share: 'Compartir'
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
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    if (allNFTs.length) renderNFTs();
}

// Theme
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
}

// Wallet Detection
function getMetaMask() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask && !window.ethereum.isOxAddress) {
        return window.ethereum;
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
        mmStatus.textContent = mm ? t('available') : t('notInstalled');
        mmStatus.className = 'wallet-option-status ' + (mm ? 'available' : 'unavailable');
    }
    if (oxStatus) {
        oxStatus.textContent = ox ? t('available') : t('notInstalled');
        oxStatus.className = 'wallet-option-status ' + (ox ? 'available' : 'unavailable');
    }
    
    const mmOpt = document.getElementById('metamaskOption');
    const oxOpt = document.getElementById('oxaddressOption');
    if (mmOpt) mmOpt.disabled = !mm;
    if (oxOpt) oxOpt.disabled = !ox;
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
    console.log('[connectWallet] Type:', type);
    
    const wp = type === 'metamask' ? getMetaMask() : get0xAddress();
    if (!wp) { 
        showToast(t('notInstalled'), 'error'); 
        return; 
    }
    
    try {
        closeModal('walletModal');
        
        const accounts = await wp.request({ method: 'eth_requestAccounts' });
        console.log('[connectWallet] Accounts:', accounts);
        
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
        console.log('[connectWallet] Address:', address);
        
        walletProvider = wp;
        provider = new ethers.BrowserProvider(wp);
        signer = await provider.getSigner();
        
        // Get current chain
        const network = await provider.getNetwork();
        chainId = Number(network.chainId);
        currentNetwork = config?.networks?.[chainId];
        console.log('[connectWallet] ChainId:', chainId, 'Network:', currentNetwork?.name);
        
        // Setup listeners
        if (wp.on) {
            wp.on('accountsChanged', async (accs) => {
                const newAddr = extractAddress(accs, wp);
                if (newAddr) { 
                    address = newAddr; 
                    isVerified = false;
                    await updateWalletUI();
                    await verifySignature();
                } else {
                    disconnect();
                }
            });
            wp.on('chainChanged', async (newChainId) => {
                chainId = parseInt(newChainId, 16);
                currentNetwork = config?.networks?.[chainId];
                provider = new ethers.BrowserProvider(wp);
                signer = await provider.getSigner();
                updateNetworkUI();
                await updateWalletUI();
            });
        }
        
        await updateWalletUI();
        updateNetworkUI();
        populateNetworkDropdown();
        
        // Show network selector
        document.getElementById('networkSelector').classList.remove('hidden');
        
        // Request signature verification
        await verifySignature();
        
        // Show deploy section
        document.getElementById('deploySection').classList.remove('hidden');
        
        // Check ownership of collections
        await checkCollectionOwnership();
        
        showToast(t('verified'), 'success');
    } catch (e) {
        console.error('[connectWallet] Error:', e);
        if (e.code === 4001) {
            showToast(t('signFailed'), 'error');
        } else {
            showToast(e.message || 'Error', 'error');
        }
    }
}

async function verifySignature() {
    if (!signer || !address) return;
    
    try {
        const message = `Sign to verify ownership of ${address}\n\nTimestamp: ${Date.now()}`;
        const signature = await signer.signMessage(message);
        
        // Verify signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
            isVerified = true;
            document.getElementById('walletVerified').classList.remove('hidden');
            console.log('[verifySignature] Verified!');
        }
    } catch (e) {
        console.log('[verifySignature] User declined:', e.message);
        isVerified = false;
    }
}

async function updateWalletUI() {
    if (!address) return;
    document.getElementById('walletInfo').classList.remove('hidden');
    document.getElementById('connectBtn').classList.add('hidden');
    document.getElementById('disconnectBtn').classList.remove('hidden');
    document.getElementById('walletAddress').textContent = address.slice(0, 6) + '...' + address.slice(-4);
    
    if (isVerified) {
        document.getElementById('walletVerified').classList.remove('hidden');
    }
    
    try {
        const bal = await provider.getBalance(address);
        document.getElementById('walletBalance').textContent = parseFloat(ethers.formatEther(bal)).toFixed(4) + ' SYS';
    } catch {}
}

function disconnect() {
    provider = signer = address = walletProvider = null;
    chainId = null;
    currentNetwork = null;
    isVerified = false;
    ownedContracts = [];
    document.getElementById('walletInfo').classList.add('hidden');
    document.getElementById('walletVerified').classList.add('hidden');
    document.getElementById('connectBtn').classList.remove('hidden');
    document.getElementById('disconnectBtn').classList.add('hidden');
    document.getElementById('deploySection').classList.add('hidden');
    document.getElementById('networkSelector').classList.add('hidden');
    renderNFTs();
    showToast(lang === 'es' ? 'Desconectado' : 'Disconnected', 'success');
}

// Network UI functions
function updateNetworkUI() {
    const iconEl = document.getElementById('currentNetworkIcon');
    const nameEl = document.getElementById('currentNetworkName');
    const deployBadge = document.getElementById('deployNetworkBadge');
    
    if (currentNetwork) {
        if (iconEl) iconEl.textContent = currentNetwork.icon || '🔗';
        if (nameEl) nameEl.textContent = currentNetwork.name || `Chain ${chainId}`;
        if (deployBadge) deployBadge.textContent = `${currentNetwork.icon || '🔗'} ${currentNetwork.name}`;
    } else {
        if (iconEl) iconEl.textContent = '⚠️';
        if (nameEl) nameEl.textContent = `Unknown (${chainId})`;
        if (deployBadge) deployBadge.textContent = `⚠️ Chain ${chainId}`;
    }
    
    // Update dropdown active state
    document.querySelectorAll('.network-option').forEach(opt => {
        const optChainId = parseInt(opt.dataset.chainId);
        opt.classList.toggle('active', optChainId === chainId);
    });
}

function populateNetworkDropdown() {
    const dropdown = document.getElementById('networkDropdown');
    if (!dropdown || !config?.networks) return;
    
    dropdown.innerHTML = Object.entries(config.networks).map(([netChainId, net]) => `
        <button class="network-option ${parseInt(netChainId) === chainId ? 'active' : ''}" 
                data-chain-id="${netChainId}" 
                onclick="switchToNetwork(${netChainId})">
            <span class="network-option-icon">${net.icon || '🔗'}</span>
            <span class="network-option-name">${net.name}</span>
            <span class="network-option-check">✓</span>
        </button>
    `).join('');
}

function toggleNetworkDropdown() {
    const dropdown = document.getElementById('networkDropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

async function switchToNetwork(targetChainId) {
    if (!walletProvider) return;
    
    targetChainId = parseInt(targetChainId);
    if (targetChainId === chainId) {
        toggleNetworkDropdown();
        return;
    }
    
    const targetNetwork = config?.networks?.[targetChainId];
    if (!targetNetwork) return;
    
    try {
        showToast(t('switchingNetwork'), 'success');
        
        const hexChainId = '0x' + targetChainId.toString(16);
        
        try {
            await walletProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }]
            });
        } catch (switchError) {
            // Chain not added, try to add it
            if (switchError.code === 4902) {
                await walletProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: hexChainId,
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpc],
                        blockExplorerUrls: targetNetwork.explorer ? [targetNetwork.explorer] : []
                    }]
                });
            } else {
                throw switchError;
            }
        }
        
        toggleNetworkDropdown();
    } catch (e) {
        console.error('[switchToNetwork] Error:', e);
        showToast(e.message || 'Switch failed', 'error');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const selector = document.getElementById('networkSelector');
    const dropdown = document.getElementById('networkDropdown');
    if (selector && dropdown && !selector.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastIcon').textContent = type === 'success' ? '✓' : '✕';
    document.getElementById('toastText').textContent = msg;
    toast.className = 'toast visible toast-' + type;
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

// Check if user owns any collections
async function checkCollectionOwnership() {
    if (!address || !config?.collections) return;
    
    ownedContracts = [];
    
    for (const col of config.collections) {
        const net = config.networks[col.chainId];
        if (!net) continue;
        
        try {
            const rpc = new ethers.JsonRpcProvider(net.rpc);
            const contract = new ethers.Contract(col.contract, abis.nft, rpc);
            const owner = await contract.owner();
            
            if (owner.toLowerCase() === address.toLowerCase()) {
                ownedContracts.push(col.contract.toLowerCase());
                console.log('[checkOwnership] User owns:', col.contract);
            }
        } catch (e) {
            // Contract might not have owner() function
        }
    }
    
    // Re-render to show mint buttons
    if (ownedContracts.length > 0) {
        renderNFTs();
    }
}

// Deploy NFT Contract
function showDeployModal() {
    if (!nftBytecode) {
        showToast(t('noBytecode'), 'error');
        return;
    }
    
    // Set default royalty receiver to current address
    const royaltyReceiver = document.getElementById('deployRoyaltyReceiver');
    if (royaltyReceiver && address) {
        royaltyReceiver.placeholder = address;
    }
    
    // Update network badge
    updateNetworkUI();
    
    document.getElementById('deployStatus').textContent = '';
    document.getElementById('deployModal').classList.add('visible');
}

function toggleAdvanced() {
    const toggle = document.querySelector('.form-advanced-toggle');
    const content = document.getElementById('advancedOptions');
    if (toggle && content) {
        toggle.classList.toggle('open');
        content.classList.toggle('open');
    }
}

async function deployContract() {
    if (!signer || !nftBytecode) return;
    
    const name = document.getElementById('deployName').value.trim();
    const symbol = document.getElementById('deploySymbol').value.trim();
    const baseURI = document.getElementById('deployBaseURI').value.trim();
    const maxSupply = parseInt(document.getElementById('deployMaxSupply').value) || 10000;
    const mintPrice = document.getElementById('deployMintPrice').value.trim() || '0';
    const royaltyReceiver = document.getElementById('deployRoyaltyReceiver').value.trim() || address;
    const royaltyFee = parseFloat(document.getElementById('deployRoyaltyFee').value) || 5;
    
    if (!name || !symbol) {
        showToast('Enter name and symbol', 'error');
        return;
    }
    
    const statusEl = document.getElementById('deployStatus');
    statusEl.textContent = t('deployingContract');
    
    // Convert values
    const mintPriceWei = ethers.parseEther(mintPrice);
    const royaltyBps = Math.round(royaltyFee * 100);
    
    // Different constructor signatures to try
    const constructorVariants = [
        // 7 args: name, symbol, baseURI, maxSupply, mintPrice, royaltyReceiver, royaltyFee
        {
            abi: ["constructor(string name_, string symbol_, string baseURI_, uint256 maxSupply_, uint256 mintPrice_, address royaltyReceiver_, uint96 royaltyFee_)"],
            args: [name, symbol, baseURI, maxSupply, mintPriceWei, royaltyReceiver, royaltyBps]
        },
        // 3 args: name, symbol, royaltyBps (simpler contract)
        {
            abi: ["constructor(string name_, string symbol_, uint96 royaltyFee_)"],
            args: [name, symbol, royaltyBps]
        },
        // 2 args: name, symbol (basic ERC721)
        {
            abi: ["constructor(string name_, string symbol_)"],
            args: [name, symbol]
        },
        // 4 args: name, symbol, baseURI, maxSupply
        {
            abi: ["constructor(string name_, string symbol_, string baseURI_, uint256 maxSupply_)"],
            args: [name, symbol, baseURI, maxSupply]
        },
        // 5 args: name, symbol, baseURI, maxSupply, mintPrice
        {
            abi: ["constructor(string name_, string symbol_, string baseURI_, uint256 maxSupply_, uint256 mintPrice_)"],
            args: [name, symbol, baseURI, maxSupply, mintPriceWei]
        },
        // 6 args: name, symbol, baseURI, maxSupply, mintPrice, royaltyReceiver
        {
            abi: ["constructor(string name_, string symbol_, string baseURI_, uint256 maxSupply_, uint256 mintPrice_, address royaltyReceiver_)"],
            args: [name, symbol, baseURI, maxSupply, mintPriceWei, royaltyReceiver]
        }
    ];
    
    let contract = null;
    let successfulVariant = null;
    
    for (const variant of constructorVariants) {
        try {
            console.log('[deployContract] Trying constructor with', variant.args.length, 'args:', variant.args);
            const factory = new ethers.ContractFactory(variant.abi, nftBytecode, signer);
            contract = await factory.deploy(...variant.args);
            successfulVariant = variant;
            console.log('[deployContract] Success with', variant.args.length, 'args');
            break;
        } catch (e) {
            console.log('[deployContract] Failed with', variant.args.length, 'args:', e.message);
            continue;
        }
    }
    
    if (!contract) {
        statusEl.textContent = 'Error: Could not match constructor. Check bytecode.';
        showToast('Deploy failed - constructor mismatch', 'error');
        return;
    }
    
    try {
        statusEl.textContent = `Waiting for confirmation... TX: ${contract.deploymentTransaction().hash.slice(0, 10)}...`;
        
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        
        statusEl.innerHTML = `✓ ${t('contractDeployed')}<br><code>${contractAddress}</code><br><a href="${currentNetwork?.explorer}/address/${contractAddress}" target="_blank" style="color:var(--primary)">View on Explorer →</a>`;
        showToast(t('contractDeployed'), 'success');
        
        // Add to owned contracts
        ownedContracts.push(contractAddress.toLowerCase());
        
        console.log('[deployContract] Deployed at:', contractAddress);
    } catch (e) {
        console.error('[deployContract] Error:', e);
        statusEl.textContent = 'Error: ' + (e.reason || e.message);
        showToast('Deploy failed', 'error');
    }
}

// Mint NFT
function showMintModal(contractAddress) {
    document.getElementById('mintContract').value = contractAddress;
    document.getElementById('mintRecipient').value = address || '';
    document.getElementById('mintTokenURI').value = '';
    document.getElementById('mintStatus').textContent = '';
    document.getElementById('mintModal').classList.add('visible');
}

async function mintNFT() {
    if (!signer) return;
    
    const contractAddress = document.getElementById('mintContract').value;
    const recipient = document.getElementById('mintRecipient').value.trim();
    const tokenURI = document.getElementById('mintTokenURI').value.trim();
    
    if (!recipient || !tokenURI) {
        showToast('Enter recipient and token URI', 'error');
        return;
    }
    
    const statusEl = document.getElementById('mintStatus');
    statusEl.textContent = t('mintingNFT');
    
    try {
        const contract = new ethers.Contract(contractAddress, abis.nft, signer);
        // Use mint() function - no value needed if owner is minting
        const tx = await contract.mint(recipient, tokenURI);
        statusEl.textContent = `Waiting... TX: ${tx.hash.slice(0, 10)}...`;
        
        await tx.wait();
        
        statusEl.textContent = '✓ ' + t('nftMinted');
        showToast(t('nftMinted'), 'success');
        
        // Reload NFTs
        setTimeout(() => {
            closeModal('mintModal');
            loadCollections();
        }, 1500);
    } catch (e) {
        console.error('[mintNFT] Error:', e);
        statusEl.textContent = 'Error: ' + (e.reason || e.message);
        showToast('Mint failed', 'error');
    }
}

// URL helper
function getItemUrl(chainId, contract, tokenId) {
    return `item/${chainId}/${contract}/${tokenId}`;
}

// Load Collections
async function loadCollections() {
    try {
        const [cfgRes, abiRes] = await Promise.all([
            fetch('json/config.json'),
            fetch('json/abis.json')
        ]);
        config = await cfgRes.json();
        abis = await abiRes.json();
        
        // Try to load bytecode
        try {
            const bytecodeRes = await fetch('contracts/nft.bytecode');
            if (bytecodeRes.ok) {
                nftBytecode = (await bytecodeRes.text()).trim();
                console.log('[loadCollections] Bytecode loaded');
            }
        } catch {
            console.log('[loadCollections] No bytecode file');
        }
        
        allNFTs = [];
        
        for (const col of config.collections || []) {
            const net = config.networks[col.chainId];
            if (!net) continue;
            
            try {
                const nfts = await loadNFTs(col, net);
                allNFTs.push(...nfts);
                renderNFTs();
                loadMarketplaceData(col, net);
            } catch (e) {
                console.error('Error loading:', col.contract, e);
            }
        }
        
        if (!allNFTs.length) {
            document.getElementById('nftGrid').innerHTML = `<div class="loading-state"><p>${t('noNFTs')}</p></div>`;
        }
        
    } catch (e) {
        console.error('Config error:', e);
        showToast('Error loading', 'error');
    }
}

async function loadNFTs(col, net) {
    const rpc = new ethers.JsonRpcProvider(net.rpc);
    const contract = new ethers.Contract(col.contract, abis.nft, rpc);
    const nfts = [];
    
    let collectionName = col.name || 'Collection';
    try { collectionName = await contract.name() || collectionName; } catch {}
    
    let total = 50;
    try { total = Math.min(Number(await contract.totalSupply()), 50); } catch {}
    
    let errors = 0;
    for (let id = 0; id < total && errors < 3; id++) {
        try {
            const owner = await contract.ownerOf(id);
            errors = 0;
            
            let image = '';
            
            try {
                let uri = await contract.tokenURI(id);
                uri = fixURI(uri);
                
                if (isImage(uri)) {
                    image = uri;
                } else if (uri.startsWith('data:application/json')) {
                    const meta = JSON.parse(atob(uri.split(',')[1]));
                    image = fixURI(meta.image || '');
                } else if (uri.startsWith('http')) {
                    try {
                        const res = await fetch(uri);
                        const ct = res.headers.get('content-type') || '';
                        if (ct.includes('image')) {
                            image = uri;
                        } else {
                            const txt = await res.text();
                            if (txt.startsWith('{')) {
                                const meta = JSON.parse(txt);
                                image = fixURI(meta.image || '');
                            }
                        }
                    } catch { image = uri; }
                }
            } catch {}
            
            nfts.push({
                chainId: col.chainId,
                contract: col.contract,
                tokenId: id,
                name: `Token #${id}`,
                image: image || `https://picsum.photos/seed/${col.contract}${id}/400`,
                owner,
                collection: collectionName,
                network: net,
                price: null,
                offerCount: 0
            });
        } catch {
            errors++;
        }
    }
    
    return nfts;
}

async function loadMarketplaceData(col, net) {
    if (!net.marketplace || net.marketplace === '0x0000000000000000000000000000000000000000') return;
    
    const rpc = new ethers.JsonRpcProvider(net.rpc);
    const marketplace = new ethers.Contract(net.marketplace, abis.marketplace, rpc);
    
    const collectionNFTs = allNFTs.filter(n => n.contract === col.contract && n.chainId === col.chainId);
    
    for (const nft of collectionNFTs) {
        try {
            // Load listing
            const listing = await marketplace.getListing(nft.contract, nft.tokenId);
            if (listing.active) nft.price = parseFloat(ethers.formatEther(listing.price));
            
            // Load offers
            try {
                const orders = await marketplace.getActiveOrders(nft.contract, nft.tokenId);
                nft.offerCount = orders.filter(o => o.active).length;
            } catch { nft.offerCount = 0; }
            
            // Load last sale
            try {
                const history = await marketplace.getSalesHistory(nft.contract, nft.tokenId);
                if (history && history.length > 0) {
                    const lastSale = history[history.length - 1];
                    nft.lastSale = {
                        buyer: lastSale.buyer,
                        price: parseFloat(ethers.formatEther(lastSale.price)),
                        timestamp: Number(lastSale.timestamp)
                    };
                }
            } catch { nft.lastSale = null; }
            
            updateNFTCard(nft);
        } catch {}
    }
}

function updateNFTCard(nft) {
    const card = document.querySelector(`a[href="${getItemUrl(nft.chainId, nft.contract, nft.tokenId)}"]`);
    if (!card) return;
    
    const sym = nft.network.nativeCurrency.symbol;
    const priceEl = card.querySelector('.nft-card-price');
    const offersEl = card.querySelector('.nft-card-offers');
    const lastTxEl = card.querySelector('.nft-card-last-tx');
    
    if (priceEl && nft.price !== null && nft.price > 0) {
        priceEl.innerHTML = `<span class="price-value">${nft.price.toFixed(4)}</span> ${sym}`;
        priceEl.classList.add('has-price');
    }
    
    if (offersEl && nft.offerCount > 0) {
        offersEl.innerHTML = `<span class="offer-badge">${nft.offerCount}</span> ${t('offers')}`;
        offersEl.classList.add('has-offers');
    }
    
    if (lastTxEl && nft.lastSale) {
        const date = new Date(nft.lastSale.timestamp * 1000).toLocaleDateString();
        lastTxEl.innerHTML = `
            <span class="nft-card-meta-label">${t('lastTx')}</span>
            <span class="last-tx-compact"><strong>${nft.lastSale.price.toFixed(4)} ${sym}</strong> • ${date}</span>
        `;
        lastTxEl.classList.add('has-tx');
    }
}

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

function renderNFTs() {
    const grid = document.getElementById('nftGrid');
    
    grid.innerHTML = allNFTs.map(nft => {
        const sym = nft.network.nativeCurrency.symbol;
        const explorer = nft.network.explorer || '';
        const ownerShort = nft.owner.slice(0, 6) + '...' + nft.owner.slice(-4);
        const ownerLink = explorer ? `${explorer}/address/${nft.owner}` : '#';
        
        const priceDisplay = nft.price !== null && nft.price > 0 
            ? `<span class="price-value">${nft.price.toFixed(4)}</span> ${sym}` 
            : t('notListed');
        const priceClass = nft.price !== null && nft.price > 0 ? 'has-price' : '';
        
        const offersDisplay = nft.offerCount > 0 
            ? `<span class="offer-badge">${nft.offerCount}</span> ${t('offers')}`
            : t('noOffers');
        const offersClass = nft.offerCount > 0 ? 'has-offers' : '';
        
        // Check if user owns this collection
        const isOwner = ownedContracts.includes(nft.contract.toLowerCase());
        const mintBtn = isOwner ? `<button class="btn btn-sm btn-mint" onclick="event.preventDefault(); showMintModal('${nft.contract}')">🎨 Mint</button>` : '';
        const ownerBadge = isOwner ? `<span class="collection-owner-badge">👑 ${t('owner')}</span>` : '';
        
        // Last transaction display - compact
        let lastTxDisplay = `<span class="no-sales">${t('noTx')}</span>`;
        let lastTxClass = '';
        if (nft.lastSale) {
            const date = new Date(nft.lastSale.timestamp * 1000).toLocaleDateString();
            lastTxDisplay = `<span class="last-tx-compact"><strong>${nft.lastSale.price.toFixed(4)} ${sym}</strong> • ${date}</span>`;
            lastTxClass = 'has-tx';
        }
        
        return `
        <a href="${getItemUrl(nft.chainId, nft.contract, nft.tokenId)}" class="nft-card">
            <div class="nft-card-image loading">
                <img src="${nft.image}" alt="${nft.name}"
                     onload="this.classList.add('loaded'); this.parentElement.classList.remove('loading')"
                     onerror="this.src='https://picsum.photos/seed/${nft.contract}${nft.tokenId}/400'; this.classList.add('loaded'); this.parentElement.classList.remove('loading')">
                <div class="nft-card-network" style="background:${nft.network.color}">${nft.network.icon} ${nft.network.name}</div>
                ${mintBtn}
            </div>
            <div class="nft-card-body">
                <div class="nft-card-collection">${nft.collection}</div>
                <div class="nft-card-name">${nft.name}</div>
                <div class="nft-card-owner">
                    <span class="nft-card-owner-link" onclick="event.preventDefault(); window.open('${ownerLink}', '_blank')">
                        ${ownerShort}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </span>
                    ${ownerBadge}
                </div>
                <div class="nft-card-meta">
                    <div class="nft-card-meta-item">
                        <span class="nft-card-meta-label">${t('price')}</span>
                        <span class="nft-card-meta-value nft-card-price ${priceClass}">${priceDisplay}</span>
                    </div>
                    <div class="nft-card-meta-item">
                        <span class="nft-card-meta-label">OFFERS</span>
                        <span class="nft-card-meta-value nft-card-offers ${offersClass}">${offersDisplay}</span>
                    </div>
                </div>
                <div class="nft-card-last-tx ${lastTxClass}">
                    <span class="nft-card-meta-label">${t('lastTx')}</span>
                    ${lastTxDisplay}
                </div>
            </div>
        </a>`;
    }).join('');
}

// Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.nft-card').forEach(card => {
                const name = card.querySelector('.nft-card-name')?.textContent.toLowerCase() || '';
                const col = card.querySelector('.nft-card-collection')?.textContent.toLowerCase() || '';
                card.style.display = name.includes(q) || col.includes(q) ? '' : 'none';
            });
        });
    }
}

// Check existing connection
async function checkConnection() {
    for (const { get, type } of [{ get: get0xAddress, type: 'oxaddress' }, { get: getMetaMask, type: 'metamask' }]) {
        const wp = get();
        if (!wp) continue;
        
        try {
            const accounts = await wp.request({ method: 'eth_accounts' });
            const addr = extractAddress(accounts, wp);
            
            if (addr) {
                address = addr;
                provider = new ethers.BrowserProvider(wp);
                signer = await provider.getSigner();
                await updateWalletUI();
                document.getElementById('deploySection').classList.remove('hidden');
                await checkCollectionOwnership();
                break;
            }
        } catch (e) {
            console.log('[checkConnection]', type, 'error:', e.message);
        }
    }
}

// Init
async function init() {
    console.log('[init] NFT Marketplace v0.1.4');
    
    setTheme(localStorage.getItem('nft-theme') || 'light');
    document.getElementById('langToggle').textContent = lang.toUpperCase();
    
    document.getElementById('themeToggle').onclick = toggleTheme;
    document.getElementById('langToggle').onclick = toggleLanguage;
    document.getElementById('connectBtn').onclick = showWalletModal;
    document.getElementById('disconnectBtn').onclick = disconnect;
    
    document.querySelectorAll('.modal-overlay').forEach(m => {
        m.onclick = e => { if (e.target === m) m.classList.remove('visible'); };
    });
    
    updateUILanguage();
    await loadCollections();
    setupSearch();
    await checkConnection();
}

window.connectWallet = connectWallet;
window.closeModal = closeModal;
window.showDeployModal = showDeployModal;
window.deployContract = deployContract;
window.showMintModal = showMintModal;
window.mintNFT = mintNFT;
window.toggleAdvanced = toggleAdvanced;
window.toggleNetworkDropdown = toggleNetworkDropdown;
window.switchToNetwork = switchToNetwork;

window.onload = init;
