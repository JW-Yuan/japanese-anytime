// 全局变量
let dataConfig = {};
let allWordsCache = []; // 缓存所有词汇（用于初始随机选择）
let currentWords = [];
let currentIndex = 0;
let currentMode = 'category';
let currentFilter = '';

// DOM 元素
const japaneseText = document.getElementById('japaneseText');
const pronunciation = document.getElementById('pronunciation');
const meaning = document.getElementById('meaning');
const wordType = document.getElementById('wordType');
const cardNumber = document.getElementById('cardNumber');
const cardNLevel = document.getElementById('cardNLevel');
const cardBook = document.getElementById('cardBook');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const audioBtn = document.getElementById('audioBtn');
const categorySidebar = document.getElementById('categorySidebar');
const sidebarTrigger = document.getElementById('sidebarTrigger');
const sidebarTriggerIcon = document.getElementById('sidebarTriggerIcon');

const modeTabs = document.querySelectorAll('.mode-tab');
const categorySelect = document.getElementById('category-select');
const nlevelSelect = document.getElementById('nlevel-select');
const bookSelect = document.getElementById('book-select');

// 初始化
async function init() {
    try {
        // 加载配置
        const configResponse = await fetch('data/config.json');
        dataConfig = await configResponse.json();
        
        // 初始化下拉框选项
        initSelectOptions();
        
        // 初始化事件监听
        initEventListeners();
        
        // 初始化边栏状态（默认收起）
        categorySidebar.classList.add('collapsed');
        
        // 加载所有词汇用于初始随机选择
        await loadAllWords();
        
        // 初始随机显示一个单词
        if (allWordsCache.length > 0) {
            currentWords = [...allWordsCache];
            currentIndex = Math.floor(Math.random() * currentWords.length);
            updateCard();
        }
    } catch (error) {
        console.error('初始化失败:', error);
        alert('加载配置失败，请检查文件路径');
    }
}

// 加载所有词汇（用于初始随机选择）
async function loadAllWords() {
    allWordsCache = [];
    
    // 从所有文件夹加载词汇
    const loadPromises = [];
    
    // 加载category文件夹
    Object.keys(dataConfig.categories).forEach(key => {
        loadPromises.push(
            fetch(`data/category/${key}.json`)
                .then(res => res.json())
                .then(data => data.words || [])
                .catch(() => [])
        );
    });
    
    // 加载nlevel文件夹
    dataConfig.nLevels.forEach(level => {
        loadPromises.push(
            fetch(`data/nlevel/${level}.json`)
                .then(res => res.json())
                .then(data => data.words || [])
                .catch(() => [])
        );
    });
    
    // 加载book文件夹
    dataConfig.books.forEach(book => {
        loadPromises.push(
            fetch(`data/book/${book}.json`)
                .then(res => res.json())
                .then(data => data.words || [])
                .catch(() => [])
        );
    });
    
    const results = await Promise.all(loadPromises);
    results.forEach(words => {
        allWordsCache.push(...words);
    });
    
    // 去重（根据id）
    const uniqueMap = new Map();
    allWordsCache.forEach(word => {
        if (!uniqueMap.has(word.id)) {
            uniqueMap.set(word.id, word);
        }
    });
    allWordsCache = Array.from(uniqueMap.values());
}

