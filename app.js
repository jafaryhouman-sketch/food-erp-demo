
const seed=[
{name:"برنج ایرانی ۱۰ کیلویی",price:1250000,stock:24},
{name:"روغن مایع ۱.۵ لیتری",price:185000,stock:60},
{name:"رب گوجه ۸۰۰ گرمی",price:98000,stock:42},
{name:"قند شکسته ۵ کیلویی",price:310000,stock:18}
];
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
let items=get("demo_items",seed),orders=get("demo_orders",[]);
const money=n=>new Intl.NumberFormat("fa-IR").format(n)+" تومان";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let sbClient=null,sbConfig=get("demo_supabase_config",null),currentSession=null;
function makeId(){return crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:(r&3|8)).toString(16)})}
const deviceId=get("demo_device_id",null)||makeId();
localStorage.setItem("demo_device_id",JSON.stringify(deviceId));
function save(){localStorage.setItem("demo_items",JSON.stringify(items));localStorage.setItem("demo_orders",JSON.stringify(orders));render()}
function syncLabel(o){if(o.sync_status==="synced")return"همگام‌سازی شد";if(o.sync_status==="pending")return"در انتظار ارسال";if(o.sync_status==="error")return"ارسال ناموفق؛ تلاش مجدد لازم است";return"ذخیره‌شده روی همین گوشی"}
function render(){
document.getElementById("itemCount").textContent=items.length;
document.getElementById("orderCount").textContent=orders.length;
document.getElementById("itemList").innerHTML=items.map(i=>'<div class="card"><b>'+esc(i.name)+'</b><div>'+money(i.price)+'</div><div class="muted">موجودی نمونه: '+i.stock+'</div></div>').join("");
document.getElementById("itemSelect").innerHTML=items.map((i,n)=>'<option value="'+n+'">'+esc(i.name)+' — '+money(i.price)+'</option>').join("");
document.getElementById("orderList").innerHTML=orders.slice().reverse().map(o=>'<div class="card"><b>'+esc(o.customer)+'</b><div>'+esc(o.item)+' × '+o.qty+'</div><div>مبلغ: '+money(o.total)+'</div><div class="muted">'+esc(o.date)+' · '+syncLabel(o)+'</div>'+(o.sync_error?'<div class="muted">'+esc(o.sync_error)+'</div>':"")+'</div>').join("")||'<p class="muted">هنوز سفارشی ثبت نشده است.</p>';
document.getElementById("recent").innerHTML=orders.length?orders.slice(-2).reverse().map(o=>'<div class="card"><b>'+esc(o.customer)+'</b><div>'+esc(o.item)+' × '+o.qty+'</div><div class="muted">'+syncLabel(o)+'</div></div>').join(""):'<p class="muted">سفارشی ثبت نشده است.</p>';
updateConnectionStatus();
}
function page(p){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===p));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===p))}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>page(b.dataset.page));
document.getElementById("newOrder").onclick=()=>page("orders");

