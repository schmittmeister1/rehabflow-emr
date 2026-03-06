const { useState, useEffect, useCallback, useMemo } = React;

// Data is loaded from patients-data.js (SAMPLE_PATIENTS, SCHEDULE_DATA)

const CPT_CODES = [
  { code:'97110', desc:'Therapeutic Exercise', units:0 },
  { code:'97112', desc:'Neuromuscular Re-education', units:0 },
  { code:'97116', desc:'Gait Training', units:0 },
  { code:'97140', desc:'Manual Therapy', units:0 },
  { code:'97530', desc:'Therapeutic Activities', units:0 },
  { code:'97535', desc:'Self-care/Home Mgmt Training', units:0 },
  { code:'97542', desc:'Wheelchair Mgmt Training', units:0 },
  { code:'97150', desc:'Group Therapy', units:0 },
  { code:'97010', desc:'Hot/Cold Pack', units:0 },
  { code:'97012', desc:'Mechanical Traction', units:0 },
  { code:'97014', desc:'Electrical Stimulation (unattended)', units:0 },
  { code:'97032', desc:'Electrical Stimulation (attended)', units:0 },
  { code:'97035', desc:'Ultrasound', units:0 },
  { code:'97161', desc:'PT Eval - Low Complexity', units:0 },
  { code:'97162', desc:'PT Eval - Moderate Complexity', units:0 },
  { code:'97163', desc:'PT Eval - High Complexity', units:0 },
  { code:'97164', desc:'PT Re-evaluation', units:0 },
];

const ICD10_CODES = [
  { code:'M54.5', desc:'Low back pain' },{ code:'M54.2', desc:'Cervicalgia' },
  { code:'M54.41', desc:'Lumbago with sciatica, right side' },{ code:'M54.42', desc:'Lumbago with sciatica, left side' },
  { code:'M54.16', desc:'Radiculopathy, lumbar region' },{ code:'M54.12', desc:'Radiculopathy, cervical region' },
  { code:'M75.110', desc:'Adhesive capsulitis, right shoulder' },{ code:'M75.120', desc:'Adhesive capsulitis, left shoulder' },
  { code:'M75.100', desc:'Rotator cuff tear, right shoulder' },{ code:'M75.101', desc:'Rotator cuff tear, left shoulder' },
  { code:'M75.40', desc:'Impingement syndrome, right shoulder' },{ code:'M75.41', desc:'Impingement syndrome, left shoulder' },
  { code:'M17.11', desc:'Primary osteoarthritis, right knee' },{ code:'M17.12', desc:'Primary osteoarthritis, left knee' },
  { code:'S83.511A', desc:'Sprain of ACL, right knee, init' },{ code:'S83.512A', desc:'Sprain of ACL, left knee, init' },
  { code:'M23.311', desc:'Meniscus derangement, right knee' },{ code:'M23.312', desc:'Meniscus derangement, left knee' },
  { code:'M16.11', desc:'Primary OA, right hip' },{ code:'M16.12', desc:'Primary OA, left hip' },
  { code:'Z96.651', desc:'Status post right TKA' },{ code:'Z96.652', desc:'Status post left TKA' },
  { code:'Z96.641', desc:'Status post right THA' },{ code:'Z96.642', desc:'Status post left THA' },
  { code:'M50.320', desc:'Cervical disc degeneration C4-C5' },{ code:'M47.816', desc:'Spondylosis, lumbar' },
  { code:'S42.001A', desc:'Fracture of clavicle, right, init' },{ code:'S93.401A', desc:'Sprain of right ankle, init' },
  { code:'M77.10', desc:'Lateral epicondylitis, right elbow' },{ code:'M72.0', desc:'Plantar fasciitis, right foot' },
  { code:'G81.94', desc:'Hemiplegia, right side' },{ code:'I63.9', desc:'Cerebral infarction (CVA)' },
  { code:'G20', desc:'Parkinson disease' },{ code:'R26.89', desc:'Abnormalities of gait/mobility' },
  { code:'R29.6', desc:'Repeated falls' },{ code:'M62.81', desc:'Muscle weakness (generalized)' },
  { code:'G56.00', desc:'Carpal tunnel syndrome, right' },{ code:'M26.60', desc:'TMJ disorder' },
  { code:'G89.29', desc:'Other chronic pain' },{ code:'M25.511', desc:'Pain in right shoulder' },
  { code:'M25.561', desc:'Pain in right knee' },{ code:'M25.551', desc:'Pain in right hip' },
  { code:'S72.001A', desc:'Fracture of right femoral neck' },{ code:'M53.2X7', desc:'Spinal instability, lumbosacral' },
];

// ==================== LOGIN ====================
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PT');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter credentials'); return; }
    onLogin({ username, role, displayName: role === 'PT' ? 'Dr. Sarah Mitchell, PT, DPT' : role === 'PTA' ? 'Alex Rivera, PTA' : 'Admin User' });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Rehab<span style={{color:'var(--accent)'}}>Flow</span> EMR</h1>
        <p className="subtitle">Physical Therapy Clinical Training System</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <label>Select Role</label>
          <div className="login-role">
            {['PT','PTA','Admin'].map(r => (
              <button key={r} type="button" className={role===r?'active':''} onClick={()=>setRole(r)}>{r==='PT'?'Physical Therapist':r==='PTA'?'PT Assistant':'Admin'}</button>
            ))}
          </div>
          <label>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" />
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" />
          <button type="submit">Sign In</button>
        </form>
        <p style={{textAlign:'center',marginTop:16,fontSize:11,color:'var(--text-muted)'}}>Training Environment — No Real Patient Data<br/>Use any credentials to log in • 120 sample cases loaded</p>
      </div>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({ currentPage, setCurrentPage, user, onLogout }) {
  const navItems = [
    { id:'dashboard', icon:'📊', label:'Dashboard' },
    { id:'schedule', icon:'📅', label:'Schedule' },
    { id:'patients', icon:'👥', label:'Patients' },
    { id:'documentation', icon:'📋', label:'Documentation' },
    { id:'billing', icon:'💰', label:'Billing/Coding' },
    { id:'messages', icon:'✉️', label:'Messages' },
    { id:'reports', icon:'📈', label:'Reports' },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">Rehab<span>Flow</span></div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <div key={item.id} className={`sidebar-item ${currentPage===item.id?'active':''}`} onClick={()=>setCurrentPage(item.id)}>
            <span className="icon">{item.icon}</span>{item.label}
          </div>
        ))}
      </div>
      <div className="sidebar-user">
        <div className="name">{user.displayName}</div>
        <div className="role">{user.role} — Logged In</div>
        <button className="btn btn-outline" style={{marginTop:8,width:'100%',color:'#fff',borderColor:'rgba(255,255,255,0.2)'}} onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

