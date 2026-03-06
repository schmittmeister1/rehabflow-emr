// =====================================================
// RehabFlow EMR — 120 Mock Patient Cases
// Patients at various stages of their plan of care
// =====================================================

// Care stages:
// "New Eval" = 0 visits used, just referred
// "Early" = 1-3 visits into POC
// "Mid" = 4-8 visits, making progress
// "Late" = 9-14 visits, nearing goals
// "Nearing DC" = close to auth limit or goals met
// "Discharged" = completed care
// "On Hold" = paused for medical/personal reasons
// "Re-eval" = needs re-evaluation / re-auth

const FIRST_NAMES_F = ['Margaret','Patricia','Dorothy','Linda','Barbara','Susan','Nancy','Karen','Betty','Sandra','Sharon','Donna','Carol','Ruth','Maria','Lisa','Jennifer','Ashley','Amanda','Stephanie','Nicole','Jessica','Heather','Angela','Melissa','Amy','Michelle','Christina','Kimberly','Rebecca','Laura','Brenda','Cynthia','Catherine','Deborah','Gloria','Janet','Teresa','Rosa','Diane','Virginia','Tammy','Tina','Alma','Julia','Hannah','Megan','Olivia','Emily','Sophia'];
const FIRST_NAMES_M = ['James','Robert','Michael','David','William','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Steven','Paul','Andrew','Joshua','Kenneth','Kevin','Brian','Timothy','Ronald','Jason','Jeffrey','Ryan','Jacob','Gary','Nicholas','Eric','Jonathan','Patrick','Raymond','Gregory','Benjamin','Samuel','Henry','Alexander','Tyler','Nathan','Ethan','Dylan','Carlos','Juan','Luis','Jorge','Miguel','Pedro','Frank','Dennis'];
const LAST_NAMES = ['Thompson','Rodriguez','Williams','Chen','Baker','Johnson','Martinez','Garcia','Brown','Davis','Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Robinson','Clark','Lewis','Lee','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Adams','Nelson','Hill','Campbell','Mitchell','Roberts','Carter','Phillips','Evans','Turner','Torres','Parker','Collins','Edwards','Stewart','Flores','Morris','Murphy','Rivera','Cook','Rogers','Reed','Morgan','Bell','Cooper','Richardson','Cox','Howard','Ward','Peterson','Gray','Ramirez','James','Watson','Brooks','Kelly','Sanders','Price','Bennett','Wood','Barnes','Ross','Henderson','Coleman','Jenkins','Perry','Butler','Foster','Simmons','Gonzalez','Bryant','Alexander','Russell','Griffin','Hayes','Myers','Ford','Hamilton','Graham','Sullivan','Wallace'];

