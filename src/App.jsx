import { useState, useEffect, useCallback } from "react";
import {
  Bug, RefreshCw, GraduationCap, LayoutDashboard, Plus, LogOut,
  Clock, CheckCircle, AlertTriangle, ChevronRight, FileText,
  Ticket, ArrowLeft, Bell, Loader, Settings,
  BarChart2, Download, Search, User, Edit3, Save, X,
  Monitor, Wifi, Cpu, Calendar, ChevronLeft, ChevronDown
} from "lucide-react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const API = `${SUPABASE_URL}/rest/v1`;
const H = (extra={}) => ({
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
  ...extra
});
const sbGet   = async(t,q="")=>{const r=await fetch(`${API}/${t}?${q}`,{headers:H()});if(!r.ok)throw new Error(await r.text());return r.json();};
const sbPost  = async(t,b)   =>{const r=await fetch(`${API}/${t}`,{method:"POST",headers:H(),body:JSON.stringify(b)});if(!r.ok)throw new Error(await r.text());return r.json();};
const sbPatch = async(t,q,b) =>{const r=await fetch(`${API}/${t}?${q}`,{method:"PATCH",headers:H(),body:JSON.stringify(b)});if(!r.ok)throw new Error(await r.text());return r.json();};

// ─── Global Styles ────────────────────────────────────────────────────────────
const fl=document.createElement("link");fl.rel="stylesheet";
fl.href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
document.head.appendChild(fl);

const st=document.createElement("style");
st.textContent=`
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{width:100%;height:100%;min-height:100%;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f5f6fa;color:#1a1a2e;overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#c41e3a;border-radius:4px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
  .fu{animation:fadeUp .35s ease both}.fu1{animation:fadeUp .35s .05s ease both}
  .fu2{animation:fadeUp .35s .1s ease both}.fu3{animation:fadeUp .35s .15s ease both}
  .fu4{animation:fadeUp .35s .2s ease both}.si{animation:slideIn .3s ease both}
  .spin{animation:spin 1s linear infinite}
  input,select,textarea{outline:none;font-family:'Plus Jakarta Sans',sans-serif;}
  input:focus,select:focus,textarea:focus{border-color:#c41e3a!important;box-shadow:0 0 0 3px rgba(196,30,58,0.1)!important;}
  select option{background:#fff;color:#1a1a2e;}
  button{font-family:'Plus Jakarta Sans',sans-serif;}
  /* ── Desktop full-screen layout ── */
  @media(min-width:768px){
    .page-shell{display:grid!important;grid-template-columns:220px 1fr;min-height:100vh;max-width:100%!important;}
    .sidebar{display:flex!important;flex-direction:column;}
    .bottom-nav{display:none!important;}
    .main-topbar{left:220px!important;width:calc(100% - 220px)!important;transform:none!important;max-width:100%!important;right:0;}
    .main-scroll{max-width:960px;margin:0 auto;width:100%;}
    .login-shell{align-items:center;}
  }
`;
document.head.appendChild(st);

// ─── Constants ────────────────────────────────────────────────────────────────
const RED   = "#c41e3a";
const DARK  = "#8b0000";
const LIGHT = "#fff5f5";

// ── Category / Software / Hardware / Network tree ─────────────────────────────
const MAIN_CATEGORIES = {
  software: {
    label:"Software", icon:Monitor, color:"#0369a1", bg:"#eff6ff",
    assignTo:"Hari B S",
    children:{
      HIS:["OPD Registration","IPD Admission","Billing & Invoicing","Pharmacy","Lab / Pathology","Radiology","EMR / Patient Records","Discharge Summary","Appointment Scheduling","Insurance / TPA","MIS Reports","User Management"],
      ERP:["Finance & Accounts","Inventory & Stores","Purchase & Procurement","Fixed Assets","Budget Management"],
      PACS:["Radiology Viewer (DICOM)","Image Archive","Worklist Management","Report Generation","CD Burning","Integration with HIS"],
    }
  },
  hardware:{
    label:"Hardware", icon:Cpu, color:"#d97706", bg:"#fffbeb",
    assignTo:"Sachin Mahadik",
    children:{
      "Desktop / Laptop":["System Not Starting","Slow Performance","Blue Screen / Crash","Keyboard / Mouse Issue","Monitor Issue","Upgradation Request","New Installation"],
      "Printer / Scanner":["Not Printing","Paper Jam","Poor Print Quality","Scanner Not Working","Driver Issue","Toner / Cartridge"],
      "UPS / Power":["UPS Not Working","Battery Backup Low","Power Fluctuation","UPS Beeping","Shutdown Issue"],
      "Biometric / Access Control":["Fingerprint Not Reading","Device Offline","Door Not Opening","Enrollment Issue","Software Sync Issue"],
      "Other Hardware":["Projector","TV / Display","CCTV","Barcode Scanner","Other"],
    }
  },
  network:{
    label:"Network", icon:Wifi, color:"#7c3aed", bg:"#f5f3ff",
    assignTo:"Jagdish More",
    children:{
      "Internet / Connectivity":["No Internet","Slow Speed","Intermittent Drops","Website Blocked","VPN Issue"],
      "WiFi Issues":["No WiFi Signal","Weak Signal","Cannot Connect","IP Conflict","New WiFi Point Request"],
      "Switch / Router":["Port Not Working","Switch Down","VLAN Issue","Configuration Change","New Point Request"],
      "IP Phone / EPABX":["Phone Dead","No Dial Tone","Extension Issue","EPABX Programming","New Extension Request"],
      "Email / Server":["Email Not Working","Outlook Issue","Server Unreachable","Shared Drive Issue","Backup Issue"],
    }
  }
};

const ISSUE_TYPES=[
  {id:"bug",    label:"Bug / Error",         icon:Bug,          color:RED,      bg:"#fff0f0"},
  {id:"cr",     label:"Change Request",      icon:RefreshCw,    color:"#d97706",bg:"#fffbeb"},
  {id:"support",label:"Training / Support",  icon:GraduationCap,color:"#0369a1",bg:"#eff6ff"},
];

const DEPARTMENTS=["OPD","IPD","Emergency","Pharmacy","Radiology","Lab / Pathology","Billing","EMR","Admission","ICU","OT","HR","Administration","Blood Bank","CSSD","Dietary","Housekeeping","IT & Networking","Laundry","Maintenance","Medical Records","Mortuary","Neonatology","Nephrology","Neurology","Oncology","Physiotherapy","Security","Social Work","Transplant"];
const PRIORITIES=["Critical","High","Medium","Low"];
const STATUSES=["Open","In Progress","Resolved","Closed"];

