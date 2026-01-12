# 随手背日语 (Japanese Anytime)

一个简洁美观的日语学习网页应用，帮助你随时随地学习日语单词和短语。支持多种学习模式，适合不同学习需求。

## 功能特点

- 📚 **多种学习模式**：
  - **按常用分类**：问候语、日常用语、数字、食物等
  - **按N1-N5分级**：根据JLPT等级筛选词汇
  - **按词书分类**：按照标准日本语等教材分类学习
  
- 🎯 **卡片式展示**：美观的卡片设计，清晰展示日语、读音和中文意思
- 🎲 **随机学习**：可以随机打乱词汇顺序，避免机械记忆
- 👁️ **显示/隐藏**：可以隐藏中文意思，先尝试回忆再查看答案
- 🏷️ **标签显示**：卡片上显示N级别和词书信息
- 📊 **学习统计**：自动记录已学习的词汇数量
- ⌨️ **键盘快捷键**：
  - `←` 左箭头：上一个
  - `→` 右箭头：下一个
  - `空格`：显示/隐藏意思
  - `R`：随机打乱
  - `1`：切换到常用分类模式
  - `2`：切换到N级别模式
  - `3`：切换到词书模式

## 文件结构

```
japanese-anytime/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── main.js        # 主要逻辑
├── data/
│   └── words.json     # 日语词汇数据
└── README.md          # 项目说明
```

## 使用方法

### GitHub Pages 部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 main 分支作为源
4. 访问 `https://你的用户名.github.io/japanese-anytime`

### 本地运行

由于浏览器的 CORS 限制，需要通过本地服务器运行：

```bash
# Python 3
python -m http.server 8000

# Node.js (需要安装 http-server)
npx http-server
```

然后访问 `http://localhost:8000`

## 数据格式

词汇数据存储在 `data/words.json` 文件中，格式如下：

```json
{
  "words": [
    {
      "id": 1,
      "japanese": "こんにちは",
      "pronunciation": "konnichiwa",
      "meaning": "你好（白天问候）",
      "category": "greetings",
      "nLevel": "N5",
      "book": "标准日本语初级上"
    }
  ],
  "categories": {
    "all": "全部",
    "greetings": "问候语",
    "daily": "日常用语",
    "numbers": "数字",
    "food": "食物"
  },
  "nLevels": ["N5", "N4", "N3", "N2", "N1"],
  "books": [
    "标准日本语初级上",
    "标准日本语初级下",
    "标准日本语中级上",
    "标准日本语中级下"
  ]
}
```

### 字段说明

- **id**: 词汇唯一标识符
- **japanese**: 日语汉字/假名
- **pronunciation**: 罗马音读音
- **meaning**: 中文意思
- **category**: 常用分类（greetings, daily, numbers, food 等）
- **nLevel**: JLPT等级（N5-N1）
- **book**: 词书名称（如"标准日本语初级上"）

## 添加新词汇

在 `data/words.json` 文件的 `words` 数组中添加新的词汇对象即可。确保包含所有必需字段。

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 技术栈

- 纯 HTML/CSS/JavaScript
- 无外部依赖（除了 Font Awesome 图标 CDN）
- 使用 LocalStorage 存储学习进度
- 适合 GitHub Pages 静态部署

## 未来计划

- [ ] 添加更多词汇（当前70个）
- [ ] 支持自定义词汇列表
- [ ] 添加发音功能（语音合成）
- [ ] 支持导出学习记录
- [ ] 添加复习提醒功能
- [ ] 移动端优化（PWA支持）
- [ ] 支持多种词书来源
- [ ] 添加词汇搜索功能

## 许可证

MIT License