// ==================== DASHBOARD ====================
function Dashboard({ setCurrentPage, setSelectedPatient, patients }) {
  const active = patients.filter(p=>p.status==='Active');
  const newEvals = patients.filter(p=>p.careStage==='New Eval');
  const nearingDC = patients.filter(p=>p.careStage==='Nearing DC');
  const lowAuth = active.filter(p=>p.authVisits-p.usedVisits<=2);
  const onHold = patients.filter(p=>p.status==='On Hold');
  const reeval = patients.filter(p=>p.careStage==='Re-eval');
  const discharged = patients.filter(p=>p.status==='Discharged');

  return (
    <div className="fade-in">
      <div className="dash-stats">
        <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-value">{active.length}</div><div className="stat-label">Active Patients</div></div>
        <div className="stat-card"><div className="stat-icon">🆕</div><div className="stat-value">{newEvals.length}</div><div className="stat-label">Pending Evals</div></div>
        <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-value">{SCHEDULE_DATA.filter(s=>s.patientId).length}</div><div className="stat-label">Today's Appointments</div></div>
        <div className="stat-card"><div className="stat-icon">⚠️</div><div className="stat-value">{lowAuth.length}</div><div className="stat-label">Low Auth Alerts</div></div>
      </div>
      <div className="dash-stats" style={{gridTemplateColumns:'repeat(4,1fr)',marginTop:0}}>
        <div className="stat-card"><div className="stat-value" style={{fontSize:22,color:'var(--success)'}}>{nearingDC.length}</div><div className="stat-label">Nearing Discharge</div></div>
        <div className="stat-card"><div className="stat-value" style={{fontSize:22,color:'#e9c46a'}}>{reeval.length}</div><div className="stat-label">Need Re-eval</div></div>
        <div className="stat-card"><div className="stat-value" style={{fontSize:22,color:'#6b7280'}}>{onHold.length}</div><div className="stat-label">On Hold</div></div>
        <div className="stat-card"><div className="stat-value" style={{fontSize:22,color:'#9ca3af'}}>{discharged.length}</div><div className="stat-label">Discharged</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="card">
          <div className="card-header">Today's Schedule <button className="btn btn-sm btn-primary" onClick={()=>setCurrentPage('schedule')}>View Full</button></div>
          <div className="card-body" style={{padding:0,maxHeight:320,overflowY:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Time</th><th>Patient</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {SCHEDULE_DATA.filter(s=>s.patientId).slice(0,12).map((s,i)=>(
                  <tr key={i} onClick={()=>{const p=patients.find(p=>p.id===s.patientId);if(p){setSelectedPatient(p);setCurrentPage('chart');}}}>
                    <td>{s.time}</td>
                    <td style={{fontWeight:600}}>{s.patient}</td>
                    <td><span className={`badge ${s.type==='Initial Eval'?'badge-blue':s.type==='Re-evaluation'?'badge-purple':s.type==='Discharge'?'badge-yellow':'badge-green'}`}>{s.type}</span></td>
                    <td><span className={`badge ${s.status==='Checked In'?'badge-green':s.status==='Completed'?'badge-blue':s.status==='In Progress'?'badge-purple':'badge-gray'}`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-header">Authorization Alerts</div>
            <div className="card-body" style={{maxHeight:160,overflowY:'auto'}}>
              {lowAuth.slice(0,6).map(p=>(
                <div key={p.id} className="alert alert-warning" style={{marginBottom:6,padding:'6px 10px',fontSize:12}} onClick={()=>{setSelectedPatient(p);setCurrentPage('chart');}}>
                  ⚠️ <strong>{p.lastName}, {p.firstName}</strong> — {p.authVisits-p.usedVisits} visit(s) remaining of {p.authVisits}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Care Stage Overview</div>
            <div className="card-body">
              {[{label:'New Eval',count:newEvals.length,color:'#3b82f6'},{label:'Early (1-3 visits)',count:patients.filter(p=>p.careStage==='Early').length,color:'#10b981'},{label:'Mid (4-8 visits)',count:patients.filter(p=>p.careStage==='Mid').length,color:'#f59e0b'},{label:'Late (9+ visits)',count:patients.filter(p=>p.careStage==='Late').length,color:'#ef4444'},{label:'Nearing DC',count:nearingDC.length,color:'#8b5cf6'},{label:'Re-eval Needed',count:reeval.length,color:'#ec4899'},{label:'On Hold',count:onHold.length,color:'#6b7280'},{label:'Discharged',count:discharged.length,color:'#9ca3af'}].map(s=>(
                <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'3px 0',fontSize:12}}>
                  <span style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,borderRadius:'50%',background:s.color,display:'inline-block'}}></span>{s.label}</span>
                  <strong>{s.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== SCHEDULE ====================
function SchedulePage({ setCurrentPage, setSelectedPatient, patients }) {
  const times = [...new Set(SCHEDULE_DATA.map(s=>s.time))];
  return (
    <div className="fade-in">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,alignItems:'center'}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn btn-outline">◀</button>
          <h3>Friday, March 6, 2026</h3>
          <button className="btn btn-outline">▶</button>
        </div>
        <div style={{display:'flex',gap:8}}>
          <span style={{fontSize:12,color:'var(--text-muted)',alignSelf:'center'}}>{SCHEDULE_DATA.filter(s=>s.patientId).length} appointments today</span>
          <button className="btn btn-primary">+ New Appointment</button>
        </div>
      </div>
      <div className="card">
        <div className="card-body" style={{padding:0,overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th style={{width:80}}>Time</th><th>PT — Dr. Mitchell</th><th>PTA — A. Rivera</th></tr></thead>
            <tbody>
              {times.map(t => {
                const ptAppt = SCHEDULE_DATA.find(s=>s.time===t && s.therapist==='PT');
                const ptaAppt = SCHEDULE_DATA.find(s=>s.time===t && s.therapist==='PTA');
                return (
                  <tr key={t}>
                    <td style={{fontWeight:600,background:'#f8fafc'}}>{t}</td>
                    <td>{ptAppt && ptAppt.patientId ? (
                      <div className={`schedule-appt ${ptAppt.type==='Initial Eval'||ptAppt.type==='Re-evaluation'?'eval':ptAppt.type==='Discharge'?'discharge':'followup'}`} onClick={()=>{
                        const p = patients.find(p=>p.id===ptAppt.patientId);
                        if(p){setSelectedPatient(p);setCurrentPage('chart');}
                      }}>
                        <div className="appt-name">{ptAppt.patient}</div>
                        <div className="appt-type">{ptAppt.type} • {ptAppt.status}</div>
                      </div>
                    ) : <span style={{color:'#ccc',fontSize:12}}>— Open —</span>}</td>
                    <td>{ptaAppt && ptaAppt.patientId ? (
                      <div className={`schedule-appt followup`} onClick={()=>{
                        const p = patients.find(p=>p.id===ptaAppt.patientId);
                        if(p){setSelectedPatient(p);setCurrentPage('chart');}
                      }}>
                        <div className="appt-name">{ptaAppt.patient}</div>
                        <div className="appt-type">{ptaAppt.type} • {ptaAppt.status}</div>
                      </div>
                    ) : <span style={{color:'#ccc',fontSize:12}}>— Open —</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== PATIENT LIST ====================
function PatientList({ patients, setSelectedPatient, setCurrentPage }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [bodyRegionFilter, setBodyRegionFilter] = useState('All');
  const [insuranceFilter, setInsuranceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const perPage = 20;

  const bodyRegions = [...new Set(patients.map(p=>p.bodyRegion).filter(Boolean))].sort();
  const insurances = [...new Set(patients.map(p=>p.insurance))].sort();
  const stages = ['New Eval','Early','Mid','Late','Nearing DC','Re-eval','On Hold','Discharged'];

  const filtered = useMemo(() => {
    let list = patients.filter(p => {
      const matchSearch = `${p.firstName} ${p.lastName} ${p.dx} ${p.dxCode} ${p.bodyRegion} ${p.insurance}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter==='All' || p.status===statusFilter;
      const matchStage = stageFilter==='All' || p.careStage===stageFilter;
      const matchRegion = bodyRegionFilter==='All' || p.bodyRegion===bodyRegionFilter;
      const matchIns = insuranceFilter==='All' || p.insurance===insuranceFilter;
      return matchSearch && matchStatus && matchStage && matchRegion && matchIns;
    });
    list.sort((a,b) => {
      let cmp = 0;
      if (sortBy==='name') cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      else if (sortBy==='visits') cmp = a.usedVisits - b.usedVisits;
      else if (sortBy==='remaining') cmp = (a.authVisits-a.usedVisits) - (b.authVisits-b.usedVisits);
      else if (sortBy==='stage') cmp = stages.indexOf(a.careStage) - stages.indexOf(b.careStage);
      else if (sortBy==='pain') cmp = a.currentPain - b.currentPain;
      return sortDir==='asc' ? cmp : -cmp;
    });
    return list;
  }, [patients, search, statusFilter, stageFilter, bodyRegionFilter, insuranceFilter, sortBy, sortDir]);

  const paged = filtered.slice(page*perPage, (page+1)*perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSort = (col) => {
    if (sortBy===col) setSortDir(sortDir==='asc'?'desc':'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const stageColor = (s) => ({
    'New Eval':'badge-blue','Early':'badge-green','Mid':'badge-yellow','Late':'badge-red',
    'Nearing DC':'badge-purple','Re-eval':'badge-red','On Hold':'badge-gray','Discharged':'badge-gray'
  }[s] || 'badge-gray');

  return (
    <div className="fade-in">
      <div style={{marginBottom:12}}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
          <input placeholder="Search name, diagnosis, body region, insurance..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} style={{padding:'7px 12px',border:'1px solid var(--border)',borderRadius:4,width:350}} />
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(0);}} style={{padding:'7px 10px',border:'1px solid var(--border)',borderRadius:4}}>
            <option value="All">All Statuses</option><option>Active</option><option>On Hold</option><option>Discharged</option>
          </select>
          <select value={stageFilter} onChange={e=>{setStageFilter(e.target.value);setPage(0);}} style={{padding:'7px 10px',border:'1px solid var(--border)',borderRadius:4}}>
            <option value="All">All Care Stages</option>{stages.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={bodyRegionFilter} onChange={e=>{setBodyRegionFilter(e.target.value);setPage(0);}} style={{padding:'7px 10px',border:'1px solid var(--border)',borderRadius:4}}>
            <option value="All">All Body Regions</option>{bodyRegions.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <select value={insuranceFilter} onChange={e=>{setInsuranceFilter(e.target.value);setPage(0);}} style={{padding:'7px 10px',border:'1px solid var(--border)',borderRadius:4}}>
            <option value="All">All Insurance</option>{insurances.map(i=><option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,color:'var(--text-muted)'}}>{filtered.length} patients found • Page {page+1} of {totalPages}</span>
          <button className="btn btn-primary">+ New Patient</button>
        </div>
      </div>
      <div className="card">
        <div className="card-body" style={{padding:0}}>
          <table className="data-table">
            <thead><tr>
              <th style={{cursor:'pointer'}} onClick={()=>handleSort('name')}>Name {sortBy==='name'?(sortDir==='asc'?'▲':'▼'):''}</th>
              <th>Age</th>
              <th>Diagnosis / Body Region</th>
              <th>Insurance</th>
              <th style={{cursor:'pointer'}} onClick={()=>handleSort('visits')}>Visits {sortBy==='visits'?(sortDir==='asc'?'▲':'▼'):''}</th>
              <th style={{cursor:'pointer'}} onClick={()=>handleSort('remaining')}>Remaining {sortBy==='remaining'?(sortDir==='asc'?'▲':'▼'):''}</th>
              <th style={{cursor:'pointer'}} onClick={()=>handleSort('pain')}>Pain {sortBy==='pain'?(sortDir==='asc'?'▲':'▼'):''}</th>
              <th style={{cursor:'pointer'}} onClick={()=>handleSort('stage')}>Stage {sortBy==='stage'?(sortDir==='asc'?'▲':'▼'):''}</th>
              <th>Alerts</th>
            </tr></thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} onClick={()=>{setSelectedPatient(p);setCurrentPage('chart');}}>
                  <td style={{fontWeight:600}}>{p.lastName}, {p.firstName}</td>
                  <td>{p.age}</td>
                  <td><span style={{fontSize:11}}>{p.dx}</span><br/><span style={{fontSize:10,color:'var(--text-muted)'}}>{p.bodyRegion}</span></td>
                  <td style={{fontSize:12}}>{p.insurance}</td>
                  <td>{p.usedVisits}/{p.authVisits}</td>
                  <td><span style={{color:p.authVisits-p.usedVisits<=2?'var(--danger)':p.authVisits-p.usedVisits<=4?'#f59e0b':'var(--success)',fontWeight:600}}>{p.authVisits-p.usedVisits}</span></td>
                  <td>{p.currentPain}/10 <span style={{fontSize:10,color:'var(--text-muted)'}}>(was {p.initialPain})</span></td>
                  <td><span className={`badge ${stageColor(p.careStage)}`}>{p.careStage}</span></td>
                  <td>{p.alerts.map(a=><span key={a} className="badge badge-red" style={{marginRight:3,fontSize:10}}>{a}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:12}}>
          <button className="btn btn-sm btn-outline" disabled={page===0} onClick={()=>setPage(page-1)}>◀ Prev</button>
          {[...Array(totalPages)].map((_,i) => (
            <button key={i} className={`btn btn-sm ${page===i?'btn-primary':'btn-outline'}`} onClick={()=>setPage(i)}>{i+1}</button>
          ))}
          <button className="btn btn-sm btn-outline" disabled={page>=totalPages-1} onClick={()=>setPage(page+1)}>Next ▶</button>
        </div>
      )}
    </div>
  );
}

// ==================== PATIENT CHART ====================
function PatientChart({ patient, user, setCurrentPage }) {
  const [chartTab, setChartTab] = useState('demographics');
  const chartTabs = [
    { id:'demographics', label:'Demographics' },
    { id:'insurance', label:'Insurance/Auth' },
    { id:'history', label:'Medical History' },
    { id:'evalNote', label:'Initial Evaluation' },
    { id:'dailyNote', label:'Daily SOAP Note' },
    { id:'progressNote', label:'Progress Note' },
    { id:'exercises', label:'Exercise Rx' },
    { id:'documents', label:'Documents' },
  ];
  return (
    <div className="fade-in">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-outline" onClick={()=>setCurrentPage('patients')}>← Back</button>
          <h2 style={{fontSize:20}}>{patient.lastName}, {patient.firstName}</h2>
          <span className={`badge ${patient.status==='Active'?'badge-green':patient.status==='On Hold'?'badge-yellow':'badge-gray'}`}>{patient.status}</span>
          <span className={`badge badge-blue`}>{patient.careStage}</span>
          <span style={{fontSize:11,color:'var(--text-muted)'}}>Age {patient.age} • {patient.gender} • {patient.bodyRegion}</span>
          {patient.alerts.map(a=><span key={a} className="badge badge-red">{a}</span>)}
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-primary" onClick={()=>setChartTab('dailyNote')}>+ New Note</button>
          <button className="btn btn-outline">Print</button>
        </div>
      </div>
      {/* Quick Summary Bar */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:12}}>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Visits</div>
          <div style={{fontSize:18,fontWeight:700,color:'var(--primary)'}}>{patient.usedVisits}/{patient.authVisits}</div>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Remaining</div>
          <div style={{fontSize:18,fontWeight:700,color:patient.authVisits-patient.usedVisits<=2?'var(--danger)':'var(--success)'}}>{patient.authVisits-patient.usedVisits}</div>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Pain Now</div>
          <div style={{fontSize:18,fontWeight:700}}>{patient.currentPain}/10</div>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>Pain Initial</div>
          <div style={{fontSize:18,fontWeight:700,color:'var(--text-muted)'}}>{patient.initialPain}/10</div>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>ODI Now</div>
          <div style={{fontSize:18,fontWeight:700}}>{patient.currentODI}%</div>
        </div>
        <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-muted)',textTransform:'uppercase'}}>ODI Initial</div>
          <div style={{fontSize:18,fontWeight:700,color:'var(--text-muted)'}}>{patient.initialODI}%</div>
        </div>
      </div>
      <div className="card" style={{marginBottom:0}}>
        <div className="chart-tabs">
          {chartTabs.map(t => (
            <div key={t.id} className={`chart-tab ${chartTab===t.id?'active':''}`} onClick={()=>setChartTab(t.id)}>{t.label}</div>
          ))}
        </div>
        <div className="card-body">
          {chartTab==='demographics' && <DemographicsTab patient={patient} />}
          {chartTab==='insurance' && <InsuranceTab patient={patient} />}
          {chartTab==='history' && <MedicalHistoryTab patient={patient} />}
          {chartTab==='evalNote' && <InitialEvalNote patient={patient} user={user} />}
          {chartTab==='dailyNote' && <DailySOAPNote patient={patient} user={user} />}
          {chartTab==='progressNote' && <ProgressNote patient={patient} user={user} />}
          {chartTab==='exercises' && <ExerciseRx patient={patient} />}
          {chartTab==='documents' && <DocumentsTab patient={patient} />}
        </div>
      </div>
    </div>
  );
}

function DemographicsTab({ patient }) {
  return (
    <div>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
        <div className="form-group"><label>Last Name</label><input defaultValue={patient.lastName}/></div>
        <div className="form-group"><label>First Name</label><input defaultValue={patient.firstName}/></div>
        <div className="form-group"><label>Date of Birth</label><input type="date" defaultValue={patient.dob}/></div>
      </div>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
        <div className="form-group"><label>Gender</label><select defaultValue={patient.gender}><option>Male</option><option>Female</option><option>Other</option></select></div>
        <div className="form-group"><label>Phone</label><input defaultValue={patient.phone}/></div>
        <div className="form-group"><label>Email</label><input defaultValue={patient.email}/></div>
      </div>
      <div className="form-group"><label>Address</label><input defaultValue={patient.address}/></div>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="form-group"><label>Referring Physician</label><input defaultValue={patient.referringMD}/></div>
        <div className="form-group"><label>Referral Date</label><input type="date" defaultValue={patient.referralDate}/></div>
      </div>
      <div className="form-group"><label>Primary Diagnosis</label><input defaultValue={patient.dx}/></div>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="form-group"><label>Body Region</label><input readOnly defaultValue={patient.bodyRegion} style={{background:'#f1f5f9'}}/></div>
        <div className="form-group"><label>Complexity</label><input readOnly defaultValue={patient.complexity} style={{background:'#f1f5f9'}}/></div>
      </div>
      <div style={{marginTop:12}}><button className="btn btn-primary">Save Changes</button></div>
    </div>
  );
}

function InsuranceTab({ patient }) {
  return (
    <div>
      <h4 style={{marginBottom:12}}>Primary Insurance</h4>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
        <div className="form-group"><label>Insurance Company</label><input defaultValue={patient.insurance}/></div>
        <div className="form-group"><label>Member ID</label><input defaultValue={patient.memberId}/></div>
        <div className="form-group"><label>Group Number</label><input defaultValue={patient.groupNum}/></div>
      </div>
      <h4 style={{margin:'16px 0 12px'}}>Authorization</h4>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
        <div className="form-group"><label>Auth Number</label><input defaultValue={patient.authNum}/></div>
        <div className="form-group"><label>Authorized Visits</label><input type="number" defaultValue={patient.authVisits}/></div>
        <div className="form-group"><label>Visits Used</label><input type="number" defaultValue={patient.usedVisits}/></div>
        <div className="form-group"><label>Visits Remaining</label><input readOnly value={patient.authVisits-patient.usedVisits} style={{background:'#f1f5f9',fontWeight:700,color:patient.authVisits-patient.usedVisits<=2?'var(--danger)':'var(--success)'}}/></div>
      </div>
      {patient.authVisits-patient.usedVisits<=2 && <div className="alert alert-warning">⚠️ Authorization visits running low. Consider requesting additional visits.</div>}
      <button className="btn btn-primary" style={{marginTop:12}}>Save Insurance Info</button>
    </div>
  );
}

function MedicalHistoryTab({ patient }) {
  return (
    <div>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div>
          <h4 style={{marginBottom:8}}>Past Medical History</h4>
          <div className="form-group"><textarea rows={4} defaultValue={patient.pmh}/></div>
          <h4 style={{marginBottom:8}}>Medications</h4>
          <div className="form-group"><textarea rows={3} defaultValue={patient.meds}/></div>
        </div>
        <div>
          <h4 style={{marginBottom:8}}>Surgical History</h4>
          <div className="form-group"><textarea rows={4} defaultValue={patient.surgicalHistory}/></div>
          <h4 style={{marginBottom:8}}>Allergies</h4>
          <div className="form-group"><textarea rows={3} defaultValue={patient.alerts.includes('Latex allergy')?'Latex - causes rash\nPenicillin - anaphylaxis':'NKDA (No Known Drug Allergies)'}/></div>
        </div>
      </div>
      <h4 style={{margin:'12px 0 8px'}}>Social History</h4>
      <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
        <div className="form-group"><label>Living Situation</label><select defaultValue={patient.socialHistory?.living||'Home (independent)'}><option>Home (independent)</option><option>Home (with spouse)</option><option>Home (with family)</option><option>Assisted living</option><option>Skilled nursing facility</option></select></div>
        <div className="form-group"><label>Occupation</label><input defaultValue={patient.socialHistory?.occupation||'Unknown'}/></div>
        <div className="form-group"><label>Tobacco Use</label><select defaultValue={patient.socialHistory?.tobacco||'Never'}><option>Never</option><option>Former</option><option>Current</option></select></div>
        <div className="form-group"><label>Alcohol Use</label><select defaultValue={patient.socialHistory?.alcohol||'None'}><option>None</option><option>Occasional</option><option>Moderate</option></select></div>
      </div>
      <button className="btn btn-primary" style={{marginTop:12}}>Save Medical History</button>
    </div>
  );
}

// ==================== INITIAL EVAL NOTE ====================
function InitialEvalNote({ patient, user }) {
  const [noteStatus, setNoteStatus] = useState(patient.careStage==='New Eval'?'draft':'signed');
  const [signedBy, setSignedBy] = useState(patient.careStage!=='New Eval'?{name:'Dr. Sarah Mitchell, PT, DPT',role:'PT',date:patient.referralDate}:null);
  const [cosignNeeded, setCosignNeeded] = useState(false);
  const [lockedAt, setLockedAt] = useState(patient.careStage!=='New Eval'?patient.referralDate:null);
  const isLocked = noteStatus === 'locked' || (patient.careStage!=='New Eval' && noteStatus==='signed');

  const handleSign = () => {
    if (user.role === 'PTA') { setNoteStatus('cosign-needed'); setCosignNeeded(true); setSignedBy({ name: user.displayName, role: 'PTA', date: new Date().toLocaleString() }); }
    else { setNoteStatus('signed'); setSignedBy({ name: user.displayName, role: 'PT', date: new Date().toLocaleString() }); setCosignNeeded(false); }
  };
  const handleCosign = () => { setNoteStatus('signed'); setCosignNeeded(false); };
  const handleLock = () => { setNoteStatus('locked'); setLockedAt(new Date().toLocaleString()); };
  const handleUnlock = () => { setNoteStatus('signed'); setLockedAt(null); };

  const ROM_JOINTS = ['Cervical Flexion','Cervical Extension','Cervical Rotation','Shoulder Flexion','Shoulder Abduction','Shoulder ER','Shoulder IR','Elbow Flexion','Hip Flexion','Hip Extension','Hip Abduction','Knee Flexion','Knee Extension','Ankle DF','Ankle PF'];

  return (
    <div>
      <div className={`note-status ${noteStatus==='signed'||noteStatus==='locked'?'signed':noteStatus}`}>
        {noteStatus==='draft' && '📝 DRAFT — Not yet signed'}
        {noteStatus==='signed' && `✅ SIGNED by ${signedBy?.name} on ${signedBy?.date}`}
        {noteStatus==='cosign-needed' && `⚠️ SIGNED by ${signedBy?.name} (PTA) — CO-SIGNATURE REQUIRED by supervising PT`}
        {noteStatus==='locked' && `🔒 LOCKED on ${lockedAt} — Note is finalized`}
      </div>

      <h3 style={{marginBottom:12,color:'var(--primary)'}}>Initial Evaluation — {patient.lastName}, {patient.firstName}</h3>
      <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:16}}>Date: {patient.referralDate} | Dx: {patient.dx} | Provider: {user.displayName}</p>

      <fieldset disabled={isLocked} style={{border:'none',padding:0}}>
      <div className="card"><div className="card-header">Subjective</div><div className="card-body">
        <div className="form-group"><label>Chief Complaint</label><textarea placeholder="Patient's primary complaint in their own words..." /></div>
        <div className="form-group"><label>History of Present Illness</label><textarea rows={4} placeholder="Onset, mechanism, duration, aggravating/easing factors, prior treatment..." /></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Pain Level (0-10)</label><select defaultValue={patient.initialPain}><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i} value={i}>{i}/10</option>)}</select></div>
          <div className="form-group"><label>Pain Location</label><input placeholder="e.g., Low back, bilateral" defaultValue={patient.bodyRegion}/></div>
          <div className="form-group"><label>Pain Quality</label><select><option value="">Select</option><option>Sharp</option><option>Dull/Aching</option><option>Burning</option><option>Throbbing</option><option>Stabbing</option><option>Radiating</option></select></div>
        </div>
        <div className="form-group"><label>Prior Level of Function</label><textarea placeholder="Describe patient's functional level before onset..." /></div>
        <div className="form-group"><label>Patient Goals</label><textarea placeholder="What does the patient want to achieve with therapy?" /></div>
      </div></div>

      <div className="card"><div className="card-header">Objective — Physical Examination</div><div className="card-body">
        <h4 style={{marginBottom:8}}>Range of Motion (degrees)</h4>
        <div style={{overflowX:'auto',marginBottom:16}}>
          <table className="assessment-table">
            <thead><tr><th>Joint Motion</th><th>Active R</th><th>Active L</th><th>Passive R</th><th>Passive L</th><th>WNL</th></tr></thead>
            <tbody>{ROM_JOINTS.map(j=>(<tr key={j}><td style={{textAlign:'left',fontWeight:500}}>{j}</td><td><input disabled={isLocked}/></td><td><input disabled={isLocked}/></td><td><input disabled={isLocked}/></td><td><input disabled={isLocked}/></td><td><input type="checkbox" disabled={isLocked}/></td></tr>))}</tbody>
          </table>
        </div>
        <h4 style={{marginBottom:8}}>Manual Muscle Testing</h4>
        <div style={{overflowX:'auto',marginBottom:16}}>
          <table className="assessment-table">
            <thead><tr><th>Muscle Group</th><th>Right</th><th>Left</th><th>Notes</th></tr></thead>
            <tbody>{['Shoulder Flexors','Shoulder Abductors','Elbow Flexors','Elbow Extensors','Wrist Extensors','Hip Flexors','Hip Extensors','Hip Abductors','Knee Extensors','Knee Flexors','Ankle DF','Ankle PF'].map(m=>(<tr key={m}><td style={{textAlign:'left',fontWeight:500}}>{m}</td><td><select disabled={isLocked} style={{width:60}}><option></option><option>5/5</option><option>4+/5</option><option>4/5</option><option>4-/5</option><option>3+/5</option><option>3/5</option><option>3-/5</option><option>2+/5</option><option>2/5</option><option>2-/5</option><option>1/5</option><option>0/5</option></select></td><td><select disabled={isLocked} style={{width:60}}><option></option><option>5/5</option><option>4+/5</option><option>4/5</option><option>4-/5</option><option>3+/5</option><option>3/5</option><option>3-/5</option><option>2+/5</option><option>2/5</option><option>2-/5</option><option>1/5</option><option>0/5</option></select></td><td><input disabled={isLocked} style={{width:120}}/></td></tr>))}</tbody>
          </table>
        </div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Special Tests</label><textarea rows={3} placeholder="e.g., SLR positive R at 45°..." disabled={isLocked}/></div>
          <div className="form-group"><label>Posture/Alignment</label><textarea rows={3} placeholder="e.g., Forward head posture..." disabled={isLocked}/></div>
        </div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Palpation Findings</label><textarea rows={3} disabled={isLocked}/></div>
          <div className="form-group"><label>Gait Analysis</label><textarea rows={3} disabled={isLocked}/></div>
        </div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Balance Assessment</label><textarea rows={2} disabled={isLocked}/></div>
          <div className="form-group"><label>Functional Mobility</label><textarea rows={2} disabled={isLocked}/></div>
        </div>
        <h4 style={{margin:'12px 0 8px'}}>Outcome Measures</h4>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
          <div className="form-group"><label>Oswestry (ODI) %</label><input type="number" defaultValue={patient.initialODI} disabled={isLocked}/></div>
          <div className="form-group"><label>LEFS Score</label><input type="number" placeholder="0-80" disabled={isLocked}/></div>
          <div className="form-group"><label>NDI %</label><input type="number" placeholder="0-100" disabled={isLocked}/></div>
          <div className="form-group"><label>DASH Score</label><input type="number" placeholder="0-100" disabled={isLocked}/></div>
        </div>
      </div></div>

      <div className="card"><div className="card-header">Assessment</div><div className="card-body">
        <div className="form-group"><label>Clinical Assessment</label><textarea rows={4} placeholder="Summarize findings..." disabled={isLocked}/></div>
        <div className="form-group"><label>PT Diagnosis</label><input placeholder="e.g., Lumbar movement coordination impairment" disabled={isLocked}/></div>
        <div className="form-group"><label>Problem List</label><textarea rows={3} placeholder="1. Decreased ROM&#10;2. Decreased strength&#10;3. Impaired function..." disabled={isLocked}/></div>
      </div></div>

      <div className="card"><div className="card-header">Plan of Care / Goals</div><div className="card-body">
        <h4 style={{marginBottom:8}}>Short-Term Goals (2-4 weeks)</h4>
        {[1,2,3].map(i=><div key={i} className="form-group"><label>STG {i}</label><input placeholder={`Short-term goal ${i}...`} disabled={isLocked}/></div>)}
        <h4 style={{margin:'12px 0 8px'}}>Long-Term Goals (8-12 weeks)</h4>
        {[1,2].map(i=><div key={i} className="form-group"><label>LTG {i}</label><input placeholder={`Long-term goal ${i}...`} disabled={isLocked}/></div>)}
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Frequency</label><select disabled={isLocked}><option>2x/week</option><option>3x/week</option><option>1x/week</option><option>Daily</option></select></div>
          <div className="form-group"><label>Duration</label><select disabled={isLocked}><option>4 weeks</option><option>6 weeks</option><option>8 weeks</option><option>12 weeks</option></select></div>
          <div className="form-group"><label>Precautions</label><input defaultValue={patient.alerts.join(', ')} disabled={isLocked}/></div>
        </div>
      </div></div>
      </fieldset>

      <NoteSignatureArea noteStatus={noteStatus} signedBy={signedBy} cosignNeeded={cosignNeeded} lockedAt={lockedAt} user={user}
        canSign={user.role==='PT'||user.role==='PTA'} canCosign={user.role==='PT'} canLock={user.role==='PT'}
        onSign={handleSign} onCosign={handleCosign} onLock={handleLock} onUnlock={handleUnlock} />
    </div>
  );
}

// ==================== DAILY SOAP NOTE ====================
function DailySOAPNote({ patient, user }) {
  const [noteStatus, setNoteStatus] = useState('draft');
  const [signedBy, setSignedBy] = useState(null);
  const [cosignNeeded, setCosignNeeded] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const [selectedCpts, setSelectedCpts] = useState([]);
  const [cptUnits, setCptUnits] = useState({});
  const isLocked = noteStatus === 'locked';

  const handleSign = () => {
    if (user.role === 'PTA') { setNoteStatus('cosign-needed'); setCosignNeeded(true); setSignedBy({ name: user.displayName, role: 'PTA', date: new Date().toLocaleString() }); }
    else { setNoteStatus('signed'); setSignedBy({ name: user.displayName, role: 'PT', date: new Date().toLocaleString() }); }
  };
  const handleCosign = () => { setNoteStatus('signed'); setCosignNeeded(false); };
  const handleLock = () => { setNoteStatus('locked'); setLockedAt(new Date().toLocaleString()); };
  const handleUnlock = () => { setNoteStatus('signed'); setLockedAt(null); };
  const toggleCpt = (code) => { if (selectedCpts.includes(code)) setSelectedCpts(selectedCpts.filter(c=>c!==code)); else setSelectedCpts([...selectedCpts, code]); };
  const totalUnits = Object.values(cptUnits).reduce((a,b)=>a+(parseInt(b)||0),0);

  return (
    <div>
      <div className={`note-status ${noteStatus}`}>
        {noteStatus==='draft' && '📝 DRAFT — Not yet signed'}
        {noteStatus==='signed' && `✅ SIGNED by ${signedBy?.name} on ${signedBy?.date}`}
        {noteStatus==='cosign-needed' && `⚠️ SIGNED by ${signedBy?.name} (PTA) — CO-SIGNATURE REQUIRED`}
        {noteStatus==='locked' && `🔒 LOCKED on ${lockedAt}`}
      </div>
      <h3 style={{marginBottom:12,color:'var(--primary)'}}>Daily Treatment Note — {patient.lastName}, {patient.firstName}</h3>
      <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:16}}>Date: {new Date().toLocaleDateString()} | Visit #{patient.usedVisits+1} of {patient.authVisits} | Dx: {patient.dx} | {user.displayName}</p>

      <fieldset disabled={isLocked} style={{border:'none',padding:0}}>
      <div className="card"><div className="card-header">S — Subjective</div><div className="card-body">
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Pain Today (0-10)</label><select><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i}>{i}/10</option>)}</select></div>
          <div className="form-group"><label>Pain at Best</label><select><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i}>{i}/10</option>)}</select></div>
          <div className="form-group"><label>Pain at Worst</label><select><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i}>{i}/10</option>)}</select></div>
        </div>
        <div className="form-group"><label>Patient Report</label><textarea rows={3} placeholder="Symptoms, functional changes, response to last treatment..." disabled={isLocked}/></div>
      </div></div>

      <div className="card"><div className="card-header">O — Objective</div><div className="card-body">
        <div className="form-group"><label>Interventions Performed</label><textarea rows={3} placeholder="Detail interventions, parameters, patient response..." disabled={isLocked}/></div>
        <h4 style={{margin:'8px 0'}}>CPT Codes & Units</h4>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginBottom:12}}>
          {CPT_CODES.filter(c=>!c.code.startsWith('971')||['97110','97112','97116','97140','97530','97535','97150','97010','97014','97032','97035'].includes(c.code)).map(c=>(
            <label key={c.code} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 8px',background:selectedCpts.includes(c.code)?'#dbeafe':'#f9fafb',borderRadius:4,cursor:'pointer',fontSize:12}}>
              <input type="checkbox" checked={selectedCpts.includes(c.code)} onChange={()=>toggleCpt(c.code)} disabled={isLocked}/>
              <strong>{c.code}</strong> — {c.desc}
              {selectedCpts.includes(c.code) && <input type="number" min={1} max={8} placeholder="Units" style={{width:60,marginLeft:'auto'}} value={cptUnits[c.code]||''} onChange={e=>setCptUnits({...cptUnits,[c.code]:e.target.value})} disabled={isLocked}/>}
            </label>
          ))}
        </div>
        <div className="alert alert-info">Total: {selectedCpts.length} procedures | {totalUnits} units | ~{totalUnits*15} min skilled time</div>
        <div className="form-group"><label>Objective Measurements</label><textarea rows={2} placeholder="ROM, strength, or other measures taken today..." disabled={isLocked}/></div>
      </div></div>

      <div className="card"><div className="card-header">A — Assessment</div><div className="card-body">
        <div className="form-group"><label>Response to Treatment</label><select disabled={isLocked}><option value="">Select</option><option>Good — progressing as expected</option><option>Fair — some progress, slower than expected</option><option>Poor — minimal/no progress</option><option>Excellent — exceeding expectations</option></select></div>
        <div className="form-group"><label>Clinical Assessment</label><textarea rows={3} placeholder="Progress toward goals, barriers..." disabled={isLocked}/></div>
      </div></div>

      <div className="card"><div className="card-header">P — Plan</div><div className="card-body">
        <div className="form-group"><label>Plan for Next Visit</label><textarea rows={3} placeholder="Continue POC, progress exercises..." disabled={isLocked}/></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Next Appointment</label><input type="date" disabled={isLocked}/></div>
          <div className="form-group"><label>Continue Frequency</label><select disabled={isLocked}><option>2x/week</option><option>3x/week</option><option>1x/week</option></select></div>
        </div>
      </div></div>
      </fieldset>

      <NoteSignatureArea noteStatus={noteStatus} signedBy={signedBy} cosignNeeded={cosignNeeded} lockedAt={lockedAt} user={user}
        canSign={true} canCosign={user.role==='PT'} canLock={user.role==='PT'}
        onSign={handleSign} onCosign={handleCosign} onLock={handleLock} onUnlock={handleUnlock} />
    </div>
  );
}

// ==================== PROGRESS NOTE ====================
function ProgressNote({ patient, user }) {
  const [noteStatus, setNoteStatus] = useState('draft');
  const [signedBy, setSignedBy] = useState(null);
  const [cosignNeeded, setCosignNeeded] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const isLocked = noteStatus === 'locked';

  const handleSign = () => {
    if (user.role === 'PTA') { setNoteStatus('cosign-needed'); setCosignNeeded(true); setSignedBy({ name:user.displayName, role:'PTA', date:new Date().toLocaleString() }); }
    else { setNoteStatus('signed'); setSignedBy({ name:user.displayName, role:'PT', date:new Date().toLocaleString() }); }
  };

  return (
    <div>
      <div className={`note-status ${noteStatus}`}>
        {noteStatus==='draft' && '📝 DRAFT — Not yet signed'}
        {noteStatus==='signed' && `✅ SIGNED by ${signedBy?.name} on ${signedBy?.date}`}
        {noteStatus==='cosign-needed' && `⚠️ SIGNED by ${signedBy?.name} (PTA) — CO-SIGNATURE REQUIRED`}
        {noteStatus==='locked' && `🔒 LOCKED on ${lockedAt}`}
      </div>
      <h3 style={{marginBottom:12,color:'var(--primary)'}}>Progress Note — {patient.lastName}, {patient.firstName}</h3>
      <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:16}}>Date: {new Date().toLocaleDateString()} | Visit #{patient.usedVisits} of {patient.authVisits} | {user.displayName}</p>

      <fieldset disabled={isLocked} style={{border:'none',padding:0}}>
      <div className="card"><div className="card-header">Reason for Progress Note</div><div className="card-body">
        <select><option>10-visit progress note</option><option>30-day progress note</option><option>Insurance re-authorization</option><option>Change in plan of care</option><option>Re-evaluation</option></select>
      </div></div>

      <div className="card"><div className="card-header">Subjective Update</div><div className="card-body">
        <div className="form-group"><label>Patient Report / Functional Changes</label><textarea rows={3} placeholder="Progress since initial eval..." disabled={isLocked}/></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Current Pain Level</label><select disabled={isLocked}><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i}>{i}/10</option>)}</select></div>
          <div className="form-group"><label>Initial Pain Level</label><input readOnly value={`${patient.initialPain}/10`} style={{background:'#f1f5f9'}}/></div>
        </div>
      </div></div>

      <div className="card"><div className="card-header">Objective Re-assessment</div><div className="card-body">
        <div className="form-group"><label>Key Objective Measures (Current vs Initial)</label><textarea rows={4} placeholder="ROM, strength, function compared to eval..." disabled={isLocked}/></div>
        <h4 style={{margin:'8px 0'}}>Outcome Measures Comparison</h4>
        <table className="assessment-table">
          <thead><tr><th>Measure</th><th>Initial</th><th>Current</th><th>Change</th><th>MCID Met?</th></tr></thead>
          <tbody>
            {[['ODI (%)',patient.initialODI,patient.currentODI],['LEFS','',''],['NDI (%)','',''],['DASH','','']].map(([m,init,curr],i)=>(
              <tr key={i}><td style={{textAlign:'left'}}>{m}</td><td><input defaultValue={init} style={{width:60}} disabled={isLocked}/></td><td><input defaultValue={curr} style={{width:60}} disabled={isLocked}/></td><td><input defaultValue={init&&curr?init-curr:''} style={{width:60}} disabled={isLocked}/></td><td><select disabled={isLocked} style={{width:60}}><option></option><option>Yes</option><option>No</option></select></td></tr>
            ))}
          </tbody>
        </table>
      </div></div>

      <div className="card"><div className="card-header">Goal Status Review</div><div className="card-body">
        <table className="data-table">
          <thead><tr><th>Goal</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>{['STG 1','STG 2','STG 3','LTG 1','LTG 2'].map(g=>(<tr key={g}><td style={{fontWeight:600}}>{g}</td><td><select disabled={isLocked}><option>In Progress</option><option>Met</option><option>Partially Met</option><option>Not Met</option><option>Revised</option><option>Discontinued</option></select></td><td><input placeholder="Notes..." disabled={isLocked}/></td></tr>))}</tbody>
        </table>
      </div></div>

      <div className="card"><div className="card-header">Assessment & Updated Plan</div><div className="card-body">
        <div className="form-group"><label>Overall Progress</label><select disabled={isLocked}><option value="">Select</option><option>Progressing well toward goals</option><option>Progressing slower than expected</option><option>Plateau — requires plan modification</option><option>Regressed — reassess plan of care</option><option>Goals met — discharge planning</option></select></div>
        <div className="form-group"><label>Clinical Reasoning</label><textarea rows={3} placeholder="Justify continued skilled care..." disabled={isLocked}/></div>
        <div className="form-group"><label>Updated Plan of Care</label><textarea rows={3} disabled={isLocked}/></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Frequency</label><select disabled={isLocked}><option>2x/week</option><option>3x/week</option><option>1x/week</option></select></div>
          <div className="form-group"><label>Duration</label><select disabled={isLocked}><option>4 weeks</option><option>6 weeks</option><option>8 weeks</option></select></div>
          <div className="form-group"><label>Additional Visits Requested</label><input type="number" placeholder="0" disabled={isLocked}/></div>
        </div>
      </div></div>
      </fieldset>

      <NoteSignatureArea noteStatus={noteStatus} signedBy={signedBy} cosignNeeded={cosignNeeded} lockedAt={lockedAt} user={user}
        canSign={true} canCosign={user.role==='PT'} canLock={user.role==='PT'}
        onSign={handleSign} onCosign={()=>{setNoteStatus('signed');setCosignNeeded(false);}} onLock={()=>{setNoteStatus('locked');setLockedAt(new Date().toLocaleString());}} onUnlock={()=>{setNoteStatus('signed');setLockedAt(null);}} />
    </div>
  );
}

// ==================== SIGNATURE AREA ====================
function NoteSignatureArea({ noteStatus, signedBy, cosignNeeded, lockedAt, user, canSign, canCosign, canLock, onSign, onCosign, onLock, onUnlock }) {
  return (
    <div className="card" style={{marginTop:16}}>
      <div className="card-header">Signature & Authentication</div>
      <div className="card-body">
        {signedBy && (
          <div className={`signature-area ${noteStatus!=='draft'?'signed':''}`}>
            <div className="sig-text">/{signedBy.name}/</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{signedBy.role} — Electronically signed {signedBy.date}</div>
          </div>
        )}
        {cosignNeeded && user.role === 'PT' && <div className="alert alert-warning" style={{marginBottom:12}}>⚠️ This note was signed by a PTA and requires your co-signature.</div>}
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {noteStatus==='draft' && canSign && <button className="btn btn-success btn-lg" onClick={onSign}>✍️ Sign Note as {user.role}</button>}
          {cosignNeeded && canCosign && <button className="btn btn-primary btn-lg" onClick={onCosign}>✍️ Co-Sign as Supervising PT</button>}
          {noteStatus==='signed' && canLock && <button className="btn btn-primary" onClick={onLock}>🔒 Lock Note</button>}
          {noteStatus==='locked' && canLock && <button className="btn btn-warning" onClick={onUnlock}>🔓 Unlock Note</button>}
          {noteStatus==='draft' && <button className="btn btn-outline">💾 Save Draft</button>}
        </div>
        {user.role === 'PTA' && noteStatus==='draft' && <p style={{fontSize:11,color:'var(--text-muted)',marginTop:8}}>Note: PTA notes require co-signature by the supervising PT.</p>}
      </div>
    </div>
  );
}

// ==================== EXERCISE RX ====================
function ExerciseRx({ patient }) {
  const exercises = patient.exercises || [];
  return (
    <div>
      <h4 style={{marginBottom:12}}>Home Exercise Program — {patient.lastName}, {patient.firstName}</h4>
      <div className="alert alert-info">Body Region: {patient.bodyRegion} | Care Stage: {patient.careStage} | {exercises.length} exercises prescribed</div>
      {exercises.length > 0 ? (
        <table className="data-table">
          <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Hold</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {exercises.map((e,i)=>(
              <tr key={i}><td style={{fontWeight:600}}>{e.name}</td><td>{e.sets}</td><td>{e.reps}</td><td>{e.hold}</td><td>{e.notes}</td>
                <td><button className="btn btn-sm btn-outline">Edit</button></td></tr>
            ))}
          </tbody>
        </table>
      ) : <p style={{color:'var(--text-muted)'}}>No exercises prescribed yet (New Eval pending)</p>}
      <div style={{marginTop:12,display:'flex',gap:8}}>
        <button className="btn btn-primary">+ Add Exercise</button>
        <button className="btn btn-outline">Print HEP</button>
      </div>
    </div>
  );
}

// ==================== DOCUMENTS TAB ====================
function DocumentsTab({ patient }) {
  const docs = patient.noteHistory || [];
  return (
    <div>
      <h4 style={{marginBottom:12}}>Document History — {patient.lastName}, {patient.firstName} ({docs.length} documents)</h4>
      {docs.length > 0 ? (
        <table className="data-table">
          <thead><tr><th>Date</th><th>Type</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {docs.map((d,i)=>(
              <tr key={i}><td>{d.date}</td><td style={{fontWeight:600}}>{d.type}</td><td>{d.author}</td>
                <td><span className={`badge ${d.status.includes('Locked')||d.status==='Co-signed'?'badge-green':d.status==='Draft'?'badge-yellow':d.status.includes('Awaiting')?'badge-red':'badge-blue'}`}>{d.status}</span></td>
                <td><button className="btn btn-sm btn-outline">View</button></td></tr>
            ))}
          </tbody>
        </table>
      ) : <p style={{color:'var(--text-muted)'}}>No documents yet — Initial Evaluation pending</p>}
    </div>
  );
}

// ==================== DOCUMENTATION PAGE ====================
function DocumentationPage({ patients, user }) {
  const [noteType, setNoteType] = useState('daily');
  const [selPatientId, setSelPatientId] = useState('');
  const selPatient = patients.find(p=>p.id===parseInt(selPatientId));

  return (
    <div className="fade-in">
      <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'flex-end',flexWrap:'wrap'}}>
        <div className="form-group" style={{marginBottom:0,minWidth:280}}>
          <label>Select Patient</label>
          <select value={selPatientId} onChange={e=>setSelPatientId(e.target.value)}>
            <option value="">— Choose Patient ({patients.filter(p=>p.status==='Active').length} active) —</option>
            {patients.filter(p=>p.status==='Active').sort((a,b)=>a.lastName.localeCompare(b.lastName)).map(p=><option key={p.id} value={p.id}>{p.lastName}, {p.firstName} — {p.careStage} — {p.bodyRegion}</option>)}
          </select>
        </div>
        <div className="form-group" style={{marginBottom:0}}>
          <label>Note Type</label>
          <select value={noteType} onChange={e=>setNoteType(e.target.value)}>
            <option value="eval">Initial Evaluation</option>
            <option value="daily">Daily SOAP Note</option>
            <option value="progress">Progress Note</option>
            <option value="discharge">Discharge Summary</option>
          </select>
        </div>
        {selPatient && <span style={{fontSize:12,color:'var(--text-muted)',paddingBottom:4}}>Visit {selPatient.usedVisits+1} of {selPatient.authVisits} | Pain: {selPatient.currentPain}/10 | Stage: {selPatient.careStage}</span>}
      </div>
      {selPatient ? (
        <div>
          {noteType==='eval' && <InitialEvalNote patient={selPatient} user={user} />}
          {noteType==='daily' && <DailySOAPNote patient={selPatient} user={user} />}
          {noteType==='progress' && <ProgressNote patient={selPatient} user={user} />}
          {noteType==='discharge' && <DischargeSummary patient={selPatient} user={user} />}
        </div>
      ) : (
        <div className="card"><div className="card-body" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
          <p style={{fontSize:36,marginBottom:8}}>📋</p>
          <p>Select a patient above to begin documentation</p>
          <p style={{fontSize:11,marginTop:4}}>{patients.filter(p=>p.status==='Active').length} active patients available</p>
        </div></div>
      )}
    </div>
  );
}

// ==================== DISCHARGE SUMMARY ====================
function DischargeSummary({ patient, user }) {
  const [noteStatus, setNoteStatus] = useState('draft');
  const [signedBy, setSignedBy] = useState(null);
  const [cosignNeeded, setCosignNeeded] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const isLocked = noteStatus === 'locked';

  const handleSign = () => {
    if (user.role === 'PTA') { setNoteStatus('cosign-needed'); setCosignNeeded(true); setSignedBy({ name:user.displayName, role:'PTA', date:new Date().toLocaleString() }); }
    else { setNoteStatus('signed'); setSignedBy({ name:user.displayName, role:'PT', date:new Date().toLocaleString() }); }
  };

  return (
    <div>
      <div className={`note-status ${noteStatus}`}>{noteStatus==='draft'?'📝 DRAFT':noteStatus==='signed'?`✅ SIGNED by ${signedBy?.name}`:noteStatus==='cosign-needed'?`⚠️ CO-SIGN NEEDED`:`🔒 LOCKED`}</div>
      <h3 style={{marginBottom:12,color:'var(--primary)'}}>Discharge Summary — {patient.lastName}, {patient.firstName}</h3>
      <fieldset disabled={isLocked} style={{border:'none',padding:0}}>
      <div className="card"><div className="card-header">Discharge Details</div><div className="card-body">
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Discharge Date</label><input type="date" defaultValue="2026-03-06"/></div>
          <div className="form-group"><label>Total Visits</label><input type="number" defaultValue={patient.usedVisits}/></div>
          <div className="form-group"><label>Discharge Reason</label><select><option>Goals met</option><option>Goals partially met</option><option>Patient request</option><option>Non-compliance</option><option>Insurance limitation</option><option>Physician discharge</option></select></div>
        </div>
      </div></div>
      <div className="card"><div className="card-header">Outcomes Summary</div><div className="card-body">
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Pain: Initial → Discharge</label><input readOnly value={`${patient.initialPain}/10 → ${patient.currentPain}/10`} style={{background:'#f1f5f9'}}/></div>
          <div className="form-group"><label>ODI: Initial → Discharge</label><input readOnly value={`${patient.initialODI}% → ${patient.currentODI}%`} style={{background:'#f1f5f9'}}/></div>
        </div>
        <div className="form-group"><label>Functional Outcomes Achieved</label><textarea rows={4} placeholder="Summarize functional improvements..."/></div>
        <div className="form-group"><label>Goals Status at Discharge</label><textarea rows={3} placeholder="List each goal status..."/></div>
        <div className="form-group"><label>Discharge Recommendations</label><textarea rows={3} placeholder="HEP continuation, follow-up, referrals..."/></div>
      </div></div>
      </fieldset>
      <NoteSignatureArea noteStatus={noteStatus} signedBy={signedBy} cosignNeeded={cosignNeeded} lockedAt={lockedAt} user={user}
        canSign={true} canCosign={user.role==='PT'} canLock={user.role==='PT'}
        onSign={handleSign} onCosign={()=>{setNoteStatus('signed');setCosignNeeded(false);}} onLock={()=>{setNoteStatus('locked');setLockedAt(new Date().toLocaleString());}} onUnlock={()=>{setNoteStatus('signed');setLockedAt(null);}} />
    </div>
  );
}

// ==================== BILLING PAGE ====================
function BillingPage({ patients }) {
  const [selPatientId, setSelPatientId] = useState('');
  const [selectedCpts, setSelectedCpts] = useState([]);
  const [selectedIcds, setSelectedIcds] = useState([]);
  const [cptUnits, setCptUnits] = useState({});
  const [icdSearch, setIcdSearch] = useState('');
  const [cptSearch, setCptSearch] = useState('');
  const selPatient = patients.find(p=>p.id===parseInt(selPatientId));
  const filteredIcds = ICD10_CODES.filter(c=>`${c.code} ${c.desc}`.toLowerCase().includes(icdSearch.toLowerCase()));
  const filteredCpts = CPT_CODES.filter(c=>`${c.code} ${c.desc}`.toLowerCase().includes(cptSearch.toLowerCase()));

  return (
    <div className="fade-in">
      <div className="form-group" style={{maxWidth:400}}>
        <label>Select Patient</label>
        <select value={selPatientId} onChange={e=>{setSelPatientId(e.target.value);setSelectedCpts([]);setSelectedIcds([]);setCptUnits({});}}>
          <option value="">— Choose Patient —</option>
          {patients.filter(p=>p.status==='Active').sort((a,b)=>a.lastName.localeCompare(b.lastName)).map(p=><option key={p.id} value={p.id}>{p.lastName}, {p.firstName} — {p.dx.split(' - ')[0]}</option>)}
        </select>
      </div>
      {selPatient ? (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div className="card">
            <div className="card-header">ICD-10 Diagnosis Codes</div>
            <div className="card-body">
              <input placeholder="Search ICD-10..." value={icdSearch} onChange={e=>setIcdSearch(e.target.value)} style={{width:'100%',padding:'6px 10px',border:'1px solid var(--border)',borderRadius:4,marginBottom:8}}/>
              <div style={{maxHeight:250,overflowY:'auto'}}>{filteredIcds.map(c=>(
                <label key={c.code} style={{display:'flex',gap:6,padding:'3px 0',fontSize:12,cursor:'pointer'}}>
                  <input type="checkbox" checked={selectedIcds.includes(c.code)} onChange={()=>setSelectedIcds(selectedIcds.includes(c.code)?selectedIcds.filter(x=>x!==c.code):[...selectedIcds,c.code])}/>
                  <strong>{c.code}</strong> — {c.desc}
                </label>
              ))}</div>
              <div style={{marginTop:8}}><strong>Selected: </strong>{selectedIcds.length===0?'None':selectedIcds.map(c=><span key={c} className="code-chip"><span className="code">{c}</span><span className="remove" onClick={()=>setSelectedIcds(selectedIcds.filter(x=>x!==c))}>×</span></span>)}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">CPT Procedure Codes</div>
            <div className="card-body">
              <input placeholder="Search CPT..." value={cptSearch} onChange={e=>setCptSearch(e.target.value)} style={{width:'100%',padding:'6px 10px',border:'1px solid var(--border)',borderRadius:4,marginBottom:8}}/>
              <div style={{maxHeight:250,overflowY:'auto'}}>{filteredCpts.map(c=>(
                <div key={c.code} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0',fontSize:12}}>
                  <input type="checkbox" checked={selectedCpts.includes(c.code)} onChange={()=>setSelectedCpts(selectedCpts.includes(c.code)?selectedCpts.filter(x=>x!==c.code):[...selectedCpts,c.code])}/>
                  <strong>{c.code}</strong> — {c.desc}
                  {selectedCpts.includes(c.code) && <input type="number" min={1} max={8} placeholder="Units" style={{width:55,marginLeft:'auto',padding:'2px 4px',fontSize:11}} value={cptUnits[c.code]||''} onChange={e=>setCptUnits({...cptUnits,[c.code]:e.target.value})}/>}
                </div>
              ))}</div>
            </div>
          </div>
          <div className="card" style={{gridColumn:'1/-1'}}>
            <div className="card-header">Billing Summary</div>
            <div className="card-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
                <div><strong>Patient:</strong> {selPatient.lastName}, {selPatient.firstName}</div>
                <div><strong>Insurance:</strong> {selPatient.insurance} — {selPatient.memberId}</div>
                <div><strong>Auth:</strong> {selPatient.authNum}</div>
              </div>
              <hr style={{margin:'12px 0',border:'none',borderTop:'1px solid var(--border)'}}/>
              <div><strong>Diagnosis:</strong> {selectedIcds.length?selectedIcds.join(', '):'None'}</div>
              <div><strong>Procedures:</strong> {selectedCpts.length?selectedCpts.map(c=>`${c} (${cptUnits[c]||1}u)`).join(', '):'None'}</div>
              <div><strong>Total Units:</strong> {Object.values(cptUnits).reduce((a,b)=>a+(parseInt(b)||0),0)}</div>
              <div style={{marginTop:12}}><button className="btn btn-primary btn-lg">Submit Charges</button></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card"><div className="card-body" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}><p style={{fontSize:36,marginBottom:8}}>💰</p><p>Select a patient to enter billing codes</p></div></div>
      )}
    </div>
  );
}

// ==================== MESSAGES PAGE ====================
function MessagesPage() {
  const msgs = [
    { from:'Dr. Robert Chen', subject:'RE: Thompson, Margaret — MRI Results', date:'03/06/2026', read:false, body:'MRI shows L4-L5 disc bulge with mild canal stenosis. Continue conservative management.' },
    { from:'Front Desk', subject:'Schedule change — Rodriguez, James', date:'03/05/2026', read:true, body:'Patient rescheduled 3/7 appt to 3/10 at 9am.' },
    { from:'Billing Dept', subject:'Auth expiring — Williams, Patricia', date:'03/04/2026', read:true, body:'Auth AUTH-2026-0445 expires in 2 visits. Please submit progress note for re-auth.' },
    { from:'Alex Rivera, PTA', subject:'Co-sign request — Rodriguez daily note', date:'03/05/2026', read:false, body:'Please co-sign the daily note for James Rodriguez from 3/5/2026.' },
    { from:'Dr. Sarah Kim, MD', subject:'Post-op update — Chen, David', date:'03/03/2026', read:true, body:'Patient cleared for progressive ROM. Remove sling as tolerated. Follow up in 4 weeks.' },
    { from:'Insurance Dept', subject:'Auth approved — Martinez, R.', date:'03/02/2026', read:true, body:'20 visits approved through 5/15/2026 for ICD M54.5.' },
  ];
  const [selected, setSelected] = useState(null);
  return (
    <div className="fade-in">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div className="card">
          <div className="card-header">Inbox <span className="badge badge-red">{msgs.filter(m=>!m.read).length} new</span></div>
          <div className="card-body" style={{padding:0}}>
            {msgs.map((m,i)=>(<div key={i} style={{padding:'10px 16px',borderBottom:'1px solid #f1f5f9',cursor:'pointer',background:selected===i?'#e0f2fe':m.read?'#fff':'#fffbeb'}} onClick={()=>setSelected(i)}>
              <div style={{fontWeight:m.read?400:700,fontSize:13}}>{m.subject}</div>
              <div style={{fontSize:11,color:'var(--text-muted)'}}>{m.from} — {m.date}</div>
            </div>))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">{selected!==null?msgs[selected].subject:'Select a message'}</div>
          <div className="card-body">
            {selected!==null ? (<div><p><strong>From:</strong> {msgs[selected].from}</p><p><strong>Date:</strong> {msgs[selected].date}</p><hr style={{margin:'12px 0',border:'none',borderTop:'1px solid var(--border)'}}/><p>{msgs[selected].body}</p><div style={{marginTop:16}}><button className="btn btn-primary">Reply</button> <button className="btn btn-outline">Forward</button></div></div>) : <p style={{color:'var(--text-muted)'}}>Select a message</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== REPORTS PAGE ====================
function ReportsPage({ patients }) {
  const active = patients.filter(p=>p.status==='Active');
  const bodyRegions = {};
  const insuranceDist = {};
  patients.forEach(p => {
    bodyRegions[p.bodyRegion] = (bodyRegions[p.bodyRegion]||0)+1;
    insuranceDist[p.insurance] = (insuranceDist[p.insurance]||0)+1;
  });

  return (
    <div className="fade-in">
      <h3 style={{marginBottom:16}}>Clinical Reports</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="card">
          <div className="card-header">Patient Census by Body Region</div>
          <div className="card-body">{Object.entries(bodyRegions).sort((a,b)=>b[1]-a[1]).map(([region,count])=>(
            <div key={region} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0',fontSize:12}}>
              <span style={{flex:1}}>{region}</span>
              <div style={{width:200,height:16,background:'#f1f5f9',borderRadius:8,overflow:'hidden'}}><div style={{width:`${(count/patients.length)*100}%`,height:'100%',background:'var(--primary)',borderRadius:8}}></div></div>
              <strong style={{width:24,textAlign:'right'}}>{count}</strong>
            </div>
          ))}</div>
        </div>
        <div className="card">
          <div className="card-header">Insurance Distribution</div>
          <div className="card-body">{Object.entries(insuranceDist).sort((a,b)=>b[1]-a[1]).map(([ins,count])=>(
            <div key={ins} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 0',fontSize:12}}>
              <span style={{flex:1}}>{ins}</span>
              <div style={{width:200,height:16,background:'#f1f5f9',borderRadius:8,overflow:'hidden'}}><div style={{width:`${(count/patients.length)*100}%`,height:'100%',background:'var(--accent)',borderRadius:8}}></div></div>
              <strong style={{width:24,textAlign:'right'}}>{count}</strong>
            </div>
          ))}</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
        {[
          { title:'Productivity Report', desc:'Units billed, patients seen, avg treatment time', icon:'📊' },
          { title:'Authorization Tracker', desc:'Upcoming expirations, visits remaining', icon:'📋' },
          { title:'Outcome Measures', desc:'MCID tracking, functional outcomes', icon:'📈' },
          { title:'Unsigned Notes', desc:'Pending signatures and co-signatures', icon:'✍️' },
          { title:'Revenue Summary', desc:'Charges submitted, payments received', icon:'💰' },
          { title:'Discharge Report', desc:'Discharge outcomes and satisfaction', icon:'🎯' },
        ].map((r,i)=>(
          <div key={i} className="card" style={{cursor:'pointer'}}>
            <div className="card-body" style={{textAlign:'center',padding:24}}>
              <div style={{fontSize:32,marginBottom:8}}>{r.icon}</div>
              <h4>{r.title}</h4>
              <p style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>{r.desc}</p>
              <button className="btn btn-sm btn-outline" style={{marginTop:8}}>Generate</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const patients = SAMPLE_PATIENTS; // from patients-data.js

  if (!user) return <LoginPage onLogin={setUser} />;

  const pageTitle = {
    dashboard:'Dashboard', schedule:'Schedule', patients:`Patient List (${patients.length})`,
    chart:'Patient Chart', documentation:'Documentation', billing:'Billing & Coding',
    messages:'Messages', reports:'Reports'
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} setCurrentPage={(p)=>{setCurrentPage(p);if(p!=='chart')setSelectedPatient(null);}} user={user} onLogout={()=>setUser(null)} />
      <div className="main-content">
        <div className="top-bar">
          <h2>{currentPage==='chart'&&selectedPatient?`Chart: ${selectedPatient.lastName}, ${selectedPatient.firstName}`:pageTitle[currentPage]}</h2>
          <div className="top-bar-actions">
            <span style={{fontSize:12}}>📅 {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
            <span style={{fontSize:12}}>{patients.length} patients loaded</span>
            <button>🔔 Alerts</button>
          </div>
        </div>
        <div className="content-area">
          {currentPage==='dashboard' && <Dashboard setCurrentPage={setCurrentPage} setSelectedPatient={setSelectedPatient} patients={patients}/>}
          {currentPage==='schedule' && <SchedulePage setCurrentPage={setCurrentPage} setSelectedPatient={setSelectedPatient} patients={patients}/>}
          {currentPage==='patients' && <PatientList patients={patients} setSelectedPatient={setSelectedPatient} setCurrentPage={setCurrentPage}/>}
          {currentPage==='chart' && selectedPatient && <PatientChart patient={selectedPatient} user={user} setCurrentPage={setCurrentPage}/>}
          {currentPage==='documentation' && <DocumentationPage patients={patients} user={user}/>}
          {currentPage==='billing' && <BillingPage patients={patients}/>}
          {currentPage==='messages' && <MessagesPage/>}
          {currentPage==='reports' && <ReportsPage patients={patients}/>}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
