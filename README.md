# 随手背日语 (Japanese Anytime)

一个简洁美观的日语学习网页应用，帮助你随时随地学习日语单词和短语。

## 功能特点

- 📚 **多分类学习**：支持问候语、日常用语、数字、食物等多个分类
- 🎯 **卡片式展示**：美观的卡片设计，清晰展示日语、读音和中文意思
- 🎲 **随机学习**：可以随机打乱词汇顺序，避免机械记忆
- 👁️ **显示/隐藏**：可以隐藏中文意思，先尝试回忆再查看答案
- 📊 **学习统计**：自动记录已学习的词汇数量
- ⌨️ **键盘快捷键**：
  - `←` 左箭头：上一个
  - `→` 右箭头：下一个
  - `空格`：显示/隐藏意思
  - `Ctrl/Cmd + R`：随机打乱

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

1. 直接用浏览器打开 `index.html` 文件即可使用
2. 或者使用本地服务器（推荐）：
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
      "category": "greetings",
      "japanese": "こんにちは",
      "pronunciation": "konnichiwa",
      "meaning": "你好（白天问候）"
    }
  ],
  "categories": {
    "all": "全部",
    "greetings": "问候语",
    "daily": "日常用语",
    "numbers": "数字",
    "food": "食物"
  }
}
```

## 添加新词汇

在 `data/words.json` 文件的 `words` 数组中添加新的词汇对象即可。

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 技术栈

- 纯 HTML/CSS/JavaScript
- 无外部依赖（除了 Font Awesome 图标）
- 使用 LocalStorage 存储学习进度

## 未来计划

- [ ] 添加更多词汇分类
- [ ] 支持自定义词汇列表
- [ ] 添加发音功能
- [ ] 支持导出学习记录
- [ ] 添加复习提醒功能
- [ ] 移动端优化

## 许可证

MIT License

