// 全局变量
let dataConfig = {};
let allWordsCache = []; // 缓存所有词汇（用于初始随机选择）
let currentWords = [];
let currentIndex = 0;
let currentMode = 'category'; // category, nlevel, book
let currentFilter = '';
let learningMode = 'sequential'; // 全局学习模式：sequential 或 random

// DOM 元素
const japaneseText = document.getElementById('japaneseText');
const pronunciation = document.getElementById('pronunciation');
const meaning = document.getElementById('meaning');
const cardNumber = document.getElementById('cardNumber');
const cardNLevel = document.getElementById('cardNLevel');
const cardBook = document.getElementById('cardBook');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const audioBtn = document.getElementById('audioBtn');
const categorySidebar = document.getElementById('categorySidebar');
const sidebarTrigger = document.getElementById('sidebarTrigger');
const sidebarTriggerIcon = document.getElementById('sidebarTriggerIcon');

const modeTabs = document.querySelectorAll('.mode-tab');
const categorySelect = document.getElementById('category-select');
const nlevelSelect = document.getElementById('nlevel-select');
const bookSelect = document.getElementById('book-select');

const dragBar = document.getElementById('dragBar');
const dragContainer = document.getElementById('dragContainer');
const dragIndicator = document.getElementById('dragIndicator');

const wordSelectorSection = document.getElementById('wordSelectorSection');
const wordSelectorWrapper = document.getElementById('wordSelectorWrapper');
const wordSearchInput = document.getElementById('wordSearchInput');
const wordSelect = document.getElementById('wordSelect');

// 检查DOM元素是否存在
function checkDOMElements() {
    const elements = [
        { name: 'japaneseText', el: japaneseText },
        { name: 'pronunciation', el: pronunciation },
        { name: 'meaning', el: meaning },
        { name: 'cardNumber', el: cardNumber },
        { name: 'cardNLevel', el: cardNLevel },
        { name: 'cardBook', el: cardBook },
        { name: 'prevBtn', el: prevBtn },
        { name: 'nextBtn', el: nextBtn },
        { name: 'audioBtn', el: audioBtn },
        { name: 'categorySidebar', el: categorySidebar },
        { name: 'sidebarTrigger', el: sidebarTrigger },
        { name: 'sidebarTriggerIcon', el: sidebarTriggerIcon },
        { name: 'modeTabs', el: modeTabs },
        { name: 'categorySelect', el: categorySelect },
        { name: 'nlevelSelect', el: nlevelSelect },
        { name: 'bookSelect', el: bookSelect },
        { name: 'dragBar', el: dragBar },
        { name: 'dragContainer', el: dragContainer },
        { name: 'dragIndicator', el: dragIndicator },
        { name: 'wordSelectorSection', el: wordSelectorSection },
        { name: 'wordSelectorWrapper', el: wordSelectorWrapper },
        { name: 'wordSearchInput', el: wordSearchInput },
        { name: 'wordSelect', el: wordSelect }
    ];

    elements.forEach(item => {
        if (item.el === null || (item.el && typeof item.el.length !== 'undefined' && item.el.length === 0)) {
            console.error(`DOM元素 ${item.name} 未找到!`);
        }
    });
}

