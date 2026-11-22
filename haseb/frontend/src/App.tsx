import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Product = {
  id: number
  code: string
  name: string
  category: string
  unit: string
  price: number
  isActive: boolean
}

type ProductForm = {
  code: string
  name: string
  category: string
  unit: string
  price: number
  isActive: boolean
}

const emptyForm: ProductForm = {
  code: '',
  name: '',
  category: '',
  unit: 'عدد',
  price: 0,
  isActive: true,
}

const money = (value: number) =>
  new Intl.NumberFormat('fa-IR').format(value || 0)

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  async function loadProducts() {
    const response = await fetch('/api/v1/products')
    if (!response.ok) throw new Error('دریافت فهرست کالاها ناموفق بود.')
    const data = (await response.json()) as Product[]
    setProducts(data)
  }

  useEffect(() => {
    loadProducts()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return products
    return products.filter((product) =>
      [product.name, product.code, product.category]
        .join(' ')
        .toLocaleLowerCase()
        .includes(term),
    )
  }, [products, search])

  const activeCount = products.filter((product) => product.isActive).length
  const categoriesCount = new Set(
    products.map((product) => product.category).filter(Boolean),
  ).size

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      code: product.code,
      name: product.name,
      category: product.category || '',
      unit: product.unit || 'عدد',
      price: product.price,
      isActive: product.isActive,
    })
    setError('')
    setModalOpen(true)
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        editingId ? `/api/v1/products/${editingId}` : '/api/v1/products',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, price: Number(form.price) }),
        },
      )

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || 'ذخیره کالا انجام نشد. اطلاعات را بررسی کنید.')
      }

      await loadProducts()
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`کالای «${product.name}» حذف شود؟`)) return

    try {
      const response = await fetch(`/api/v1/products/${product.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('حذف کالا انجام نشد.')
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای حذف کالا')
    }
  }

  return (
    <div className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">ح</div>
          <div>
            <strong>حاسب</strong>
            <span>مدیریت هوشمند پخش</span>
          </div>
        </div>

        <div className="nav-caption">مدیریت کسب‌وکار</div>
        <nav className="navigation">
          <div className="nav-item"><span>▦</span> نمای کلی</div>
          <div className="nav-item"><span>↗</span> فروش و سفارش‌ها</div>
          <div className="nav-item selected"><span>▤</span> کالاها و خدمات</div>
          <div className="nav-item"><span>▣</span> انبار و موجودی</div>
          <div className="nav-item"><span>♧</span> مشتریان</div>
          <div className="nav-item"><span>⇄</span> تأمین‌کنندگان</div>
          <div className="nav-item"><span>◫</span> گزارش‌ها</div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-avatar">م</div>
          <div className="user-info">
            <strong>مدیر سیستم</strong>
            <span>دسترسی کامل</span>
          </div>
          <span className="user-dots">•••</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">مدیریت کالاها <span>/</span> فهرست کالاها</div>
          <div className="topbar-left">
            <span className="today-label">سامانه پخش مواد غذایی</span>
            <div className="notification">♧</div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">مدیریت موجودیت‌ها</div>
              <h1>کالاها و محصولات</h1>
              <p>اطلاعات کالاها، قیمت‌ها و وضعیت فعال بودن محصولات را مدیریت کنید.</p>
            </div>
            <button className="primary-button" onClick={openCreate}>
              <span>＋</span> افزودن کالای جدید
            </button>
          </div>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-icon violet">▤</div>
              <div><span>تعداد کل کالاها</span><strong>{money(products.length)}</strong></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon green">✓</div>
              <div><span>کالاهای فعال</span><strong>{money(activeCount)}</strong></div>
            </article>
            <article className="stat-card">
              <div className="stat-icon orange">▦</div>
              <div><span>گروه‌های کالایی</span><strong>{money(categoriesCount)}</strong></div>
            </article>
          </section>

          <section className="table-card">
            <div className="table-heading">
              <div>
                <h2>فهرست کالاها</h2>
                <span>{money(filteredProducts.length)} کالا در فهرست</span>
              </div>
              <div className="table-actions">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="جست‌وجوی نام، کد یا گروه کالا..."
                  />
                </div>
                <button className="refresh-button" onClick={() => {
                  setLoading(true)
                  loadProducts().catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
                }}>↻</button>
              </div>
            </div>

            {error && !modalOpen && <div className="alert">{error}</div>}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>کد کالا</th>
                    <th>نام کالا</th>
                    <th>گروه کالا</th>
                    <th>واحد</th>
                    <th>قیمت فروش</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="empty-state">در حال دریافت اطلاعات...</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        <div className="empty-icon">▤</div>
                        <strong>{search ? 'نتیجه‌ای پیدا نشد' : 'هنوز کالایی ثبت نشده است'}</strong>
                        <span>{search ? 'عبارت جست‌وجو را تغییر دهید.' : 'برای شروع، اولین کالا را ثبت کنید.'}</span>
                        {!search && <button className="text-button" onClick={openCreate}>افزودن اولین کالا</button>}
                      </td>
                    </tr>
                  ) : filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td><span className="product-code">{product.code}</span></td>
                      <td className="product-name">{product.name}</td>
                      <td>{product.category || '—'}</td>
                      <td>{product.unit || '—'}</td>
                      <td className="price-cell">{money(product.price)} <small>تومان</small></td>
                      <td>
                        <span className={`status ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                          <i /> {product.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button title="ویرایش" onClick={() => openEdit(product)}>✎</button>
                          <button title="حذف" className="delete-action" onClick={() => deleteProduct(product)}>⌫</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <span>نمایش {money(filteredProducts.length)} از {money(products.length)} کالا</span>
              <span className="connected"><i /> اتصال به سامانه برقرار است</span>
            </div>
          </section>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalOpen(false)
        }}>
          <section className="product-modal">
            <div className="modal-heading">
              <div>
                <h2>{editingId ? 'ویرایش کالا' : 'ثبت کالای جدید'}</h2>
                <p>اطلاعات محصول را در فرم زیر وارد کنید.</p>
              </div>
              <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="form-grid">
                <label>
                  کد کالا <b>*</b>
                  <input required maxLength={50} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثلاً FOOD-001" />
                </label>
                <label>
                  نام کالا <b>*</b>
                  <input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="نام محصول" />
                </label>
                <label>
                  گروه کالا
                  <input maxLength={100} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="مثلاً لبنیات" />
                </label>
                <label>
                  واحد شمارش
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="عدد">عدد</option>
                    <option value="بسته">بسته</option>
                    <option value="کارتن">کارتن</option>
                    <option value="کیلوگرم">کیلوگرم</option>
                    <option value="گرم">گرم</option>
                    <option value="لیتر">لیتر</option>
                  </select>
                </label>
                <label className="full-field">
                  قیمت فروش (تومان)
                  <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </label>
              </div>

              <label className="active-toggle">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                کالا فعال باشد
              </label>

              {error && <div className="alert">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>انصراف</button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'ثبت کالا'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
