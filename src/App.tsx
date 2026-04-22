import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// ── Типы ──────────────────────────────────────────────────────────────
type IconName = string;
type Tab = "events" | "my" | "shop" | "create" | "profile";
type OnboardingStep = "welcome" | "test" | "result";

interface Question {
  q: string;
  options: string[];
  scores: number[];
}

// ── Данные теста ──────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    q: "Как долго вы играете в теннис?",
    options: ["Никогда не играл", "Меньше года", "1–3 года", "3–7 лет", "Более 7 лет"],
    scores: [0, 5, 10, 15, 20],
  },
  {
    q: "Как вы оцениваете свою подачу?",
    options: ["Не умею подавать", "Простая подача", "Стабильная подача", "Быстрая подача с вращением", "Профессиональная подача"],
    scores: [0, 5, 10, 15, 20],
  },
  {
    q: "Участвовали ли вы в турнирах?",
    options: ["Никогда", "Любительские клубные", "Региональные турниры", "Национальные соревнования", "Профессиональные турниры"],
    scores: [0, 5, 10, 15, 20],
  },
  {
    q: "Как вы работаете с сеткой?",
    options: ["Избегаю сетки", "Иногда выхожу", "Уверенно играю с лёта", "Контролирую сетку в большинстве розыгрышей", "Использую сетку как основную тактику"],
    scores: [0, 5, 10, 15, 20],
  },
  {
    q: "Как часто вы тренируетесь?",
    options: ["Не тренируюсь", "Иногда, без расписания", "1–2 раза в неделю", "3–4 раза в неделю", "Ежедневно, с тренером"],
    scores: [0, 5, 10, 15, 20],
  },
];

const LEVELS = [
  { min: 0, max: 20, label: "Начинающий", en: "Beginner", color: "#6b8f71", desc: "Вы делаете первые шаги на корте. Отличное время начать!" },
  { min: 21, max: 40, label: "Любитель", en: "Amateur", color: "#c9a84c", desc: "Вы знакомы с основами и готовы развиваться." },
  { min: 41, max: 60, label: "Полупрофессионал", en: "Semi-Pro", color: "#e8a030", desc: "Хорошая техника и понимание игры. Турниры вам по плечу." },
  { min: 61, max: 80, label: "Продвинутый", en: "Advanced", color: "#e05a30", desc: "Высокий уровень. Вы готовы к серьёзным соревнованиям." },
  { min: 81, max: 100, label: "Профессионал", en: "Professional", color: "#e8325a", desc: "Элитный уровень. Добро пожаловать в высший дивизион!" },
];

function getLevel(score: number) {
  return LEVELS.find((l) => score >= l.min && score <= l.max) || LEVELS[0];
}

