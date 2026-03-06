import { useState, useEffect, useCallback } from "react";
import {
  Bug, RefreshCw, GraduationCap, LayoutDashboard, Plus, LogOut,
  Clock, CheckCircle, AlertTriangle, ChevronRight, FileText,
  Ticket, ArrowLeft, Bell, Shield, Activity, Loader, Settings,
  BarChart2, Download, Search, Filter, User, Edit3, Save, X
} from "lucide-react";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const API = `${SUPABASE_URL}/rest/v1`;
const H = (extra = {}) => ({
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
  ...extra
});

const sbGet    = async (t, q="") => { const r = await fetch(`${API}/${t}?${q}`, {headers:H()}); if(!r.ok) throw new Error(await r.text()); return r.json(); };
const sbPost   = async (t, b)    => { const r = await fetch(`${API}/${t}`, {method:"POST",headers:H(),body:JSON.stringify(b)}); if(!r.ok) throw new Error(await r.text()); return r.json(); };
const sbPatch  = async (t, q, b) => { const r = await fetch(`${API}/${t}?${q}`, {method:"PATCH",headers:H(),body:JSON.stringify(b)}); if(!r.ok) throw new Error(await r.text()); return r.json(); };

// ─── Styles ───────────────────────────────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
document.head.appendChild(fl);