// 初始化事件监听
function initEventListeners() {
    prevBtn.addEventListener('click', prevWord);
    nextBtn.addEventListener('click', nextWord);
    shuffleBtn.addEventListener('click', shuffleWords);
    audioBtn.addEventListener('click', playAudio);
    
    // 侧边栏切换事件（点击展开/收起）
    sidebarTrigger.addEventListener('click', () => {
        categorySidebar.classList.toggle('collapsed');
        categorySidebar.classList.toggle('expanded');
        
        // 切换图标
        if (categorySidebar.classList.contains('expanded')) {
            sidebarTriggerIcon.classList.remove('fa-bars');
            sidebarTriggerIcon.classList.add('fa-times');
        } else {
            sidebarTriggerIcon.classList.remove('fa-times');
            sidebarTriggerIcon.classList.add('fa-bars');
        }
    });
    
    // 模式标签页事件
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            changeMode(tab.dataset.mode);
        });
    });
    
    // 下拉框change事件
    categorySelect.addEventListener('change', (e) => {
        if (currentMode === 'category') {
            loadWords('category', e.target.value);
        }
    });
    
    nlevelSelect.addEventListener('change', (e) => {
        if (currentMode === 'nlevel') {
            loadWords('nlevel', e.target.value);
        }
    });
    
    bookSelect.addEventListener('change', (e) => {
        if (currentMode === 'book') {
            loadWords('book', e.target.value);
        }
    });
    
    // 键盘快捷键支持
    document.addEventListener('keydown', handleKeyboard);
}

// 键盘快捷键处理
function handleKeyboard(e) {
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            prevWord();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextWord();
            break;
        case 'r':
        case 'R':
            shuffleWords();
            break;
    }
}

// 初始化下拉框选项
function initSelectOptions() {
    // 初始化分类下拉框
    Object.keys(dataConfig.categories).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = dataConfig.categories[key];
        categorySelect.appendChild(option);
    });
    
    // 初始化N级别下拉框
    dataConfig.nLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        nlevelSelect.appendChild(option);
    });
    
    // 初始化词书下拉框
    dataConfig.books.forEach(book => {
        const option = document.createElement('option');
        option.value = book;
        option.textContent = book.replace('标准日本语', '标日');
        bookSelect.appendChild(option);
    });
}

// 加载词汇数据
async function loadWords(mode, filter) {
    if (!filter) {
        currentWords = [...allWordsCache];
        currentIndex = Math.floor(Math.random() * currentWords.length);
        updateCard();
        return;
    }
    
    try {
        let filePath = '';
        
        switch(mode) {
            case 'category':
                filePath = `data/category/${filter}.json`;
                break;
            case 'nlevel':
                filePath = `data/nlevel/${filter}.json`;
                break;
            case 'book':
                filePath = `data/book/${filter}.json`;
                break;
        }
        
        const response = await fetch(filePath);
        if (!response.ok) {
            // 文件不存在或其他错误，显示暂无词汇
            currentWords = [];
            currentFilter = filter;
            currentIndex = 0;
            updateCard();
            return;
        }
        const data = await response.json();
        currentWords = data.words || [];
        currentFilter = filter;
        currentIndex = 0;
        
        if (currentWords.length > 0) {
            shuffleWords();
        } else {
            updateCard();
        }
    } catch (error) {
        console.error('加载词汇失败:', error);
        // 静默处理错误，只显示暂无词汇
        currentWords = [];
        currentFilter = filter;
        currentIndex = 0;
        updateCard();
    }
}

// 更新卡片内容
function updateCard() {
    if (currentWords.length === 0) {
        japaneseText.textContent = '暂无词汇';
        pronunciation.textContent = '';
        meaning.textContent = '该分类暂无词汇';
        cardNLevel.textContent = '';
        cardBook.textContent = '';
        wordType.textContent = '';
        cardNumber.textContent = '0 / 0';
        clearAllDetails();
        return;
    }

    const word = currentWords[currentIndex];
    japaneseText.textContent = word.japanese;
    pronunciation.textContent = word.pronunciation || '';
    meaning.textContent = word.meaning;
    
    // 更新卡片编号和标签
    cardNumber.textContent = `${currentIndex + 1} / ${currentWords.length}`;
    cardNLevel.textContent = word.nLevel || '';
    cardBook.textContent = word.book ? word.book.replace('标准日本语', '标日') : '';
    
    // 更新词性
    if (word.wordType) {
        wordType.textContent = word.wordType;
        wordType.style.display = 'block';
    } else {
        wordType.style.display = 'none';
    }
    
    // 更新详情面板
    updateDetailPanels(word);
}

