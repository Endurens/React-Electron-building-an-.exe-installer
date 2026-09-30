/* React → Electron Guide — чистый JS без React и сборки.
   Открывается двойным кликом или через VS Code (Live Server / Open with Live Server).
   Прогресс сохраняется в localStorage. */

"use strict";

/* ---------- промпты ---------- */

var PROMPT_0 =
  "Ревизия проекта. Ознакомься с моим проектом. Прочитай package.json и расскажи кратко: какой сборщик используется (Vite или react-scripts/CRA), какие есть скрипты, имя и версия приложения, где лежит index.html. Ничего не меняй, просто доложи.";

var PROMPT_1 =
  "Перевод на Vite. Мой React-проект собран на Create React App. Мигрируй его на Vite:\n" +
  "1) Установи vite и @vitejs/plugin-react как devDependencies.\n" +
  "2) Создай vite.config.js с плагином react.\n" +
  "3) Перенеси index.html в корень проекта и поправь в нём тег script: <script type=\"module\" src=\"/src/main.jsx\"></script> (файл src/index.tsx или src/index.jsx — точка входа приложения).\n" +
  "4) Обнови скрипты в package.json: \"dev\": \"vite\", \"build\": \"vite build\", \"preview\": \"vite preview\".\n" +
  "5) Удали react-scripts и ненужные конфиги CRA.\n" +
  "Проверь, что npm run dev открывает приложение, а npm run build собирается без ошибок. Если что-то ломается (переменные окружения process.env.REACT_APP_*, импорты svg) — исправь под Vite.";

var PROMPT_1_ALREADY_VITE =
  "Проект уже на Vite, просто проверь, что npm run build работает.";

var PROMPT_2 =
  "Установка Electron. Переведи мой проект на Electron (только обёртка окна, без нативных API). Сделай:\n" +
  "1) Установи в devDependencies: electron, concurrently, wait-on, cross-env.\n" +
  "2) Создай electron/main.cjs — главный процесс: BrowserWindow размером 1280x800, minWidth 960, minHeight 640, заголовок окна — из поля \"name\" в package.json. Если задана переменная process.env.VITE_DEV_SERVER_URL — загружать win.loadURL(VITE_DEV_SERVER_URL), иначе win.loadFile(path.join(__dirname, '..', 'dist', 'index.html')). app.whenReady().then(createWindow); app.on('window-all-closed', () => app.quit()).\n" +
  "3) В package.json добавь поле \"main\": \"electron/main.cjs\" и скрипты:\n" +
  "\"electron:dev\": \"concurrently -k \\\"vite\\\" \\\"wait-on tcp:5173 && cross-env VITE_DEV_SERVER_URL=http://localhost:5173 electron .\\\"\",\n" +
  "\"electron:start\": \"npm run build && electron .\"\n" +
  "4) В vite.config.js поставь base: \"./\".\n" +
  "Проверь: npm run electron:dev должен открыть окно Electron с работающим приложением. Доклади результат.";

var PROMPT_3 =
  "NSIS-установщик. Настрой сборку Windows-установщика через electron-builder:\n" +
  "1) Установи electron-builder в devDependencies.\n" +
  "2) Добавь в package.json секцию \"build\":\n" +
  "\"appId\": \"com.mycompany.myapp\" (придумай из имени приложения),\n" +
  "\"productName\": имя приложения,\n" +
  "\"directories\": { \"output\": \"release\" },\n" +
  "\"files\": [\"dist/**/*\", \"electron/**/*\"],\n" +
  "\"win\": { \"target\": \"nsis\" },\n" +
  "\"nsis\": { \"oneClick\": false, \"allowToChangeInstallationDirectory\": true, \"createDesktopShortcut\": true }\n" +
  "3) Добавь скрипт: \"dist\": \"npm run build && electron-builder --win\".\n" +
  "4) Выполни npm run dist и убедись, что в папке release появился установочный .exe, и приложение запускается из собранной версии (не пустое окно). Исправь все ошибки сборки.";

var PROMPT_4 =
  "Финальная проверка. Проведи финальную проверку миграции Electron и исправь найденные проблемы:\n" +
  "1) npm run dev — vite-сервер работает;\n" +
  "2) npm run electron:dev — окно Electron открывается и приложение в нём работает, навигация/роутер не ломаются;\n" +
  "3) npm run dist — NSIS-установщик собирается, после установки приложение запускается и загружает контент (не белое окно);\n" +
  "4) Проверь, что в коде нет reliance на URL-бар и историю браузера, если такое было (window.alert и подобные вызовы в Electron работают). Отчитайся списком: «что проверено — что исправлено».";

var PROMPT_ICON =
  "Своя иконка. Сделай иконку приложения: сгенерируй build/icon.ico размером 256x256 из logo.svg (или подготовь квадратный png и сконвертируй в .ico, например через electron-icon-builder или sharp). Укажи путь к иконке в секции \"win\" конфига electron-builder (\"win\": { \"icon\": \"build/icon.ico\" }) и пересобери npm run dist.";

/* ---------- словарь терминов ---------- */

var GLOSSARY = [
  {
    group: "Инструменты",
    items: [
      { term: "React", def: "JavaScript-библиотека для построения интерфейсов. Приложение собирается из компонентов — переиспользуемых блоков (кнопка, карточка, форма), которые React рисует на странице и обновляет при изменении данных." },
      { term: "Electron", def: "Фреймворк, который заворачивает веб-приложение в настольную программу: внутри — Chromium (рисует интерфейс) и Node.js (доступ к системе). Так сделаны VS Code, Telegram Desktop, Slack, Discord, Figma-десктоп." },
      { term: "Vite", def: "Современный сборщик проектов («вите», от франц. vite — быстро). Запускает dev-сервер с мгновенной перезагрузкой и собирает production-версию. Пришёл на смену Create React App." },
      { term: "Create React App (CRA) / react-scripts", def: "Старый официальный набор скриптов для сборки React. Если в package.json есть react-scripts — проект собран на CRA. Команда React перевела его в статус deprecated (устарел, не развивается), поэтому новые проекты начинают на Vite — отсюда миграция." },
      { term: "electron-builder", def: "Инструмент упаковки: берёт готовую сборку (dist/) плюс Electron и заворачивает в установщик под вашу ОС — .exe (Windows), .dmg (macOS), .AppImage (Linux). Именно он настраивается через секцию build в package.json." },
      { term: "NSIS", def: "Nullsoft Scriptable Install System — классический Windows-установщик: мастер с кнопкой «Далее», выбор папки установки, ярлыки на рабочем столе и в меню «Пуск». Опции: oneClick (один клик — без мастера), allowToChangeInstallationDirectory (выбор папки), createDesktopShortcut (ярлык на рабочем столе)." },
      { term: "Node.js", def: "Среда выполнения JavaScript вне браузера. Нужна для npm и для Electron: «внутренняя», системная половина Electron-приложения работает именно на Node.js." },
      { term: "npm", def: "Пакетный менеджер Node.js. Устанавливает библиотеки (npm install electron, короче npm i) и запускает команды из package.json (npm run dev, npm run dist)." }
    ]
  }
];