const DEFAULT_SLA={
  software:{bug:{Critical:2,High:4,Medium:8,Low:24},cr:{Critical:48,High:72,Medium:72,Low:72},support:{Critical:1,High:1,Medium:2,Low:4}},
  hardware:{bug:{Critical:2,High:4,Medium:8,Low:24},cr:{Critical:24,High:48,Medium:72,Low:72},support:{Critical:1,High:2,Medium:4,Low:8}},
  network: {bug:{Critical:1,High:2,Medium:4,Low:8}, cr:{Critical:4, High:8, Medium:24,Low:48},support:{Critical:1,High:1,Medium:2,Low:4}},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId(){const d=new Date();return `TKT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(Math.floor(Math.random()*9000)+1000)}`;}
function isSlaBreached(t){return t.status!=="Resolved"&&t.status!=="Closed"&&new Date(t.sla_deadline)<new Date();}
function fmt(iso){if(!iso)return"—";return new Date(iso).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});}
function fmtDate(iso){if(!iso)return"—";return new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function timeLeft(iso){const d=new Date(iso)-new Date();if(d<=0)return"BREACHED";const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000);return h>0?`${h}h ${m}m left`:`${m}m left`;}
function getSlaHours(slaConfig,mainCat,issueType,priority){
  if(slaConfig.length>0){const row=slaConfig.find(s=>s.category===mainCat&&s.issue_type===issueType&&s.priority===priority);if(row)return row.resolution_hours;}
  return DEFAULT_SLA[mainCat]?.[issueType]?.[priority]||4;
}
function pct(num,den){return den===0?0:Math.round((num/den)*100);}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatusBadge({status}){
  const m={"Open":{c:"#0369a1",bg:"#eff6ff"},"In Progress":{c:"#d97706",bg:"#fffbeb"},"Resolved":{c:"#16a34a",bg:"#f0fdf4"},"Closed":{c:"#6b7280",bg:"#f9fafb"}};
  const s=m[status]||m["Open"];
  return <span style={{background:s.bg,color:s.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:`1px solid ${s.c}30`}}>{status}</span>;
}
function PriorityBadge({priority}){
  const m={Critical:{c:RED,bg:"#fff0f0"},High:{c:"#dc2626",bg:"#fef2f2"},Medium:{c:"#d97706",bg:"#fffbeb"},Low:{c:"#16a34a",bg:"#f0fdf4"}};
  const s=m[priority]||m["Medium"];
  return <span style={{background:s.bg,color:s.c,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,border:`1px solid ${s.c}30`}}>{priority}</span>;
}
function Spinner({size=24}){return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}><Loader size={size} color={RED} className="spin"/></div>;}
function ErrBox({msg}){return <div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 14px",color:RED,fontSize:13,margin:"8px 0"}}>{msg}</div>;}

const INP={background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:10,padding:"11px 14px",color:"#1a1a2e",width:"100%",fontSize:14,transition:"border .2s,box-shadow .2s"};
const SEL={...INP,appearance:"none",cursor:"pointer"};
const BTN={background:`linear-gradient(135deg,${RED},${DARK})`,border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",padding:"13px",width:"100%",boxShadow:"0 4px 16px rgba(196,30,58,0.25)",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8};

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangePicker({startDate,endDate,onChange}){
  const [open,setOpen]=useState(false);
  const [viewMonth,setViewMonth]=useState(new Date());
  const [selecting,setSelecting]=useState(null); // "start"|"end"

  const days=["Su","Mo","Tu","We","Th","Fr","Sa"];
  const monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function getDaysInMonth(y,m){return new Date(y,m+1,0).getDate();}
  function getFirstDay(y,m){return new Date(y,m,1).getDay();}

  function handleDayClick(day){
    const d=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),day);
    if(!selecting||selecting==="start"){
      onChange({start:d,end:null});
      setSelecting("end");
    } else {
      if(d<startDate){onChange({start:d,end:startDate});}
      else{onChange({start:startDate,end:d});}
      setSelecting(null);
      setOpen(false);
    }
  }

  function isInRange(day){
    const d=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),day);
    return startDate&&endDate&&d>=startDate&&d<=endDate;
  }
  function isStart(day){const d=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),day);return startDate&&d.toDateString()===startDate.toDateString();}
  function isEnd(day){const d=new Date(viewMonth.getFullYear(),viewMonth.getMonth(),day);return endDate&&d.toDateString()===endDate.toDateString();}

  const y=viewMonth.getFullYear(),m=viewMonth.getMonth();
  const totalDays=getDaysInMonth(y,m);
  const firstDay=getFirstDay(y,m);
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let d=1;d<=totalDays;d++)cells.push(d);

  const label=startDate?`${fmtDate(startDate.toISOString())}${endDate?" → "+fmtDate(endDate.toISOString()):"…"}`:"Select date range";

  return(
    <div style={{position:"relative",zIndex:100}}>
      <button onClick={()=>{setOpen(!open);setSelecting("start");}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#fff",border:`1.5px solid ${open?RED:"#e5e7eb"}`,borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,color:startDate?RED:"#6b7280",width:"100%",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><Calendar size={15} color={startDate?RED:"#9ca3af"}/>{label}</div>
        <ChevronDown size={14} color="#9ca3af"/>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",minWidth:280,zIndex:200}}>
          {/* Month nav */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <button onClick={()=>setViewMonth(new Date(y,m-1,1))} style={{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#6b7280"}}><ChevronLeft size={16}/></button>
            <span style={{fontWeight:700,fontSize:14,color:"#1a1a2e"}}>{monthNames[m]} {y}</span>
            <button onClick={()=>setViewMonth(new Date(y,m+1,1))} style={{background:"none",border:"none",cursor:"pointer",padding:4,borderRadius:6,color:"#6b7280"}}><ChevronRight size={16}/></button>
          </div>
          {/* Hint */}
          <p style={{fontSize:11,color:"#9ca3af",textAlign:"center",marginBottom:8}}>{selecting==="end"?"Now click end date":"Click start date"}</p>
          {/* Day headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {days.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#9ca3af",padding:"2px 0"}}>{d}</div>)}
          </div>
          {/* Day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {cells.map((d,i)=>{
              if(!d)return <div key={i}/>;
              const start=isStart(d),end=isEnd(d),inRange=isInRange(d);
              return(
                <button key={i} onClick={()=>handleDayClick(d)} style={{padding:"6px 2px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:start||end?800:500,background:start||end?RED:inRange?"#fde8ea":"transparent",color:start||end?"#fff":inRange?RED:"#1a1a2e",transition:"all .15s"}}>
                  {d}
                </button>
              );
            })}
          </div>
          {/* Quick presets */}
          <div style={{borderTop:"1px solid #f3f4f6",marginTop:12,paddingTop:12,display:"flex",gap:6,flexWrap:"wrap"}}>
            {[["Today",0,0],["Last 7 days",7,0],["Last 30 days",30,0],["This month","month","month"]].map(([label,from,to])=>(
              <button key={label} onClick={()=>{
                const now=new Date();
                let s,e=new Date(now);
                if(label==="This month"){s=new Date(now.getFullYear(),now.getMonth(),1);}
                else if(label==="Today"){s=new Date(now.getFullYear(),now.getMonth(),now.getDate());}
                else{s=new Date(now-from*86400000);}
                onChange({start:s,end:e});setOpen(false);setSelecting(null);
              }} style={{padding:"4px 10px",borderRadius:6,border:`1px solid #e5e7eb`,background:"#f9fafb",fontSize:11,fontWeight:600,color:"#374151",cursor:"pointer"}}>
                {label}
              </button>
            ))}
          </div>
          {startDate&&<button onClick={()=>{onChange({start:null,end:null});setSelecting("start");}} style={{marginTop:8,width:"100%",padding:"6px",border:"none",background:"none",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>✕ Clear</button>}
        </div>
      )}
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("user");
  const [empId,setEmpId]=useState("");
  const [empName,setEmpName]=useState("");
  const [mobile,setMobile]=useState("");
  const [adminUser,setAdminUser]=useState("");
  const [adminPass,setAdminPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [lookingUp,setLookingUp]=useState(false);

  async function lookupEmp(id){
    if(id.trim().length<3){setEmpName("");return;}
    setLookingUp(true);
    try{const rows=await sbGet("employees",`employee_id=eq.${encodeURIComponent(id.trim())}&is_active=eq.true`);
      if(rows.length>0)setEmpName(rows[0].name);else setEmpName("");}
    catch(e){setEmpName("");}
    setLookingUp(false);
  }

  async function handleLogin(){
    setErr("");setLoading(true);
    try{
      if(mode==="admin"){
        if(adminUser==="admin"&&adminPass==="admin123")onLogin({role:"admin",name:"Admin"});
        else setErr("Invalid admin credentials.");
      }else{
        if(!empName){setErr("Employee ID not found. Please check and try again.");setLoading(false);return;}
        if(mobile.length<10){setErr("Please enter a valid 10-digit mobile number.");setLoading(false);return;}
        const rows=await sbGet("employees",`employee_id=eq.${encodeURIComponent(empId.trim())}&is_active=eq.true`);
        if(rows.length>0)onLogin({role:"user",empId:rows[0].employee_id,emp_id:rows[0].employee_id,name:rows[0].name,department:rows[0].department,mobile});
        else setErr("Employee not found.");
      }
    }catch(e){setErr("Connection error. Please try again.");}
    setLoading(false);
  }

  return(
    <div className="login-shell" style={{minHeight:"100vh",width:"100%",background:"linear-gradient(135deg,#fff5f5 0%,#fff 50%,#fef2f2 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"fixed",top:0,left:0,right:0,height:5,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
      <div className="fu" style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:60,objectFit:"contain",marginBottom:16}}/>
          <h1 style={{color:"#1a1a2e",fontSize:22,fontWeight:800,letterSpacing:"-0.5px"}}>IT HelpDesk Portal</h1>
          <p style={{color:"#6b7280",fontSize:13,marginTop:4}}>Raise & track IT complaints</p>
        </div>
        <div style={{display:"flex",background:"#f3f4f6",borderRadius:12,padding:4,marginBottom:24,border:"1px solid #e5e7eb"}}>
          {[["user","Staff Login"],["admin","Admin Login"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setMode(v);setErr("");}} style={{flex:1,padding:"10px 0",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .2s",background:mode===v?`linear-gradient(135deg,${RED},${DARK})`:"transparent",color:mode===v?"#fff":"#6b7280",boxShadow:mode===v?"0 2px 8px rgba(196,30,58,0.2)":"none"}}>{l}</button>
          ))}
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:24,boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
          {mode==="user"?(
            <>
              <div style={{marginBottom:14}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Employee ID</label>
                <div style={{position:"relative"}}>
                  <input style={INP} placeholder="e.g. 9662" value={empId} onChange={e=>{setEmpId(e.target.value);lookupEmp(e.target.value);}} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                  {lookingUp&&<Loader size={14} color={RED} className="spin" style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}/>}
                </div>
                {empName&&(
                  <div style={{marginTop:8,background:LIGHT,border:`1px solid ${RED}30`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                    <User size={14} color={RED}/><span style={{color:RED,fontSize:13,fontWeight:600}}>{empName}</span>
                    <CheckCircle size={14} color="#16a34a" style={{marginLeft:"auto"}}/>
                  </div>
                )}
              </div>
              <div style={{marginBottom:20}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Mobile Number</label>
                <input style={INP} placeholder="10-digit mobile number" maxLength={10} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              </div>
            </>
          ):(
            <>
              <div style={{marginBottom:14}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Username</label>
                <input style={INP} placeholder="admin" value={adminUser} onChange={e=>setAdminUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              </div>
              <div style={{marginBottom:20}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
                <input style={INP} type="password" placeholder="••••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              </div>
            </>
          )}
          {err&&<ErrBox msg={err}/>}
          <button onClick={handleLogin} disabled={loading} style={BTN}>
            {loading?<><Loader size={16} className="spin"/>Verifying...</>:mode==="admin"?"Enter Dashboard →":"Login & Continue →"}
          </button>
        </div>
        <p style={{textAlign:"center",color:"#9ca3af",fontSize:12,marginTop:16}}>Aditya Birla Memorial Hospital · IT Department</p>
      </div>
    </div>
  );
}

// ─── Raise Ticket ─────────────────────────────────────────────────────────────
function RaiseTicket({user,slaConfig,onDone}){
  const [mainCat,setMainCat]=useState("");         // software|hardware|network
  const [subCat,setSubCat]=useState("");           // e.g. HIS / Desktop / WiFi
  const [module,setModule]=useState("");           // leaf item
  const [issueType,setIssueType]=useState(null);  // bug|cr|support
  const [priority,setPriority]=useState("Medium");
  const [dept,setDept]=useState(user.department||"");
  const [desc,setDesc]=useState("");
  const [submitted,setSubmitted]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const catDef=mainCat?MAIN_CATEGORIES[mainCat]:null;
  const subKeys=catDef?Object.keys(catDef.children):[];
  const modules=subCat&&catDef?catDef.children[subCat]||[]:[];

  async function submit(){
    if(!mainCat||!subCat||!module||!issueType||!dept||!desc.trim())return;
    setLoading(true);setErr("");
    try{
      const hrs=getSlaHours(slaConfig,mainCat,issueType,priority);
      const assignedTo=catDef.assignTo;
      const ticket={
        id:genId(),emp_id:user.empId,user_name:user.name,dept,
        software:mainCat,           // reuse 'software' col for main category
        category:subCat,            // subcategory
        module,                     // leaf / specific issue
        issue_type:issueType,       // bug|cr|support
        priority,description:desc,
        status:"Open",assigned_to:assignedTo,
        raised_at:new Date().toISOString(),
        sla_deadline:new Date(Date.now()+hrs*3600000).toISOString(),note:""
      };
      const result=await sbPost("tickets",ticket);
      const saved=result[0]||ticket;
      await sbPost("audit_log",{ticket_id:saved.id,action:"Ticket Created",changed_by:user.name,new_value:`Open — Assigned to ${assignedTo}`});
      setSubmitted(saved);
    }catch(e){setErr("Failed to submit. Please try again.");}
    setLoading(false);
  }

  if(submitted){
    const cat=MAIN_CATEGORIES[submitted.software];
    return(
      <div className="fu" style={{padding:20}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #16a34a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <CheckCircle size={30} color="#16a34a"/>
          </div>
          <h2 style={{color:"#1a1a2e",fontSize:20,fontWeight:800}}>Ticket Raised!</h2>
          <p style={{color:"#6b7280",fontSize:13,marginTop:4}}>Assigned to <strong>{submitted.assigned_to}</strong></p>
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:14,borderBottom:"1px solid #f3f4f6"}}>
            <span style={{color:RED,fontSize:15,fontWeight:800}}>{submitted.id}</span>
            <StatusBadge status="Open"/>
          </div>
          {[["Category",cat?.label],["Sub-Category",submitted.category],["Issue",submitted.module],["Assigned To",submitted.assigned_to],["SLA Deadline",fmt(submitted.sla_deadline)],["Priority",submitted.priority]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
              <span style={{color:"#6b7280",fontSize:13}}>{k}</span>
              <span style={{color:"#1a1a2e",fontSize:13,fontWeight:600}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:12,background:LIGHT,border:`1px solid ${RED}20`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
            <Clock size={14} color={RED}/><span style={{color:RED,fontSize:13,fontWeight:600}}>{timeLeft(submitted.sla_deadline)}</span>
          </div>
        </div>
        <button onClick={onDone} style={{...BTN,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}>View My Tickets →</button>
      </div>
    );
  }

  const canSubmit=mainCat&&subCat&&module&&issueType&&dept&&desc.trim()&&!loading;

  return(
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>Raise a Ticket</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>All fields are required</p>

      {/* Step 1 — Main Category */}
      <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>1. Category</p>
      <div className="fu1" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {Object.entries(MAIN_CATEGORIES).map(([key,cat])=>(
          <button key={key} onClick={()=>{setMainCat(key);setSubCat("");setModule("");}} style={{padding:"14px 8px",borderRadius:12,border:`2px solid ${mainCat===key?cat.color:"#e5e7eb"}`,background:mainCat===key?cat.bg:"#fff",cursor:"pointer",transition:"all .2s",textAlign:"center"}}>
            <cat.icon size={20} color={mainCat===key?cat.color:"#9ca3af"} style={{margin:"0 auto 6px"}}/>
            <p style={{color:mainCat===key?cat.color:"#1a1a2e",fontWeight:800,fontSize:13}}>{cat.label}</p>
          </button>
        ))}
      </div>

      {/* Step 2 — Sub Category */}
      {mainCat&&(
        <>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>2. Sub-Category</p>
          <div className="fu1" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {subKeys.map(sk=>(
              <button key={sk} onClick={()=>{setSubCat(sk);setModule("");}} style={{padding:"11px 14px",borderRadius:10,border:`2px solid ${subCat===sk?catDef.color:"#e5e7eb"}`,background:subCat===sk?catDef.bg:"#fff",cursor:"pointer",textAlign:"left",fontWeight:600,fontSize:13,color:subCat===sk?catDef.color:"#374151",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {sk}{subCat===sk&&<CheckCircle size={16} color={catDef.color}/>}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 3 — Specific Issue */}
      {subCat&&(
        <>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>3. Specific Issue</p>
          <div className="fu2" style={{marginBottom:20}}>
            <select style={SEL} value={module} onChange={e=>setModule(e.target.value)}>
              <option value="">Select issue</option>
              {modules.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </>
      )}

      {/* Step 4 — Issue Type */}
      {module&&(
        <>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>4. Issue Type</p>
          <div className="fu2" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {ISSUE_TYPES.map(it=>(
              <button key={it.id} onClick={()=>setIssueType(it.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:issueType===it.id?it.bg:"#fff",border:`2px solid ${issueType===it.id?it.color:"#e5e7eb"}`,borderRadius:12,cursor:"pointer",transition:"all .2s",textAlign:"left"}}>
                <div style={{width:34,height:34,borderRadius:9,background:issueType===it.id?it.color+"20":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <it.icon size={16} color={issueType===it.id?it.color:"#9ca3af"}/>
                </div>
                <div style={{flex:1}}>
                  <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{it.label}</p>
                  <p style={{color:it.color,fontSize:11,marginTop:1}}>SLA: {getSlaHours(slaConfig,mainCat,it.id,priority)}h ({priority})</p>
                </div>
                {issueType===it.id&&<CheckCircle size={16} color={it.color}/>}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 5 — Details */}
      {issueType&&(
        <div className="fu3" style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Priority</label>
            <div style={{display:"flex",gap:8}}>
              {PRIORITIES.map(p=>{const pc={Critical:RED,High:"#dc2626",Medium:"#d97706",Low:"#16a34a"};return(
                <button key={p} onClick={()=>setPriority(p)} style={{flex:1,padding:"10px 4px",borderRadius:8,border:`2px solid ${priority===p?pc[p]:"#e5e7eb"}`,background:priority===p?pc[p]+"15":"#fff",color:priority===p?pc[p]:"#9ca3af",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{p}</button>
              );})}
            </div>
          </div>
          <div>
            <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Department</label>
            <select style={SEL} value={dept} onChange={e=>setDept(e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Issue Description</label>
            <textarea style={{...INP,minHeight:100,resize:"vertical"}} placeholder="Describe the issue in detail..." value={desc} onChange={e=>setDesc(e.target.value)}/>
          </div>
          {/* Assignment info */}
          {catDef&&(
            <div style={{background:catDef.bg,border:`1px solid ${catDef.color}30`,borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
              <User size={14} color={catDef.color}/>
              <span style={{color:catDef.color,fontSize:13,fontWeight:600}}>Will be assigned to: <strong>{catDef.assignTo}</strong></span>
            </div>
          )}
        </div>
      )}

      {err&&<ErrBox msg={err}/>}
      <button onClick={submit} disabled={!canSubmit} className="fu4" style={{...BTN,marginTop:20,opacity:canSubmit?1:0.5,cursor:canSubmit?"pointer":"not-allowed"}}>
        {loading?<><Loader size={16} className="spin"/>Submitting...</>:"Submit Ticket →"}
      </button>
    </div>
  );
}

// ─── My Tickets ───────────────────────────────────────────────────────────────
function MyTickets({empId}){
  const [tickets,setTickets]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");

  useEffect(()=>{
    (async()=>{
      try{setTickets(await sbGet("tickets",`emp_id=eq.${empId}&order=raised_at.desc`));}
      catch(e){setErr("Failed to load tickets.");}
      setLoading(false);
    })();
  },[empId]);

  return(
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>My Tickets</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>{tickets.length} ticket{tickets.length!==1?"s":""} raised</p>
      {loading?<Spinner/>:err?<ErrBox msg={err}/>:tickets.length===0?(
        <div style={{textAlign:"center",padding:"48px 0"}}>
          <Ticket size={40} color="#d1d5db" style={{margin:"0 auto 12px"}}/>
          <p style={{color:"#9ca3af",fontSize:14}}>No tickets yet. Raise your first issue!</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {tickets.map((t,i)=>{
            const cat=MAIN_CATEGORIES[t.software];
            const breached=isSlaBreached(t);
            return(
              <div key={t.id} className="si" style={{animationDelay:`${i*.04}s`,background:breached?"#fff5f5":"#fff",border:`1.5px solid ${breached?"#fca5a5":"#e5e7eb"}`,borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{color:RED,fontSize:13,fontWeight:800}}>{t.id}</span>
                  <StatusBadge status={t.status}/>
                </div>
                <p style={{color:"#1a1a2e",fontSize:14,fontWeight:500,marginBottom:8,lineHeight:1.5}}>{t.description.substring(0,80)}{t.description.length>80?"…":""}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {cat&&<span style={{background:cat.bg,color:cat.color,fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:700}}>{cat.label}</span>}
                  <span style={{background:"#f3f4f6",color:"#374151",fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{t.category}</span>
                  <PriorityBadge priority={t.priority}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#9ca3af",fontSize:12}}>{fmt(t.raised_at)}</span>
                  <span style={{color:breached?RED:"#16a34a",fontSize:12,fontWeight:700}}>{timeLeft(t.sla_deadline)}</span>
                </div>
                {t.assigned_to&&<div style={{marginTop:8,fontSize:12,color:"#6b7280"}}>👤 {t.assigned_to}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── User App ─────────────────────────────────────────────────────────────────
function UserApp({user,slaConfig,onLogout}){
  const [tab,setTab]=useState("raise");
  return(
    <div className="page-shell" style={{minHeight:"100vh",background:"#f5f6fa",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",width:"100%"}}>
      {/* Top bar */}
      <div className="main-topbar" style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:10}}>
        <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
        <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
          <div style={{textAlign:"right"}}>
            <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13,lineHeight:1}}>{user.name}</p>
            <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>{user.department}</p>
          </div>
          <button onClick={onLogout} style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600}}>
            <LogOut size={14}/> Out
          </button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingTop:84,paddingBottom:90}}>
        {tab==="raise"?<RaiseTicket user={user} slaConfig={slaConfig} onDone={()=>setTab("mine")}/>:<MyTickets empId={user.empId}/>}
      </div>
      <div className="bottom-nav" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #e5e7eb",display:"flex",boxShadow:"0 -2px 8px rgba(0,0,0,0.06)"}}>
        {[["raise",Plus,"Raise Ticket"],["mine",Ticket,"My Tickets"]].map(([id,Icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px 0 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <Icon size={20} color={tab===id?RED:"#9ca3af"}/>
            <span style={{fontSize:11,color:tab===id?RED:"#9ca3af",fontWeight:tab===id?700:500}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Ticket Detail (Admin) ────────────────────────────────────────────────────
function TicketDetail({ticketId,tickets,onBack,onUpdate}){
  const t=tickets.find(x=>x.id===ticketId);
  const [noteInput,setNoteInput]=useState(t?.note||"");
  const [saving,setSaving]=useState(false);
  const [audit,setAudit]=useState([]);
  const [loadingAudit,setLoadingAudit]=useState(true);

  useEffect(()=>{
    (async()=>{
      try{setAudit(await sbGet("audit_log",`ticket_id=eq.${ticketId}&order=timestamp.asc`));}
      catch(e){}
      setLoadingAudit(false);
    })();
  },[ticketId]);

  if(!t){onBack();return null;}
  const cat=MAIN_CATEGORIES[t.software];
  const breachedT=isSlaBreached(t);

  const ASSIGNEES=["Hari B S","Sachin Mahadik","Jagdish More"];

  async function updateField(field,value){
    setSaving(true);
    try{
      const patch={[field]:value};
      if(field==="status"&&value==="Resolved")patch.resolved_at=new Date().toISOString();
      if(field==="status"&&value!=="Resolved")patch.resolved_at=null;
      await sbPatch("tickets",`id=eq.${t.id}`,patch);
      await sbPost("audit_log",{ticket_id:t.id,action:`${field==="status"?"Status":field==="assigned_to"?"Assignment":"Field"} Changed`,changed_by:"Admin",old_value:t[field],new_value:value});
      onUpdate(t.id,patch);
      if(field==="status"||field==="assigned_to")setAudit(prev=>[...prev,{action:`${field==="status"?"Status":"Assignment"} Changed`,changed_by:"Admin",old_value:t[field],new_value:value,timestamp:new Date().toISOString()}]);
    }catch(e){alert("Failed to update.");}
    setSaving(false);
  }

  async function saveNote(){
    setSaving(true);
    try{
      await sbPatch("tickets",`id=eq.${t.id}`,{note:noteInput});
      await sbPost("audit_log",{ticket_id:t.id,action:"Note Updated",changed_by:"Admin",new_value:noteInput});
      onUpdate(t.id,{note:noteInput});
    }catch(e){alert("Failed to save note.");}
    setSaving(false);
  }

  return(
    <div style={{padding:20}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,fontWeight:600,marginBottom:16,padding:0}}>
        <ArrowLeft size={16}/> Back to tickets
      </button>
      <div style={{background:breachedT?"#fff5f5":"#fff",border:`1.5px solid ${breachedT?"#fca5a5":"#e5e7eb"}`,borderRadius:16,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <span style={{color:RED,fontSize:15,fontWeight:800}}>{t.id}</span>
          <StatusBadge status={t.status}/>
        </div>
        {breachedT&&<div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={14} color={RED}/><span style={{color:RED,fontSize:12,fontWeight:700}}>SLA BREACHED</span></div>}
        <p style={{color:"#1a1a2e",fontSize:14,lineHeight:1.6,marginBottom:16}}>{t.description}</p>
        {[["Raised By",t.user_name],["Department",t.dept],["Category",cat?.label],["Sub-Category",t.category],["Issue",t.module],["Priority",t.priority],["Assigned To",t.assigned_to],["Raised At",fmt(t.raised_at)],["SLA Deadline",fmt(t.sla_deadline)],["SLA Status",timeLeft(t.sla_deadline)],["Resolved At",fmt(t.resolved_at)]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
            <span style={{color:"#6b7280",fontSize:13}}>{k}</span>
            <span style={{color:k==="SLA Status"&&breachedT?RED:"#1a1a2e",fontSize:13,fontWeight:600}}>{v||"—"}</span>
          </div>
        ))}
      </div>

      {/* Reassign */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Assign To</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {ASSIGNEES.map(a=>(
            <button key={a} onClick={()=>updateField("assigned_to",a)} disabled={saving} style={{padding:"8px 14px",borderRadius:8,border:`2px solid ${t.assigned_to===a?RED:"#e5e7eb"}`,background:t.assigned_to===a?LIGHT:"#fff",color:t.assigned_to===a?RED:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{a}</button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Update Status</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>updateField("status",s)} disabled={saving} style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${t.status===s?RED:"#e5e7eb"}`,background:t.status===s?LIGHT:"#fff",color:t.status===s?RED:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{s}</button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Internal Note</p>
        {t.note&&<p style={{color:"#374151",fontSize:13,marginBottom:10,padding:"8px 10px",background:"#f0fdf4",borderRadius:8,borderLeft:"3px solid #16a34a"}}>{t.note}</p>}
        <textarea style={{...INP,minHeight:70,resize:"vertical"}} value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Add internal note..."/>
        <button onClick={saveNote} disabled={saving} style={{marginTop:8,padding:"9px 18px",background:LIGHT,border:`1.5px solid ${RED}`,borderRadius:8,color:RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          {saving?<><Loader size={14} className="spin"/>Saving...</>:<><Save size={14}/>Save Note</>}
        </button>
      </div>

      {/* Audit */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Audit Trail</p>
        {loadingAudit?<Spinner size={20}/>:audit.length===0?<p style={{color:"#9ca3af",fontSize:13}}>No audit records yet.</p>:(
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {audit.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:12,paddingBottom:12}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:RED,flexShrink:0,marginTop:3}}/>
                  {i<audit.length-1&&<div style={{width:2,flex:1,background:"#f3f4f6",marginTop:4}}/>}
                </div>
                <div style={{flex:1}}>
                  <p style={{color:"#1a1a2e",fontSize:13,fontWeight:600}}>{a.action}</p>
                  {a.old_value&&<p style={{color:"#9ca3af",fontSize:12}}>{a.old_value} → <span style={{color:"#16a34a",fontWeight:600}}>{a.new_value}</span></p>}
                  {!a.old_value&&a.new_value&&<p style={{color:"#6b7280",fontSize:12}}>{String(a.new_value).substring(0,60)}</p>}
                  <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>{fmt(a.timestamp)} · {a.changed_by}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function Reports({tickets}){
  const [dateRange,setDateRange]=useState({start:new Date(Date.now()-7*86400000),end:new Date()});

  const filtered=tickets.filter(t=>{
    const d=new Date(t.raised_at);
    const s=dateRange.start?new Date(dateRange.start.getFullYear(),dateRange.start.getMonth(),dateRange.start.getDate()):null;
    const e=dateRange.end?new Date(dateRange.end.getFullYear(),dateRange.end.getMonth(),dateRange.end.getDate(),23,59,59):null;
    return(!s||d>=s)&&(!e||d<=e);
  });

  const total=filtered.length;
  const resolved=filtered.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
  const resolvedInTat=filtered.filter(t=>(t.status==="Resolved"||t.status==="Closed")&&t.resolved_at&&new Date(t.resolved_at)<=new Date(t.sla_deadline)).length;
  const breached=filtered.filter(t=>isSlaBreached(t)||(t.resolved_at&&new Date(t.resolved_at)>new Date(t.sla_deadline))).length;
  const avgRes=resolved>0?Math.round(filtered.filter(t=>t.resolved_at).reduce((a,t)=>a+(new Date(t.resolved_at)-new Date(t.raised_at))/3600000,0)/resolved):0;
  const slaCompliance=pct(resolvedInTat,resolved||1);
  const resolutionRate=pct(resolved,total||1);

  // By main category
  const byCat=Object.entries(MAIN_CATEGORIES).map(([key,cat])=>{
    const catTickets=filtered.filter(t=>t.software===key);
    const catResolved=catTickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
    const catInTat=catTickets.filter(t=>(t.status==="Resolved"||t.status==="Closed")&&t.resolved_at&&new Date(t.resolved_at)<=new Date(t.sla_deadline)).length;
    return{key,label:cat.label,color:cat.color,bg:cat.bg,count:catTickets.length,resolved:catResolved,inTat:catInTat,compliance:pct(catInTat,catResolved||1)};
  });

  // By assignee
  const assignees=["Hari B S","Sachin Mahadik","Jagdish More"];
  const byAssignee=assignees.map(a=>{
    const at=filtered.filter(t=>t.assigned_to===a);
    const ar=at.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
    const ai=at.filter(t=>(t.status==="Resolved"||t.status==="Closed")&&t.resolved_at&&new Date(t.resolved_at)<=new Date(t.sla_deadline)).length;
    return{name:a,total:at.length,resolved:ar,inTat:ai,compliance:pct(ai,ar||1)};
  });

  // By priority
  const byPriority=PRIORITIES.map(p=>{
    const pt=filtered.filter(t=>t.priority===p);
    const pr=pt.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
    const pi=pt.filter(t=>(t.status==="Resolved"||t.status==="Closed")&&t.resolved_at&&new Date(t.resolved_at)<=new Date(t.sla_deadline)).length;
    return{priority:p,total:pt.length,resolved:pr,inTat:pi,compliance:pct(pi,pr||1)};
  });

  const maxCat=Math.max(...byCat.map(c=>c.count),1);

  function complianceColor(pct){return pct>=90?"#16a34a":pct>=70?"#d97706":"#dc2626";}

  function downloadCSV(){
    const rows=[
      ["ABMH IT HelpDesk Report"],
      [`Period: ${dateRange.start?fmtDate(dateRange.start.toISOString()):"All"} to ${dateRange.end?fmtDate(dateRange.end.toISOString()):"Today"}`],
      [`Total: ${total} | Resolved: ${resolved} | SLA Compliance: ${slaCompliance}% | Avg Resolution: ${avgRes}h`],
      [],
      ["Ticket ID","Raised By","Dept","Category","Sub-Category","Issue","Priority","Status","Assigned To","Raised At","SLA Deadline","Resolved At","Within TAT"],
      ...filtered.map(t=>[t.id,t.user_name,t.dept,MAIN_CATEGORIES[t.software]?.label||t.software,t.category,t.module,t.priority,t.status,t.assigned_to||"—",fmt(t.raised_at),fmt(t.sla_deadline),fmt(t.resolved_at),(!t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline))?"Yes":"No"])
    ];
    const csv=rows.map(r=>Array.isArray(r)?r.map(c=>`"${String(c||"").replace(/"/g,'""')}"`).join(","):r).join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download=`ABMH_Report_${new Date().toISOString().split("T")[0]}.csv`;a.click();
  }

  function downloadPDF(){
    const html=`<html><head><style>
      body{font-family:Arial,sans-serif;padding:20px;color:#1a1a2e;font-size:12px;}
      h1{color:#c41e3a;font-size:18px;margin-bottom:4px;}
      .summary{display:flex;gap:12px;margin:16px 0;}
      .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;flex:1;text-align:center;}
      .card .num{font-size:22px;font-weight:800;color:#c41e3a;}
      .card .lbl{font-size:11px;color:#6b7280;margin-top:2px;}
      table{width:100%;border-collapse:collapse;margin-top:12px;font-size:11px;}
      th{background:#c41e3a;color:#fff;padding:7px 8px;text-align:left;}
      td{padding:6px 8px;border-bottom:1px solid #f3f4f6;}
      tr:nth-child(even) td{background:#f9fafb;}
      .green{color:#16a34a;font-weight:700;} .orange{color:#d97706;font-weight:700;} .red{color:#dc2626;font-weight:700;}
    </style></head><body>
      <h1>ABMH IT HelpDesk — Ticket Report</h1>
      <p style="color:#6b7280">Period: ${dateRange.start?fmtDate(dateRange.start.toISOString()):"All"} to ${dateRange.end?fmtDate(dateRange.end.toISOString()):"Today"} &nbsp;|&nbsp; Generated: ${new Date().toLocaleString("en-IN")}</p>
      <div class="summary">
        <div class="card"><div class="num">${total}</div><div class="lbl">Total Tickets</div></div>
        <div class="card"><div class="num">${resolved}</div><div class="lbl">Resolved</div></div>
        <div class="card"><div class="num" style="color:${complianceColor(slaCompliance)}">${slaCompliance}%</div><div class="lbl">SLA Compliance</div></div>
        <div class="card"><div class="num">${avgRes}h</div><div class="lbl">Avg Resolution</div></div>
        <div class="card"><div class="num" style="color:#dc2626">${breached}</div><div class="lbl">SLA Breached</div></div>
      </div>
      <h2 style="color:#374151;font-size:14px;margin:16px 0 8px">Team Performance</h2>
      <table><tr><th>Assignee</th><th>Total</th><th>Resolved</th><th>Within TAT</th><th>SLA %</th></tr>
        ${byAssignee.map(a=>`<tr><td>${a.name}</td><td>${a.total}</td><td>${a.resolved}</td><td>${a.inTat}</td><td class="${a.compliance>=90?"green":a.compliance>=70?"orange":"red"}">${a.compliance}%</td></tr>`).join("")}
      </table>
      <h2 style="color:#374151;font-size:14px;margin:16px 0 8px">All Tickets</h2>
      <table><tr><th>Ticket ID</th><th>Raised By</th><th>Category</th><th>Sub-Cat</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Within TAT</th></tr>
        ${filtered.map(t=>`<tr><td>${t.id}</td><td>${t.user_name}</td><td>${MAIN_CATEGORIES[t.software]?.label||t.software}</td><td>${t.category}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.assigned_to||"—"}</td><td>${(!t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline))?"✅ Yes":"❌ No"}</td></tr>`).join("")}
      </table>
    </body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
  }

  return(
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>Reports & Analytics</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:16}}>SLA compliance, TAT and performance metrics</p>

      {/* Date Range Picker */}
      <div className="fu1" style={{marginBottom:20}}>
        <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Date Range</label>
        <DateRangePicker startDate={dateRange.start} endDate={dateRange.end} onChange={({start,end})=>setDateRange({start,end})}/>
      </div>

      {/* KPI Summary cards */}
      <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[
          {label:"Total Tickets",val:total,color:RED},
          {label:"Resolved",val:resolved,color:"#16a34a"},
          {label:"SLA Compliance",val:`${slaCompliance}%`,color:complianceColor(slaCompliance)},
          {label:"Avg Resolution",val:`${avgRes}h`,color:"#0369a1"},
          {label:"Within TAT",val:resolvedInTat,color:"#16a34a"},
          {label:"SLA Breached",val:breached,color:"#dc2626"},
        ].map((s,i)=>(
          <div key={s.label} className="fu" style={{animationDelay:`${i*.05}s`,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <p style={{color:s.color,fontSize:22,fontWeight:800,lineHeight:1}}>{s.val}</p>
            <p style={{color:"#6b7280",fontSize:12,marginTop:4}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Resolution Rate bar */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>Overall Resolution Rate</p>
          <span style={{color:complianceColor(resolutionRate),fontWeight:800,fontSize:16}}>{resolutionRate}%</span>
        </div>
        <div style={{height:12,background:"#f3f4f6",borderRadius:6,overflow:"hidden"}}>
          <div style={{width:`${resolutionRate}%`,height:"100%",background:`linear-gradient(90deg,${RED},${DARK})`,borderRadius:6,transition:"width .8s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <span style={{color:"#9ca3af",fontSize:11}}>{resolved} of {total} tickets resolved</span>
          <span style={{color:complianceColor(slaCompliance),fontSize:11,fontWeight:700}}>{slaCompliance}% within SLA</span>
        </div>
      </div>

      {/* By Category */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>By Category — SLA Compliance</p>
        {byCat.map(c=>(
          <div key={c.key} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{background:c.bg,color:c.color,fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:700}}>{c.label}</span>
                <span style={{color:"#6b7280",fontSize:12}}>{c.count} tickets</span>
              </div>
              <span style={{color:complianceColor(c.compliance),fontWeight:800,fontSize:13}}>{c.compliance}%</span>
            </div>
            <div style={{height:8,background:"#f3f4f6",borderRadius:4,overflow:"hidden"}}>
              <div style={{width:`${(c.count/maxCat)*100}%`,height:"100%",background:c.color,borderRadius:4,transition:"width .6s"}}/>
            </div>
            <div style={{display:"flex",gap:12,marginTop:4}}>
              <span style={{color:"#9ca3af",fontSize:11}}>Resolved: {c.resolved}</span>
              <span style={{color:"#16a34a",fontSize:11}}>Within TAT: {c.inTat}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Team Performance */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>Team Performance</p>
        {byAssignee.map(a=>(
          <div key={a.name} style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid #f9fafb"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:LIGHT,border:`1px solid ${RED}30`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <User size={13} color={RED}/>
                </div>
                <span style={{fontWeight:700,fontSize:13,color:"#1a1a2e"}}>{a.name}</span>
              </div>
              <span style={{color:complianceColor(a.compliance),fontWeight:800,fontSize:14}}>{a.compliance}% SLA</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Total",a.total,"#374151"],["Resolved",a.resolved,"#16a34a"],["In TAT",a.inTat,"#0369a1"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#f9fafb",borderRadius:8,padding:"8px",textAlign:"center"}}>
                  <p style={{color:c,fontWeight:800,fontSize:16}}>{v}</p>
                  <p style={{color:"#9ca3af",fontSize:10,marginTop:2}}>{l}</p>
                </div>
              ))}
            </div>
            <div style={{height:6,background:"#f3f4f6",borderRadius:3,overflow:"hidden",marginTop:8}}>
              <div style={{width:`${a.compliance}%`,height:"100%",background:complianceColor(a.compliance),borderRadius:3,transition:"width .6s"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* Priority breakdown */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>By Priority — TAT Compliance</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {byPriority.map(p=>{
            const pc={Critical:RED,High:"#dc2626",Medium:"#d97706",Low:"#16a34a"};
            return(
              <div key={p.priority} style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:"12px"}}>
                <PriorityBadge priority={p.priority}/>
                <p style={{color:"#1a1a2e",fontWeight:800,fontSize:18,marginTop:8}}>{p.total}</p>
                <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>tickets</p>
                <div style={{marginTop:8,height:5,background:"#e5e7eb",borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${p.compliance}%`,height:"100%",background:complianceColor(p.compliance),borderRadius:3}}/>
                </div>
                <p style={{color:complianceColor(p.compliance),fontSize:11,fontWeight:700,marginTop:4}}>{p.compliance}% within SLA</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Download buttons */}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <button onClick={downloadCSV} style={{flex:1,padding:"12px 0",background:"#f0fdf4",border:"1.5px solid #16a34a",borderRadius:10,color:"#16a34a",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Download size={16}/> Excel (CSV)
        </button>
        <button onClick={downloadPDF} style={{flex:1,padding:"12px 0",background:LIGHT,border:`1.5px solid ${RED}`,borderRadius:10,color:RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Download size={16}/> PDF / Print
        </button>
      </div>

      {/* Ticket list */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>All Tickets ({filtered.length})</p>
        {filtered.length===0?<p style={{color:"#9ca3af",fontSize:13}}>No tickets in this period.</p>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(t=>{
              const cat=MAIN_CATEGORIES[t.software];
              const met=!t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline);
              return(
                <div key={t.id} style={{background:"#f9fafb",borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{color:RED,fontSize:12,fontWeight:700}}>{t.id}</p>
                    <p style={{color:"#374151",fontSize:12}}>{t.user_name} · {cat?.label||t.software} · {t.assigned_to||"—"}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <StatusBadge status={t.status}/>
                    <p style={{color:met?"#16a34a":"#dc2626",fontSize:11,fontWeight:600,marginTop:4}}>{met?"✓ Within TAT":"✗ Breached"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SLA Settings ─────────────────────────────────────────────────────────────
function SlaSettings({slaConfig,onUpdate}){
  const [editMode,setEditMode]=useState(false);
  const [password,setPassword]=useState("");
  const [verified,setVerified]=useState(false);
  const [local,setLocal]=useState(slaConfig);
  const [saving,setSaving]=useState(false);
  const [err,setErr]=useState("");

  function verify(){if(password==="admin123"){setVerified(true);setErr("");}else setErr("Incorrect password.");}

  async function saveAll(){
    setSaving(true);
    try{
      for(const row of local){
        await sbPatch("sla_config",`id=eq.${row.id}`,{resolution_hours:row.resolution_hours,updated_by:"Admin",updated_at:new Date().toISOString()});
      }
      onUpdate(local);setEditMode(false);setVerified(false);setPassword("");
    }catch(e){setErr("Failed to save SLA changes.");}
    setSaving(false);
  }

  return(
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>SLA Configuration</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>Priority-based resolution times (hours)</p>
      {!editMode?(
        <>
          {Object.entries(MAIN_CATEGORIES).map(([key,cat])=>(
            <div key={key} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><cat.icon size={16} color={cat.color}/></div>
                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>{cat.label}</p>
              </div>
              {ISSUE_TYPES.map(it=>PRIORITIES.map(p=>{
                const row=local.find(s=>s.category===key&&s.issue_type===it.id&&s.priority===p);
                return(
                  <div key={`${it.id}-${p}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f9fafb"}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{color:"#6b7280",fontSize:12}}>{it.label}</span>
                      <PriorityBadge priority={p}/>
                    </div>
                    <span style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{row?.resolution_hours||DEFAULT_SLA[key]?.[it.id]?.[p]||"—"}h</span>
                  </div>
                );
              }))}
            </div>
          ))}
          <button onClick={()=>setEditMode(true)} style={BTN}><Edit3 size={16}/> Edit SLA Values</button>
        </>
      ):!verified?(
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{color:"#1a1a2e",fontWeight:700,fontSize:15,marginBottom:6}}>Admin Verification Required</p>
          <input style={{...INP,marginBottom:12}} type="password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&verify()}/>
          {err&&<ErrBox msg={err}/>}
          <button onClick={verify} style={BTN}>Verify & Edit</button>
          <button onClick={()=>{setEditMode(false);setPassword("");setErr("");}} style={{...BTN,marginTop:8,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}>Cancel</button>
        </div>
      ):(
        <>
          <p style={{color:"#9ca3af",fontSize:12,marginBottom:16}}>Note: SLA values in database will be used. If no DB record exists, defaults above apply.</p>
          {err&&<ErrBox msg={err}/>}
          <button onClick={saveAll} disabled={saving} style={BTN}>{saving?<><Loader size={16} className="spin"/>Saving...</>:<><Save size={16}/>Save SLA Changes</>}</button>
          <button onClick={()=>{setEditMode(false);setVerified(false);setPassword("");setLocal(slaConfig);}} style={{...BTN,marginTop:8,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}><X size={16}/>Cancel</button>
        </>
      )}
    </div>
  );
}

// ─── Admin App ────────────────────────────────────────────────────────────────
function AdminApp({onLogout}){
  const [tab,setTab]=useState("dashboard");
  const [tickets,setTickets]=useState([]);
  const [slaConfig,setSlaConfig]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");
  const [selected,setSelected]=useState(null);
  const [filterCat,setFilterCat]=useState("all");
  const [filterStatus,setFilterStatus]=useState("all");
  const [filterAssignee,setFilterAssignee]=useState("all");
  const [search,setSearch]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [t,s]=await Promise.all([sbGet("tickets","order=raised_at.desc"),sbGet("sla_config","order=id.asc")]);
      setTickets(t);setSlaConfig(s);
    }catch(e){setErr("Failed to load data.");}
    setLoading(false);
  },[]);

  useEffect(()=>{load();},[load]);
  function onUpdate(id,changes){setTickets(prev=>prev.map(t=>t.id===id?{...t,...changes}:t));}

  const total=tickets.length;
  const open=tickets.filter(t=>t.status==="Open").length;
  const resolved=tickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
  const breached=tickets.filter(t=>isSlaBreached(t)).length;

  const filtered=tickets.filter(t=>
    (filterCat==="all"||t.software===filterCat)&&
    (filterStatus==="all"||t.status===filterStatus)&&
    (filterAssignee==="all"||t.assigned_to===filterAssignee)&&
    (!search||t.id.toLowerCase().includes(search.toLowerCase())||t.user_name?.toLowerCase().includes(search.toLowerCase())||t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const NAV=[["dashboard",LayoutDashboard,"Dashboard"],["tickets",FileText,"Tickets"],["reports",BarChart2,"Reports"],["sla",Settings,"SLA"]];

  // Sidebar for desktop
  const Sidebar=()=>(
    <div className="sidebar" style={{display:"none",background:"#fff",borderRight:"1px solid #e5e7eb",flexDirection:"column",height:"100vh",position:"sticky",top:0}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb"}}>
        <img src="/abmh-logo-1.png" alt="ABMH" style={{height:36,objectFit:"contain"}}/>
        <p style={{color:"#9ca3af",fontSize:11,marginTop:6}}>Admin Dashboard</p>
      </div>
      {NAV.map(([id,Icon,label])=>(
        <button key={id} onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"14px 20px",border:"none",cursor:"pointer",background:tab===id?LIGHT:"transparent",color:tab===id?RED:"#6b7280",fontWeight:tab===id?700:500,fontSize:14,borderLeft:`3px solid ${tab===id?RED:"transparent"}`,transition:"all .2s",textAlign:"left"}}>
          <Icon size={18}/>{label}
        </button>
      ))}
      <div style={{marginTop:"auto",padding:20,borderTop:"1px solid #e5e7eb"}}>
        <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,fontWeight:600}}>
          <LogOut size={16}/>Logout
        </button>
      </div>
    </div>
  );

  if(selected)return(
    <div className="page-shell" style={{minHeight:"100vh",background:"#f5f6fa",width:"100%"}}>
      <Sidebar/>
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
        <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
          <span style={{color:"#1a1a2e",fontWeight:700,fontSize:14,flex:1}}>Ticket Detail</span>
          <button onClick={load} style={{background:LIGHT,border:`1px solid ${RED}30`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:RED,fontSize:12,fontWeight:600}}>↻ Refresh</button>
        </div>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <TicketDetail ticketId={selected} tickets={tickets} onBack={()=>setSelected(null)} onUpdate={onUpdate}/>
        </div>
      </div>
    </div>
  );

  return(
    <div className="page-shell" style={{minHeight:"100vh",background:"#f5f6fa",display:"flex",flexDirection:"column",width:"100%"}}>
      <Sidebar/>
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div className="main-topbar" style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:10}}>
          <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
          <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13,lineHeight:1}}>Admin Dashboard</p>
              {breached>0&&<p style={{color:RED,fontSize:11,marginTop:2}}>{breached} SLA breach{breached>1?"es":""}</p>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={load} style={{background:LIGHT,border:`1px solid ${RED}30`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:RED,fontSize:13,fontWeight:700}}>↻</button>
              <button onClick={onLogout} style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600}}><LogOut size={14}/></button>
            </div>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",paddingTop:84,paddingBottom:70}}>
          {loading?<Spinner/>:err?<div style={{padding:20}}><ErrBox msg={err}/></div>:(
            <div style={{maxWidth:960,margin:"0 auto"}}>
              {tab==="dashboard"&&(
                <div style={{padding:20}}>
                  <div className="fu" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                    {[{label:"Total",val:total,color:RED,icon:Ticket},{label:"Open",val:open,color:"#d97706",icon:Bell},{label:"Resolved",val:resolved,color:"#16a34a",icon:CheckCircle},{label:"SLA Breached",val:breached,color:"#dc2626",icon:AlertTriangle}].map((s,i)=>(
                      <div key={s.label} className="fu" style={{animationDelay:`${i*.06}s`,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                        <div style={{width:38,height:38,borderRadius:10,background:`${s.color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><s.icon size={18} color={s.color}/></div>
                        <div><p style={{color:s.color,fontSize:22,fontWeight:800,lineHeight:1}}>{s.val}</p><p style={{color:"#6b7280",fontSize:12,marginTop:3}}>{s.label}</p></div>
                      </div>
                    ))}
                  </div>
                  {/* Category summary */}
                  <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
                    {Object.entries(MAIN_CATEGORIES).map(([key,cat])=>{
                      const count=tickets.filter(t=>t.software===key).length;
                      return(
                        <div key={key} style={{background:cat.bg,border:`1.5px solid ${cat.color}30`,borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
                          <cat.icon size={20} color={cat.color} style={{margin:"0 auto 6px"}}/>
                          <p style={{color:cat.color,fontSize:20,fontWeight:800}}>{count}</p>
                          <p style={{color:"#374151",fontSize:12,fontWeight:600,marginTop:2}}>{cat.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* SLA breached */}
                  {breached>0&&(
                    <div className="fu3" style={{background:"#fff5f5",border:"1.5px solid #fca5a5",borderRadius:14,padding:16,marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                        <AlertTriangle size={16} color={RED}/>
                        <p style={{color:RED,fontWeight:700,fontSize:14}}>SLA Breached Tickets</p>
                      </div>
                      {tickets.filter(t=>isSlaBreached(t)).map(t=>(
                        <div key={t.id} onClick={()=>setSelected(t.id)} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #fca5a5"}}>
                          <div>
                            <p style={{color:"#1a1a2e",fontSize:13,fontWeight:700}}>{t.id}</p>
                            <p style={{color:"#6b7280",fontSize:12}}>{t.user_name} · {t.dept} · {t.assigned_to||"Unassigned"}</p>
                          </div>
                          <ChevronRight size={16} color="#9ca3af"/>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Recent */}
                  <div className="fu3" style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                    <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>Recent Tickets</p>
                    {tickets.slice(0,5).map(t=>(
                      <div key={t.id} onClick={()=>setSelected(t.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f9fafb",cursor:"pointer"}}>
                        <div>
                          <p style={{color:RED,fontSize:12,fontWeight:700}}>{t.id}</p>
                          <p style={{color:"#374151",fontSize:12}}>{t.user_name} · {MAIN_CATEGORIES[t.software]?.label||t.software} · <span style={{color:"#9ca3af"}}>{t.assigned_to||"—"}</span></p>
                        </div>
                        <StatusBadge status={t.status}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab==="tickets"&&(
                <div style={{padding:20}}>
                  <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:16}}>All Tickets</h2>
                  <div style={{position:"relative",marginBottom:12}}>
                    <Search size={14} color="#9ca3af" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
                    <input style={{...INP,paddingLeft:34}} placeholder="Search tickets..." value={search} onChange={e=>setSearch(e.target.value)}/>
                  </div>
                  <div className="fu1" style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
                    <select style={{...SEL,padding:"8px 10px",fontSize:12,width:"auto"}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                      <option value="all">All Categories</option>
                      {Object.entries(MAIN_CATEGORIES).map(([k,c])=><option key={k} value={k}>{c.label}</option>)}
                    </select>
                    <select style={{...SEL,padding:"8px 10px",fontSize:12,width:"auto"}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    <select style={{...SEL,padding:"8px 10px",fontSize:12,width:"auto"}} value={filterAssignee} onChange={e=>setFilterAssignee(e.target.value)}>
                      <option value="all">All Assignees</option>
                      {["Hari B S","Sachin Mahadik","Jagdish More"].map(a=><option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <p className="fu2" style={{color:"#9ca3af",fontSize:12,marginBottom:12}}>{filtered.length} ticket{filtered.length!==1?"s":""}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {filtered.map((t,i)=>{
                      const cat=MAIN_CATEGORIES[t.software];
                      const breachedT=isSlaBreached(t);
                      return(
                        <div key={t.id} onClick={()=>setSelected(t.id)} className="si" style={{animationDelay:`${i*.04}s`,background:breachedT?"#fff5f5":"#fff",border:`1.5px solid ${breachedT?"#fca5a5":"#e5e7eb"}`,borderRadius:14,padding:16,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                            <span style={{color:RED,fontSize:12,fontWeight:800}}>{t.id}</span>
                            <StatusBadge status={t.status}/>
                          </div>
                          <p style={{color:"#1a1a2e",fontSize:13,fontWeight:500,marginBottom:8,lineHeight:1.4}}>{t.description.substring(0,70)}{t.description.length>70?"…":""}</p>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {cat&&<span style={{background:cat.bg,color:cat.color,fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:700}}>{cat.label}</span>}
                              <span style={{background:"#f3f4f6",color:"#374151",fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:600}}>{t.category}</span>
                              <PriorityBadge priority={t.priority}/>
                            </div>
                            <span style={{color:breachedT?RED:"#16a34a",fontSize:11,fontWeight:700}}>{timeLeft(t.sla_deadline)}</span>
                          </div>
                          {t.assigned_to&&<p style={{color:"#9ca3af",fontSize:11,marginTop:6}}>👤 {t.assigned_to}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab==="reports"&&<Reports tickets={tickets}/>}
              {tab==="sla"&&<SlaSettings slaConfig={slaConfig} onUpdate={setSlaConfig}/>}
            </div>
          )}
        </div>

        {/* Bottom nav (mobile) */}
        <div className="bottom-nav" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #e5e7eb",display:"flex",boxShadow:"0 -2px 8px rgba(0,0,0,0.06)"}}>
          {NAV.map(([id,Icon,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 0 6px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <Icon size={19} color={tab===id?RED:"#9ca3af"}/>
              <span style={{fontSize:10,color:tab===id?RED:"#9ca3af",fontWeight:tab===id?700:500}}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [slaConfig,setSlaConfig]=useState([]);

  useEffect(()=>{
    if(user?.role==="user"){
      sbGet("sla_config","order=id.asc").then(setSlaConfig).catch(()=>{});
    }
  },[user]);

  return user===null
    ?<LoginScreen onLogin={setUser}/>
    :user.role==="admin"
      ?<AdminApp onLogout={()=>setUser(null)}/>
      :<UserApp user={user} slaConfig={slaConfig} onLogout={()=>setUser(null)}/>;
}
