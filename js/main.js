// 全局变量
let allWords = [];
let currentWords = [];
let currentIndex = 0;
let currentCategory = 'all';
let isMeaningVisible = true;

// DOM 元素
const japaneseText = document.getElementById('japaneseText');
const pronunciation = document.getElementById('pronunciation');
const meaning = document.getElementById('meaning');
const cardNumber = document.getElementById('cardNumber');
const cardCategory = document.getElementById('cardCategory');
const currentCategoryCount = document.getElementById('currentCategoryCount');
const learnedCount = document.getElementById('learnedCount');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const toggleBtn = document.getElementById('toggleBtn');
const categoryButtons = document.querySelectorAll('.category-btn');

// 初始化
async function init() {
    try {
        const response = await fetch('data/words.json');
        const data = await response.json();
        allWords = data.words;
        currentWords = [...allWords];
        
        // 从 localStorage 读取学习进度
        loadProgress();
        
        // 随机打乱初始顺序
        shuffleWords();
        updateCard();
        updateStats();
    } catch (error) {
        console.error('加载词汇数据失败:', error);
        alert('加载词汇数据失败，请检查文件路径');
    }
}

// 加载学习进度
function loadProgress() {
    const saved = localStorage.getItem('japanese_learned');
    if (saved) {
        const learned = JSON.parse(saved);
        learnedCount.textContent = learned.length;
    }
}

// 保存学习进度
function saveProgress(wordId) {
    let learned = JSON.parse(localStorage.getItem('japanese_learned') || '[]');
    if (!learned.includes(wordId)) {
        learned.push(wordId);
        localStorage.setItem('japanese_learned', JSON.stringify(learned));
        learnedCount.textContent = learned.length;
    }
}

// 更新卡片内容
function updateCard() {
    if (currentWords.length === 0) {
        japaneseText.textContent = '暂无词汇';
        pronunciation.textContent = '';
        meaning.textContent = '请选择其他分类';
        return;
    }

    const word = currentWords[currentIndex];
    japaneseText.textContent = word.japanese;
    pronunciation.textContent = word.pronunciation;
    meaning.textContent = word.meaning;
    
    // 更新卡片编号和分类
    cardNumber.textContent = `${currentIndex + 1} / ${currentWords.length}`;
    const categoryNames = {
        'all': '全部',
        'greetings': '问候语',
        'daily': '日常用语',
        'numbers': '数字',
        'food': '食物'
    };
    cardCategory.textContent = categoryNames[word.category] || word.category;
    
    // 重置显示状态
    isMeaningVisible = true;
    meaning.classList.remove('hidden');
    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏';
    
    // 保存学习进度
    saveProgress(word.id);
}

// 更新统计信息
function updateStats() {
    currentCategoryCount.textContent = currentWords.length;
}

// 切换到上一个
function prevWord() {
    if (currentWords.length === 0) return;
    currentIndex = (currentIndex - 1 + currentWords.length) % currentWords.length;
    updateCard();
    addFlipAnimation();
}

// 切换到下一个
function nextWord() {
    if (currentWords.length === 0) return;
    currentIndex = (currentIndex + 1) % currentWords.length;
    updateCard();
    addFlipAnimation();
}

// 随机打乱
function shuffleWords() {
    if (currentWords.length === 0) return;
    
    // Fisher-Yates 洗牌算法
    for (let i = currentWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
    }
    
    currentIndex = 0;
    updateCard();
    addFlipAnimation();
}

// 切换分类
function changeCategory(category) {
    currentCategory = category;
    currentIndex = 0;
    
    // 更新按钮状态
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // 筛选词汇
    if (category === 'all') {
        currentWords = [...allWords];
    } else {
        currentWords = allWords.filter(word => word.category === category);
    }
    
    // 打乱顺序
    shuffleWords();
    updateStats();
}

// 切换显示/隐藏意思
function toggleMeaning() {
    isMeaningVisible = !isMeaningVisible;
    if (isMeaningVisible) {
        meaning.classList.remove('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> 隐藏';
    } else {
        meaning.classList.add('hidden');
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i> 显示';
    }
}

// 添加翻转动画
function addFlipAnimation() {
    const card = document.querySelector('.word-card');
    card.classList.add('card-flip');
    setTimeout(() => {
        card.classList.remove('card-flip');
    }, 500);
}

// 事件监听
prevBtn.addEventListener('click', prevWord);
nextBtn.addEventListener('click', nextWord);
shuffleBtn.addEventListener('click', shuffleWords);
toggleBtn.addEventListener('click', toggleMeaning);

// 分类按钮事件
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        changeCategory(btn.dataset.category);
    });
});

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            prevWord();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextWord();
            break;
        case ' ':
            e.preventDefault();
            toggleMeaning();
            break;
        case 'r':
        case 'R':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                shuffleWords();
            }
            break;
    }
});

// 初始化应用
init();