/* ---------- карточки шагов ---------- */

var STEPS = [
  {
    id: 1,
    icon: "🔍",
    newContext: true,
    tag: "ШАГ 0 · РЕВИЗИЯ",
    tagClass: "tag-violet",
    title: "Ревизия проекта — узнаём, что у вас на руках",
    subtitle: "Промпт-разведка: opencode читает проект и докладывает, ничего не меняя",
    description:
      "Прежде чем что-то переносить, смотрим, с чем работаем. opencode прочтёт package.json — «паспорт» проекта — и доложит три вещи: какой стоит сборщик (Vite или react-scripts/CRA), какие объявлены команды (scripts) и где физически лежит index.html. Это определяет, нужен ли вам следующий шаг целиком или его можно пропустить. Правило шага: opencode ни-че-го не меняет — только доклад.",
    steps: [
      {
        label: "Убедиться, что перед вами React-проект",
        description:
          "Откройте корень проекта и загляните в package.json. В списке dependencies должны быть react и react-dom. Если там же есть react-scripts — проект на CRA, и вам пригодится весь следующий шаг. Если уже стоит vite — вы на Vite, шаг 2 пропускаете.",
        note: "Не нашли package.json? Вы не в корне проекта — откройте opencode именно в папке проекта"
      },
      {
        label: "Отправить промпт-ревизию",
        description: "Откройте opencode в корне проекта, скопируйте промпт и отправьте:",
        prompt: PROMPT_0,
        note: "Проверка: opencode назвал сборщик, перечислил скрипты, имя и версию приложения, показал путь к index.html — и не переписал ни один файл"
      },
      {
        label: "Развилка: Vite уже стоит?",
        description:
          "Смотрим на ответ. Если opencode сказал «Vite» или в package.json нет react-scripts — шаг 2 пропускаем, а вместо него отправляем короткий промпт проверки:",
        prompt: PROMPT_1_ALREADY_VITE,
        note: "Убедились, что npm run build проходит без ошибок — переходите к шагу 3 (Electron)"
      }
    ]
  },
  {
    id: 2,
    icon: "⚡",
    newContext: true,
    tag: "ШАГ 1 · VITE",
    tagClass: "tag-indigo",
    title: "Перевод проекта на Vite (если он ещё на CRA)",
    subtitle: "Новый фундамент сборки — быстро, современно, без react-scripts",
    description:
      "Create React App устарел и больше не поддерживается — официальная рекомендация сообщества React: переезжать на Vite. opencode поставит сборщик и плагин, вытащит index.html из папки public в корень (так Vite его находит), перепишет тег script на модульный (type=\"module\", src=\"/src/main.jsx\"), обновит команды в package.json и вычистит react-scripts вместе с мёртвыми конфигами CRA. Если в коде встречаются переменные окружения CRA (process.env.REACT_APP_*) или особенности импорта svg — opencode сам их перепишет под Vite. Вам не нужно ничего делать руками — только проверить два результата.",
    steps: [
      {
        label: "Отправить промпт миграции",
        description: "Скопируйте промпт и отправьте в opencode:",
        prompt: PROMPT_1,
        note: "Проверка: в package.json появились «dev\": \"vite\", «build\": \"vite build», «preview»: «vite preview»; react-scripts исчез; в корне лежит vite.config.js и index.html со строкой <script type=\"module\" src=\"/src/main.jsx\">"
      },
      {
        label: "Проверить оба режима",
        description:
          "Две команды — обе должен выполнить opencode и отчитаться. Ваша проверка глазами:",
        bulletIntro: "Ожидаемый результат:",
        bullets: [
          "npm run dev — URL вида http://localhost:5173, приложение открывается в браузере",
          "npm run build — строка «✓ built in …», папка dist/ создана, ошибок ноль"
        ],
        expect: "Если что-то сломалось — отправьте opencode текст ошибки целиком, он исправит и перезапустит",
        note: "После успеха переезжайте на шаг 3 — Electron"
      }
    ]
  },
  {
    id: 3,
    icon: "🪟",
    newContext: true,
    tag: "ШАГ 2 · ELECTRON",
    tagClass: "tag-blue",
    title: "Electron-обёртка: React в настольном окне",
    subtitle: "Главный процесс main.cjs, команды electron:dev и electron:start",
    description:
      "Теперь новое: приложение получает настольную «обёртку». opencode добавит четыре dev-пакета (electron — сам движок, concurrently — запуск главной и веб-части одновременно, wait-on — пауза до готовности dev-сервера, cross-env — переменные окружения по-виндовому) и напишет electron/main.cjs — главный процесс, открывающий окно BrowserWindow 1280×800 (min 960×640) с заголовком из поля name. Логика загрузки двойная: если задан VITE_DEV_SERVER_URL — окно грузит интерфейс с dev-сервера (режим разработки), иначе — файл dist/index.html с диска (готовое приложение). В package.json появятся «main»: «electron/main.cjs» и две команды, а в vite.config.js — base \"./\" — критическая настройка путей, без которой в окне будет пусто.",
    steps: [
      {
        label: "Отправить промпт установки Electron",
        description: "Скопируйте промпт и отправьте в opencode:",
        prompt: PROMPT_2,
        note: "Проверка: появились electron/main.cjs и «main»: «electron/main.cjs» в package.json; скрипты electron:dev и electron:start на месте; в vite.config.js появилась base \"./\""
      },
      {
        label: "Запустить окно Electron",
        description:
          "Попросите opencode выполнить npm run electron:dev. Что происходит внутри команды — коротко:",
        bullets: [
          "concurrently запускает vite и Electron одновременно — окно и dev-сервер стартуют вместе",
          "wait-on tcp:5173 — Electron ждёт, пока dev-сервер реально поднимется",
          "cross-env VITE_DEV_SERVER_URL=http://localhost:5173 — передаёт адрес внутрь Electron; окно грузит приложение по нему"
        ],
        expect: "Должно открыться десктоп-окно (не браузер!) с вашим приложением внутри",
        note: "Открылось пустое/белое окно значит base \"./\" не подхватился — отправьте opencode: «Белое окно, проверь base в vite.config.js и перезапусти electron:dev»"
      }
    ]
  },
  {
    id: 4,
    icon: "📦",
    newContext: true,
    tag: "ШАГ 3 · NSIS",
    tagClass: "tag-sky",
    title: "NSIS-установщик: пакуем .exe",
    subtitle: "electron-builder, секция build в package.json, команда dist",
    description:
      "Окно работает — теперь делаем установщик. opencode поставит electron-builder и добавит секцию build в package.json: appId (компания-имя-приложения), productName (имя для установщика и ярлыков), directories.output — release (папка для результата), files — что именно пакуем (dist и electron), win.target — nsis, и опции установщика: oneClick false (мастер с «Далее», а не молниеносная установка), allowToChangeInstallationDirectory (пользователь сам выбирает папку), createDesktopShortcut (ярлык на рабочем столе). Скрипт dist собирает всё в цепочку: сначала обычная production-сборка, потом electron-builder --win. После — файл Setup.exe в папке release/.",
    steps: [
      {
        label: "Отправить промпт установщика",
        description: "Скопируйте промпт и отправьте в opencode:",
        prompt: PROMPT_3,
        note: "Проверка: в package.json появилась секция build и скрипт dist; в папке release/ найдите файл вида *.exe Setup"
      },
      {
        label: "Поставить и проверить приложение",
        description:
          "Запустите Setup.exe из release/, установите как обычную программу и откройте. Приложение должно запуститься с полным интерфейсом — тем, что работал в окне Electron на прошлом шаге.",
        expect: "Если увидели белое окно — вернитесь на шаг 2: почти всегда это потерянный base \"./\"",
        note: "opencode сам прогонит сборку и сообщит, был ли билд рабочий. Не верьте докладу на слово — установите и посмотрите своими глазами"
      }
    ]
  },
  {
    id: 5,
    icon: "🩺",
    newContext: true,
    tag: "ШАГ 4 · ПРОВЕРКА",
    tagClass: "tag-green",
    title: "Финальная проверка — прогон всей сборки",
    subtitle: "Три команды, один отчёт: что проверено — что исправлено",
    description:
      "Финальный контроль качества всей миграции. opencode по очереди прогоняет все три команды, проверяет навигацию (React Router и анкор-ссылки — типичное место поломок в Electron, потому что старый путь через историю браузера/URL там не работает) и отчитывается списком «что проверено — что исправлено». Ваша задача — сравнить его доклад с реальностью: запустить каждую команду руками и убедиться, что установленный .exe открывается с контентом.",
    steps: [
      {
        label: "Отправить промпт финальной проверки",
        description: "Скопируйте промпт и отправьте в opencode:",
        prompt: PROMPT_4,
        note: "Доклад должен быть списком «что проверено — что исправлено», а не общими словами. Двусмысленно? Попросите раскрыть конкретный пункт"
      },
      {
        label: "Сверить глаза с докладом",
        description:
          "Четыре пункта чек-листа — отметьте каждый, убедившись лично:",
        bullets: [
          "npm run dev — dev-сервер поднялся, страница в браузере работает",
          "npm run electron:dev — десктоп-окно открылось, навигация внутри него не ломается",
          "npm run dist — установщик .exe собрался и перезаписался в release/",
          "Установка с Setup.exe — приложение открывается с контентом, не белое"
        ],
        expect: "Любое расхождение — верните opencode к шагу, где проблема, с точным описанием того, что видите",
        note: "После этого шага миграция завершена — остаётся украшение: иконка"
      }
    ]
  },
  {
    id: 6,
    icon: "🎨",
    newContext: true,
    tag: "ОПЦИОНАЛЬНО",
    tagClass: "tag-amber",
    title: "Своя иконка: logo.svg → build/icon.ico",
    subtitle: "Убираем «стандартный Electron» из панели задач и с ярлыка",
    description:
      "Без иконки electron-builder тихо поставит стандартную — приложение будет выглядеть шаблонно. У вас есть logo.svg или квадратный logo.png? Тогда одним промптом: opencode сгенерирует build/icon.ico 256×256 (виндовс-формат с несколькими размерами внутри) из вашего лого, пропишет путь в секцию win конфига electron-builder и пересоберёт установщик. Иконка появится на ярлыке, в панели задач и в alt-tab.",
    steps: [
      {
        label: "Подготовить исходник",
        description:
          "Положите в корень проекта logo.svg (вектор — лучший вариант, масштабируется без потерь) или квадратный logo.png не меньше 256×256. Прямоугольные иконки обрежутся некрасиво — заранее выровняйте.",
        note: "Нет лого? Пропустите шаг — установщик соберётся со стандартной иконкой Electron"
      },
      {
        label: "Отправить промпт иконки",
        description: "Скопируйте промпт и отправьте в opencode:",
        prompt: PROMPT_ICON,
        note: "Проверка: появился build/icon.ico; в секции win в package.json — строка icon; новый .exe в release/ показывает вашу иконку в проводнике"
      }
    ]
  }
];