const DIAGNOSES = [
  // Spine
  { code:'M54.5', desc:'Low back pain', bodyRegion:'Lumbar Spine', complexity:'moderate' },
  { code:'M54.2', desc:'Cervicalgia', bodyRegion:'Cervical Spine', complexity:'low' },
  { code:'M54.41', desc:'Lumbago with sciatica, right side', bodyRegion:'Lumbar Spine', complexity:'high' },
  { code:'M54.42', desc:'Lumbago with sciatica, left side', bodyRegion:'Lumbar Spine', complexity:'high' },
  { code:'M54.16', desc:'Radiculopathy, lumbar region', bodyRegion:'Lumbar Spine', complexity:'high' },
  { code:'M54.12', desc:'Radiculopathy, cervical region', bodyRegion:'Cervical Spine', complexity:'high' },
  { code:'M50.320', desc:'Cervical disc degeneration C4-C5', bodyRegion:'Cervical Spine', complexity:'moderate' },
  { code:'M51.16', desc:'Lumbar disc degeneration with radiculopathy', bodyRegion:'Lumbar Spine', complexity:'high' },
  { code:'M47.816', desc:'Spondylosis w/o myelopathy, lumbar', bodyRegion:'Lumbar Spine', complexity:'moderate' },
  { code:'M47.812', desc:'Spondylosis w/o myelopathy, cervical', bodyRegion:'Cervical Spine', complexity:'moderate' },
  { code:'M53.2X7', desc:'Spinal instability, lumbosacral', bodyRegion:'Lumbar Spine', complexity:'high' },
  // Shoulder
  { code:'M75.110', desc:'Adhesive capsulitis, right shoulder', bodyRegion:'Right Shoulder', complexity:'high' },
  { code:'M75.120', desc:'Adhesive capsulitis, left shoulder', bodyRegion:'Left Shoulder', complexity:'high' },
  { code:'M75.100', desc:'Rotator cuff tear, right shoulder', bodyRegion:'Right Shoulder', complexity:'high' },
  { code:'M75.101', desc:'Rotator cuff tear, left shoulder', bodyRegion:'Left Shoulder', complexity:'high' },
  { code:'M25.511', desc:'Pain in right shoulder', bodyRegion:'Right Shoulder', complexity:'low' },
  { code:'M25.512', desc:'Pain in left shoulder', bodyRegion:'Left Shoulder', complexity:'low' },
  { code:'S43.401A', desc:'Sprain of right shoulder joint, init', bodyRegion:'Right Shoulder', complexity:'moderate' },
  { code:'M75.40', desc:'Impingement syndrome, right shoulder', bodyRegion:'Right Shoulder', complexity:'moderate' },
  { code:'M75.41', desc:'Impingement syndrome, left shoulder', bodyRegion:'Left Shoulder', complexity:'moderate' },
  // Knee
  { code:'M17.11', desc:'Primary OA, right knee', bodyRegion:'Right Knee', complexity:'moderate' },
  { code:'M17.12', desc:'Primary OA, left knee', bodyRegion:'Left Knee', complexity:'moderate' },
  { code:'S83.511A', desc:'Sprain of ACL, right knee, init', bodyRegion:'Right Knee', complexity:'high' },
  { code:'S83.512A', desc:'Sprain of ACL, left knee, init', bodyRegion:'Left Knee', complexity:'high' },
  { code:'M23.311', desc:'Meniscus derangement, right knee', bodyRegion:'Right Knee', complexity:'moderate' },
  { code:'M23.312', desc:'Meniscus derangement, left knee', bodyRegion:'Left Knee', complexity:'moderate' },
  { code:'M25.561', desc:'Pain in right knee', bodyRegion:'Right Knee', complexity:'low' },
  { code:'M25.562', desc:'Pain in left knee', bodyRegion:'Left Knee', complexity:'low' },
  { code:'Z96.651', desc:'Status post right TKA', bodyRegion:'Right Knee', complexity:'high' },
  { code:'Z96.652', desc:'Status post left TKA', bodyRegion:'Left Knee', complexity:'high' },
  // Hip
  { code:'M16.11', desc:'Primary OA, right hip', bodyRegion:'Right Hip', complexity:'moderate' },
  { code:'M16.12', desc:'Primary OA, left hip', bodyRegion:'Left Hip', complexity:'moderate' },
  { code:'Z96.641', desc:'Status post right THA', bodyRegion:'Right Hip', complexity:'high' },
  { code:'Z96.642', desc:'Status post left THA', bodyRegion:'Left Hip', complexity:'high' },
  { code:'M25.551', desc:'Pain in right hip', bodyRegion:'Right Hip', complexity:'low' },
  { code:'M79.604', desc:'Pain in right leg', bodyRegion:'Right LE', complexity:'low' },
  // Ankle/Foot
  { code:'S93.401A', desc:'Sprain of right ankle, init', bodyRegion:'Right Ankle', complexity:'moderate' },
  { code:'S93.402A', desc:'Sprain of left ankle, init', bodyRegion:'Left Ankle', complexity:'moderate' },
  { code:'S82.001A', desc:'Fracture of right patella, init', bodyRegion:'Right Knee', complexity:'high' },
  { code:'M77.10', desc:'Lateral epicondylitis, right elbow', bodyRegion:'Right Elbow', complexity:'low' },
  { code:'M77.11', desc:'Lateral epicondylitis, left elbow', bodyRegion:'Left Elbow', complexity:'low' },
  { code:'M72.0', desc:'Plantar fasciitis, right foot', bodyRegion:'Right Foot', complexity:'low' },
  // Post-surgical
  { code:'S42.001A', desc:'Fracture of clavicle, right, init', bodyRegion:'Right Shoulder', complexity:'moderate' },
  { code:'S42.002A', desc:'Fracture of clavicle, left, init', bodyRegion:'Left Shoulder', complexity:'moderate' },
  { code:'S72.001A', desc:'Fracture of right femoral neck, init', bodyRegion:'Right Hip', complexity:'high' },
  // Neuro / Balance
  { code:'G81.94', desc:'Hemiplegia, unspecified, affecting right side', bodyRegion:'Neurological', complexity:'high' },
  { code:'I63.9', desc:'Cerebral infarction, unspecified (CVA)', bodyRegion:'Neurological', complexity:'high' },
  { code:'G20', desc:'Parkinson disease', bodyRegion:'Neurological', complexity:'high' },
  { code:'R26.89', desc:'Other abnormalities of gait and mobility', bodyRegion:'Gait/Balance', complexity:'moderate' },
  { code:'R26.2', desc:'Difficulty in walking, not elsewhere classified', bodyRegion:'Gait/Balance', complexity:'moderate' },
  { code:'M62.81', desc:'Muscle weakness (generalized)', bodyRegion:'Generalized', complexity:'moderate' },
  { code:'R29.6', desc:'Repeated falls', bodyRegion:'Gait/Balance', complexity:'high' },
  // Wrist/Hand
  { code:'M65.311', desc:'Trigger finger, right index', bodyRegion:'Right Hand', complexity:'low' },
  { code:'G56.00', desc:'Carpal tunnel syndrome, right', bodyRegion:'Right Wrist', complexity:'moderate' },
  { code:'G56.01', desc:'Carpal tunnel syndrome, left', bodyRegion:'Left Wrist', complexity:'moderate' },
  { code:'S62.001A', desc:'Fracture of right scaphoid, init', bodyRegion:'Right Wrist', complexity:'moderate' },
  // TMJ/Other
  { code:'M26.60', desc:'TMJ disorder, unspecified', bodyRegion:'TMJ', complexity:'moderate' },
  { code:'G89.29', desc:'Other chronic pain', bodyRegion:'Generalized', complexity:'moderate' },
];

