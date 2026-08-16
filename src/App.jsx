import { useState, useEffect, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const gid = () => Math.random().toString(36).slice(2, 9);
const SK = "todo_mgr_v12";
const PRI = ["Very High", "High", "Medium", "Low"];
const PC = { "Very High": "#f87171", High: "#fb923c", Medium: "#fbbf24", Low: "#34d399" };
const PBG = { "Very High": "rgba(248,113,113,0.12)", High: "rgba(251,146,60,0.12)", Medium: "rgba(251,191,36,0.12)", Low: "rgba(52,211,153,0.12)" };
const TPAL = ["#a78bfa","#34d399","#f87171","#60a5fa","#f472b6","#4ade80","#fbbf24","#fb923c","#38bdf8","#c084fc"];

// ─── Storage ─────────────────────────────────────────────────────────────────
function ld() { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } }
function sv(d) { try { localStorage.setItem(SK, JSON.stringify(d)); } catch {} }

const init = ld() || {
  tasks: [],
  tags: [
    { id: gid(), name: "Work", color: "#a78bfa" },
    { id: gid(), name: "Personal", color: "#34d399" },
    { id: gid(), name: "Urgent", color: "#f87171" },
  ],
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;background:#0f0f14}
:root{
  --bg:#0f0f14;--bg2:#15151d;--bg3:#1a1a25;
  --s1:#1f1f2e;--s2:#272738;--s3:#2f2f42;--s4:#383850;
  --b1:rgba(255,255,255,0.04);--b2:rgba(255,255,255,0.08);--b3:rgba(255,255,255,0.14);
  --t1:#f0eef8;--t2:#a09cb5;--t3:#5e5a72;
  --ac:#a78bfa;--ac2:#c4b5fd;--ac3:#7c3aed;
  --dg:#f87171;--gn:#34d399;
  --r:14px;--rs:10px;--rx:6px;
  --sh:0 4px 24px rgba(0,0,0,0.4);--sh2:0 12px 48px rgba(0,0,0,0.6);
  --tr:0.2s cubic-bezier(0.4,0,0.2,1);
}
.app{display:flex;height:100vh;overflow:hidden;background:var(--bg);font-family:'Inter',system-ui,sans-serif;color:var(--t1)}

/* Sidebar */
.sb{width:250px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--b1);display:flex;flex-direction:column;transition:width 0.3s cubic-bezier(0.4,0,0.2,1)}
.sb.shut{width:52px}
.sb-head{display:flex;align-items:center;gap:10px;padding:16px 14px;flex-shrink:0;border-bottom:1px solid var(--b1);min-height:60px}
.sb.shut .sb-head{padding:16px 10px;justify-content:center;gap:0}
.sb-logo-i{width:30px;height:30px;background:linear-gradient(135deg,var(--ac),var(--ac3));border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:15px;color:#fff;font-weight:700;flex-shrink:0;box-shadow:0 2px 10px rgba(167,139,250,0.25);transition:opacity 0.2s ease 0.1s,width 0.3s ease}
.sb.shut .sb-logo-i{opacity:0;width:0;overflow:hidden}
.sb-logo-t{font-size:15px;font-weight:700;color:var(--t1);letter-spacing:-0.5px;white-space:nowrap;overflow:hidden;opacity:1;transition:opacity 0.18s ease,width 0.3s ease}
.sb.shut .sb-logo-t{opacity:0;width:0}
.sb-tog{display:flex;align-items:center;justify-content:center;gap:6px;margin-left:auto;height:30px;padding:0 8px;border-radius:7px;border:1px solid var(--b2);background:var(--s1);color:var(--t2);cursor:pointer;font-size:11px;font-weight:600;font-family:inherit;white-space:nowrap;transition:all var(--tr);flex-shrink:0;letter-spacing:-0.2px}
.sb-tog:hover{background:var(--s2);color:var(--t1);border-color:var(--b3)}
.sb-tog:active{transform:scale(0.95)}
.sb-tog-arrow{font-size:13px;transition:transform 0.3s ease}
.sb.shut .sb-tog-arrow{transform:rotate(180deg)}
.sb.shut .sb-tog{margin-left:0;padding:0;width:30px;border:none;background:transparent}
.sb-tog-label{overflow:hidden;transition:opacity 0.18s ease,width 0.3s ease;opacity:1;white-space:nowrap}
.sb.shut .sb-tog-label{opacity:0;width:0}
.sb-body{flex:1;overflow-y:auto;overflow-x:hidden;opacity:1;transition:opacity 0.18s ease}
.sb.shut .sb-body{opacity:0;pointer-events:none}
.sb-body::-webkit-scrollbar{width:4px}
.sb-body::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px}
.sb-body::-webkit-scrollbar-track{background:transparent}
.sb-mini{display:none;flex-direction:column;align-items:center;gap:4px;padding:8px 0;flex:1;overflow-y:auto}
.sb.shut .sb-mini{display:flex}
.sb-mini-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:9px;border:none;background:transparent;color:var(--t3);cursor:pointer;font-size:16px;transition:all var(--tr);position:relative}
.sb-mini-btn:hover{background:var(--s1);color:var(--t1)}
.sb-mini-btn.on{background:var(--s2);color:var(--t1)}
.sb-mini-btn.on::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:0 3px 3px 0;background:var(--ac)}
.sb-mini-dot{position:absolute;top:6px;right:6px;width:6px;height:6px;border-radius:50%;background:var(--ac)}
.sb-lbl{font-size:9px;font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase;padding:16px 16px 6px}
.sb-nav{padding:0 8px}
.nv{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--rs);border:none;background:transparent;color:var(--t2);cursor:pointer;width:100%;text-align:left;font-size:13px;font-weight:500;transition:all var(--tr);font-family:inherit;position:relative;flex-wrap:wrap}
.nv::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:3px;border-radius:0 3px 3px 0;background:var(--ac);opacity:0;transition:opacity var(--tr)}
.nv:hover{color:var(--t1);background:var(--s1)}
.nv.on{color:var(--t1);background:var(--s1)}
.nv.on::before{opacity:1}
.nv-tip{width:100%;font-size:10px;font-weight:400;color:var(--t3);line-height:1.45;padding:2px 0 2px 32px;max-height:0;overflow:hidden;opacity:0;transition:max-height 0.25s ease,opacity 0.2s ease,padding 0.25s ease}
.nv:hover .nv-tip{max-height:40px;opacity:1;padding:4px 0 2px 32px}
.nv-i{font-size:16px;width:22px;text-align:center;flex-shrink:0}
.nv-t{flex:1}
.nv-c{margin-left:auto;font-size:10px;font-weight:700;padding:1px 7px;border-radius:10px;background:var(--s3);color:var(--t2)}
.nv.on .nv-c{background:var(--ac);color:#fff}
.nv-c.gn{background:rgba(52,211,153,0.15);color:var(--gn)}
.sb-flt{padding:0 8px}
.fb{display:flex;align-items:center;gap:9px;padding:7px 12px;border-radius:var(--rx);border:none;background:transparent;cursor:pointer;width:100%;text-align:left;font-size:12px;color:var(--t2);transition:all var(--tr);font-family:inherit}
.fb:hover{background:var(--s1);color:var(--t1)}
.fb.on{background:var(--s1)}
.fb-d{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:transform var(--tr)}
.fb.on .fb-d{transform:scale(1.4)}
.fb-chk{margin-left:auto;font-size:10px;font-weight:700;opacity:0;transition:opacity var(--tr)}
.fb.on .fb-chk{opacity:1}
.sb-hr{height:1px;background:var(--b1);margin:8px 16px}
.sb-clr{margin:4px 12px;padding:7px 0;border-radius:var(--rx);border:1px solid var(--b2);background:transparent;color:var(--t2);cursor:pointer;font-size:11px;font-weight:500;font-family:inherit;transition:all var(--tr);text-align:center}
.sb-clr:hover{background:var(--s1);color:var(--t1);border-color:var(--b3)}

/* Main */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.tb{background:var(--bg2);border-bottom:1px solid var(--b1);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0}
.tb-l{display:flex;align-items:center;gap:14px}
.tb-t{font-size:18px;font-weight:700;color:var(--t1);letter-spacing:-0.5px}
.tb-s{font-size:11px;color:var(--t3);font-weight:500}
.tb-r{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.af{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.afp{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;font-size:10px;font-weight:600;border-radius:20px;border:1px solid var(--b2);background:var(--s1)}
.afp button{background:none;border:none;cursor:pointer;color:var(--t3);font-size:10px;padding:0;transition:color var(--tr)}
.afp button:hover{color:var(--t1)}
.nb{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;font-size:12px;font-weight:600;border-radius:12px;border:none;background:linear-gradient(135deg,var(--ac),var(--ac3));color:#fff;cursor:pointer;transition:all var(--tr);font-family:inherit;box-shadow:0 2px 12px rgba(167,139,250,0.25)}
.nb:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(167,139,250,0.4)}
.nb:active{transform:scale(0.96)}
.srt{display:flex;align-items:center;gap:8px;padding:9px 24px;border-bottom:1px solid var(--b1);flex-shrink:0;background:var(--bg3)}
.srt-l{font-size:10px;font-weight:600;color:var(--t3);letter-spacing:0.5px;text-transform:uppercase}
.sc{padding:4px 12px;font-size:11px;font-weight:500;border-radius:20px;border:1px solid var(--b2);background:transparent;color:var(--t2);cursor:pointer;transition:all var(--tr);font-family:inherit}
.sc:hover{border-color:var(--b3);color:var(--t1)}
.sc.on{background:var(--s2);color:var(--t1);border-color:var(--b3)}
.ct{flex:1;overflow-y:auto;padding:20px 24px}
.ct::-webkit-scrollbar{width:5px}
.ct::-webkit-scrollbar-thumb{background:var(--s3);border-radius:3px}
.ct::-webkit-scrollbar-track{background:transparent}

/* Cards */
.tl{display:flex;flex-direction:column;gap:8px}
.cd{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);overflow:hidden;transition:all var(--tr);animation:fadeUp 0.25s ease both}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.cd:hover{border-color:var(--b2);box-shadow:var(--sh);transform:translateY(-1px)}
.cd.dn{opacity:0.38}
.cd-b{display:flex;align-items:flex-start;gap:11px;padding:14px 16px}
.ck{width:19px;height:19px;border-radius:6px;border:2px solid var(--b3);background:transparent;cursor:pointer;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);font-size:12px;font-weight:800;color:transparent}
.ck:hover{border-color:var(--ac);background:rgba(167,139,250,0.08);transform:scale(1.1)}
.ck.on{background:linear-gradient(135deg,var(--ac),var(--ac3));border-color:transparent;color:#fff;box-shadow:0 2px 8px rgba(167,139,250,0.3)}
.ti{flex:1;min-width:0}
.tt{font-size:13.5px;font-weight:600;color:var(--t1);line-height:1.5}
.tt.dn{text-decoration:line-through;color:var(--t3);font-weight:400}
.tm{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:6px}
.pb{font-size:9px;font-weight:700;padding:3px 8px;border-radius:20px;letter-spacing:0.3px;text-transform:uppercase}
.db{font-size:10px;padding:3px 8px;border-radius:20px;border:1px solid var(--b2);background:var(--s2);color:var(--t2);font-weight:500}
.db.od{color:var(--dg);border-color:rgba(248,113,113,0.25);background:rgba(248,113,113,0.08);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.7}}
.tp{font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px}
.tn{font-size:11px;color:var(--t2);margin-top:6px;line-height:1.6;padding:6px 10px;background:var(--s2);border-radius:8px;border-left:3px solid var(--s4)}
.ds{font-size:10px;color:var(--gn);margin-top:5px;font-weight:600}
.pw{margin-top:8px;display:flex;align-items:center;gap:8px}
.pr{flex:1;height:3px;background:var(--s3);border-radius:3px;overflow:hidden}
.prf{height:100%;border-radius:3px;transition:width 0.5s ease}
.pl{font-size:10px;color:var(--t3);font-weight:600}
.ca{display:flex;align-items:center;gap:2px;flex-shrink:0}
.ab{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:none;background:transparent;color:var(--t3);cursor:pointer;font-size:14px;transition:all var(--tr)}
.ab:hover{background:var(--s2);color:var(--t1)}
.ab:active{transform:scale(0.85)}
.ab.dg:hover{background:rgba(248,113,113,0.1);color:var(--dg)}
.scb{font-size:11px;color:var(--t3);background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:5px;padding:2px 16px 12px 46px;transition:color var(--tr);font-family:inherit;font-weight:500}
.scb:hover{color:var(--t2)}
.ex{padding:0 16px 14px 46px}
.sl{border:1px solid var(--b1);border-radius:var(--rs);overflow:hidden;margin-bottom:10px;background:var(--bg3)}
.si{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;flex-wrap:wrap;transition:background var(--tr)}
.si:not(:last-child){border-bottom:1px solid var(--b1)}
.si:hover{background:var(--s1)}
.stx{flex:1;font-size:12px;color:var(--t1);line-height:1.4;min-width:0}
.stx.dn{text-decoration:line-through;color:var(--t3)}
.stgs{display:flex;gap:3px;flex-wrap:wrap;margin-top:3px}
.stp{display:flex;gap:4px;flex-wrap:wrap;padding:7px 12px;background:rgba(0,0,0,0.2);border-top:1px solid var(--b1);width:100%}
.asr{display:flex;gap:7px}
.asr input{flex:1;font-size:12px;padding:9px 12px;border-radius:var(--rs);border:1px solid var(--b2);background:var(--bg3);color:var(--t1);outline:none;font-family:inherit;transition:all var(--tr)}
.asr input:focus{border-color:var(--ac);box-shadow:0 0 0 3px rgba(167,139,250,0.1)}
.asr input::placeholder{color:var(--t3)}
.asr button{font-size:12px;padding:9px 16px;border-radius:var(--rs);border:none;background:var(--s2);color:var(--t2);cursor:pointer;transition:all var(--tr);font-family:inherit;font-weight:500}
.asr button:hover{background:var(--s3);color:var(--t1)}

/* Empty */
.em{text-align:center;padding:72px 24px;animation:fadeUp 0.3s ease both}
.em-i{font-size:52px;margin-bottom:16px;filter:grayscale(0.3)}
.em-t{font-size:15px;font-weight:600;color:var(--t2);margin-bottom:6px}
.em-s{font-size:12px;color:var(--t3);line-height:1.7;margin-bottom:18px}
.em-cta{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;font-size:12px;font-weight:600;border-radius:12px;border:none;background:linear-gradient(135deg,var(--ac),var(--ac3));color:#fff;cursor:pointer;transition:all var(--tr);font-family:inherit;box-shadow:0 2px 12px rgba(167,139,250,0.2)}
.em-cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(167,139,250,0.35)}

/* Modal / Overlay */
.ov{position:fixed;inset:0;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;backdrop-filter:blur(8px);animation:fadeIn 0.15s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.md{background:var(--bg2);border:1px solid var(--b2);border-radius:20px;box-shadow:var(--sh2);width:100%;max-width:440px;max-height:92vh;overflow-y:auto;animation:mu 0.28s cubic-bezier(0.4,0,0.2,1)}
@keyframes mu{from{transform:translateY(24px) scale(0.96);opacity:0}to{transform:none;opacity:1}}
.md::-webkit-scrollbar{width:4px}
.md::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px}
.md-h{display:flex;align-items:center;justify-content:space-between;padding:20px 22px 0}
.md-h h2{font-size:16px;font-weight:700;letter-spacing:-0.3px}
.md-b{padding:18px 22px 8px}
.md-f{display:flex;gap:8px;justify-content:flex-end;padding:12px 22px 20px}
.fl{margin-bottom:16px}
.fl-l{display:block;font-size:10px;font-weight:700;color:var(--t3);margin-bottom:6px;letter-spacing:0.8px;text-transform:uppercase}
.fl input,.fl select,.fl textarea{width:100%;padding:10px 14px;font-size:13px;border:1px solid var(--b2);border-radius:var(--rs);background:var(--s1);color:var(--t1);outline:none;transition:all var(--tr);font-family:inherit}
.fl input:focus,.fl select:focus,.fl textarea:focus{border-color:var(--ac);box-shadow:0 0 0 4px rgba(167,139,250,0.1)}
.fl input::placeholder,.fl textarea::placeholder{color:var(--t3)}
.fl select option{background:var(--s2)}
.fl textarea{resize:vertical;min-height:68px;line-height:1.6}
.ps{display:flex;gap:6px;flex-wrap:wrap}
.po{flex:1;min-width:55px;padding:8px 4px;font-size:10px;font-weight:700;border-radius:var(--rs);border:2px solid var(--b2);background:transparent;cursor:pointer;transition:all var(--tr);text-align:center;color:var(--t2);font-family:inherit;letter-spacing:0.3px}
.po:hover{border-color:var(--b3)}
.po.sel{color:#fff;border-color:transparent}
.ts{display:flex;gap:6px;flex-wrap:wrap}
.tg{font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px;border:2px solid;cursor:pointer;transition:all var(--tr);display:inline-flex;align-items:center;gap:4px;background:transparent;font-family:inherit}
.blc{display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:var(--rs);border:1px solid var(--b2);background:var(--s1);cursor:pointer;transition:all var(--tr)}
.blc:hover{border-color:var(--b3)}
.blc input{width:15px;height:15px;accent-color:var(--ac);cursor:pointer}
.blc span{font-size:12px;color:var(--t2);font-weight:500}
.bts{padding:8px 16px;font-size:12px;font-weight:600;border-radius:12px;border:1px solid var(--b2);background:transparent;color:var(--t2);cursor:pointer;transition:all var(--tr);font-family:inherit}
.bts:hover{background:var(--s1);color:var(--t1)}
.btp{padding:8px 22px;font-size:12px;font-weight:600;border-radius:12px;border:none;background:linear-gradient(135deg,var(--ac),var(--ac3));color:#fff;cursor:pointer;transition:all var(--tr);font-family:inherit;box-shadow:0 2px 10px rgba(167,139,250,0.2)}
.btp:hover{box-shadow:0 4px 16px rgba(167,139,250,0.35)}
.btp:active{transform:scale(0.96)}
.btp:disabled{opacity:0.25;cursor:not-allowed;box-shadow:none}
.btd{padding:8px 22px;font-size:12px;font-weight:600;border-radius:12px;border:none;background:linear-gradient(135deg,#f87171,#dc2626);color:#fff;cursor:pointer;transition:all var(--tr);font-family:inherit}
.btd:hover{box-shadow:0 4px 16px rgba(248,113,113,0.3)}
.cfb{padding:10px 22px 20px}
.cfb p{font-size:13px;color:var(--t2);line-height:1.65;margin-bottom:18px}

/* Tag Manager */
.tmg{display:flex;flex-direction:column;gap:10px}
.tfrm{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:18px}
.tfrm h3{font-size:14px;font-weight:700;margin-bottom:16px;letter-spacing:-0.3px}
.dts{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
.dt{width:24px;height:24px;border-radius:50%;cursor:pointer;transition:all var(--tr);border:3px solid transparent}
.dt:hover{transform:scale(1.2)}
.dt.sel{border-color:var(--t1);box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--t1)}
.tr{display:flex;align-items:center;gap:11px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--rs);padding:12px 16px;transition:all var(--tr);animation:fadeUp 0.25s ease both}
.tr:hover{border-color:var(--b2);box-shadow:var(--sh);transform:translateY(-1px)}
.trd{width:12px;height:12px;border-radius:50%;flex-shrink:0}
.trn{flex:1;font-size:13px;font-weight:500}
.ppv{font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px}

/* Toast */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 20px;background:var(--s2);border:1px solid var(--b2);border-radius:12px;color:var(--t1);font-size:12px;font-weight:600;font-family:inherit;box-shadow:var(--sh);animation:toastIn 0.3s ease,toastOut 0.3s ease 1.7s forwards;z-index:200;display:flex;align-items:center;gap:8px}
@keyframes toastIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes toastOut{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,12px)}}

/* Metrics */
.mx{display:flex;flex-direction:column;gap:16px;animation:fadeUp 0.3s ease both}
.mx-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.mx-card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:18px 20px;transition:all var(--tr);display:flex;flex-direction:column;gap:8px}
.mx-card:hover{border-color:var(--b2);box-shadow:var(--sh);transform:translateY(-2px)}
.mx-icon{font-size:24px;line-height:1}
.mx-val{font-size:28px;font-weight:800;color:var(--t1);letter-spacing:-1px;line-height:1}
.mx-label{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:0.5px}
.mx-ring-wrap{display:flex;align-items:center;justify-content:center;padding:8px 0}
.mx-ring-inner{position:relative;width:140px;height:140px}
.mx-ring-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.mx-ring-pct{font-size:32px;font-weight:800;color:var(--t1);letter-spacing:-1px;line-height:1}
.mx-ring-sub{font-size:10px;color:var(--t3);font-weight:600;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px}
.mx-section{margin-top:4px}
.mx-section-title{font-size:12px;font-weight:700;color:var(--t2);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px}
.mx-section-title::after{content:'';flex:1;height:1px;background:var(--b1)}
.mx-bar-group{display:flex;flex-direction:column;gap:8px}
.mx-bar-item{display:flex;align-items:center;gap:10px}
.mx-bar-label{font-size:12px;color:var(--t2);font-weight:500;min-width:80px;flex-shrink:0}
.mx-bar-track{flex:1;height:8px;background:var(--s3);border-radius:4px;overflow:hidden}
.mx-bar-fill{height:100%;border-radius:4px;transition:width 0.6s cubic-bezier(0.4,0,0.2,1)}
.mx-bar-val{font-size:11px;font-weight:700;color:var(--t2);min-width:28px;text-align:right}
.mx-timeline{display:flex;flex-direction:column;gap:6px}
.mx-tl-row{display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--rs);transition:all var(--tr)}
.mx-tl-row:hover{border-color:var(--b2)}
.mx-tl-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.mx-tl-info{flex:1;display:flex;flex-direction:column;gap:1px}
.mx-tl-name{font-size:12px;font-weight:600;color:var(--t1)}
.mx-tl-due{font-size:10px;color:var(--t3)}
.mx-tl-badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px}
.mx-empty{text-align:center;padding:20px;color:var(--t3);font-size:12px;font-style:italic}