// 清空所有详情
function clearAllDetails() {
    document.getElementById('wordAnalysisBox').classList.add('empty');
    document.getElementById('examplesBox').classList.add('empty');
    document.getElementById('affixBox').classList.add('empty');
    document.getElementById('culturalBox').classList.add('empty');
    document.getElementById('wordFormsBox').classList.add('empty');
    document.getElementById('collocationsBox').classList.add('empty');
    document.getElementById('memoryTipsBox').classList.add('empty');
    document.getElementById('storyBox').classList.add('empty');
}

// 更新详情面板
function updateDetailPanels(word) {
    // 词义分析
    updateWordAnalysis(word.wordAnalysis);
    
    // 例句
    updateExamples(word.examples);
    
    // 构词分析
    updateAffix(word.affix, word.wordRoot);
    
    // 文化背景
    updateCulturalBackground(word.culturalBackground);
    
    // 单词变形
    updateWordForms(word.wordForms);
    
    // 固定搭配
    updateCollocations(word.collocations);
    
    // 记忆技巧
    updateMemoryTips(word.memoryTips);
    
    // 小故事
    updateStory(word.story);
}

// 更新词义分析
function updateWordAnalysis(analysis) {
    const box = document.getElementById('wordAnalysisBox');
    const content = document.getElementById('wordAnalysisContent');
    
    if (!analysis || (!analysis.basic && !analysis.etymology)) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '';
    if (analysis.basic) {
        html += `<p class="analysis-text"><strong>基本含义：</strong>${analysis.basic}</p>`;
    }
    if (analysis.etymology) {
        html += `<p class="analysis-text"><strong>词源：</strong>${analysis.etymology}</p>`;
    }
    content.innerHTML = html;
}

// 更新例句
function updateExamples(examples) {
    const box = document.getElementById('examplesBox');
    const content = document.getElementById('examplesContent');
    
    if (!examples || examples.length === 0) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '<div class="examples-list">';
    examples.forEach((example, index) => {
        html += `<div class="example-item">
            <div class="example-number">${index + 1}</div>
            <div class="example-content">
                <div class="example-japanese">${example.japanese}</div>
                ${example.pronunciation ? `<div class="example-pronunciation">${example.pronunciation}</div>` : ''}
                <div class="example-chinese">${example.chinese}</div>
            </div>
        </div>`;
    });
    html += '</div>';
    content.innerHTML = html;
}

// 更新构词分析
function updateAffix(affix, wordRoot) {
    const box = document.getElementById('affixBox');
    const content = document.getElementById('affixContent');
    
    if (!affix && !wordRoot) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '';
    
    if (wordRoot) {
        html += `<div class="word-root">
            <strong>词根：</strong>${wordRoot.root}（${wordRoot.meaning}）
            ${wordRoot.derivedWords ? `<br><span class="derived-words">相关词：${wordRoot.derivedWords.join('、')}</span>` : ''}
        </div>`;
    }
    
    if (affix && affix.components) {
        html += `<div class="affix-components">
            <strong>构词成分：</strong>
            <ul class="components-list">`;
        affix.components.forEach(comp => {
            html += `<li><strong>${comp.part}</strong>（${comp.type}）- ${comp.meaning}</li>`;
        });
        html += `</ul></div>`;
        if (affix.relatedWords) {
            html += `<div class="related-words"><strong>相关词：</strong>${affix.relatedWords.join('、')}</div>`;
        }
    }
    
    content.innerHTML = html || '<p>暂无数据</p>';
}

// 更新文化背景
function updateCulturalBackground(cultural) {
    const box = document.getElementById('culturalBox');
    const content = document.getElementById('culturalContent');
    
    if (!cultural) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '';
    if (cultural.origin) html += `<p><strong>来源：</strong>${cultural.origin}</p>`;
    if (cultural.usage) html += `<p><strong>用法：</strong>${cultural.usage}</p>`;
    if (cultural.context) html += `<p><strong>使用场景：</strong>${cultural.context}</p>`;
    content.innerHTML = html || '<p>暂无数据</p>';
}