const INSURANCES = [
  { name:'Blue Cross Blue Shield', prefix:'BCB' },
  { name:'Aetna', prefix:'AET' },
  { name:'United Healthcare', prefix:'UHC' },
  { name:'Cigna', prefix:'CIG' },
  { name:'Humana', prefix:'HUM' },
  { name:'Medicare', prefix:'MED' },
  { name:'Medicaid', prefix:'MCD' },
  { name:'Tricare', prefix:'TRI' },
  { name:'Workers Compensation', prefix:'WC' },
  { name:'Anthem', prefix:'ANT' },
  { name:'Kaiser Permanente', prefix:'KP' },
  { name:'Molina Healthcare', prefix:'MOL' },
];

const REFERRING_MDS = [
  'Dr. Robert Chen, MD','Dr. Sarah Kim, MD','Dr. Michael Torres, DO','Dr. Lisa Patel, MD',
  'Dr. James Wright, MD','Dr. Amy Nguyen, MD','Dr. David Hernandez, DO','Dr. Jennifer Lee, MD',
  'Dr. Marcus Brown, MD','Dr. Rachel Green, MD','Dr. Kevin O\'Brien, DO','Dr. Samantha Cruz, MD',
  'Dr. Thomas Russo, MD','Dr. Angela Park, MD','Dr. Brian Foster, DO','Dr. Maria Santos, MD',
  'Dr. Christopher Webb, MD','Dr. Natalie Chang, MD','Dr. Steven Burke, DO','Dr. Diana Reeves, MD',
];

const STREETS = ['Oak Lane','Elm Street','Maple Drive','Pine Road','Birch Avenue','Cedar Boulevard','Walnut Court','Spruce Way','Cherry Circle','Willow Terrace','Ash Street','Poplar Drive','Hickory Lane','Magnolia Blvd','Cypress Road','Chestnut Ave','Sycamore Way','Holly Drive','Juniper Court','Redwood Circle'];
const CITIES = ['Springfield','Riverside','Fairview','Georgetown','Madison','Franklin','Clinton','Salem','Greenville','Bristol'];

const ALERT_OPTIONS = [
  [], [], [], [], [], [], // most patients have no alerts
  ['Fall risk'],
  ['Diabetes'],
  ['Cardiac precautions'],
  ['Fall risk','Diabetes'],
  ['Latex allergy'],
  ['Fall risk','Osteoporosis'],
  ['Cardiac precautions','Fall risk'],
  ['Blood thinner (Coumadin)'],
  ['Seizure precautions'],
  ['Contact precautions'],
  ['Weight-bearing restrictions'],
  ['Diabetes','Cardiac precautions'],
  ['Aspiration precautions'],
  ['DVT precautions'],
];

