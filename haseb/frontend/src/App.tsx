import { useEffect, useState } from 'react'

type Health = { status: string; service: string; utc: string }
export default function App() {
  const [health, setHealth] = useState<Health | null>(null)
  useEffect(() => {
    fetch('/api-health/health').then(r => r.json()).then(setHealth).catch(() => setHealth(null))
  }, [])
  return <main>
    <header><div><strong>حاسب</strong><span>سامانه مدیریت و پخش مواد غذایی</span></div><small>نسخه پایه ۰.۱</small></header>
    <section className="hero"><h1>مرکز مدیریت عملیات</h1><p>زیرساخت یکپارچه فروش، انبار، خرید و امور مالی</p></section>
    <section className="grid">
      {['فروش و سفارش‌ها','انبار و موجودی','خرید و تأمین‌کنندگان','مشتریان','حسابداری و صندوق','گزارش‌های مدیریتی'].map(x =>
        <article key={x}><h2>{x}</h2><p>این بخش در گام‌های بعدی تکمیل می‌شود.</p></article>)}
    </section>
    <footer>وضعیت API: {health?.status === 'ok' ? 'متصل' : 'در انتظار اتصال'} </footer>
  </main>
}