/* ---------- термины для презентации (полный набор по темам) ---------- */

var TERM_GROUPS = [
  {
    title: "Термины · Инструменты",
    items: [
      { term: "React", def: "JavaScript-библиотека для построения интерфейсов. Приложение собирается из компонентов — переиспользуемых блоков (кнопка, карточка, форма), которые React рисует на странице и обновляет при изменении данных." },
      { term: "Electron", def: "Фреймворк, который заворачивает веб-приложение в настольную программу: внутри — Chromium (рисует интерфейс) и Node.js (доступ к системе). Так сделаны VS Code, Telegram Desktop, Slack, Discord, Figma-десктоп." },
      { term: "Vite", def: "Современный сборщик проектов («вите», от франц. vite — быстро). Запускает dev-сервер с мгновенной перезагрузкой и собирает production-версию. Пришёл на смену Create React App." },
      { term: "Create React App (CRA) / react-scripts", def: "Старый официальный набор скриптов для сборки React. Если в package.json есть react-scripts — проект собран на CRA. Команда React перевела его в статус deprecated (устарел, не развивается), поэтому новые проекты начинают на Vite — отсюда миграция." },
      { term: "electron-builder", def: "Инструмент упаковки: берёт готовую сборку (dist/) плюс Electron и заворачивает в установщик под вашу ОС — .exe (Windows), .dmg (macOS), .AppImage (Linux). Именно он настраивается через секцию build в package.json." },
      { term: "NSIS", def: "Nullsoft Scriptable Install System — классический Windows-установщик: мастер с кнопкой «Далее», выбор папки установки, ярлыки на рабочем столе и в меню «Пуск». Опции: oneClick (один клик — без мастера), allowToChangeInstallationDirectory (выбор папки), createDesktopShortcut (ярлык на рабочем столе)." },
      { term: "Node.js", def: "Среда выполнения JavaScript вне браузера. Нужна для npm и для Electron: «внутренняя», системная половина Electron-приложения работает именно на Node.js." },
      { term: "npm", def: "Пакетный менеджер Node.js. Устанавливает библиотеки (npm install electron, короче npm i) и запускает команды из package.json (npm run dev, npm run dist)." },
      { term: "opencode", def: "ИИ-агент, работающий прямо в терминале вашего проекта: читает файлы, пишет код, выполняет команды и отчитывается. В этой инструкции все шаги — готовые промпты для него." }
    ]
  },
  {
    title: "Термины · Сборка и запуск",
    items: [
      { term: "Сборщик (bundler)", def: "Инструмент, который превращает исходники проекта (десятки .js/.jsx/.css-файлов) в файлы, понятные браузеру: склеивает, сжимает (минифицирует), раскладывает по папке. Vite и react-scripts — сборщики." },
      { term: "dev-сервер", def: "Локальный сервер разработки (npm run dev). Vite поднимает его на http://localhost:5173 — по этому адресу приложение доступно во время работы над кодом, и правки подхватываются без пересборки." },
      { term: "Production-сборка", def: "Окончательная версия для распространения (npm run build): файлы минифицируются, оптимизируются и складываются в dist/. Именно она пакуется в Electron, а не dev-сервер." },
      { term: "dist/", def: "Папка, куда Vite складывает production-сборку: index.html, .js, .css, картинки. Electron в «боевом» режиме загружает файл именно из неё: dist/index.html." },
      { term: "release/", def: "Папка, в которую electron-builder кладёт готовый установщик: Setup .exe, вспомогательные файлы. Появляется после команды npm run dist." },
      { term: "base: \"./\"", def: "Настройка Vite, при которой пути в собранном index.html становятся относительными (./assets/...), а не абсолютными (/assets/...). Критично для Electron: окно открывает файл с диска, и абсолютные пути ломаются — это первая причина «белого окна»." },
      { term: "Точка входа (entrypoint)", def: "Файл, с которого стартует выполнение. В веб-части React это src/main.jsx (или index.tsx/index.jsx в CRA — при миграции его нужно переименовать). У Electron своя точка входа — она задаётся полем main в package.json." },
      { term: "Белое (пустое) окно", def: "Типовая проблема: окно Electron открылось, а внутри ничего. Почти всегда — не задан base \"./\" в vite.config.js, либо main указывает не туда, либо окно загрузилось раньше dev-сервера." },
      { term: "localhost и порт", def: "localhost — адрес вашей же машины (не интернет). Порт — «номер калитки» на ней: localhost:5173 — калитка №5173, за которой сидит dev-сервер Vite. Именно этот номер ждёт wait-on и именно его передаёт Electron." }
    ]
  },
  {
    title: "Термины · Внутри Electron",
    items: [
      { term: "Main-процесс (главный)", def: "«Бэкенд» Electron-приложения: запускается первым, управляет окнами, жизнью программы, системными вызовами. Живёт в файле electron/main.cjs — его вы создаёте на шаге 3." },
      { term: "Renderer-процесс (отрисовщик)", def: "«Фронтенд»: экземпляр Chromium внутри окна, где крутится ваш React-код. Одно приложение может открывать несколько окон, и в каждом — свой renderer. Main создаёт окно и стартует renderer." },
      { term: "BrowserWindow", def: "Класс Electron для создания окна: задаются размеры (1280×800), минимумы (minWidth 960, minHeight 640), заголовок, иконка. Потом в окно загружается содержимое." },
      { term: "loadURL / loadFile", def: "Два способа загрузить интерфейс в окно. loadURL — по адресу (в разработке: VITE_DEV_SERVER_URL, то есть с dev-сервера). loadFile — с диска, по пути dist/index.html (в собранном .exe). В main.cjs стоит проверка: если переменная задана — loadURL, иначе loadFile." },
      { term: "VITE_DEV_SERVER_URL", def: "Переменная окружения — «метка», которая говорит Electron: «мы в разработке, бери интерфейс с dev-сервера». Задаётся в скрипте electron:dev через cross-env. В собранном .exe её нет — поэтому срабатывает ветка loadFile." },
      { term: "app.whenReady() / window-all-closed", def: "app.whenReady().then(createWindow) — «когда Electron полностью запустится — создай окно». app.on('window-all-closed', () => app.quit()) — «все окна закрыты — заверши процесс». Вместе это каркас жизни любого простого Electron-приложения." },
      { term: ".cjs и CommonJS", def: "Старый формат модулей Node: require() и module.exports; .cjs — расширение файла, чтобы Node точно понял формат. Electron читает main-файл именно в этом стиле, поэтому файл называется main.cjs, а не main.js (для формата ES-модулей расширение .mjs)." }
    ]
  },
  {
    title: "Термины · package.json и команды",
    items: [
      { term: "package.json", def: "Паспорт проекта: имя (name), версия (version), главный файл (main), зависимости (dependencies, devDependencies) и команды (scripts). Все шаги этой инструкции меняют именно его." },
      { term: "scripts", def: "Блок команд внутри package.json. Рабочий набор после миграции: dev (vite), build (vite build), preview (vite preview), electron:dev, electron:start, dist. Запуск: npm run и имя команды, например npm run dist." },
      { term: "dependencies / devDependencies", def: "Два списка пакетов. dependencies — то, что работает «в бою» (react, react-dom). devDependencies — инструменты разработчика (vite, electron, electron-builder, concurrently, wait-on, cross-env). Не попадают в готовое приложение, но нужны при сборке." },
      { term: "npm run", def: "Запуск команды из scripts: npm run build выполнит команду «build». Прямой аналог без ключа run работает только для зарезервированных имён (npm start, npm test)." },
      { term: "concurrently", def: "Пакет, запускающий несколько терминальных команд одновременно. В electron:dev он стартует vite и Electron параллельно; флаг -k («kill») гасит обе, если одна упала." },
      { term: "wait-on", def: "Пакет-«ждун»: не пускает следующую команду, пока не выполнится условие. В electron:dev ждёт tcp:5173 — открывается ли порт dev-сервера. Без него Electron стартует раньше Vite и показывает пустое окно." },
      { term: "cross-env", def: "Пакет, задающий переменные окружения одинаково на Windows, macOS и Linux. Запись VITE_DEV_SERVER_URL=http://localhost:5173 без cross-env не сработает на Windows — синтаксис переменных там другой." },
      { term: "appId", def: "Уникальный идентификатор приложения для операционной системы (например com.mycompany.myapp). Windows различает программы по нему: при обновлении appId совпадает — система считает это апдейтом одной программы, а не установкой новой." },
      { term: "productName", def: "Человеческое имя приложения: так его видит установщик, меню «Пуск» и ярлык. Обычно совпадает с полем name из package.json." }
    ]
  },
  {
    title: "Термины · Файлы и форматы",
    items: [
      { term: ".exe", def: "Исполняемый файл Windows. В нашей цепочке их два вида: Setup-установщик (то, что вы раздаёте пользователям) и запакованное приложение внутри установленной папки." },
      { term: ".ico", def: "Виндовс-формат иконок: один файл содержит несколько размеров (16, 32, 48, 256 px) — ОС сама выберет нужный для ярлыка, окна или панели задач. Генерируется из SVG либо PNG (build/icon.ico)." },
      { term: "SVG", def: "Векторный формат изображений: описывает фигуры формулами, поэтому масштабируется без потери качества. Идеальный исходник для иконки приложения." },
      { term: "PNG", def: "Растровый формат: картинка из пикселей фиксированного размера. Тоже годится как исходник иконки, но должен быть квадратным и не меньше 256×256." }
    ]
  }
];