const PMH_OPTIONS = [
  'No significant past medical history',
  'Hypertension',
  'Hypertension, Type 2 Diabetes',
  'Hypertension, Hyperlipidemia',
  'Type 2 Diabetes, Obesity',
  'Osteoarthritis, Hypertension',
  'Rheumatoid arthritis, Hypertension',
  'COPD, Hypertension',
  'Depression, Anxiety',
  'Hypothyroidism',
  'Atrial fibrillation, Hypertension, Type 2 Diabetes',
  'Osteoporosis, Hypertension',
  'CAD, s/p CABG 2020, Hypertension, Type 2 Diabetes',
  'History of breast cancer (in remission), Osteoporosis',
  'Parkinson disease, Hypertension',
  'History of CVA (2024), Hypertension, A-fib',
  'Type 1 Diabetes, Hypothyroidism',
  'Asthma, GERD',
  'Fibromyalgia, Depression',
  'Chronic kidney disease Stage 3, Hypertension, Diabetes',
];

const MED_OPTIONS = [
  'None reported',
  'Lisinopril 10mg daily',
  'Metformin 500mg BID, Lisinopril 10mg daily',
  'Atorvastatin 20mg daily, Metoprolol 25mg BID',
  'Metformin 1000mg BID, Amlodipine 5mg daily, Atorvastatin 40mg daily',
  'Ibuprofen 400mg PRN, Omeprazole 20mg daily',
  'Methotrexate 15mg weekly, Folic acid 1mg daily',
  'Albuterol inhaler PRN, Fluticasone 250mcg BID',
  'Levothyroxine 75mcg daily',
  'Warfarin 5mg daily, Metoprolol 50mg BID',
  'Carbidopa-Levodopa 25/100mg TID',
  'Sertraline 100mg daily, Trazodone 50mg QHS PRN',
  'Gabapentin 300mg TID, Duloxetine 60mg daily',
  'Alendronate 70mg weekly, Calcium+D daily',
  'Insulin glargine 20u QHS, Metformin 1000mg BID',
  'Hydrochlorothiazide 25mg daily',
  'Clopidogrel 75mg daily, Aspirin 81mg daily',
  'Tamsulosin 0.4mg daily, Finasteride 5mg daily',
  'Pregabalin 75mg BID',
  'Cyclobenzaprine 10mg TID PRN',
];

const CARE_STAGES = [
  { stage:'New Eval', usedMin:0, usedMax:0, authMin:8, authMax:20 },
  { stage:'Early', usedMin:1, usedMax:3, authMin:8, authMax:20 },
  { stage:'Early', usedMin:2, usedMax:4, authMin:12, authMax:20 },
  { stage:'Mid', usedMin:4, usedMax:8, authMin:12, authMax:24 },
  { stage:'Mid', usedMin:5, usedMax:10, authMin:16, authMax:24 },
  { stage:'Late', usedMin:9, usedMax:14, authMin:16, authMax:24 },
  { stage:'Late', usedMin:10, usedMax:16, authMin:20, authMax:24 },
  { stage:'Nearing DC', usedMin:10, usedMax:12, authMin:12, authMax:12 },
  { stage:'Nearing DC', usedMin:18, usedMax:20, authMin:20, authMax:20 },
  { stage:'Discharged', usedMin:8, usedMax:20, authMin:8, authMax:20 },
  { stage:'Discharged', usedMin:12, usedMax:16, authMin:12, authMax:16 },
  { stage:'On Hold', usedMin:3, usedMax:8, authMin:12, authMax:20 },
  { stage:'Re-eval', usedMin:10, usedMax:12, authMin:12, authMax:12 },
];

