/* ==================== Common JavaScript Functions ==================== */

// Oyuncu adını yükle
function loadPlayerName() {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
        // Navbar'da göstermek için adı kesip 15 karakter ile sınırla
        const displayName = savedName.length > 15 ? savedName.substring(0, 15) + '...' : savedName;
        document.getElementById('playerNameDisplay').textContent = displayName;
        document.getElementById('nameInput').value = savedName;
        document.getElementById('userNameDisplay').textContent = `Merhaba ${savedName}! 👋`;
    }
    
    // Puanı leaderboard'dan yükle
    loadScoreFromLeaderboard();
}

// Leaderboard'dan oyuncunun puanını yükle
function loadScoreFromLeaderboard() {
    try {
        const playerName = localStorage.getItem('playerName');
        if (!playerName) {
            // Puan göster (varsayılan 0)
            const scoreDisplay = document.getElementById('score-display');
            if (scoreDisplay) {
                scoreDisplay.textContent = 'Puan: 0';
            }
            return;
        }
        
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        const playerScore = leaderboard.find(item => item.name === playerName);
        
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            if (playerScore) {
                scoreDisplay.textContent = `Puan: ${playerScore.score}`;
            } else {
                scoreDisplay.textContent = 'Puan: 0';
            }
        }
    } catch (error) {
        console.error('Puan yüklenirken hata:', error);
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = 'Puan: 0';
        }
    }
}

// Oyuncu adını kaydet - ANINDA güncelle
function savePlayerName() {
    const nameInput = document.getElementById('nameInput').value.trim();
    
    if (nameInput === '') {
        alert('⚠️ Lütfen adınızı girin!');
        return;
    }
    
    if (nameInput.length > 15) {
        alert('⚠️ Ad çok uzun! (max 15 karakter)');
        return;
    }
    
    // localStorage'e kaydet
    localStorage.setItem('playerName', nameInput);
    
    // Navbar'daki adı anında güncelle (15 karaktere kesip göster)
    document.getElementById('playerNameDisplay').textContent = nameInput;
    document.getElementById('userNameDisplay').textContent = `Merhaba ${nameInput}! 👋`;
    
    // Tüm oyunlardaki display name'i güncelle (eğer açıksa)
    const displayNameElements = document.querySelectorAll('#displayName');
    displayNameElements.forEach(el => el.textContent = nameInput);
    
    // Oyunlar açıksa, currentPlayerName'i güncelle
    if (typeof currentPlayerName !== 'undefined') {
        currentPlayerName = nameInput;
    }
    
    // Başarı mesajı göster
    showNotification(`✅ Adınız kaydedildi: ${nameInput}`, 'success');
    
    // Menüyü kapat
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.classList.remove('show');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-weight: bold;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Oyuncu adını getir
function getPlayerName() {
    return localStorage.getItem('playerName') || 'Oyuncu';
}

// Kullanıcı menüsünü aç/kapat
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    menu.classList.toggle('show');
    // Menü açılırken adı yükle
    loadPlayerName();
}

// Sayfa yüklenmesi sırasında dış alana tıklanırsa menüyü kapat
document.addEventListener('click', function(event) {
    const menu = document.getElementById('user-menu');
    const userBtn = document.querySelector('.user-btn');
    
    if (menu && userBtn && !menu.contains(event.target) && !userBtn.contains(event.target)) {
        menu.classList.remove('show');
    }
});

// Sayfa yüklendiğinde adı göster
window.addEventListener('load', function() {
    loadPlayerName();
});

// Enter tuşu ile kaydet
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('nameInput');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                savePlayerName();
            }
        });
    }
});

// Kullanıcı başlatma fonksiyonu
async function initUser() {
    try {
        const response = await fetch('/api/user/init', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            // Puan ekranını güncelle
            const scoreDisplay = document.getElementById('score-display');
            if (scoreDisplay) {
                scoreDisplay.textContent = `Puan: ${data.user.total_score}`;
            }
            
            console.log('Kullanıcı başlatıldı:', data.user.username, 'Puan:', data.user.total_score);
            return data.user;
        }
    } catch (error) {
        console.error('Kullanıcı başlatılırken hata:', error);
    }
}