/* ---------- слайды презентации ---------- */

var SLIDES = [
  {
    tag: "СТАРТ",
    tagClass: "tag-violet",
    title: "React → Electron: сборка .exe",
    subtitle: "Презентация к пошаговой инструкции — всю работу выполняет opencode",
    blocks: [
      { t: "lead", text: "Из React-приложения, живущего в браузере, делаем настольную программу для Windows: окно Electron, production-сборка Vite и NSIS-установщик. Шесть шагов — шесть готовых промптов, каждый со своей проверкой результата." },
      { t: "chips", items: ["1 · Ревизия", "2 · Vite", "3 · Electron", "4 · NSIS", "5 · Проверка", "6 · Иконка"] },
      { t: "note", text: "Каждый шаг — отдельный контекст opencode: новая вкладка → скопировали промпт → вставили → проверили результат. Термины разобраны отдельными слайдами в конце презентации." }
    ]
  },
  {
    tag: "МАРШРУТ",
    tagClass: "tag-indigo",
    title: "Маршрут миграции за 6 шагов",
    subtitle: "Что происходит на каждом этапе и что получается на выходе",
    blocks: [
      { t: "bullets", items: [
        "Шаг 1 · Ревизия — opencode читает package.json и докладывает: сборщик, скрипты, имя/версия, где index.html. Ничего не меняет",
        "Шаг 2 · Vite — миграция с CRA: vite + plugin-react, index.html в корень, script type=\"module\", новые скрипты, удаление react-scripts",
        "Шаг 3 · Electron — electron/main.cjs с BrowserWindow 1280×800, скрипты electron:dev / electron:start, base \"./\"",
        "Шаг 4 · NSIS — секция build в package.json и команда npm run dist → Setup .exe в папке release/",
        "Шаг 5 · Проверка — три команды по кругу и отчёт «что проверено — что исправлено»",
        "Шаг 6 · Иконка (опционально) — logo.svg → build/icon.ico 256×256"
      ] },
      { t: "expect", text: "Папка release/ с установочным .exe и установленное приложение, которое открывается с контентом" }
    ]
  },
  {
    tag: "ТЕМА 1 · ПРОМПТ 0",
    tagClass: "tag-violet",
    title: "Ревизия проекта",
    subtitle: "Разведка перед миграцией: узнаём, что у вас на руках",
    blocks: [
      { t: "lead", text: "Прежде чем менять что-то, смотрим, что есть. opencode читает package.json — «паспорт» проекта — и докладывает четыре факта, ни-че-го не меняя." },
      { t: "bullets", items: [
        "Какой стоит сборщик: Vite или react-scripts/CRA",
        "Какие объявлены команды (scripts)",
        "Имя и версия приложения (name, version)",
        "Где физически лежит index.html"
      ] },
      { t: "prompt", text: PROMPT_0 },
      { t: "note", text: "Проверка: короткий доклад без единого изменения файлов. Если сборщик — Vite, следующий шаг пропускаем." }
    ]
  },
  {
    tag: "ТЕМА 2 · ПРОМПТ 1",
    tagClass: "tag-indigo",
    title: "Перевод на Vite",
    subtitle: "Новый фундамент сборки — быстро, современно, без react-scripts",
    blocks: [
      { t: "lead", text: "Create React App устарел (deprecated) и больше не поддерживается — официальный путь сегодня Vite: мгновенный dev-сервер и быстрая production-сборка." },
      { t: "bullets", items: [
        "Ставит vite и @vitejs/plugin-react в devDependencies",
        "Создаёт vite.config.js с плагином react",
        "Переносит index.html в корень, тег script → type=\"module\" src=\"/src/main.jsx\"",
        "Обновляет скрипты: dev / build / preview",
        "Удаляет react-scripts и конфиги CRA; чинит process.env.REACT_APP_* и импорты svg под Vite"
      ] },
      { t: "prompt", text: PROMPT_1 },
      { t: "prompt", label: "промпт — если проект уже на Vite", text: PROMPT_1_ALREADY_VITE },
      { t: "note", text: "Проверка: npm run dev открывает приложение на localhost:5173, npm run build создаёт dist/ без ошибок." }
    ]
  },
  {
    tag: "ТЕМА 3 · ПРОМПТ 2",
    tagClass: "tag-blue",
    title: "Electron-обёртка",
    subtitle: "React в настольном окне: main-процесс и двойная загрузка",
    blocks: [
      { t: "lead", text: "Приложение получает настольную обёртку: окно Electron грузит ваш React — в разработке с dev-сервера, в сборке с диска." },
      { t: "bullets", items: [
        "devDependencies: electron, concurrently, wait-on, cross-env",
        "electron/main.cjs — главный процесс: BrowserWindow 1280×800, min 960×640, заголовок из поля name",
        "Двойная загрузка: есть VITE_DEV_SERVER_URL → loadURL (dev-сервер), нет → loadFile из dist/index.html",
        "В package.json: поле \"main\" и скрипты electron:dev / electron:start",
        "В vite.config.js: base \"./\" — относительные пути, иначе в окне будет пусто"
      ] },
      { t: "prompt", text: PROMPT_2 },
      { t: "note", text: "Проверка: npm run electron:dev открывает окно с работающим приложением; wait-on держит паузу, пока не поднимется порт 5173." }
    ]
  },
  {
    tag: "ТЕМА 4 · ПРОМПТ 3",
    tagClass: "tag-sky",
    title: "NSIS-установщик",
    subtitle: "Из папки с кодом — в Setup .exe для Windows",
    blocks: [
      { t: "lead", text: "electron-builder пакует dist и electron-обёртку в классический Windows-установщик с мастером «Далее → Далее → Готово»." },
      { t: "bullets", items: [
        "appId — уникальный ID (com.company.app), productName — имя в системе",
        "directories.output → release: сюда упадёт готовый Setup .exe",
        "files: dist/**/* и electron/**/* — что именно пакуем",
        "win.target nsis + опции: oneClick false, выбор папки установки, ярлык на рабочем столе",
        "Скрипт dist: npm run build && electron-builder --win"
      ] },
      { t: "prompt", text: PROMPT_3 },
      { t: "note", text: "Проверка: в release/ появился установочный .exe; установка проходит, приложение запускается с контентом. Белое окно — вернитесь к base \"./\"." }
    ]
  },
  {
    tag: "ТЕМА 5 · ПРОМПТ 4",
    tagClass: "tag-green",
    title: "Финальная проверка",
    subtitle: "Три команды, роутер и отчёт «что проверено — что исправлено»",
    blocks: [
      { t: "lead", text: "Финальный контроль всей миграции: opencode прогоняет все команды по очереди, проверяет навигацию и отчитывается списком." },
      { t: "checks", items: [
        { t: "npm run dev", d: "dev-сервер поднялся, страница в браузере работает" },
        { t: "npm run electron:dev", d: "десктоп-окно открылось, навигация внутри не ломается" },
        { t: "npm run dist", d: "NSIS-установщик собирается без ошибок" },
        { t: "Установка", d: "после установки приложение грузит контент, не белое окно" }
      ] },
      { t: "prompt", text: PROMPT_4 },
      { t: "note", text: "Расхождение доклада с реальностью? Возвращайте opencode на нужный шаг с точным описанием того, что видите." }
    ]
  },
  {
    tag: "ТЕМА 6 · ОПЦИЯ",
    tagClass: "tag-amber",
    title: "Своя иконка",
    subtitle: "logo.svg → build/icon.ico: убираем стандартный Electron",
    blocks: [
      { t: "lead", text: "Без иконки electron-builder тихо поставит стандартную. Есть лого — делаем фирменный .exe одним промптом." },
      { t: "bullets", items: [
        "Исходник: logo.svg (идеально) или квадратный PNG ≥ 256×256",
        "Генерация build/icon.ico 256×256 — через electron-icon-builder или sharp",
        "Путь в конфиге: \"win\": { \"icon\": \"build/icon.ico\" }",
        "Пересборка npm run dist — иконка на ярлыке, в панели задач и в alt-tab"
      ] },
      { t: "prompt", text: PROMPT_ICON },
      { t: "note", text: "Нет лого? Шаг можно пропустить — установщик соберётся со стандартной иконкой Electron." }
    ]
  },
  {
    tag: "ТЕРМИНЫ 1/5",
    tagClass: "tag-violet",
    title: TERM_GROUPS[0].title,
    subtitle: "Кто есть кто в этой инструкции",
    blocks: [ { t: "terms", items: TERM_GROUPS[0].items } ]
  },
  {
    tag: "ТЕРМИНЫ 2/5",
    tagClass: "tag-indigo",
    title: TERM_GROUPS[1].title,
    subtitle: "Сборщик, dev-сервер, сборка и папки",
    blocks: [ { t: "terms", items: TERM_GROUPS[1].items } ]
  },
  {
    tag: "ТЕРМИНЫ 3/5",
    tagClass: "tag-blue",
    title: TERM_GROUPS[2].title,
    subtitle: "Главный процесс, окно и загрузка интерфейса",
    blocks: [ { t: "terms", items: TERM_GROUPS[2].items } ]
  },
  {
    tag: "ТЕРМИНЫ 4/5",
    tagClass: "tag-sky",
    title: TERM_GROUPS[3].title,
    subtitle: "Паспорт проекта и npm-команды",
    blocks: [ { t: "terms", items: TERM_GROUPS[3].items } ]
  },
  {
    tag: "ТЕРМИНЫ 5/5",
    tagClass: "tag-amber",
    title: TERM_GROUPS[4].title,
    subtitle: "Форматы, с которыми вы столкнётесь",
    blocks: [ { t: "terms", items: TERM_GROUPS[4].items } ]
  },
  {
    tag: "ИТОГ",
    tagClass: "tag-violet",
    title: "Итог: что у вас в руках",
    subtitle: "И что делать дальше",
    blocks: [
      { t: "checks", items: [
        { t: "Проект на Vite", d: "dev-сервер и сборка в dist/ работают" },
        { t: "Окно Electron", d: "main.cjs + два режима загрузки: dev-сервер и dist" },
        { t: "NSIS-установщик", d: "npm run dist → release/Setup .exe" },
        { t: "Иконка", d: "фирменная, роутер работает, проверки зелёные" }
      ] },
      { t: "lead", text: "Что дальше: обновляете код → поднимаете версию в package.json → npm run dist → свежий .exe готов к раздаче пользователям." },
      { t: "note", text: "Вернуться к рабочим промптам — кнопка «Лекция» в шапке. Успехов!" }
    ]
  }
];

