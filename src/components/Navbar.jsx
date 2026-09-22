import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, ChevronDown, Crown, Search, ShieldAlert, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import PremiumModal from './PremiumModal.jsx';

const titles={'/dashboard':'Dashboard','/upload':'Data Upload','/processing':'Processing','/visualization':'Insights','/history':'Transaction History','/security':'Security','/cases':'Cases','/rules':'Rules Lab','/market':'Market','/stocks':'Stocks','/ipos':'IPOs','/screener':'Screener','/portfolio':'Paper Portfolio','/learn':'Learn','/admin/risk':'Risk Command Center'};
const marketPaths=['/market','/stocks','/ipos','/screener','/portfolio'];
const marketItems=[['Reliance Industries','RELIANCE','Energy'],['Tata Consultancy Services','TCS','IT'],['HDFC Bank','HDFCBANK','Financials'],['Infosys','INFY','IT'],['ICICI Bank','ICICIBANK','Financials'],['State Bank of India','SBIN','Financials'],['Tata Motors','TATAMOTORS','Auto'],['Bharti Airtel','BHARTIARTL','Telecom'],['ITC','ITC','Consumer']];
const readKey=u=>`fintel-notifications:${String(u||'user').toLowerCase()}`;
function loadRead(key){try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}}
function saveRead(key,arr){try{localStorage.setItem(key,JSON.stringify(arr.slice(-50)))}catch{}}

export default function Navbar(){
 const loc=useLocation(),nav=useNavigate();const {currentUser,complaints=[]}=useAuth();const {files=[]}=useData();
 const [notifOpen,setNotifOpen]=useState(false),[marketOpen,setMarketOpen]=useState(false),[premiumOpen,setPremiumOpen]=useState(false),[q,setQ]=useState('');const [read,setRead]=useState(()=>loadRead(readKey(currentUser?.email)));
 const searchRef=useRef(null);const isMarket=marketPaths.some(p=>loc.pathname===p||loc.pathname.startsWith(`${p}/`));
 const display=currentUser?.name||currentUser?.email||'User', initials=display.trim().charAt(0).toUpperCase();
 useEffect(()=>setRead(loadRead(readKey(currentUser?.email))),[currentUser?.email]);
 const notifications=useMemo(()=>{
  const items=[];const latest=files[0];
  if(latest)items.push({id:`dataset:${latest.id}` ,title:'Dataset processed',copy:`${latest.name} is available for review.`,route:'/visualization'});
  const high=files.reduce((s,f)=>s+Number(f.riskAnalysis?.counts?.HIGH||0),0);const signature=`risk:${files.map(f=>`${f.id}:${Number(f.riskAnalysis?.counts?.HIGH||0)}`).join('|')}`;
  if(high)items.push({id:signature,title:'Security review required',copy:`${high.toLocaleString()} high-risk records are present.`,route:'/security'});
  const open=complaints.filter(c=>!['resolved','closed'].includes(String(c.status).toLowerCase())).length;
  if(open)items.push({id:`support:${open}`,title:'Open support requests',copy:`${open} request${open===1?'':'s'} need attention.`,route:'/dashboard'});
  return items;
 },[files,complaints]);
 const unread=notifications.filter(n=>!read.includes(n.id)).length;
 const results=marketItems.filter(([name,symbol,type])=>{const x=q.trim().toLowerCase();return !x||[name,symbol,type].some(v=>v.toLowerCase().includes(x))});
 const openNotif=()=>{setMarketOpen(false);setNotifOpen(v=>!v)};
 const markAll=()=>{const next=[...new Set([...read,...notifications.map(n=>n.id)])];setRead(next);saveRead(readKey(currentUser?.email),next)};
 const selectNotif=n=>{const next=[...new Set([...read,n.id])];setRead(next);saveRead(readKey(currentUser?.email),next);setNotifOpen(false);nav(n.route)};
 useEffect(()=>{const h=e=>{if(e.key==='Escape'){setNotifOpen(false);setMarketOpen(false)}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[]);
 return <>
  <header className="topbar"><div className="topbar-left"><span className="topbar-title">{titles[loc.pathname]||'Fintel Secure'}</span></div><div className="topbar-actions">
   {isMarket&&<button className="market-search-btn" onClick={()=>{setNotifOpen(false);setMarketOpen(v=>!v);setQ('')}}><Search size={14}/> Market search</button>}
   <button className="icon-btn" aria-label="Notifications" onClick={openNotif}><Bell size={16}/>{unread>0&&<span className="notif-count">{unread>9?'9+':unread}</span>}</button>
   <button
  className="fintel-plus-btn"
  onClick={() => setPremiumOpen(true)}
  type="button"
>
  <Crown size={15} strokeWidth={2} />
  <span>
    {currentUser?.isPremium
      ? 'FintelPlus Active'
      : 'FintelPlus'}
  </span>
</button>
   <div className="topbar-user">{currentUser?.isPremium&&<Crown size={13} className="plus"/>}<div className="topbar-user-copy"><div className="topbar-user-name">{display}</div><div className="topbar-user-email">{currentUser?.email||''}</div></div><div className="avatar">{initials}</div><ChevronDown size={13} color="#60758a"/></div>
  </div></header>
  {notifOpen&&<div className="popover-backdrop" onMouseDown={()=>setNotifOpen(false)}><div className="top-popover" onMouseDown={e=>e.stopPropagation()}><div className="popover-head"><div><div className="section-title">Notifications</div><div className="section-copy">Only new items are counted as unread.</div></div><button className="btn btn-ghost" onClick={markAll}><CheckCheck size={13}/> Mark all read</button></div><div className="popover-list">{notifications.length?notifications.map(n=><div className="notif-item" key={n.id} onClick={()=>selectNotif(n)}><div className="notif-icon"><ShieldAlert size={14}/></div><div><div className="notif-title">{n.title}{!read.includes(n.id)&&<span style={{marginLeft:6,color:'#d37a83'}}>●</span>}</div><div className="notif-copy">{n.copy}</div></div></div>):<div className="empty-state">No new notifications.</div>}</div></div></div>}
  {marketOpen&&<div className="popover-backdrop" onMouseDown={()=>setMarketOpen(false)}><div className="top-popover market-search-popover" onMouseDown={e=>e.stopPropagation()}><div className="searchbox"><Search size={14}/><input ref={searchRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search company or symbol"/></div><div className="mt-2">{results.slice(0,8).map(([name,symbol,type])=><div className="market-result" key={symbol} onClick={()=>{setMarketOpen(false);nav(`/stocks/${encodeURIComponent(symbol)}`)}}><div className="market-result-name">{name}</div><div className="market-result-meta">{symbol} · {type}</div></div>)}</div></div></div>}
  <PremiumModal open={premiumOpen} onClose={()=>setPremiumOpen(false)}/>
 </>;
}