// 初始化
async function init() {
    try {
        // 检查DOM元素
        checkDOMElements();

        // 加载配置
        console.log('正在加载配置文件...');
        console.log('当前页面URL:', window.location.href);
        console.log('尝试获取路径:', 'data/config.json');

        const configResponse = await fetch('data/config.json');
        console.log('fetch响应状态:', configResponse.status);

        if (!configResponse.ok) {
            throw new Error(`HTTP错误 ${configResponse.status}: ${configResponse.statusText}`);
        }

        dataConfig = await configResponse.json();
        console.log('配置文件加载成功:', dataConfig);

        // 初始化下拉框选项
        initSelectOptions();

        // 初始化事件监听
        initEventListeners();

        // 初始化边栏状态（默认收起）
        categorySidebar.classList.add('collapsed');

        // 初始化全局模式显示（默认顺序模式）
        if (learningMode === 'sequential') {
            wordSelectorWrapper.style.display = 'block';
        } else {
            wordSelectorWrapper.style.display = 'none';
        }

        // 加载所有词汇用于初始随机选择
        await loadAllWords();

        // 初始显示问候词或第一个单词
        if (allWordsCache.length > 0) {
            // 首先尝试加载问候词
            try {
                const greetingResponse = await fetch('data/greeting.json');
                if (greetingResponse.ok) {
                    const greetingWords = await greetingResponse.json();
                    const greetingWord = getGreetingByTime(greetingWords);
                    if (greetingWord) {
                        currentWords = [greetingWord];
                        currentIndex = 0;
                        updateCard();
                        updateDragBar();
                        updateWordSelector();
                        return;
                    }
                }
            } catch (error) {
                console.log('加载问候词失败，使用默认逻辑');
            }

            // 如果问候词加载失败，使用默认逻辑
            currentWords = [...allWordsCache];
            currentIndex = learningMode === 'sequential' ? 0 : Math.floor(Math.random() * currentWords.length);
            updateCard();
            updateDragBar();
            updateWordSelector(); // 更新单词选择器
        }
    } catch (error) {
        console.error('初始化失败:', error);
        console.error('错误详情:', {
            message: error.message,
            stack: error.stack,
            type: error.constructor.name
        });

        // 提供更详细的错误信息
        let errorMsg = '加载配置失败！\n\n';
        errorMsg += `错误类型: ${error.constructor.name}\n`;
        errorMsg += `错误信息: ${error.message}\n\n`;

        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            errorMsg += '可能的原因：\n';
            errorMsg += '1. CORS跨域限制 - 请使用本地服务器运行\n';
            errorMsg += '2. 文件路径不正确\n';
            errorMsg += '3. Live Server配置问题\n\n';
            errorMsg += '建议解决方案：\n';
            errorMsg += '1. 使用Python服务器: python -m http.server 8000\n';
            errorMsg += '2. 或使用Node.js: npx http-server\n';
            errorMsg += '3. 然后访问 http://localhost:8000';
        } else if (error.message.includes('HTTP错误')) {
            errorMsg += '文件不存在或无法访问，请检查data/config.json文件';
        }

        alert(errorMsg);
    }
}

// 根据时间获取合适的问候词
function getGreetingByTime(greetingWords) {
    const now = new Date();
    const hour = now.getHours();

    // 根据时间段选择问候词
    if (hour >= 5 && hour < 12) {
        // 早上：5:00-11:59
        return greetingWords.find(word => word["单词"] === "おはようございます");
    } else if (hour >= 12 && hour < 18) {
        // 下午：12:00-17:59
        return greetingWords.find(word => word["单词"] === "こんにちは");
    } else if (hour >= 18 && hour < 22) {
        // 晚上：18:00-21:59
        return greetingWords.find(word => word["单词"] === "こんばんは");
    } else {
        // 深夜/凌晨：22:00-4:59
        return greetingWords.find(word => word["单词"] === "おやすみなさい");
    }
}

// 加载所有词汇（用于初始随机选择）
async function loadAllWords() {
    allWordsCache = [];

    // 从所有文件夹加载词汇
    const loadPromises = [];

    // 加载category文件夹（排除greeting）
    Object.keys(dataConfig.categories).forEach(key => {
        loadPromises.push(
            fetch(`data/category/${key}.json`)
                .then(res => res.json())
                .then(data => Array.isArray(data) ? data : (data.words || []))
                .catch(() => [])
        );
    });

    // 加载nlevel文件夹
    dataConfig.nLevels.forEach(level => {
        loadPromises.push(
            fetch(`data/nlevel/${level}.json`)
                .then(res => res.json())
                .then(data => Array.isArray(data) ? data : (data.words || []))
                .catch(() => [])
        );
    });

    // 加载book文件夹
    dataConfig.books.forEach(book => {
        loadPromises.push(
            fetch(`data/book/${book}.json`)
                .then(res => res.json())
                .then(data => Array.isArray(data) ? data : (data.words || []))
                .catch(() => [])
        );
    });

    const results = await Promise.all(loadPromises);
    results.forEach(words => {
        allWordsCache.push(...words);
    });

    // 去重（根据单词内容）
    const uniqueMap = new Map();
    allWordsCache.forEach(word => {
        const key = word["单词"] || word.id || JSON.stringify(word);
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, word);
        }
    });
    allWordsCache = Array.from(uniqueMap.values());
}