/* ---------- состояние ---------- */
var LS_PREFIX = "electron-guide-";
var completed = loadJson(LS_PREFIX + "completed", []);
var subChecked = loadJson(LS_PREFIX + "subchecked", {});
var completedSet = {};
completed.forEach(function (id) { completedSet[id] = true; });
var glossaryOpen = true;

function loadJson(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) { return fallback; }
}
function save() {
  try {
    localStorage.setItem(LS_PREFIX + "completed", JSON.stringify(Object.keys(completedSet).map(Number)));
    localStorage.setItem(LS_PREFIX + "subchecked", JSON.stringify(subChecked));
  } catch (e) {}
}

/* ---------- svg ---------- */
function svgCheck(cls) {
  return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}
function svgExternal(cls) {
  return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
}
function svgCopy(cls) {
  return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&" + "amp;").replace(/</g, "&" + "lt;").replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

/* ---------- копирование ---------- */
function copyText(text, btn) {
  function done() {
    if (!btn) return;
    var original = btn.innerHTML;
    btn.innerHTML = svgCheck("") + "<span>скопировано</span>";
    btn.classList.add("copy-ok");
    setTimeout(function () { btn.innerHTML = original; btn.classList.remove("copy-ok"); }, 2000);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
  } else { fallbackCopy(text); done(); }
}
function fallbackCopy(text) {
  var ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

/* ---------- helpers ---------- */
function pad(n) { return String(n).padStart(2, "0"); }
function stepsWord(n) {
  var m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "шаг";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "шага";
  return "шагов";
}

/* ---------- прогресс ---------- */
function renderProgress() {
  var total = STEPS.length;
  var doneCount = Object.keys(completedSet).length;
  var pct = Math.round((doneCount / total) * 100);
  document.getElementById("progressCount").textContent = doneCount + "/" + total + " " + stepsWord(total);
  var fill = document.getElementById("progressFill");
  fill.style.width = pct + "%";
  if (pct === 100) fill.classList.add("full"); else fill.classList.remove("full");
  var hint = document.getElementById("progressHint");
  if (pct === 0) { hint.textContent = ""; }
  else if (pct === 100) { hint.textContent = "🎉 Всё готово! Приложение собрано и раздаётся."; }
  else { hint.textContent = pct + "% завершено — продолжайте!"; }
  document.getElementById("footerCount").textContent = doneCount + " из " + total + " выполнено";
}

/* ---------- chips ---------- */
function renderChips() {
  var box = document.getElementById("chips");
  box.innerHTML = STEPS.map(function (s) {
    var done = !!completedSet[s.id];
    return '<div class="chip' + (done ? " done" : "") + '">' +
      (done ? svgCheck("") : "<span>" + s.icon + "</span>") +
      "<span>" + esc(s.title) + "</span></div>";
  }).join("");
}

/* ---------- словарь ---------- */
function renderGlossary() {
  var body = document.getElementById("glossaryBody");
  var html = "";
  GLOSSARY.forEach(function (g) {
    html += '<div class="glossary-group"><p class="glossary-group-title">' + esc(g.group) + '</p>';
    g.items.forEach(function (item) {
      html += '<div class="glossary-item"><p class="glossary-term">' + esc(item.term) + '</p>' +
        '<p class="glossary-def">' + item.def + '</p></div>';
    });
    html += '</div>';
  });
  body.innerHTML = html;
}

function setGlossary(open) {
  glossaryOpen = open;
  var body = document.getElementById("glossaryBody");
  var btn = document.getElementById("glossaryToggle");
  if (open) {
    body.classList.add("open");
    btn.classList.add("is-open");
    btn.textContent = "Свернуть словарь";
  } else {
    body.classList.remove("open");
    btn.classList.remove("is-open");
    btn.textContent = "Показать словарь";
  }
  try { localStorage.setItem(LS_PREFIX + "glossary", open ? "1" : "0"); } catch (e) {}
}

/* ---------- substeps ---------- */
function substepHtml(stepId, sub, idx) {
  var key = stepId + "-" + idx;
  var checked = !!subChecked[key];
  var html = '<div class="substep' + (checked ? " checked" : "") + '" data-sub="' + key + '">';
  html += '<div class="checkbox">' + (checked ? svgCheck("") : "") + "</div>";
  html += '<div class="substep-body"><span class="substep-num">' + pad(idx + 1) + "</span>";
  html += '<div class="substep-content">';
  html += '<p class="substep-title">' + esc(sub.label) + "</p>";
  if (!checked) {
    if (sub.description) html += '<p class="substep-text">' + esc(sub.description) + "</p>";
    if (sub.code) {
      html += '<div class="code-block"><button class="code-copy" data-copy="' + esc(sub.code).replace(/"/g, "&" + "quot;") + '" data-stop="1">' + svgCopy("") + "<span>копировать</span></button>" +
        "<pre><code>" + esc(sub.code) + "</code></pre></div>";
    }
    if (sub.prompt) {
      html += '<div class="prompt-block"><div class="prompt-head"><span class="prompt-head-label"><span>✦</span> промпт для opencode</span>' +
        '<button class="copy-btn" data-copy="' + esc(sub.prompt).replace(/"/g, "&" + "quot;") + '" data-stop="1">' + svgCopy("") + "<span>копировать</span></button></div>" +
        '<pre class="prompt-text">' + esc(sub.prompt) + "</pre></div>";
    }
    if (sub.bulletIntro) html += '<p class="substep-text" style="margin-top:8px">' + esc(sub.bulletIntro) + "</p>";
    if (sub.bullets) {
      html += '<ul class="bullets">' + sub.bullets.map(function (b) {
        return '<li><i>✦</i><span>' + esc(b) + "</span></li>";
      }).join("") + "</ul>";
    }
    if (sub.expect) {
      html += '<div class="expect-line"><b>Ожидаемый результат:</b><span>' + esc(sub.expect) + "</span></div>";
    }
    if (sub.note) html += '<p class="note"><b>→</b><span>' + esc(sub.note) + "</span></p>";
  }
  html += "</div></div></div>";
  return html;
}

/* ---------- cards ---------- */
function renderCards() {
  var box = document.getElementById("steps");
  box.innerHTML = STEPS.map(function (step, i) {
    var done = !!completedSet[step.id];
    var html = '<article class="step-card animate-fade-up' + (done ? " completed-card" : "") + '" style="animation-delay:' + (i * 120) + 'ms">';
    html += '<div class="step-head"><div class="step-head-left">';
    html += '<div class="step-icon">' + (done ? '<span class="animate-check-pop">' + svgCheck("") + "</span>" : step.icon) + "</div>";
    html += "<div>";
    html += '<div class="step-meta"><span class="tag ' + step.tagClass + '">' + esc(step.tag) + "</span>" +
      '<span class="step-num">' + pad(i + 1) + " / " + pad(STEPS.length) + "</span></div>";
    html += "<h2>" + esc(step.title) + "</h2>";
    html += '<p class="step-sub">' + esc(step.subtitle) + "</p>";
    html += "</div></div>";
    if (step.url) {
      html += '<a class="site-link" href="' + esc(step.url) + '" target="_blank" rel="noopener noreferrer">' + svgExternal("") + "<span>сайт</span></a>";
    }
    html += "</div>";
    if (step.newContext) {
      html += '<div class="context-banner"><span>🗂️</span><p style="margin:0"><b>Каждый шаг — отдельный контекст.</b> Перед тем как вставлять промпт, создайте новую вкладку (сессию) в opencode — не продолжайте в старом чате: свежий контекст работает лучше.</p></div>';
    }
    html += '<p class="step-desc">' + esc(step.description) + "</p>";
    html += '<div class="substeps">' + step.steps.map(function (s, j) { return substepHtml(step.id, s, j); }).join("") + "</div>";
    html += '<div class="done-row">';
    html += done
      ? '<div class="done-label animate-slide-right">' + svgCheck("") + "Выполнено</div>"
      : "<div></div>";
    html += '<button class="done-btn' + (done ? " is-done" : "") + '" data-done="' + step.id + '">' +
      (done ? svgCheck("") + "Готово — отменить?" : "Отметить как сделано ✓") + "</button>";
    html += "</div></article>";
    return html;
  }).join("");

  var allDone = Object.keys(completedSet).length === STEPS.length;
  document.getElementById("finalBanner").style.display = allDone ? "block" : "none";
}

function renderAll() { renderProgress(); renderChips(); renderCards(); }

/* ---------- презентация ---------- */
var presentationMode = false;
var slideIdx = 0;

function renderTopbarMode() {
  var label = document.getElementById("modeLabel");
  var count = document.getElementById("progressCount");
  var fill = document.getElementById("progressFill");
  if (presentationMode) {
    label.textContent = "Прогресс презентации";
    count.textContent = "Слайд " + (slideIdx + 1) + "/" + SLIDES.length;
    var pct = Math.round(((slideIdx + 1) / SLIDES.length) * 100);
    fill.style.width = pct + "%";
    if (pct === 100) fill.classList.add("full"); else fill.classList.remove("full");
    document.getElementById("progressHint").textContent = "";
  } else {
    label.textContent = "Прогресс лекции";
    renderProgress();
  }
}

function blockHtml(b) {
  if (b.t === "lead") return '<p class="slide-lead">' + esc(b.text) + "</p>";
  if (b.t === "chips") return '<div class="chain">' + b.items.map(function (c) { return '<span class="chip">' + esc(c) + "</span>"; }).join("") + "</div>";
  if (b.t === "bullets") return (b.intro ? '<p class="substep-text" style="margin-top:10px">' + esc(b.intro) + "</p>" : "") +
    '<ul class="bullets" style="margin-top:6px">' + b.items.map(function (x) { return '<li><i>✦</i><span>' + esc(x) + "</span></li>"; }).join("") + "</ul>";
  if (b.t === "prompt") return '<div class="prompt-block"><div class="prompt-head"><span class="prompt-head-label"><span>✦</span> ' + esc(b.label || "промпт для opencode") + "</span>" +
    '<button class="copy-btn" data-copy="' + esc(b.text).replace(/"/g, "&" + "quot;") + '" data-stop="1">' + svgCopy("") + "<span>копировать</span></button></div>" +
    '<pre class="prompt-text">' + esc(b.text) + "</pre></div>";
  if (b.t === "terms") return '<div class="term-grid">' + b.items.map(function (it) {
    return '<div class="k-term"><h4>' + esc(it.term) + "</h4><p>" + it.def + "</p></div>";
  }).join("") + "</div>";
  if (b.t === "checks") return '<div class="check-grid">' + b.items.map(function (c) {
    return '<div class="check-item"><b>' + esc(c.t) + "</b>" + esc(c.d) + "</div>";
  }).join("") + "</div>";
  if (b.t === "expect") return '<div class="expect-line"><b>Ожидаемый результат:</b><span>' + esc(b.text) + "</span></div>";
  if (b.t === "note") return '<p class="note" style="margin-top:10px"><b>→</b><span>' + esc(b.text) + "</span></p>";
  return "";
}

function renderPresentation() {
  var s = SLIDES[slideIdx];
  var html = '<article class="slide-card">';
  html += '<div class="slide-meta"><span class="tag ' + s.tagClass + '">' + esc(s.tag) + "</span>" +
    '<span class="step-num">' + pad(slideIdx + 1) + " / " + pad(SLIDES.length) + "</span></div>";
  html += "<h2>" + esc(s.title) + "</h2>";
  html += '<p class="step-sub">' + esc(s.subtitle) + "</p>";
  html += '<div class="slide-body">' + s.blocks.map(blockHtml).join("") + "</div>";
  html += "</article>";
  document.getElementById("slideStage").innerHTML = html;

  var dots = "";
  for (var i = 0; i < SLIDES.length; i++) {
    dots += '<button class="dot-nav' + (i === slideIdx ? " active" : "") + '" data-slide="' + i + '" data-stop="1" type="button" aria-label="Слайд ' + (i + 1) + '"></button>';
  }
  document.getElementById("slideDots").innerHTML = dots;
  document.getElementById("slidePrev").disabled = slideIdx === 0;
  document.getElementById("slideNext").disabled = slideIdx === SLIDES.length - 1;
  renderTopbarMode();
  try { localStorage.setItem(LS_PREFIX + "slide", String(slideIdx)); } catch (e) {}
}

function goSlide(delta) {
  var next = slideIdx + delta;
  if (next < 0 || next >= SLIDES.length) return;
  slideIdx = next;
  renderPresentation();
}

function setMode(pres) {
  presentationMode = pres;
  document.body.classList.toggle("presentation-mode", pres);
  document.getElementById("presentation").style.display = pres ? "block" : "none";
  var btn = document.getElementById("modeToggle");
  btn.textContent = pres ? "📖 Лекция" : "🎬 Презентация";
  btn.classList.toggle("active", pres);
  if (pres) renderPresentation(); else renderProgress();
  try { localStorage.setItem(LS_PREFIX + "mode", pres ? "1" : "0"); } catch (e) {}
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- события (делегирование) ---------- */
document.addEventListener("click", function (e) {
  var stop = e.target.closest("[data-stop]");
  if (stop) e.stopPropagation();

  var copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    e.stopPropagation();
    copyText(copyBtn.getAttribute("data-copy"), copyBtn);
    return;
  }
  var doneBtn = e.target.closest("[data-done]");
  if (doneBtn) {
    var id = Number(doneBtn.getAttribute("data-done"));
    if (completedSet[id]) { delete completedSet[id]; }
    else {
      completedSet[id] = true;
      var card = doneBtn.closest(".step-card");
      if (card) burst(card);
    }
    save(); renderAll();
    return;
  }
  var dot = e.target.closest("[data-slide]");
  if (dot) {
    e.stopPropagation();
    slideIdx = Number(dot.getAttribute("data-slide"));
    renderPresentation();
    return;
  }
  var sub = e.target.closest("[data-sub]");
  if (sub) {
    var key = sub.getAttribute("data-sub");
    if (e.target.closest("a,button")) return;
    subChecked[key] = !subChecked[key];
    save(); renderAll();
  }
});

document.getElementById("glossaryToggle").addEventListener("click", function () {
  setGlossary(!glossaryOpen);
});

document.getElementById("modeToggle").addEventListener("click", function () {
  setMode(!presentationMode);
});
document.getElementById("slidePrev").addEventListener("click", function () { goSlide(-1); });
document.getElementById("slideNext").addEventListener("click", function () { goSlide(1); });

document.addEventListener("keydown", function (e) {
  if (!presentationMode) return;
  if (e.key === "ArrowRight" || e.key === "PageDown") { goSlide(1); }
  else if (e.key === "ArrowLeft" || e.key === "PageUp") { goSlide(-1); }
  else if (e.key === "Home") { slideIdx = 0; renderPresentation(); }
  else if (e.key === "End") { slideIdx = SLIDES.length - 1; renderPresentation(); }
});

function burst(card) {
  var colors = ["#4f46e5", "#16a34a", "#f59e0b", "#ec4899", "#06b6d4"];
  var wrap = document.createElement("div");
  wrap.className = "confetti-wrap";
  for (var i = 0; i < 18; i++) {
    var c = document.createElement("div");
    c.className = "confetti";
    c.style.left = (10 + (i * 5) % 80) + "%";
    c.style.backgroundColor = colors[i % colors.length];
    c.style.animationDelay = (i * 60) + "ms";
    c.style.transform = "rotate(" + (i * 20) + "deg)";
    wrap.appendChild(c);
  }
  card.appendChild(wrap);
  setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 1600);
}

document.getElementById("resetBtn").addEventListener("click", function () {
  completedSet = {}; subChecked = {}; save(); renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- init ---------- */
renderGlossary();
var savedGlossary = loadJson(LS_PREFIX + "glossary", "1");
setGlossary(savedGlossary !== "0");
renderAll();

var savedSlide = 0;
try { savedSlide = Number(localStorage.getItem(LS_PREFIX + "slide")) || 0; } catch (e) {}
if (savedSlide >= 0 && savedSlide < SLIDES.length) slideIdx = savedSlide;

var savedMode = "0";
try { savedMode = localStorage.getItem(LS_PREFIX + "mode") || "0"; } catch (e) {}
if (savedMode === "1") setMode(true);
