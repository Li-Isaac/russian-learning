/* 郦书甲老师的俄语小课堂 · ТРКИ A2 系统课程 · 渲染引擎 */
(function () {
  'use strict';

  var LESSONS = (window.LESSONS_A || []).concat(window.LESSONS_B || []);
  var SYNTH_OK = 'speechSynthesis' in window;

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
      card.innerHTML =
        '<span class="c-no">Урок ' + L.no + '</span>' +
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

    /* 上下课导航 */
    var nav = el('div', 'lesson-nav');
    var prev = el('button', null, '← 上一课');
    var next = el('button', null, '下一课 →');
    if (no <= 1) prev.disabled = true;
    if (no >= LESSONS.length) next.disabled = true;
    prev.addEventListener('click', function () { showLesson(no - 1); });
    next.addEventListener('click', function () { showLesson(no + 1); });
    nav.appendChild(prev);
    nav.appendChild(next);
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
    result.textContent = '已答 ' + (score.total + 0) + ' 题中答对 ' + score.right + ' 题（目标 ≥75%）';
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
      '<div class="note-banner" style="margin-top:0;"><b>通过标准：</b>每项 ≥ 66%（约 66 分），最多允许 1~2 项 60%；总时长约 4 小时。词汇量要求约 1300 词，本课程 12 课已覆盖考试要求的全部语法点与高频主题<sup><a href="#cite-2">[2]</a></sup><sup><a href="#cite-3">[3]</a></sup>。</div>';
  }

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildCatalog();
    buildHandbook();
    buildExam();
    showLesson(1);
  });
})();