// Seeded pseudo-random for consistency
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generatePatients() {
  const rand = seededRandom(42);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
  const patients = [];

  // Generate 120 patients
  for (let i = 1; i <= 120; i++) {
    const isFemale = rand() > 0.45;
    const firstName = isFemale ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
    const lastName = pick(LAST_NAMES);

    // Age distribution: 18-92, weighted toward older
    const ageBase = rand();
    let age;
    if (ageBase < 0.08) age = randInt(18, 25);       // young adults
    else if (ageBase < 0.20) age = randInt(26, 39);   // adults
    else if (ageBase < 0.40) age = randInt(40, 54);   // middle age
    else if (ageBase < 0.65) age = randInt(55, 69);   // older adults
    else if (ageBase < 0.85) age = randInt(70, 79);   // elderly
    else age = randInt(80, 92);                        // very elderly

    const birthYear = 2026 - age;
    const birthMonth = randInt(1, 12);
    const birthDay = randInt(1, 28);
    const dob = `${birthYear}-${String(birthMonth).padStart(2,'0')}-${String(birthDay).padStart(2,'0')}`;

    const dx = pick(DIAGNOSES);
    const ins = age >= 65 && rand() > 0.3 ? INSURANCES[5] : (rand() < 0.05 ? INSURANCES[8] : pick(INSURANCES.filter(i => i.name !== 'Workers Compensation')));

    const careStage = pick(CARE_STAGES);
    const authVisits = randInt(careStage.authMin, careStage.authMax);
    const usedVisits = careStage.stage === 'Discharged' ? authVisits : Math.min(randInt(careStage.usedMin, careStage.usedMax), authVisits);

    let status;
    if (careStage.stage === 'Discharged') status = 'Discharged';
    else if (careStage.stage === 'On Hold') status = 'On Hold';
    else status = 'Active';

    // Referral date based on care stage
    let refMonthOffset;
    if (careStage.stage === 'New Eval') refMonthOffset = 0;
    else if (careStage.stage === 'Early') refMonthOffset = randInt(0, 1);
    else if (careStage.stage === 'Mid') refMonthOffset = randInt(1, 2);
    else if (careStage.stage === 'Late' || careStage.stage === 'Nearing DC') refMonthOffset = randInt(2, 4);
    else if (careStage.stage === 'Re-eval') refMonthOffset = randInt(2, 3);
    else if (careStage.stage === 'On Hold') refMonthOffset = randInt(1, 3);
    else refMonthOffset = randInt(2, 5);

    const refMonth = 3 - refMonthOffset;
    const refYear = refMonth <= 0 ? 2025 : 2026;
    const actualRefMonth = refMonth <= 0 ? 12 + refMonth : refMonth;
    const refDay = randInt(1, 28);
    const referralDate = `${refYear}-${String(actualRefMonth).padStart(2,'0')}-${String(refDay).padStart(2,'0')}`;

    const memberId = `${ins.prefix}-${randInt(100000, 999999)}`;
    const groupNum = ins.name === 'Medicare' || ins.name === 'Medicaid' ? 'N/A' : `GRP-${randInt(10000, 99999)}`;
    const authNum = `AUTH-${refYear}-${String(randInt(100, 9999)).padStart(4, '0')}`;

    const alerts = pick(ALERT_OPTIONS);
    // Older patients more likely to have alerts
    const finalAlerts = age >= 70 && alerts.length === 0 && rand() > 0.6 ? ['Fall risk'] : alerts;

    const pmh = pick(PMH_OPTIONS);
    const meds = pick(MED_OPTIONS);

    // Generate note history based on care stage
    const noteHistory = [];
    if (careStage.stage !== 'New Eval') {
      noteHistory.push({ type:'Initial Evaluation', date:referralDate, author:'Dr. Sarah Mitchell, PT', status:'Signed & Locked' });
      for (let v = 1; v <= usedVisits; v++) {
        const noteDate = new Date(refYear, actualRefMonth - 1, refDay + (v * 3));
        const isProgress = v % 10 === 0 || (v === usedVisits && careStage.stage === 'Re-eval');
        const isPTANote = rand() > 0.5;
        noteHistory.push({
          type: isProgress ? 'Progress Note' : 'Daily Note',
          date: noteDate.toISOString().split('T')[0],
          author: isPTANote ? 'Alex Rivera, PTA' : 'Dr. Sarah Mitchell, PT',
          status: v === usedVisits && rand() > 0.5 ? 'Draft' : (isPTANote ? 'Co-signed' : 'Signed & Locked')
        });
      }
      if (careStage.stage === 'Discharged') {
        noteHistory.push({ type:'Discharge Summary', date:'2026-03-01', author:'Dr. Sarah Mitchell, PT', status:'Signed & Locked' });
      }
    }

    // Pain levels based on stage
    let currentPain, initialPain;
    initialPain = randInt(5, 9);
    if (careStage.stage === 'New Eval') currentPain = initialPain;
    else if (careStage.stage === 'Early') currentPain = Math.max(initialPain - randInt(0, 2), 2);
    else if (careStage.stage === 'Mid') currentPain = Math.max(initialPain - randInt(2, 4), 1);
    else if (careStage.stage === 'Late') currentPain = Math.max(initialPain - randInt(3, 5), 1);
    else if (careStage.stage === 'Nearing DC' || careStage.stage === 'Discharged') currentPain = Math.max(initialPain - randInt(4, 7), 0);
    else currentPain = Math.max(initialPain - randInt(1, 3), 2);

    // Functional outcome scores based on stage
    let initialODI = randInt(30, 70);
    let currentODI;
    if (careStage.stage === 'New Eval') currentODI = initialODI;
    else if (careStage.stage === 'Discharged') currentODI = Math.max(initialODI - randInt(20, 40), 4);
    else currentODI = Math.max(initialODI - Math.floor((usedVisits / authVisits) * randInt(15, 35)), 4);

    patients.push({
      id: i,
      firstName,
      lastName,
      dob,
      age,
      gender: isFemale ? 'Female' : 'Male',
      phone: `(555)${randInt(100,999)}-${randInt(1000,9999)}`,
      email: `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase()}${randInt(1,99)}@email.com`,
      ssn: `***-**-${randInt(1000,9999)}`,
      address: `${randInt(100,9999)} ${pick(STREETS)}, ${pick(CITIES)}, IL ${randInt(60000,62999)}`,
      insurance: ins.name,
      memberId,
      groupNum,
      authNum,
      authVisits,
      usedVisits,
      dx: `${dx.code} - ${dx.desc}`,
      dxCode: dx.code,
      bodyRegion: dx.bodyRegion,
      complexity: dx.complexity,
      referringMD: pick(REFERRING_MDS),
      referralDate,
      status,
      careStage: careStage.stage,
      alerts: finalAlerts,
      pmh,
      meds,
      noteHistory,
      initialPain,
      currentPain,
      initialODI,
      currentODI,
      surgicalHistory: dx.code.startsWith('Z96') || dx.code.startsWith('S83.5') || dx.code.startsWith('S42') ?
        `${dx.desc} — ${pick(REFERRING_MDS)} — ${referralDate}` : (rand() > 0.7 ? pick(['Appendectomy (2015)','Cholecystectomy (2018)','C-section (2012)','Tonsillectomy (childhood)','Arthroscopic surgery (2020)']) : 'None reported'),
      socialHistory: {
        living: pick(['Home (independent)','Home (with spouse)','Home (with family)','Assisted living','Skilled nursing facility']),
        occupation: age >= 65 ? 'Retired' : pick(['Office worker','Teacher','Construction worker','Nurse','Software developer','Sales associate','Mechanic','Warehouse worker','Accountant','Stay-at-home parent','Restaurant worker','Postal carrier','Electrician','Truck driver','Administrative assistant']),
        tobacco: pick(['Never','Never','Never','Former','Current']),
        alcohol: pick(['None','None','Occasional','Occasional','Moderate']),
      },
      // For exercise Rx tab
      exercises: generateExercises(dx.bodyRegion, careStage.stage, rand),
    });
  }

  return patients;
}

