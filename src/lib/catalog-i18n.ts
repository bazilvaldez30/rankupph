/**
 * Translations for DB/seed-driven catalog content (service titles, feature
 * bullets, option groups + values, modifiers). Keyed by stable identifiers so
 * the same English source always maps to the right translation. Falls back to
 * the original English text when a key is missing.
 */
import type { Locale } from "@/lib/i18n";

type Entry = Record<Locale, string>;

export const CATALOG: Record<string, Entry> = {
  // ── Service titles ──────────────────────────────────────────
  "svc.mmr-boosting.title": { en: "MMR Boosting", zh: "MMR 代练", es: "Boost de MMR", pt: "Boost de MMR", ru: "Буст MMR", fil: "MMR Boosting" },
  "svc.calibration.title": { en: "Calibration", zh: "定位赛", es: "Calibración", pt: "Calibração", ru: "Калибровка", fil: "Calibration" },
  "svc.ranked-wins.title": { en: "Ranked Wins", zh: "天梯胜场", es: "Victorias clasificatorias", pt: "Vitórias ranqueadas", ru: "Победы в ранкеде", fil: "Ranked Wins" },
  "svc.battle-cup.title": { en: "Battle Cup", zh: "战斗之杯", es: "Battle Cup", pt: "Battle Cup", ru: "Battle Cup", fil: "Battle Cup" },
  "svc.low-priority.title": { en: "Low Priority Removal", zh: "低优先级解除", es: "Quitar prioridad baja", pt: "Remoção de baixa prioridade", ru: "Снятие низкого приоритета", fil: "Low Priority Removal" },
  "svc.coaching.title": { en: "1-on-1 Coaching", zh: "一对一教学", es: "Coaching 1 a 1", pt: "Coaching 1 a 1", ru: "Индивидуальный коучинг", fil: "1-on-1 Coaching" },

  // ── Service descriptions ────────────────────────────────────
  "svc.mmr-boosting.desc": { en: "A verified Immortal pro climbs your account to your target rank.", zh: "经过认证的万古高手将您的账号带到目标段位。", es: "Un pro Inmortal verificado sube tu cuenta hasta tu rango objetivo.", pt: "Um profissional Immortal verificado leva sua conta ao rank-alvo.", ru: "Проверенный про-игрок Immortal поднимает ваш аккаунт до целевого ранга.", fil: "May verified na Immortal pro na magpapaakyat ng account mo sa target rank." },
  "svc.calibration.desc": { en: "Maximize your seasonal calibration with pro-played matches.", zh: "通过职业选手对局，最大化您的赛季定位结果。", es: "Maximiza tu calibración de temporada con partidas jugadas por pros.", pt: "Maximize sua calibração da temporada com partidas jogadas por pros.", ru: "Максимизируйте сезонную калибровку матчами от профи.", fil: "I-maximize ang seasonal calibration mo gamit ang pro-played na laro." },
  "svc.ranked-wins.desc": { en: "Buy a guaranteed number of ranked wins on your account.", zh: "购买账号上有保证的天梯胜场数量。", es: "Compra un número garantizado de victorias clasificatorias en tu cuenta.", pt: "Compre um número garantido de vitórias ranqueadas na sua conta.", ru: "Купите гарантированное число побед в ранкеде на свой аккаунт.", fil: "Bumili ng garantisadong bilang ng ranked wins sa account mo." },
  "svc.battle-cup.desc": { en: "Win your weekly Battle Cup bracket at any division.", zh: "在任意分组赢得您的每周战斗之杯。", es: "Gana tu Battle Cup semanal en cualquier división.", pt: "Vença seu Battle Cup semanal em qualquer divisão.", ru: "Выигрывайте еженедельный Battle Cup в любом дивизионе.", fil: "Panalo sa weekly Battle Cup bracket mo sa kahit anong division." },
  "svc.low-priority.desc": { en: "Clear your low-priority games fast and get back to ranked.", zh: "快速清除低优先级对局，重返天梯。", es: "Elimina rápido tus partidas de prioridad baja y vuelve a clasificatoria.", pt: "Limpe rápido seus jogos de baixa prioridade e volte à ranqueada.", ru: "Быстро отыграйте игры низкого приоритета и вернитесь в ранкед.", fil: "Bilisang i-clear ang low-priority games at bumalik sa ranked." },
  "svc.coaching.desc": { en: "Personalized sessions with Immortal coaches to climb on your own.", zh: "与万古教练进行个性化课程，靠自己上分。", es: "Sesiones personalizadas con coaches Inmortales para subir por ti mismo.", pt: "Sessões personalizadas com coaches Immortal para você subir sozinho.", ru: "Индивидуальные занятия с тренерами Immortal, чтобы подниматься самому.", fil: "Personalized na sessions kasama ang Immortal coaches para umakyat ka mag-isa." },

  // ── Unit labels ─────────────────────────────────────────────
  "unit.calibration match": { en: "calibration match", zh: "场定位赛", es: "partida de calibración", pt: "partida de calibração", ru: "калибровочный матч", fil: "calibration match" },
  "unit.win": { en: "win", zh: "胜场", es: "victoria", pt: "vitória", ru: "победа", fil: "win" },
  "unit.low-priority game": { en: "low-priority game", zh: "场低优先级对局", es: "partida de prioridad baja", pt: "jogo de baixa prioridade", ru: "игра низкого приоритета", fil: "low-priority game" },
  "unit.coaching session": { en: "coaching session", zh: "节教学课程", es: "sesión de coaching", pt: "sessão de coaching", ru: "сессия коучинга", fil: "coaching session" },

  // ── Feature bullets ─────────────────────────────────────────
  "feat.Verified Immortal boosters": { en: "Verified Immortal boosters", zh: "认证万古代练", es: "Boosters Inmortales verificados", pt: "Boosters Immortal verificados", ru: "Проверенные бустеры Immortal", fil: "Verified na Immortal boosters" },
  "feat.VPN & offline-mode privacy": { en: "VPN & offline-mode privacy", zh: "VPN 与离线模式隐私保护", es: "VPN y privacidad en modo offline", pt: "VPN e privacidade em modo offline", ru: "VPN и приватность в офлайн-режиме", fil: "VPN at offline-mode privacy" },
  "feat.Live progress tracking": { en: "Live progress tracking", zh: "实时进度追踪", es: "Seguimiento de progreso en vivo", pt: "Acompanhamento de progresso ao vivo", ru: "Отслеживание прогресса в реальном времени", fil: "Live na pag-track ng progreso" },
  "feat.Solo or Duo mode": { en: "Solo or Duo mode", zh: "单人或双人模式", es: "Modo Solo o Dúo", pt: "Modo Solo ou Dupla", ru: "Режим Соло или Дуо", fil: "Solo o Duo mode" },
  "feat.Maximized starting MMR": { en: "Maximized starting MMR", zh: "最大化初始 MMR", es: "MMR inicial maximizado", pt: "MMR inicial maximizado", ru: "Максимальный стартовый MMR", fil: "Maximized na starting MMR" },
  "feat.Win-focused calibration": { en: "Win-focused calibration", zh: "以胜利为核心的定位", es: "Calibración enfocada en ganar", pt: "Calibração focada em vitórias", ru: "Калибровка с упором на победы", fil: "Win-focused na calibration" },
  "feat.Discreet & secure": { en: "Discreet & secure", zh: "私密且安全", es: "Discreto y seguro", pt: "Discreto e seguro", ru: "Конфиденциально и безопасно", fil: "Discreet at secure" },
  "feat.Guaranteed wins": { en: "Guaranteed wins", zh: "保证胜场", es: "Victorias garantizadas", pt: "Vitórias garantidas", ru: "Гарантированные победы", fil: "Garantisadong panalo" },
  "feat.Choose server & queue": { en: "Choose server & queue", zh: "自选服务器与队列", es: "Elige servidor y cola", pt: "Escolha servidor e fila", ru: "Выбор сервера и очереди", fil: "Pumili ng server at queue" },
  "feat.Fast turnaround": { en: "Fast turnaround", zh: "快速完成", es: "Entrega rápida", pt: "Conclusão rápida", ru: "Быстрое выполнение", fil: "Mabilis matapos" },
  "feat.Trophy guaranteed": { en: "Trophy guaranteed", zh: "保证奖杯", es: "Trofeo garantizado", pt: "Troféu garantido", ru: "Трофей гарантирован", fil: "Garantisadong trophy" },
  "feat.Any division": { en: "Any division", zh: "任意分组", es: "Cualquier división", pt: "Qualquer divisão", ru: "Любой дивизион", fil: "Kahit anong division" },
  "feat.All regions": { en: "All regions", zh: "所有地区", es: "Todas las regiones", pt: "Todas as regiões", ru: "Все регионы", fil: "Lahat ng region" },
  "feat.Fast LP clearing": { en: "Fast LP clearing", zh: "快速清除低优先级", es: "Limpieza rápida de LP", pt: "Limpeza rápida de LP", ru: "Быстрое снятие LP", fil: "Mabilis na LP clearing" },
  "feat.Standard or Express": { en: "Standard or Express", zh: "标准或加急", es: "Estándar o Exprés", pt: "Padrão ou Expresso", ru: "Стандарт или Экспресс", fil: "Standard o Express" },
  "feat.Back to ranked quickly": { en: "Back to ranked quickly", zh: "快速重返天梯", es: "Vuelve rápido a clasificatoria", pt: "Volte rápido à ranqueada", ru: "Быстрый возврат в ранкед", fil: "Mabilis bumalik sa ranked" },
  "feat.Immortal-ranked coaches": { en: "Immortal-ranked coaches", zh: "万古段位教练", es: "Coaches de rango Inmortal", pt: "Coaches de rank Immortal", ru: "Тренеры ранга Immortal", fil: "Immortal-ranked na coaches" },
  "feat.Replay analysis": { en: "Replay analysis", zh: "录像分析", es: "Análisis de repeticiones", pt: "Análise de replays", ru: "Разбор реплеев", fil: "Replay analysis" },
  "feat.Personalized climb plan": { en: "Personalized climb plan", zh: "个性化上分计划", es: "Plan de ascenso personalizado", pt: "Plano de subida personalizado", ru: "Персональный план подъёма", fil: "Personalized na climb plan" },
  "feat.Hero pool guidance": { en: "Hero pool guidance", zh: "英雄池指导", es: "Guía de pool de héroes", pt: "Orientação de pool de heróis", ru: "Помощь с пулом героев", fil: "Hero pool guidance" },

  // ── Option group labels ─────────────────────────────────────
  "grp.server": { en: "Server", zh: "服务器", es: "Servidor", pt: "Servidor", ru: "Сервер", fil: "Server" },
  "grp.queue": { en: "Queue Type", zh: "队列类型", es: "Tipo de cola", pt: "Tipo de fila", ru: "Тип очереди", fil: "Uri ng Queue" },
  "grp.skill": { en: "Estimated Skill Level", zh: "预估技术水平", es: "Nivel de habilidad estimado", pt: "Nível de habilidade estimado", ru: "Примерный уровень игры", fil: "Tantyang Skill Level" },
  "grp.tier": { en: "Tier", zh: "分组", es: "División", pt: "Divisão", ru: "Дивизион", fil: "Tier" },
  "grp.region": { en: "Region", zh: "地区", es: "Región", pt: "Região", ru: "Регион", fil: "Region" },
  "grp.completion": { en: "Completion Speed", zh: "完成速度", es: "Velocidad de entrega", pt: "Velocidade de conclusão", ru: "Скорость выполнения", fil: "Bilis ng Pagtapos" },

  // ── Option values (translated; server codes / Dota ranks kept) ──
  "opt.queue.solo": { en: "Solo Queue", zh: "单人队列", es: "Cola individual", pt: "Fila solo", ru: "Одиночная очередь", fil: "Solo Queue" },
  "opt.queue.party": { en: "Party Queue", zh: "组队队列", es: "Cola en grupo", pt: "Fila em grupo", ru: "Групповая очередь", fil: "Party Queue" },
  "opt.region.sea": { en: "Southeast Asia", zh: "东南亚", es: "Sudeste Asiático", pt: "Sudeste Asiático", ru: "Юго-Восточная Азия", fil: "Southeast Asia" },
  "opt.region.eu": { en: "Europe", zh: "欧洲", es: "Europa", pt: "Europa", ru: "Европа", fil: "Europe" },
  "opt.region.americas": { en: "Americas", zh: "美洲", es: "América", pt: "Américas", ru: "Америка", fil: "Americas" },
  "opt.region.china": { en: "China", zh: "中国", es: "China", pt: "China", ru: "Китай", fil: "China" },
  "opt.completion.standard": { en: "Standard", zh: "标准", es: "Estándar", pt: "Padrão", ru: "Стандарт", fil: "Standard" },
  "opt.completion.express": { en: "Express (faster)", zh: "加急（更快）", es: "Exprés (más rápido)", pt: "Expresso (mais rápido)", ru: "Экспресс (быстрее)", fil: "Express (mas mabilis)" },

  // ── Modifiers ───────────────────────────────────────────────
  "mod.EXPRESS.label": { en: "Express Delivery", zh: "加急交付", es: "Entrega exprés", pt: "Entrega expressa", ru: "Экспресс-доставка", fil: "Express Delivery" },
  "mod.EXPRESS.desc": { en: "Your order is prioritized and finished significantly faster.", zh: "您的订单将被优先处理，并显著更快完成。", es: "Tu pedido se prioriza y se termina mucho más rápido.", pt: "Seu pedido é priorizado e concluído muito mais rápido.", ru: "Ваш заказ в приоритете и выполняется значительно быстрее.", fil: "Inuuna ang order mo at mas mabilis matatapos." },
  "mod.PRIORITY.label": { en: "Priority Queue", zh: "优先队列", es: "Cola prioritaria", pt: "Fila prioritária", ru: "Приоритетная очередь", fil: "Priority Queue" },
  "mod.PRIORITY.desc": { en: "Jump to the front of the booster queue.", zh: "插队到代练队列的最前面。", es: "Pasa al frente de la cola de boosters.", pt: "Vá para a frente da fila de boosters.", ru: "Переход в начало очереди бустеров.", fil: "Mauna sa booster queue." },
  "mod.STREAM.label": { en: "Live Streaming", zh: "直播观战", es: "Transmisión en vivo", pt: "Transmissão ao vivo", ru: "Прямая трансляция", fil: "Live Streaming" },
  "mod.STREAM.desc": { en: "Watch a private stream of every game played.", zh: "观看每一局对局的私人直播。", es: "Mira una transmisión privada de cada partida jugada.", pt: "Assista a uma transmissão privada de cada partida.", ru: "Смотрите приватную трансляцию каждой игры.", fil: "Panoorin ang private stream ng bawat laro." },
};
