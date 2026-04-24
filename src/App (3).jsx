import { useState, useEffect, useCallback, useRef } from "react";
import * as ReactDOM from "react-dom";
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

const ns=document.createElement("style");
ns.textContent=`
@keyframes toastIn{from{transform:translateX(115%);opacity:0;}to{transform:translateX(0);opacity:1;}}
@keyframes toastOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(115%);opacity:0;}}
.abmh-toast{animation:toastIn .35s cubic-bezier(.21,1.02,.73,1) forwards;}
.abmh-toast.out{animation:toastOut .3s ease forwards;}
.abmh-toast-wrap{position:fixed;bottom:80px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:10px;max-width:320px;pointer-events:none;}
.abmh-toast{pointer-events:all;background:#fff;border-radius:14px;padding:13px 14px;box-shadow:0 8px 32px rgba(0,0,0,0.18);display:flex;gap:10px;align-items:flex-start;cursor:pointer;}
@keyframes bellPulse{0%{transform:rotate(0)}15%{transform:rotate(15deg)}30%{transform:rotate(-12deg)}45%{transform:rotate(8deg)}60%{transform:rotate(-5deg)}75%{transform:rotate(3deg)}100%{transform:rotate(0)}}
.bell-ring{animation:bellPulse .6s ease;}
`;
document.head.appendChild(ns);

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
  @media(min-width:768px){
    .page-shell{display:grid!important;grid-template-columns:240px 1fr;min-height:100vh;max-width:100%!important;width:100%!important;}
    .sidebar{display:flex!important;flex-direction:column;}
    .bottom-nav{display:none!important;}
    .main-topbar{left:240px!important;width:calc(100% - 240px)!important;transform:none!important;max-width:none!important;right:0!important;}
    .user-shell{display:grid!important;grid-template-columns:220px 1fr!important;min-height:100vh;max-width:100%!important;width:100%!important;margin:0!important;}
    .user-sidebar{display:flex!important;}
    .user-topbar{left:220px!important;width:calc(100% - 220px)!important;transform:none!important;max-width:none!important;right:0!important;}
    .user-bottom-nav{display:none!important;}
    .user-content{padding-top:68px!important;}
    .login-shell{align-items:center;}
  }