// Oyunu sıfırla
function resetGame() {
    if (confirm('Tüm ilerlemeyi sıfırlamak istediğine emin misin?')) {
        sessionStorage.clear();
        window.location.href = '/';
    }
}

// Oyunlara dön
function goToGames() {
    window.location.href = '/games';
}

// Sayfa yüklendiğinde kullanıcıyı başlat
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı zaten başlatılmadıysa başlat
    if (!sessionStorage.getItem('user_initialized')) {
        initUser().then(() => {
            sessionStorage.setItem('user_initialized', 'true');
        });
    }
});

// Hata gösterdim fonksiyonu
function showError(message) {
    alert('Hata: ' + message);
}

// Başarı mesajı göster
function showSuccess(message) {
    console.log('✓ ' + message);
}

// API isteği yapma fonksiyonu
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch('/api' + endpoint, options);
        return await response.json();
    } catch (error) {
        console.error('API çağrısı sırasında hata:', error);
        showError('Sunucu bağlantısı başarısız oldu.');
        return null;
    }
}

// Puan güncelleme fonksiyonu
async function updateUserScore() {
    try {
        const response = await fetch('/api/user/progress');
        const data = await response.json();
        
        if (data.success) {
            const scoreDisplay = document.getElementById('score-display');
            if (scoreDisplay) {
                scoreDisplay.textContent = `Puan: ${data.user.total_score}`;
            }
        }
    } catch (error) {
        console.error('Puan güncellenirken hata:', error);
    }
}

// Sayıyı formatla (1000 -> 1.000)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Modal kapatma
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Modalı aç
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Zamanlayıcı formatı (saniye -> MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Taş Kağıt Makas algoritması
function getRandomChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

// DNA dizisi oluştur
function generateRandomDNA(length) {
    const bases = ['A', 'T', 'G', 'C'];
    let dna = '';
    for (let i = 0; i < length; i++) {
        dna += bases[Math.floor(Math.random() * bases.length)];
    }
    return dna;
}

// RNA dizisi oluştur (DNA → RNA)
function dnaToRNA(dna) {
    return dna
        .replace(/T/g, 'U')
        .replace(/t/g, 'u');
}

// Kodon tablosu (mRNA → Amino Asit)
const codonTable = {
    'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
    'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser',
    'UAU': 'Tyr', 'UAC': 'Tyr', 'UAA': 'Stop', 'UAG': 'Stop',
    'UGU': 'Cys', 'UGC': 'Cys', 'UGA': 'Stop', 'UGG': 'Trp',
    'CUU': 'Leu', 'CUC': 'Leu', 'CUA': 'Leu', 'CUG': 'Leu',
    'CCU': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'CAU': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
    'CGU': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
    'AUU': 'Ile', 'AUC': 'Ile', 'AUA': 'Ile', 'AUG': 'Met',
    'ACU': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'AAU': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
    'AGU': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
    'GUU': 'Val', 'GUC': 'Val', 'GUA': 'Val', 'GUG': 'Val',
    'GCU': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'GAU': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
    'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly'
};

// Türkçe kodon adları
const codonNamesTR = {
    'Phe': 'Fenilalanin',
    'Leu': 'Lösin',
    'Ser': 'Serin',
    'Tyr': 'Tirosin',
    'Stop': 'Durma',
    'Cys': 'Sistein',
    'Trp': 'Triptofan',
    'Pro': 'Prolin',
    'His': 'Histidin',
    'Gln': 'Glutamin',
    'Arg': 'Arginin',
    'Ile': 'İzolösin',
    'Met': 'Metiyonin',
    'Thr': 'Treonin',
    'Asn': 'Asparagin',
    'Lys': 'Lizin',
    'Val': 'Valin',
    'Ala': 'Alanin',
    'Asp': 'Aspartik asit',
    'Glu': 'Glutamik asit',
    'Gly': 'Glisin'
};

// mRNA'yı proteine çevir
function translatemRNAToProtein(mrna) {
    const protein = [];
    
    // mRNA'yı kodonlara böl
    for (let i = 0; i < mrna.length; i += 3) {
        if (i + 3 <= mrna.length) {
            const codon = mrna.substring(i, i + 3);
            const aminoAcid = codonTable[codon];
            
            if (aminoAcid === 'Stop') {
                break; // Translasyon sonlandırıcı kodon
            }
            
            if (aminoAcid) {
                protein.push(aminoAcid);
            }
        }
    }
    
    return protein;
}

// Baz tamamlama kuralları
const basePairRules = {
    'A': 'T',
    'T': 'A',
    'G': 'C',
    'C': 'G'
};

// DNA'nın tamamlayıcı şeridini al
function getComplementaryDNA(dna) {
    return dna
        .split('')
        .map(base => basePairRules[base])
        .join('');
}

// Durum kontrol fonksiyonları
function isValidBase(base) {
    return ['A', 'T', 'G', 'C', 'U'].includes(base.toUpperCase());
}

function isValidDNA(dna) {
    return dna.split('').every(base => ['A', 'T', 'G', 'C'].includes(base.toUpperCase()));
}

function isValidRNA(rna) {
    return rna.split('').every(base => ['A', 'U', 'G', 'C'].includes(base.toUpperCase()));
}

// Local Storage fonksiyonları
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage save hatası:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('LocalStorage get hatası:', error);
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('LocalStorage remove hatası:', error);
    }
}