// ── Лепестки сакуры ───────────────────────────────────────────────────
const petals = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + i * 11}%`,
  delay: `${i * 1.8}s`,
  duration: `${8 + i * 1.5}s`,
  size: `${0.8 + (i % 3) * 0.4}rem`,
}));

// ── Mock данные ───────────────────────────────────────────────────────
const EVENTS = [
  { id: 1, type: "tournament", title: "Весенний Кубок Сакуры", date: "12 мая 2026", location: "Москва, клуб «Восток»", level: "Любитель", spots: 4, price: "2 500 ₽", img: "🌸" },
  { id: 2, type: "sparring", title: "Спарринг-сессия", date: "25 апреля 2026", location: "Онлайн / корт на выбор", level: "Начинающий", spots: 1, price: "Бесплатно", img: "🎾" },
  { id: 3, type: "tournament", title: "Летний Гран-при", date: "3 июня 2026", location: "Санкт-Петербург", level: "Полупрофессионал", spots: 8, price: "4 000 ₽", img: "🏆" },
  { id: 4, type: "sparring", title: "Женский спарринг клуб", date: "28 апреля 2026", location: "Казань", level: "Любитель", spots: 2, price: "800 ₽", img: "🌺" },
];

const SHOP_ITEMS = [
  { id: 1, name: "Ракетка Wilson Blade", brand: "Wilson", price: "18 900 ₽", badge: "Хит", img: "🎾" },
  { id: 2, name: "Форма Sakura Pro", brand: "Sakura x Nike", price: "7 500 ₽", badge: "Новинка", img: "👘" },
  { id: 3, name: "Мячи Dunlop ATP", brand: "Dunlop", price: "890 ₽", badge: null, img: "⚪" },
  { id: 4, name: "Сумка для ракеток", brand: "Head", price: "5 200 ₽", badge: "−15%", img: "👜" },
];

const MY_TOURNAMENTS = [
  { id: 1, title: "Зимний Кубок", date: "15 марта 2026", result: "2 место", points: "+45", status: "done" },
  { id: 2, title: "Весенний Кубок Сакуры", date: "12 мая 2026", result: "Зарегистрирован", points: null, status: "upcoming" },
];

const NOTIFICATIONS = [
  { id: 1, text: "Ваш турнир начнётся через 3 дня", time: "2 ч назад", read: false, icon: "Bell" },
  { id: 2, text: "Новый спарринг-партнёр найден", time: "вчера", read: false, icon: "Users" },
  { id: 3, text: "Рейтинг обновлён: +12 очков", time: "3 дня назад", read: true, icon: "TrendingUp" },
];

// ── Компоненты ────────────────────────────────────────────────────────

function PetalsBg() {
  return (
    <>
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            top: "-30px",
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
          }}
        >
          🌸
        </div>
      ))}
    </>
  );
}

// ── Онбординг ────────────────────────────────────────────────────────
function Onboarding({ onDone }: { onDone: (score: number) => void }) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  function handleAnswer(score: number) {
    setSelected(score);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (qIndex + 1 < QUESTIONS.length) {
      setQIndex(qIndex + 1);
    } else {
      setStep("result");
    }
  }

  const finalScore = answers.reduce((a, b) => a + b, 0) + (selected ?? 0);
  const level = getLevel(finalScore);

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <PetalsBg />
        <div className="relative z-10 animate-fade-in max-w-sm">
          <img
            src="https://cdn.poehali.dev/projects/9adef978-fb0c-4a6c-a29e-f32b7220c700/files/f4a0eaf5-ea34-4a71-822e-077d5def5e3c.jpg"
            alt="Sakura Tennis"
            className="w-full h-48 object-cover rounded-2xl mb-6 opacity-80"
            style={{ border: "1px solid rgba(249,196,212,0.2)" }}
          />
          <p className="text-xs tracking-[0.35em] font-body uppercase mb-3 opacity-70" style={{ color: "#c9a84c" }}>
            Добро пожаловать
          </p>
          <h1 className="font-display text-5xl font-light text-white mb-2" style={{ lineHeight: 1.1 }}>
            Sakura<br />
            <span className="shimmer-text font-semibold italic">Tennis</span>
          </h1>
          <p className="font-body text-sm mt-4 mb-8 leading-relaxed" style={{ color: "rgba(249,196,212,0.65)" }}>
            Турниры, спарринги и тренеры — всё в одном приложении
          </p>
          <button
            onClick={() => setStep("test")}
            className="w-full py-4 rounded-2xl font-body font-medium text-white text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #e8325a 0%, #c9a84c 100%)" }}
          >
            Определить уровень игры
          </button>
          <button
            onClick={() => onDone(0)}
            className="mt-3 text-xs font-body opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "rgba(249,196,212,1)" }}
          >
            Пропустить →
          </button>
        </div>
      </div>
    );
  }

  if (step === "test") {
    const q = QUESTIONS[qIndex];
    const progress = (qIndex / QUESTIONS.length) * 100;
    return (
      <div className="min-h-screen flex flex-col px-5 pt-14 pb-8 relative overflow-hidden">
        <PetalsBg />
        <div className="relative z-10 flex-1 flex flex-col max-w-sm mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-xs opacity-50" style={{ color: "rgba(249,196,212,1)" }}>
                Вопрос {qIndex + 1} из {QUESTIONS.length}
              </p>
              <p className="font-body text-xs opacity-50" style={{ color: "#c9a84c" }}>
                {Math.round(progress)}%
              </p>
            </div>
            <div className="w-full h-1 rounded-full" style={{ background: "rgba(249,196,212,0.1)" }}>
              <div className="level-bar h-1" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <h2 className="font-display text-3xl font-light text-white mb-8 leading-tight">{q.q}</h2>

          <div className="flex flex-col gap-3 flex-1">
            {q.options.map((opt, i) => {
              const isSelected = selected === q.scores[i];
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(q.scores[i])}
                  className="text-left px-5 py-4 rounded-2xl font-body text-sm transition-all duration-200"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(232,50,90,0.25), rgba(201,168,76,0.15))"
                      : "rgba(255,255,255,0.04)",
                    border: isSelected
                      ? "1px solid rgba(249,196,212,0.5)"
                      : "1px solid rgba(249,196,212,0.1)",
                    color: isSelected ? "#f9c4d4" : "rgba(249,196,212,0.6)",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={selected === null}
            className="mt-6 w-full py-4 rounded-2xl font-body font-medium text-sm tracking-wide transition-all duration-300"
            style={{
              background: selected !== null
                ? "linear-gradient(135deg, #e8325a 0%, #c9a84c 100%)"
                : "rgba(255,255,255,0.06)",
              color: selected !== null ? "#fff" : "rgba(255,255,255,0.3)",
            }}
          >
            {qIndex + 1 === QUESTIONS.length ? "Завершить тест" : "Далее"}
          </button>
        </div>
      </div>
    );
  }

  // result
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <PetalsBg />
      <div className="relative z-10 animate-scale-in max-w-sm w-full">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 font-display text-3xl font-semibold text-white"
          style={{
            background: `radial-gradient(circle, ${level.color}60, ${level.color}20)`,
            border: `2px solid ${level.color}80`,
          }}
        >
          {finalScore}
        </div>

        <p className="text-xs tracking-[0.35em] font-body uppercase mb-2 opacity-60" style={{ color: "#c9a84c" }}>
          Ваш уровень
        </p>
        <h2 className="font-display text-4xl font-semibold text-white mb-1">{level.label}</h2>
        <p className="font-body text-xs mb-6 opacity-50 italic text-white">{level.en}</p>

        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex gap-1 mb-3">
            {LEVELS.map((l, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full"
                style={{
                  background: finalScore >= l.min ? l.color : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
          <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(249,196,212,0.65)" }}>
            {level.desc}
          </p>
        </div>

        <button
          onClick={() => onDone(finalScore)}
          className="w-full py-4 rounded-2xl font-body font-medium text-white text-sm tracking-wide transition-all duration-300 hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #e8325a 0%, #c9a84c 100%)" }}
        >
          Начать играть
        </button>
      </div>
    </div>
  );
}

// ── Экран: Мои турниры и рейтинг ─────────────────────────────────────
function MyScreen({ score }: { score: number }) {
  const level = getLevel(score);
  const rating = 1240 + score * 3;

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <div
        className="rounded-3xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(232,50,90,0.18) 0%, rgba(201,168,76,0.12) 100%)",
          border: "1px solid rgba(249,196,212,0.15)",
        }}
      >
        <div className="absolute top-3 right-4 text-4xl opacity-20">🌸</div>
        <p className="font-body text-xs uppercase tracking-widest opacity-50 mb-1" style={{ color: "#c9a84c" }}>Мой рейтинг</p>
        <div className="flex items-end gap-3 mb-4">
          <span className="font-display text-5xl font-semibold text-white">{rating}</span>
          <span className="font-body text-xs mb-2 text-green-400">▲ +57 за месяц</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full text-xs font-body font-medium"
            style={{ background: `${level.color}30`, color: level.color, border: `1px solid ${level.color}50` }}
          >
            {level.label}
          </div>
          <span className="font-body text-xs opacity-50 text-white">Балл: {score}/100</span>
        </div>

        <div className="mt-4">
          <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="level-bar h-1.5" style={{ width: `${score}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            {LEVELS.map((l) => (
              <span key={l.en} className="font-body text-[9px] opacity-30 text-white">{l.en}</span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-display text-2xl font-light text-white mb-4">Мои турниры</h2>
      <div className="flex flex-col gap-3">
        {MY_TOURNAMENTS.map((t) => (
          <div key={t.id} className="glass-card glass-card-hover rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: t.status === "upcoming" ? "rgba(232,50,90,0.15)" : "rgba(201,168,76,0.15)" }}
              >
                {t.status === "upcoming" ? "🎾" : "🏅"}
              </div>
              <div>
                <p className="font-body text-sm text-white font-medium">{t.title}</p>
                <p className="font-body text-xs opacity-50 text-white">{t.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-body text-xs font-medium" style={{ color: t.status === "upcoming" ? "#f9c4d4" : "#c9a84c" }}>
                {t.result}
              </p>
              {t.points && <p className="font-body text-xs text-green-400">{t.points} pts</p>}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl font-light text-white mt-6 mb-4">Статистика</h2>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Турниров", value: "12", icon: "Trophy" },
          { label: "Побед", value: "7", icon: "Star" },
          { label: "Спаррингов", value: "31", icon: "Users" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
            <Icon name={s.icon as IconName} size={18} className="mx-auto mb-2 opacity-60" style={{ color: "#c9a84c" }} />
            <p className="font-display text-2xl font-semibold text-white">{s.value}</p>
            <p className="font-body text-[10px] opacity-40 text-white mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Экран: События ────────────────────────────────────────────────────
function EventsScreen() {
  const [filter, setFilter] = useState<"all" | "tournament" | "sparring">("all");
  const [registered, setRegistered] = useState<number[]>([]);
  const { toast } = useToast();
  const filtered = EVENTS.filter((e) => filter === "all" || e.type === filter);

  function handleRegister(ev: typeof EVENTS[0]) {
    if (registered.includes(ev.id)) {
      toast({ title: "Вы уже записаны", description: ev.title });
      return;
    }
    setRegistered((r) => [...r, ev.id]);
    toast({ title: "🌸 Заявка принята!", description: `Вы записаны на «${ev.title}»` });
  }

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <h2 className="font-display text-3xl font-light text-white mb-1">События</h2>
      <p className="font-body text-xs opacity-40 text-white mb-5">Открытые турниры и спарринги</p>

      <div className="flex gap-2 mb-5">
        {[
          { key: "all", label: "Все" },
          { key: "tournament", label: "Турниры" },
          { key: "sparring", label: "Спарринги" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as IconName)}
            className="px-4 py-2 rounded-xl font-body text-xs transition-all duration-200"
            style={{
              background: filter === f.key ? "linear-gradient(135deg, #e8325a, #c9a84c)" : "rgba(255,255,255,0.05)",
              color: filter === f.key ? "#fff" : "rgba(249,196,212,0.5)",
              border: filter === f.key ? "none" : "1px solid rgba(249,196,212,0.1)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((ev) => (
          <div key={ev.id} className="glass-card glass-card-hover rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ev.img}</span>
                <div>
                  <div
                    className="text-[10px] font-body uppercase tracking-wider mb-1"
                    style={{ color: ev.type === "tournament" ? "#e8325a" : "#c9a84c" }}
                  >
                    {ev.type === "tournament" ? "Турнир" : "Спарринг"}
                  </div>
                  <h3 className="font-body text-sm font-medium text-white">{ev.title}</h3>
                </div>
              </div>
              <span
                className="text-xs font-body font-semibold px-3 py-1 rounded-full"
                style={{ background: "rgba(249,196,212,0.1)", color: "#f9c4d4" }}
              >
                {ev.price}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={12} style={{ color: "#c9a84c", opacity: 0.7 }} />
                <span className="font-body text-xs opacity-60 text-white">{ev.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={12} style={{ color: "#c9a84c", opacity: 0.7 }} />
                <span className="font-body text-xs opacity-60 text-white">{ev.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Users" size={12} style={{ color: "#c9a84c", opacity: 0.7 }} />
                <span className="font-body text-xs opacity-60 text-white">Свободных мест: {ev.spots}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className="text-xs font-body px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c" }}
              >
                {ev.level}
              </span>
              <button
                onClick={() => handleRegister(ev)}
                className="px-5 py-2 rounded-xl font-body text-xs font-medium text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                style={{ background: registered.includes(ev.id) ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #e8325a, #c9a84c)" }}
              >
                {registered.includes(ev.id) ? "✓ Записан" : "Записаться"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Экран: Sakura Shop ────────────────────────────────────────────────
function ShopScreen() {
  const [cart, setCart] = useState<number[]>([]);
  const { toast } = useToast();

  function addToCart(item: typeof SHOP_ITEMS[0]) {
    setCart((c) => [...c, item.id]);
    toast({ title: "🛍️ Добавлено в корзину", description: item.name });
  }

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <div className="flex items-end justify-between mb-1">
        <h2 className="font-display text-3xl font-light text-white">Sakura Shop</h2>
        <span className="text-lg">🛍️</span>
      </div>
      <p className="font-body text-xs opacity-40 text-white mb-6">Товары от партнёров клуба</p>

      <div className="grid grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item) => (
          <div key={item.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden">
            <div
              className="h-28 flex items-center justify-center text-5xl"
              style={{ background: "rgba(249,196,212,0.06)" }}
            >
              {item.img}
            </div>
            <div className="p-3">
              {item.badge && (
                <span
                  className="text-[9px] font-body uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                  style={{ background: "rgba(232,50,90,0.2)", color: "#f9c4d4" }}
                >
                  {item.badge}
                </span>
              )}
              <p className="font-body text-xs font-medium text-white leading-tight mb-0.5">{item.name}</p>
              <p className="font-body text-[10px] opacity-40 text-white mb-2">{item.brand}</p>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold" style={{ color: "#c9a84c" }}>{item.price}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: cart.includes(item.id) ? "rgba(201,168,76,0.3)" : "rgba(232,50,90,0.2)" }}
                >
                  <Icon name={cart.includes(item.id) ? "Check" : "Plus"} size={14} style={{ color: "#f9c4d4" }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-6 rounded-2xl p-5 text-center"
        style={{ background: "rgba(249,196,212,0.05)", border: "1px dashed rgba(249,196,212,0.15)" }}
      >
        <p className="font-display text-lg text-white mb-1">Стать партнёром</p>
        <p className="font-body text-xs opacity-40 text-white mb-3">Разместите свои товары в магазине</p>
        <button
          onClick={() => toast({ title: "Скоро!", description: "Программа партнёрства открывается в мае 2026" })}
          className="px-6 py-2.5 rounded-xl font-body text-xs font-medium transition-all hover:scale-[1.02]"
          style={{ border: "1px solid rgba(249,196,212,0.25)", color: "#f9c4d4" }}
        >
          Узнать условия
        </button>
      </div>
    </div>
  );
}

// ── Экран: Создать событие / Уведомления ─────────────────────────────
function CreateScreen() {
  const [tab, setTab] = useState<"create" | "notif">("create");
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [eventType, setEventType] = useState<string | null>(null);
  const { toast } = useToast();

  function markRead(id: number) {
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }

  function handlePublish() {
    toast({ title: "🎾 Событие опубликовано!", description: "Оно появится в разделе «События»" });
  }

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <div
        className="flex rounded-2xl p-1 mb-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(249,196,212,0.08)" }}
      >
        {[{ key: "create", label: "Создать событие" }, { key: "notif", label: "Уведомления" }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as IconName)}
            className="flex-1 py-2.5 rounded-xl font-body text-xs transition-all duration-200"
            style={{
              background: tab === t.key ? "linear-gradient(135deg, #e8325a, #c9a84c)" : "transparent",
              color: tab === t.key ? "#fff" : "rgba(249,196,212,0.45)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <div>
          <h2 className="font-display text-3xl font-light text-white mb-5">Создать событие</h2>

          <p className="font-body text-xs opacity-50 text-white mb-2 uppercase tracking-wider">Тип события</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: "Trophy", label: "Турнир" },
              { icon: "Swords", label: "Спарринг" },
            ].map((t) => (
              <div
                key={t.label}
                onClick={() => setEventType(t.label)}
                className="glass-card glass-card-hover rounded-2xl p-4 text-center cursor-pointer"
                style={{ border: eventType === t.label ? "1px solid rgba(232,50,90,0.5)" : undefined }}
              >
                <Icon name={t.icon as IconName} size={24} className="mx-auto mb-2" style={{ color: eventType === t.label ? "#e8325a" : "#c9a84c" }} />
                <p className="font-body text-sm text-white">{t.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {[
              { placeholder: "Название события", type: "text" },
              { placeholder: "Дата проведения", type: "date" },
              { placeholder: "Место / адрес", type: "text" },
              { placeholder: "Стоимость участия", type: "text" },
              { placeholder: "Максимум участников", type: "number" },
            ].map((f) => (
              <input
                key={f.placeholder}
                type={f.type}
                placeholder={f.placeholder}
                className="w-full px-4 py-3.5 rounded-xl font-body text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(249,196,212,0.12)",
                  color: "#f9c4d4",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(232,50,90,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(249,196,212,0.12)")}
              />
            ))}
          </div>

          <button
            onClick={handlePublish}
            className="w-full mt-5 py-4 rounded-2xl font-body font-medium text-white text-sm tracking-wide transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #e8325a 0%, #c9a84c 100%)" }}
          >
            Опубликовать событие
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-3xl font-light text-white">Уведомления</h2>
            <button
              onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}
              className="font-body text-xs opacity-50 hover:opacity-80 transition-opacity"
              style={{ color: "#c9a84c" }}
            >
              Прочитать все
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className="glass-card rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
                style={{ opacity: n.read ? 0.5 : 1 }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: n.read ? "rgba(255,255,255,0.05)" : "rgba(232,50,90,0.15)" }}
                >
                  <Icon name={n.icon as IconName} size={16} style={{ color: n.read ? "rgba(249,196,212,0.4)" : "#f9c4d4" }} />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs text-white leading-relaxed">{n.text}</p>
                  <p className="font-body text-[10px] opacity-40 text-white mt-1">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#e8325a" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Экран: Профиль ────────────────────────────────────────────────────
function ProfileScreen({ score, onLogout }: { score: number; onLogout: () => void }) {
  const level = getLevel(score);
  const [isPartner, setIsPartner] = useState(false);
  const { toast } = useToast();

  const menuToasts: Record<string, string> = {
    "Редактировать профиль": "Редактирование профиля — скоро",
    "Мои достижения": "Раздел достижений в разработке",
    "Платежи и подписка": "Платёжный раздел — скоро",
    "Настройки": "Настройки — скоро",
    "Поддержка": "Напишите нам: support@sakuratennis.ru",
  };

  return (
    <div className="px-4 pt-6 pb-4 animate-fade-in">
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-3 relative"
          style={{
            background: "linear-gradient(135deg, rgba(232,50,90,0.25), rgba(201,168,76,0.15))",
            border: "2px solid rgba(249,196,212,0.25)",
          }}
        >
          🎾
          <div
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-body font-semibold text-white"
            style={{ background: level.color }}
          >
            {score}
          </div>
        </div>
        <h2 className="font-display text-2xl font-light text-white">Александр К.</h2>
        <p className="font-body text-xs mt-0.5" style={{ color: "#c9a84c" }}>
          {level.label} · {level.en}
        </p>
      </div>

      <div
        className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{
          background: isPartner
            ? "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,50,90,0.1))"
            : "linear-gradient(135deg, rgba(232,50,90,0.12), rgba(201,168,76,0.08))",
          border: `1px solid ${isPartner ? "rgba(201,168,76,0.4)" : "rgba(249,196,212,0.15)"}`,
        }}
      >
        <div className="absolute top-3 right-4 text-3xl opacity-20">🤝</div>
        <p className="font-body text-[10px] uppercase tracking-widest mb-1 opacity-60" style={{ color: "#c9a84c" }}>
          {isPartner ? "Статус партнёра активен" : "Специальное предложение"}
        </p>
        <h3 className="font-display text-xl text-white mb-2">
          {isPartner ? "Вы — партнёр Sakura" : "Стать партнёром клуба"}
        </h3>
        <p className="font-body text-xs leading-relaxed mb-4" style={{ color: "rgba(249,196,212,0.55)" }}>
          {isPartner
            ? "Ваши товары доступны в Sakura Shop. Следите за аналитикой продаж."
            : "Размещайте товары в магазине, организуйте события и получайте бонусы за привлечение игроков."}
        </p>
        <button
          onClick={() => {
            setIsPartner(!isPartner);
            if (!isPartner) toast({ title: "🤝 Заявка отправлена!", description: "Мы свяжемся с вами в течение 24 часов" });
          }}
          className="px-6 py-2.5 rounded-xl font-body text-xs font-medium text-white transition-all hover:scale-[1.02]"
          style={{
            background: isPartner ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #e8325a, #c9a84c)",
          }}
        >
          {isPartner ? "Управлять партнёрством" : "Подать заявку"}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {[
          { icon: "User", label: "Редактировать профиль" },
          { icon: "Shield", label: "Мои достижения" },
          { icon: "CreditCard", label: "Платежи и подписка" },
          { icon: "Settings", label: "Настройки" },
          { icon: "HelpCircle", label: "Поддержка" },
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => toast({ title: item.label, description: menuToasts[item.label] })}
            className="glass-card glass-card-hover rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Icon name={item.icon as IconName} size={16} style={{ color: "#c9a84c", opacity: 0.7 }} />
              <span className="font-body text-sm text-white">{item.label}</span>
            </div>
            <Icon name="ChevronRight" size={14} style={{ color: "rgba(249,196,212,0.3)" }} />
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        className="w-full mt-4 py-3 rounded-xl font-body text-xs opacity-30 hover:opacity-50 transition-opacity"
        style={{ color: "#f9c4d4" }}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
}

// ── Навигация ─────────────────────────────────────────────────────────
const NAV_ITEMS: { key: Tab; icon: string; label: string }[] = [
  { key: "my", icon: "Trophy", label: "Мои" },
  { key: "events", icon: "Calendar", label: "События" },
  { key: "shop", icon: "ShoppingBag", label: "Shop" },
  { key: "create", icon: "PlusCircle", label: "Создать" },
  { key: "profile", icon: "User", label: "Профиль" },
];

// ── Главное приложение ────────────────────────────────────────────────
export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [score, setScore] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("events");

  function handleOnboardingDone(s: number) {
    setScore(s);
    setOnboarded(true);
  }

  if (!onboarded) {
    return (
      <div className="min-h-screen" style={{ background: "#0d0a0c" }}>
        <Onboarding onDone={handleOnboardingDone} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0a0c" }}>
      <Toaster />
      <PetalsBg />

      {/* Шапка */}
      <div
        className="fixed top-0 left-0 right-0 z-40 px-5 py-3 flex items-center justify-between"
        style={{
          background: "rgba(13,10,12,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(249,196,212,0.06)",
        }}
      >
        <div>
          <span className="font-display text-xl font-semibold italic" style={{ color: "#f9c4d4" }}>Sakura</span>
          <span className="font-display text-xl font-light text-white ml-1">Tennis</span>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full font-body text-xs font-medium"
            style={{ background: "rgba(232,50,90,0.15)", color: "#f9c4d4", border: "1px solid rgba(232,50,90,0.25)" }}
          >
            {getLevel(score).label}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(249,196,212,0.1)" }}>
            <Icon name="Bell" size={15} style={{ color: "#f9c4d4", opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* Контент */}
      <main className="flex-1 pt-16 pb-24 overflow-y-auto relative z-10 max-w-lg mx-auto w-full">
        {activeTab === "my" && <MyScreen score={score} />}
        {activeTab === "events" && <EventsScreen />}
        {activeTab === "shop" && <ShopScreen />}
        {activeTab === "create" && <CreateScreen />}
        {activeTab === "profile" && <ProfileScreen score={score} onLogout={() => { setOnboarded(false); setScore(0); setActiveTab("events"); }} />}
      </main>

      {/* Нижняя навигация */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 px-3 py-2"
        style={{
          background: "rgba(13,10,12,0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(249,196,212,0.07)",
        }}
      >
        <div className="flex justify-around items-end max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px]"
                style={{ background: isActive ? "rgba(232,50,90,0.12)" : "transparent" }}
              >
                <Icon
                  name={item.icon as IconName}
                  size={20}
                  style={{
                    color: isActive ? "#f9c4d4" : "rgba(249,196,212,0.3)",
                    transition: "all 0.2s",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <span
                  className="font-body text-[9px] uppercase tracking-wide"
                  style={{ color: isActive ? "#f9c4d4" : "rgba(249,196,212,0.25)" }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}