// 初始化事件监听
function initEventListeners() {
    prevBtn.addEventListener('click', prevWord);
    nextBtn.addEventListener('click', nextWord);
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

    // 全局模式切换按钮事件
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mode-btn') && e.target.parentElement.classList.contains('global-mode-switch')) {
            const mode = e.target.dataset.mode;

            // 更新全局学习模式
            learningMode = mode;

            // 更新按钮状态
            const modeSwitch = e.target.parentElement;
            modeSwitch.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // 显示/隐藏单词选择器
            if (mode === 'sequential') {
                wordSelectorWrapper.style.display = 'block';
                updateWordSelector(); // 更新单词选择器
            } else {
                wordSelectorWrapper.style.display = 'none';
            }

            // 如果当前有单词数据，重新应用模式
            if (currentWords.length > 0) {
                applyLearningMode();
                updateCard();
                updateDragBar();
            }
        }
    });

    // 单词搜索输入事件
    wordSearchInput.addEventListener('input', (e) => {
        if (learningMode === 'sequential') {
            updateWordSelector(e.target.value);
        }
    });

    // 单词选择下拉框事件
    wordSelect.addEventListener('change', (e) => {
        if (learningMode === 'sequential') {
            const selectedIndex = parseInt(e.target.value);
            if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < currentWords.length) {
                currentIndex = selectedIndex;
                updateCard();
                updateDragBar();
            }
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
            if (learningMode === 'random') {
                // 随机模式：随机选择单词
                selectRandomWord();
            } else {
                // 顺序模式：跳转到随机位置
                if (currentWords.length > 0) {
                    currentIndex = Math.floor(Math.random() * currentWords.length);
                    addFlipAnimation(() => {
                        updateCard();
                        updateDragBar();
                        updateWordSelector();
                    });
                }
            }
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
            updateWordSelector(); // 更新单词选择器为"暂无词汇"
            return;
        }
        const data = await response.json();
        currentWords = Array.isArray(data) ? data : (data.words || []);
        currentFilter = filter;
        currentIndex = 0;

        if (currentWords.length > 0) {
            applyLearningMode();
            updateCard(); // 显示第一个单词
            updateWordSelector(); // 更新单词选择器
        } else {
            updateCard();
            updateWordSelector(); // 更新单词选择器为"暂无词汇"
        }
    } catch (error) {
        console.error('加载词汇失败:', error);
        // 静默处理错误，只显示暂无词汇
        currentWords = [];
        currentFilter = filter;
        currentIndex = 0;
        updateCard();
        updateWordSelector(); // 更新单词选择器为"暂无词汇"
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
        cardNumber.textContent = '0 / 0';
        clearAllDetails();
        dragBar.classList.remove('active'); // 隐藏拖拽条
        return;
    }

    const word = currentWords[currentIndex];

    // 直接使用"单词"属性作为日语单词
    japaneseText.textContent = word["单词"] || "未知单词";

    // 使用"简介"属性中的假名和罗马音
    const intro = word["简介"] || {};
    const hiraganaElement = document.getElementById('hiragana');
    const pronunciationElement = document.getElementById('pronunciation');

    hiraganaElement.textContent = intro["假名"] || "";
    pronunciationElement.textContent = intro["罗马音"] || "";

    // 使用"简介"属性中的简短释义作为含义
    meaning.textContent = intro["简短释义"] || "未知释义";

    // 更新卡片编号和标签
    cardNumber.textContent = `${currentIndex + 1} / ${currentWords.length}`;
    cardNLevel.textContent = 'N1'; // 临时设为N1
    cardBook.textContent = '';

    // 更新详情面板
    updateDetailPanels(word);

    // 更新拖拽条
    updateDragBar();
}

// 清空所有详情
function clearAllDetails() {
    document.getElementById('wordAnalysisBox').classList.add('empty');
    document.getElementById('examplesBox').classList.add('empty');
    document.getElementById('affixBox').classList.add('empty');
    document.getElementById('culturalBox').classList.add('empty');
    document.getElementById('wordFormsBox').classList.add('empty');
    document.getElementById('memoryTipsBox').classList.add('empty');
    document.getElementById('storyBox').classList.add('empty');
}