function generateExercises(bodyRegion, careStage, rand) {
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const exercises = {
    'Lumbar Spine': [
      { name:'Pelvic Tilts', sets:'2', reps:'10', hold:'5s', notes:'Supine, gentle' },
      { name:'Bridging', sets:'3', reps:'10', hold:'5s', notes:'Keep core engaged' },
      { name:'Dead Bugs', sets:'2', reps:'10 each', hold:'3s', notes:'Maintain neutral spine' },
      { name:'Bird Dogs', sets:'2', reps:'10 each', hold:'5s', notes:'Avoid rotation' },
      { name:'Cat/Cow', sets:'2', reps:'10', hold:'3s', notes:'Pain-free range' },
      { name:'Prone Press-ups', sets:'2', reps:'10', hold:'2s', notes:'Per McKenzie protocol' },
      { name:'Side-lying Clamshells', sets:'3', reps:'15', hold:'3s', notes:'Band at knees' },
      { name:'Standing Hip Hinge', sets:'2', reps:'10', hold:'3s', notes:'Maintain lumbar lordosis' },
      { name:'Plank', sets:'3', reps:'N/A', hold:'20-30s', notes:'Progress as tolerated' },
    ],
    'Cervical Spine': [
      { name:'Chin Tucks', sets:'3', reps:'10', hold:'5s', notes:'Against wall or supine' },
      { name:'Cervical AROM', sets:'2', reps:'10 each dir', hold:'2s', notes:'Pain-free range' },
      { name:'Scapular Squeezes', sets:'3', reps:'10', hold:'5s', notes:'Shoulders relaxed' },
      { name:'Upper Trap Stretch', sets:'3', reps:'3 each', hold:'30s', notes:'Gentle, no bouncing' },
      { name:'Levator Scap Stretch', sets:'3', reps:'3 each', hold:'30s', notes:'Look toward armpit' },
      { name:'Isometric Cervical', sets:'2', reps:'10 each', hold:'5s', notes:'All directions' },
    ],
    'Right Shoulder': genShoulderEx('right'),
    'Left Shoulder': genShoulderEx('left'),
    'Right Knee': genKneeEx('right'),
    'Left Knee': genKneeEx('left'),
    'Right Hip': genHipEx('right'),
    'Left Hip': genHipEx('left'),
    'Right Ankle': [
      { name:'Ankle Alphabet', sets:'2', reps:'1 full', hold:'N/A', notes:'Trace all letters' },
      { name:'Towel Calf Stretch', sets:'3', reps:'3', hold:'30s', notes:'Knee straight then bent' },
      { name:'Heel Raises', sets:'3', reps:'15', hold:'2s', notes:'Bilateral to unilateral' },
      { name:'Single Leg Balance', sets:'3', reps:'N/A', hold:'30s', notes:'Progress eyes closed' },
      { name:'Theraband 4-way Ankle', sets:'2', reps:'15 each', hold:'2s', notes:'DF/PF/Inv/Ev' },
    ],
    'Left Ankle': [
      { name:'Ankle Alphabet', sets:'2', reps:'1 full', hold:'N/A', notes:'Trace all letters' },
      { name:'Towel Calf Stretch', sets:'3', reps:'3', hold:'30s', notes:'Knee straight then bent' },
      { name:'Heel Raises', sets:'3', reps:'15', hold:'2s', notes:'Bilateral to unilateral' },
      { name:'Single Leg Balance', sets:'3', reps:'N/A', hold:'30s', notes:'Progress eyes closed' },
    ],
    'Neurological': [
      { name:'Seated Marching', sets:'3', reps:'20', hold:'N/A', notes:'Alternate legs' },
      { name:'Sit to Stand', sets:'3', reps:'10', hold:'3s', notes:'Min UE assist' },
      { name:'Standing Weight Shifts', sets:'2', reps:'10 each', hold:'5s', notes:'L/R and A/P' },
      { name:'Tandem Walking', sets:'3', reps:'20 feet', hold:'N/A', notes:'With standby assist' },
      { name:'Step-ups', sets:'2', reps:'10 each', hold:'N/A', notes:'6-inch step' },
      { name:'Heel-toe Walking', sets:'3', reps:'20 feet', hold:'N/A', notes:'Along wall for safety' },
    ],
    'Gait/Balance': [
      { name:'Tandem Stance', sets:'3', reps:'N/A', hold:'30s', notes:'Near wall for safety' },
      { name:'Single Leg Stance', sets:'3', reps:'N/A', hold:'30s', notes:'Both legs, eyes open then closed' },
      { name:'Heel Walking', sets:'2', reps:'30 feet', hold:'N/A', notes:'Hallway' },
      { name:'Toe Walking', sets:'2', reps:'30 feet', hold:'N/A', notes:'Hallway' },
      { name:'Obstacle Course Walking', sets:'2', reps:'1 circuit', hold:'N/A', notes:'Over/around objects' },
      { name:'Sit to Stand', sets:'3', reps:'10', hold:'3s', notes:'No UE assist' },
    ],
  };

  const defaultEx = [
    { name:'Gentle AROM', sets:'2', reps:'10', hold:'3s', notes:'Pain-free range' },
    { name:'Isometric Strengthening', sets:'2', reps:'10', hold:'5s', notes:'Sub-maximal effort' },
    { name:'Stretching', sets:'3', reps:'3', hold:'30s', notes:'Hold, no bouncing' },
  ];

  const regionEx = exercises[bodyRegion] || defaultEx;
  // Return subset based on care stage
  if (careStage === 'New Eval') return regionEx.slice(0, 3);
  if (careStage === 'Early') return regionEx.slice(0, 4);
  if (careStage === 'Mid') return regionEx.slice(0, 6);
  return regionEx;
}