const st = document.createElement("style");
st.textContent = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f5f6fa;color:#1a1a2e;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:#c41e3a;border-radius:4px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
  .fu{animation:fadeUp .35s ease both}
  .fu1{animation:fadeUp .35s .05s ease both}
  .fu2{animation:fadeUp .35s .1s ease both}
  .fu3{animation:fadeUp .35s .15s ease both}
  .fu4{animation:fadeUp .35s .2s ease both}
  .si{animation:slideIn .3s ease both}
  .spin{animation:spin 1s linear infinite}
  input,select,textarea{outline:none;font-family:'Plus Jakarta Sans',sans-serif;}
  input:focus,select:focus,textarea:focus{border-color:#c41e3a!important;box-shadow:0 0 0 3px rgba(196,30,58,0.1)!important;}
  select option{background:#fff;color:#1a1a2e;}
  button{font-family:'Plus Jakarta Sans',sans-serif;}
`;
document.head.appendChild(st);

// ─── Constants ────────────────────────────────────────────────────────────────
const ABMH_RED   = "#c41e3a";
const ABMH_DARK  = "#8b0000";
const ABMH_LIGHT = "#fff5f5";

const SOFTWARE_MODULES = {
  HIS: ["OPD Registration","IPD Admission","Billing & Invoicing","Pharmacy","Lab / Pathology","Radiology","EMR / Patient Records","Discharge Summary","Appointment Scheduling","Insurance / TPA","MIS Reports","User Management"],
  ERP: ["Finance & Accounts","Inventory & Stores","Purchase & Procurement","Fixed Assets","Budget Management"],
  PACS: ["Radiology Viewer (DICOM)","Image Archive","Worklist Management","Report Generation","CD Burning","Integration with HIS"],
};

const DEPARTMENTS = ["OPD","IPD","Emergency","Pharmacy","Radiology","Lab / Pathology","Billing","EMR","Admission","ICU","OT","HR","Administration","Blood Bank","CSSD","Dietary","Housekeeping","IT & Networking","Laundry","Maintenance","Medical Records","Mortuary","Neonatology","Nephrology","Neurology","Oncology","Physiotherapy","Security","Social Work","Transplant"];

const CATEGORIES = [
  {id:"bug",     label:"Bug / Error",       icon:Bug,          color:ABMH_RED,   bg:"#fff0f0"},
  {id:"cr",      label:"Change Request",    icon:RefreshCw,    color:"#d97706",  bg:"#fffbeb"},
  {id:"support", label:"Training / Support",icon:GraduationCap,color:"#0369a1",  bg:"#eff6ff"},
];

const PRIORITIES = ["Critical","High","Medium","Low"];
const STATUSES   = ["Open","In Progress","Resolved","Closed"];

const DEFAULT_SLA = {
  bug:     {Critical:2,  High:4,  Medium:8,  Low:24},
  cr:      {Critical:48, High:72, Medium:72, Low:72},
  support: {Critical:1,  High:1,  Medium:2,  Low:4},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId() {
  const d = new Date();
  return `HIS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${String(Math.floor(Math.random()*9000)+1000)}`;
}
function isSlaBreached(t) {
  return t.status!=="Resolved"&&t.status!=="Closed"&&new Date(t.sla_deadline)<new Date();
}
function fmt(iso) {
  if(!iso) return "—";
  return new Date(iso).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function timeLeft(iso) {
  const d = new Date(iso)-new Date();
  if(d<=0) return "BREACHED";
  const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000);
  return h>0?`${h}h ${m}m left`:`${m}m left`;
}
function getSlaHours(slaConfig, category, priority) {
  if(slaConfig.length>0) {
    const row = slaConfig.find(s=>s.category===category&&s.priority===priority);
    if(row) return row.resolution_hours;
  }
  return DEFAULT_SLA[category]?.[priority]||4;
}

// ─── Shared Components ────────────────────────────────────────────────────────
function Logo({small=false}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:small?6:10}}>
      <img src="/abmh-logo-1.png" alt="ABMH" style={{height:small?32:44,objectFit:"contain"}} />
    </div>
  );
}

function StatusBadge({status}) {
  const m = {"Open":{c:"#0369a1",bg:"#eff6ff"},"In Progress":{c:"#d97706",bg:"#fffbeb"},"Resolved":{c:"#16a34a",bg:"#f0fdf4"},"Closed":{c:"#6b7280",bg:"#f9fafb"}};
  const s = m[status]||m["Open"];
  return <span style={{background:s.bg,color:s.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:"0.3px",border:`1px solid ${s.c}30`}}>{status}</span>;
}

function PriorityBadge({priority}) {
  const m = {Critical:{c:"#c41e3a",bg:"#fff0f0"},High:{c:"#dc2626",bg:"#fef2f2"},Medium:{c:"#d97706",bg:"#fffbeb"},Low:{c:"#16a34a",bg:"#f0fdf4"}};
  const s = m[priority]||m["Medium"];
  return <span style={{background:s.bg,color:s.c,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,border:`1px solid ${s.c}30`}}>{priority}</span>;
}

function Spinner({size=24}) {
  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:40}}><Loader size={size} color={ABMH_RED} className="spin"/></div>;
}

function ErrBox({msg}) {
  return <div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 14px",color:"#c41e3a",fontSize:13,margin:"8px 0"}}>{msg}</div>;
}

const INP = {background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:10,padding:"11px 14px",color:"#1a1a2e",width:"100%",fontSize:14,transition:"border .2s,box-shadow .2s"};
const SEL = {...INP,appearance:"none",cursor:"pointer"};
const BTN_PRIMARY = {background:`linear-gradient(135deg,${ABMH_RED},${ABMH_DARK})`,border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",padding:"13px",width:"100%",boxShadow:"0 4px 16px rgba(196,30,58,0.25)",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  const [mode,setMode]         = useState("user");
  const [empId,setEmpId]       = useState("");
  const [empName,setEmpName]   = useState("");
  const [mobile,setMobile]     = useState("");
  const [adminUser,setAdminUser] = useState("");
  const [adminPass,setAdminPass] = useState("");
  const [err,setErr]           = useState("");
  const [loading,setLoading]   = useState(false);
  const [lookingUp,setLookingUp] = useState(false);

  async function lookupEmp(id) {
    if(id.trim().length<3) { setEmpName(""); return; }
    setLookingUp(true);
    try {
      const rows = await sbGet("employees", `employee_id=eq.${encodeURIComponent(id.trim())}&is_active=eq.true`);
      if(rows.length>0) setEmpName(rows[0].name);
      else setEmpName("");
    } catch(e) { setEmpName(""); }
    setLookingUp(false);
  }

  async function handleLogin() {
    setErr(""); setLoading(true);
    try {
      if(mode==="admin") {
        if(adminUser==="admin"&&adminPass==="admin123") onLogin({role:"admin",name:"Admin"});
        else setErr("Invalid admin credentials.");
      } else {
        if(!empName) { setErr("Employee ID not found. Please check and try again."); setLoading(false); return; }
        if(mobile.length<10) { setErr("Please enter a valid 10-digit mobile number."); setLoading(false); return; }
        const rows = await sbGet(
  "employees",
  `employee_id=ilike.${encodeURIComponent(id.trim())}&is_active=eq.true`
);
        if(rows.length>0) onLogin({
  role:"user",
  empId: rows[0].employee_id,
  name: rows[0].name,
  department: rows[0].department,
  mobile
});
        else setErr("Employee not found.");
      }
    } catch(e) { setErr("Connection error. Please try again."); }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fff5f5 0%,#fff 50%,#fef2f2 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Top decorative bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:5,background:`linear-gradient(90deg,${ABMH_RED},${ABMH_DARK})`}} />

      <div className="fu" style={{width:"100%",maxWidth:400}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:60,objectFit:"contain",marginBottom:16}} />
          <h1 style={{color:"#1a1a2e",fontSize:22,fontWeight:800,letterSpacing:"-0.5px"}}>IT HelpDesk Portal</h1>
          <p style={{color:"#6b7280",fontSize:13,marginTop:4}}>Raise & track software complaints</p>
        </div>

        {/* Toggle */}
        <div style={{display:"flex",background:"#f3f4f6",borderRadius:12,padding:4,marginBottom:24,border:"1px solid #e5e7eb"}}>
          {[["user","Staff Login"],["admin","Admin Login"]].map(([v,l]) => (
            <button key={v} onClick={()=>{setMode(v);setErr("");}} style={{flex:1,padding:"10px 0",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .2s",background:mode===v?`linear-gradient(135deg,${ABMH_RED},${ABMH_DARK})`:"transparent",color:mode===v?"#fff":"#6b7280",boxShadow:mode===v?"0 2px 8px rgba(196,30,58,0.2)":"none"}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:24,boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
          {mode==="user" ? (
            <>
              <div style={{marginBottom:14}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:600,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Employee ID</label>
                <div style={{position:"relative"}}>
                  <input style={INP} placeholder="e.g. 9662" value={empId} onChange={e=>{setEmpId(e.target.value);lookupEmp(e.target.value);}} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
                  {lookingUp && <Loader size={14} color={ABMH_RED} className="spin" style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}} />}
                </div>
                {empName && (
                  <div style={{marginTop:8,background:ABMH_LIGHT,border:`1px solid ${ABMH_RED}30`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                    <User size={14} color={ABMH_RED} />
                    <span style={{color:ABMH_RED,fontSize:13,fontWeight:600}}>{empName}</span>
                    <CheckCircle size={14} color="#16a34a" style={{marginLeft:"auto"}} />
                  </div>
                )}
              </div>
              <div style={{marginBottom:20}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:600,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Mobile Number</label>
                <input style={INP} placeholder="10-digit mobile number" maxLength={10} value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,""))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              </div>
            </>
          ) : (
            <>
              <div style={{marginBottom:14}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:600,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Username</label>
                <input style={INP} placeholder="admin" value={adminUser} onChange={e=>setAdminUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              </div>
              <div style={{marginBottom:20}}>
                <label style={{color:"#374151",fontSize:12,fontWeight:600,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Password</label>
                <input style={INP} type="password" placeholder="••••••••" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              </div>
            </>
          )}
          {err && <ErrBox msg={err} />}
          <button onClick={handleLogin} disabled={loading} style={BTN_PRIMARY}>
            {loading?<><Loader size={16} className="spin"/>Verifying...</>:mode==="admin"?"Enter Dashboard →":"Login & Continue →"}
          </button>
        </div>

        <p style={{textAlign:"center",color:"#9ca3af",fontSize:12,marginTop:16}}>Aditya Birla Memorial Hospital · IT Department</p>
      </div>
    </div>
  );
}

// ─── Raise Ticket ─────────────────────────────────────────────────────────────
function RaiseTicket({user,slaConfig,onDone}) {
  const [software,setSoftware]  = useState("");
  const [cat,setCat]            = useState(null);
  const [dept,setDept]          = useState(user.department||"");
  const [mod,setMod]            = useState("");
  const [priority,setPriority]  = useState("Medium");
  const [desc,setDesc]          = useState("");
  const [submitted,setSubmitted]= useState(null);
  const [loading,setLoading]    = useState(false);
  const [err,setErr]            = useState("");

  const modules = software ? SOFTWARE_MODULES[software] : [];

  async function submit() {
    if(!software||!cat||!dept||!mod||!desc.trim()) return;
    setLoading(true); setErr("");
    try {
      const hrs = getSlaHours(slaConfig, cat, priority);
      const ticket = {
        id:genId(), emp_id:user.emp_id, user_name:user.name, dept,
        software, category:cat, module:mod, priority, description:desc,
        status:"Open", raised_at:new Date().toISOString(),
        sla_deadline:new Date(Date.now()+hrs*3600000).toISOString(), note:""
      };
      const result = await sbPost("tickets", ticket);
      const saved = result[0]||ticket;
      // Audit log
      await sbPost("audit_log",{ticket_id:saved.id,action:"Ticket Created",changed_by:user.name,new_value:"Open"});
      setSubmitted(saved);
    } catch(e) { setErr("Failed to submit. Please try again."); }
    setLoading(false);
  }

  if(submitted) {
    const catInfo = CATEGORIES.find(c=>c.id===submitted.category);
    return (
      <div className="fu" style={{padding:20}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"#f0fdf4",border:"2px solid #16a34a",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <CheckCircle size={30} color="#16a34a"/>
          </div>
          <h2 style={{color:"#1a1a2e",fontSize:20,fontWeight:800}}>Ticket Raised!</h2>
          <p style={{color:"#6b7280",fontSize:13,marginTop:4}}>Saved successfully · IT team notified</p>
        </div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:16,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:14,borderBottom:"1px solid #f3f4f6"}}>
            <span style={{color:ABMH_RED,fontSize:15,fontWeight:800}}>{submitted.id}</span>
            <StatusBadge status="Open"/>
          </div>
          {[["Software",submitted.software],["Category",catInfo?.label],["SLA Deadline",fmt(submitted.sla_deadline)],["Module",submitted.module],["Department",submitted.dept],["Priority",submitted.priority]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
              <span style={{color:"#6b7280",fontSize:13}}>{k}</span>
              <span style={{color:"#1a1a2e",fontSize:13,fontWeight:600}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop:12,background:ABMH_LIGHT,border:`1px solid ${ABMH_RED}20`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
            <Clock size={14} color={ABMH_RED}/>
            <span style={{color:ABMH_RED,fontSize:13,fontWeight:600}}>{timeLeft(submitted.sla_deadline)}</span>
          </div>
        </div>
        <button onClick={onDone} style={{...BTN_PRIMARY,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}>
          View My Tickets →
        </button>
      </div>
    );
  }

  const canSubmit = software&&cat&&dept&&mod&&desc.trim()&&!loading;

  return (
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>Raise a Ticket</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>All fields are required</p>

      {/* Software Selection */}
      <p className="fu1" style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Select Software</p>
      <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {["HIS","ERP","PACS"].map(s=>(
          <button key={s} onClick={()=>{setSoftware(s);setMod("");}} style={{padding:"14px 8px",borderRadius:12,border:`2px solid ${software===s?ABMH_RED:"#e5e7eb"}`,background:software===s?ABMH_LIGHT:"#fff",cursor:"pointer",transition:"all .2s",textAlign:"center"}}>
            <p style={{color:software===s?ABMH_RED:"#1a1a2e",fontWeight:800,fontSize:16}}>{s}</p>
            <p style={{color:software===s?ABMH_RED:"#9ca3af",fontSize:10,marginTop:2}}>{s==="HIS"?"Hospital IS":s==="ERP"?"Enterprise RP":"Picture Archiving"}</p>
          </button>
        ))}
      </div>

      {/* Category */}
      <p className="fu1" style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Issue Category</p>
      <div className="fu2" style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {CATEGORIES.map(c=>{
          const hrs = getSlaHours(slaConfig,c.id,priority);
          return (
            <button key={c.id} onClick={()=>setCat(c.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:cat===c.id?c.bg:"#fff",border:`2px solid ${cat===c.id?c.color:"#e5e7eb"}`,borderRadius:12,cursor:"pointer",transition:"all .2s",textAlign:"left"}}>
              <div style={{width:36,height:36,borderRadius:10,background:cat===c.id?c.color+"20":"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <c.icon size={18} color={cat===c.id?c.color:"#9ca3af"}/>
              </div>
              <div style={{flex:1}}>
                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>{c.label}</p>
                <p style={{color:c.color,fontSize:12,marginTop:1}}>⏱ SLA: {hrs}h ({priority} priority)</p>
              </div>
              {cat===c.id&&<CheckCircle size={18} color={c.color}/>}
            </button>
          );
        })}
      </div>

      <div className="fu3" style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Priority</label>
          <div style={{display:"flex",gap:8}}>
            {PRIORITIES.map(p=>{
              const pc={Critical:ABMH_RED,High:"#dc2626",Medium:"#d97706",Low:"#16a34a"};
              return <button key={p} onClick={()=>setPriority(p)} style={{flex:1,padding:"10px 4px",borderRadius:8,border:`2px solid ${priority===p?pc[p]:"#e5e7eb"}`,background:priority===p?pc[p]+"15":"#fff",color:priority===p?pc[p]:"#9ca3af",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{p}</button>;
            })}
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
          <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Module Affected</label>
          <select style={SEL} value={mod} onChange={e=>setMod(e.target.value)} disabled={!software}>
            <option value="">{software?"Select module":"Select software first"}</option>
            {modules.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:"0.5px"}}>Issue Description</label>
          <textarea style={{...INP,minHeight:100,resize:"vertical"}} placeholder="Describe the issue in detail..." value={desc} onChange={e=>setDesc(e.target.value)}/>
        </div>
      </div>

      {err&&<ErrBox msg={err}/>}
      <button onClick={submit} disabled={!canSubmit} className="fu4" style={{...BTN_PRIMARY,marginTop:20,opacity:canSubmit?1:0.5,cursor:canSubmit?"pointer":"not-allowed"}}>
        {loading?<><Loader size={16} className="spin"/>Submitting...</>:"Submit Ticket →"}
      </button>
    </div>
  );
}

// ─── My Tickets ───────────────────────────────────────────────────────────────
function MyTickets({empId}) {
  const [tickets,setTickets] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr]         = useState("");

  useEffect(()=>{
    (async()=>{
      try { setTickets(await sbGet("tickets",`emp_id=eq.${empId}&order=raised_at.desc`)); }
      catch(e) { setErr("Failed to load tickets."); }
      setLoading(false);
    })();
  },[empId]);

  return (
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
            const catInfo = CATEGORIES.find(c=>c.id===t.category);
            const breached = isSlaBreached(t);
            return (
              <div key={t.id} className="si" style={{animationDelay:`${i*.04}s`,background:breached?"#fff5f5":"#fff",border:`1.5px solid ${breached?"#fca5a5":"#e5e7eb"}`,borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{color:ABMH_RED,fontSize:13,fontWeight:800}}>{t.id}</span>
                  <StatusBadge status={t.status}/>
                </div>
                <p style={{color:"#1a1a2e",fontSize:14,fontWeight:500,marginBottom:10,lineHeight:1.5}}>{t.description.substring(0,80)}{t.description.length>80?"…":""}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  <span style={{background:"#f3f4f6",color:"#374151",fontSize:11,padding:"3px 8px",borderRadius:6,fontWeight:600}}>{t.software}</span>
                  {catInfo&&<span style={{background:catInfo.bg,color:catInfo.color,fontSize:11,padding:"3px 8px",borderRadius:6,fontWeight:600}}>{catInfo.label}</span>}
                  <PriorityBadge priority={t.priority}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#9ca3af",fontSize:12}}>{fmt(t.raised_at)}</span>
                  <span style={{color:breached?ABMH_RED:"#16a34a",fontSize:12,fontWeight:700}}>{timeLeft(t.sla_deadline)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── User App ─────────────────────────────────────────────────────────────────
function UserApp({user,slaConfig,onLogout}) {
  const [tab,setTab] = useState("raise");
  return (
    <div style={{minHeight:"100vh",background:"#f5f6fa",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:10}}>
        <div style={{height:4,background:`linear-gradient(90deg,${ABMH_RED},${ABMH_DARK})`}}/>
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

      <div style={{flex:1,overflowY:"auto",paddingTop:84}}>
        {tab==="raise"?<RaiseTicket user={user} slaConfig={slaConfig} onDone={()=>setTab("mine")}/>:<MyTickets empId={user.emp_id}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #e5e7eb",display:"flex",boxShadow:"0 -2px 8px rgba(0,0,0,0.06)"}}>
        {[["raise",Plus,"Raise Ticket"],["mine",Ticket,"My Tickets"]].map(([id,Icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"12px 0 8px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <Icon size={20} color={tab===id?ABMH_RED:"#9ca3af"}/>
            <span style={{fontSize:11,color:tab===id?ABMH_RED:"#9ca3af",fontWeight:tab===id?700:500}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Admin: Ticket Detail ──────────────────────────────────────────────────────
function TicketDetail({ticketId,tickets,onBack,onUpdate,slaConfig}) {
  const t = tickets.find(x=>x.id===ticketId);
  const [noteInput,setNoteInput] = useState(t?.note||"");
  const [saving,setSaving]       = useState(false);
  const [audit,setAudit]         = useState([]);
  const [loadingAudit,setLoadingAudit] = useState(true);

  useEffect(()=>{
    (async()=>{
      try { setAudit(await sbGet("audit_log",`ticket_id=eq.${ticketId}&order=timestamp.asc`)); }
      catch(e) {}
      setLoadingAudit(false);
    })();
  },[ticketId]);

  if(!t) { onBack(); return null; }
  const catInfo   = CATEGORIES.find(c=>c.id===t.category);
  const breachedT = isSlaBreached(t);

  async function updateStatus(status) {
    setSaving(true);
    try {
      await sbPatch("tickets",`id=eq.${t.id}`,{status, resolved_at: status==="Resolved"?new Date().toISOString():null});
      await sbPost("audit_log",{ticket_id:t.id,action:"Status Changed",changed_by:"Admin",old_value:t.status,new_value:status});
      onUpdate(t.id,{status, resolved_at: status==="Resolved"?new Date().toISOString():null});
      setAudit(prev=>[...prev,{action:"Status Changed",changed_by:"Admin",old_value:t.status,new_value:status,timestamp:new Date().toISOString()}]);
    } catch(e) { alert("Failed to update."); }
    setSaving(false);
  }

  async function saveNote() {
    setSaving(true);
    try {
      await sbPatch("tickets",`id=eq.${t.id}`,{note:noteInput});
      await sbPost("audit_log",{ticket_id:t.id,action:"Note Updated",changed_by:"Admin",new_value:noteInput});
      onUpdate(t.id,{note:noteInput});
    } catch(e) { alert("Failed to save note."); }
    setSaving(false);
  }

  return (
    <div style={{padding:20}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#6b7280",fontSize:13,fontWeight:600,marginBottom:16,padding:0}}>
        <ArrowLeft size={16}/> Back to tickets
      </button>

      {/* Ticket card */}
      <div style={{background:breachedT?"#fff5f5":"#fff",border:`1.5px solid ${breachedT?"#fca5a5":"#e5e7eb"}`,borderRadius:16,padding:20,marginBottom:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <span style={{color:ABMH_RED,fontSize:15,fontWeight:800}}>{t.id}</span>
          <StatusBadge status={t.status}/>
        </div>
        {breachedT&&<div style={{background:"#fff0f0",border:"1px solid #fca5a5",borderRadius:8,padding:"8px 12px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={14} color={ABMH_RED}/><span style={{color:ABMH_RED,fontSize:12,fontWeight:700}}>SLA BREACHED</span></div>}
        <p style={{color:"#1a1a2e",fontSize:14,lineHeight:1.6,marginBottom:16}}>{t.description}</p>
        {[["Raised By",t.user_name],["Department",t.dept],["Software",t.software],["Category",catInfo?.label],["Module",t.module],["Priority",t.priority],["Raised At",fmt(t.raised_at)],["SLA Deadline",fmt(t.sla_deadline)],["SLA Status",timeLeft(t.sla_deadline)],["Resolved At",fmt(t.resolved_at)]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
            <span style={{color:"#6b7280",fontSize:13}}>{k}</span>
            <span style={{color:k==="SLA Status"&&breachedT?ABMH_RED:"#1a1a2e",fontSize:13,fontWeight:600}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Status update */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Update Status</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>updateStatus(s)} disabled={saving} style={{padding:"8px 16px",borderRadius:8,border:`2px solid ${t.status===s?ABMH_RED:"#e5e7eb"}`,background:t.status===s?ABMH_LIGHT:"#fff",color:t.status===s?ABMH_RED:"#6b7280",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{s}</button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.5px"}}>Internal Note</p>
        {t.note&&<p style={{color:"#374151",fontSize:13,marginBottom:10,padding:"8px 10px",background:"#f0fdf4",borderRadius:8,borderLeft:`3px solid #16a34a`}}>{t.note}</p>}
        <textarea style={{...INP,minHeight:70,resize:"vertical"}} value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Add internal note..."/>
        <button onClick={saveNote} disabled={saving} style={{marginTop:8,padding:"9px 18px",background:ABMH_LIGHT,border:`1.5px solid ${ABMH_RED}`,borderRadius:8,color:ABMH_RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          {saving?<><Loader size={14} className="spin"/>Saving...</>:<><Save size={14}/>Save Note</>}
        </button>
      </div>

      {/* Audit trail */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#374151",fontSize:12,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.5px"}}>Audit Trail</p>
        {loadingAudit?<Spinner size={20}/>:audit.length===0?<p style={{color:"#9ca3af",fontSize:13}}>No audit records yet.</p>:(
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {audit.map((a,i)=>(
              <div key={i} style={{display:"flex",gap:12,paddingBottom:12,position:"relative"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:ABMH_RED,flexShrink:0,marginTop:3}}/>
                  {i<audit.length-1&&<div style={{width:2,flex:1,background:"#f3f4f6",marginTop:4}}/>}
                </div>
                <div style={{flex:1}}>
                  <p style={{color:"#1a1a2e",fontSize:13,fontWeight:600}}>{a.action}</p>
                  {a.old_value&&<p style={{color:"#9ca3af",fontSize:12}}>{a.old_value} → <span style={{color:"#16a34a",fontWeight:600}}>{a.new_value}</span></p>}
                  {!a.old_value&&a.new_value&&<p style={{color:"#6b7280",fontSize:12}}>{a.new_value.substring(0,60)}</p>}
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

// ─── Admin: SLA Settings ──────────────────────────────────────────────────────
function SlaSettings({slaConfig,onUpdate}) {
  const [editMode,setEditMode] = useState(false);
  const [password,setPassword] = useState("");
  const [verified,setVerified] = useState(false);
  const [local,setLocal]       = useState(slaConfig);
  const [saving,setSaving]     = useState(false);
  const [err,setErr]           = useState("");

  function verify() {
    if(password==="admin123") { setVerified(true); setErr(""); }
    else setErr("Incorrect password.");
  }

  async function saveAll() {
    setSaving(true);
    try {
      for(const row of local) {
        await sbPatch("sla_config",`id=eq.${row.id}`,{resolution_hours:row.resolution_hours,updated_by:"Admin",updated_at:new Date().toISOString()});
      }
      onUpdate(local);
      setEditMode(false); setVerified(false); setPassword("");
    } catch(e) { setErr("Failed to save SLA changes."); }
    setSaving(false);
  }

  return (
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>SLA Configuration</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:20}}>Priority-based resolution times (in hours)</p>

      {!editMode ? (
        <>
          {CATEGORIES.map(cat=>(
            <div key={cat.id} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><cat.icon size={16} color={cat.color}/></div>
                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>{cat.label}</p>
              </div>
              {PRIORITIES.map(p=>{
                const row = local.find(s=>s.category===cat.id&&s.priority===p);
                return (
                  <div key={p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f9fafb"}}>
                    <PriorityBadge priority={p}/>
                    <span style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>{row?.resolution_hours||"—"}h</span>
                  </div>
                );
              })}
            </div>
          ))}
          <button onClick={()=>setEditMode(true)} style={{...BTN_PRIMARY}}><Edit3 size={16}/> Edit SLA Values</button>
        </>
      ) : !verified ? (
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:20,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{color:"#1a1a2e",fontWeight:700,fontSize:15,marginBottom:6}}>Admin Verification</p>
          <p style={{color:"#6b7280",fontSize:13,marginBottom:16}}>Enter admin password to edit SLA values</p>
          <input style={{...INP,marginBottom:12}} type="password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&verify()}/>
          {err&&<ErrBox msg={err}/>}
          <button onClick={verify} style={BTN_PRIMARY}>Verify & Edit</button>
          <button onClick={()=>{setEditMode(false);setPassword("");setErr("");}} style={{...BTN_PRIMARY,marginTop:8,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}>Cancel</button>
        </div>
      ) : (
        <>
          {CATEGORIES.map(cat=>(
            <div key={cat.id} style={{background:"#fff",border:`1.5px solid ${cat.color}40`,borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:cat.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><cat.icon size={16} color={cat.color}/></div>
                <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14}}>{cat.label}</p>
              </div>
              {PRIORITIES.map(p=>{
                const idx = local.findIndex(s=>s.category===cat.id&&s.priority===p);
                return (
                  <div key={p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f9fafb",gap:12}}>
                    <PriorityBadge priority={p}/>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <input type="number" min={1} max={720} value={local[idx]?.resolution_hours||""} onChange={e=>{const n=[...local];n[idx]={...n[idx],resolution_hours:parseInt(e.target.value)||0};setLocal(n);}} style={{...INP,width:70,textAlign:"center",padding:"6px 8px"}}/>
                      <span style={{color:"#9ca3af",fontSize:13}}>hrs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {err&&<ErrBox msg={err}/>}
          <button onClick={saveAll} disabled={saving} style={BTN_PRIMARY}>{saving?<><Loader size={16} className="spin"/>Saving...</>:<><Save size={16}/>Save SLA Changes</>}</button>
          <button onClick={()=>{setEditMode(false);setVerified(false);setPassword("");setLocal(slaConfig);}} style={{...BTN_PRIMARY,marginTop:8,background:"#f3f4f6",color:"#1a1a2e",boxShadow:"none",border:"1.5px solid #e5e7eb"}}><X size={16}/>Cancel</button>
        </>
      )}
    </div>
  );
}

// ─── Admin: Reports ───────────────────────────────────────────────────────────
function Reports({tickets}) {
  const [period,setPeriod] = useState("weekly");

  const now = new Date();
  const cutoff = period==="weekly" ? new Date(now-7*86400000) : new Date(now.getFullYear(),now.getMonth(),1);
  const filtered = tickets.filter(t=>new Date(t.raised_at)>=cutoff);

  const byStatus   = STATUSES.map(s=>({label:s,count:filtered.filter(t=>t.status===s).length}));
  const byCat      = CATEGORIES.map(c=>({label:c.label,count:filtered.filter(t=>t.category===c.id).length,color:c.color}));
  const bySoftware = ["HIS","ERP","PACS"].map(s=>({label:s,count:filtered.filter(t=>t.software===s).length}));
  const breached   = filtered.filter(t=>isSlaBreached(t)||t.status==="Resolved"&&new Date(t.resolved_at)>new Date(t.sla_deadline)).length;
  const resolved   = filtered.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
  const avgRes     = resolved>0 ? Math.round(filtered.filter(t=>t.resolved_at).reduce((a,t)=>a+(new Date(t.resolved_at)-new Date(t.raised_at))/3600000,0)/resolved) : 0;

  function downloadCSV() {
    const rows = [["Ticket ID","Raised By","Dept","Software","Category","Priority","Status","Raised At","SLA Deadline","Resolved At","SLA Met"],...filtered.map(t=>[t.id,t.user_name,t.dept,t.software,t.category,t.priority,t.status,fmt(t.raised_at),fmt(t.sla_deadline),fmt(t.resolved_at),(!t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline))?"Yes":"No"])];
    const csv = rows.map(r=>r.join(",")).join("\n");
    const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download=`ABMH_HelpDesk_${period}_report.csv`; a.click();
  }

  function downloadPDF() {
    const html = `<html><head><style>body{font-family:sans-serif;padding:20px;color:#1a1a2e;}h1{color:#c41e3a;}table{width:100%;border-collapse:collapse;font-size:12px;}th{background:#c41e3a;color:#fff;padding:8px;}td{padding:7px;border-bottom:1px solid #eee;}tr:nth-child(even){background:#f9fafb;}</style></head><body><h1>ABMH IT HelpDesk — ${period==="weekly"?"Weekly":"Monthly"} Report</h1><p>Generated: ${new Date().toLocaleString("en-IN")}</p><p>Period: ${period==="weekly"?"Last 7 days":"This month"} · Total Tickets: ${filtered.length} · SLA Breached: ${breached} · Avg Resolution: ${avgRes}h</p><br/><table><tr><th>Ticket ID</th><th>Raised By</th><th>Dept</th><th>Software</th><th>Category</th><th>Priority</th><th>Status</th><th>SLA Met</th></tr>${filtered.map(t=>`<tr><td>${t.id}</td><td>${t.user_name}</td><td>${t.dept}</td><td>${t.software}</td><td>${t.category}</td><td>${t.priority}</td><td>${t.status}</td><td>${(!t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline))?"✅":"❌"}</td></tr>`).join("")}</table></body></html>`;
    const w = window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
  }

  const maxCount = Math.max(...byCat.map(c=>c.count),1);

  return (
    <div style={{padding:20}}>
      <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:4}}>Reports</h2>
      <p className="fu1" style={{color:"#6b7280",fontSize:13,marginBottom:16}}>Ticket analytics & downloads</p>

      {/* Period toggle */}
      <div style={{display:"flex",background:"#f3f4f6",borderRadius:10,padding:3,marginBottom:20,border:"1px solid #e5e7eb"}}>
        {[["weekly","Weekly (Last 7 days)"],["monthly","Monthly (This month)"]].map(([v,l])=>(
          <button key={v} onClick={()=>setPeriod(v)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all .2s",background:period===v?"#fff":"transparent",color:period===v?ABMH_RED:"#6b7280",boxShadow:period===v?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{l}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="fu2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[{label:"Total",val:filtered.length,color:ABMH_RED},{label:"Resolved",val:resolved,color:"#16a34a"},{label:"SLA Breached",val:breached,color:"#dc2626"},{label:"Avg Resolution",val:`${avgRes}h`,color:"#0369a1"}].map((s,i)=>(
          <div key={s.label} className="fu" style={{animationDelay:`${i*.06}s`,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <p style={{color:s.color,fontSize:22,fontWeight:800,lineHeight:1}}>{s.val}</p>
            <p style={{color:"#6b7280",fontSize:12,marginTop:4}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* By Category chart */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>By Category</p>
        {byCat.map(c=>(
          <div key={c.label} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#374151",fontSize:13}}>{c.label}</span>
              <span style={{color:c.color,fontWeight:700,fontSize:13}}>{c.count}</span>
            </div>
            <div style={{height:8,background:"#f3f4f6",borderRadius:4,overflow:"hidden"}}>
              <div style={{width:`${(c.count/maxCount)*100}%`,height:"100%",background:c.color,borderRadius:4,transition:"width .6s"}}/>
            </div>
          </div>
        ))}
      </div>

      {/* By Software */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>By Software</p>
        <div style={{display:"flex",gap:10}}>
          {bySoftware.map(s=>(
            <div key={s.label} style={{flex:1,background:ABMH_LIGHT,border:`1px solid ${ABMH_RED}20`,borderRadius:10,padding:"12px 8px",textAlign:"center"}}>
              <p style={{color:ABMH_RED,fontSize:20,fontWeight:800}}>{s.count}</p>
              <p style={{color:"#374151",fontSize:12,fontWeight:600,marginTop:4}}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <button onClick={downloadCSV} style={{flex:1,padding:"12px 0",background:"#f0fdf4",border:"1.5px solid #16a34a",borderRadius:10,color:"#16a34a",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Download size={16}/> Excel (CSV)
        </button>
        <button onClick={downloadPDF} style={{flex:1,padding:"12px 0",background:ABMH_LIGHT,border:`1.5px solid ${ABMH_RED}`,borderRadius:10,color:ABMH_RED,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Download size={16}/> PDF / Print
        </button>
      </div>

      {/* Ticket table */}
      <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
        <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>All Tickets ({filtered.length})</p>
        {filtered.length===0?<p style={{color:"#9ca3af",fontSize:13}}>No tickets in this period.</p>:(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(t=>{
              const met = !t.resolved_at||new Date(t.resolved_at)<=new Date(t.sla_deadline);
              return (
                <div key={t.id} style={{background:"#f9fafb",borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <p style={{color:ABMH_RED,fontSize:12,fontWeight:700}}>{t.id}</p>
                    <p style={{color:"#374151",fontSize:12}}>{t.user_name} · {t.software}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <StatusBadge status={t.status}/>
                    <p style={{color:met?"#16a34a":"#dc2626",fontSize:11,fontWeight:600,marginTop:4}}>{met?"SLA Met":"SLA Breach"}</p>
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

// ─── Admin App ────────────────────────────────────────────────────────────────
function AdminApp({onLogout}) {
  const [tab,setTab]             = useState("dashboard");
  const [tickets,setTickets]     = useState([]);
  const [slaConfig,setSlaConfig] = useState([]);
  const [loading,setLoading]     = useState(true);
  const [err,setErr]             = useState("");
  const [selected,setSelected]   = useState(null);
  const [filterCat,setFilterCat]     = useState("all");
  const [filterStatus,setFilterStatus] = useState("all");
  const [filterSW,setFilterSW]   = useState("all");
  const [search,setSearch]       = useState("");

  const load = useCallback(async()=>{
    setLoading(true);
    try {
      const [t,s] = await Promise.all([sbGet("tickets","order=raised_at.desc"),sbGet("sla_config","order=id.asc")]);
      setTickets(t); setSlaConfig(s);
    } catch(e) { setErr("Failed to load data."); }
    setLoading(false);
  },[]);

  useEffect(()=>{load();},[load]);

  function onUpdate(id,changes) { setTickets(prev=>prev.map(t=>t.id===id?{...t,...changes}:t)); }

  const total    = tickets.length;
  const open     = tickets.filter(t=>t.status==="Open").length;
  const inProg   = tickets.filter(t=>t.status==="In Progress").length;
  const resolved = tickets.filter(t=>t.status==="Resolved"||t.status==="Closed").length;
  const breached = tickets.filter(t=>isSlaBreached(t)).length;

  const filtered = tickets.filter(t=>
    (filterCat==="all"||t.category===filterCat)&&
    (filterStatus==="all"||t.status===filterStatus)&&
    (filterSW==="all"||t.software===filterSW)&&
    (!search||t.id.toLowerCase().includes(search.toLowerCase())||t.user_name?.toLowerCase().includes(search.toLowerCase())||t.description?.toLowerCase().includes(search.toLowerCase()))
  );

  const sel2 = {...SEL,padding:"8px 10px",fontSize:12,width:"auto"};

  if(selected) return (
    <div style={{minHeight:"100vh",background:"#f5f6fa",maxWidth:480,margin:"0 auto"}}>
      <div style={{height:4,background:`linear-gradient(90deg,${ABMH_RED},${ABMH_DARK})`}}/>
      <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
        <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
        <span style={{color:"#1a1a2e",fontWeight:700,fontSize:14,flex:1}}>Ticket Detail</span>
        <button onClick={load} style={{background:ABMH_LIGHT,border:`1px solid ${ABMH_RED}30`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:ABMH_RED,fontSize:12,fontWeight:600}}>↻ Refresh</button>
      </div>
      <div style={{overflowY:"auto"}}>
        <TicketDetail ticketId={selected} tickets={tickets} onBack={()=>setSelected(null)} onUpdate={onUpdate} slaConfig={slaConfig}/>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f5f6fa",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:10}}>
        <div style={{height:4,background:`linear-gradient(90deg,${ABMH_RED},${ABMH_DARK})`}}/>
        <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
          <img src="/abmh-logo-1.png" alt="ABMH" style={{height:32,objectFit:"contain"}}/>
          <div style={{textAlign:"center"}}>
            <p style={{color:"#1a1a2e",fontWeight:700,fontSize:13,lineHeight:1}}>Admin Dashboard</p>
            {breached>0&&<p style={{color:ABMH_RED,fontSize:11,marginTop:2}}>{breached} SLA breach{breached>1?"es":""}</p>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={load} style={{background:ABMH_LIGHT,border:`1px solid ${ABMH_RED}30`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:ABMH_RED,fontSize:13,fontWeight:700}}>↻</button>
            <button onClick={onLogout} style={{background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"#6b7280",display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600}}><LogOut size={14}/></button>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",paddingTop:84,paddingBottom:70}}>
        {loading?<Spinner/>:err?<ErrBox msg={err}/>:(
          <>
            {tab==="dashboard"&&(
              <div style={{padding:20}}>
                <div className="fu" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                  {[{label:"Total",val:total,color:ABMH_RED,icon:Ticket},{label:"Open",val:open,color:"#d97706",icon:Bell},{label:"Resolved",val:resolved,color:"#16a34a",icon:CheckCircle},{label:"SLA Breached",val:breached,color:"#dc2626",icon:AlertTriangle}].map((s,i)=>(
                    <div key={s.label} className="fu" style={{animationDelay:`${i*.06}s`,background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                      <div style={{width:38,height:38,borderRadius:10,background:`${s.color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><s.icon size={18} color={s.color}/></div>
                      <div>
                        <p style={{color:s.color,fontSize:22,fontWeight:800,lineHeight:1}}>{s.val}</p>
                        <p style={{color:"#6b7280",fontSize:12,marginTop:3}}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {breached>0&&(
                  <div className="fu2" style={{background:"#fff5f5",border:"1.5px solid #fca5a5",borderRadius:14,padding:16,marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <AlertTriangle size={16} color={ABMH_RED}/>
                      <p style={{color:ABMH_RED,fontWeight:700,fontSize:14}}>SLA Breached Tickets</p>
                    </div>
                    {tickets.filter(t=>isSlaBreached(t)).map(t=>(
                      <div key={t.id} onClick={()=>setSelected(t.id)} style={{background:"#fff",borderRadius:10,padding:"10px 12px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #fca5a5"}}>
                        <div>
                          <p style={{color:"#1a1a2e",fontSize:13,fontWeight:700}}>{t.id}</p>
                          <p style={{color:"#6b7280",fontSize:12}}>{t.user_name} · {t.dept} · {t.software}</p>
                        </div>
                        <ChevronRight size={16} color="#9ca3af"/>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent tickets */}
                <div className="fu3" style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:16,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                  <p style={{color:"#1a1a2e",fontWeight:700,fontSize:14,marginBottom:14}}>Recent Tickets</p>
                  {tickets.slice(0,5).map(t=>{
                    const catInfo = CATEGORIES.find(c=>c.id===t.category);
                    return (
                      <div key={t.id} onClick={()=>setSelected(t.id)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f9fafb",cursor:"pointer"}}>
                        <div>
                          <p style={{color:ABMH_RED,fontSize:12,fontWeight:700}}>{t.id}</p>
                          <p style={{color:"#374151",fontSize:12}}>{t.user_name} · {t.software}</p>
                        </div>
                        <StatusBadge status={t.status}/>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab==="tickets"&&(
              <div style={{padding:20}}>
                <h2 className="fu" style={{color:"#1a1a2e",fontSize:20,fontWeight:800,marginBottom:16}}>All Tickets</h2>
                {/* Search */}
                <div style={{position:"relative",marginBottom:12}}>
                  <Search size={14} color="#9ca3af" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}/>
                  <input style={{...INP,paddingLeft:34}} placeholder="Search tickets..." value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
                {/* Filters */}
                <div className="fu1" style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
                  <select style={sel2} value={filterSW} onChange={e=>setFilterSW(e.target.value)}>
                    <option value="all">All SW</option>
                    {["HIS","ERP","PACS"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <select style={sel2} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
                    <option value="all">All Types</option>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <select style={sel2} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <p className="fu2" style={{color:"#9ca3af",fontSize:12,marginBottom:12}}>{filtered.length} ticket{filtered.length!==1?"s":""}</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {filtered.map((t,i)=>{
                    const catInfo   = CATEGORIES.find(c=>c.id===t.category);
                    const breachedT = isSlaBreached(t);
                    return (
                      <div key={t.id} onClick={()=>setSelected(t.id)} className="si" style={{animationDelay:`${i*.04}s`,background:breachedT?"#fff5f5":"#fff",border:`1.5px solid ${breachedT?"#fca5a5":"#e5e7eb"}`,borderRadius:14,padding:16,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"box-shadow .2s"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                          <span style={{color:ABMH_RED,fontSize:12,fontWeight:800}}>{t.id}</span>
                          <StatusBadge status={t.status}/>
                        </div>
                        <p style={{color:"#1a1a2e",fontSize:13,fontWeight:500,marginBottom:8,lineHeight:1.4}}>{t.description.substring(0,70)}{t.description.length>70?"…":""}</p>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            <span style={{background:"#f3f4f6",color:"#374151",fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:700}}>{t.software}</span>
                            {catInfo&&<span style={{background:catInfo.bg,color:catInfo.color,fontSize:10,padding:"2px 7px",borderRadius:5,fontWeight:700}}>{catInfo.label.split(" ")[0]}</span>}
                            <PriorityBadge priority={t.priority}/>
                          </div>
                          <span style={{color:breachedT?ABMH_RED:"#16a34a",fontSize:11,fontWeight:700}}>{timeLeft(t.sla_deadline)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab==="reports"&&<Reports tickets={tickets}/>}
            {tab==="sla"&&<SlaSettings slaConfig={slaConfig} onUpdate={setSlaConfig}/>}
          </>
        )}
      </div>

      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #e5e7eb",display:"flex",boxShadow:"0 -2px 8px rgba(0,0,0,0.06)"}}>
        {[["dashboard",LayoutDashboard,"Dashboard"],["tickets",FileText,"Tickets"],["reports",BarChart2,"Reports"],["sla",Settings,"SLA"]].map(([id,Icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 0 6px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <Icon size={19} color={tab===id?ABMH_RED:"#9ca3af"}/>
            <span style={{fontSize:10,color:tab===id?ABMH_RED:"#9ca3af",fontWeight:tab===id?700:500}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]         = useState(null);
  const [slaConfig,setSlaConfig] = useState([]);

  useEffect(()=>{
    if(user?.role==="user") {
      sbGet("sla_config","order=id.asc").then(setSlaConfig).catch(()=>{});
    }
  },[user]);

  return user===null
    ? <LoginScreen onLogin={setUser}/>
    : user.role==="admin"
      ? <AdminApp onLogout={()=>setUser(null)}/>
      : <UserApp user={user} slaConfig={slaConfig} onLogout={()=>setUser(null)}/>;
}