/* View Toggle */
.vt{display:flex;align-items:center;gap:3px;background:var(--s1);border-radius:10px;padding:3px;border:1px solid var(--b2);flex-shrink:0}
.vt-btn{padding:6px 14px;font-size:12px;font-weight:600;border-radius:7px;border:none;background:transparent;color:var(--t3);cursor:pointer;transition:all var(--tr);font-family:inherit;display:flex;align-items:center;gap:6px;white-space:nowrap}
.vt-btn:hover{color:var(--t2)}
.vt-btn.on{background:linear-gradient(135deg,var(--ac),var(--ac3));color:#fff;box-shadow:0 2px 8px rgba(167,139,250,0.3)}

/* Calendar */
.cal{animation:fadeUp 0.3s ease both}
.cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.cal-title{font-size:16px;font-weight:700;color:var(--t1);letter-spacing:-0.3px}
.cal-nav{display:flex;align-items:center;gap:4px}
.cal-nav-btn{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--b2);background:var(--s1);color:var(--t2);cursor:pointer;font-size:14px;transition:all var(--tr);font-family:inherit}
.cal-nav-btn:hover{background:var(--s2);color:var(--t1);border-color:var(--b3)}
.cal-today{padding:5px 12px;font-size:11px;font-weight:600;border-radius:8px;border:1px solid var(--b2);background:var(--s1);color:var(--t2);cursor:pointer;transition:all var(--tr);font-family:inherit}
.cal-today:hover{background:var(--s2);color:var(--t1)}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-dow{text-align:center;font-size:10px;font-weight:700;color:var(--t3);padding:6px 0;letter-spacing:0.5px;text-transform:uppercase}
.cal-cell{min-height:90px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--rs);padding:6px;transition:all var(--tr);display:flex;flex-direction:column;overflow:hidden}
.cal-cell:hover{border-color:var(--b2)}
.cal-cell.empty{background:transparent;border-color:transparent}
.cal-cell.today{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac),0 2px 12px rgba(167,139,250,0.15)}
.cal-cell.past{opacity:0.5}
.cal-day{font-size:11px;font-weight:700;color:var(--t2);margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}
.cal-cell.today .cal-day{color:var(--ac)}
.cal-day-dot{width:5px;height:5px;border-radius:50%;background:var(--ac)}
.cal-tasks{display:flex;flex-direction:column;gap:2px;flex:1;overflow-y:auto}
.cal-tasks::-webkit-scrollbar{width:3px}
.cal-tasks::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px}
.cal-task{padding:3px 6px;border-radius:5px;font-size:10px;font-weight:500;color:var(--t1);cursor:default;transition:all var(--tr);display:flex;align-items:center;gap:4px;line-height:1.3;border-left:2px solid transparent}
.cal-task:hover{background:var(--s3)}
.cal-task.done{text-decoration:line-through;opacity:0.4}
.cal-task-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.cal-overflow{font-size:9px;color:var(--t3);font-weight:600;padding:2px 4px;text-align:center}
`;

// ─── Empty State ──────────────────────────────────────────────────────────────
function Em({ i, t, s, cta, ctaLabel, onCta }) {
  return (
    <div className="em">
      <div className="em-i">{i}</div>
      <div className="em-t">{t}</div>
      <div className="em-s">{s}</div>
      {cta && onCta && <button className="em-cta" onClick={onCta}>{ctaLabel}</button>}
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function Cd({ t, tags, onU, onD, onE, onM }) {
  const [op, sO] = useState(false);
  const [ns, sN] = useState("");
  const [sto, sSTO] = useState(null);
  const ref = useRef();

  const tt = tags.filter(tg => (t.tags || []).includes(tg.id));
  const ss = t.subtasks || [];
  const dn = ss.filter(s => s.done).length;
  const pct = ss.length ? Math.round(dn / ss.length * 100) : 0;
  const od = t.due && !t.done && new Date(t.due) < new Date();
  const fd = s => new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const fts = ts => new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const addS = () => { if (!ns.trim()) return; onU({ ...t, subtasks: [...ss, { id: gid(), text: ns.trim(), done: false, tags: [] }] }); sN(""); };
  const togS = id => onU({ ...t, subtasks: ss.map(s => s.id === id ? { ...s, done: !s.done } : s) });
  const delS = id => onU({ ...t, subtasks: ss.filter(s => s.id !== id) });
  const togST = (sid, tid) => onU({ ...t, subtasks: ss.map(s => s.id === sid ? { ...s, tags: (s.tags || []).includes(tid) ? (s.tags || []).filter(x => x !== tid) : [...(s.tags || []), tid] } : s) });

  return (
    <div className={`cd${t.done ? " dn" : ""}`} style={{ borderLeft: `3px solid ${PC[t.priority] || "#555"}` }}>
      <div className="cd-b">
        <div className={`ck${t.done ? " on" : ""}`} role="checkbox" aria-checked={!!t.done} tabIndex={0}
          onClick={() => onM(t, !t.done)} onKeyDown={e => (e.key === " " || e.key === "Enter") && onM(t, !t.done)}>
          {t.done && "✓"}
        </div>
        <div className="ti">
          <div className={`tt${t.done ? " dn" : ""}`}>{t.title}</div>
          {t.done
            ? <div className="ds">✔ Completed {fts(t.doneAt)}</div>
            : <div className="tm">
                <span className="pb" style={{ background: PBG[t.priority], color: PC[t.priority] }}>{t.priority}</span>
                {t.due && <span className={`db${od ? " od" : ""}`}>{od ? "⚠ " : ""}{fd(t.due)}</span>}
                {tt.map(tg => <span key={tg.id} className="tp" style={{ background: tg.color + "1A", color: tg.color, border: `1px solid ${tg.color}40` }}>{tg.name}</span>)}
              </div>
          }
          {t.notes && !t.done && <div className="tn">{t.notes}</div>}
          {ss.length > 0 && !t.done && (
            <div className="pw">
              <div className="pr"><div className="prf" style={{ width: `${pct}%`, background: pct === 100 ? "var(--gn)" : PC[t.priority] }} /></div>
              <span className="pl">{dn}/{ss.length}</span>
            </div>
          )}
        </div>
        <div className="ca">
          {!t.done && <button className="ab" title={op ? "Collapse subtasks" : "Expand subtasks"} onClick={() => { sO(o => !o); if (!op) setTimeout(() => ref.current?.focus(), 80); }}>{op ? "▲" : "▼"}</button>}
          <button className="ab" title="Edit task" onClick={onE}>✎</button>
          {!t.done && <button className="ab" title={t.backlog ? "Move to Active" : "Move to Backlog"} onClick={() => onU({ ...t, backlog: !t.backlog })}>{t.backlog ? "↩" : "📦"}</button>}
          <button className="ab dg" title="Delete task" onClick={onD}>🗑</button>
        </div>
      </div>
      {!op && ss.length > 0 && !t.done && <button className="scb" onClick={() => sO(true)}>▸ {dn} of {ss.length} subtasks done</button>}
      {op && !t.done && (
        <div className="ex">
          {ss.length > 0 && (
            <div className="sl">
              {ss.map(s => {
                const stg = tags.filter(tg => (s.tags || []).includes(tg.id));
                return (
                  <div key={s.id}>
                    <div className="si">
                      <div className={`ck${s.done ? " on" : ""}`} style={{ width: 15, height: 15, fontSize: 9, borderRadius: 5, marginTop: 1 }} onClick={() => togS(s.id)}>{s.done && "✓"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={`stx${s.done ? " dn" : ""}`}>{s.text}</div>
                        {stg.length > 0 && <div className="stgs">{stg.map(tg => <span key={tg.id} className="tp" style={{ background: tg.color + "1A", color: tg.color, border: `1px solid ${tg.color}40`, fontSize: 9 }}>{tg.name}</span>)}</div>}
                      </div>
                      <button className="ab" style={{ width: 24, height: 24, fontSize: 12 }} title="Tag subtask" onClick={() => sSTO(sto === s.id ? null : s.id)}>🏷</button>
                      <button className="ab dg" style={{ width: 24, height: 24, fontSize: 11 }} title="Remove subtask" onClick={() => delS(s.id)}>✕</button>
                    </div>
                    {sto === s.id && (
                      <div className="stp">
                        {tags.map(tg => (
                          <button key={tg.id} className="tg" onClick={() => togST(s.id, tg.id)} style={{ borderColor: tg.color, color: tg.color, background: (s.tags || []).includes(tg.id) ? tg.color + "22" : "transparent", fontSize: 10, padding: "3px 9px" }}>
                            {(s.tags || []).includes(tg.id) && "✓ "}{tg.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="asr">
            <input ref={ref} value={ns} onChange={e => sN(e.target.value)} onKeyDown={e => e.key === "Enter" && addS()} placeholder="Add subtask…" />
            <button onClick={addS}>Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Md({ task, tags, bl, onS, onC }) {
  const [ti, sTi] = useState(task?.title || "");
  const [pr, sPr] = useState(task?.priority || "Medium");
  const [du, sDu] = useState(task?.due || "");
  const [no, sNo] = useState(task?.notes || "");
  const [st, sSt] = useState(task?.tags || []);
  const [bk, sBk] = useState(task?.backlog || bl || false);

  const tT = id => sSt(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const save = () => { if (!ti.trim()) return; onS({ ...(task || {}), title: ti.trim(), priority: pr, due: du, notes: no, tags: st, backlog: bk, subtasks: task?.subtasks || [] }); };

  return (
    <div className="md" role="dialog" aria-modal="true">
      <div className="md-h">
        <h2>{task ? "Edit task" : "New task"}</h2>
        <button className="ab" style={{ background: "transparent", fontSize: 16 }} onClick={onC}>✕</button>
      </div>
      <div className="md-b">
        <div className="fl">
          <label className="fl-l">Title</label>
          <input value={ti} onChange={e => sTi(e.target.value)} placeholder="What needs doing?" autoFocus onKeyDown={e => e.key === "Enter" && !e.shiftKey && save()} />
        </div>
        <div className="fl">
          <label className="fl-l">Priority</label>
          <div className="ps">
            {PRI.map(p => (
              <button key={p} className={`po${pr === p ? " sel" : ""}`} style={pr === p ? { borderColor: PC[p], background: PC[p] } : { borderColor: PC[p] + "55", color: PC[p] }} onClick={() => sPr(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="fl"><label className="fl-l">Due date</label><input type="date" value={du} onChange={e => sDu(e.target.value)} /></div>
        <div className="fl"><label className="fl-l">Notes</label><textarea value={no} onChange={e => sNo(e.target.value)} placeholder="Any additional context…" /></div>
        {tags.length > 0 && (
          <div className="fl">
            <label className="fl-l">Tags</label>
            <div className="ts">
              {tags.map(tg => (
                <button key={tg.id} className="tg" onClick={() => tT(tg.id)} style={{ borderColor: tg.color, color: tg.color, background: st.includes(tg.id) ? tg.color + "22" : "transparent" }}>
                  {st.includes(tg.id) && "✓ "}{tg.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="fl">
          <label className="blc">
            <input type="checkbox" checked={bk} onChange={e => sBk(e.target.checked)} />
            <span>Add to Backlog</span>
          </label>
        </div>
      </div>
      <div className="md-f">
        <button className="bts" onClick={onC}>Cancel</button>
        <button className="btp" onClick={save} disabled={!ti.trim()}>Save task</button>
      </div>
    </div>
  );
}

// ─── Tag Manager ──────────────────────────────────────────────────────────────
function TM({ tags, onChange, toast }) {
  const [nm, sN] = useState("");
  const [cl, sC] = useState(TPAL[0]);
  const [eId, sE] = useState(null);

  const save = () => {
    if (!nm.trim()) return;
    if (eId) { onChange(tags.map(t => t.id === eId ? { ...t, name: nm.trim(), color: cl } : t)); sE(null); toast("✎ Tag updated"); }
    else { onChange([...tags, { id: gid(), name: nm.trim(), color: cl }]); toast("✔ Tag created"); }
    sN(""); sC(TPAL[0]);
  };
  const ed = t => { sE(t.id); sN(t.name); sC(t.color); };
  const can = () => { sE(null); sN(""); sC(TPAL[0]); };

  return (
    <div className="tmg">
      <div className="tfrm">
        <h3>{eId ? "Edit tag" : "Create a tag"}</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="fl" style={{ flex: 1, minWidth: 130, marginBottom: 0 }}>
            <label className="fl-l">Name</label>
            <input value={nm} onChange={e => sN(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} placeholder="Tag name…" />
          </div>
          <div className="fl" style={{ marginBottom: 0 }}>
            <label className="fl-l">Color</label>
            <div className="dts">{TPAL.map(c => <div key={c} className={`dt${cl === c ? " sel" : ""}`} style={{ background: c }} onClick={() => sC(c)} />)}</div>
          </div>
        </div>
        {nm.trim() && <div style={{ marginTop: 12 }}><span className="ppv" style={{ background: cl + "22", color: cl, border: `1px solid ${cl}55` }}>{nm}</span></div>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {eId && <button className="bts" onClick={can}>Cancel</button>}
          <button className="btp" style={{ padding: "7px 20px", fontSize: 12 }} onClick={save}>{eId ? "Update" : "Create tag"}</button>
        </div>
      </div>
      {tags.length === 0
        ? <Em i="🏷" t="No tags yet" s="Create your first tag above." />
        : tags.map(t => (
            <div key={t.id} className="tr">
              <div className="trd" style={{ background: t.color }} />
              <span className="trn">{t.name}</span>
              <span className="ppv" style={{ background: t.color + "18", color: t.color, border: `1px solid ${t.color}44` }}>{t.name}</span>
              <button className="ab" style={{ background: "transparent" }} title="Edit tag" onClick={() => ed(t)}>✎</button>
              <button className="ab dg" style={{ background: "transparent" }} title="Delete tag" onClick={() => { onChange(tags.filter(x => x.id !== t.id)); toast("🗑 Tag deleted"); }}>🗑</button>
            </div>
          ))
      }
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalView({ tasks, tags, month, onMonth, onEdit }) {
  const { y, m } = month;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthName = new Date(y, m).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const prevM = () => onMonth(m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 });
  const nextM = () => onMonth(m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 });
  const goToday = () => onMonth({ y: today.getFullYear(), m: today.getMonth() });
  const tasksByDate = {};
  tasks.forEach(t => { if (t.due) tasksByDate[t.due] = [...(tasksByDate[t.due] || []), t]; });
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MAX_SHOW = 3;
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal">
      <div className="cal-head">
        <div className="cal-title">{monthName}</div>
        <div className="cal-nav">
          <button className="cal-today" onClick={goToday}>Today</button>
          <button className="cal-nav-btn" onClick={prevM}>◀</button>
          <button className="cal-nav-btn" onClick={nextM}>▶</button>
        </div>
      </div>
      <div className="cal-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="cal-cell empty" />;
          const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isPast = new Date(dateStr) < new Date(todayStr);
          const dayTasks = tasksByDate[dateStr] || [];
          const show = dayTasks.slice(0, MAX_SHOW);
          const extra = dayTasks.length - MAX_SHOW;
          return (
            <div key={dateStr} className={`cal-cell${isToday ? " today" : ""}${isPast && !isToday ? " past" : ""}`}>
              <div className="cal-day">
                <span>{day}</span>
                {dayTasks.length > 0 && !isToday && <span className="cal-day-dot" style={{ background: dayTasks.some(t => !t.done) ? PC[dayTasks[0].priority] : "var(--gn)" }} />}
              </div>
              <div className="cal-tasks">
                {show.map(t => (
                  <div key={t.id} className={`cal-task${t.done ? " done" : ""}`}
                    style={{ borderLeftColor: PC[t.priority], background: PBG[t.priority] }}
                    onClick={() => onEdit(t)} title={t.title}>
                    <span className="cal-task-title">{t.title}</span>
                  </div>
                ))}
                {extra > 0 && <div className="cal-overflow">+{extra} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
function Metrics({ tasks, tags }) {
  const all = tasks.filter(t => !t.backlog);
  const done = all.filter(t => t.done);
  const pending = all.filter(t => !t.done);
  const backlog = tasks.filter(t => t.backlog);
  const total = all.length;
  const pct = total > 0 ? Math.round(done.length / total * 100) : 0;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfDay);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const dueThisWeek = pending.filter(t => t.due && new Date(t.due) <= endOfWeek);
  const dueThisMonth = pending.filter(t => t.due && new Date(t.due) <= endOfMonth);
  const overdue = pending.filter(t => t.due && new Date(t.due) < startOfDay);
  const noDue = pending.filter(t => !t.due);

  const byPri = {}; PRI.forEach(p => { byPri[p] = pending.filter(t => t.priority === p).length; });
  const maxPri = Math.max(...Object.values(byPri), 1);
  const byTag = tags.map(tg => ({ ...tg, count: pending.filter(t => (t.tags || []).includes(tg.id)).length })).sort((a, b) => b.count - a.count);
  const upcoming = [...pending].filter(t => t.due).sort((a, b) => a.due < b.due ? -1 : 1).slice(0, 5);

  const r = 140 / 2, stroke = 10, norm = r - stroke / 2, circ = 2 * Math.PI * norm;
  const offset = circ - (pct / 100) * circ;
  const completedThisWeek = done.filter(t => t.doneAt && new Date(t.doneAt) >= new Date(startOfDay.getTime() - 6 * 86400000)).length;

  return (
    <div className="mx">
      <div className="mx-row">
        <div className="mx-card"><div className="mx-icon">📋</div><div className="mx-val">{pending.length}</div><div className="mx-label">Pending tasks</div></div>
        <div className="mx-card"><div className="mx-icon">⚠️</div><div className="mx-val" style={{ color: overdue.length > 0 ? "var(--dg)" : "var(--t1)" }}>{overdue.length}</div><div className="mx-label">Overdue</div></div>
        <div className="mx-card"><div className="mx-icon">📅</div><div className="mx-val">{dueThisWeek.length}</div><div className="mx-label">Due this week</div></div>
        <div className="mx-card"><div className="mx-icon">🗓️</div><div className="mx-val">{dueThisMonth.length}</div><div className="mx-label">Due this month</div></div>
      </div>
      <div className="mx-row">
        <div className="mx-card" style={{ alignItems: "center", gridColumn: "span 1" }}>
          <div className="mx-label" style={{ alignSelf: "flex-start" }}>Overall progress</div>
          <div className="mx-ring-wrap">
            <div className="mx-ring-inner">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={norm} fill="none" stroke="var(--s3)" strokeWidth={stroke} />
                <circle cx="70" cy="70" r={norm} fill="none" stroke={pct === 100 ? "var(--gn)" : "var(--ac)"} strokeWidth={stroke}
                  strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                  transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
              </svg>
              <div className="mx-ring-text">
                <div className="mx-ring-pct">{pct}%</div>
                <div className="mx-ring-sub">{done.length} of {total} done</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-card" style={{ justifyContent: "center", gap: 12 }}>
          <div className="mx-label">Quick summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["✅", `${completedThisWeek} completed this week`], ["📋", `${pending.length} pending`], ["📦", `${backlog.length} in backlog`], ["⚠️", `${overdue.length} overdue`], ["🔕", `${noDue.length} without due date`]].map(([ico, label], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--t2)" }}>
                <span style={{ fontSize: 15 }}>{ico}</span>
                <span style={{ fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-section">
        <div className="mx-section-title">Pending by Priority</div>
        <div className="mx-card">
          <div className="mx-bar-group">
            {PRI.map(p => (
              <div key={p} className="mx-bar-item">
                <span className="mx-bar-label" style={{ color: PC[p] }}>{p}</span>
                <div className="mx-bar-track"><div className="mx-bar-fill" style={{ width: `${(byPri[p] / maxPri) * 100}%`, background: PC[p] }} /></div>
                <span className="mx-bar-val">{byPri[p]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {byTag.length > 0 && (
        <div className="mx-section">
          <div className="mx-section-title">Pending by Tag</div>
          <div className="mx-card">
            <div className="mx-bar-group">
              {byTag.map(tg => (
                <div key={tg.id} className="mx-bar-item">
                  <span className="mx-bar-label" style={{ color: tg.color }}>{tg.name}</span>
                  <div className="mx-bar-track"><div className="mx-bar-fill" style={{ width: `${tg.count > 0 ? (tg.count / Math.max(...byTag.map(x => x.count), 1)) * 100 : 0}%`, background: tg.color }} /></div>
                  <span className="mx-bar-val">{tg.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="mx-section">
        <div className="mx-section-title">Upcoming deadlines</div>
        {upcoming.length === 0
          ? <div className="mx-empty">No upcoming deadlines</div>
          : <div className="mx-timeline">
              {upcoming.map(t => {
                const d = new Date(t.due);
                const isOd = d < startOfDay;
                const isToday = t.due === startOfDay.toISOString().split("T")[0];
                const label = isOd ? "Overdue" : isToday ? "Today" : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
                return (
                  <div key={t.id} className="mx-tl-row">
                    <div className="mx-tl-dot" style={{ background: PC[t.priority] }} />
                    <div className="mx-tl-info">
                      <div className="mx-tl-name">{t.title}</div>
                      <div className="mx-tl-due" style={{ color: isOd ? "var(--dg)" : "var(--t3)" }}>{label}</div>
                    </div>
                    <span className="mx-tl-badge" style={{ background: PBG[t.priority], color: PC[t.priority] }}>{t.priority}</span>
                  </div>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, sT] = useState(init.tasks);
  const [tags, sTg] = useState(init.tags);
  const [view, sV] = useState("tasks");
  const [fTags, sFT] = useState([]);
  const [fPris, sFP] = useState([]);
  const [sort, sS] = useState("created");
  const [modal, sM] = useState(null);
  const [cDel, sCD] = useState(null);
  const [sbOpen, sSB] = useState(true);
  const [toast, sToast] = useState(null);
  const [viewMode, sVM] = useState("normal");
  const [calMonth, sCalM] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const toastTimer = useRef();

  const showToast = msg => { clearTimeout(toastTimer.current); sToast(msg); toastTimer.current = setTimeout(() => sToast(null), 2000); };

  useEffect(() => { sv({ tasks, tags }); }, [tasks, tags]);
  useEffect(() => {
    const h = e => { if (e.key === "Escape") { if (cDel) sCD(null); else if (modal) sM(null); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [modal, cDel]);

  const tPF = p => sFP(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p]);
  const tTF = id => sFT(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const smartUpd = t => {
    const ss = t.subtasks || [];
    const ad = ss.length > 0 && ss.every(s => s.done);
    if (ad && !t.done) { showToast("✔ All subtasks done — task completed!"); sT(ts => ts.map(x => x.id === t.id ? { ...t, done: true, doneAt: Date.now() } : x)); }
    else sT(ts => ts.map(x => x.id === t.id ? t : x));
  };
  const upsert = t => {
    const ss = t.subtasks || [];
    const ad = ss.length > 0 && ss.every(s => s.done);
    const f = ad ? { ...t, done: true, doneAt: t.doneAt || Date.now() } : t;
    sT(ts => f.id && ts.find(x => x.id === f.id) ? ts.map(x => x.id === f.id ? f : x) : [...ts, { ...f, id: gid(), created: Date.now(), done: false, subtasks: [] }]);
    showToast(t.id ? "✎ Task updated" : "✔ Task created");
  };
  const rm = id => { sT(ts => ts.filter(x => x.id !== id)); sCD(null); showToast("🗑 Task deleted"); };
  const mD = (t, v) => {
    sT(ts => ts.map(x => x.id === t.id ? { ...t, done: v, doneAt: v ? Date.now() : undefined, subtasks: v ? (t.subtasks || []).map(s => ({ ...s, done: true })) : t.subtasks } : x));
    if (v) showToast("✔ Task completed!");
  };

  const active = tasks.filter(t => !t.backlog && !t.done);
  const comp = tasks.filter(t => t.done && !t.backlog);
  const bl = tasks.filter(t => t.backlog);

  const fSort = list => {
    let r = [...list];
    if (fPris.length) r = r.filter(t => fPris.includes(t.priority));
    if (fTags.length) r = r.filter(t => fTags.every(id => (t.tags || []).includes(id)));
    if (sort === "due") r.sort((a, b) => (a.due || "9999") < (b.due || "9999") ? -1 : 1);
    else if (sort === "priority") r.sort((a, b) => PRI.indexOf(a.priority) - PRI.indexOf(b.priority));
    else r.sort((a, b) => b.created - a.created);
    return r;
  };

  const tDel = cDel ? tasks.find(t => t.id === cDel) : null;
  const hf = fPris.length > 0 || fTags.length > 0;
  const NAVS = [
    ["tasks", "Active Todos", "☰", active.length, "Your current tasks that need attention. Focus on what matters today."],
    ["backlog", "Backlog", "📦", bl.length, "Tasks parked for later. Move items here when they're not a priority yet."],
    ["done", "Completed", "✓", comp.length, "All finished tasks. Review your accomplishments or clear them out."],
    ["metrics", "Metrics", "📊", null, "See your productivity stats, progress, and upcoming deadlines at a glance."],
    ["tagmgr", "Tags", "🏷", tags.length, "Create and manage tags to organize your tasks by category or context."],
  ];
  const cv = NAVS.find(v => v[0] === view);
  const doSort = viewMode === "normal" && (view === "tasks" || view === "backlog");
  const openNew = () => sM({ m: "new", bl: view === "backlog" });

  return (
    <>
      <style>{S}</style>
      <div className="app">
        {/* Sidebar */}
        <div className={`sb${sbOpen ? "" : " shut"}`}>
          <div className="sb-head">
            <div className="sb-logo-i">✓</div>
            <span className="sb-logo-t">TaskFlow</span>
            <button className="sb-tog" onClick={() => sSB(o => !o)} title={sbOpen ? "Collapse sidebar" : "Expand sidebar"}>
              <span className="sb-tog-label">{sbOpen ? "Close" : ""}</span>
              <span className="sb-tog-arrow">◀</span>
            </button>
          </div>
          {/* Collapsed mini icons */}
          <div className="sb-mini">
            {NAVS.map(([v, l, ico, ct]) => (
              <button key={v} className={`sb-mini-btn${view === v ? " on" : ""}`} onClick={() => sV(v)} title={l}>
                <span>{ico}</span>
                {ct > 0 && v !== "tagmgr" && <span className="sb-mini-dot" />}
              </button>
            ))}
            <div style={{ height: 1, width: 24, background: "var(--b1)", margin: "4px 0" }} />
            {hf && <button className="sb-mini-btn" onClick={() => { sFP([]); sFT([]); }} title="Clear filters" style={{ color: "var(--dg)" }}>✕</button>}
          </div>
          {/* Full sidebar body */}
          <div className="sb-body">
            <div className="sb-lbl">Views</div>
            <div className="sb-nav">
              {NAVS.map(([v, l, ico, ct, tip]) => (
                <button key={v} className={`nv${view === v ? " on" : ""}`} onClick={() => sV(v)}>
                  <span className="nv-i">{ico}</span>
                  <span className="nv-t">{l}</span>
                  {ct > 0 && <span className={`nv-c${v === "done" ? " gn" : ""}`}>{ct}</span>}
                  <span className="nv-tip">{tip}</span>
                </button>
              ))}
            </div>
            <div className="sb-hr" />
            <div className="sb-lbl">Priority</div>
            <div className="sb-flt">
              {PRI.map(p => (
                <button key={p} className={`fb${fPris.includes(p) ? " on" : ""}`} onClick={() => tPF(p)}>
                  <span className="fb-d" style={{ background: PC[p] }} />
                  <span style={{ flex: 1, color: fPris.includes(p) ? PC[p] : undefined }}>{p}</span>
                  <span className="fb-chk" style={{ color: PC[p] }}>✓</span>
                </button>
              ))}
            </div>
            <div className="sb-hr" />
            <div className="sb-lbl">Tags</div>
            <div className="sb-flt">
              {tags.length === 0 && <div style={{ fontSize: 11, color: "var(--t3)", padding: "4px 12px" }}>No tags yet</div>}
              {tags.map(tg => (
                <button key={tg.id} className={`fb${fTags.includes(tg.id) ? " on" : ""}`} onClick={() => tTF(tg.id)}>
                  <span className="fb-d" style={{ background: tg.color }} />
                  <span style={{ flex: 1, color: fTags.includes(tg.id) ? tg.color : undefined }}>{tg.name}</span>
                  <span className="fb-chk" style={{ color: tg.color }}>✓</span>
                </button>
              ))}
            </div>
            {hf && <><div className="sb-hr" /><button className="sb-clr" onClick={() => { sFP([]); sFT([]); }}>✕ Clear all filters</button></>}
          </div>
        </div>

        {/* Main content */}
        <div className="mn">
          <div className="tb">
            <div className="tb-l">
              <div>
                <div className="tb-t">{cv?.[1]}</div>
                <div className="tb-s">{typeof cv?.[3] === "number" ? `${cv[3]} ${cv[3] === 1 ? "item" : "items"}` : ""}</div>
              </div>
              {(view === "tasks" || view === "backlog") && (
                <div className="vt">
                  <button className={`vt-btn${viewMode === "normal" ? " on" : ""}`} onClick={() => sVM("normal")}>☰ List</button>
                  <button className={`vt-btn${viewMode === "calendar" ? " on" : ""}`} onClick={() => sVM("calendar")}>📅 Calendar</button>
                </div>
              )}
            </div>
            <div className="tb-r">
              {hf && (
                <div className="af">
                  {fPris.map(p => <span key={p} className="afp" style={{ color: PC[p], borderColor: PC[p] + "44" }}>{p}<button onClick={() => tPF(p)}>✕</button></span>)}
                  {fTags.map(id => { const tg = tags.find(t => t.id === id); return tg ? <span key={id} className="afp" style={{ color: tg.color, borderColor: tg.color + "44" }}>{tg.name}<button onClick={() => tTF(id)}>✕</button></span> : null; })}
                </div>
              )}
              {(view === "tasks" || view === "backlog") && <button className="nb" onClick={openNew}>+ New task</button>}
              {view === "done" && comp.length > 0 && <button className="bts" style={{ borderColor: "rgba(248,113,113,0.3)", color: "var(--dg)" }} onClick={() => sCD("__all__")}>🗑 Clear completed</button>}
            </div>
          </div>
          {doSort && (
            <div className="srt">
              <span className="srt-l">Sort</span>
              {[["created", "Newest"], ["due", "Due date"], ["priority", "Priority"]].map(([s, l]) => (
                <button key={s} className={`sc${sort === s ? " on" : ""}`} onClick={() => sS(s)}>{l}</button>
              ))}
            </div>
          )}
          <div className="ct">
            {view === "tagmgr" && <TM tags={tags} onChange={t => { sTg(t); sv({ tasks, tags: t }); }} toast={showToast} />}
            {view === "metrics" && <Metrics tasks={tasks} tags={tags} />}
            {view === "tasks" && viewMode === "normal" && (fSort(active).length === 0
              ? <Em i="🌙" t="All clear!" s={hf ? "No tasks match your filters. Try adjusting them." : "Your task list is empty. Ready to add something?"} cta={!hf} ctaLabel="+ Create your first task" onCta={openNew} />
              : <div className="tl">{fSort(active).map(t => <Cd key={t.id} t={t} tags={tags} onU={smartUpd} onD={() => sCD(t.id)} onE={() => sM({ m: "edit", t })} onM={mD} />)}</div>
            )}
            {view === "tasks" && viewMode === "calendar" && <CalView tasks={active} tags={tags} month={calMonth} onMonth={sCalM} onEdit={t => sM({ m: "edit", t })} />}
            {view === "backlog" && viewMode === "normal" && (fSort(bl).length === 0
              ? <Em i="📦" t="Backlog is empty" s={hf ? "No backlog tasks match your filters." : "Tasks you park for later will appear here."} cta={!hf} ctaLabel="+ Add a task" onCta={openNew} />
              : <div className="tl">{fSort(bl).map(t => <Cd key={t.id} t={t} tags={tags} onU={smartUpd} onD={() => sCD(t.id)} onE={() => sM({ m: "edit", t })} onM={mD} />)}</div>
            )}
            {view === "backlog" && viewMode === "calendar" && <CalView tasks={bl} tags={tags} month={calMonth} onMonth={sCalM} onEdit={t => sM({ m: "edit", t })} />}
            {view === "done" && (comp.length === 0
              ? <Em i="🎯" t="Nothing completed yet" s="Finished tasks will show up here." />
              : <div className="tl">{[...comp].sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).map(t => <Cd key={t.id} t={t} tags={tags} onU={smartUpd} onD={() => sCD(t.id)} onE={() => sM({ m: "edit", t })} onM={mD} />)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Task modal */}
      {modal && (
        <div className="ov" onClick={e => e.target === e.currentTarget && sM(null)}>
          <Md task={modal.t} tags={tags} bl={modal.bl} onS={t => { upsert(t); sM(null); }} onC={() => sM(null)} />
        </div>
      )}

      {/* Delete confirm modal */}
      {cDel && (
        <div className="ov" onClick={e => e.target === e.currentTarget && sCD(null)}>
          <div className="md" style={{ maxWidth: 380 }}>
            <div className="md-h">
              <h2>{cDel === "__all__" ? "Clear completed?" : "Delete task?"}</h2>
              <button className="ab" style={{ background: "transparent", fontSize: 16 }} onClick={() => sCD(null)}>✕</button>
            </div>
            <div className="cfb">
              <p>{cDel === "__all__" ? `Permanently remove all ${comp.length} completed tasks? This action cannot be undone.` : `"${tDel?.title}" will be permanently deleted.`}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="bts" onClick={() => sCD(null)}>Cancel</button>
                <button className="btd" onClick={() => { if (cDel === "__all__") { sT(ts => ts.filter(t => !t.done)); sCD(null); showToast("🗑 All completed tasks cleared"); } else rm(cDel); }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