function addConnectionPanel(){
const notice=document.querySelector("#home .notice");
const panel=document.createElement("section");
panel.className="card";
panel.innerHTML=
'<h2 style="margin-top:0">اتصال به سرور</h2>'+
'<p class="muted">اطلاعات پروژه را فقط روی همین دستگاه وارد کن. کلید محرمانه سرور را اینجا وارد نکن.</p>'+
'<label>Project URL<input id="sbProjectUrl" type="url" placeholder="https://....supabase.co"></label>'+
'<label>Publishable Key<input id="sbPublishableKey" type="text" placeholder="sb_publishable_..." autocomplete="off"></label>'+
'<label>ایمیل کاربر<input id="sbEmail" type="email" autocomplete="username"></label>'+
'<label>رمز عبور<input id="sbPassword" type="password" autocomplete="current-password"></label>'+
'<button class="primary" id="sbLogin" type="button">ورود به حساب</button>'+
'<button class="primary" id="sbSignup" type="button">ثبت‌نام کاربر جدید</button>'+
'<button id="sbLogout" type="button" style="width:100%;padding:11px;border-radius:9px;background:#e9efec;color:#153b35">خروج از حساب</button>'+
'<p id="sbStatus" class="muted">هنوز به سرور وصل نشده‌ای.</p>'+
'<button id="syncNow" type="button" style="width:100%;padding:11px;border-radius:9px;background:#e9efec;color:#153b35">ارسال سفارش‌های در انتظار</button>';
notice.insertAdjacentElement("afterend",panel);
if(sbConfig){document.getElementById("sbProjectUrl").value=sbConfig.url||"";document.getElementById("sbPublishableKey").value=sbConfig.key||"";document.getElementById("sbEmail").value=sbConfig.email||""}
document.getElementById("sbLogin").onclick=login;
  document.getElementById("sbSignup").onclick=signup;
document.getElementById("sbLogout").onclick=logout;
document.getElementById("syncNow").onclick=syncPendingOrders;
}
function updateConnectionStatus(message){
const el=document.getElementById("sbStatus");if(!el)return;
if(message){el.textContent=message;return}
const pending=orders.filter(o=>o.sync_status==="pending"||o.sync_status==="error").length;
el.textContent=currentSession?"وارد شده‌ای: "+(currentSession.user.email||"کاربر")+" · سفارش‌های در انتظار: "+pending:"برای ارسال سفارش‌ها، ابتدا وارد حساب کاربری شو.";
}
async function signup(){
  const url=document.getElementById("sbProjectUrl").value.trim().replace(/\/+$/,"");
  const key=document.getElementById("sbPublishableKey").value.trim();
  const email=document.getElementById("sbEmail").value.trim();
  const password=document.getElementById("sbPassword").value;

  if(!url||!key||!email||!password){
    updateConnectionStatus("آدرس پروژه، کلید، ایمیل و رمز عبور را وارد کن.");
    return;
  }

  if(password.length<6){
    updateConnectionStatus("رمز عبور باید حداقل ۶ کاراکتر باشد.");
    return;
  }

  if(!window.supabase){
    updateConnectionStatus("کتابخانه Supabase بارگذاری نشده است.");
    return;
  }

  try{
    updateConnectionStatus("در حال ساخت حساب کاربری...");

    sbConfig={url,key,email};
    localStorage.setItem("demo_supabase_config",JSON.stringify(sbConfig));

    sbClient=window.supabase.createClient(url,key,{
      auth:{
        persistSession:true,
        autoRefreshToken:true
      }
    });

    const result=await sbClient.auth.signUp({
      email,
      password
    });

    if(result.error) throw result.error;

    document.getElementById("sbPassword").value="";

    if(result.data.session){
      currentSession=result.data.session;
      updateConnectionStatus("ثبت‌نام و ورود موفق بود.");
      await syncPendingOrders();
    }else{
      updateConnectionStatus(
        "حساب ساخته شد. برای ورود، ایمیل خود را تأیید کن."
      );
    }

  }catch(e){
    updateConnectionStatus("خطا در ثبت‌نام: "+e.message);
  }
}
async function login(){
const url=document.getElementById("sbProjectUrl").value.trim().replace(/\/+$/,"");
const key=document.getElementById("sbPublishableKey").value.trim();
const email=document.getElementById("sbEmail").value.trim();
const password=document.getElementById("sbPassword").value;
if(!url||!key||!email||!password){updateConnectionStatus("همه فیلدها را کامل کن.");return}
if(!window.supabase){updateConnectionStatus("کتابخانه اتصال بارگذاری نشده؛ صفحه را تازه‌سازی کن.");return}
updateConnectionStatus("در حال ورود...");
try{
sbConfig={url,key,email};localStorage.setItem("demo_supabase_config",JSON.stringify(sbConfig));
sbClient=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}});
const result=await sbClient.auth.signInWithPassword({email,password});
document.getElementById("sbPassword").value="";
if(result.error)throw result.error;
currentSession=result.data.session;
updateConnectionStatus("ورود موفق بود. سفارش‌های در انتظار بررسی می‌شوند.");
await syncPendingOrders();
}catch(e){currentSession=null;updateConnectionStatus("خطا در ورود: "+e.message)}
}
async function logout(){if(sbClient)await sbClient.auth.signOut();currentSession=null;updateConnectionStatus("از حساب خارج شدی.")}
async function ensureSession(){
if(!sbClient||!sbConfig)return null;
const result=await sbClient.auth.getSession();
if(result.error||!result.data.session)return null;
currentSession=result.data.session;return currentSession;
}
async function syncPendingOrders(){
if(!navigator.onLine){updateConnectionStatus("اینترنت قطع است؛ سفارش‌ها روی گوشی می‌مانند.");return}
const session=await ensureSession();
if(!session){updateConnectionStatus("برای همگام‌سازی ابتدا وارد حساب کاربری شو.");return}
const pending=orders.filter(o=>o.sync_status==="pending"||o.sync_status==="error");
if(!pending.length){updateConnectionStatus("سفارشی برای ارسال وجود ندارد.");return}
for(const order of pending){
order.sync_status="pending";order.sync_error="";save();
try{
const response=await fetch(sbConfig.url+"/functions/v1/super-api",{
method:"POST",
headers:{"Content-Type":"application/json","apikey":sbConfig.key,"Authorization":"Bearer "+session.access_token},
body:JSON.stringify(order.payload)
});
const result=await response.json().catch(()=>({error:"پاسخ سرور قابل خواندن نیست"}));

if (
  response.ok ||
  result.code === "23505" ||
  (result.error || "").includes("orders_external_id_key")
) {
  order.sync_status = "synced";
  order.sync_error = "";
  order.server_id = result.order?.id || order.server_id || "";
} else {
  order.sync_status = "error";
  order.sync_error = result.error || ("خطای سرور: " + response.status);
}

}catch(e){order.sync_status="error";order.sync_error=e.message||"خطای ارتباط با سرور"}
save();
}
const failed=orders.filter(o=>o.sync_status==="pending"||o.sync_status==="error").length;
updateConnectionStatus(failed?failed+" سفارش هنوز ارسال نشده است.":"همه سفارش‌ها همگام‌سازی شدند.");
}
document.getElementById("orderForm").onsubmit=async e=>{
e.preventDefault();
const f=new FormData(e.target),it=items[Number(f.get("item"))],qty=Number(f.get("qty"));
if(!it||!Number.isFinite(qty)||qty<1){alert("کالا یا تعداد معتبر نیست.");return}
const externalId=makeId();
const payload={external_id:externalId,customer_code:String(f.get("customer")||"").trim(),device_id:deviceId,items:[{sku:"DEMO-"+(Number(f.get("item"))+1),name:it.name,qty:qty,price:it.price}],total_amount:it.price*qty};
orders.push({external_id:externalId,customer:String(f.get("customer")||"").trim(),item:it.name,qty:qty,total:it.price*qty,note:f.get("note"),date:new Date().toLocaleString("fa-IR"),sync_status:"pending",sync_error:"",payload:payload});
save();e.target.reset();page("orders");
alert("سفارش روی گوشی ذخیره شد. در صورت اتصال و ورود، ارسال می‌شود.");
await syncPendingOrders();
};
function net(){
document.getElementById("net").textContent=navigator.onLine?"اتصال اینترنت برقرار":"حالت آفلاین";
if(navigator.onLine)syncPendingOrders();else updateConnectionStatus("اینترنت قطع است؛ سفارش‌ها روی گوشی می‌مانند.");
}
addConnectionPanel();
addEventListener("online",net);addEventListener("offline",net);
if(sbConfig&&window.supabase){
sbClient=window.supabase.createClient(sbConfig.url,sbConfig.key,{auth:{persistSession:true,autoRefreshToken:true}});
ensureSession().then(s=>{if(s){updateConnectionStatus();syncPendingOrders()}});
}
net();render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