// Konsol kütüphanesi (Debug için)
const log = {
    info: (msg, data) => console.log('ℹ️', msg, data || ''),
    success: (msg, data) => console.log('✓', msg, data || ''),
    warn: (msg, data) => console.warn('⚠️', msg, data || ''),
    error: (msg, data) => console.error('❌', msg, data || '')
};

// Leaderboard İşlemleri
function updateLeaderboard(playerName, score) {
    if (!playerName || !score || score <= 0) {
        return false;
    }
    
    try {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        
        // Mevcut oyuncuyu bul
        const existingIndex = leaderboard.findIndex(item => item.name === playerName);
        
        if (existingIndex !== -1) {
            // Mevcut oyuncunun puanını güncelle (yüksek olanı tut)
            if (score > leaderboard[existingIndex].score) {
                leaderboard[existingIndex].score = score;
                leaderboard[existingIndex].date = new Date().toLocaleDateString('tr-TR');
                leaderboard[existingIndex].games = (leaderboard[existingIndex].games || 0) + 1;
            }
        } else {
            // Yeni oyuncu ekle
            leaderboard.push({
                name: playerName,
                score: score,
                date: new Date().toLocaleDateString('tr-TR'),
                games: 1
            });
        }
        
        // Puana göre sırala
        leaderboard.sort((a, b) => b.score - a.score);
        
        // localStorage'ye kaydet
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        
        return true;
    } catch (error) {
        console.error('Leaderboard güncellenirken hata:', error);
        return false;
    }
}

function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('leaderboard') || '[]');
    } catch (error) {
        console.error('Leaderboard yüklenirken hata:', error);
        return [];
    }
}

function removeLeaderboardEntry(playerName) {
    try {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        leaderboard = leaderboard.filter(item => item.name !== playerName);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        return true;
    } catch (error) {
        console.error('Leaderboard entry silinirken hata:', error);
        return false;
    }
}

// Export fonksiyonları (Node.js uyumluluğu için)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initUser,
        apiCall,
        formatNumber,
        formatTime,
        generateRandomDNA,
        dnaToRNA,
        getComplementaryDNA,
        translatemRNAToProtein,
        isValidBase,
        isValidDNA,
        isValidRNA,
        codonTable,
        basePairRules,
        updateLeaderboard,
        getLeaderboard,
        removeLeaderboardEntry
    };
}
