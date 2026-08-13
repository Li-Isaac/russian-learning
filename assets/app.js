/* 郦书甲老师的俄语小课堂 · ТРКИ A2 系统课程 · 渲染引擎 */
(function () {
  'use strict';

  var LESSONS = (window.LESSONS_A1 || []).concat(window.LESSONS_A || []).concat(window.LESSONS_B || []);
  /* 重新编号，确保唯一且顺序正确（A1 语音课在前） */
  LESSONS.forEach(function (L, i) { L.no = i + 1; });
  var SYNTH_OK = 'speechSynthesis' in window;
  var PROGRESS_KEY = 'ru_course_progress_v1';

  /* ---------- 学习进度（localStorage） ---------- */
  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function markLessonComplete(no) {
    var p = getProgress();
    p['l' + no] = true;
    saveProgress(p);
    refreshCatalogChecks();
  }

  /* ---------- 文化小贴士 ---------- */
  var CULTURE = {
    1: { title: '俄罗斯的字母表', text: '俄语字母源于西里尔字母，由希腊传教士西里尔兄弟于 9 世纪创制。学字母时注意：в 读 [v]、н 读 [n]、р 读 [r]，和拉丁字母外形相同但读音完全不同。' },
    2: { title: '见面礼仪', text: '俄罗斯人初次见面用"Здравствуйте"（您好），熟人之间用"Привет"（你好）。正式场合称呼用名+父称，如"Анна Ивановна"。' },
    3: { title: '俄罗斯家庭观念', text: '俄罗斯人非常重视家庭（семья）。问"кем работает?"（做什么工作）是常见寒暄话题。名字有昵称：Анна→Аня，Иван→Ваня。' },
    4: { title: '作息习惯', text: '俄罗斯人早餐通常简单（茶+面包/粥），午餐是正餐。多数公司 9-10 点上班，18 点下班。"половина восьмого" 字面是"第八个的一半"，实指七点半。' },
    5: { title: '城市交通', text: '莫斯科地铁世界闻名，装饰华丽如宫殿。俄罗斯人乘车说"ехать на метро"（乘地铁），步行说"идти пешком"（步行）。' },
    6: { title: '购物习惯', text: '俄罗斯商店常用"касса"（收银台），购物先说"Дайте, пожалуйста…"（请给我…）。找零说"сдача"。数字 2-4 后名词用单数属格是俄语特色。' },
    7: { title: '餐厅礼仪', text: '俄罗斯人喝汤（суп）多用勺，面包是主食。点餐常用"Можно меню?"（可以看菜单吗？），结账说"Счёт, пожалуйста!"。给小费约 10%。' },
    8: { title: '过去与怀念', text: '俄罗斯人爱谈过去（вчера, раньше），尤其苏联时期。过去时按性数变化是俄语特色——这也是为什么问性别很重要。' },
    9: { title: '未来计划', text: '俄罗斯人计划时常用"собираться + 不定式"（打算）。表达"将要做"用 буду+不定式，表达"将做完"用完成体变位——两个都要会。' },
    10: { title: '动词体文化', text: '俄语动词"体"是俄罗斯人思维的体现：完成体表结果、未完成体表过程。比如"Я читал"（读了，没读完）vs"Я прочитал"（读完了）。' },
    11: { title: '出行习惯', text: '俄罗斯城市里人们常用地铁和公交。记住：定向动词表"正在去"，不定向表"常去/往返"——"Я хожу в парк"表示你经常去公园。' },
    12: { title: '就医习惯', text: '俄罗斯有免费公立医疗（поликлиника），看病常用"у меня болит…"（我…疼）。医生会问"Что у вас болит?"。保健语"Будьте здоровы!"（祝你健康）。' },
    13: { title: '复句思维', text: '俄语复合句用 который 连接定语从句，词序灵活。掌握这些连接词，你的俄语就从"蹦词"变成"成句"，这是 A2 到 B1 的关键一步。' }
  };

  /* ---------- 写作训练数据 ---------- */
  var WRITING_TASKS = [
    {
      no: 1, ru: 'О себе', zh: '自我介绍',
      topic: '写 10~15 句，介绍：姓名、国籍、年龄、职业/学习、语言、爱好、家庭',
      points: ['用 Меня зовут… 开头', '用 из + 属格 说来自哪里', '用 Я учусь / Я работаю 说职业', '至少用一个 потому что 连接句'],
      sample: [
        { ru: 'Здравствуйте! Меня зовут Анна.', zh: '您好！我叫安娜。' },
        { ru: 'Я из Китая, из города Пекин.', zh: '我来自中国北京。' },
        { ru: 'Мне двадцать два года.', zh: '我二十二岁。' },
        { ru: 'Я студентка, я учусь в университете.', zh: '我是大学生，在大学读书。' },
        { ru: 'Я изучаю русский язык уже два года.', zh: '我学俄语已经两年了。' },
        { ru: 'Я люблю музыку и спорт, потому что это интересно.', zh: '我喜欢音乐和运动，因为很有趣。' },
        { ru: 'Моя семья живёт в Пекине.', zh: '我的家人住在北京。' }
      ],
      checks: ['动词变位与人称一致（я учусь / он учится）', '名词性数一致（новая книга）', '用了过去时或将来时', '用了连接词（и / потому что / поэтому）', '句末标点完整']
    },
    {
      no: 2, ru: 'Мой город', zh: '我的城市',
      topic: '写 10~15 句，介绍：城市名称、位置、景点、交通、天气、你喜欢它的原因',
      points: ['用 Я живу в… 开头', '用 в/на + 前置格 说位置（в центре）', '用 есть 说有（В городе есть…）', '至少用一个 поэтому 或 потому что'],
      sample: [
        { ru: 'Я живу в Пекине, это столица Китая.', zh: '我住在北京，它是中国的首都。' },
        { ru: 'Пекин – очень большой и красивый город.', zh: '北京是一座很大很美的城市。' },
        { ru: 'В центре города есть музей и театр.', zh: '市中心有博物馆和剧院。' },
        { ru: 'В Пекине есть метро, поэтому транспорт удобный.', zh: '北京有地铁，所以交通很方便。' },
        { ru: 'Летом в городе жарко, а зимой холодно.', zh: '夏天城市里很热，冬天很冷。' },
        { ru: 'Мой любимый парк находится недалеко от моего дома.', zh: '我最喜欢的公园在我家附近。' },
        { ru: 'Я люблю свой город, потому что здесь живут мои друзья.', zh: '我爱我的城市，因为我的朋友住在这里。' }
      ],
      checks: ['地点用前置格（в городе / в центре）', '方向用宾格（в школу）', '形容词与名词性数格一致', '用了连接词', '时态正确（过去/现在）']
    },
    {
      no: 3, ru: 'Мой рабочий день', zh: '我的工作日',
      topic: '写 10~15 句，按时间顺序描述：起床、上班、工作、午餐、回家、晚上',
      points: ['用 утром / днём / вечером 分时间段', '用 в + 数字 + часов 说几点', '用过去时或现在时一致', '至少用一个 потом 或 когда'],
      sample: [
        { ru: 'Мой рабочий день начинается в семь часов утра.', zh: '我的工作日早上七点开始。' },
        { ru: 'Утром я встаю, умываюсь и завтракаю.', zh: '早上我起床、洗漱、吃早餐。' },
        { ru: 'В восемь часов я иду на работу.', zh: '八点我去上班。' },
        { ru: 'Я работаю в офисе с девяти до шести.', zh: '我从九点到六点在办公室工作。' },
        { ru: 'В обед я обедаю в кафе.', zh: '午餐我在咖啡馆吃饭。' },
        { ru: 'После работы я еду домой на метро.', zh: '下班后我坐地铁回家。' },
        { ru: 'Вечером я ужинаю и смотрю телевизор.', zh: '晚上我吃晚饭、看电视。' }
      ],
      checks: ['时间状语用工具格（утром/вечером）', '时间点用 в + 宾格（в семь часов）', '动词变位正确', '顺序词（потом / после）使用正确', '标点完整']
    },
    {
      no: 4, ru: 'Мои выходные', zh: '我的周末',
      topic: '写 10~15 句，描述周末：休息、爱好、和朋友见面、下个周末的计划',
      points: ['用过去时描述上个周末', '用将来时描述下个周末', '用 ходить/ездить（习惯）', '至少用一个 если 或 чтобы'],
      sample: [
        { ru: 'По выходным я обычно отдыхаю.', zh: '周末我通常休息。' },
        { ru: 'В прошлую субботу я ходил в парк.', zh: '上周六我去了公园。' },
        { ru: 'Я гулял там с другом, и мы много разговаривали.', zh: '我和朋友在那里散步，聊了很多。' },
        { ru: 'В воскресенье я смотрел интересный фильм дома.', zh: '周日我在家看了一部有趣的电影。' },
        { ru: 'В следующие выходные я поеду за город.', zh: '下个周末我要去郊外。' },
        { ru: 'Если будет хорошая погода, мы пойдём гулять.', zh: '如果天气好，我们去散步。' },
        { ru: 'Я хочу хорошо отдохнуть, чтобы работать лучше.', zh: '我想好好休息，以便更好地工作。' }
      ],
      checks: ['过去时按性数变化（я ходил / я ходила）', '将来时用 буду+不定式或完成体变位', '运动动词定向/不定向正确', '用了 если / чтобы 从句', '时态前后一致']
    }
  ];

  /* ---------- 听力训练数据（听音选义） ---------- */
  var LISTENING_QUIZ = [
    { word: 'голова', options: ['头', '腿', '手', '背'], answer: 0 },
    { word: 'собака', options: ['猫', '狗', '马', '牛'], answer: 1 },
    { word: 'яблоко', options: ['梨', '香蕉', '苹果', '橙子'], answer: 2 },
    { word: 'холодный', options: ['热的', '暖的', '凉的', '冷的'], answer: 3 },
    { word: 'завтра', options: ['昨天', '今天', '明天', '后天'], answer: 2 },
    { word: 'работать', options: ['休息', '工作', '学习', '睡觉'], answer: 1 },
    { word: 'дорогой', options: ['便宜的', '新的', '贵的', '旧的'], answer: 2 },
    { word: 'слушать', options: ['说', '听', '看', '读'], answer: 1 }
  ];

  /* ---------- 语音试听 ---------- */
  function speak(text, el) {
    if (!SYNTH_OK) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    u.rate = 0.72;
    if (el) el.classList.add('speaking');
    u.onend = function () { if (el) el.classList.remove('speaking'); };
    u.onerror = function () { if (el) el.classList.remove('speaking'); };
    window.speechSynthesis.speak(u);
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  /* ---------- 课程目录 ---------- */
  function buildCatalog() {
    var grid = document.getElementById('course-grid');
    if (!grid) return;
    LESSONS.forEach(function (L) {
      var card = el('button', 'course-card');
      var stage = L.stage || (L.no <= 4 ? 'A1' : 'A2');
      var done = getProgress()['l' + L.no];
      card.innerHTML =
        '<span class="c-no">Урок ' + L.no + ' · ' + stage + (done ? ' ✓' : '') + '</span>' +
        '<span class="c-ru">' + L.ru + '</span>' +
        '<span class="c-zh">' + L.zh + '</span>' +
        '<span class="c-gram">' + L.gram + '</span>';
      card.addEventListener('click', function () {
        showLesson(L.no);
        document.getElementById('urok').scrollIntoView({ behavior: 'smooth' });
      });
      grid.appendChild(card);
    });
  }

  function refreshCatalogChecks() {
    var cards = document.querySelectorAll('.course-card');
    var p = getProgress();
    cards.forEach(function (card) {
      var noEl = card.querySelector('.c-no');
      if (!noEl) return;
      var m = noEl.textContent.match(/Урок (\d+)/);
      if (m && p['l' + m[1]]) {
        if (noEl.textContent.indexOf('✓') < 0) noEl.textContent += ' ✓';
      }
    });
  }

  /* ---------- 课时面板 ---------- */
  var currentLesson = 1;

  function showLesson(no) {
    currentLesson = no;
    var L = LESSONS.filter(function (x) { return x.no === no; })[0];
    if (!L) return;
    var wrap = document.getElementById('lesson-panel');
    wrap.innerHTML = '';
    var panel = el('div', 'lesson-panel active');

    var head = el('div', 'lesson-head');
    head.innerHTML = '<h3>Урок ' + L.no + ' · ' + L.ru + '</h3><span class="es">' + L.zh + '</span>';
    panel.appendChild(head);

    var goals = el('div', 'lesson-goals');
    goals.innerHTML = '<b>本课目标：</b>' + L.goals.join(' · ');
    panel.appendChild(goals);

    /* 生词表 */
    var vocabBlock = el('div', 'lesson-block');
    vocabBlock.appendChild(el('h4', null, '<span class="b g">1</span> 生词表（点击可试听）'));
    var vw = el('div', 'table-wrap');
    var vt = el('table', 'tbl');
    vt.innerHTML = '<tr><th>单词</th><th>重音</th><th>词性</th><th>中文</th><th>用法/变格</th></tr>';
    L.vocab.forEach(function (v) {
      var tr = el('tr', 'vocab-word');
      tr.innerHTML = '<td class="es">' + v.ru + '</td><td class="es">' + v.stress + '</td><td class="zh">' + v.type + '</td><td class="zh">' + v.zh + '</td><td class="inf">' + v.info + '</td>';
      tr.addEventListener('click', function () { speak(v.ru + '.', tr); });
      vt.appendChild(tr);
    });
    vw.appendChild(vt);
    vocabBlock.appendChild(vw);
    panel.appendChild(vocabBlock);

    /* 语法精讲 */
    var gramBlock = el('div', 'lesson-block');
    gramBlock.appendChild(el('h4', null, '<span class="b">2</span> 语法精讲'));
    L.grammar.forEach(function (g) {
      var pt = el('div', 'gram-pt');
      pt.innerHTML = '<b>' + g.b + '</b> <span class="ex">' + g.ex + ' <i>' + g.i + '</i></span>';
      gramBlock.appendChild(pt);
    });
    panel.appendChild(gramBlock);

    /* 情景课文 */
    var textBlock = el('div', 'lesson-block');
    textBlock.appendChild(el('h4', null, '<span class="b g">3</span> 情景课文（点击整句可试听）'));
    L.text.forEach(function (t) {
      var p = el('div', 'text-para');
      p.innerHTML = t.ru + '<span class="tzh">' + t.zh + '</span>';
      p.addEventListener('click', function () { speak(t.ru, p); });
      textBlock.appendChild(p);
    });
    panel.appendChild(textBlock);

    /* 对话 */
    var diaBlock = el('div', 'lesson-block');
    diaBlock.appendChild(el('h4', null, '<span class="b">4</span> 情景对话（点击可试听）'));
    L.dialog.forEach(function (d) {
      var line = el('div', 'dialog-line');
      line.innerHTML = '<span class="who">' + d.who + '</span><span><span class="d-ru">' + d.ru + '</span><span class="d-zh">' + d.zh + '</span></span>';
      line.addEventListener('click', function () { speak(d.ru, line); });
      diaBlock.appendChild(line);
    });
    panel.appendChild(diaBlock);

    /* 互动练习 */
    var exBlock = el('div', 'lesson-block');
    exBlock.appendChild(el('h4', null, '<span class="b g">5</span> 互动练习（点击作答，即时判题）'));
    L.exercises.forEach(function (ex, i) {
      exBlock.appendChild(buildExercise(ex, i));
    });
    panel.appendChild(exBlock);

    /* 单元自测 */
    var quizBlock = el('div', 'lesson-block');
    var quizBox = el('div', 'quiz-box');
    quizBox.appendChild(el('div', 'quiz-title', '📝 单元自测（答完自动评分，≥75% 可进入下一课）'));
    var quizScore = { total: L.quiz.length, right: 0 };
    L.quiz.forEach(function (q, i) {
      quizBox.appendChild(buildQuizItem(q, i, quizScore));
    });
    var result = el('div', 'quiz-result');
    result.textContent = '已答 0 / ' + quizScore.total + ' 题';
    quizBox.appendChild(result);
    quizBlock.appendChild(quizBox);
    panel.appendChild(quizBlock);

    /* 文化小贴士 */
    var culture = CULTURE[L.no];
    if (culture) {
      var cultBlock = el('div', 'lesson-block');
      var cultBox = el('div', 'gram-warn');
      cultBox.style.borderLeft = '4px solid #1f7a8c';
      cultBox.style.background = 'rgba(31,122,140,0.07)';
      cultBox.style.borderColor = 'rgba(31,122,140,0.35)';
      cultBox.innerHTML = '<b>🌍 文化小贴士 · ' + culture.title + '：</b>' + culture.text;
      cultBlock.appendChild(cultBox);
      panel.appendChild(cultBlock);
    }

    /* 标记完成 + 上下课导航 */
    var nav = el('div', 'lesson-nav');
    var left = el('div');
    left.style.display = 'flex';
    left.style.gap = '0.6rem';
    var prev = el('button', null, '← 上一课');
    if (no <= 1) prev.disabled = true;
    prev.addEventListener('click', function () { showLesson(no - 1); });
    left.appendChild(prev);
    nav.appendChild(left);

    var right = el('div');
    right.style.display = 'flex';
    right.style.gap = '0.6rem';
    var doneBtn = el('button', null, '✓ 标记本课完成');
    doneBtn.style.background = 'rgba(46,125,50,0.1)';
    doneBtn.style.color = '#2e7d32';
    doneBtn.style.borderColor = 'rgba(46,125,50,0.35)';
    doneBtn.addEventListener('click', function () {
      markLessonComplete(no);
      doneBtn.textContent = '✓ 已标记完成';
      doneBtn.disabled = true;
    });
    if (getProgress()['l' + no]) {
      doneBtn.textContent = '✓ 已标记完成';
      doneBtn.disabled = true;
    }
    right.appendChild(doneBtn);
    var next = el('button', null, '下一课 →');
    if (no >= LESSONS.length) next.disabled = true;
    next.addEventListener('click', function () { showLesson(no + 1); });
    right.appendChild(next);
    nav.appendChild(right);

    panel.appendChild(nav);

    wrap.appendChild(panel);
  }

  /* ---------- 构建一道选择题/填空题 ---------- */
  function buildExercise(ex, idx) {
    var item = el('div', 'ex-item');
    var q = el('div', 'ex-q');
    q.innerHTML = '<b>' + (idx + 1) + '.</b> ' + ex.q;
    item.appendChild(q);

    var fb = el('div', 'ex-fb hint');
    if (ex.type === 'choice') {
      fb.textContent = '点击选项作答';
    } else {
      fb.textContent = '输入后点击"检查"';
    }

    if (ex.type === 'choice') {
      var opts = el('div', 'ex-opts');
      ex.options.forEach(function (opt, oi) {
        var btn = el('button', 'ex-opt', opt);
        btn.type = 'button';
        btn.addEventListener('click', function () {
          var btns = opts.querySelectorAll('.ex-opt');
          btns.forEach(function (b) { b.disabled = true; });
          if (oi === ex.answer) {
            btn.classList.add('correct');
            fb.className = 'ex-fb ok';
            fb.textContent = '✓ 正确！' + (ex.fb || '');
          } else {
            btn.classList.add('wrong');
            btns[ex.answer].classList.add('correct');
            fb.className = 'ex-fb no';
            fb.textContent = '✗ 再想想。正确答案：' + ex.options[ex.answer] + '。' + (ex.fb || '');
          }
        });
        opts.appendChild(btn);
      });
      item.appendChild(opts);
    } else {
      var wrap2 = el('div', 'ex-input-wrap');
      var input = el('input', 'ex-input');
      input.type = 'text';
      input.placeholder = '输入俄语…';
      var btn2 = el('button', 'ex-btn', '检查');
      btn2.type = 'button';
      btn2.addEventListener('click', function () {
        var val = input.value.trim().toLowerCase().replace(/ё/g, 'е');
        var ok = (ex.answers || []).some(function (a) {
          return val === a.toLowerCase().replace(/ё/g, 'е');
        });
        if (ok) {
          fb.className = 'ex-fb ok';
          fb.textContent = '✓ 正确！' + (ex.fb || '');
          input.style.borderColor = '#2e7d32';
          btn2.disabled = true;
        } else {
          fb.className = 'ex-fb no';
          fb.textContent = '✗ 不对。' + (ex.fb || '');
          input.style.borderColor = '#c62828';
        }
      });
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); btn2.click(); }
      });
      wrap2.appendChild(input);
      wrap2.appendChild(btn2);
      item.appendChild(wrap2);
    }

    item.appendChild(fb);
    return item;
  }

  /* ---------- 单元自测题 ---------- */
  function buildQuizItem(q, idx, score) {
    var item = el('div', 'ex-item');
    var qEl = el('div', 'ex-q');
    qEl.innerHTML = '<b>' + (idx + 1) + '.</b> ' + q.q;
    item.appendChild(qEl);

    if (q.type === 'choice') {
      var opts = el('div', 'ex-opts');
      q.options.forEach(function (opt, oi) {
        var btn = el('button', 'ex-opt', opt);
        btn.type = 'button';
        btn.addEventListener('click', function () {
          if (btn.disabled) return;
          var btns = opts.querySelectorAll('.ex-opt');
          btns.forEach(function (b) { b.disabled = true; });
          if (oi === q.answer) {
            btn.classList.add('correct');
            score.right++;
          } else {
            btn.classList.add('wrong');
            btns[q.answer].classList.add('correct');
          }
          updateQuizScore(score);
        });
        opts.appendChild(btn);
      });
      item.appendChild(opts);
    } else {
      var wrap2 = el('div', 'ex-input-wrap');
      var input = el('input', 'ex-input');
      input.type = 'text';
      input.placeholder = '输入俄语…';
      var btn2 = el('button', 'ex-btn', '检查');
      btn2.type = 'button';
      btn2.addEventListener('click', function () {
        if (btn2.disabled) return;
        var val = input.value.trim().toLowerCase().replace(/ё/g, 'е');
        var ok = (q.answers || []).some(function (a) {
          return val === a.toLowerCase().replace(/ё/g, 'е');
        });
        if (ok) {
          input.style.borderColor = '#2e7d32';
          score.right++;
        } else {
          input.style.borderColor = '#c62828';
          input.value = q.answers[0];
        }
        btn2.disabled = true;
        input.disabled = true;
        updateQuizScore(score);
      });
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); btn2.click(); }
      });
      wrap2.appendChild(input);
      wrap2.appendChild(btn2);
      item.appendChild(wrap2);
    }
    return item;
  }

  function updateQuizScore(score) {
    var result = document.querySelector('.quiz-result');
    if (!result) return;
    result.textContent = '已答 ' + score.total + ' 题中答对 ' + score.right + ' 题（目标 ≥75%）';
    if (score.right === score.total) {
      result.textContent = '🎉 全对！' + score.total + '/' + score.total + '，太棒了，可以进入下一课！';
    } else if (score.right >= Math.ceil(score.total * 0.75)) {
      result.textContent = '✅ 已达标：' + score.right + '/' + score.total + '（≥75%），可进入下一课！';
    }
  }

  /* ---------- 语法手册 ---------- */
  function buildHandbook() {
    var wrap = document.getElementById('handbook');
    if (!wrap) return;

    var blocks = [
      { title: '六格变格总表（стол/книга/окно）', head: ['格', '问题', '阳性 стол', '阴性 книга', '中性 окно', '用法'],
        rows: [
          ['1 主格', 'кто? что?', 'стол', 'книга', 'окно', '主语'],
          ['2 属格', 'кого? чего?', 'стола', 'книги', 'окна', '所属/否定/数量'],
          ['3 与格', 'кому? чему?', 'столу', 'книге', 'окну', '间接宾语'],
          ['4 宾格', 'кого? что?', 'стол', 'книгу', 'окно', '直接宾语'],
          ['5 工具格', 'кем? чем?', 'столом', 'книгой', 'окном', '工具/一起'],
          ['6 前置格', 'о ком? о чём?', 'о столе', 'о книге', 'об окне', 'в/на/о 后']
        ] },
      { title: '人称代词变格', head: ['格', 'я', 'ты', 'он/оно', 'она', 'мы', 'вы', 'они'],
        rows: [
          ['主格', 'я', 'ты', 'он', 'она', 'мы', 'вы', 'они'],
          ['属格', 'меня', 'тебя', 'его', 'её', 'нас', 'вас', 'их'],
          ['与格', 'мне', 'тебе', 'ему', 'ей', 'нам', 'вам', 'им'],
          ['宾格', 'меня', 'тебя', 'его', 'её', 'нас', 'вас', 'их'],
          ['工具格', 'мной', 'тобой', 'им', 'ей', 'нами', 'вами', 'ими'],
          ['前置格', 'обо мне', 'о тебе', 'о нём', 'о ней', 'о нас', 'о вас', 'о них']
        ] },
      { title: '过去时（按性数）', head: ['动词', '阳性', '阴性', '中性', '复数'],
        rows: [
          ['читать', 'читал', 'читала', 'читало', 'читали'],
          ['говорить', 'говорил', 'говорила', 'говорило', 'говорили'],
          ['быть', 'был', 'была', 'было', 'были'],
          ['жить', 'жил', 'жила', 'жило', 'жили']
        ] },
      { title: '将来时（未完成 vs 完成）', head: ['人称', '未完成：буду читать', '完成：прочитаю'],
        rows: [
          ['я', 'буду читать', 'прочитаю'],
          ['ты', 'будешь читать', 'прочитаешь'],
          ['он/она', 'будет читать', 'прочитает'],
          ['мы', 'будем читать', 'прочитаем'],
          ['вы', 'будете читать', 'прочитаете'],
          ['они', 'будут читать', 'прочитают']
        ] },
      { title: '高频动词体配对', head: ['未完成体', '含义', '完成体'],
        rows: [
          ['читать', '读', 'прочитать'],
          ['писать', '写', 'написать'],
          ['делать', '做', 'сделать'],
          ['покупать', '买', 'купить'],
          ['смотреть', '看', 'посмотреть'],
          ['говорить', '说', 'сказать'],
          ['есть', '吃', 'съесть'],
          ['пить', '喝', 'выпить'],
          ['открывать', '打开', 'открыть'],
          ['начинать', '开始', 'начать']
        ] },
      { title: '运动动词与前缀', head: ['定向', '不定向', '含义', '带前缀完成体'],
        rows: [
          ['идти', 'ходить', '走', 'пойти / прийти / уйти'],
          ['ехать', 'ездить', '乘车', 'поехать / приехать / уехать'],
          ['бежать', 'бегать', '跑', 'побежать / прибежать'],
          ['лететь', 'летать', '飞', 'полететь / прилететь'],
          ['плыть', 'плавать', '游', 'поплыть / приплыть']
        ] },
      { title: '复合句连接词', head: ['连接词', '功能', '例句'],
        rows: [
          ['который', '定语（…的）', 'человек, который живёт в Москве'],
          ['когда', '时间（当…时）', 'Когда я был в Москве…'],
          ['если', '条件（如果）', 'Если будет время…'],
          ['потому что', '原因（因为）', 'Я учу русский, потому что…'],
          ['поэтому', '结果（所以）', 'Я занимаюсь, поэтому…'],
          ['чтобы', '目的（为了）', 'учусь, чтобы работать…']
        ] }
    ];

    blocks.forEach(function (b) {
      var block = el('div', 'lesson-block');
      block.appendChild(el('h4', null, '<span class="b g">▣</span> ' + b.title));
      var vw = el('div', 'table-wrap');
      var tb = el('table', 'tbl');
      var h = '<tr>';
      b.head.forEach(function (h2) { h += '<th>' + h2 + '</th>'; });
      h += '</tr>';
      tb.innerHTML = h;
      b.rows.forEach(function (r) {
        var tr = el('tr');
        tr.innerHTML = r.map(function (c, i) {
          return i === 0 ? '<td class="zh">' + c + '</td>' : '<td class="es">' + c + '</td>';
        }).join('');
        tb.appendChild(tr);
      });
      vw.appendChild(tb);
      block.appendChild(vw);
      wrap.appendChild(block);
    });
  }

  /* ---------- 考试指南 ---------- */
  function buildExam() {
    var wrap = document.getElementById('exam-detail');
    if (!wrap) return;
    wrap.innerHTML =
      '<div class="table-wrap" style="margin-bottom:1.2rem;">' +
      '<table class="tbl"><tr><th>子测试</th><th>题量</th><th>时长</th><th>考察内容</th><th>满分</th></tr>' +
      '<tr><td class="zh">1 词汇与语法</td><td class="es">100 题</td><td class="es">50 分钟</td><td class="zh">六格变格、动词体、运动动词、连接词</td><td class="es">100</td></tr>' +
      '<tr><td class="zh">2 阅读</td><td class="es">30 题</td><td class="es">50 分钟</td><td class="zh">生活短文、公告、广告（250-300 词）</td><td class="es">100</td></tr>' +
      '<tr><td class="zh">3 听力</td><td class="es">25 题</td><td class="es">30 分钟</td><td class="zh">日常对话与通知（播放两遍）</td><td class="es">100</td></tr>' +
      '<tr><td class="zh">4 写作</td><td class="es">2 任务</td><td class="es">50 分钟</td><td class="zh">个人信息表 + 命题短文（10-15 句）</td><td class="es">100</td></tr>' +
      '<tr><td class="zh">5 口语</td><td class="es">4 大题</td><td class="es">25 分钟</td><td class="zh">自我介绍、情景对话、主题陈述</td><td class="es">100</td></tr>' +
      '</table></div>' +
      '<div class="note-banner" style="margin-top:0;"><b>通过标准：</b>每项 ≥ 66%（约 66 分），最多允许 1~2 项 60%；总时长约 4 小时。词汇量要求约 1300 词，本课程 13 课已覆盖考试要求的全部语法点与高频主题<sup><a href="#cite-2">[2]</a></sup><sup><a href="#cite-3">[3]</a></sup>。</div>';
  }

  /* ---------- 词汇库 ---------- */
  var vbState = { topic: 0, mode: 'list', flashIdx: 0, flashFlipped: false };

  function buildVocabBank() {
    var wrap = document.getElementById('vocab-bank');
    if (!wrap) return;
    var bank = window.VOCAB_BANK || [];
    if (bank.length === 0) return;

    /* 工具栏 */
    var toolbar = el('div', 'vocab-toolbar');
    var search = el('input', 'vocab-search');
    search.type = 'text';
    search.placeholder = '搜索俄语或中文…';
    var toggle = el('div', 'mode-toggle');
    var btnList = el('button', 'mode-btn active', '列表');
    var btnFlash = el('button', 'mode-btn', '闪卡');
    btnList.type = 'button'; btnFlash.type = 'button';
    toggle.appendChild(btnList); toggle.appendChild(btnFlash);
    toolbar.appendChild(search); toolbar.appendChild(toggle);
    wrap.appendChild(toolbar);

    /* 主题标签 */
    var tabs = el('div', 'tabs');
    tabs.id = 'vb-tabs';
    bank.forEach(function (t, i) {
      var b = el('button', 'tab-btn' + (i === 0 ? ' active' : ''), t.name);
      b.type = 'button';
      b.dataset.idx = i;
      b.addEventListener('click', function () { vbState.topic = i; renderVb(); });
      tabs.appendChild(b);
    });
    wrap.appendChild(tabs);

    var listBox = el('div', null, '');
    listBox.id = 'vb-list';
    var flashBox = el('div', null, '');
    flashBox.id = 'vb-flash';
    flashBox.style.display = 'none';
    wrap.appendChild(listBox);
    wrap.appendChild(flashBox);

    /* 听力小练 */
    var listenBox = el('div', 'lesson-block');
    listenBox.style.marginTop = '1.5rem';
    listenBox.appendChild(el('h4', null, '<span class="b g">🎧</span> 听音选义（点击播放，选出正确中文）'));
    LISTENING_QUIZ.forEach(function (q, i) {
      listenBox.appendChild(buildListeningItem(q, i));
    });
    wrap.appendChild(listenBox);

    /* 模式切换 */
    btnList.addEventListener('click', function () {
      vbState.mode = 'list';
      btnList.classList.add('active'); btnFlash.classList.remove('active');
      renderVb();
    });
    btnFlash.addEventListener('click', function () {
      vbState.mode = 'flash';
      btnFlash.classList.add('active'); btnList.classList.remove('active');
      vbState.flashIdx = 0; vbState.flashFlipped = false;
      renderVb();
    });
    search.addEventListener('input', function () { renderVb(); });

    function renderVb() {
      Array.from(tabs.querySelectorAll('.tab-btn')).forEach(function (b) {
        b.classList.toggle('active', parseInt(b.dataset.idx, 10) === vbState.topic);
      });
      var kw = search.value.trim().toLowerCase();
      var words = bank[vbState.topic].words.filter(function (w) {
        if (!kw) return true;
        return w.ru.toLowerCase().indexOf(kw) >= 0 || w.zh.indexOf(kw) >= 0;
      });

      if (vbState.mode === 'list') {
        flashBox.style.display = 'none';
        listBox.style.display = 'block';
        listBox.innerHTML = '';
        var grid = el('div', 'vocab-grid');
        words.forEach(function (w) {
          var chip = el('button', 'vocab-chip');
          chip.type = 'button';
          chip.innerHTML = '<span class="w-type">' + w.type + '</span><span class="w-es">' + w.ru + '</span><span class="w-zh">' + w.zh + '</span>';
          chip.addEventListener('click', function () { speak(w.ru + '.', chip); });
          grid.appendChild(chip);
        });
        listBox.appendChild(grid);
      } else {
        listBox.style.display = 'none';
        flashBox.style.display = 'block';
        flashBox.innerHTML = '';
        if (words.length === 0) { flashBox.appendChild(el('p', null, '没有匹配的词')); return; }
        if (vbState.flashIdx >= words.length) vbState.flashIdx = 0;
        var w = words[vbState.flashIdx];
        var card = el('div', 'flashcard');
        card.innerHTML = vbState.flashFlipped
          ? '<span class="f-zh">' + w.zh + '</span><span class="f-type">' + w.type + '</span><span class="f-ru" style="font-size:1.2rem;">' + w.ru + '</span>'
          : '<span class="f-ru">' + w.ru + '</span><span class="f-type">' + w.type + '</span><span class="f-hint">点击翻面</span>';
        card.addEventListener('click', function () {
          vbState.flashFlipped = !vbState.flashFlipped;
          if (vbState.flashFlipped) speak(w.ru + '.', card);
          renderVb();
        });
        flashBox.appendChild(card);
        var nav = el('div', 'flashcard-nav');
        var prev = el('button', null, '← 上一个');
        var next = el('button', null, '下一个 →');
        prev.type = 'button'; next.type = 'button';
        prev.addEventListener('click', function () { vbState.flashIdx = (vbState.flashIdx - 1 + words.length) % words.length; vbState.flashFlipped = false; renderVb(); });
        next.addEventListener('click', function () { vbState.flashIdx = (vbState.flashIdx + 1) % words.length; vbState.flashFlipped = false; renderVb(); });
        nav.appendChild(prev); nav.appendChild(next);
        flashBox.appendChild(nav);
      }
    }

    renderVb();
  }

  function buildListeningItem(q, i) {
    var item = el('div', 'ex-item');
    var qEl = el('div', 'ex-q');
    qEl.innerHTML = '<b>' + (i + 1) + '.</b> ';
    var playBtn = el('button', 'ex-opt', '▶ 播放');
    playBtn.type = 'button';
    playBtn.style.background = 'rgba(31,122,140,0.1)';
    playBtn.style.color = '#1f7a8c';
    playBtn.style.fontWeight = '700';
    playBtn.addEventListener('click', function () { speak(q.word + '.', playBtn); });
    qEl.appendChild(playBtn);
    item.appendChild(qEl);
    var opts = el('div', 'ex-opts');
    q.options.forEach(function (opt, oi) {
      var b = el('button', 'ex-opt', opt);
      b.type = 'button';
      b.addEventListener('click', function () {
        var btns = opts.querySelectorAll('.ex-opt');
        btns.forEach(function (x) { x.disabled = true; });
        if (oi === q.answer) { b.classList.add('correct'); }
        else { b.classList.add('wrong'); btns[q.answer].classList.add('correct'); }
      });
      opts.appendChild(b);
    });
    item.appendChild(opts);
    return item;
  }

  /* ---------- 写作训练 ---------- */
  function buildWriting() {
    var wrap = document.getElementById('writing-panel');
    if (!wrap) return;
    var grid = el('div', 'writing-grid');
    WRITING_TASKS.forEach(function (t) {
      var card = el('div', 'writing-card');
      card.appendChild(el('h3', null, '<span class="mark">' + t.no + '</span> ' + t.ru + ' · ' + t.zh));
      card.appendChild(el('p', 'w-topic', t.topic));
      t.points.forEach(function (p) {
        card.appendChild(el('div', 'writing-point', '<b>▸</b> ' + p));
      });
      card.appendChild(el('div', 'writing-point', '<b>范文：</b>'));
      t.sample.forEach(function (s) {
        var line = el('div', 'text-para', s.ru + '<span class="tzh">' + s.zh + '</span>');
        line.addEventListener('click', function () { speak(s.ru, line); });
        card.appendChild(line);
      });
      var check = el('div', 'writing-check');
      check.innerHTML = '<b>评分自查：</b>' + t.checks.join(' · ');
      card.appendChild(check);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildCatalog();
    buildHandbook();
    buildExam();
    buildVocabBank();
    buildWriting();
    showLesson(1);
  });
})();