function genShoulderEx(side) {
  return [
    { name:`Pendulum exercises (${side})`, sets:'2', reps:'30s each', hold:'N/A', notes:'Circular + linear' },
    { name:`AAROM wand flexion (${side})`, sets:'2', reps:'10', hold:'3s', notes:'Supine' },
    { name:`AAROM wand ER (${side})`, sets:'2', reps:'10', hold:'3s', notes:'Elbow at side' },
    { name:`Scapular squeezes`, sets:'3', reps:'10', hold:'5s', notes:'Shoulders relaxed' },
    { name:`Sidelying ER (${side})`, sets:'3', reps:'10', hold:'2s', notes:'2lb dumbbell' },
    { name:`Standing rows (${side})`, sets:'3', reps:'10', hold:'2s', notes:'Theraband' },
    { name:`Wall slides (${side})`, sets:'2', reps:'10', hold:'3s', notes:'Scapular control' },
    { name:`Push-up plus (wall)`, sets:'2', reps:'10', hold:'3s', notes:'Serratus activation' },
  ];
}

function genKneeEx(side) {
  return [
    { name:`Quad Sets (${side})`, sets:'3', reps:'10', hold:'5s', notes:'Towel under knee' },
    { name:`SLR - Flexion (${side})`, sets:'3', reps:'10', hold:'3s', notes:'Lock knee out' },
    { name:`SLR - Abduction (${side})`, sets:'3', reps:'10', hold:'3s', notes:'Sidelying' },
    { name:`Heel Slides (${side})`, sets:'2', reps:'15', hold:'3s', notes:'Supine, smooth arc' },
    { name:`Hamstring Curls (${side})`, sets:'3', reps:'10', hold:'2s', notes:'Standing, ankle weight' },
    { name:`Terminal Knee Extension (${side})`, sets:'3', reps:'10', hold:'3s', notes:'Short arc quad' },
    { name:`Step-ups (${side})`, sets:'3', reps:'10', hold:'N/A', notes:'6-inch step' },
    { name:`Wall Sits`, sets:'3', reps:'N/A', hold:'20s', notes:'Knees at 45°' },
    { name:`Stationary Bike`, sets:'1', reps:'10 min', hold:'N/A', notes:'Low resistance' },
  ];
}