`;
document.head.appendChild(st);

// ─── Constants ────────────────────────────────────────────────────────────────
const RED   = "#c41e3a";
const DARK  = "#8b0000";
const LIGHT = "#fff5f5";

// ─── FIX 2: Added "Others" sub-category to all 3 main categories ──────────────
const MAIN_CATEGORIES = {
  software: {
    label:"Software", icon:Monitor, color:"#0369a1", bg:"#eff6ff",
    children:{
      HIS:["OPD Registration","IPD Admission","Billing & Invoicing","Pharmacy","Lab / Pathology","Radiology","EMR / Patient Records","Discharge Summary","Appointment Scheduling","Insurance / TPA","MIS Reports","User Management"],
      ERP:["Finance & Accounts","Inventory & Stores","Purchase & Procurement","Fixed Assets","Budget Management"],
      PACS:["Radiology Viewer (DICOM)","Image Archive","Worklist Management","Report Generation","CD Burning","Integration with HIS"],
      Others:["Other Software Issue","Access / Permission Issue","Integration Issue","New Software Request","Miscellaneous"],
    }
  },
  hardware:{
    label:"Hardware & Operations", icon:Cpu, color:"#d97706", bg:"#fffbeb",
    children:{
      "Desktop / Laptop":["System Not Starting","Slow Performance","Blue Screen / Crash","Keyboard / Mouse Issue","Monitor Issue","Upgradation Request","New Installation"],
      "Printer / Scanner":["Not Printing","Paper Jam","Poor Print Quality","Scanner Not Working","Driver Issue","Toner / Cartridge"],
      "UPS / Power":["UPS Not Working","Battery Backup Low","Power Fluctuation","UPS Beeping","Shutdown Issue"],
      "Biometric / Access Control":["Fingerprint Not Reading","Device Offline","Door Not Opening","Enrollment Issue","Software Sync Issue"],
      "Other Hardware":["Projector","TV / Display","CCTV","Barcode Scanner","Other"],
      "Email / Server":["Email Not Working","Outlook Issue","Server Unreachable","Shared Drive Issue","Backup Issue"],
      Others:["Other Hardware Issue","New Equipment Request","Repair Request","Miscellaneous","Not Listed Above"],
    }
  },
  network:{
    label:"Network", icon:Wifi, color:"#7c3aed", bg:"#f5f3ff",
    children:{
      "Internet / Connectivity":["No Internet","Slow Speed","Intermittent Drops","Website Blocked","VPN Issue"],
      "WiFi Issues":["No WiFi Signal","Weak Signal","Cannot Connect","IP Conflict","New WiFi Point Request"],
      "Switch / Router":["Port Not Working","Switch Down","VLAN Issue","Configuration Change","New Point Request"],
      "IP Phone / EPABX":["Phone Dead","No Dial Tone","Extension Issue","EPABX Programming","New Extension Request"],
      Others:["Other Network Issue","New Connection Request","Firewall / Blocking Issue","Miscellaneous","Not Listed Above"],
    }
  }
};

// ─── FIX 2: Added "Others" response time ─────────────────────────────────────
const SUBCAT_RESPONSE = {
  "HIS":1, "ERP":2, "PACS":1,
  "Desktop / Laptop":2, "Printer / Scanner":2, "UPS / Power":1,
  "Biometric / Access Control":2, "Other Hardware":4,
  "Internet / Connectivity":1, "WiFi Issues":1, "Switch / Router":1,
  "IP Phone / EPABX":2, "Email / Server":1,
  "Others":4,
};
function getResponseTime(subCat){ return SUBCAT_RESPONSE[subCat]||2; }

const PRIORITY_RESOLUTION = {
  software: { Critical:2,  High:4,  Medium:8,  Low:24 },
  hardware: { Critical:4,  High:8,  Medium:24, Low:48 },
  network:  { Critical:2,  High:4,  Medium:8,  Low:24 },
};
function getResolutionTime(mainCat,priority){
  return PRIORITY_RESOLUTION[mainCat]?.[priority]||8;
}
function getOlaTimes(mainCat,priority){
  return {response:2, resolution:getResolutionTime(mainCat,priority)};
}

const ISSUE_TYPES=[
  {id:"bug",    label:"Bug / Error",         icon:Bug,          color:RED,      bg:"#fff0f0"},
  {id:"cr",     label:"Change Request",      icon:RefreshCw,    color:"#d97706",bg:"#fffbeb"},
  {id:"support",label:"Training / Support",  icon:GraduationCap,color:"#0369a1",bg:"#eff6ff"},
];

const DEPARTMENTS=["OPD","IPD","Emergency","Pharmacy","Radiology","Lab / Pathology","Billing","EMR","Admission","ICU","OT","HR","Administration","Blood Bank","CSSD","Dietary","Housekeeping","IT & Networking","Laundry","Maintenance","Medical Records","Mortuary","Neonatology","Nephrology","Neurology","Oncology","Physiotherapy","Security","Social Work","Transplant"];
const PRIORITIES=["Critical","High","Medium","Low"];
const STATUSES=["Open","In Progress","Resolved"];

// ─── TEAM_CONFIG: kept for L3/L4 escalation chain display only ───────────────
// FIX 3 & 4: Login and passwords now read/write from Supabase it_team table
const TEAM_CONFIG = {
  software:{ l3:"Suraj Kumar", l4:"Harshad Raut" },
  hardware:{ l3:"Suraj Kumar", l4:"Harshad Raut" },
  network: { l3:"Suraj Kumar", l4:"Harshad Raut" },
};

const DEFAULT_SLA={
  software:{bug:{Critical:2,High:4,Medium:8,Low:24},cr:{Critical:48,High:72,Medium:72,Low:72},support:{Critical:1,High:1,Medium:2,Low:4}},
  hardware:{bug:{Critical:2,High:4,Medium:8,Low:24},cr:{Critical:24,High:48,Medium:72,Low:72},support:{Critical:1,High:2,Medium:4,Low:8}},
  network: {bug:{Critical:1,High:2,Medium:4,Low:8}, cr:{Critical:4, High:8, Medium:24,Low:48},support:{Critical:1,High:1,Medium:2,Low:4}},
};

// ─── FIX 3 & 4: Supabase-based staff auth ────────────────────────────────────
// Verify staff by querying it_team table in Supabase
async function verifyStaffFromDB(empId, password) {
  try {
    const rows = await sbGet("it_team", `emp_id=eq.${encodeURIComponent(empId.trim())}`);
    if (!rows || rows.length === 0) return null;
    const staff = rows[0];
    if (staff.password !== password) return null;
    // Map team name from DB to internal key
    const teamMap = {
      "Software": "software",
      "Hardware & Ops": "hardware",
      "Network": "network",
    };
    const teamKey = teamMap[staff.team] || staff.team?.toLowerCase() || "software";
    return {
      role: "staff",
      level: staff.level,
      team: teamKey,
      name: staff.name,
      empId: staff.emp_id,
    };
  } catch (e) {
    return null;
  }
}

// Get all staff from Supabase for display purposes
async function getAllStaffFromDB() {
  try {
    const rows = await sbGet("it_team", "order=team.asc,level.asc,name.asc");
    return rows || [];
  } catch (e) {
    return [];
  }
}

// Admin password — still localStorage (admin doesn't have a DB row)
function getAdminPassword(){try{return localStorage.getItem("abmh_admin_pwd")||"admin123";}catch{return"admin123";}}
function saveAdminPassword(p){try{localStorage.setItem("abmh_admin_pwd",p);}catch{}}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId(){const d=new Date();return `TKT-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(Math.floor(Math.random()*9000)+1000)}`;}
function isSlaBreached(t){
  if(t.status!=="Resolved") return new Date(t.sla_deadline)<new Date();
  if(t.resolved_at) return new Date(t.resolved_at)>new Date(t.sla_deadline);
  return false;
}
function isWithinOla(t){
  if(t.status!=="Resolved") return false;
  if(!t.resolved_at) return false;
  return new Date(t.resolved_at)<=new Date(t.sla_deadline);
}
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
  const m={"Open":{c:"#0369a1",bg:"#eff6ff"},"In Progress":{c:"#d97706",bg:"#fffbeb"},"Resolved":{c:"#16a34a",bg:"#f0fdf4"}};
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
function CalendarDropdown({anchorEl,startDate,endDate,onChange,onClose}){
  const [viewMonth,setViewMonth]=useState(startDate||new Date());
  const [selecting,setSelecting]=useState(startDate&&!endDate?"end":"start");
  const days=["Su","Mo","Tu","We","Th","Fr","Sa"];
  const mNames=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const y=viewMonth.getFullYear(),mo=viewMonth.getMonth();
  const cells=[];
  for(let i=0;i<new Date(y,mo,1).getDay();i++)cells.push(null);
  for(let d=1;d<=new Date(y,mo+1,0).getDate();d++)cells.push(d);
  function dayDate(d){return new Date(y,mo,d);}
  function isStart(d){return startDate&&dayDate(d).toDateString()===startDate.toDateString();}
  function isEnd(d){return endDate&&dayDate(d).toDateString()===endDate.toDateString();}
  function isRange(d){const dd=dayDate(d);return startDate&&endDate&&dd>startDate&&dd<endDate;}
  function click(d){
    const dd=dayDate(d);
    if(selecting==="start"){onChange({start:dd,end:null});setSelecting("end");}
    else{
      if(dd<startDate){onChange({start:dd,end:startDate});}
      else{onChange({start:startDate,end:dd});}
      onClose();
    }
  }
  const rect=anchorEl?anchorEl.getBoundingClientRect():{top:0,left:0,width:300};
  const top=rect.bottom+window.scrollY+6;
  const left=Math.min(rect.left+window.scrollX, window.innerWidth-320);
  return(
    <div style={{position:"absolute",top,left,width:310,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:16,boxShadow:"0 16px 48px rgba(0,0,0,0.2)",zIndex:99999}} onMouseDown={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>setViewMonth(new Date(y,mo-1,1))} style={{background:"#f3f4f6",border:"none",cursor:"pointer",padding:"6px 10px",borderRadius:8,color:"#374151",fontWeight:700}}>&lt;</button>
        <span style={{fontWeight:800,fontSize:14,color:"#1a1a2e"}}>{mNames[mo]} {y}</span>
        <button onClick={()=>setViewMonth(new Date(y,mo+1,1))} style={{background:"#f3f4f6",border:"none",cursor:"pointer",padding:"6px 10px",borderRadius:8,color:"#374151",fontWeight:700}}>&gt;</button>
      </div>
      <p style={{fontSize:11,color:RED,textAlign:"center",marginBottom:10,fontWeight:600}}>{selecting==="start"?"👆 Select start date":"👆 Now select end date"}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
        {days.map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#9ca3af"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d)return <div key={i}/>;
          const s=isStart(d),e=isEnd(d),r=isRange(d);
          return <button key={i} onClick={()=>click(d)} style={{padding:"7px 2px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:s||e?800:400,background:s||e?RED:r?"#fde8ea":"transparent",color:s||e?"#fff":r?RED:"#1a1a2e"}}>{d}</button>;
        })}
      </div>
      <div style={{borderTop:"1px solid #f3f4f6",marginTop:12,paddingTop:12,display:"flex",gap:6,flexWrap:"wrap"}}>
        {[["Today",0],["Last 7d",7],["Last 30d",30],["This month",-1]].map(([lbl,n])=>(
          <button key={lbl} onClick={()=>{
            const now=new Date(),e=new Date(now);
            const s=n===-1?new Date(now.getFullYear(),now.getMonth(),1):n===0?new Date(now.getFullYear(),now.getMonth(),now.getDate()):new Date(now-n*86400000);
            onChange({start:s,end:e});onClose();
          }} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #e5e7eb",background:"#f9fafb",fontSize:11,fontWeight:600,color:"#374151",cursor:"pointer"}}>{lbl}</button>
        ))}
      </div>
      {startDate&&<button onClick={()=>{onChange({start:null,end:null});setSelecting("start");}} style={{marginTop:8,width:"100%",padding:"6px",border:"none",background:"none",color:"#9ca3af",fontSize:12,cursor:"pointer"}}>✕ Clear selection</button>}
    </div>
  );
}

function DateRangePicker({startDate,endDate,onChange}){
  const [open,setOpen]=useState(false);
  const btnRef=useRef(null);
  const [,forceUpdate]=useState(0);
  useEffect(()=>{
    if(!open)return;
    function onDown(e){if(btnRef.current&&btnRef.current.contains(e.target))return;setOpen(false);}
    document.addEventListener("mousedown",onDown);
    return()=>document.removeEventListener("mousedown",onDown);
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const h=()=>forceUpdate(n=>n+1);
    window.addEventListener("scroll",h,true);window.addEventListener("resize",h);
    return()=>{window.removeEventListener("scroll",h,true);window.removeEventListener("resize",h);};
  },[open]);
  const label=startDate?`${fmtDate(startDate.toISOString())}${endDate?" → "+fmtDate(endDate.toISOString()):"  (select end…)"}`:"Select date range";
  return(
    <>
      <button ref={btnRef} onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#fff",border:`1.5px solid ${open?RED:"#e5e7eb"}`,borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,color:startDate?RED:"#6b7280",width:"100%",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><Calendar size={15} color={startDate?RED:"#9ca3af"}/>{label}</div>
        <ChevronDown size={14} color={open?RED:"#9ca3af"} style={{transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}/>
      </button>
      {open&&typeof document!=="undefined"&&ReactDOM.createPortal(
        <CalendarDropdown anchorEl={btnRef.current} startDate={startDate} endDate={endDate} onChange={onChange} onClose={()=>setOpen(false)}/>,
        document.body
      )}
    </>
  );
}

// ─── Notification System ──────────────────────────────────────────────────────
const NOTIF_COLORS={
  new_ticket:  {bg:"#eff6ff",border:"#bfdbfe",icon:"🎫",label:"New Ticket",tc:"#0369a1"},
  in_progress: {bg:"#fffbeb",border:"#fde68a",icon:"🔧",label:"In Progress",tc:"#d97706"},
  resolved:    {bg:"#f0fdf4",border:"#bbf7d0",icon:"✅",label:"Resolved",   tc:"#16a34a"},
  breach:      {bg:"#fff0f0",border:"#fca5a5",icon:"🚨",label:"OLA Breach", tc:"#c41e3a"},
  escalated:   {bg:"#f5f3ff",border:"#ddd6fe",icon:"⬆️",label:"Escalated",  tc:"#7c3aed"},
};

function ToastContainer({toasts,onDismiss}){
  return ReactDOM.createPortal(
    <div className="abmh-toast-wrap">
      {toasts.map(t=>{
        const cfg=NOTIF_COLORS[t.type]||NOTIF_COLORS.new_ticket;
        return(
          <div key={t.id} id={`toast-${t.id}`} className="abmh-toast" onClick={()=>onDismiss(t.id)}
            style={{borderLeft:`4px solid ${cfg.border}`,background:cfg.bg}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18,boxShadow:"0 2px 8px rgba(0,0,0,0.08)"}}>{cfg.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:cfg.tc,fontSize:12,fontWeight:800,marginBottom:2}}>{cfg.label}</p>
              <p style={{color:"#1a1a2e",fontSize:12,fontWeight:600,marginBottom:2,lineHeight:1.3}}>{t.title}</p>
              <p style={{color:"#6b7280",fontSize:11,lineHeight:1.3}}>{t.message}</p>
              <p style={{color:"#9ca3af",fontSize:10,marginTop:3}}>Just now · tap to dismiss</p>
            </div>
          </div>
        );
      })}
    </div>,
    document.body
  );
}

function BellNotifications({notifications,onMarkRead,onMarkAll}){
  const [open,setOpen]=useState(false);
  const [bellRing,setBellRing]=useState(false);
  const ref=useRef(null);
  const unread=notifications.filter(n=>!n.read).length;
  useEffect(()=>{if(unread>0){setBellRing(true);setTimeout(()=>setBellRing(false),700);}
  },[unread]);
  useEffect(()=>{
    function onDown(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener("mousedown",onDown);
    return()=>document.removeEventListener("mousedown",onDown);
  },[]);
  const fmtAgo=(iso)=>{
    const d=Date.now()-new Date(iso).getTime();
    if(d<60000)return"Just now";if(d<3600000)return`${Math.floor(d/60000)}m ago`;
    if(d<86400000)return`${Math.floor(d/3600000)}h ago`;return fmtDate(iso);
  };
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} className={bellRing?"bell-ring":""} style={{width:38,height:38,borderRadius:11,background:open?LIGHT:"#f9fafb",border:`1.5px solid ${open?RED:"#e5e7eb"}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .2s"}}>
        <Bell size={17} color={open?RED:"#6b7280"}/>
        {unread>0&&<span style={{position:"absolute",top:-5,right:-5,background:RED,color:"#fff",fontSize:9,fontWeight:800,minWidth:16,height:16,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff",padding:"0 3px"}}>{unread>9?"9+":unread}</span>}
      </button>
      {open&&ReactDOM.createPortal(
        <div style={{position:"fixed",top:(ref.current?.getBoundingClientRect().bottom||60)+window.scrollY+6,right:16,width:300,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,boxShadow:"0 12px 40px rgba(0,0,0,0.18)",zIndex:99998,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,fontSize:13,color:"#1a1a2e"}}>Notifications {unread>0&&<span style={{color:RED,fontSize:11}}>({unread} new)</span>}</span>
            {unread>0&&<button onClick={onMarkAll} style={{fontSize:11,color:RED,fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>Mark all read</button>}
          </div>
          <div style={{maxHeight:340,overflowY:"auto"}}>
            {notifications.length===0?(
              <div style={{padding:"32px 16px",textAlign:"center"}}><p style={{fontSize:13,color:"#9ca3af"}}>No notifications yet</p></div>
            ):notifications.map(n=>{
              const cfg=NOTIF_COLORS[n.type]||NOTIF_COLORS.new_ticket;
              return(
                <div key={n.id} onClick={()=>onMarkRead(n.id)} style={{padding:"11px 16px",borderBottom:"1px solid #f9fafb",display:"flex",gap:10,cursor:"pointer",background:n.read?"#fff":"#fafbff"}}>
                  {!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:RED,flexShrink:0,marginTop:6}}/>}
                  <div style={{width:30,height:30,borderRadius:8,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>{cfg.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#1a1a2e",marginBottom:1}}>{n.title}</p>
                    <p style={{fontSize:11,color:"#6b7280",lineHeight:1.3}}>{n.message}</p>
                    <p style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{fmtAgo(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {notifications.length>0&&(
            <div style={{padding:"8px 16px",textAlign:"center",borderTop:"1px solid #f3f4f6"}}>
              <p style={{fontSize:11,color:"#9ca3af"}}>Showing last {notifications.length} notifications</p>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function useNotifications(user){
  const [toasts,setToasts]=useState([]);
  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{if(!user)return;loadNotifications();},[user]);
  async function loadNotifications(){
    try{
      let q=`order=created_at.desc&limit=eq.50`;
      if(user.role==="user") q+=`&recipient_id=eq.${user.empId}`;
      else if(user.role==="staff") q+=`&recipient_team=eq.${user.team}`;
      const rows=await sbGet("notifications",q);
      setNotifications(rows);
    }catch(e){}
    setLoading(false);
  }
  useEffect(()=>{
    if(!user)return;
    const wsUrl=`${SUPABASE_URL.replace("https","wss")}/realtime/v1/websocket?apikey=${SUPABASE_KEY}&vsn=1.0.0`;
    let ws;let pingInterval;
    try{
      ws=new WebSocket(wsUrl);
      ws.onopen=()=>{
        ws.send(JSON.stringify({topic:"realtime:public:tickets",event:"phx_join",payload:{},ref:"1"}));
        ws.send(JSON.stringify({topic:"realtime:public:notifications",event:"phx_join",payload:{},ref:"2"}));
        pingInterval=setInterval(()=>{ws.send(JSON.stringify({topic:"phoenix","event":"heartbeat",payload:{},ref:"hb"}));},30000);
      };
      ws.onmessage=(e)=>{
        try{
          const msg=JSON.parse(e.data);
          if(msg.event==="INSERT"&&msg.topic==="realtime:public:tickets") handleNewTicket(msg.payload.record);
          if(msg.event==="UPDATE"&&msg.topic==="realtime:public:tickets") handleTicketUpdate(msg.payload.record,msg.payload.old_record);
          if(msg.event==="INSERT"&&msg.topic==="realtime:public:notifications") handleNewNotification(msg.payload.record);
        }catch{}
      };
    }catch(e){}
    return()=>{if(ws)ws.close();if(pingInterval)clearInterval(pingInterval);};
  },[user]);
  function shouldReceive(record,type){
    if(!user)return false;
    if(user.role==="admin")return true;
    if(user.role==="staff"){if(type==="new_ticket"||type==="breach"||type==="escalated") return record.software===user.team;return false;}
    if(user.role==="user") return record.emp_id===user.empId&&(type==="in_progress"||type==="resolved");
    return false;
  }
  function handleNewTicket(record){
    if(!shouldReceive(record,"new_ticket"))return;
    pushToast("new_ticket",`New Ticket — ${record.id}`,`${record.category} · ${record.dept} · ${record.user_name}`);
    saveNotification("new_ticket",`New Ticket — ${record.id}`,`${record.category} · ${record.dept} · ${record.user_name}`,record);
  }
  function handleTicketUpdate(record,old){
    if(!old||record.status===old.status)return;
    const newStatus=record.status;
    if(newStatus==="In Progress"&&shouldReceive(record,"in_progress")){
      pushToast("in_progress",`Ticket In Progress — ${record.id}`,`${record.assigned_to} is working on it`);
      saveNotification("in_progress",`Ticket In Progress — ${record.id}`,`${record.assigned_to} is working on it`,record);
    }
    if(newStatus==="Resolved"&&shouldReceive(record,"resolved")){
      pushToast("resolved",`Ticket Resolved — ${record.id}`,`${record.category} · Resolved by ${record.assigned_to}`);
      saveNotification("resolved",`Ticket Resolved — ${record.id}`,`${record.category} · Resolved by ${record.assigned_to}`,record);
    }
  }
  function handleNewNotification(record){
    if(user.role==="admin"||record.recipient_id===user?.empId||record.recipient_team===user?.team){
      setNotifications(prev=>[record,...prev.slice(0,49)]);
    }
  }
  function pushToast(type,title,message){
    const id=Date.now()+Math.random();
    setToasts(prev=>[...prev,{id,type,title,message}]);
    setTimeout(()=>{
      const el=document.getElementById(`toast-${id}`);
      if(el)el.classList.add("out");
      setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),350);
    },5000);
  }
  async function saveNotification(type,title,message,ticket){
    try{
      const n={type,title,message,ticket_id:ticket.id,recipient_id:ticket.emp_id,recipient_team:ticket.software,read:false,created_at:new Date().toISOString()};
      await sbPost("notifications",n);
    }catch{}
  }
  function dismissToast(id){
    const el=document.getElementById(`toast-${id}`);
    if(el)el.classList.add("out");
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),350);
  }
  async function markRead(id){
    setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));
    try{await sbPatch("notifications",`id=eq.${id}`,{read:true});}catch{}
  }
  async function markAllRead(){
    setNotifications(prev=>prev.map(n=>({...n,read:true})));
    try{
      if(user.role==="user") await sbPatch("notifications",`recipient_id=eq.${user.empId}&read=eq.false`,{read:true});
      else if(user.role==="staff") await sbPatch("notifications",`recipient_team=eq.${user.team}&read=eq.false`,{read:true});
      else await sbPatch("notifications","read=eq.false",{read:true});
    }catch{}
  }
  useEffect(()=>{
    if(!user||user.role==="user")return;
    const check=async()=>{
      try{
        const open=await sbGet("tickets","status=in.(Open,In%20Progress)&order=raised_at.asc");
        open.forEach(t=>{
          if(isSlaBreached(t)&&shouldReceive(t,"breach")){
            const key=`breach_${t.id}`;
            if(!sessionStorage.getItem(key)){
              sessionStorage.setItem(key,"1");
              pushToast("breach",`OLA Breached — ${t.id}`,`${t.category} · ${t.user_name} · ${t.dept}`);
            }
          }
        });
      }catch{}
    };
    check();
    const iv=setInterval(check,120000);
    return()=>clearInterval(iv);
  },[user]);
  return{toasts,notifications,dismissToast,markRead,markAllRead};
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
// FIX 4: verifyStaff now calls Supabase
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("user");
  const [empId,setEmpId]=useState("");
  const [empName,setEmpName]=useState("");
  const [mobile,setMobile]=useState("");
  const [staffId,setStaffId]=useState("");
  const [staffPass,setStaffPass]=useState("");
  const [adminUser,setAdminUser]=useState("");
  const [adminPass,setAdminPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [lookingUp,setLookingUp]=useState(false);
  const [showPass,setShowPass]=useState(false);

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
        const pwd=getAdminPassword();
        if(adminUser==="admin"&&adminPass===pwd)onLogin({role:"admin",name:"Admin"});
        else setErr("Invalid admin credentials.");
      } else if(mode==="staff"){
        // FIX 4: Now reads from Supabase it_team table
        const result=await verifyStaffFromDB(staffId.trim(),staffPass);
        if(result)onLogin(result);
        else setErr("Invalid Employee ID or password.");
      } else {
        if(!empName){setErr("Employee ID not found.");setLoading(false);return;}
        if(mobile.length<10){setErr("Please enter a valid 10-digit mobile number.");setLoading(false);return;}
        const rows=await sbGet("employees",`employee_id=eq.${encodeURIComponent(empId.trim())}&is_active=eq.true`);
        if(rows.length>0)onLogin({role:"user",empId:rows[0].employee_id,emp_id:rows[0].employee_id,name:rows[0].name,department:rows[0].department,mobile});
        else setErr("Employee not found.");
      }
    }catch(e){setErr("Connection error. Please try again.");}
    setLoading(false);
  }

  const MODES=[["user","Staff","🏥"],["staff","IT Team","🔧"],["admin","Admin","⚙️"]];
  return(
    <div className="login-shell" style={{minHeight:"100vh",width:"100%",background:"linear-gradient(135deg,#fff5f5 0%,#fff 50%,#fef2f2 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{position:"fixed",top:0,left:0,right:0,height:5,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
      <div className="fu" style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:60,objectFit:"contain",marginBottom:16}}/>
          <h1 style={{color:"#1a1a2e",fontSize:22,fontWeight:800,letterSpacing:"-0.5px"}}>IT HelpDesk Portal</h1>
          <p style={{color:"#6b7280",fontSize:13,marginTop:4}}>Aditya Birla Memorial Hospital</p>
        </div>
        <div style={{display:"flex",background:"#f3f4f6",borderRadius:12,padding:4,marginBottom:24,border:"1px solid #e5e7eb",gap:4}}>
          {MODES.map(([v,l,icon])=>(
            <button key={v} onClick={()=>{setMode(v);setErr("");}} style={{flex:1,padding:"10px 0",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,transition:"all .2s",background:mode===v?`linear-gradient(135deg,${RED},${DARK})`:"transparent",color:mode===v?"#fff":"#6b7280",boxShadow:mode===v?"0 2px 8px rgba(196,30,58,0.2)":"none"}}>
              <span style={{display:"block",fontSize:16,marginBottom:2}}>{icon}</span>{l}
            </button>
          ))}
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:24,boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
          {mode==="user"&&(<>
            <div style={{marginBottom:14}}>
              <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Employee ID</label>
              <div style={{position:"relative"}}>
                <input style={INP} placeholder="e.g. 9662" value={empId} onChange={e=>{setEmpId(e.target.value);lookupEmp(e.target.value);}} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                {lookingUp&&<Loader size={14} color={RED} className="spin" style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}/>}
              </div>
              {empName&&(<div style={{marginTop:8,background:LIGHT,border:`1px solid ${RED}30`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                <User size={14} color={RED}/><span style={{color:RED,fontSize:13,fontWeight:600}}>{empName}</span>
                <CheckCircle size={14} color="#16a34a" style={{marginLeft:"auto"}}/>
              </div>)}
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Mobile Number</label>
              <input style={INP} placeholder="10-digit mobile number" maxLength={10} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
          </>)}
          {mode==="staff"&&(<>
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>🔧</span>
              <div>
                <p style={{color:"#16a34a",fontSize:13,fontWeight:700}}>IT Team Login</p>
                <p style={{color:"#6b7280",fontSize:11}}>L1 Support & L2 Technical staff</p>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Employee ID</label>
              <input style={INP} placeholder="Your Employee ID" value={staffId} onChange={e=>setStaffId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
              <div style={{position:"relative"}}>
                <input style={INP} type={showPass?"text":"password"} placeholder="••••••••" value={staffPass} onChange={e=>setStaffPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:12}}>{showPass?"Hide":"Show"}</button>
              </div>
            </div>
          </>)}
          {mode==="admin"&&(<>
            <div style={{marginBottom:14}}>
              <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Username</label>
              <input style={INP} placeholder="admin" value={adminUser} onChange={e=>setAdminUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
              <div style={{position:"relative"}}>
                <input style={INP} type={showPass?"text":"password"} placeholder="••••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                <button onClick={()=>setShowPass(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:12}}>{showPass?"Hide":"Show"}</button>
              </div>
            </div>
          </>)}
          {err&&<ErrBox msg={err}/>}
          <button onClick={handleLogin} disabled={loading} style={BTN}>
            {loading?<><Loader size={16} className="spin"/>Verifying...</>:
             mode==="admin"?"Enter Dashboard →":
             mode==="staff"?"Enter Team View →":
             "Login & Continue →"}
          </button>
        </div>
        <p style={{textAlign:"center",color:"#9ca3af",fontSize:12,marginTop:16}}>Aditya Birla Memorial Hospital · IT Department</p>
      </div>
    </div>
  );
}

// ─── Raise Ticket ─────────────────────────────────────────────────────────────
function RaiseTicket({user,slaConfig,onDone}){
  const [mainCat,setMainCat]=useState("");
  const [subCat,setSubCat]=useState("");
  const [module,setModule]=useState("");
  const [issueType,setIssueType]=useState(null);
  const [dept,setDept]=useState(user.department||"");
  const [desc,setDesc]=useState("");
  const [submitted,setSubmitted]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [teamStaff,setTeamStaff]=useState([]);

  // Load team staff from DB for display
  useEffect(()=>{
    if(mainCat) getAllStaffFromDB().then(rows=>setTeamStaff(rows));
  },[mainCat]);

  const catDef=mainCat?MAIN_CATEGORIES[mainCat]:null;
  const subKeys=catDef?Object.keys(catDef.children):[];
  const modules=subCat&&catDef?catDef.children[subCat]||[]:[];
  const isSw=mainCat==="software";
  const defaultPriority="Medium";
  const canSubmit=mainCat&&subCat&&module&&dept&&desc.trim()&&!loading&&(isSw?!!issueType:true);

  // Get L1 for team from DB staff
  function getL1ForTeamDisplay(team){
    const teamMap={"software":"Software","hardware":"Hardware & Ops","network":"Network"};
    const dbLabel=teamMap[team]||team;
    return teamStaff.filter(s=>s.team===dbLabel&&s.level==="L1");
  }
  function getL2ForTeamDisplay(team){
    const teamMap={"software":"Software","hardware":"Hardware & Ops","network":"Network"};
    const dbLabel=teamMap[team]||team;
    const l2=teamStaff.filter(s=>s.team===dbLabel&&s.level==="L2");
    return l2[0]?.name||"";
  }
  function getL1AutoAssign(team){
    const l1=getL1ForTeamDisplay(team);
    return l1.length===1?l1[0].name:"";
  }

  async function submit(){
    if(!canSubmit)return;
    setLoading(true);setErr("");
    try{
      const finalType=isSw?issueType:"support";
      const hrs=getSlaHours(slaConfig,mainCat,finalType,defaultPriority);
      const ticket={
        id:genId(),emp_id:user.empId,user_name:user.name,mobile:user.mobile||"",dept,
        software:mainCat,category:subCat,module,issue_type:finalType,
        priority:defaultPriority,description:desc,status:"Open",
        assigned_to:getL1AutoAssign(mainCat),raised_at:new Date().toISOString(),
        sla_deadline:new Date(Date.now()+hrs*3600000).toISOString(),note:""
      };
      const result=await sbPost("tickets",ticket);
      const saved=result[0]||ticket;
      await sbPost("audit_log",{ticket_id:saved.id,action:"Ticket Created",changed_by:user.name,new_value:`Open — ${getL1AutoAssign(mainCat)?'Assigned to '+getL1AutoAssign(mainCat)+' (L1)':'Unassigned — awaiting L1 acceptance'}`});
      setSubmitted(saved);
    }catch(e){setErr("Failed to submit. Please try again.");}
    setLoading(false);
  }

  if(submitted){
    const cat=MAIN_CATEGORIES[submitted.software];
    return(
      <div className="fu" style={{padding:20}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #16a34a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <CheckCircle size={30} color="#16a34a"/>
          </div>
          <h2 style={{color:"#1a1a2e",fontSize:20,fontWeight:800}}>Ticket Raised!</h2>
          <p style={{color:"#6b7280",fontSize:13,marginTop:4}}>Assigned to <strong>{submitted.assigned_to||"IT Team"}</strong></p>
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:12,borderBottom:"1px solid #f3f4f6"}}>
            <span style={{color:RED,fontSize:15,fontWeight:800}}>{submitted.id}</span>
            <StatusBadge status="Open"/>
          </div>
          {[["Category",cat?.label],["Sub-Category",submitted.category],["Issue",submitted.module],["Department",submitted.dept],["Mobile",submitted.mobile||"—"],["Assigned To",submitted.assigned_to||"Pending"],["OLA Deadline",fmt(submitted.sla_deadline)]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f9fafb"}}>
              <span style={{color:"#6b7280",fontSize:13}}>{k}</span>
              <span style={{color:"#1a1a2e",fontSize:13,fontWeight:600}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <p style={{color:"#0369a1",fontSize:11,fontWeight:700,marginBottom:4}}>⚡ Response Time</p>
              <p style={{color:"#0369a1",fontSize:26,fontWeight:800,lineHeight:1}}>{getResponseTime(submitted.category)}h</p>
              <p style={{color:"#93c5fd",fontSize:10,marginTop:4}}>guaranteed response</p>
            </div>
            <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <p style={{color:"#6b7280",fontSize:11,fontWeight:700,marginBottom:4}}>✅ Resolution Time</p>
              <p style={{color:"#9ca3af",fontSize:13,fontWeight:700,marginTop:6}}>Set by technician</p>
              <p style={{color:"#d1d5db",fontSize:10,marginTop:4}}>after priority review</p>
            </div>
          </div>
          <div style={{marginTop:10,background:LIGHT,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
            <Clock size={14} color={RED}/><span style={{color:RED,fontSize:13,fontWeight:600}}>{timeLeft(submitted.sla_deadline)}</span>
          </div>
        </div>
        <button onClick={onDone} style={{...BTN,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}>View My Tickets →</button>
      </div>
    );
  }

  return(
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>Raise a Ticket</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>All fields are required</p>
      <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>1. Category</p>
      <div className="fu1" style={{display:"flex",gap:10,marginBottom:20}}>
        {Object.entries(MAIN_CATEGORIES).map(([key,cat])=>(
          <button key={key} onClick={()=>{setMainCat(key);setSubCat("");setModule("");setIssueType(null);}} style={{flex:1,minWidth:0,padding:"12px 4px",borderRadius:12,border:`2px solid ${mainCat===key?cat.color:"#e5e7eb"}`,background:mainCat===key?cat.bg:"#fff",cursor:"pointer",transition:"all .2s",textAlign:"center"}}>
            <cat.icon size={20} color={mainCat===key?cat.color:"#9ca3af"} style={{margin:"0 auto 6px",display:"block"}}/>
            <p style={{color:mainCat===key?cat.color:"#1a1a2e",fontWeight:800,fontSize:11,lineHeight:1.3}}>{cat.label}</p>
          </button>
        ))}
      </div>
      {mainCat&&(<>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>2. Sub-Category</p>
        <div className="fu1" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {subKeys.map(sk=>(
            <button key={sk} onClick={()=>{setSubCat(sk);setModule("");}} style={{padding:"11px 14px",borderRadius:10,border:`2px solid ${subCat===sk?catDef.color:"#e5e7eb"}`,background:subCat===sk?catDef.bg:"#fff",cursor:"pointer",textAlign:"left",fontWeight:600,fontSize:13,color:subCat===sk?catDef.color:"#374151",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {sk}{subCat===sk&&<CheckCircle size={16} color={catDef.color}/>}
            </button>
          ))}
        </div>
      </>)}
      {subCat&&(<>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>3. Specific Issue</p>
        <div className="fu2" style={{marginBottom:20}}>
          <select style={SEL} value={module} onChange={e=>setModule(e.target.value)}>
            <option value="">Select issue</option>
            {modules.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </>)}
      {module&&isSw&&(<>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>4. Issue Type</p>
        <div className="fu2" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {ISSUE_TYPES.map(it=>(
            <button key={it.id} onClick={()=>setIssueType(it.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:issueType===it.id?it.bg:"#fff",border:`2px solid ${issueType===it.id?it.color:"#e5e7eb"}`,borderRadius:12,cursor:"pointer",transition:"all .2s"}}>
              <div style={{width:34,height:34,borderRadius:9,background:issueType===it.id?it.color+"20":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <it.icon size={16} color={issueType===it.id?it.color:"#9ca3af"}/>
              </div>
              <div style={{flex:1}}>
                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{it.label}</p>
                <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>Response: {getResponseTime(subCat)}h · Resolution confirmed by technician</p>
              </div>
              {issueType===it.id&&<CheckCircle size={16} color={it.color}/>}
            </button>
          ))}
        </div>
      </>)}
      {subCat&&(
        <div className="fu2" style={{marginBottom:20}}>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Response Time Commitment</p>
          <div style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:12,padding:"16px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"#0369a1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Clock size={22} color="#fff"/>
            </div>
            <div>
              <p style={{color:"#0369a1",fontSize:13,fontWeight:700}}>Our team will respond within</p>
              <p style={{color:"#0369a1",fontSize:32,fontWeight:800,lineHeight:1,marginTop:2}}>{getResponseTime(subCat)} hour{getResponseTime(subCat)!==1?"s":""}</p>
              <p style={{color:"#93c5fd",fontSize:11,marginTop:4}}>Resolution time will be confirmed by technician based on priority</p>
            </div>
          </div>
        </div>
      )}
      {module&&(isSw?issueType:true)&&(
        <div className="fu3" style={{display:"flex",flexDirection:"column",gap:14}}>
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
          {catDef&&teamStaff.length>0&&(()=>{
            const l1=getL1ForTeamDisplay(mainCat);
            const l2=getL2ForTeamDisplay(mainCat);
            return(
              <div style={{background:catDef.bg,border:`1px solid ${catDef.color}30`,borderRadius:12,padding:"12px 14px"}}>
                <p style={{color:catDef.color,fontSize:11,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>👥 Who will attend your ticket</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{background:"#f0fdf4",color:"#16a34a",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,border:"1px solid #bbf7d0",minWidth:24,textAlign:"center"}}>L1</span>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {l1.length>0?l1.map(s=>(
                        <span key={s.emp_id} style={{background:"#fff",color:"#374151",fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:6,border:"1px solid #e5e7eb"}}>👤 {s.name}</span>
                      )):<span style={{color:"#9ca3af",fontSize:12}}>No L1 assigned</span>}
                    </div>
                    <span style={{color:"#9ca3af",fontSize:11,marginLeft:"auto"}}>First response</span>
                  </div>
                  {l2&&(
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{background:LIGHT,color:RED,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,border:`1px solid ${RED}30`,minWidth:24,textAlign:"center"}}>L2</span>
                      <span style={{background:"#fff",color:"#374151",fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:6,border:"1px solid #e5e7eb"}}>👤 {l2}</span>
                      <span style={{color:"#9ca3af",fontSize:11,marginLeft:"auto"}}>Escalation</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{color:RED,fontSize:13,fontWeight:800}}>{t.id}</span>
                  <StatusBadge status={t.status}/>
                </div>
                <p style={{color:"#1a1a2e",fontSize:14,fontWeight:500,marginBottom:8,lineHeight:1.5}}>{t.description.substring(0,80)}{t.description.length>80?"…":""}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  {cat&&<span style={{background:cat.bg,color:cat.color,fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:700}}>{cat.label}</span>}
                  <span style={{background:"#f3f4f6",color:"#374151",fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{t.category}</span>
                  <PriorityBadge priority={t.priority}/>
                </div>
                {t.mobile&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <span style={{fontSize:12,color:"#6b7280"}}>📞</span>
                  <a href={`tel:${t.mobile}`} style={{color:"#0369a1",fontSize:12,fontWeight:600,textDecoration:"none"}}>{t.mobile}</a>
                </div>}
                <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{background:"#eff6ff",color:"#0369a1",fontSize:11,padding:"3px 10px",borderRadius:6,fontWeight:600}}>⚡ Response: {getResponseTime(t.category)}h</span>
                  {t.priority?
                    <span style={{background:"#f0fdf4",color:"#16a34a",fontSize:11,padding:"3px 10px",borderRadius:6,fontWeight:600}}>✅ Resolution: {getResolutionTime(t.software,t.priority)}h</span>
                    :<span style={{background:"#f9fafb",color:"#9ca3af",fontSize:11,padding:"3px 10px",borderRadius:6,fontWeight:600}}>⏳ Resolution: pending technician</span>
                  }
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#9ca3af",fontSize:12}}>{fmt(t.raised_at)}</span>
                  <span style={{color:breached?RED:"#16a34a",fontSize:12,fontWeight:700}}>{timeLeft(t.sla_deadline)}</span>
                </div>
                {t.assigned_to&&<div style={{marginTop:6,fontSize:12,color:"#6b7280"}}>👤 {t.assigned_to}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Staff View (L1 / L2 Technician) ─────────────────────────────────────────
function TechnicianApp({user,onLogout,notifProps}){
  const [tickets,setTickets]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [filter,setFilter]=useState("Open");
  const [err,setErr]=useState("");
  const teamCat=MAIN_CATEGORIES[user.team];

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const rows=await sbGet("tickets",`software=eq.${user.team}&order=raised_at.desc`);
      setTickets(rows);
    }catch(e){setErr("Failed to load tickets.");}
    setLoading(false);
  },[user]);

  useEffect(()=>{load();},[load]);

  const filtered=tickets.filter(t=>filter==="All"?true:t.status===filter);
  const unassigned=filtered.filter(t=>!t.assigned_to||t.assigned_to==="");
  const assigned=filtered.filter(t=>t.assigned_to&&t.assigned_to!=="");
  const showTickets=[...unassigned,...assigned];

  const breached=tickets.filter(t=>isSlaBreached(t)).length;
  const open=tickets.filter(t=>t.status==="Open"||t.status==="In Progress").length;

  if(selected) return <TechTicketDetail ticketId={selected} tickets={tickets} user={user} onBack={()=>{setSelected(null);load();}} teamCat={teamCat}/>;

  return(
    <div style={{minHeight:"100vh",background:"#f5f6fa",maxWidth:480,margin:"0 auto",width:"100%"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
        <div style={{padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"#1a1a2e",fontWeight:800,fontSize:15}}>{user.name}</p>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <span style={{background:user.level==="L2"?LIGHT:"#f0fdf4",color:user.level==="L2"?RED:"#16a34a",fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,border:`1px solid ${user.level==="L2"?RED+"30":"#bbf7d0"}`}}>{user.level}</span>
              {teamCat&&<span style={{background:teamCat.bg,color:teamCat.color,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4}}>{teamCat.label}</span>}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <BellNotifications notifications={notifProps?.notifications||[]} onMarkRead={notifProps?.onMarkRead} onMarkAll={notifProps?.onMarkAll}/>
            <button onClick={load} style={{background:LIGHT,border:`1px solid ${RED}30`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:RED,fontSize:13,fontWeight:700}}>↻</button>
            <button onClick={onLogout} style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#6b7280",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><LogOut size={14}/>Out</button>
          </div>
        </div>
        <div style={{display:"flex",gap:8,padding:"0 20px 12px"}}>
          {[["Open",open,"#d97706","#fffbeb"],["Breached",breached,RED,LIGHT],["Total",tickets.length,"#374151","#f9fafb"]].map(([l,v,c,bg])=>(
            <div key={l} style={{background:bg,border:`1px solid ${c}20`,borderRadius:8,padding:"6px 12px",textAlign:"center",flex:1}}>
              <p style={{color:c,fontSize:16,fontWeight:800,lineHeight:1}}>{v}</p>
              <p style={{color:"#9ca3af",fontSize:10,marginTop:2}}>{l}</p>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,padding:"0 20px 12px",overflowX:"auto"}}>
          {["Open","In Progress","Resolved","All"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${filter===s?RED:"#e5e7eb"}`,background:filter===s?LIGHT:"#fff",color:filter===s?RED:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 16px 80px"}}>
        {loading?<Spinner/>:err?<ErrBox msg={err}/>:showTickets.length===0?(
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <CheckCircle size={40} color="#d1d5db" style={{margin:"0 auto 12px"}}/>
            <p style={{color:"#9ca3af",fontSize:14}}>No {filter!=="All"?filter.toLowerCase():""} tickets</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {showTickets.map((t,i)=>{
              const breachedT=isSlaBreached(t);
              const ismine=t.assigned_to===user.name;
              const isAssignedToOther=t.assigned_to&&t.assigned_to!==""&&!ismine;
              return(
                <div key={t.id} onClick={()=>setSelected(t.id)} className="si" style={{animationDelay:`${i*.04}s`,background:breachedT?"#fff5f5":"#fff",border:`1.5px solid ${breachedT?"#fca5a5":ismine?"#bfdbfe":"#e5e7eb"}`,borderRadius:14,padding:16,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{color:RED,fontSize:12,fontWeight:800}}>{t.id}</span>
                    <StatusBadge status={t.status}/>
                  </div>
                  {/* FIX 1: Show correct badge based on assignment state */}
                  {user.level==="L1"&&(
                    !t.assigned_to||t.assigned_to===""
                      ? <div style={{background:"#fef9c3",border:"1px solid #fde047",borderRadius:6,padding:"3px 8px",marginBottom:6,display:"inline-block"}}>
                          <span style={{color:"#a16207",fontSize:11,fontWeight:700}}>⚡ Unassigned — Tap to Accept</span>
                        </div>
                      : isAssignedToOther&&
                        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:6,padding:"3px 8px",marginBottom:6,display:"inline-block"}}>
                          <span style={{color:"#0369a1",fontSize:11,fontWeight:700}}>👤 Assigned to {t.assigned_to}</span>
                        </div>
                  )}
                  <p style={{color:"#1a1a2e",fontSize:13,fontWeight:500,marginBottom:8,lineHeight:1.4}}>{t.description?.substring(0,70)}{t.description?.length>70?"…":""}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                    <span style={{background:"#f3f4f6",color:"#374151",fontSize:11,padding:"2px 8px",borderRadius:6,fontWeight:600}}>{t.category}</span>
                    <PriorityBadge priority={t.priority}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      {t.mobile&&<a href={`tel:${t.mobile}`} onClick={e=>e.stopPropagation()} style={{color:"#0369a1",fontSize:12,fontWeight:600,textDecoration:"none"}}>📞 {t.mobile}</a>}
                      <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>{t.user_name} · {t.dept}</p>
                    </div>
                    <span style={{color:breachedT?RED:"#16a34a",fontSize:11,fontWeight:700}}>{timeLeft(t.sla_deadline)}</span>
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

// ─── Technician Ticket Detail ──────────────────────────────────────────────────
function TechTicketDetail({ticketId,tickets,user,onBack,teamCat}){
  const t=tickets.find(x=>x.id===ticketId);
  const [saving,setSaving]=useState(false);
  const [note,setNote]=useState(t?.note||"");
  const [localT,setLocalT]=useState(t);
  const [teamStaff,setTeamStaff]=useState([]);

  useEffect(()=>{
    getAllStaffFromDB().then(rows=>setTeamStaff(rows));
  },[]);

  if(!localT){onBack();return null;}

  const isAssignedToMe=localT.assigned_to===user.name;
  // FIX 1: Only show Accept if truly unassigned
  const isUnassigned=!localT.assigned_to||localT.assigned_to==="";
  const isAssignedToOther=localT.assigned_to&&localT.assigned_to!==""&&!isAssignedToMe;

  async function updateField(field,value){
    setSaving(true);
    try{
      const patch={[field]:value};
      if(field==="status"&&value==="Resolved")patch.resolved_at=new Date().toISOString();
      if(field==="status"&&value!=="Resolved")patch.resolved_at=null;
      await sbPatch("tickets",`id=eq.${localT.id}`,patch);
      await sbPost("audit_log",{ticket_id:localT.id,action:`${field} Updated`,changed_by:user.name,old_value:localT[field],new_value:value});
      setLocalT(prev=>({...prev,...patch}));
    }catch(e){alert("Failed to update.");}
    setSaving(false);
  }

  async function acceptTicket(){ await updateField("assigned_to",user.name); }

  async function saveNote(){
    setSaving(true);
    try{
      await sbPatch("tickets",`id=eq.${localT.id}`,{note});
      setLocalT(prev=>({...prev,note}));
    }catch(e){alert("Failed to save note.");}
    setSaving(false);
  }

  async function escalateToL2(){
    const teamMap={"software":"Software","hardware":"Hardware & Ops","network":"Network"};
    const dbLabel=teamMap[localT.software]||localT.software;
    const l2=teamStaff.find(s=>s.team===dbLabel&&s.level==="L2");
    if(!l2){alert("No L2 found for this team.");return;}
    await updateField("assigned_to",l2.name);
    alert(`Ticket escalated to L2: ${l2.name}`);
  }

  const breachedT=isSlaBreached(localT);

  return(
    <div style={{minHeight:"100vh",background:"#f5f6fa",maxWidth:480,margin:"0 auto",paddingBottom:40}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
        <div style={{padding:"12px 20px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",gap:4,fontSize:13,fontWeight:600,padding:0}}>
            <ArrowLeft size={16}/>Back
          </button>
          <span style={{color:RED,fontWeight:800,fontSize:14,flex:1}}>{localT.id}</span>
          <StatusBadge status={localT.status}/>
        </div>
      </div>
      <div style={{padding:16,display:"flex",flexDirection:"column",gap:12}}>
        {/* FIX 1: Accept banner only when truly unassigned */}
        {isUnassigned&&(
          <div style={{background:"#fef9c3",border:"1.5px solid #fde047",borderRadius:14,padding:14,display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <p style={{color:"#a16207",fontWeight:700,fontSize:13}}>⚡ Unassigned Ticket</p>
              <p style={{color:"#a16207",fontSize:12,marginTop:2}}>Take ownership to start working</p>
            </div>
            <button onClick={acceptTicket} disabled={saving} style={{background:"#16a34a",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,padding:"10px 16px",cursor:"pointer"}}>Accept</button>
          </div>
        )}
        {/* FIX 1: Show assigned-to-other banner */}
        {isAssignedToOther&&(
          <div style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:14,padding:14,display:"flex",alignItems:"center",gap:10}}>
            <User size={18} color="#0369a1"/>
            <div>
              <p style={{color:"#0369a1",fontWeight:700,fontSize:13}}>Currently assigned to {localT.assigned_to}</p>
              <p style={{color:"#6b7280",fontSize:12,marginTop:2}}>You can view this ticket but cannot accept it</p>
            </div>
          </div>
        )}
        {breachedT&&<div style={{background:"#fff0f0",border:"1.5px solid #fca5a5",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={16} color={RED}/><span style={{color:RED,fontSize:13,fontWeight:700}}>OLA BREACHED — {timeLeft(localT.sla_deadline)}</span></div>}
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Caller Details</p>
          {[["Name",localT.user_name],["Department",localT.dept],["Mobile",localT.mobile||"—"],["Category",MAIN_CATEGORIES[localT.software]?.label],["Sub-Category",localT.category],["Issue",localT.module],["Raised At",fmt(localT.raised_at)]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f9fafb"}}>
              <span style={{color:"#9ca3af",fontSize:13}}>{k}</span>
              <span style={{color:k==="Mobile"?"#0369a1":"#1a1a2e",fontSize:13,fontWeight:600}}>{k==="Mobile"&&v!=="—"?<a href={`tel:${v}`} style={{color:"#0369a1",textDecoration:"none"}}>📞 {v}</a>:v}</span>
            </div>
          ))}
          <p style={{color:"#1a1a2e",fontSize:13,lineHeight:1.5,marginTop:10,padding:"8px",background:"#f9fafb",borderRadius:8}}>{localT.description}</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:"12px",textAlign:"center"}}>
            <p style={{color:"#0369a1",fontSize:11,fontWeight:700,marginBottom:4}}>⚡ Response Time</p>
            <p style={{color:"#0369a1",fontSize:22,fontWeight:800}}>{getResponseTime(localT.category)}h</p>
          </div>
          <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"12px",textAlign:"center"}}>
            <p style={{color:"#16a34a",fontSize:11,fontWeight:700,marginBottom:4}}>✅ Resolution Time</p>
            <p style={{color:"#16a34a",fontSize:22,fontWeight:800}}>{getResolutionTime(localT.software,localT.priority)}h</p>
          </div>
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>Set Priority</p>
          <p style={{color:"#9ca3af",fontSize:11,marginBottom:10}}>Sets resolution time commitment</p>
          <div style={{display:"flex",gap:8}}>
            {PRIORITIES.map(p=>{
              const pc={Critical:RED,High:"#dc2626",Medium:"#d97706",Low:"#16a34a"};
              return(
                <button key={p} onClick={()=>updateField("priority",p)} disabled={saving} style={{flex:1,padding:"8px 2px",borderRadius:8,border:`2px solid ${localT.priority===p?pc[p]:"#e5e7eb"}`,background:localT.priority===p?pc[p]+"15":"#fff",color:localT.priority===p?pc[p]:"#6b7280",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                  <p>{p}</p>
                  <p style={{fontSize:9,marginTop:1,color:localT.priority===p?pc[p]:"#9ca3af"}}>{getResolutionTime(localT.software,p)}h</p>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Update Status</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {STATUSES.map(s=>(
              <button key={s} onClick={()=>updateField("status",s)} disabled={saving} style={{padding:"8px 14px",borderRadius:8,border:`2px solid ${localT.status===s?RED:"#e5e7eb"}`,background:localT.status===s?LIGHT:"#fff",color:localT.status===s?RED:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer"}}>{s}</button>
            ))}
          </div>
        </div>
        {user.level==="L1"&&isAssignedToMe&&localT.status!=="Resolved"&&(
          <button onClick={escalateToL2} disabled={saving} style={{padding:"12px",borderRadius:12,border:`2px solid ${RED}`,background:LIGHT,color:RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <AlertTriangle size={16}/>Escalate to L2
          </button>
        )}
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Work Notes</p>
          {localT.note&&<p style={{color:"#374151",fontSize:13,marginBottom:10,padding:"8px",background:"#f0fdf4",borderRadius:8,borderLeft:"3px solid #16a34a"}}>{localT.note}</p>}
          <textarea style={{...INP,minHeight:80,resize:"vertical"}} value={note} onChange={e=>setNote(e.target.value)} placeholder="Add work notes..."/>
          <button onClick={saveNote} disabled={saving} style={{marginTop:8,padding:"9px 18px",background:LIGHT,border:`1.5px solid ${RED}`,borderRadius:8,color:RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            {saving?<><Loader size={14} className="spin"/>Saving...</>:<><Save size={14}/>Save Note</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User App ─────────────────────────────────────────────────────────────────
function UserApp({user,slaConfig,onLogout,notifProps}){
  const [tab,setTab]=useState("raise");
  const NAV=[["raise",Plus,"Raise Ticket"],["mine",Ticket,"My Tickets"]];
  return(
    <div className="user-shell" style={{minHeight:"100vh",background:"#f5f6fa",display:"flex",flexDirection:"column",width:"100%"}}>
      <div className="user-sidebar" style={{display:"none",background:"#fff",borderRight:"1px solid #e5e7eb",flexDirection:"column",height:"100vh",position:"sticky",top:0,zIndex:20}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #e5e7eb"}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:36,objectFit:"contain",maxWidth:"100%"}}/>
        </div>
        <div style={{padding:"12px 12px 8px",borderBottom:"1px solid #f3f4f6"}}>
          <div style={{background:LIGHT,borderRadius:10,padding:"10px 12px"}}>
            <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{user.name}</p>
            <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>{user.department}</p>
          </div>
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
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <div className="user-topbar" style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:10}}>
          <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
          <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13,lineHeight:1}}>{user.name}</p>
              <p style={{color:"#9ca3af",fontSize:11,marginTop:2}}>{user.department}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <BellNotifications notifications={notifProps?.notifications||[]} onMarkRead={notifProps?.onMarkRead} onMarkAll={notifProps?.onMarkAll}/>
              <button onClick={onLogout} style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600}}>
                <LogOut size={14}/> Out
              </button>
            </div>
          </div>
        </div>
        <div className="user-content" style={{flex:1,overflowY:"auto",paddingTop:84,paddingBottom:90}}>
          {tab==="raise"?<RaiseTicket user={user} slaConfig={slaConfig} onDone={()=>setTab("mine")}/>:<MyTickets empId={user.empId}/>}
        </div>
        <div className="user-bottom-nav" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #e5e7eb",display:"flex",boxShadow:"0 -2px 8px rgba(0,0,0,0.06)"}}>
          {NAV.map(([id,Icon,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px 0 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Icon size={20} color={tab===id?RED:"#9ca3af"}/>
              <span style={{fontSize:11,color:tab===id?RED:"#9ca3af",fontWeight:tab===id?700:500}}>{label}</span>
            </button>
          ))}
        </div>
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
  const [teamStaff,setTeamStaff]=useState([]);

  useEffect(()=>{
    (async()=>{
      try{setAudit(await sbGet("audit_log",`ticket_id=eq.${ticketId}&order=timestamp.asc`));}
      catch(e){}
      setLoadingAudit(false);
    })();
    getAllStaffFromDB().then(setTeamStaff);
  },[ticketId]);

  if(!t){onBack();return null;}
  const cat=MAIN_CATEGORIES[t.software];
  const breachedT=isSlaBreached(t);
  const teamMap={"software":"Software","hardware":"Hardware & Ops","network":"Network"};
  const dbLabel=teamMap[t.software]||t.software;
  const ticketTeamStaff=teamStaff.filter(s=>s.team===dbLabel);

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
        {breachedT&&<div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={14} color={RED}/><span style={{color:RED,fontSize:12,fontWeight:700}}>OLA BREACHED</span></div>}
        <p style={{color:"#1a1a2e",fontSize:14,lineHeight:1.6,marginBottom:16}}>{t.description}</p>
        {[["Raised By",t.user_name],["Mobile",t.mobile||"—"],["Department",t.dept],["Category",cat?.label],["Sub-Category",t.category],["Issue",t.module],["Priority",t.priority],["Assigned To",t.assigned_to],["Raised At",fmt(t.raised_at)],["OLA Deadline",fmt(t.sla_deadline)],["OLA Status",timeLeft(t.sla_deadline)],["Resolved At",fmt(t.resolved_at)]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
            <span style={{color:"#6b7280",fontSize:13}}>{k}</span>
            <span style={{color:k==="OLA Status"&&breachedT?RED:"#1a1a2e",fontSize:13,fontWeight:600}}>{v||"—"}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.5px"}}>Set Priority</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
          {PRIORITIES.map(p=>{
            const pc={Critical:RED,High:"#dc2626",Medium:"#d97706",Low:"#16a34a"};
            return(
              <button key={p} onClick={()=>updateField("priority",p)} disabled={saving} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`2px solid ${t.priority===p?pc[p]:"#e5e7eb"}`,background:t.priority===p?pc[p]+"15":"#fff",color:t.priority===p?pc[p]:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",minWidth:70}}>
                <p>{p}</p>
                <p style={{fontSize:10,fontWeight:500,marginTop:2}}>{getResolutionTime(t.software,p)}h</p>
              </button>
            );
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:"#eff6ff",borderRadius:8,padding:"10px",textAlign:"center"}}>
            <p style={{color:"#0369a1",fontSize:10,fontWeight:700}}>⚡ Response Time</p>
            <p style={{color:"#0369a1",fontSize:22,fontWeight:800}}>{getResponseTime(t.category)}h</p>
          </div>
          <div style={{background:"#f0fdf4",borderRadius:8,padding:"10px",textAlign:"center"}}>
            <p style={{color:"#16a34a",fontSize:10,fontWeight:700}}>✅ Resolution Time</p>
            <p style={{color:"#16a34a",fontSize:22,fontWeight:800}}>{getResolutionTime(t.software,t.priority)}h</p>
          </div>
        </div>
      </div>
      {/* Reassign — from DB staff */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Assign To</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {["L1","L2"].map(lvl=>{
            const group=ticketTeamStaff.filter(s=>s.level===lvl);
            if(!group.length)return null;
            return(
              <div key={lvl}>
                <p style={{color:"#9ca3af",fontSize:11,fontWeight:700,marginBottom:6}}>{lvl} — {lvl==="L1"?"First Response":"Technical"}</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {group.map(s=>(
                    <button key={s.emp_id} onClick={()=>updateField("assigned_to",s.name)} disabled={saving}
                      style={{padding:"8px 14px",borderRadius:8,border:`2px solid ${t.assigned_to===s.name?lvl==="L2"?RED:"#16a34a":"#e5e7eb"}`,
                        background:t.assigned_to===s.name?lvl==="L2"?LIGHT:"#f0fdf4":"#fff",
                        color:t.assigned_to===s.name?lvl==="L2"?RED:"#16a34a":"#6b7280",
                        fontSize:12,fontWeight:700,cursor:"pointer"}}>
                      {s.name}{t.assigned_to===s.name?" ✓":""}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Update Status</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>updateField("status",s)} disabled={saving} style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${t.status===s?RED:"#e5e7eb"}`,background:t.status===s?LIGHT:"#fff",color:t.status===s?RED:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer"}}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Internal Note</p>
        {t.note&&<p style={{color:"#374151",fontSize:13,marginBottom:10,padding:"8px 10px",background:"#f0fdf4",borderRadius:8,borderLeft:"3px solid #16a34a"}}>{t.note}</p>}
        <textarea style={{...INP,minHeight:70,resize:"vertical"}} value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Add internal note..."/>
        <button onClick={saveNote} disabled={saving} style={{marginTop:8,padding:"9px 18px",background:LIGHT,border:`1.5px solid ${RED}`,borderRadius:8,color:RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          {saving?<><Loader size={14} className="spin"/>Saving...</>:<><Save size={14}/>Save Note</>}
        </button>
      </div>
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
  const [allStaff,setAllStaff]=useState([]);
  useEffect(()=>{getAllStaffFromDB().then(setAllStaff);},[]);

  const filtered=tickets.filter(t=>{
    const d=new Date(t.raised_at);
    const s=dateRange.start?new Date(dateRange.start.getFullYear(),dateRange.start.getMonth(),dateRange.start.getDate()):null;
    const e=dateRange.end?new Date(dateRange.end.getFullYear(),dateRange.end.getMonth(),dateRange.end.getDate(),23,59,59):null;
    return(!s||d>=s)&&(!e||d<=e);
  });

  const total=filtered.length;
  const resolved=filtered.filter(t=>t.status==="Resolved").length;
  const resolvedInTat=filtered.filter(t=>isWithinOla(t)).length;
  const breached=filtered.filter(t=>isSlaBreached(t)).length;
  const avgRes=resolved>0?Math.round(filtered.filter(t=>t.resolved_at).reduce((a,t)=>a+(new Date(t.resolved_at)-new Date(t.raised_at))/3600000,0)/resolved):0;
  const slaCompliance=pct(resolvedInTat,resolved||1);
  const resolutionRate=pct(resolved,total||1);

  const byCat=Object.entries(MAIN_CATEGORIES).map(([key,cat])=>{
    const catTickets=filtered.filter(t=>t.software===key);
    const catResolved=catTickets.filter(t=>t.status==="Resolved").length;
    const catInTat=catTickets.filter(t=>isWithinOla(t)).length;
    return{key,label:cat.label,color:cat.color,bg:cat.bg,count:catTickets.length,resolved:catResolved,inTat:catInTat,compliance:catResolved>0?pct(catInTat,catResolved):null};
  });

  const staffNames=[...new Set(allStaff.map(s=>s.name))];
  const byAssignee=staffNames.map(a=>{
    const at=filtered.filter(t=>t.assigned_to===a);
    const ar=at.filter(t=>t.status==="Resolved").length;
    const ai=at.filter(t=>isWithinOla(t)).length;
    return{name:a,total:at.length,resolved:ar,inTat:ai,compliance:ar>0?pct(ai,ar):null};
  });

  const byPriority=PRIORITIES.map(p=>{
    const pt=filtered.filter(t=>t.priority===p);
    const pr=pt.filter(t=>t.status==="Resolved").length;
    const pi=pt.filter(t=>isWithinOla(t)).length;
    return{priority:p,total:pt.length,resolved:pr,inTat:pi,compliance:pr>0?pct(pi,pr):null};
  });

  function complianceColor(pct){return pct>=90?"#16a34a":pct>=70?"#d97706":"#dc2626";}

  function downloadCSV(){
    const rows=[
      ["ABMH IT HelpDesk Report"],
      [`Period: ${dateRange.start?fmtDate(dateRange.start.toISOString()):"All"} to ${dateRange.end?fmtDate(dateRange.end.toISOString()):"Today"}`],
      [`Total: ${total} | Resolved: ${resolved} | OLA Compliance: ${slaCompliance}% | Avg Resolution: ${avgRes}h`],
      [],
      ["Ticket ID","Raised By","Dept","Category","Sub-Category","Issue","Priority","Status","Assigned To","Raised At","OLA Deadline","Resolved At","Within OLA"],
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
      <p style="color:#6b7280">Period: ${dateRange.start?fmtDate(dateRange.start.toISOString()):"All"} to ${dateRange.end?fmtDate(dateRange.end.toISOString()):"Today"} | Generated: ${new Date().toLocaleString("en-IN")}</p>
      <div class="summary">
        <div class="card"><div class="num">${total}</div><div class="lbl">Total Tickets</div></div>
        <div class="card"><div class="num">${resolved}</div><div class="lbl">Resolved</div></div>
        <div class="card"><div class="num" style="color:${complianceColor(slaCompliance)}">${slaCompliance}%</div><div class="lbl">OLA Compliance</div></div>
        <div class="card"><div class="num">${avgRes}h</div><div class="lbl">Avg Resolution</div></div>
        <div class="card"><div class="num" style="color:#dc2626">${breached}</div><div class="lbl">OLA Breached</div></div>
      </div>
      <h2 style="color:#374151;font-size:14px;margin:16px 0 8px">All Tickets</h2>
      <table><tr><th>Ticket ID</th><th>Raised By</th><th>Category</th><th>Sub-Cat</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Within OLA</th></tr>
        ${filtered.map(t=>`<tr><td>${t.id}</td><td>${t.user_name}</td><td>${MAIN_CATEGORIES[t.software]?.label||t.software}</td><td>${t.category}</td><td>${t.priority}</td><td>${t.status}</td><td>${t.assigned_to||"—"}</td><td>${(!t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline))?"✅ Yes":"❌ No"}</td></tr>`).join("")}
      </table>
    </body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
  }

  return(
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>Reports & Analytics</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:16}}>OLA compliance, Response & Resolution time metrics</p>
      <div className="fu1" style={{marginBottom:20}}>
        <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:8,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Date Range</label>
        <DateRangePicker startDate={dateRange.start} endDate={dateRange.end} onChange={({start,end})=>setDateRange({start,end})}/>
      </div>
      <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[{label:"Total Tickets",val:total,color:RED},{label:"Resolved",val:resolved,color:"#16a34a"},{label:"OLA Compliance",val:`${slaCompliance}%`,color:complianceColor(slaCompliance)},{label:"Avg Resolution",val:`${avgRes}h`,color:"#0369a1"},{label:"Within OLA",val:resolvedInTat,color:"#16a34a"},{label:"OLA Breached",val:breached,color:"#dc2626"}].map((s,i)=>(
          <div key={s.label} className="fu" style={{animationDelay:`${i*.05}s`,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <p style={{color:s.color,fontSize:22,fontWeight:800,lineHeight:1}}>{s.val}</p>
            <p style={{color:"#6b7280",fontSize:12,marginTop:4}}>{s.label}</p>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <button onClick={downloadCSV} style={{flex:1,padding:"12px 0",background:"#f0fdf4",border:"1.5px solid #16a34a",borderRadius:10,color:"#16a34a",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Download size={16}/> Excel (CSV)
        </button>
        <button onClick={downloadPDF} style={{flex:1,padding:"12px 0",background:LIGHT,border:`1.5px solid ${RED}`,borderRadius:10,color:RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Download size={16}/> PDF / Print
        </button>
      </div>
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
                    <p style={{color:met?"#16a34a":"#dc2626",fontSize:11,fontWeight:600,marginTop:4}}>{met?"✓ Within OLA":"✗ Breached"}</p>
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
  function verify(){if(password===getAdminPassword()){setVerified(true);setErr("");}else setErr("Incorrect password.");}
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
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>OLA Configuration</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>Response & Resolution times per category (hours)</p>
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
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:20}}>
          <p style={{color:"#1a1a2e",fontWeight:700,fontSize:15,marginBottom:6}}>Admin Verification Required</p>
          <input style={{...INP,marginBottom:12}} type="password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&verify()}/>
          {err&&<ErrBox msg={err}/>}
          <button onClick={verify} style={BTN}>Verify & Edit</button>
          <button onClick={()=>{setEditMode(false);setPassword("");setErr("");}} style={{...BTN,marginTop:8,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}>Cancel</button>
        </div>
      ):(
        <>
          {err&&<ErrBox msg={err}/>}
          <button onClick={saveAll} disabled={saving} style={BTN}>{saving?<><Loader size={16} className="spin"/>Saving...</>:<><Save size={16}/>Save SLA Changes</>}</button>
          <button onClick={()=>{setEditMode(false);setVerified(false);setPassword("");setLocal(slaConfig);}} style={{...BTN,marginTop:8,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}><X size={16}/>Cancel</button>
        </>
      )}
    </div>
  );
}

// ─── Password Manager ─────────────────────────────────────────────────────────
// FIX 3: Passwords now saved to Supabase it_team table
function PasswordManager(){
  const [adminPwd,setAdminPwd]=useState(getAdminPassword());
  const [editing,setEditing]=useState(null);
  const [newPwd,setNewPwd]=useState("");
  const [show,setShow]=useState({});
  const [saved,setSaved]=useState("");
  const [pmTab,setPmTab]=useState("passwords");
  const [dynStaff,setDynStaff]=useState(null);
  const [addForm,setAddForm]=useState({team:"Software",name:"",emp_id:"",password:""});
  const [addErr,setAddErr]=useState("");
  const [teamSaved,setTeamSaved]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ loadDynStaff(); },[]);

  async function loadDynStaff(){
    try{
      const rows=await sbGet("it_team","order=team.asc,level.asc,name.asc");
      setDynStaff(rows||[]);
    }catch(e){ setDynStaff([]); }
  }

  // FIX 3: Save password to Supabase instead of localStorage
  async function saveChange(){
    if(!newPwd||newPwd.length<4){alert("Password must be at least 4 characters.");return;}
    setSaving(true);
    if(editing==="admin"){
      saveAdminPassword(newPwd);
      setAdminPwd(newPwd);
      setSaved("admin");
    } else {
      try{
        // Save directly to Supabase it_team table using emp_id
        await sbPatch("it_team",`emp_id=eq.${encodeURIComponent(editing)}`,{password:newPwd});
        setSaved(editing);
        await loadDynStaff(); // Refresh staff list
      }catch(e){
        alert("Failed to save password to database. Please try again.");
        setSaving(false);
        return;
      }
    }
    setEditing(null);setNewPwd("");
    setTimeout(()=>setSaved(""),3000);
    setSaving(false);
  }

  async function addMember(){
    setAddErr("");
    if(!addForm.name.trim()||!addForm.emp_id.trim()||!addForm.password.trim()){setAddErr("All fields required.");return;}
    if(addForm.password.length<4){setAddErr("Password min 4 chars.");return;}
    try{
      await sbPost("it_team",{team:addForm.team,level:"L1",name:addForm.name.trim(),emp_id:addForm.emp_id.trim(),password:addForm.password.trim()});
      setAddForm({team:"Software",name:"",emp_id:"",password:""});
      setTeamSaved("Member added!");
      setTimeout(()=>setTeamSaved(""),3000);
      await loadDynStaff();
    }catch(e){setAddErr("Failed to save. Check it_team table exists.");}
  }

  async function deleteMember(empId){
    if(!window.confirm("Remove this member?"))return;
    try{
      await fetch(`${API}/it_team?emp_id=eq.${encodeURIComponent(empId)}`,{method:"DELETE",headers:H({"Prefer":"return=minimal"})});
      setTeamSaved("Member removed!");
      setTimeout(()=>setTeamSaved(""),3000);
      await loadDynStaff();
    }catch(e){alert("Delete failed.");}
  }

  const LEVEL_COLOR={L1:"#16a34a",L2:RED};
  const TEAM_LABELS=["Software","Hardware & Ops","Network"];

  return(
    <div style={{padding:20,maxWidth:600,margin:"0 auto"}}>
      <h2 style={{color:"#1a1a2e",fontSize:18,fontWeight:800,marginBottom:4}}>Staff & Passwords</h2>
      <p style={{color:"#6b7280",fontSize:13,marginBottom:16}}>Manage IT team members and login passwords.</p>
      <div style={{display:"flex",gap:8,marginBottom:20,background:"#f3f4f6",borderRadius:10,padding:4}}>
        {[["passwords","🔑 Passwords"],["team","👥 Team Management"]].map(([t,l])=>(
          <button key={t} onClick={()=>setPmTab(t)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:pmTab===t?"#fff":"transparent",color:pmTab===t?"#1a1a2e":"#6b7280",fontWeight:pmTab===t?700:500,fontSize:13,cursor:"pointer",boxShadow:pmTab===t?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{l}</button>
        ))}
      </div>

      {pmTab==="passwords"&&(<>
        {saved&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:16,color:"#16a34a",fontWeight:600,fontSize:13}}>✅ Password updated in database!</div>}

        {/* Admin password */}
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:10,background:LIGHT,display:"flex",alignItems:"center",justifyContent:"center"}}><Settings size={18} color={RED}/></div>
              <div>
                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>Admin</p>
                <p style={{color:"#9ca3af",fontSize:12}}>Full dashboard access</p>
              </div>
            </div>
            <button onClick={()=>{setEditing("admin");setNewPwd("");}} style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${RED}`,background:LIGHT,color:RED,fontSize:12,fontWeight:700,cursor:"pointer"}}>Change</button>
          </div>
          {editing==="admin"&&(
            <div style={{marginTop:12,display:"flex",gap:8}}>
              <div style={{flex:1,position:"relative"}}>
                <input style={{...INP,paddingRight:60}} type={show["admin"]?"text":"password"} placeholder="New password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveChange()}/>
                <button onClick={()=>setShow(s=>({...s,admin:!s.admin}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:11}}>{show["admin"]?"Hide":"Show"}</button>
              </div>
              <button onClick={saveChange} disabled={saving} style={{padding:"0 16px",borderRadius:8,background:RED,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{saving?"...":"Save"}</button>
              <button onClick={()=>{setEditing(null);setNewPwd("");}} style={{padding:"0 12px",borderRadius:8,background:"#f3f4f6",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13}}>✕</button>
            </div>
          )}
        </div>

        {/* Staff passwords from DB */}
        {dynStaff===null?<Spinner/>:TEAM_LABELS.map(teamLabel=>{
          const members=dynStaff.filter(s=>s.team===teamLabel);
          if(!members.length)return null;
          return(
            <div key={teamLabel} style={{marginBottom:16}}>
              <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{teamLabel}</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {members.map(staff=>(
                  <div key={staff.emp_id} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,padding:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:10,background:staff.level==="L2"?LIGHT:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center"}}><User size={16} color={LEVEL_COLOR[staff.level]}/></div>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{staff.name}</p>
                            <span style={{background:staff.level==="L2"?LIGHT:"#f0fdf4",color:LEVEL_COLOR[staff.level],fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:4,border:`1px solid ${LEVEL_COLOR[staff.level]}30`}}>{staff.level}</span>
                          </div>
                          <p style={{color:"#9ca3af",fontSize:11}}>ID: {staff.emp_id}</p>
                        </div>
                      </div>
                      <button onClick={()=>{setEditing(staff.emp_id);setNewPwd("");}} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${LEVEL_COLOR[staff.level]}`,background:staff.level==="L2"?LIGHT:"#f0fdf4",color:LEVEL_COLOR[staff.level],fontSize:12,fontWeight:700,cursor:"pointer"}}>Change</button>
                    </div>
                    {editing===staff.emp_id&&(
                      <div style={{marginTop:10,display:"flex",gap:8}}>
                        <div style={{flex:1,position:"relative"}}>
                          <input style={{...INP,paddingRight:60}} type={show[staff.emp_id]?"text":"password"} placeholder="New password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveChange()}/>
                          <button onClick={()=>setShow(s=>({...s,[staff.emp_id]:!s[staff.emp_id]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",fontSize:11}}>{show[staff.emp_id]?"Hide":"Show"}</button>
                        </div>
                        <button onClick={saveChange} disabled={saving} style={{padding:"0 14px",borderRadius:8,background:RED,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>{saving?"...":"Save"}</button>
                        <button onClick={()=>{setEditing(null);setNewPwd("");}} style={{padding:"0 10px",borderRadius:8,background:"#f3f4f6",border:"none",color:"#6b7280",cursor:"pointer",fontSize:13}}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{background:"#f9fafb",border:"1px dashed #e5e7eb",borderRadius:12,padding:14,marginTop:8}}>
          <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>Escalation Chain (View Only)</p>
          {[["L3","Suraj Kumar"],["L4","Harshad Raut"]].map(([lvl,name])=>(
            <div key={lvl} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #f3f4f6"}}>
              <span style={{background:"#f3f4f6",color:"#374151",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,minWidth:28,textAlign:"center"}}>{lvl}</span>
              <span style={{color:"#374151",fontSize:13,fontWeight:600}}>{name}</span>
              <span style={{color:"#9ca3af",fontSize:11,marginLeft:"auto"}}>No portal login</span>
            </div>
          ))}
        </div>
      </>)}

      {pmTab==="team"&&(<>
        {teamSaved&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 14px",marginBottom:16,color:"#16a34a",fontWeight:600,fontSize:13}}>✅ {teamSaved}</div>}
        {addErr&&<div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 14px",marginBottom:16,color:RED,fontWeight:600,fontSize:13}}>⚠️ {addErr}</div>}
        <div style={{background:"#fff",border:`1.5px solid ${RED}30`,borderRadius:14,padding:16,marginBottom:20}}>
          <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:12}}>➕ Add New Member</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <p style={{color:"#6b7280",fontSize:11,fontWeight:600,marginBottom:4}}>TEAM</p>
              <div style={{display:"flex",gap:8}}>
                {TEAM_LABELS.map(k=>(
                  <button key={k} onClick={()=>setAddForm(f=>({...f,team:k}))} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`2px solid ${addForm.team===k?RED:"#e5e7eb"}`,background:addForm.team===k?LIGHT:"#fff",color:addForm.team===k?RED:"#6b7280",fontSize:11,fontWeight:700,cursor:"pointer"}}>{k}</button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <p style={{color:"#6b7280",fontSize:11,fontWeight:600,marginBottom:4}}>FULL NAME</p>
                <input style={INP} placeholder="e.g. Rahul Sharma" value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div>
                <p style={{color:"#6b7280",fontSize:11,fontWeight:600,marginBottom:4}}>EMPLOYEE ID</p>
                <input style={INP} placeholder="e.g. 12345" value={addForm.emp_id} onChange={e=>setAddForm(f=>({...f,emp_id:e.target.value}))}/>
              </div>
            </div>
            <div>
              <p style={{color:"#6b7280",fontSize:11,fontWeight:600,marginBottom:4}}>PASSWORD</p>
              <input style={INP} placeholder="Min 4 characters" value={addForm.password} onChange={e=>setAddForm(f=>({...f,password:e.target.value}))}/>
            </div>
            <button onClick={addMember} style={{padding:"10px",borderRadius:10,background:RED,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add Member</button>
          </div>
        </div>
        {dynStaff===null?<Spinner/>:TEAM_LABELS.map(teamLabel=>{
          const members=dynStaff.filter(s=>s.team===teamLabel);
          return(
            <div key={teamLabel} style={{marginBottom:16}}>
              <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.5px"}}>{teamLabel}</p>
              {members.length===0?(
                <div style={{background:"#f9fafb",borderRadius:10,padding:"12px 16px",color:"#9ca3af",fontSize:13}}>No members added yet</div>
              ):members.map(s=>(
                <div key={s.emp_id} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:34,height:34,borderRadius:9,background:s.level==="L2"?LIGHT:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center"}}><User size={15} color={LEVEL_COLOR[s.level]}/></div>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{s.name}</p>
                        <span style={{background:s.level==="L2"?LIGHT:"#f0fdf4",color:LEVEL_COLOR[s.level],fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:4}}>{s.level}</span>
                      </div>
                      <p style={{color:"#9ca3af",fontSize:11}}>ID: {s.emp_id}</p>
                    </div>
                  </div>
                  <button onClick={()=>deleteMember(s.emp_id)} style={{padding:"6px 12px",borderRadius:8,border:"1.5px solid #fca5a5",background:"#fff0f0",color:RED,fontSize:12,fontWeight:700,cursor:"pointer"}}>Remove</button>
                </div>
              ))}
            </div>
          );
        })}
      </>)}
    </div>
  );
}

// ─── Admin App ────────────────────────────────────────────────────────────────
function AdminApp({onLogout,notifProps}){
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
  const [allStaff,setAllStaff]=useState([]);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const [t,s,staff]=await Promise.all([
        sbGet("tickets","order=raised_at.desc"),
        sbGet("sla_config","order=id.asc"),
        getAllStaffFromDB(),
      ]);
      setTickets(t);setSlaConfig(s);setAllStaff(staff);
    }catch(e){setErr("Failed to load data.");}
    setLoading(false);
  },[]);

  useEffect(()=>{load();},[load]);
  function onUpdate(id,changes){setTickets(prev=>prev.map(t=>t.id===id?{...t,...changes}:t));}

  const total=tickets.length;
  const open=tickets.filter(t=>t.status==="Open").length;
  const resolved=tickets.filter(t=>t.status==="Resolved").length;
  const breached=tickets.filter(t=>isSlaBreached(t)).length;

  const filtered=tickets.filter(t=>
    (filterCat==="all"||t.software===filterCat)&&
    (filterStatus==="all"||t.status===filterStatus)&&
    (filterAssignee==="all"||t.assigned_to===filterAssignee)&&
    (!search||t.id.toLowerCase().includes(search.toLowerCase())||t.user_name?.toLowerCase().includes(search.toLowerCase())||t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const NAV=[["dashboard",LayoutDashboard,"Dashboard"],["tickets",FileText,"Tickets"],["reports",BarChart2,"Reports"],["sla",Settings,"OLA"],["passwords",User,"Passwords"]];

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
        <div className="main-topbar" style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:10}}>
          <div style={{height:4,background:`linear-gradient(90deg,${RED},${DARK})`}}/>
          <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
            <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
            <div style={{textAlign:"center"}}>
              <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13,lineHeight:1}}>Admin Dashboard</p>
              {breached>0&&<p style={{color:RED,fontSize:11,marginTop:2}}>{breached} OLA breach{breached>1?"es":""}</p>}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <BellNotifications notifications={notifProps?.notifications||[]} onMarkRead={notifProps?.onMarkRead} onMarkAll={notifProps?.onMarkAll}/>
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
                    {[{label:"Total",val:total,color:RED,icon:Ticket},{label:"Open",val:open,color:"#d97706",icon:Bell},{label:"Resolved",val:resolved,color:"#16a34a",icon:CheckCircle},{label:"OLA Breached",val:breached,color:"#dc2626",icon:AlertTriangle}].map((s,i)=>(
                      <div key={s.label} className="fu" style={{animationDelay:`${i*.06}s`,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                        <div style={{width:38,height:38,borderRadius:10,background:`${s.color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><s.icon size={18} color={s.color}/></div>
                        <div><p style={{color:s.color,fontSize:22,fontWeight:800,lineHeight:1}}>{s.val}</p><p style={{color:"#6b7280",fontSize:12,marginTop:3}}>{s.label}</p></div>
                      </div>
                    ))}
                  </div>
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
                  {breached>0&&(
                    <div className="fu3" style={{background:"#fff5f5",border:"1.5px solid #fca5a5",borderRadius:14,padding:16,marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                        <AlertTriangle size={16} color={RED}/>
                        <p style={{color:RED,fontWeight:700,fontSize:14}}>OLA Breached Tickets</p>
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
                  {/* Category-wise breakdown */}
                  <div className="fu3" style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                    <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>Category-wise Summary</p>
                    {Object.entries(MAIN_CATEGORIES).map(([key,cat])=>{
                      const catT=tickets.filter(t=>t.software===key);
                      const catOpen=catT.filter(t=>t.status==="Open"||t.status==="In Progress").length;
                      const catResolved=catT.filter(t=>t.status==="Resolved").length;
                      const catBreached=catT.filter(t=>isSlaBreached(t)).length;
                      const catInTat=catT.filter(t=>isWithinOla(t)).length;
                      const compliance=catResolved>0?pct(catInTat,catResolved):null;
                      const compColor=compliance===null?"#9ca3af":compliance>=90?"#16a34a":compliance>=70?"#d97706":"#dc2626";
                      return(
                        <div key={key} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #f9fafb"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                            <div style={{width:30,height:30,borderRadius:8,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><cat.icon size={14} color={cat.color}/></div>
                            <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13,flex:1}}>{cat.label}</p>
                            <span style={{color:compColor,fontWeight:800,fontSize:13}}>{compliance===null?"—":compliance+"%"}</span>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
                            {[["Total",catT.length,"#374151","#f9fafb"],["Open",catOpen,"#d97706","#fffbeb"],["Resolved",catResolved,"#16a34a","#f0fdf4"],["Breached",catBreached,RED,LIGHT]].map(([l,v,c,bg])=>(
                              <div key={l} style={{background:bg,borderRadius:8,padding:"8px 6px",textAlign:"center",border:`1px solid ${c}15`}}>
                                <p style={{color:c,fontWeight:800,fontSize:16,lineHeight:1}}>{v}</p>
                                <p style={{color:"#9ca3af",fontSize:10,marginTop:2}}>{l}</p>
                              </div>
                            ))}
                          </div>
                          {compliance!==null&&(<div style={{marginTop:8}}><div style={{height:8,background:"#f3f4f6",borderRadius:4,overflow:"hidden"}}><div style={{width:`${compliance}%`,height:"100%",background:compColor,borderRadius:4}}/></div><p style={{color:"#9ca3af",fontSize:10,marginTop:3}}>{catInTat} of {catResolved} resolved within OLA</p></div>)}
                        </div>
                      );
                    })}
                  </div>
                  {/* Technician-wise breakdown */}
                  <div className="fu3" style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                    <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>Technician-wise Summary</p>
                    {allStaff.map(staff=>{
                      const st=tickets.filter(t=>t.assigned_to===staff.name);
                      const stOpen=st.filter(t=>t.status==="Open"||t.status==="In Progress").length;
                      const stResolved=st.filter(t=>t.status==="Resolved").length;
                      const stBreached=st.filter(t=>isSlaBreached(t)).length;
                      const stInTat=st.filter(t=>isWithinOla(t)).length;
                      const compliance=stResolved>0?pct(stInTat,stResolved):null;
                      const compColor=compliance===null?"#9ca3af":compliance>=90?"#16a34a":compliance>=70?"#d97706":"#dc2626";
                      const teamMap={"Software":"software","Hardware & Ops":"hardware","Network":"network"};
                      const teamCatDef=MAIN_CATEGORIES[teamMap[staff.team]||"software"];
                      return(
                        <div key={staff.emp_id} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #f9fafb"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                            <div style={{width:34,height:34,borderRadius:10,background:staff.level==="L2"?LIGHT:"#f0fdf4",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><User size={14} color={staff.level==="L2"?RED:"#16a34a"}/></div>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13}}>{staff.name}</p>
                                <span style={{background:staff.level==="L2"?LIGHT:"#f0fdf4",color:staff.level==="L2"?RED:"#16a34a",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:4}}>{staff.level}</span>
                                {teamCatDef&&<span style={{background:teamCatDef.bg,color:teamCatDef.color,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:4}}>{staff.team}</span>}
                              </div>
                            </div>
                            <span style={{color:compColor,fontWeight:800,fontSize:13}}>{compliance===null?"—":compliance+"%"}</span>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
                            {[["Total",st.length,"#374151","#f9fafb"],["Open",stOpen,"#d97706","#fffbeb"],["Resolved",stResolved,"#16a34a","#f0fdf4"],["Breached",stBreached,RED,LIGHT]].map(([l,v,c,bg])=>(
                              <div key={l} style={{background:bg,borderRadius:8,padding:"8px 6px",textAlign:"center",border:`1px solid ${c}15`}}>
                                <p style={{color:c,fontWeight:800,fontSize:16,lineHeight:1}}>{v}</p>
                                <p style={{color:"#9ca3af",fontSize:10,marginTop:2}}>{l}</p>
                              </div>
                            ))}
                          </div>
                          {compliance!==null&&(<div style={{marginTop:8}}><div style={{height:8,background:"#f3f4f6",borderRadius:4,overflow:"hidden"}}><div style={{width:`${compliance}%`,height:"100%",background:compColor,borderRadius:4}}/></div><p style={{color:"#9ca3af",fontSize:10,marginTop:3}}>{stInTat} of {stResolved} resolved within OLA</p></div>)}
                        </div>
                      );
                    })}
                  </div>
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
                      {allStaff.map(s=><option key={s.emp_id} value={s.name}>{s.name} ({s.level})</option>)}
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
              {tab==="passwords"&&<PasswordManager/>}
            </div>
          )}
        </div>
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
  const [user,setUser]=useState(()=>{
    try{const s=sessionStorage.getItem("abmh_user");return s?JSON.parse(s):null;}catch{return null;}
  });
  const [slaConfig,setSlaConfig]=useState([]);
  const {toasts,notifications,dismissToast,markRead,markAllRead}=useNotifications(user);

  function login(u){
    try{sessionStorage.setItem("abmh_user",JSON.stringify(u));}catch{}
    setUser(u);
  }
  function logout(){
    try{sessionStorage.removeItem("abmh_user");}catch{}
    setUser(null);
  }

  useEffect(()=>{
    if(user?.role==="user"){
      sbGet("sla_config","order=id.asc").then(setSlaConfig).catch(()=>{});
    }
  },[user]);

  const notifProps={notifications,onMarkRead:markRead,onMarkAll:markAllRead};

  return(
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
      {user===null
        ?<LoginScreen onLogin={login}/>
        :user.role==="admin"
          ?<AdminApp onLogout={logout} notifProps={notifProps}/>
          :user.role==="staff"
            ?<TechnicianApp user={user} onLogout={logout} notifProps={notifProps}/>
            :<UserApp user={user} slaConfig={slaConfig} onLogout={logout} notifProps={notifProps}/>
      }
    </>
  );
}
