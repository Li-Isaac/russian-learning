/* 郦书甲老师的俄语小课堂 · 交互脚本 */
(function () {
  'use strict';

  /* ---------- 字母数据（33 个） ---------- */
  var LETTERS = [
    { ch: 'а', name: 'а', pron: '[a] 阿', word: 'аптека', mean: '药店' },
    { ch: 'б', name: 'бэ', pron: '[b] 贝', word: 'банк', mean: '银行' },
    { ch: 'в', name: 'вэ', pron: '[v] 维', word: 'вода', mean: '水' },
    { ch: 'г', name: 'гэ', pron: '[g] 盖', word: 'газета', mean: '报纸' },
    { ch: 'д', name: 'дэ', pron: '[d] 得', word: 'дом', mean: '房子' },
    { ch: 'е', name: 'е', pron: '[je] 耶', word: 'ель', mean: '冷杉' },
    { ch: 'ё', name: 'ё', pron: '[jo] 哟', word: 'ёж', mean: '刺猬' },
    { ch: 'ж', name: 'жэ', pron: '[ʐ] 日', word: 'журнал', mean: '杂志' },
    { ch: 'з', name: 'зэ', pron: '[z] 兹', word: 'зонт', mean: '伞' },
    { ch: 'и', name: 'и', pron: '[i] 伊', word: 'игра', mean: '游戏' },
    { ch: 'й', name: 'и краткое', pron: '[j] 伊短音', word: 'йогурт', mean: '酸奶' },
    { ch: 'к', name: 'ка', pron: '[k] 卡', word: 'кофе', mean: '咖啡' },
    { ch: 'л', name: 'эль', pron: '[l] 埃尔', word: 'лампа', mean: '灯' },
    { ch: 'м', name: 'эм', pron: '[m] 埃姆', word: 'мама', mean: '妈妈' },
    { ch: 'н', name: 'эн', pron: '[n] 埃恩', word: 'нос', mean: '鼻子' },
    { ch: 'о', name: 'о', pron: '[o] 奥', word: 'окно', mean: '窗户' },
    { ch: 'п', name: 'пэ', pron: '[p] 佩', word: 'парк', mean: '公园' },
    { ch: 'р', name: 'эр', pron: '[r] 大舌颤音', word: 'рынок', mean: '市场' },
    { ch: 'с', name: 'эс', pron: '[s] 埃斯', word: 'сад', mean: '花园' },
    { ch: 'т', name: 'тэ', pron: '[t] 特', word: 'телефон', mean: '电话' },
    { ch: 'у', name: 'у', pron: '[u] 乌', word: 'улица', mean: '街道' },
    { ch: 'ф', name: 'эф', pron: '[f] 埃夫', word: 'фрукт', mean: '水果' },
    { ch: 'х', name: 'ха', pron: '[x] 哈', word: 'хлеб', mean: '面包' },
    { ch: 'ц', name: 'цэ', pron: '[ts] 采', word: 'центр', mean: '中心' },
    { ch: 'ч', name: 'че', pron: '[tɕ] 切', word: 'час', mean: '小时' },
    { ch: 'ш', name: 'ша', pron: '[ʂ] 沙', word: 'школа', mean: '学校' },
    { ch: 'щ', name: 'ща', pron: '[ɕː] 夏', word: 'щука', mean: '狗鱼' },
    { ch: 'ъ', name: 'твёрдый знак', pron: '硬音符号·不发音', word: 'съезд', mean: '会议', type: 'sign' },
    { ch: 'ы', name: 'ы', pron: '[ɨ] 厄', word: 'сыр', mean: '奶酪' },
    { ch: 'ь', name: 'мягкий знак', pron: '软音符号·不发音', word: 'семья', mean: '家庭', type: 'sign' },
    { ch: 'э', name: 'э', pron: '[e] 埃', word: 'это', mean: '这' },
    { ch: 'ю', name: 'ю', pron: '[ju] 尤', word: 'юг', mean: '南方' },
    { ch: 'я', name: 'я', pron: '[ja] 亚', word: 'яблоко', mean: '苹果' }
  ];

  var VOWELS = [
    { ch: 'а', ipa: '[a]', word: 'мама' },
    { ch: 'е', ipa: '[je]', word: 'метро' },
    { ch: 'ё', ipa: '[jo]', word: 'ёж' },
    { ch: 'и', ipa: '[i]', word: 'мир' },
    { ch: 'о', ipa: '[o]', word: 'окно' },
    { ch: 'у', ipa: '[u]', word: 'утро' },
    { ch: 'ы', ipa: '[ɨ]', word: 'сыр' },
    { ch: 'э', ipa: '[e]', word: 'это' },
    { ch: 'ю', ipa: '[ju]', word: 'юг' },
    { ch: 'я', ipa: '[ja]', word: 'яблоко' }
  ];

  var VOWEL_KEYS = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я'];
  var SYNTH_OK = 'speechSynthesis' in window;

  /* ---------- 词汇数据（按主题） ---------- */
  var VOCAB = {
    numeros: [
      { es: 'ноль', zh: '零' }, { es: 'один', zh: '一' }, { es: 'два', zh: '二' },
      { es: 'три', zh: '三' }, { es: 'четыре', zh: '四' }, { es: 'пять', zh: '五' },
      { es: 'шесть', zh: '六' }, { es: 'семь', zh: '七' }, { es: 'восемь', zh: '八' },
      { es: 'девять', zh: '九' }, { es: 'десять', zh: '十' }, { es: 'одиннадцать', zh: '十一' },
      { es: 'двенадцать', zh: '十二' }, { es: 'тринадцать', zh: '十三' }, { es: 'четырнадцать', zh: '十四' },
      { es: 'пятнадцать', zh: '十五' }, { es: 'шестнадцать', zh: '十六' }, { es: 'семнадцать', zh: '十七' },
      { es: 'восемнадцать', zh: '十八' }, { es: 'девятнадцать', zh: '十九' }, { es: 'двадцать', zh: '二十' },
      { es: 'тридцать', zh: '三十' }, { es: 'сорок', zh: '四十' }, { es: 'пятьдесят', zh: '五十' },
      { es: 'шестьдесят', zh: '六十' }, { es: 'семьдесят', zh: '七十' }, { es: 'восемьдесят', zh: '八十' },
      { es: 'девяносто', zh: '九十' }, { es: 'сто', zh: '一百' },
      { es: 'и', zh: '连接词：21~99 用 и 连接，如 двадцать один、тридцать два' }
    ],
    dias: [
      { es: 'понедельник', zh: '星期一' }, { es: 'вторник', zh: '星期二' }, { es: 'среда', zh: '星期三' },
      { es: 'четверг', zh: '星期四' }, { es: 'пятница', zh: '星期五' }, { es: 'суббота', zh: '星期六' },
      { es: 'воскресенье', zh: '星期天' },
      { es: 'январь', zh: '一月' }, { es: 'февраль', zh: '二月' }, { es: 'март', zh: '三月' },
      { es: 'апрель', zh: '四月' }, { es: 'май', zh: '五月' }, { es: 'июнь', zh: '六月' },
      { es: 'июль', zh: '七月' }, { es: 'август', zh: '八月' }, { es: 'сентябрь', zh: '九月' },
      { es: 'октябрь', zh: '十月' }, { es: 'ноябрь', zh: '十一月' }, { es: 'декабрь', zh: '十二月' },
      { es: 'сегодня', zh: '今天' }, { es: 'завтра', zh: '明天' }, { es: 'вчера', zh: '昨天' },
      { es: 'неделя', zh: '周/星期' }, { es: 'месяц', zh: '月' }, { es: 'год', zh: '年' }
    ],
    colores: [
      { es: 'красный', zh: '红色' }, { es: 'синий', zh: '蓝色' }, { es: 'зелёный', zh: '绿色' },
      { es: 'жёлтый', zh: '黄色' }, { es: 'белый', zh: '白色' }, { es: 'чёрный', zh: '黑色' },
      { es: 'оранжевый', zh: '橙色' }, { es: 'розовый', zh: '粉色' }, { es: 'серый', zh: '灰色' },
      { es: 'коричневый', zh: '棕色' }, { es: 'светлый', zh: '浅色' }, { es: 'тёмный', zh: '深色' }
    ],
    familia: [
      { es: 'семья', zh: '家庭' }, { es: 'отец', zh: '父亲' }, { es: 'мать', zh: '母亲' },
      { es: 'брат', zh: '兄弟' }, { es: 'сестра', zh: '姐妹' }, { es: 'сын', zh: '儿子' },
      { es: 'дочь', zh: '女儿' }, { es: 'дедушка', zh: '祖父' }, { es: 'бабушка', zh: '祖母' },
      { es: 'дядя', zh: '叔叔/舅舅' }, { es: 'тётя', zh: '阿姨/姑姑' }, { es: 'муж', zh: '丈夫' },
      { es: 'жена', zh: '妻子' }, { es: 'друг', zh: '朋友（男）' }, { es: 'подруга', zh: '朋友（女）' }
    ],
    comida: [
      { es: 'хлеб', zh: '面包' }, { es: 'вода', zh: '水' }, { es: 'молоко', zh: '牛奶' },
      { es: 'кофе', zh: '咖啡' }, { es: 'фрукт', zh: '水果' }, { es: 'яблоко', zh: '苹果' },
      { es: 'рис', zh: '米饭' }, { es: 'мясо', zh: '肉' }, { es: 'рыба', zh: '鱼' },
      { es: 'курица', zh: '鸡肉' }, { es: 'сыр', zh: '奶酪' }, { es: 'яйцо', zh: '鸡蛋' },
      { es: 'салат', zh: '沙拉' }, { es: 'картофель', zh: '土豆' }, { es: 'сок', zh: '果汁' },
      { es: 'чай', zh: '茶' }, { es: 'сахар', zh: '糖' }, { es: 'соль', zh: '盐' }
    ],
    saludos: [
      { es: 'Привет!', zh: '你好！' }, { es: 'Доброе утро', zh: '早上好' }, { es: 'Добрый день', zh: '下午好' },
      { es: 'Добрый вечер', zh: '晚上好' }, { es: 'Как дела?', zh: '怎么样？' }, { es: 'До свидания', zh: '再见' },
      { es: 'Пока', zh: '拜拜' }, { es: 'До завтра', zh: '明天见' }, { es: 'Пожалуйста', zh: '请 / 不客气' },
      { es: 'Спасибо', zh: '谢谢' }, { es: 'Извините', zh: '对不起/打扰了' }, { es: 'Простите', zh: '很抱歉' },
      { es: 'Поздравляю!', zh: '恭喜！' }
    ]
  };

  /* ---------- 必备句型 ---------- */
  var PHRASES = [
    { es: 'Меня зовут Ли. А тебя?', zh: '我叫李。你呢？' },
    { es: 'Я из Китая.', zh: '我来自中国。' },
    { es: 'Мне двадцать лет.', zh: '我二十岁。' },
    { es: 'Я студент.', zh: '我是学生。' },
    { es: 'Где туалет?', zh: '洗手间在哪里？' },
    { es: 'Сколько это стоит?', zh: '多少钱？' },
    { es: 'Который час?', zh: '几点了？' },
    { es: 'Сейчас три часа.', zh: '现在三点。' },
    { es: 'Я не понимаю.', zh: '我不明白。' },
    { es: 'Повторите, пожалуйста.', zh: '请您再说一遍。' },
    { es: 'Счёт, пожалуйста.', zh: '请结账。' },
    { es: 'Можно кофе, пожалуйста?', zh: '请给我一杯咖啡好吗？' },
    { es: 'Мне очень нравится русский язык.', zh: '我很喜欢俄语。' },
    { es: 'Здесь есть гостиница?', zh: '附近有酒店吗？' },
    { es: 'У меня всё хорошо, спасибо.', zh: '我很好，谢谢。' },
    { es: 'Во сколько начинается?', zh: '几点开始？' },
    { es: 'Добро пожаловать!', zh: '欢迎！' },
    { es: 'Рад(а) познакомиться.', zh: '很高兴认识你。' },
    { es: 'Как вас зовут?', zh: '您贵姓？' },
    { es: 'Откуда вы?', zh: '您从哪里来？' },
    { es: 'Я немного говорю по-русски.', zh: '我会说一点俄语。' },
    { es: 'Как пройти к станции метро?', zh: '怎么去地铁站？' },
    { es: 'Это очень вкусно!', zh: '这个很好吃！' },
    { es: 'Я хочу пить.', zh: '我想喝水。' },
    { es: 'Я хочу есть.', zh: '我想吃东西。' },
    { es: 'Сколько вам лет?', zh: '您多大了？' },
    { es: 'Я живу в Пекине.', zh: '我住在北京。' },
    { es: 'Я работаю в банке.', zh: '我在银行工作。' },
    { es: 'У меня есть брат и сестра.', zh: '我有一个兄弟和一个姐妹。' },
    { es: 'Давай встретимся завтра.', zh: '我们明天见面吧。' },
    { es: 'Извините, где здесь аптека?', zh: '对不起，请问哪里有药店？' },
    { es: 'До встречи!', zh: '回头见！' }
  ];

  /* ---------- 长句例句（约 10 词） ---------- */
  var LONG_PHRASES = [
    { es: 'Я хочу выучить русский язык, потому что он очень интересный.', zh: '我想学俄语，因为它很有意思。' },
    { es: 'Каждое утро я пью чай и слушаю новости по радио.', zh: '每天早上我喝茶并听广播新闻。' },
    { es: 'Моя семья живёт в небольшом городе на юге Китая.', zh: '我的家人住在中国南部的一个小城市。' },
    { es: 'Вчера вечером мы с друзьями смотрели новый фильм в кино.', zh: '昨晚我和朋友们在电影院看了一部新电影。' },
    { es: 'Завтра я хочу пойти в магазин и купить свежий хлеб.', zh: '明天我想去商店买新鲜面包。' },
    { es: 'Моя сестра работает в школе и очень любит свою работу.', zh: '我姐姐在学校工作，非常喜欢她的工作。' },
    { es: 'Мы часто ходим в парк, когда на улице хорошая погода.', zh: '天气好的时候，我们经常去公园。' },
    { es: 'Извините, я не понимаю этот вопрос, повторите, пожалуйста.', zh: '对不起，我不明白这个问题，请再说一遍。' },
    { es: 'У меня есть старший брат и одна младшая сестра.', zh: '我有一个哥哥和一个妹妹。' },
    { es: 'Летом я хочу поехать в Россию и посмотреть Москву.', zh: '夏天我想去俄罗斯看看莫斯科。' },
    { es: 'Мой лучший друг живёт в другом городе, я скучаю по нему.', zh: '我最好的朋友住在另一个城市，我很想念他。' },
    { es: 'Я люблю готовить дома и слушать хорошую музыку.', zh: '我喜欢在家做饭并听好听的音乐。' },
    { es: 'Спасибо большое за вашу помощь и добрую поддержку.', zh: '非常感谢您的帮助和善意的支持。' },
    { es: 'Скажите, пожалуйста, где находится ближайшая станция метро.', zh: '请告诉我最近的地铁站在哪里。' },
    { es: 'Я работаю с девяти часов утра до шести часов вечера.', zh: '我从早上九点工作到晚上六点。' },
    { es: 'Мои родители живут в Пекине уже двадцать лет.', zh: '我的父母在北京已经住了二十年。' },
    { es: 'Это очень вкусный суп, я хочу ещё одну тарелку.', zh: '这汤非常好喝，我还想要一碗。' },
    { es: 'Давайте встретимся завтра в шесть часов у кафе.', zh: '我们明天六点在咖啡馆见面吧。' },
    { es: 'Погода сегодня хорошая, давай пойдём гулять в парк.', zh: '今天天气很好，我们去公园散步吧。' },
    { es: 'Я изучаю русский язык два года, но говорю ещё плохо.', zh: '我学俄语两年了，但说得还不好。' }
  ];

  /* ---------- 语音试听（俄语） ---------- */
  function speak(text, el) {
    if (!SYNTH_OK) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    u.rate = 0.75;
    if (el) el.classList.add('speaking');
    u.onend = function () { if (el) el.classList.remove('speaking'); };
    u.onerror = function () { if (el) el.classList.remove('speaking'); };
    window.speechSynthesis.speak(u);
  }

  /* ---------- 生成字母卡片 ---------- */
  function buildLetters() {
    var grid = document.getElementById('letter-grid');
    if (!grid) return;

    LETTERS.forEach(function (l) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var cls = 'letter-card';
      if (l.type === 'sign') cls += ' sign';
      else if (VOWEL_KEYS.indexOf(l.ch) >= 0) cls += ' vowel';
      btn.className = cls;
      btn.setAttribute('aria-label', '试听字母 ' + l.ch + ' 的发音');

      var charDiv = document.createElement('span');
      charDiv.className = 'l-char';
      charDiv.innerHTML = '<span class="l-maj">' + l.ch.toUpperCase() + '</span>' +
        '<span class="l-min">' + l.ch.toLowerCase() + '</span>';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'l-name';
      nameSpan.textContent = l.name;

      var pronSpan = document.createElement('span');
      pronSpan.className = 'l-pron';
      pronSpan.textContent = l.pron;

      var wordSpan = document.createElement('span');
      wordSpan.className = 'l-word';
      wordSpan.innerHTML = l.word + '<i>' + l.mean + '</i>';

      var hintSpan = document.createElement('span');
      hintSpan.className = 'l-hint';
      hintSpan.textContent = '▶ 点击试听';

      btn.appendChild(charDiv);
      btn.appendChild(nameSpan);
      btn.appendChild(pronSpan);
      btn.appendChild(wordSpan);
      btn.appendChild(hintSpan);

      btn.addEventListener('click', function () {
        if (l.type === 'sign') {
          speak(l.word + '.', btn);
        } else {
          speak(l.ch + '. ' + l.word + '.', btn);
        }
      });
      grid.appendChild(btn);
    });
  }

  /* ---------- 生成元音 ---------- */
  function buildVowels() {
    var row = document.getElementById('vowel-row');
    if (!row) return;

    VOWELS.forEach(function (v) {
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'vowel-cell';
      cell.setAttribute('aria-label', '试听元音 ' + v.ch);

      cell.innerHTML =
        '<span class="v-char">' + v.ch.toUpperCase() + '</span>' +
        '<span class="v-ipa">' + v.ipa + '</span>' +
        '<span class="v-ex">' + v.word + '</span>';

      cell.addEventListener('click', function () {
        speak(v.ch + '.', cell);
      });
      row.appendChild(cell);
    });
  }

  /* ---------- 生成词汇面板 + 标签切换 ---------- */
  function buildVocab() {
    var tabs = document.getElementById('vocab-tabs');
    var panels = document.getElementById('vocab-panels');
    if (!tabs || !panels) return;

    Object.keys(VOCAB).forEach(function (key) {
      var panel = document.createElement('div');
      panel.className = 'tab-panel' + (key === 'numeros' ? ' active' : '');
      panel.id = 'panel-' + key;

      var grid = document.createElement('div');
      grid.className = 'vocab-grid';

      VOCAB[key].forEach(function (w) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'vocab-chip';
        chip.setAttribute('aria-label', '试听 ' + w.es);

        var es = document.createElement('span');
        es.className = 'w-es';
        es.textContent = w.es;

        var zh = document.createElement('span');
        zh.className = 'w-zh';
        zh.textContent = w.zh;

        chip.appendChild(es);
        chip.appendChild(zh);
        chip.addEventListener('click', function () {
          speak(w.es + '.', chip);
        });
        grid.appendChild(chip);
      });

      panel.appendChild(grid);
      panels.appendChild(panel);
    });

    tabs.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        panels.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        var target = document.getElementById('panel-' + btn.getAttribute('data-tab'));
        if (target) target.classList.add('active');
      });
    });
  }

  /* ---------- 生成必备句型（短句 + 长句） ---------- */
  function buildPhrases() {
    var grid = document.getElementById('phrase-grid');
    if (!grid) return;

    function addCard(p, isLong) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'phrase-card' + (isLong ? ' long' : '');
      card.setAttribute('aria-label', '试听句子');

      if (isLong) {
        var tag = document.createElement('span');
        tag.className = 'p-tag';
        tag.textContent = '长句 · 完整表达';
        card.appendChild(tag);
      }

      var es = document.createElement('span');
      es.className = 'p-es';
      es.textContent = p.es;

      var zh = document.createElement('span');
      zh.className = 'p-zh';
      zh.textContent = p.zh;

      card.appendChild(es);
      card.appendChild(zh);
      card.addEventListener('click', function () {
        speak(p.es, card);
      });
      grid.appendChild(card);
    }

    PHRASES.forEach(function (p) { addCard(p, false); });
    LONG_PHRASES.forEach(function (p) { addCard(p, true); });
  }

  /* ---------- 生成范文逐句试听 ---------- */
  function buildEssays() {
    var lines = document.querySelectorAll('.essay-line');
    Array.prototype.forEach.call(lines, function (line) {
      var text = line.getAttribute('data-es');
      if (!text) return;
      line.addEventListener('click', function () {
        speak(text, line);
      });
    });
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildLetters();
    buildVowels();
    buildVocab();
    buildPhrases();
    buildEssays();
  });
})();