// 更新单词变形
function updateWordForms(wordForms) {
    const box = document.getElementById('wordFormsBox');
    const content = document.getElementById('wordFormsContent');
    
    if (!wordForms) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '<ul class="word-forms-list">';
    if (wordForms.formal) html += `<li><strong>正式形：</strong>${wordForms.formal}</li>`;
    if (wordForms.casual) html += `<li><strong>口语形：</strong>${wordForms.casual}</li>`;
    if (wordForms.noun) html += `<li><strong>名词形：</strong>${wordForms.noun}</li>`;
    if (wordForms.verb) html += `<li><strong>动词形：</strong>${wordForms.verb}</li>`;
    if (wordForms.teForm) html += `<li><strong>て形：</strong>${wordForms.teForm}</li>`;
    if (wordForms.past) html += `<li><strong>过去形：</strong>${wordForms.past}</li>`;
    if (wordForms.variations) html += `<li><strong>其他形式：</strong>${wordForms.variations.join('、')}</li>`;
    html += '</ul>';
    content.innerHTML = html || '<p>暂无数据</p>';
}

// 更新固定搭配
function updateCollocations(collocations) {
    const box = document.getElementById('collocationsBox');
    const content = document.getElementById('collocationsContent');
    
    if (!collocations || collocations.length === 0) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '<ul class="collocations-list">';
    collocations.forEach(coll => {
        html += `<li><strong>${coll.japanese}</strong> - ${coll.chinese}</li>`;
    });
    html += '</ul>';
    content.innerHTML = html;
}

// 更新记忆技巧
function updateMemoryTips(tips) {
    const box = document.getElementById('memoryTipsBox');
    const content = document.getElementById('memoryTipsContent');
    
    if (!tips || tips.length === 0) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '<ul class="tips-list">';
    tips.forEach((tip, index) => {
        html += `<li><span class="tip-number">${index + 1}.</span> ${tip}</li>`;
    });
    html += '</ul>';
    content.innerHTML = html;
}

// 更新小故事
function updateStory(story) {
    const box = document.getElementById('storyBox');
    const content = document.getElementById('storyContent');
    
    if (!story || (!story.japanese && !story.chinese)) {
        box.classList.add('empty');
        return;
    }
    
    box.classList.remove('empty');
    let html = '<div class="story-content">';
    if (story.japanese) html += `<div class="story-japanese">${story.japanese}</div>`;
    if (story.chinese) html += `<div class="story-chinese">${story.chinese}</div>`;
    html += '</div>';
    content.innerHTML = html;
}

// 播放音频
function playAudio() {
    if (currentWords.length === 0) return;
    const word = currentWords[currentIndex];
    if (word && word.audio) {
        const audio = new Audio(word.audio);
        audio.play().catch(err => {
            console.error('播放音频失败:', err);
        });
    } else {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word.japanese);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    }
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
    
    for (let i = currentWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
    }
    
    currentIndex = 0;
    updateCard();
    addFlipAnimation();
}

// 切换学习模式
function changeMode(mode) {
    currentMode = mode;
    currentFilter = '';
    
    // 更新模式标签页状态
    modeTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.mode === mode) {
            tab.classList.add('active');
        }
    });
    
    // 更新筛选器组显示
    document.querySelectorAll('.filter-group').forEach(group => {
        group.classList.remove('active');
    });
    document.getElementById(`filter-${mode}`).classList.add('active');
    
    // 重置下拉框选择
    categorySelect.value = '';
    nlevelSelect.value = '';
    bookSelect.value = '';
    
    // 显示所有词汇
    currentWords = [...allWordsCache];
    currentIndex = Math.floor(Math.random() * currentWords.length);
    updateCard();
}

// 添加翻转动画
function addFlipAnimation() {
    const card = document.querySelector('.word-card');
    card.classList.add('card-flip');
    setTimeout(() => {
        card.classList.remove('card-flip');
    }, 500);
}

// 初始化应用
init();
