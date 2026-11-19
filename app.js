
const seed=[{name:"برنج ایرانی ۱۰ کیلویی",price:1250000,stock:24},{name:"روغن مایع ۱.۵ لیتری",price:185000,stock:60},{name:"رب گوجه ۸۰۰ گرمی",price:98000,stock:42},{name:"قند شکسته ۵ کیلویی",price:310000,stock:18}];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
let items=get("demo_items",seed),orders=get("demo_orders",[]);
const money=n=>new Intl.NumberFormat("fa-IR").format(n)+" تومان";
function save(){localStorage.setItem("demo_items",JSON.stringify(items));localStorage.setItem("demo_orders",JSON.stringify(orders));render()}
function render(){
 document.getElementById("itemCount").textContent=items.length;
 document.getElementById("orderCount").textContent=orders.length;
 document.getElementById("itemList").innerHTML=items.map(i=>`<div class="card"><b>${i.name}</b><div>${money(i.price)}</div><div class="muted">موجودی نمونه: ${i.stock}</div></div>`).join("");
 document.getElementById("itemSelect").innerHTML=items.map((i,n)=>`<option value="${n}">${i.name} — ${money(i.price)}</option>`).join("");
 const html=orders.slice().reverse().map(o=>`<div class="card"><b>${o.customer}</b><div>${o.item} × ${o.qty}</div><div>مبلغ نمونه: ${money(o.total)}</div><div class="muted">${o.date} · ذخیره‌شده روی همین گوشی</div></div>`).join("")||'<p class="muted">هنوز سفارشی ثبت نشده است.</p>';
 document.getElementById("orderList").innerHTML=html;document.getElementById("recent").innerHTML=orders.length?orders.slice(-2).reverse().map(o=>`<div class="card"><b>${o.customer}</b><div>${o.item} × ${o.qty}</div><div class="muted">${o.date}</div></div>`).join():'<p class="muted">سفارشی ثبت نشده است.</p>';
}
function page(p){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===p));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===p))}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>page(b.dataset.page));
document.getElementById("newOrder").onclick=()=>page("orders");
document.getElementById("orderForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),it=items[Number(f.get("item"))],qty=Number(f.get("qty"));orders.push({customer:f.get("customer"),item:it.name,qty,total:it.price*qty,note:f.get("note"),date:new Date().toLocaleString("fa-IR")});save();e.target.reset();alert("سفارش آزمایشی روی گوشی ذخیره شد.");page("orders")};
function net(){document.getElementById("net").textContent=navigator.onLine?"اتصال اینترنت برقرار":"حالت آفلاین"}
addEventListener("online",net);addEventListener("offline",net);net();render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