// 更新详情面板
function updateDetailPanels(word) {
    // 词义分析 - 使用"词义分析"属性
    updateWordAnalysis(word["词义分析"]);

    // 例句 - 使用"例句与用法"属性
    updateExamples(word["例句与用法"]);

    // 构词分析 - 使用"词根/构词分析"和"词缀/接头辞/接尾辞"
    updateAffix(word["词缀/接头辞/接尾辞"], word["词根/构词分析"]);

    // 文化背景 - 使用"历史与文化背景"
    updateCulturalBackground(word["历史与文化背景"]);

    // 单词活用 - 使用"语法活用与变形"
    updateWordForms(word["语法活用与变形"]);

    // 记忆技巧 - 使用"记忆辅助"
    updateMemoryTips(word["记忆辅助"]);

    // 小故事 - 使用"小故事/场景"
    updateStory(word["小故事/场景"]);
}

// 更新词义分析
function updateWordAnalysis(analysis) {
    const box = document.getElementById('wordAnalysisBox');
    const content = document.getElementById('wordAnalysisContent');

    if (!analysis || (typeof analysis === 'object' && Object.keys(analysis).length === 0)) {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');

    let html = '';

    if (typeof analysis === 'object') {
        // 如果是对象格式，按词性显示
        for (const [pos, meaning] of Object.entries(analysis)) {
            html += `<div class="word-meaning">
                <span class="part-of-speech">${pos}:</span> ${meaning}
            </div>`;
        }
    } else {
        // 兼容旧的字符串格式
        html = `<div class="analysis-text">${analysis.replace(/\n/g, '<br>')}</div>`;
    }

    content.innerHTML = html;
}

// 更新例句
function updateExamples(examples) {
    const box = document.getElementById('examplesBox');
    const content = document.getElementById('examplesContent');

    if (!examples || examples.trim() === '') {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');
    // 直接显示例句内容，保留换行
    content.innerHTML = `<div class="examples-text">${examples.replace(/\n/g, '<br>')}</div>`;
}

// 更新构词分析
function updateAffix(affix, wordRoot) {
    const box = document.getElementById('affixBox');
    const content = document.getElementById('affixContent');

    const hasAffix = affix && affix.trim() !== '';
    const hasWordRoot = wordRoot && wordRoot.trim() !== '';

    if (!hasAffix && !hasWordRoot) {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');
    let html = '';

    if (hasWordRoot) {
        html += `<div class="word-root-analysis">${wordRoot.replace(/\n/g, '<br>')}</div>`;
    }

    if (hasAffix) {
        html += `<div class="affix-analysis">${affix.replace(/\n/g, '<br>')}</div>`;
    }

    content.innerHTML = html;
}

// 更新文化背景
function updateCulturalBackground(cultural) {
    const box = document.getElementById('culturalBox');
    const content = document.getElementById('culturalContent');

    if (!cultural || cultural.trim() === '') {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');
    // 直接显示文化背景内容，保留换行
    content.innerHTML = `<div class="cultural-text">${cultural.replace(/\n/g, '<br>')}</div>`;
}

// 更新单词变形
function updateWordForms(wordForms) {
    const box = document.getElementById('wordFormsBox');
    const content = document.getElementById('wordFormsContent');

    if (!wordForms || wordForms.trim() === '') {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');
    // 直接显示语法活用与变形内容，保留换行
    content.innerHTML = `<div class="word-forms-text">${wordForms.replace(/\n/g, '<br>')}</div>`;
}


// 更新记忆技巧
function updateMemoryTips(tips) {
    const box = document.getElementById('memoryTipsBox');
    const content = document.getElementById('memoryTipsContent');

    if (!tips || tips.trim() === '') {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');
    // 直接显示记忆辅助内容，保留换行
    content.innerHTML = `<div class="memory-tips-text">${tips.replace(/\n/g, '<br>')}</div>`;
}

// 更新小故事
function updateStory(story) {
    const box = document.getElementById('storyBox');
    const content = document.getElementById('storyContent');

    if (!story || (typeof story === 'string' && story.trim() === '') ||
        (typeof story === 'object' && (!story.日语故事 || !story.中文翻译))) {
        box.classList.add('empty');
        return;
    }

    box.classList.remove('empty');

    let html = '';

    if (typeof story === 'object' && story.日语故事 && story.中文翻译) {
        // 新对象格式：显示日语故事和中文翻译
        html = `
            <div class="story-section">
                <div class="japanese-story">
                    <strong>日语故事：</strong>
                    ${story.日语故事.replace(/\n/g, '<br>')}
                </div>
                <div class="chinese-translation">
                    <strong>中文翻译：</strong>
                    ${story.中文翻译.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    } else {
        // 兼容旧的字符串格式
        html = `<div class="story-text">${story.replace(/\n/g, '<br>')}</div>`;
    }

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

    if (learningMode === 'random') {
        // 随机模式：随机选择一个单词
        selectRandomWord();
    } else {
        // 顺序模式：正常的前后导航
        currentIndex = (currentIndex - 1 + currentWords.length) % currentWords.length;
        addFlipAnimation(() => {
            updateCard();
            updateWordSelector();
        });
    }
}

// 切换到下一个
function nextWord() {
    if (currentWords.length === 0) return;

    if (learningMode === 'random') {
        // 随机模式：随机选择一个单词
        selectRandomWord();
    } else {
        // 顺序模式：正常的前后导航
        currentIndex = (currentIndex + 1) % currentWords.length;
        addFlipAnimation(() => {
            updateCard();
            updateWordSelector();
        });
    }
}

// 随机选择一个单词（用于随机模式）
function selectRandomWord() {
    if (currentWords.length === 0) return;

    const newIndex = Math.floor(Math.random() * currentWords.length);
    // 确保不重复选择同一个单词（如果有多个单词的话）
    if (currentWords.length > 1 && newIndex === currentIndex) {
        // 如果随机到了同一个，重新选择
        selectRandomWord();
        return;
    }

    currentIndex = newIndex;
    addFlipAnimation(() => {
        updateCard();
    });
}

// 随机打乱
function shuffleWords() {
    if (currentWords.length === 0) return;

    for (let i = currentWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentWords[i], currentWords[j]] = [currentWords[j], currentWords[i]];
    }

    currentIndex = 0;
    addFlipAnimation(() => {
        updateCard();
    });
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

    // 清除当前单词数据，等待用户选择具体分类
    currentWords = [];
    currentIndex = 0;
    updateCard();
    updateDragBar();
    updateWordSelector(); // 这会显示"请先选择具体分类"的提示
}

// 添加翻转动画
function addFlipAnimation(onHalfway) {
    const card = document.querySelector('.word-card');
    card.classList.add('card-flip');

    // 在动画一半时（250ms）更新内容
    if (onHalfway) {
        setTimeout(onHalfway, 250);
    }

    // 动画完成后移除类
    setTimeout(() => {
        card.classList.remove('card-flip');
    }, 500);
}

// 应用学习模式
function applyLearningMode() {
    if (learningMode === 'random') {
        shuffleWords();
    }
    // 顺序模式下保持原始顺序
}

// 更新单词选择器
function updateWordSelector(searchTerm = '') {
    if (learningMode !== 'sequential') {
        wordSelectorWrapper.style.display = 'none';
        return;
    }

    wordSelectorWrapper.style.display = 'block';
    wordSelectorSection.classList.add('active');

    // 清空现有选项
    wordSelect.innerHTML = '<option value="">选择起始单词</option>';

    // 检查是否需要显示单词选择器
    if (!currentFilter) {
        // 还没有选择具体分类
        wordSelect.innerHTML = '<option value="">请先选择具体分类</option>';
        return;
    }

    if (currentWords.length === 0) {
        // 有分类选择但没有词汇数据
        wordSelect.innerHTML = '<option value="">暂无词汇</option>';
        return;
    }

    // 过滤和添加单词选项
    currentWords.forEach((word, index) => {
        const japanese = word["单词"] || word.japanese || '';
        const hiragana = word["简介"]?.["假名"] || '';
        const romaji = word["简介"]?.["罗马音"] || '';

        // 如果有搜索词，进行过滤
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const japaneseMatch = japanese.toLowerCase().includes(searchLower);
            const hiraganaMatch = hiragana.toLowerCase().includes(searchLower);
            const romajiMatch = romaji.toLowerCase().includes(searchLower);

            if (!japaneseMatch && !hiraganaMatch && !romajiMatch) {
                return; // 不匹配，跳过
            }
        }

        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${japanese} (${hiragana} - ${romaji})`;

        if (index === currentIndex) {
            option.selected = true;
        }

        wordSelect.appendChild(option);
    });
}

// 更新拖拽条
function updateDragBar() {
    // 总是隐藏拖拽条，根据用户要求在顺序模式下也不显示
    dragBar.classList.remove('active');
}

// 初始化应用
init();