function genHipEx(side) {
  return [
    { name:`Ankle Pumps`, sets:'2', reps:'20', hold:'N/A', notes:'DVT prevention' },
    { name:`Glute Sets`, sets:'3', reps:'10', hold:'5s', notes:'Squeeze and hold' },
    { name:`Heel Slides (${side})`, sets:'2', reps:'15', hold:'3s', notes:'Pain-free range' },
    { name:`Standing Hip Flexion (${side})`, sets:'3', reps:'10', hold:'3s', notes:'March in place' },
    { name:`Standing Hip Abduction (${side})`, sets:'3', reps:'10', hold:'3s', notes:'Theraband' },
    { name:`Standing Hip Extension (${side})`, sets:'3', reps:'10', hold:'3s', notes:'Squeeze glute' },
    { name:`Bridges`, sets:'3', reps:'10', hold:'5s', notes:'Both legs, progress to single' },
    { name:`Sit to Stand`, sets:'3', reps:'10', hold:'3s', notes:'Standard chair height' },
  ];
}

// Generate the patients
const SAMPLE_PATIENTS = generatePatients();

// Generate a full day schedule from the patient roster
function generateSchedule(patients) {
  const activePatients = patients.filter(p => p.status === 'Active');
  const times = ['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];
  const schedule = [];
  const rand = seededRandom(123);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  let ptIdx = 0;
  let ptaIdx = 0;

  for (const time of times) {
    // PT slot
    if (ptIdx < activePatients.length && rand() > 0.15) {
      const p = activePatients[ptIdx++];
      const type = p.careStage === 'New Eval' ? 'Initial Eval' :
                   p.careStage === 'Nearing DC' ? (rand() > 0.5 ? 'Discharge' : 'Follow-up') :
                   p.careStage === 'Re-eval' ? 'Re-evaluation' :
                   (rand() > 0.85 ? 'Progress Note' : 'Follow-up');
      const statuses = ['Scheduled','Scheduled','Scheduled','Checked In','In Progress','Completed'];
      schedule.push({ time, patient:`${p.lastName}, ${p.firstName}`, patientId:p.id, type, therapist:'PT', status:pick(statuses) });
    } else {
      schedule.push({ time, patient:'(Open Slot)', type:'', therapist:'PT', status:'', patientId:null });
    }

    // PTA slot
    if (ptaIdx < activePatients.length && rand() > 0.25) {
      const p = activePatients[Math.min(ptaIdx + 15, activePatients.length - 1)];
      ptaIdx++;
      schedule.push({ time, patient:`${p.lastName}, ${p.firstName}`, patientId:p.id, type:'Follow-up', therapist:'PTA', status:pick(['Scheduled','Scheduled','Checked In','Completed']) });
    } else {
      schedule.push({ time, patient:'(Open Slot)', type:'', therapist:'PTA', status:'', patientId:null });
    }
  }
  return schedule;
}

const SCHEDULE_DATA = generateSchedule(SAMPLE_PATIENTS);
