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

// ==================== CLINICAL DATA GENERATOR ====================
function generateClinicalData(patient) {
  const seed = patient.id * 31 + 7;
  const sRand = (n) => ((seed * (n+1) * 9301 + 49297) % 233280) / 233280;
  const pick = (arr, n) => arr[Math.floor(sRand(n) * arr.length)];
  const region = patient.bodyRegion || '';
  const isSpine = region.includes('Spine') || region.includes('Lumbar') || region.includes('Cervical');
  const isShoulder = region.includes('Shoulder');
  const isKnee = region.includes('Knee');
  const isHip = region.includes('Hip');
  const isAnkle = region.includes('Ankle');
  const isNeuro = region.includes('Neuro') || (patient.dx||'').includes('CVA') || (patient.dx||'').includes('Parkinson') || (patient.dx||'').includes('Hemiplegia');
  const isBalance = region.includes('Balance') || region.includes('Generalized') || region.includes('Gait');
  const side = region.includes('Right') ? 'right' : region.includes('Left') ? 'left' : 'bilateral';
  const sideU = side.charAt(0).toUpperCase() + side.slice(1);
  const age = patient.age || 55;
  const pain = patient.initialPain || 7;
  const stage = patient.careStage || 'Mid';
  const dx = patient.dx || '';

  // Chief complaints by region
  const chiefComplaints = {
    spine: [
      `Patient reports ${pain >= 7 ? 'severe' : 'moderate'} ${region.includes('Cervical') ? 'neck' : 'low back'} pain rated ${pain}/10 with ${pain >= 7 ? 'constant aching and intermittent sharp pain' : 'intermittent aching'} that ${dx.includes('sciatica') || dx.includes('Radiculopathy') ? 'radiates into the ' + side + ' lower extremity to the knee' : 'is localized to the ' + (region.includes('Cervical') ? 'posterior cervical and upper trapezius region' : 'lumbar paraspinals')}. Pain worsens with ${region.includes('Cervical') ? 'prolonged computer work, looking up, and driving' : 'prolonged sitting, bending, and lifting'}. Reports difficulty with ${region.includes('Cervical') ? 'overhead reaching, turning head to check blind spots while driving, and sleeping' : 'putting on shoes/socks, getting in/out of car, and standing from sitting'}.`,
    ],
    shoulder: [
      `Patient reports ${pain >= 7 ? 'severe' : 'moderate'} ${side} shoulder pain rated ${pain}/10 described as ${dx.includes('capsulitis') ? 'deep aching with significant stiffness, especially in the morning' : dx.includes('Rotator cuff') ? 'sharp pain with overhead movements and at night when lying on the affected side' : 'aching pain with overhead activities and reaching behind the back'}. Symptoms began ${dx.includes('init') ? 'acutely after a fall/injury' : 'gradually over the past several weeks'}. Reports difficulty with ${pick(['reaching overhead to get items from cabinets','combing hair and reaching behind back','dressing (putting on coat/bra)','sleeping on the affected side','lifting objects above shoulder height'],0)}.`,
    ],
    knee: [
      `Patient reports ${pain >= 7 ? 'severe' : 'moderate'} ${side} knee pain rated ${pain}/10 described as ${dx.includes('OA') ? 'deep aching that worsens with activity and improves with rest. Reports morning stiffness lasting 20-30 minutes' : dx.includes('ACL') ? 'sharp pain with pivoting and feelings of instability. Reports episodes of the knee giving way' : dx.includes('Meniscus') ? 'catching and locking sensation with sharp pain on twisting movements' : dx.includes('TKA') ? 'post-surgical stiffness and moderate pain at the incision site' : 'diffuse aching around the knee joint'}. Reports difficulty with ${pick(['stair negotiation (especially descending)','prolonged walking > 15 minutes','transitioning from sit to stand','squatting and kneeling','getting in/out of car'],1)}.`,
    ],
    hip: [
      `Patient reports ${pain >= 7 ? 'severe' : 'moderate'} ${side} hip pain rated ${pain}/10 described as ${dx.includes('OA') ? 'deep groin and lateral hip aching that worsens with weight bearing and ambulation' : dx.includes('THA') ? 'post-surgical soreness with stiffness. Following hip precautions per surgeon protocol' : 'deep aching in the ' + side + ' hip region'}. Reports difficulty with ${pick(['ambulation > 1 block','stair climbing','donning/doffing shoes and socks','getting in/out of bed','rising from low surfaces'],2)}.`,
    ],
    neuro: [
      `Patient reports ${isNeuro ? 'functional limitations following neurological event' : 'generalized weakness and balance impairment'} with primary complaints of ${pick(['difficulty walking without assistance','impaired balance with frequent near-falls','weakness on the affected side limiting ADLs','difficulty with transfers and mobility tasks'],3)}. ${dx.includes('CVA') ? 'Patient is ' + pick(['3 weeks','6 weeks','2 months'],4) + ' post-CVA with ' + side + ' hemiparesis.' : dx.includes('Parkinson') ? 'Reports progressive difficulty with balance, gait initiation, and dual-task activities.' : 'Reports history of ' + pick(['multiple falls in the past 3 months','progressive deconditioning','generalized weakness affecting functional mobility'],5) + '.'}`,
    ],
    general: [
      `Patient reports ${pain >= 7 ? 'significant' : 'moderate'} pain rated ${pain}/10 in the ${region} with functional limitations in daily activities. Symptoms have been present for ${pick(['2 weeks','1 month','6 weeks','3 months','several months'],6)} and are ${pick(['gradually worsening','intermittent but limiting function','constant with variable intensity'],7)}. Reports difficulty with ${pick(['work duties','household chores','recreational activities','sleeping comfortably','self-care tasks'],8)}.`,
    ],
  };

  const cc = isSpine ? chiefComplaints.spine[0] : isShoulder ? chiefComplaints.shoulder[0] : isKnee ? chiefComplaints.knee[0] : isHip ? chiefComplaints.hip[0] : (isNeuro || isBalance) ? chiefComplaints.neuro[0] : chiefComplaints.general[0];

  // HPI
  const onsetType = dx.includes('init') || dx.includes('Sprain') || dx.includes('Fracture') ? 'acute' : (sRand(10) > 0.5 ? 'insidious' : 'gradual');
  const duration = pick(['approximately 2 weeks ago','approximately 3 weeks ago','about 1 month ago','over the past 6 weeks','approximately 2 months ago','over the past 3 months'],11);
  const mechanism = onsetType === 'acute' ? pick(['after a fall','following a motor vehicle accident','while lifting a heavy object','during athletic activity','after a twisting injury'],12) : pick(['without specific mechanism of injury','with gradual onset related to repetitive activities','following increased activity level','associated with occupational demands','without identifiable precipitating event'],13);
  const aggravating = isSpine ? (region.includes('Cervical') ? 'prolonged sitting at computer, looking up/down, turning head' : 'prolonged sitting > 30 min, bending forward, lifting > 15 lbs') : isShoulder ? 'overhead reaching, reaching behind back, lying on affected side' : isKnee ? 'stair climbing (especially descending), prolonged standing, squatting' : isHip ? 'prolonged ambulation, stair climbing, sit-to-stand transitions' : 'prolonged activity, repetitive movements, sustained positions';
  const easing = pick(['rest, ice application, and position change','heat application, gentle stretching, and OTC analgesics','activity modification and anti-inflammatory medication','lying down with support and avoiding aggravating activities'],14);
  const priorTx = pick(['No prior physical therapy for this condition.','Patient received a course of physical therapy 1 year ago with moderate improvement.','Patient has tried chiropractic treatment with temporary relief.','No prior conservative treatment attempted.','Patient has been self-managing with stretching and OTC medications.'],15);
  const hpi = `Onset: ${onsetType.charAt(0).toUpperCase() + onsetType.slice(1)} onset ${duration} ${mechanism}. Duration: Symptoms have been ${onsetType === 'acute' ? 'present since the injury' : 'progressively worsening'}. Aggravating factors: ${aggravating}. Easing factors: ${easing}. ${priorTx} Patient was referred by ${patient.referringMD || 'primary care physician'} for physical therapy evaluation and treatment.`;

  // Prior level of function
  const plof = age >= 65 ?
    pick(['Independent with all ADLs and IADLs. Ambulatory in community without assistive device. Active in daily walks (30 min/day) and light gardening.','Independent with all ADLs. Uses no assistive device for ambulation. Active in senior exercise classes 2x/week.','Modified independent with ADLs. Ambulatory with straight cane for community distances. Lives with spouse in single-story home.','Independent with all functional mobility. Active in golf 2x/week and daily walking program.'],16) :
    pick(['Independent with all ADLs and IADLs. Works full-time as ' + (patient.socialHistory?.occupation || 'office worker') + '. Active in recreational exercise 3x/week including jogging and gym workouts.','Fully independent at home and work. Enjoys running, cycling, and strength training. No prior functional limitations.','Independent with all activities. Works as ' + (patient.socialHistory?.occupation || 'teacher') + '. Active in yoga and walking. Primary caregiver for children.','High-level function at baseline. Participates in regular exercise program. No prior mobility limitations.'],17);

  // Patient goals
  const patientGoals = isSpine ? 'Return to work duties without pain. Able to sit for > 1 hour comfortably. Able to sleep through the night. Resume exercise routine.' : isShoulder ? 'Full use of ' + side + ' arm without pain. Able to reach overhead for daily tasks. Return to exercise program. Able to sleep on affected side.' : isKnee ? 'Walk without a limp. Go up and down stairs normally. Return to recreational activities. Stand for prolonged periods without pain.' : isHip ? 'Walk independently for community distances. Return to exercise program. Perform all ADLs without difficulty.' : 'Return to prior level of function. Resume all daily activities without limitation. Pain-free with normal activities.';

  // ROM data based on region
  const romData = {};
  const ROM_JOINTS = ['Cervical Flexion','Cervical Extension','Cervical Rotation','Shoulder Flexion','Shoulder Abduction','Shoulder ER','Shoulder IR','Elbow Flexion','Hip Flexion','Hip Extension','Hip Abduction','Knee Flexion','Knee Extension','Ankle DF','Ankle PF'];
  ROM_JOINTS.forEach((j, idx) => {
    const isAffectedRegion = (isSpine && j.includes('Cervical') && region.includes('Cervical')) ||
      (isSpine && (j.includes('Hip') || j.includes('Knee')) && region.includes('Lumbar')) ||
      (isShoulder && j.includes('Shoulder')) ||
      (isKnee && (j.includes('Knee') || j.includes('Hip'))) ||
      (isHip && (j.includes('Hip') || j.includes('Knee'))) ||
      (isAnkle && (j.includes('Ankle') || j.includes('Knee')));

    const norms = { 'Cervical Flexion': 50, 'Cervical Extension': 60, 'Cervical Rotation': 80, 'Shoulder Flexion': 180, 'Shoulder Abduction': 180, 'Shoulder ER': 90, 'Shoulder IR': 70, 'Elbow Flexion': 150, 'Hip Flexion': 120, 'Hip Extension': 30, 'Hip Abduction': 45, 'Knee Flexion': 135, 'Knee Extension': 0, 'Ankle DF': 20, 'Ankle PF': 50 };
    const norm = norms[j] || 90;
    if (isAffectedRegion) {
      const deficit = Math.floor(norm * (0.15 + sRand(idx*3+1) * 0.35));
      const affSide = side === 'bilateral' ? 'R' : (side === 'right' ? 'R' : 'L');
      const unaffSide = affSide === 'R' ? 'L' : 'R';
      if (j === 'Knee Extension') {
        romData[j] = { aR: affSide==='R' ? '-' + Math.floor(deficit*0.3) : '0', aL: affSide==='L' ? '-' + Math.floor(deficit*0.3) : '0', pR: affSide==='R' ? '-' + Math.max(Math.floor(deficit*0.2),0) : '0', pL: affSide==='L' ? '-' + Math.max(Math.floor(deficit*0.2),0) : '0', wnl: false };
      } else {
        romData[j] = { aR: affSide==='R' ? ''+(norm - deficit) : ''+norm, aL: affSide==='L' ? ''+(norm - deficit) : ''+norm, pR: affSide==='R' ? ''+(norm - Math.floor(deficit*0.7)) : ''+norm, pL: affSide==='L' ? ''+(norm - Math.floor(deficit*0.7)) : ''+norm, wnl: false };
      }
    } else {
      romData[j] = { aR: '', aL: '', pR: '', pL: '', wnl: true };
    }
  });

  // MMT data
  const MMT_GROUPS = ['Shoulder Flexors','Shoulder Abductors','Elbow Flexors','Elbow Extensors','Wrist Extensors','Hip Flexors','Hip Extensors','Hip Abductors','Knee Extensors','Knee Flexors','Ankle DF','Ankle PF'];
  const mmtData = {};
  MMT_GROUPS.forEach((m, idx) => {
    const isAffectedMuscle = (isShoulder && (m.includes('Shoulder') || m.includes('Elbow'))) ||
      (isKnee && (m.includes('Knee') || m.includes('Hip'))) ||
      (isHip && (m.includes('Hip') || m.includes('Knee'))) ||
      (isAnkle && (m.includes('Ankle') || m.includes('Knee'))) ||
      (isNeuro || isBalance);
    if (isAffectedMuscle) {
      const grades = ['3+/5','4-/5','4/5','3/5','4+/5'];
      const g = grades[Math.floor(sRand(idx*5+2) * grades.length)];
      const affSide = side === 'bilateral' ? g : (side === 'right' ? g : '5/5');
      const unaffSide = side === 'bilateral' ? g : (side === 'right' ? '5/5' : g);
      mmtData[m] = { R: side!=='left'?g:'5/5', L: side!=='right'?g:'5/5', notes: sRand(idx*7) > 0.6 ? 'Pain-limited' : '' };
    } else {
      mmtData[m] = { R: '5/5', L: '5/5', notes: '' };
    }
  });

  // Special tests
  const specialTests = isSpine ? (region.includes('Lumbar') ?
    `SLR: ${side === 'right' || side === 'bilateral' ? 'Positive R at ' + (30 + Math.floor(sRand(20)*30)) + '°' : 'Negative R'}, ${side === 'left' || side === 'bilateral' ? 'Positive L at ' + (30 + Math.floor(sRand(21)*30)) + '°' : 'Negative L'}. Slump test: ${pick(['Positive reproducing concordant symptoms','Positive for neural tension','Negative bilaterally'],22)}. Prone instability test: ${pick(['Positive','Negative'],23)}. Lumbar spring test: ${pick(['Hypomobile L4-L5','Hypomobile L5-S1','Pain provocation at L4-L5','WNL'],24)}.` :
    `Spurling test: ${pick(['Positive R reproducing radicular symptoms','Positive L reproducing concordant pain','Negative bilaterally'],25)}. Distraction test: ${pick(['Positive — symptoms relieved','Negative'],26)}. Upper limb tension test: ${pick(['Positive R for median nerve bias','Positive L for median nerve bias','Negative bilaterally'],27)}. Cervical rotation: ${pick(['Limited and painful R','Limited and painful L','Limited bilaterally'],28)}.`) :
    isShoulder ? `Neer impingement: ${pick(['Positive','Negative'],29)}. Hawkins-Kennedy: ${pick(['Positive','Negative'],30)}. Empty can test: ${pick(['Positive — weakness and pain','Positive — pain only','Negative'],31)}. Speed test: ${pick(['Positive','Negative'],32)}. Cross-body adduction: ${pick(['Positive for AC joint pain','Negative'],33)}. ${dx.includes('capsulitis') ? 'Significant capsular pattern noted with ER > ABD > IR limitation.' : ''}` :
    isKnee ? `Lachman test: ${dx.includes('ACL') ? 'Positive with soft end-feel' : 'Negative'}. Anterior drawer: ${dx.includes('ACL') ? 'Positive' : 'Negative'}. McMurray test: ${dx.includes('Meniscus') ? 'Positive medial with click and pain' : 'Negative'}. Valgus/varus stress: ${pick(['Stable at 0° and 30°','Mild laxity at 30° valgus','Stable bilaterally'],34)}. Patellar grind: ${dx.includes('OA') ? 'Positive with crepitus' : pick(['Mild crepitus','Negative'],35)}.` :
    isHip ? `FABER test: ${pick(['Positive ' + side + ' for groin pain','Positive ' + side + ' for SI joint pain','Positive bilaterally'],36)}. Log roll: ${pick(['Positive — pain with IR','Negative'],37)}. Thomas test: ${pick(['Positive — ' + side + ' hip flexor tightness','Negative'],38)}. Ober test: ${pick(['Positive — ITB tightness ' + side,'Negative bilaterally'],39)}. Trendelenburg: ${pick(['Positive ' + side,'Negative'],40)}.` :
    'Appropriate special tests performed per clinical indication. See objective findings above.';

  // Posture/alignment
  const posture = isSpine ? (region.includes('Cervical') ?
    'Forward head posture noted. Rounded shoulders bilaterally. Upper crossed syndrome pattern. Increased thoracic kyphosis.' :
    'Lumbar lordosis ' + pick(['decreased','increased','flattened'],41) + '. ' + pick(['Lateral shift noted to the ' + side,'No lateral shift noted','Slight ' + side + ' pelvic obliquity'],42) + '. ' + pick(['Bilateral hamstring tightness noted','Hip flexor tightness noted bilaterally','Core stabilizer weakness evident with single-leg stance'],43) + '.') :
    isShoulder ? sideU + ' shoulder ' + pick(['protracted and elevated compared to uninvolved side','depressed compared to uninvolved side','anteriorly tilted scapula noted'],44) + '. ' + pick(['Scapular winging noted with forward flexion','Scapular dyskinesis observed during overhead movement','Scapulohumeral rhythm disrupted on affected side'],45) + '.' :
    isKnee ? pick(['Genu valgum noted ' + side,'Mild genu varum ' + side,'Alignment WNL in standing'],46) + '. ' + pick(['Quadriceps atrophy noted ' + side + ' compared to uninvolved side','Visible swelling noted ' + side + ' knee','Mild effusion palpated ' + side + ' knee'],47) + '.' :
    'Postural assessment reveals ' + pick(['generally good alignment with minor asymmetries','mild forward head posture and rounded shoulders','age-appropriate postural changes'],48) + '.';

  // Palpation
  const palpation = isSpine ? (region.includes('Cervical') ?
    'Tenderness to palpation: ' + pick(['bilateral upper trapezius, levator scapulae, and suboccipital muscles','right SCM, right upper trapezius, and cervical paraspinals C4-C6','bilateral cervical paraspinals with trigger points in upper trapezius'],49) + '. ' + pick(['Muscle guarding noted','Hypertonicity noted in cervical paraspinals','Myofascial restrictions palpated'],50) + '.' :
    'Tenderness to palpation: ' + pick(['bilateral lumbar paraspinals L3-S1 with increased tone','right QL, bilateral multifidi L4-L5, and SI joint region','left piriformis, bilateral lumbar erector spinae, and L5-S1 segmental level'],51) + '. ' + pick(['Muscle spasm noted in lumbar paraspinals','Trigger points identified in QL and piriformis','Segmental hypomobility at L4-L5'],52) + '.') :
    isShoulder ? 'Tenderness to palpation: ' + pick(['anterior joint line, bicipital groove, and supraspinatus insertion','greater tuberosity, posterior capsule, and upper trapezius','subacromial space, AC joint, and deltoid insertion'],53) + '. ' + pick(['No warmth or erythema','Mild crepitus with passive ROM','Muscle guarding with palpation of rotator cuff'],54) + '.' :
    isKnee ? 'Tenderness to palpation: ' + pick(['medial joint line and pes anserine region','lateral joint line and ITB','patellar tendon and peripatellar tissues'],55) + '. ' + pick(['Mild effusion present','No warmth or erythema noted','Crepitus noted with passive flexion/extension'],56) + '.' :
    'Palpation reveals localized tenderness in the ' + region + ' region with associated soft tissue restrictions.';

  // Gait analysis
  const gait = isKnee || isHip || isBalance || isNeuro ?
    pick(['Antalgic gait pattern noted with decreased stance phase on ' + side + ' lower extremity. Decreased step length and cadence. ' + (age >= 65 ? 'Using straight cane for community ambulation.' : 'No assistive device used currently.'),'Gait deviations include ' + pick(['decreased ' + side + ' knee flexion in swing phase','Trendelenburg sign noted during ' + side + ' single-leg stance','decreased push-off ' + side + ' with reduced stride length'],57) + '. Ambulating independently ' + (age >= 65 ? 'with single-point cane' : 'without assistive device') + '.','Mild antalgic pattern with compensatory strategies. Decreased cadence and self-selected walking speed. Independent with ambulation on level surfaces.'],58) :
    isSpine ? pick(['Gait assessment reveals mildly decreased cadence and guarded posture with ambulation. No significant deviations noted. Independent and safe.','Gait: Independent, mildly reduced stride length and increased time in double support. No assistive device.'],59) :
    'Gait pattern within functional limits for age. No significant deviations noted. Safe and independent with ambulation.';

  // Balance
  const balance = (isBalance || isNeuro || age >= 65) ?
    'Single-leg stance: R ' + (5 + Math.floor(sRand(60)*15)) + ' sec, L ' + (5 + Math.floor(sRand(61)*15)) + ' sec (norm >30 sec). Romberg: ' + pick(['Positive with eyes closed','Mild sway with eyes closed','Negative'],62) + '. Tandem stance: ' + pick(['Unable to maintain > 5 seconds','Maintained 10 seconds with UE support','Maintained 15 seconds independently'],63) + '. Berg Balance Scale: ' + (30 + Math.floor(sRand(64)*16)) + '/56 (' + pick(['moderate fall risk','low fall risk','high fall risk'],65) + '). Timed Up and Go: ' + (10 + Math.floor(sRand(66)*10)) + ' seconds.' :
    'Balance: ' + pick(['Within functional limits for age. Single-leg stance maintained > 15 seconds bilaterally.','Mildly decreased with eyes closed but adequate for functional activities.','WNL — no impairments noted during functional testing.'],67);

  // Functional mobility
  const funcMobility = (isBalance || isNeuro || age >= 65) ?
    'Sit-to-stand: ' + pick(['Independent with use of armrests','Modified independent — slow but safe','Requires verbal cues for proper body mechanics'],68) + '. Transfers: ' + pick(['Independent all surfaces','Modified independent bed mobility','Supervision with tub transfers'],69) + '. Stair negotiation: ' + pick(['Step-over-step with railing','Step-to-step pattern with bilateral rail','Independent ascending, rail descending'],70) + '.' :
    'Functional mobility: ' + pick(['Independent with all transfers and mobility tasks. Reports difficulty with ' + (isSpine ? 'floor transfers and prolonged positional changes' : 'sport-specific movements and high-level activities') + '.','Independent with all functional mobility. Limitations noted with sustained and repetitive activities.'],71);

  // Assessment text
  const assessment = `${age}-year-old ${patient.gender?.toLowerCase() || 'patient'} presents with ${dx} affecting the ${region}. Patient demonstrates ${pick(['impaired ROM, decreased strength, and functional limitations','movement system impairment with associated pain and functional deficit','neuromuscular and musculoskeletal deficits affecting functional performance'],72)} consistent with the referring diagnosis. ${pain >= 7 ? 'Moderate to severe' : 'Mild to moderate'} impairment level. ${pick(['Patient is a good candidate for skilled physical therapy intervention.','Patient would benefit from a structured rehabilitation program.','Skilled PT intervention is indicated to address identified impairments and functional limitations.'],73)} Rehabilitation potential: ${pick(['Good','Good to excellent','Fair to good'],74)} based on patient motivation, prior level of function, and clinical presentation.`;

  // PT diagnosis
  const ptDiagnosis = isSpine ? pick(['Lumbar movement coordination impairment with associated radiculopathy','Lumbar regional pain syndrome with mobility deficit','Cervical movement coordination impairment with associated headaches','Lumbar segmental instability with movement coordination impairment','Cervical mobility deficit with associated radiculopathy'],75) :
    isShoulder ? pick(['Shoulder mobility deficit with associated rotator cuff dysfunction','Shoulder adhesive capsulitis with movement restriction','Shoulder impingement syndrome with rotator cuff tendinopathy','Shoulder post-surgical recovery with mobility and strength deficits'],76) :
    isKnee ? pick(['Knee mobility deficit with associated strength impairment','Knee osteoarthritis with functional decline','Post-surgical knee rehabilitation with ROM and strength deficits','Knee ligamentous instability with functional impairment'],77) :
    'Movement system impairment of the ' + region + ' with associated pain and functional limitations';

  // Problem list
  const problemList = `1. Decreased ROM in the ${region} — limited ${isSpine ? 'flexion, extension, and rotation' : isShoulder ? 'flexion, abduction, and external rotation' : isKnee ? 'flexion and extension' : 'functional ROM'}
2. Decreased strength in ${isSpine ? 'core stabilizers and hip musculature' : isShoulder ? 'rotator cuff and scapular stabilizers' : isKnee ? 'quadriceps and hamstrings' : isHip ? 'hip flexors, abductors, and extensors' : 'involved musculature'} — ${pick(['3+/5 to 4/5','4-/5 to 4/5','3/5 to 4-/5'],78)}
3. Pain ${pain}/10 limiting functional activities
4. Impaired ${pick(['posture and body mechanics','neuromuscular control','balance and coordination','functional mobility'],79)}
5. Decreased functional independence with ${pick(['ADLs and work duties','ambulation and stair negotiation','overhead activities and self-care','transfers and mobility tasks'],80)}`;

  // Goals
  const stg = isSpine ? [
    `Patient will demonstrate ${region.includes('Cervical') ? 'cervical' : 'lumbar'} AROM to within 80% of normal in all planes within 4 weeks to improve functional mobility.`,
    `Patient will report pain level of ≤${Math.max(pain-3,2)}/10 with daily activities within 3 weeks.`,
    `Patient will demonstrate independent ${pick(['lumbar stabilization exercise program','cervical postural correction exercises','core activation with functional movements'],81)} within 2 weeks.`,
  ] : isShoulder ? [
    `Patient will demonstrate ${side} shoulder AROM flexion to ≥${dx.includes('capsulitis')?'140':'160'}° within 4 weeks.`,
    `Patient will report pain level of ≤${Math.max(pain-3,2)}/10 with reaching activities within 3 weeks.`,
    `Patient will demonstrate ${side} shoulder strength of ≥4/5 in rotator cuff musculature within 4 weeks.`,
  ] : isKnee ? [
    `Patient will demonstrate ${side} knee AROM ${dx.includes('TKA')?'0-110°':'0-125°'} within 4 weeks.`,
    `Patient will ambulate independently on level surfaces without antalgic gait pattern within 3 weeks.`,
    `Patient will ascend/descend 12 stairs step-over-step with railing within 4 weeks.`,
  ] : [
    `Patient will demonstrate improved ROM in the ${region} to within 80% of normal within 4 weeks.`,
    `Patient will report pain ≤${Math.max(pain-3,2)}/10 with daily activities within 3 weeks.`,
    `Patient will perform ${pick(['home exercise program independently','functional activities with proper mechanics','balance activities safely'],82)} within 2 weeks.`,
  ];

  const ltg = [
    `Patient will return to ${age >= 65 ? 'prior level of function including independent community ambulation and all ADLs' : 'full work duties and recreational activities without limitation'} within ${pick(['8','10','12'],83)} weeks.`,
    `Patient will report pain level of ≤${Math.max(pain-5,1)}/10 and ODI/functional score improved by MCID within ${pick(['8','10','12'],84)} weeks.`,
  ];

  // Progress note data
  const painImproved = patient.currentPain || Math.max(pain - 3, 1);
  const progressSubjective = stage === 'Early' ?
    `Patient reports ${pick(['some improvement','mild improvement','no significant change'],85)} since initiating physical therapy. Current pain ${painImproved}/10 (initial ${pain}/10). ${pick(['Reports exercises are helping but still has difficulty with prolonged activities.','Able to tolerate HEP with minimal increase in symptoms.','Notices less stiffness in the morning but pain persists with activity.'],86)}` :
    stage === 'Mid' ?
    `Patient reports ${pick(['good progress','moderate improvement','steady improvement'],87)} with physical therapy. Current pain ${painImproved}/10 (initial ${pain}/10). ${pick(['Able to perform daily activities with less difficulty than at initial evaluation.','HEP compliance is good — reports feeling stronger and more mobile.','Functional gains noted with stair negotiation and prolonged walking tolerance.','Reports sleeping better and able to tolerate work duties with fewer breaks.'],88)}` :
    stage === 'Late' || stage === 'Nearing DC' ?
    `Patient reports ${pick(['significant improvement','substantial functional gains','near-complete resolution of symptoms'],89)}. Current pain ${painImproved}/10 (initial ${pain}/10). ${pick(['Able to return to most prior activities including exercise program.','Reports minimal limitations with ADLs and work. Tolerating progressive strengthening well.','Goals largely met — patient reports high satisfaction with progress.'],90)}` :
    `Patient reports ${pick(['some functional improvement since last assessment','ongoing symptoms but better management strategies','variable progress with good and bad days'],91)}. Current pain ${painImproved}/10 (initial ${pain}/10).`;

  const progressObjective = `Key objective measures (current vs initial):\n- ROM: ${isSpine ? (region.includes('Cervical') ? 'Cervical flexion improved from 30° to 42°, rotation from 55° to 70°' : 'Lumbar flexion improved, SLR improved from 35° to 55°') : isShoulder ? 'Shoulder flexion improved from 120° to 155°, ER from 40° to 65°' : isKnee ? 'Knee flexion improved from 95° to 120°, extension from -8° to -2°' : 'ROM improved in all limited planes toward functional range'}\n- Strength: ${pick(['Improved 0.5-1 grade in key muscle groups','Quad and hip strength improved from 3+/5 to 4/5','Rotator cuff strength improved from 3+/5 to 4/5','Core stability improved — able to maintain neutral spine with UE/LE challenges'],92)}\n- Function: ${pick(['Gait improved — normalized cadence and stride length','Stair negotiation improved to step-over-step pattern','Overhead reaching now functional for daily tasks','Transfer and mobility skills improved to independent level'],93)}`;

  const progressClinicalReasoning = `Patient has demonstrated ${pick(['measurable improvement','clinically significant gains','steady progress'],94)} in ROM, strength, and functional mobility since initial evaluation. ${pick(['Continued skilled PT is warranted to achieve remaining goals and ensure safe return to full function.','Patient continues to benefit from skilled intervention — further progression of therapeutic exercise and manual therapy is indicated.','Skilled care remains necessary to address remaining deficits and prevent recurrence.'],95)} ${stage === 'Late' || stage === 'Nearing DC' ? 'Discharge planning initiated — patient transitioning to independent HEP maintenance program.' : 'Plan to continue current frequency with progression of therapeutic interventions.'}`;

  const goalStatusData = {};
  if (stage === 'Early') {
    goalStatusData['STG 1'] = { status: 'In Progress', notes: 'Progressing' };
    goalStatusData['STG 2'] = { status: 'In Progress', notes: 'Improving' };
    goalStatusData['STG 3'] = { status: 'In Progress', notes: '' };
    goalStatusData['LTG 1'] = { status: 'In Progress', notes: '' };
    goalStatusData['LTG 2'] = { status: 'In Progress', notes: '' };
  } else if (stage === 'Mid') {
    goalStatusData['STG 1'] = { status: 'Partially Met', notes: 'ROM improving, not yet at target' };
    goalStatusData['STG 2'] = { status: 'Met', notes: 'Pain goal achieved' };
    goalStatusData['STG 3'] = { status: 'In Progress', notes: 'Progressing well' };
    goalStatusData['LTG 1'] = { status: 'In Progress', notes: 'On track' };
    goalStatusData['LTG 2'] = { status: 'In Progress', notes: '' };
  } else if (stage === 'Late' || stage === 'Nearing DC') {
    goalStatusData['STG 1'] = { status: 'Met', notes: 'ROM at target' };
    goalStatusData['STG 2'] = { status: 'Met', notes: 'Pain at goal level' };
    goalStatusData['STG 3'] = { status: 'Met', notes: 'HEP independent' };
    goalStatusData['LTG 1'] = { status: stage==='Nearing DC'?'Met':'Partially Met', notes: stage==='Nearing DC'?'Returning to all activities':'Near goal' };
    goalStatusData['LTG 2'] = { status: 'In Progress', notes: 'MCID achieved for ODI' };
  } else {
    goalStatusData['STG 1'] = { status: 'In Progress', notes: '' };
    goalStatusData['STG 2'] = { status: 'In Progress', notes: '' };
    goalStatusData['STG 3'] = { status: 'In Progress', notes: '' };
    goalStatusData['LTG 1'] = { status: 'In Progress', notes: '' };
    goalStatusData['LTG 2'] = { status: 'In Progress', notes: '' };
  }

  return {
    chiefComplaint: cc,
    hpi, plof: plof, patientGoals,
    painQuality: pick(['Sharp','Dull/Aching','Burning','Throbbing','Radiating','Stabbing'],96),
    romData, mmtData,
    specialTests, posture, palpation, gait, balance, funcMobility,
    assessment, ptDiagnosis, problemList,
    stg, ltg,
    lefs: isKnee || isHip || isAnkle ? '' + (25 + Math.floor(sRand(97)*30)) : '',
    ndi: region.includes('Cervical') ? '' + (25 + Math.floor(sRand(98)*35)) : '',
    dash: isShoulder ? '' + (30 + Math.floor(sRand(99)*35)) : '',
    progressSubjective, progressObjective, progressClinicalReasoning, goalStatusData,
    overallProgress: stage==='Early'?'Progressing well toward goals':stage==='Mid'?'Progressing well toward goals':stage==='Late'?'Progressing well toward goals':stage==='Nearing DC'?'Goals met — discharge planning':'Progressing slower than expected',
    updatedPlan: stage === 'Nearing DC' ? 'Transition to independent HEP. Discharge at next visit if patient demonstrates independent management of condition.' : 'Continue current POC at ' + pick(['2x/week','3x/week'],100) + '. Progress therapeutic exercise intensity and complexity. Continue manual therapy as indicated. Update HEP.',
  };
}

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
function NewAppointmentModal({ onClose, onSave, patients }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({patientId:'',date:today,time:'8:00 AM',type:'Follow-up',therapist:'PT'});
  const set = (k,v) => setForm({...form,[k]:v});
  const timeSlots = ['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];
  const types = ['Follow-up','Initial Eval','Re-evaluation','Discharge','Progress Check'];
  const sorted = [...patients].filter(p=>p.status==='Active').sort((a,b)=>a.lastName.localeCompare(b.lastName));
  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'white',borderRadius:8,padding:24,width:480,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:16,borderBottom:'2px solid var(--primary)',paddingBottom:8}}>New Appointment</h3>
        <div style={{display:'grid',gap:12}}>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Patient *</label><select value={form.patientId} onChange={e=>set('patientId',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}><option value="">Select patient...</option>{sorted.map(p=><option key={p.id} value={p.id}>{p.lastName}, {p.firstName} — {p.dx}</option>)}</select></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Date</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}/></div>
            <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Time</label><select value={form.time} onChange={e=>set('time',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}>{timeSlots.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Appointment Type</label><select value={form.type} onChange={e=>set('type',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}>{types.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
            <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Therapist</label><select value={form.therapist} onChange={e=>set('therapist',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}><option value="PT">PT — Dr. Mitchell</option><option value="PTA">PTA — A. Rivera</option></select></div>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{
            if(!form.patientId){alert('Please select a patient.');return;}
            onSave(form);
          }}>Schedule Appointment</button>
        </div>
      </div>
    </div>
  );
}

function SchedulePage({ setCurrentPage, setSelectedPatient, patients, appointments, setAppointments, setNavigationSource, customAppointments, setCustomAppointments }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [scheduleView, setScheduleView] = useState('daily');
  const [showAddAppt, setShowAddAppt] = useState(false);
  const changeDate = (days) => { const d = new Date(selectedDate); d.setDate(d.getDate()+days); setSelectedDate(d); };
  const dateStr = selectedDate.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Generate schedule for selected date using seeded random from date
  const dateSeed = selectedDate.getFullYear()*10000 + (selectedDate.getMonth()+1)*100 + selectedDate.getDate();
  const dayOfWeek = selectedDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const scheduleForDate = useMemo(() => {
    if (isToday) {
      var todayAppts = [...appointments];
      if (customAppointments && customAppointments.length > 0) {
        const dateKey = selectedDate.toISOString().split('T')[0];
        customAppointments.forEach(ca => {
          if (ca.date === dateKey) {
            const pt = patients.find(p => p.id == ca.patientId);
            if (pt) todayAppts.push({time: ca.time, therapist: ca.therapist, patientId: ca.patientId, patient: pt, type: ca.type, status: 'Scheduled'});
          }
        });
      }
      return todayAppts;
    }
    if (isWeekend) return [];
    // Generate deterministic schedule for other weekdays
    const timeSlots = ['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];
    const types = ['Follow-up','Follow-up','Follow-up','Follow-up','Follow-up','Initial Eval','Re-evaluation','Discharge','Follow-up','Follow-up'];
    const statuses = ['Scheduled','Checked In','Completed','Scheduled','Scheduled'];
    const activePatients = patients.filter(p=>p.status==='Active');
    const generated = [];
    timeSlots.forEach((time, i) => {
      const seed1 = ((dateSeed * (i+1) * 9301 + 49297) % 233280);
      const seed2 = ((dateSeed * (i+1) * 7919 + 15485863) % 233280);
      // PT column - ~70% filled
      if (seed1 % 100 < 70 && activePatients.length > 0) {
        const pIdx = seed1 % activePatients.length;
        const p = activePatients[pIdx];
        generated.push({time, therapist:'PT', patientId:p.id, patient:`${p.lastName}, ${p.firstName}`, type:types[seed1 % types.length], status:statuses[seed1 % statuses.length]});
      } else {
        generated.push({time, therapist:'PT', patientId:null, patient:'', type:'', status:''});
      }
      // PTA column - ~40% filled
      if (seed2 % 100 < 40 && activePatients.length > 0) {
        const pIdx = seed2 % activePatients.length;
        const p = activePatients[pIdx];
        generated.push({time, therapist:'PTA', patientId:p.id, patient:`${p.lastName}, ${p.firstName}`, type:'Follow-up', status:statuses[seed2 % statuses.length]});
      } else {
        generated.push({time, therapist:'PTA', patientId:null, patient:'', type:'', status:''});
      }
    });
    
    // Merge custom appointments for this date
    if (customAppointments && customAppointments.length > 0) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      customAppointments.forEach(ca => {
        if (ca.date === dateKey) {
          const pt = patients.find(p => p.id == ca.patientId);
          if (pt) {
            generated.push({time: ca.time, therapist: ca.therapist, patientId: ca.patientId, patient: pt, type: ca.type, status: 'Scheduled'});
          }
        }
      });
    }
    return generated;
  }, [selectedDate, isToday, appointments, patients, isWeekend, customAppointments]);

  const times = [...new Set(scheduleForDate.map(s=>s.time))];
  const filledCount = scheduleForDate.filter(s=>s.patientId).length;

  return (
    <div className="fade-in">
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,alignItems:'center'}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn btn-outline" onClick={()=>changeDate(-1)}>◀</button>
          <h3 style={{minWidth:280,textAlign:'center'}}>{dateStr}</h3>
          <button className="btn btn-outline" onClick={()=>changeDate(1)}>▶</button>
          {!isToday && <button className="btn btn-sm btn-outline" style={{marginLeft:8}} onClick={()=>setSelectedDate(new Date())}>Today</button>}
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{display:'flex',borderRadius:4,overflow:'hidden',marginRight:8}}><button className={scheduleView==='daily'?'btn btn-primary btn-sm':'btn btn-outline btn-sm'} style={{borderRadius:0}} onClick={()=>setScheduleView('daily')}>Daily</button><button className={scheduleView==='weekly'?'btn btn-primary btn-sm':'btn btn-outline btn-sm'} style={{borderRadius:0}} onClick={()=>setScheduleView('weekly')}>Weekly</button></div>
          <span style={{fontSize:12,color:'var(--text-muted)',alignSelf:'center'}}>{isWeekend ? 'Clinic closed' : `${filledCount} appointments`}</span>
          <button className="btn btn-primary" onClick={()=>setShowAddAppt(true)}>+ New Appointment</button>
        </div>
      </div>
      {scheduleView==='daily' && <div>
      {showNewAppt && <NewAppointmentModal patients={patients} onClose={()=>setShowNewAppt(false)} onSave={(form)=>{
        const p = patients.find(pt=>pt.id===parseInt(form.patientId));
        if(p){
          const newAppt = {time:form.time, therapist:form.therapist, patientId:p.id, patient:`${p.lastName}, ${p.firstName}`, type:form.type, status:'Scheduled'};
          if(form.date === new Date().toISOString().split('T')[0]) { setAppointments([...appointments, newAppt]); }
          setCustomAppointments([].concat(customAppointments||[],[{patientId:p.id,date:form.date,time:form.time,therapist:form.therapist,type:form.type}]));
        }
        setShowNewAppt(false);
      }}/>}
      {isWeekend ? (
        <div className="card"><div className="card-body" style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}><h3>Clinic Closed</h3><p>No appointments scheduled on weekends.</p></div></div>
      ) : (
      <div className="card">
        <div className="card-body" style={{padding:0,overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th style={{width:80}}>Time</th><th>PT — Dr. Mitchell</th><th>PTA — A. Rivera</th></tr></thead>
            <tbody>
              {times.map(t => {
                const ptAppt = scheduleForDate.find(s=>s.time===t && s.therapist==='PT');
                const ptaAppt = scheduleForDate.find(s=>s.time===t && s.therapist==='PTA');
                return (
                  <tr key={t}>
                    <td style={{fontWeight:600,background:'#f8fafc'}}>{t}</td>
                    <td>{ptAppt && ptAppt.patientId ? (
                      <div className={`schedule-appt ${ptAppt.type==='Initial Eval'||ptAppt.type==='Re-evaluation'?'eval':ptAppt.type==='Discharge'?'discharge':'followup'}`} onClick={()=>{
                        const p = patients.find(p=>p.id===ptAppt.patientId);
                        if(p){setSelectedPatient(p);if(setNavigationSource)setNavigationSource('schedule');setCurrentPage('chart');}
                      }}>
                        <div className="appt-name">{ptAppt.patient}</div>
                        <div className="appt-type">{ptAppt.type} • {ptAppt.status}</div>
                      </div>
                    ) : <span style={{color:'#ccc',fontSize:12}}>— Open —</span>}</td>
                    <td>{ptaAppt && ptaAppt.patientId ? (
                      <div className={`schedule-appt followup`} onClick={()=>{
                        const p = patients.find(p=>p.id===ptaAppt.patientId);
                        if(p){setSelectedPatient(p);if(setNavigationSource)setNavigationSource('schedule');setCurrentPage('chart');}
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
      )}
          </div>}
      {scheduleView==='weekly' && <WeeklyScheduleView patients={patients} appointments={appointments} selectedDate={selectedDate} setSelectedDate={setSelectedDate} setSelectedPatient={setSelectedPatient} setCurrentPage={setCurrentPage} setNavigationSource={setNavigationSource} customAppointments={customAppointments||[]}/>}
      {showAddAppt && <AddAppointmentModal patients={patients} selectedDate={selectedDate} customAppointments={customAppointments} setCustomAppointments={setCustomAppointments} onClose={()=>setShowAddAppt(false)}/>}
</div>
  );
}

// ==================== PATIENT LIST ====================
function NewPatientModal({ onClose, onSave }) {
  const [form, setForm] = useState({firstName:'',lastName:'',dob:'',gender:'Male',phone:'',email:'',address:'',
    referringDoc:'',referralDate:new Date().toISOString().split('T')[0],dxCode:'M79.604',dx:'Pain in right leg',
    bodyRegion:'Right LE',insurance:'Anthem',authVisits:21,precautions:[]});
  const set = (k,v) => setForm({...form,[k]:v});
  const regions = ['Right LE','Left LE','Bilateral LE','Right Shoulder','Left Shoulder','Lumbar Spine','Cervical Spine','Right Knee','Left Knee','Right Hip','Left Hip','Right Ankle','Left Ankle','Gait/Balance','Generalized','Neurological'];
  const insurances = ['Anthem','UnitedHealthcare','Aetna','Cigna','Humana','Blue Cross Blue Shield','Medicare','Medicaid','Kaiser Permanente','Molina Healthcare','Tricare','Workers Comp'];
  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'white',borderRadius:8,padding:24,width:680,maxHeight:'85vh',overflow:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:16,borderBottom:'2px solid var(--primary)',paddingBottom:8}}>New Patient Registration</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>First Name *</label><input value={form.firstName} onChange={e=>set('firstName',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}} placeholder="First name"/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Last Name *</label><input value={form.lastName} onChange={e=>set('lastName',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}} placeholder="Last name"/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Date of Birth *</label><input type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Gender</label><select value={form.gender} onChange={e=>set('gender',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}><option>Male</option><option>Female</option></select></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Phone</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}} placeholder="(555) 000-0000"/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Email</label><input value={form.email} onChange={e=>set('email',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}} placeholder="email@example.com"/></div>
          <div style={{gridColumn:'1/3'}}><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Address</label><input value={form.address} onChange={e=>set('address',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}} placeholder="Street, City, State ZIP"/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Referring Physician</label><input value={form.referringDoc} onChange={e=>set('referringDoc',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}} placeholder="Dr. Name"/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Referral Date</label><input type="date" value={form.referralDate} onChange={e=>set('referralDate',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}/></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>ICD-10 Dx Code</label><select value={form.dxCode} onChange={e=>{const c=ICD10_CODES.find(c=>c.code===e.target.value);set('dxCode',e.target.value);if(c)set('dx',c.desc);}} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}>{ICD10_CODES.map(c=><option key={c.code} value={c.code}>{c.code} - {c.desc}</option>)}</select></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Body Region</label><select value={form.bodyRegion} onChange={e=>set('bodyRegion',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Insurance</label><select value={form.insurance} onChange={e=>set('insurance',e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}>{insurances.map(i=><option key={i} value={i}>{i}</option>)}</select></div>
          <div><label style={{fontSize:11,fontWeight:600,textTransform:'uppercase',color:'var(--text-muted)'}}>Authorized Visits</label><input type="number" value={form.authVisits} onChange={e=>set('authVisits',parseInt(e.target.value)||0)} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:4}}/></div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20}}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=>{
            if(!form.firstName||!form.lastName||!form.dob){alert('Please fill in First Name, Last Name, and Date of Birth.');return;}
            onSave(form);
          }}>Register Patient</button>
        </div>
      </div>
    </div>
  );
}

function PatientList({ patients, setPatients, setSelectedPatient, setCurrentPage, setNavigationSource }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [bodyRegionFilter, setBodyRegionFilter] = useState('All');
  const [insuranceFilter, setInsuranceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [showNewPatient, setShowNewPatient] = useState(false);
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
          <button className="btn btn-primary" onClick={()=>setShowNewPatient(true)}>+ New Patient</button>
        </div>
      </div>
      {showNewPatient && <NewPatientModal onClose={()=>setShowNewPatient(false)} onSave={(form)=>{
        const newId = Math.max(...patients.map(p=>p.id)) + 1;
        const dobDate = new Date(form.dob);
        const age = Math.floor((Date.now() - dobDate.getTime()) / (365.25*24*60*60*1000));
        const newPatient = {
          id: newId, firstName: form.firstName, lastName: form.lastName, dob: form.dob, age: age,
          gender: form.gender, phone: form.phone, email: form.email, address: form.address,
          referringDoc: form.referringDoc || 'Dr. Pending', referralDate: form.referralDate,
          dxCode: form.dxCode, dx: form.dx, bodyRegion: form.bodyRegion,
          insurance: form.insurance, authVisits: form.authVisits, usedVisits: 0,
          initialPain: 7, currentPain: 7, status: 'Active', careStage: 'New Eval',
          precautions: [], alerts: [], medHistory: [], medications: []
        };
        setPatients([...patients, newPatient]);
        setShowNewPatient(false);
        setSelectedPatient(newPatient);
        setCurrentPage('chart');
      }}/>}
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
                <tr key={p.id} onClick={()=>{setSelectedPatient(p);if(setNavigationSource)setNavigationSource('patients');setCurrentPage('chart');}}>
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
function PatientChart({ patient, user, setCurrentPage, patients, setPatients, setSelectedPatient, navigationSource, sentMessages, setSentMessages }) {
  const [chartTab, setChartTab] = useState('demographics');
  const handleSaveDraft = (noteEntry) => {
    if (patients && setPatients) {
      const updated = patients.map(p => {
        if (p.id === patient.id) {
          var eh = p.noteHistory || [];
          var ei = eh.findIndex(n => n.type === noteEntry.type && n.date === noteEntry.date && n.status === 'Draft');
          if (ei >= 0) { var nh = [...eh]; nh[ei] = noteEntry; return {...p, noteHistory: nh}; }
          return {...p, noteHistory: [...eh, noteEntry]};
        }
        return p;
      });
      setPatients(updated);
      if (setSelectedPatient) { var up = updated.find(function(p) { return p.id === patient.id; }); if (up) setSelectedPatient(up); }
    }
  };
  const chartTabs = [
    { id:'demographics', label:'Demographics' },
    { id:'insurance', label:'Insurance/Auth' },
    { id:'history', label:'Medical History' },
    { id:'evalNote', label:'Initial Evaluation' },
    { id:'dailyNote', label:'Daily SOAP Note' },
    { id:'progressNote', label:'Progress Note' },
    { id:'exercises', label:'Exercise Rx' },
    { id:'documents', label:'Documents' },
    { id:'sendMessage', label:'Send Message' },
  ];
  return (
    <div className="fade-in">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-outline" onClick={()=>setCurrentPage(navigationSource||'patients')}>{navigationSource==='schedule'?'\u2190 Back to Schedule':'\u2190 Back to Patient List'}</button>
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
          {chartTab==='evalNote' && <InitialEvalNote patient={patient} user={user} onSaveDraft={handleSaveDraft} />}
          {chartTab==='dailyNote' && <DailySOAPNote patient={patient} user={user} onSaveDraft={handleSaveDraft} />}
          {chartTab==='progressNote' && <ProgressNote patient={patient} user={user} onSaveDraft={handleSaveDraft} />}
          {chartTab==='exercises' && <ExerciseRx patient={patient} patients={patients} setPatients={setPatients} setSelectedPatient={setSelectedPatient} />}
          {chartTab==='documents' && <DocumentsTab patient={patient} />}
          {chartTab==='sendMessage' && <SendMessageFromChart patient={patient} user={user} patients={patients} setPatients={setPatients} setSelectedPatient={setSelectedPatient} sentMessages={sentMessages} setSentMessages={setSentMessages}/>}
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
function InitialEvalNote({ patient, user, onSaveDraft }) {
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
  const MMT_GROUPS = ['Shoulder Flexors','Shoulder Abductors','Elbow Flexors','Elbow Extensors','Wrist Extensors','Hip Flexors','Hip Extensors','Hip Abductors','Knee Extensors','Knee Flexors','Ankle DF','Ankle PF'];
  const cd = useMemo(() => generateClinicalData(patient), [patient.id]);

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
        <div className="form-group"><label>Chief Complaint</label><textarea defaultValue={cd.chiefComplaint} /></div>
        <div className="form-group"><label>History of Present Illness</label><textarea rows={4} defaultValue={cd.hpi} /></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Pain Level (0-10)</label><select defaultValue={patient.initialPain}><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i} value={i}>{i}/10</option>)}</select></div>
          <div className="form-group"><label>Pain Location</label><input defaultValue={patient.bodyRegion}/></div>
          <div className="form-group"><label>Pain Quality</label><select defaultValue={cd.painQuality}><option value="">Select</option><option>Sharp</option><option>Dull/Aching</option><option>Burning</option><option>Throbbing</option><option>Stabbing</option><option>Radiating</option></select></div>
        </div>
        <div className="form-group"><label>Prior Level of Function</label><textarea defaultValue={cd.plof} /></div>
        <div className="form-group"><label>Patient Goals</label><textarea defaultValue={cd.patientGoals} /></div>
      </div></div>

      <div className="card"><div className="card-header">Objective — Physical Examination</div><div className="card-body">
        <h4 style={{marginBottom:8}}>Range of Motion (degrees)</h4>
        <div style={{overflowX:'auto',marginBottom:16}}>
          <table className="assessment-table">
            <thead><tr><th>Joint Motion</th><th>Active R</th><th>Active L</th><th>Passive R</th><th>Passive L</th><th>WNL</th></tr></thead>
            <tbody>{ROM_JOINTS.map(j=>{const r=cd.romData[j]||{};return(<tr key={j}><td style={{textAlign:'left',fontWeight:500}}>{j}</td><td><input defaultValue={r.aR} disabled={isLocked}/></td><td><input defaultValue={r.aL} disabled={isLocked}/></td><td><input defaultValue={r.pR} disabled={isLocked}/></td><td><input defaultValue={r.pL} disabled={isLocked}/></td><td><input type="checkbox" defaultChecked={r.wnl} disabled={isLocked}/></td></tr>);})}</tbody>
          </table>
        </div>
        <h4 style={{marginBottom:8}}>Manual Muscle Testing</h4>
        <div style={{overflowX:'auto',marginBottom:16}}>
          <table className="assessment-table">
            <thead><tr><th>Muscle Group</th><th>Right</th><th>Left</th><th>Notes</th></tr></thead>
            <tbody>{MMT_GROUPS.map(m=>{const d=cd.mmtData[m]||{};return(<tr key={m}><td style={{textAlign:'left',fontWeight:500}}>{m}</td><td><select defaultValue={d.R||''} disabled={isLocked} style={{width:60}}><option></option><option>5/5</option><option>4+/5</option><option>4/5</option><option>4-/5</option><option>3+/5</option><option>3/5</option><option>3-/5</option><option>2+/5</option><option>2/5</option><option>2-/5</option><option>1/5</option><option>0/5</option></select></td><td><select defaultValue={d.L||''} disabled={isLocked} style={{width:60}}><option></option><option>5/5</option><option>4+/5</option><option>4/5</option><option>4-/5</option><option>3+/5</option><option>3/5</option><option>3-/5</option><option>2+/5</option><option>2/5</option><option>2-/5</option><option>1/5</option><option>0/5</option></select></td><td><input defaultValue={d.notes||''} disabled={isLocked} style={{width:120}}/></td></tr>);})}</tbody>
          </table>
        </div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Special Tests</label><textarea rows={3} defaultValue={cd.specialTests} disabled={isLocked}/></div>
          <div className="form-group"><label>Posture/Alignment</label><textarea rows={3} defaultValue={cd.posture} disabled={isLocked}/></div>
        </div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Palpation Findings</label><textarea rows={3} defaultValue={cd.palpation} disabled={isLocked}/></div>
          <div className="form-group"><label>Gait Analysis</label><textarea rows={3} defaultValue={cd.gait} disabled={isLocked}/></div>
        </div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Balance Assessment</label><textarea rows={2} defaultValue={cd.balance} disabled={isLocked}/></div>
          <div className="form-group"><label>Functional Mobility</label><textarea rows={2} defaultValue={cd.funcMobility} disabled={isLocked}/></div>
        </div>
        <h4 style={{margin:'12px 0 8px'}}>Outcome Measures</h4>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr'}}>
          <div className="form-group"><label>Oswestry (ODI) %</label><input type="number" defaultValue={patient.initialODI} disabled={isLocked}/></div>
          <div className="form-group"><label>LEFS Score</label><input type="number" defaultValue={cd.lefs} placeholder="0-80" disabled={isLocked}/></div>
          <div className="form-group"><label>NDI %</label><input type="number" defaultValue={cd.ndi} placeholder="0-100" disabled={isLocked}/></div>
          <div className="form-group"><label>DASH Score</label><input type="number" defaultValue={cd.dash} placeholder="0-100" disabled={isLocked}/></div>
        </div>
      </div></div>

      <div className="card"><div className="card-header">Assessment</div><div className="card-body">
        <div className="form-group"><label>Clinical Assessment</label><textarea rows={4} defaultValue={cd.assessment} disabled={isLocked}/></div>
        <div className="form-group"><label>PT Diagnosis</label><input defaultValue={cd.ptDiagnosis} disabled={isLocked}/></div>
        <div className="form-group"><label>Problem List</label><textarea rows={3} defaultValue={cd.problemList} disabled={isLocked}/></div>
      </div></div>

      <div className="card"><div className="card-header">Plan of Care / Goals</div><div className="card-body">
        <h4 style={{marginBottom:8}}>Short-Term Goals (2-4 weeks)</h4>
        {[0,1,2].map(i=><div key={i} className="form-group"><label>STG {i+1}</label><input defaultValue={cd.stg[i]||''} disabled={isLocked}/></div>)}
        <h4 style={{margin:'12px 0 8px'}}>Long-Term Goals (8-12 weeks)</h4>
        {[0,1].map(i=><div key={i} className="form-group"><label>LTG {i+1}</label><input defaultValue={cd.ltg[i]||''} disabled={isLocked}/></div>)}
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Frequency</label><select disabled={isLocked}><option>2x/week</option><option>3x/week</option><option>1x/week</option><option>Daily</option></select></div>
          <div className="form-group"><label>Duration</label><select disabled={isLocked}><option>4 weeks</option><option>6 weeks</option><option>8 weeks</option><option>12 weeks</option></select></div>
          <div className="form-group"><label>Precautions</label><input defaultValue={patient.alerts.join(', ')} disabled={isLocked}/></div>
        </div>
      </div></div>
      </fieldset>

      
      <div style={{textAlign:'center',marginBottom:10}}><button className="btn btn-warning" onClick={()=>{if(onSaveDraft)onSaveDraft({type:'Initial Evaluation',date:new Date().toISOString().split('T')[0],author:user.displayName,status:'Draft'});alert('Draft saved to Documents');}}>Save Draft</button></div>
      <NoteSignatureArea noteStatus={noteStatus} signedBy={signedBy} cosignNeeded={cosignNeeded} lockedAt={lockedAt} user={user}
        canSign={user.role==='PT'||user.role==='PTA'} canCosign={user.role==='PT'} canLock={user.role==='PT'}
        onSign={handleSign} onCosign={handleCosign} onLock={handleLock} onUnlock={handleUnlock} />
    </div>
  );
}

// ==================== DAILY SOAP NOTE ====================
function DailySOAPNote({ patient, user, onSaveDraft }) {
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

      
      <div style={{textAlign:'center',marginBottom:10}}><button className="btn btn-warning" onClick={()=>{if(onSaveDraft)onSaveDraft({type:'Daily SOAP Note',date:new Date().toISOString().split('T')[0],author:user.displayName,status:'Draft'});alert('Draft saved to Documents');}}>Save Draft</button></div>
      <NoteSignatureArea noteStatus={noteStatus} signedBy={signedBy} cosignNeeded={cosignNeeded} lockedAt={lockedAt} user={user}
        canSign={true} canCosign={user.role==='PT'} canLock={user.role==='PT'}
        onSign={handleSign} onCosign={handleCosign} onLock={handleLock} onUnlock={handleUnlock} />
    </div>
  );
}

// ==================== PROGRESS NOTE ====================
function ProgressNote({ patient, user, onSaveDraft }) {
  const [noteStatus, setNoteStatus] = useState('draft');
  const [signedBy, setSignedBy] = useState(null);
  const [cosignNeeded, setCosignNeeded] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const isLocked = noteStatus === 'locked';
  const cd = useMemo(() => generateClinicalData(patient), [patient.id]);

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
        <div className="form-group"><label>Patient Report / Functional Changes</label><textarea rows={3} defaultValue={cd.progressSubjective} disabled={isLocked}/></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr'}}>
          <div className="form-group"><label>Current Pain Level</label><select defaultValue={patient.currentPain+'/10'} disabled={isLocked}><option value="">Select</option>{[...Array(11)].map((_,i)=><option key={i}>{i}/10</option>)}</select></div>
          <div className="form-group"><label>Initial Pain Level</label><input readOnly value={`${patient.initialPain}/10`} style={{background:'#f1f5f9'}}/></div>
        </div>
      </div></div>

      <div className="card"><div className="card-header">Objective Re-assessment</div><div className="card-body">
        <div className="form-group"><label>Key Objective Measures (Current vs Initial)</label><textarea rows={4} defaultValue={cd.progressObjective} disabled={isLocked}/></div>
        <h4 style={{margin:'8px 0'}}>Outcome Measures Comparison</h4>
        <table className="assessment-table">
          <thead><tr><th>Measure</th><th>Initial</th><th>Current</th><th>Change</th><th>MCID Met?</th></tr></thead>
          <tbody>
            {[['ODI (%)',patient.initialODI,patient.currentODI],['LEFS',cd.lefs,cd.lefs?Math.min(parseInt(cd.lefs)+12,80):''],['NDI (%)',cd.ndi,cd.ndi?Math.max(parseInt(cd.ndi)-10,5):''],['DASH',cd.dash,cd.dash?Math.max(parseInt(cd.dash)-12,8):'']].map(([m,init,curr],i)=>(
              <tr key={i}><td style={{textAlign:'left'}}>{m}</td><td><input defaultValue={init} style={{width:60}} disabled={isLocked}/></td><td><input defaultValue={curr} style={{width:60}} disabled={isLocked}/></td><td><input defaultValue={init&&curr?Math.abs(init-curr):''} style={{width:60}} disabled={isLocked}/></td><td><select defaultValue={init&&curr&&Math.abs(init-curr)>=6?'Yes':''} disabled={isLocked} style={{width:60}}><option></option><option>Yes</option><option>No</option></select></td></tr>
            ))}
          </tbody>
        </table>
      </div></div>

      <div className="card"><div className="card-header">Goal Status Review</div><div className="card-body">
        <table className="data-table">
          <thead><tr><th>Goal</th><th>Status</th><th>Notes</th></tr></thead>
          <tbody>{['STG 1','STG 2','STG 3','LTG 1','LTG 2'].map(g=>{const gs=cd.goalStatusData[g]||{};return(<tr key={g}><td style={{fontWeight:600}}>{g}</td><td><select defaultValue={gs.status||'In Progress'} disabled={isLocked}><option>In Progress</option><option>Met</option><option>Partially Met</option><option>Not Met</option><option>Revised</option><option>Discontinued</option></select></td><td><input defaultValue={gs.notes||''} disabled={isLocked}/></td></tr>);})}</tbody>
        </table>
      </div></div>

      <div className="card"><div className="card-header">Assessment & Updated Plan</div><div className="card-body">
        <div className="form-group"><label>Overall Progress</label><select defaultValue={cd.overallProgress} disabled={isLocked}><option value="">Select</option><option>Progressing well toward goals</option><option>Progressing slower than expected</option><option>Plateau — requires plan modification</option><option>Regressed — reassess plan of care</option><option>Goals met — discharge planning</option></select></div>
        <div className="form-group"><label>Clinical Reasoning</label><textarea rows={3} defaultValue={cd.progressClinicalReasoning} disabled={isLocked}/></div>
        <div className="form-group"><label>Updated Plan of Care</label><textarea rows={3} defaultValue={cd.updatedPlan} disabled={isLocked}/></div>
        <div className="form-row" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          <div className="form-group"><label>Frequency</label><select disabled={isLocked}><option>2x/week</option><option>3x/week</option><option>1x/week</option></select></div>
          <div className="form-group"><label>Duration</label><select disabled={isLocked}><option>4 weeks</option><option>6 weeks</option><option>8 weeks</option></select></div>
          <div className="form-group"><label>Additional Visits Requested</label><input type="number" defaultValue={patient.authVisits - patient.usedVisits < 5 ? '8' : ''} disabled={isLocked}/></div>
        </div>
      </div></div>
      </fieldset>

      
      <div style={{textAlign:'center',marginBottom:10}}><button className="btn btn-warning" onClick={()=>{if(onSaveDraft)onSaveDraft({type:'Progress Note',date:new Date().toISOString().split('T')[0],author:user.displayName,status:'Draft'});alert('Draft saved to Documents');}}>Save Draft</button></div>
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
function ExerciseRx({ patient, patients, setPatients, setSelectedPatient }) {
  const [exercises, setExercises] = useState(patient.exercises || []);
  const [editingIdx, setEditingIdx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEx, setNewEx] = useState({name:'',sets:'3',reps:'10',hold:'',frequency:'Daily',notes:''});
  const COMMON_EXERCISES = ['Quad Sets','Ankle Pumps','Heel Slides','Straight Leg Raises','Hamstring Stretch','Calf Stretch','Hip Abduction','Bridges','Wall Squats','Standing Balance','Prone Press-ups','Cervical Retraction','Scapular Squeezes','Wrist Flexor Stretch','Piriformis Stretch'];

  const saveExercises = (updated) => {
    setExercises(updated);
    if (patients && setPatients) {
      const newPatients = patients.map(p => p.id === patient.id ? {...p, exercises: updated} : p);
      setPatients(newPatients);
      if (setSelectedPatient) { var up = newPatients.find(p => p.id === patient.id); if (up) setSelectedPatient(up); }
    }
  };

  const handleAdd = () => {
    if (!newEx.name) { alert('Please enter an exercise name'); return; }
    saveExercises([...exercises, {...newEx}]);
    setNewEx({name:'',sets:'3',reps:'10',hold:'',frequency:'Daily',notes:''});
    setShowAdd(false);
  };

  const handleDelete = (idx) => {
    if (confirm('Remove this exercise?')) { saveExercises(exercises.filter((_,i) => i !== idx)); }
  };

  const handleEditSave = (idx, field, value) => {
    var updated = exercises.map((e,i) => i === idx ? {...e, [field]: value} : e);
    saveExercises(updated);
  };

  return (
    <div>
      <h4 style={{marginBottom:12}}>Home Exercise Program - {patient.lastName}, {patient.firstName}</h4>
      <div className="alert alert-info">Body Region: {patient.bodyRegion} | Care Stage: {patient.careStage} | {exercises.length} exercises prescribed</div>
      {exercises.length > 0 ? (
        <table className="data-table">
          <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Hold</th><th>Frequency</th><th>Notes</th><th>Actions</th></tr></thead>
          <tbody>
            {exercises.map((e,i)=>(
              <tr key={i}>
                {editingIdx === i ? (
                  <>
                    <td><input type="text" value={e.name} onChange={(ev)=>handleEditSave(i,'name',ev.target.value)} style={{width:'100%',padding:4}} /></td>
                    <td><input type="text" value={e.sets} onChange={(ev)=>handleEditSave(i,'sets',ev.target.value)} style={{width:50,padding:4}} /></td>
                    <td><input type="text" value={e.reps} onChange={(ev)=>handleEditSave(i,'reps',ev.target.value)} style={{width:50,padding:4}} /></td>
                    <td><input type="text" value={e.hold} onChange={(ev)=>handleEditSave(i,'hold',ev.target.value)} style={{width:60,padding:4}} /></td>
                    <td><input type="text" value={e.frequency||''} onChange={(ev)=>handleEditSave(i,'frequency',ev.target.value)} style={{width:80,padding:4}} /></td>
                    <td><input type="text" value={e.notes} onChange={(ev)=>handleEditSave(i,'notes',ev.target.value)} style={{width:'100%',padding:4}} /></td>
                    <td><button className="btn btn-sm btn-primary" onClick={()=>setEditingIdx(null)}>Done</button> <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(i)}>X</button></td>
                  </>
                ) : (
                  <>
                    <td style={{fontWeight:600}}>{e.name}</td><td>{e.sets}</td><td>{e.reps}</td><td>{e.hold}</td><td>{e.frequency||'-'}</td><td>{e.notes}</td>
                    <td><button className="btn btn-sm btn-outline" onClick={()=>setEditingIdx(i)}>Edit</button> <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(i)}>X</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p style={{color:'var(--text-muted)'}}>No exercises prescribed yet</p>}

      {showAdd && (
        <div className="card" style={{padding:16,marginTop:12,marginBottom:12,border:'2px solid var(--primary)'}}>
          <h5 style={{marginBottom:12}}>Add New Exercise</h5>
          <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 100px',gap:8,marginBottom:8}}>
            <div>
              <label style={{fontSize:12,fontWeight:600}}>Exercise Name</label>
              <select value={newEx.name} onChange={(ev)=>setNewEx({...newEx,name:ev.target.value})} style={{width:'100%',padding:6}}>
                <option value="">-- Select or type below --</option>
                {COMMON_EXERCISES.map(ex=>(<option key={ex} value={ex}>{ex}</option>))}
              </select>
              <input type="text" placeholder="Or type custom exercise" value={newEx.name} onChange={(ev)=>setNewEx({...newEx,name:ev.target.value})} style={{width:'100%',padding:6,marginTop:4}} />
            </div>
            <div><label style={{fontSize:12,fontWeight:600}}>Sets</label><input type="text" value={newEx.sets} onChange={(ev)=>setNewEx({...newEx,sets:ev.target.value})} style={{width:'100%',padding:6}} /></div>
            <div><label style={{fontSize:12,fontWeight:600}}>Reps</label><input type="text" value={newEx.reps} onChange={(ev)=>setNewEx({...newEx,reps:ev.target.value})} style={{width:'100%',padding:6}} /></div>
            <div><label style={{fontSize:12,fontWeight:600}}>Hold</label><input type="text" value={newEx.hold} onChange={(ev)=>setNewEx({...newEx,hold:ev.target.value})} placeholder="e.g. 10s" style={{width:'100%',padding:6}} /></div>
            <div><label style={{fontSize:12,fontWeight:600}}>Frequency</label><input type="text" value={newEx.frequency} onChange={(ev)=>setNewEx({...newEx,frequency:ev.target.value})} style={{width:'100%',padding:6}} /></div>
          </div>
          <div style={{marginBottom:8}}>
            <label style={{fontSize:12,fontWeight:600}}>Notes/Instructions</label>
            <input type="text" value={newEx.notes} onChange={(ev)=>setNewEx({...newEx,notes:ev.target.value})} placeholder="Special instructions..." style={{width:'100%',padding:6}} />
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-primary" onClick={handleAdd}>Add Exercise</button>
            <button className="btn btn-outline" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{marginTop:12,display:'flex',gap:8}}>
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Exercise</button>
        <button className="btn btn-outline">Print HEP</button>
      </div>
    </div>
  );
}


// ==================== DOCUMENTS TAB ====================
function generateNoteContent(note, patient) {
  const p = patient;
  const safeJoin = (v, sep) => Array.isArray(v) ? v.join(sep) : (typeof v === 'string' ? v : '');
  const safeStr = (v) => (v === null || v === undefined) ? 'N/A' : (typeof v === 'object' ? JSON.stringify(v) : String(v));

  const dateNum = note.date ? note.date.split('-').join('') : '20260301';
  const seed = parseInt(dateNum) % 100;
  const pick = (arr) => arr[seed % arr.length];

  const header = [
    '========================================================================',
    '                    REHABFLOW OUTPATIENT EMR',
    '                    Physical Therapy Clinic',
    '========================================================================',
    '',
    'PATIENT: ' + p.firstName + ' ' + p.lastName + '    DOB: ' + (p.dob || 'N/A') + '    Age: ' + (p.age || 'N/A'),
    'Gender: ' + (p.gender || 'N/A') + '    Phone: ' + (p.phone || 'N/A') + '    Email: ' + (p.email || 'N/A'),
    'Address: ' + (p.address || 'N/A'),
    'Insurance: ' + (p.insurance || 'N/A') + '    Member ID: ' + (p.memberId || 'N/A') + '    Group: ' + (p.groupNum || 'N/A'),
    'Referring MD: ' + (p.referringMD || 'N/A') + '    Referral Date: ' + (p.referralDate || 'N/A'),
    'Authorization #: ' + (p.authNum || 'N/A') + '    Auth Visits: ' + (p.authVisits || 'N/A') + '    Used: ' + (p.usedVisits || 'N/A'),
    '',
    'Note Type: ' + (note.type || 'Clinical Note'),
    'Date of Service: ' + (note.date || 'N/A'),
    'Author: ' + (note.author || 'N/A'),
    'Status: ' + (note.status || 'Draft'),
    '------------------------------------------------------------------------'
  ].join('\n');

  const noteType = (note.type || '').toLowerCase();
  const exerciseList = Array.isArray(p.exercises) ? p.exercises : (typeof p.exercises === 'string' ? p.exercises.split(',').map(e => e.trim()) : []);

  if (noteType.includes('initial eval') || noteType.includes('evaluation')) {
    return header + '\n\n' + [
      'PHYSICAL THERAPY INITIAL EVALUATION',
      '========================================================================',
      '',
      'REFERRAL INFORMATION:',
      '  Referring Physician: ' + (p.referringMD || 'N/A'),
      '  Referral Date: ' + (p.referralDate || 'N/A'),
      '  Diagnosis: ' + (p.dx || 'N/A'),
      '  ICD-10: ' + (p.dxCode || 'N/A'),
      '  Body Region: ' + (p.bodyRegion || 'N/A'),
      '  Complexity: ' + (p.complexity || 'N/A'),
      '',
      'INSURANCE/AUTHORIZATION:',
      '  Insurance: ' + (p.insurance || 'N/A'),
      '  Member ID: ' + (p.memberId || 'N/A') + '    Group #: ' + (p.groupNum || 'N/A'),
      '  Authorization #: ' + (p.authNum || 'N/A'),
      '  Authorized Visits: ' + (p.authVisits || 'N/A') + '    Used: ' + (p.usedVisits || 0),
      '',
      'SUBJECTIVE:',
      '  Chief Complaint: Patient presents with ' + (p.bodyRegion || 'musculoskeletal') + ' pain/dysfunction.',
      '  Onset: ' + pick(['Gradual onset over past ' + pick(['2','4','6','8']) + ' weeks','Acute onset following ' + pick(['injury','fall','surgery','repetitive strain']),'Insidious onset with progressive worsening']),
      '  Pain Level: ' + (p.initialPain || 'N/A') + '/10 at initial visit',
      '  Aggravating Factors: ' + pick(['Prolonged sitting, standing, bending','Weight bearing activities, stairs','Overhead reaching, lifting','Walking, running, squatting']),
      '  Easing Factors: ' + pick(['Rest, ice, medication','Position change, gentle stretching','Heat, support brace','Activity modification']),
      '  Patient Goals: ' + pick(['"I want to get back to my normal activities without pain."','"I want to be able to exercise again."','"I need to be able to work without pain."','"I want to avoid surgery if possible."']),
      '',
      'PAST MEDICAL HISTORY:',
      '  ' + safeStr(p.pmh),
      '',
      'SURGICAL HISTORY:',
      '  ' + safeStr(p.surgicalHistory),
      '',
      'SOCIAL HISTORY:',
      '  ' + safeStr(p.socialHistory),
      '',
      'CURRENT MEDICATIONS:',
      '  ' + safeStr(p.meds),
      '',
      'OBJECTIVE:',
      '',
      '  OBSERVATION/POSTURE:',
      '    ' + pick(['Mild forward head posture noted, rounded shoulders bilaterally','Slight lateral shift noted, antalgic posture','Mild kyphosis, decreased lumbar lordosis','Guarded posture with weight shift to ' + pick(['left','right']) + ' side']),
      '',
      '  RANGE OF MOTION (' + (p.bodyRegion || 'affected region') + '):',
      '    Flexion: ' + pick(['WFL','75% of normal','50% of normal','Limited by pain at end range']),
      '    Extension: ' + pick(['WFL','80% of normal','60% of normal','Limited by pain']),
      '    Lateral Flexion/Rotation: ' + pick(['WFL bilaterally','Decreased ' + pick(['25%','30%','40%']) + ' bilaterally','Asymmetric - limited to ' + pick(['left','right'])]),
      '',
      '  STRENGTH (MMT):',
      '    ' + pick([
        'Flexors: 4/5  |  Extensors: 3+/5  |  Rotators: 4-/5',
        'Flexors: 3+/5  |  Extensors: 3/5  |  Abductors: 4-/5',
        'Quadriceps: 4/5  |  Hamstrings: 3+/5  |  Hip abductors: 4-/5',
        'Shoulder flexion: 4-/5  |  Abduction: 3+/5  |  External rotation: 3+/5'
      ]),
      '',
      '  SPECIAL TESTS:',
      '    ' + pick([
        'SLR: Positive at ' + pick(['40','50','60']) + ' degrees ' + pick(['bilaterally','on the right','on the left']),
        'Neer\'s: ' + pick(['Positive','Negative']) + '  |  Hawkins-Kennedy: ' + pick(['Positive','Negative']) + '  |  Empty Can: ' + pick(['Positive','Negative']),
        'Lachman\'s: ' + pick(['Positive','Negative']) + '  |  McMurray\'s: ' + pick(['Positive','Negative']) + '  |  Pivot Shift: ' + pick(['Positive','Negative']),
        'FABER: ' + pick(['Positive bilaterally','Positive on involved side','Negative']) + '  |  Thomas Test: ' + pick(['Positive','Negative'])
      ]),
      '',
      '  PALPATION:',
      '    ' + pick(['Tenderness to palpation over ' + (p.bodyRegion || 'affected region') + ' musculature','Increased muscle tone and trigger points noted in paraspinals','Point tenderness over ' + pick(['lateral epicondyle','greater trochanter','supraspinatus tendon','medial joint line']),'Guarding and spasm noted with palpation']),
      '',
      '  FUNCTIONAL ASSESSMENT:',
      '    Oswestry Disability Index (ODI): ' + (p.initialODI || 'N/A') + '%',
      '    Pain Level: ' + (p.initialPain || 'N/A') + '/10 (NPRS)',
      '    Functional Limitations: ' + pick(['Difficulty with prolonged sitting >20 min, lifting >10 lbs','Unable to perform overhead activities, difficulty sleeping on affected side','Limited walking tolerance to ' + pick(['1','2','3']) + ' blocks, difficulty with stairs','Difficulty with ADLs including dressing, bathing, household tasks']),
      '',
      'ASSESSMENT:',
      '  ' + p.firstName + ' ' + p.lastName + ' is a ' + (p.age || '') + ' y/o ' + (p.gender || '') + ' presenting with',
      '  ' + (p.dx || 'musculoskeletal dysfunction') + ' affecting the ' + (p.bodyRegion || 'involved region') + '.',
      '  Patient demonstrates impairments in ROM, strength, flexibility, and functional',
      '  mobility. ' + pick(['Good','Fair','Excellent']) + ' rehabilitation potential based on ' + pick([
        'motivation, age, and overall health status.',
        'willingness to participate and comply with HEP.',
        'prior functional level and patient goals.'
      ]),
      '',
      '  Skilled PT services are medically necessary to address:',
      '    - Pain management and modalities',
      '    - ROM and flexibility deficits',
      '    - Strength and neuromuscular control',
      '    - Functional mobility and return to activities',
      '    - Patient education and home exercise program',
      '',
      'PLAN OF CARE:',
      '  Frequency: ' + pick(['2x/week','3x/week','2-3x/week']) + ' for ' + pick(['4 weeks','6 weeks','8 weeks']),
      '  Short-Term Goals (2-3 weeks):',
      '    1. Reduce pain to ' + Math.max(1, (p.initialPain || 5) - 3) + '/10 with activity',
      '    2. Improve ROM to ' + pick(['75%','80%','85%']) + ' of normal',
      '    3. Improve strength to ' + pick(['4/5','4+/5']) + ' in key muscle groups',
      '  Long-Term Goals (6-8 weeks):',
      '    1. Pain ' + pick(['0-1','1-2','0-2']) + '/10 with all activities',
      '    2. Full functional ROM',
      '    3. Return to ' + pick(['full work duties','recreational activities','exercise program','sport activities']) + ' without limitation',
      '    4. Independent with comprehensive HEP',
      '    5. ODI score < ' + pick(['10','15','20']) + '%',
      '',
      '========================================================================',
      'Electronically signed by: ' + (note.author || 'N/A'),
      'Date/Time: ' + (note.date || 'N/A') + ' ' + pick(['08:30','09:15','10:00','10:45','11:30','14:00','14:30','15:15']),
      '========================================================================'
    ].join('\n');
  }

  if (noteType.includes('soap') || noteType.includes('treatment') || noteType.includes('daily')) {
    const txMinutes = 30 + (seed % 4) * 5;
    const visitNum = p.usedVisits || (seed % 12 + 1);

    return header + '\n\n' + [
      'PHYSICAL THERAPY DAILY SOAP NOTE',
      '========================================================================',
      '',
      'Visit #' + visitNum + ' of ' + (p.authVisits || 'N/A') + ' authorized',
      'Body Region: ' + (p.bodyRegion || 'N/A') + '    Diagnosis: ' + (p.dx || 'N/A'),
      '',
      'SUBJECTIVE:',
      '  Patient reports current pain level: ' + (p.currentPain || pick(['3','4','5','6'])) + '/10.',
      '  ' + pick([
        'States "I feel like I\'m making progress since last visit."',
        'Reports pain is ' + pick(['somewhat better','about the same','slightly worse after doing yard work']) + ' since last session.',
        'States compliance with HEP ' + pick(['daily','most days','3-4x this week']) + '.',
        'Reports ' + pick(['improved sleep','less morning stiffness','better tolerance with sitting','improved ability to walk']) + ' since last visit.',
        'Endorses ' + pick(['mild soreness after exercises that resolves within 24 hours','occasional pain with ' + pick(['lifting','bending','overhead reaching']),'gradual improvement in overall function']) + '.'
      ]),
      '',
      'OBJECTIVE:',
      '  Total Treatment Time: ' + txMinutes + ' minutes (skilled 1:1)',
      '  CPT Codes: 97110 (Therapeutic Exercise), ' + pick(['97140 (Manual Therapy)','97116 (Gait Training)','97530 (Therapeutic Activities)']) + ', ' + pick(['97530 (Therapeutic Activities)','97535 (Self-Care/ADL)','97112 (Neuromuscular Re-ed)']),
      '',
      '  Treatment Provided:',
      '    1. Manual therapy: ' + pick(['Soft tissue mobilization to ' + (p.bodyRegion || 'affected area'),'Joint mobilization Grade ' + pick(['II','III','III-IV']) + ' to ' + (p.bodyRegion || 'involved joints'),'Myofascial release to ' + pick(['cervical paraspinals','lumbar paraspinals','hip flexors','rotator cuff'])]) + ' x ' + pick(['8','10','12']) + ' min',
      '    2. Therapeutic exercise: ' + pick(['Progressive strengthening - ' + (exerciseList.length > 0 ? exerciseList.slice(0,3).join(', ') : 'core stabilization, hip strengthening, flexibility'),'Functional mobility training with emphasis on ' + pick(['dynamic balance','core stability','UE strengthening','LE strengthening']),'Open/closed chain exercises for ' + (p.bodyRegion || 'affected region')]) + ' x ' + pick(['12','15','18']) + ' min',
      '    3. ' + pick(['Neuromuscular re-education: proprioception, balance, motor control','Therapeutic activities: functional task training','Gait training: ' + pick(['endurance','normalized pattern','varied terrain'])]) + ' x ' + pick(['8','10','12']) + ' min',
      '    4. Patient education: ' + pick(['HEP progression, activity modification','Posture correction, ergonomic advice','Pain management strategies, ice/heat instruction','Return-to-activity guidelines']),
      '',
      '  Current Status:',
      '    Pain: ' + (p.currentPain || pick(['3','4','5'])) + '/10 (initial: ' + (p.initialPain || 'N/A') + '/10)',
      '    ODI: ' + (p.currentODI || 'N/A') + '% (initial: ' + (p.initialODI || 'N/A') + '%)',
      '    ROM: ' + pick(['Improving - flexion now 80% of normal','Progressing well','Gains noted in all planes','Improving but still limited in ' + pick(['flexion','extension','rotation'])]),
      '    Strength: ' + pick(['Improved to 4/5 in key groups','Progressing from 3+/5 to 4-/5','Good gains in core stability','Functional strength improving']),
      '',
      'ASSESSMENT:',
      '  Patient is ' + pick(['making good progress','showing steady improvement','responding well to treatment','making functional gains']) + '.',
      '  ' + pick([
        'Pain has decreased by ' + pick(['2','3','4']) + ' points since initial evaluation.',
        'Functional improvements noted with ' + pick(['sitting tolerance','lifting ability','walking distance','overhead activities']) + '.',
        'ROM and strength continue to improve with skilled intervention.',
        'Patient demonstrating improved body mechanics and posture awareness.'
      ]),
      '  Continued skilled PT is medically necessary for ' + pick([
        'progressive strengthening and return to full function.',
        'continued ROM gains and pain management.',
        'neuromuscular re-education and functional training.',
        'achieving discharge goals and independence with HEP.'
      ]),
      '',
      'PLAN:',
      '  Continue PT ' + pick(['2x/week','3x/week']) + '.',
      '  Next session: ' + pick([
        'Progress strengthening, add ' + pick(['plyometrics','resistance bands','weight bearing exercises']),
        'Focus on manual therapy and flexibility',
        'Advance functional activities and begin return-to-sport protocol',
        'Progress balance and proprioception training'
      ]),
      '  HEP updated: ' + pick(['Added new exercises','Progressed resistance','Modified for home environment','Reviewed compliance and form']),
      '  Remaining authorized visits: ' + ((p.authVisits || 20) - (p.usedVisits || visitNum)),
      '',
      '========================================================================',
      'Electronically signed by: ' + (note.author || 'N/A'),
      'Date/Time: ' + (note.date || 'N/A') + ' ' + pick(['08:30','09:15','10:00','10:45','11:30','14:00','14:30','15:15']),
      '========================================================================'
    ].join('\n');
  }

  if (noteType.includes('progress')) {
    return header + '\n\n' + [
      'PHYSICAL THERAPY PROGRESS NOTE / RE-EVALUATION',
      '========================================================================',
      '',
      'DIAGNOSIS: ' + (p.dx || 'N/A') + ' (' + (p.dxCode || '') + ')',
      'BODY REGION: ' + (p.bodyRegion || 'N/A'),
      'VISITS TO DATE: ' + (p.usedVisits || 'N/A') + ' of ' + (p.authVisits || 'N/A') + ' authorized',
      '',
      'SUBJECTIVE:',
      '  Patient reports overall ' + pick(['improvement','gradual improvement','steady progress','significant improvement']) + ' since initial evaluation.',
      '  Current pain: ' + (p.currentPain || pick(['2','3','4'])) + '/10 (initial: ' + (p.initialPain || 'N/A') + '/10)',
      '  ' + pick([
        'Patient states "I can do so much more now without pain."',
        'Reports improved ability to perform daily activities.',
        'States compliance with HEP and notices improvement.',
        'Patient expresses satisfaction with progress to date.'
      ]),
      '  Functional improvements noted: ' + pick([
        'Sitting tolerance increased from 20 min to 45+ min',
        'Can now walk ' + pick(['1 mile','30 minutes','up and down stairs']) + ' without significant pain',
        'Returned to ' + pick(['light work duties','modified exercise program','driving without pain']),
        'Sleep improved, morning stiffness significantly reduced'
      ]),
      '',
      'OBJECTIVE - RE-EVALUATION FINDINGS:',
      '',
      '  PAIN:',
      '    Initial: ' + (p.initialPain || 'N/A') + '/10  |  Current: ' + (p.currentPain || 'N/A') + '/10  |  Change: ' + ((p.initialPain || 7) - (p.currentPain || 4)) + ' point improvement',
      '',
      '  OSWESTRY DISABILITY INDEX:',
      '    Initial: ' + (p.initialODI || 'N/A') + '%  |  Current: ' + (p.currentODI || 'N/A') + '%  |  Change: ' + ((p.initialODI || 40) - (p.currentODI || 20)) + '% improvement',
      '',
      '  RANGE OF MOTION:',
      '    ' + pick([
        'Flexion: Improved from 50% to 80% of normal',
        'All planes improved by approximately 20-30%',
        'Near-full ROM achieved in all planes',
        'Flexion 90% of normal (was 60%), extension WFL (was 70%)'
      ]),
      '',
      '  STRENGTH:',
      '    ' + pick([
        'Key muscle groups improved from 3+/5 to 4+/5',
        'Core stability significantly improved, able to maintain neutral spine with dynamic tasks',
        'Hip/core strength improved to 4+/5 bilaterally (was 3+/5)',
        'UE/LE strength improved to functional levels for daily activities'
      ]),
      '',
      '  CURRENT EXERCISE PROGRAM:',
      '    ' + (exerciseList.length > 0 ? exerciseList.join(', ') : pick(['Core stabilization, hip strengthening, stretching program','Progressive resistance training, balance exercises, flexibility','Rotator cuff strengthening, scapular stabilization, stretching'])),
      '',
      'GOAL STATUS:',
      '  Short-Term Goals:',
      '    1. Pain reduced to ' + Math.max(1, (p.initialPain || 5) - 3) + '/10 - ' + pick(['MET','PARTIALLY MET','PROGRESSING']),
      '    2. ROM to 75-80% normal - ' + pick(['MET','PARTIALLY MET','PROGRESSING']),
      '    3. Strength 4/5 key groups - ' + pick(['MET','PARTIALLY MET','PROGRESSING']),
      '  Long-Term Goals:',
      '    1. Pain 0-2/10 with all activities - ' + pick(['PROGRESSING','ON TRACK','PARTIALLY MET']),
      '    2. Full functional ROM - ' + pick(['PROGRESSING','ON TRACK','PARTIALLY MET']),
      '    3. Return to full activities - ' + pick(['PROGRESSING','ON TRACK','PARTIALLY MET']),
      '    4. Independent with HEP - ' + pick(['PROGRESSING','ON TRACK','MET']),
      '    5. ODI < ' + pick(['10','15','20']) + '% - ' + pick(['PROGRESSING','ON TRACK','PARTIALLY MET']),
      '',
      'ASSESSMENT:',
      '  ' + p.firstName + ' ' + p.lastName + ' continues to make ' + pick(['good','excellent','steady']) + ' progress.',
      '  ' + pick([
        'Measurable improvements in pain, ROM, strength, and function since IE.',
        'Patient responding well to current treatment approach.',
        'Functional gains support continued skilled PT intervention.',
        'Patient meeting or exceeding expected timeline for recovery.'
      ]),
      '  Continued skilled PT is warranted to ' + pick([
        'achieve remaining long-term goals.',
        'progress to full return to function.',
        'maximize outcomes before discharge.',
        'complete the established plan of care.'
      ]),
      '',
      'PLAN:',
      '  Continue PT ' + pick(['2x/week','3x/week','2x/week transitioning to 1x/week']) + '.',
      '  Remaining authorized visits: ' + ((p.authVisits || 20) - (p.usedVisits || 8)),
      '  Updated goals and POC as indicated above.',
      '  Anticipated discharge in ' + pick(['3-4 weeks','4-6 weeks','2-3 weeks']) + '.',
      '',
      '========================================================================',
      'Electronically signed by: ' + (note.author || 'N/A'),
      'Date/Time: ' + (note.date || 'N/A') + ' ' + pick(['08:30','09:15','10:00','10:45','11:30','14:00','14:30','15:15']),
      '========================================================================'
    ].join('\n');
  }

  if (noteType.includes('discharge')) {
    return header + '\n\n' + [
      'PHYSICAL THERAPY DISCHARGE SUMMARY',
      '========================================================================',
      '',
      'DIAGNOSIS: ' + (p.dx || 'N/A') + ' (' + (p.dxCode || '') + ')',
      'BODY REGION: ' + (p.bodyRegion || 'N/A'),
      'TOTAL VISITS: ' + (p.usedVisits || 'N/A') + ' of ' + (p.authVisits || 'N/A') + ' authorized',
      'TREATMENT PERIOD: ' + (p.referralDate || 'N/A') + ' to ' + (note.date || 'N/A'),
      '',
      'REASON FOR DISCHARGE:',
      '  ' + pick([
        'Patient has met all established discharge goals.',
        'Patient has achieved functional goals and is ready for independent management.',
        'Patient has made maximum progress with skilled intervention.',
        'Goals met; patient transitioning to independent HEP.'
      ]),
      '',
      'OUTCOME MEASURES:',
      '                          Initial        Discharge      Change',
      '  Pain (NPRS):            ' + (p.initialPain || 'N/A') + '/10           ' + (p.currentPain || 'N/A') + '/10           ' + ((p.initialPain || 7) - (p.currentPain || 2)) + ' pt improvement',
      '  ODI:                    ' + (p.initialODI || 'N/A') + '%            ' + (p.currentODI || 'N/A') + '%            ' + ((p.initialODI || 40) - (p.currentODI || 10)) + '% improvement',
      '',
      'FUNCTIONAL STATUS AT DISCHARGE:',
      '  ROM: ' + pick(['Full and pain-free in all planes','Within functional limits','Near-full with minimal end-range discomfort']),
      '  Strength: ' + pick(['5/5 in all tested muscle groups','4+/5 to 5/5 in key groups','Functional strength for all daily activities']),
      '  Functional Mobility: ' + pick(['Independent with all ADLs without pain','Full return to work duties','Independent with exercise program, sport-specific activities','Returned to full functional activities']),
      '',
      'GOAL OUTCOMES:',
      '  Short-Term Goals: ' + pick(['All met','3 of 3 met','Met within expected timeline']),
      '  Long-Term Goals: ' + pick(['All met','4 of 5 met','Majority met, 1 partially met']),
      '',
      'DISCHARGE EXERCISE PROGRAM:',
      '  ' + (exerciseList.length > 0 ? exerciseList.join(', ') : 'Comprehensive HEP provided'),
      '  Frequency: ' + pick(['Daily','5x/week','4-5x/week']),
      '  Duration: ' + pick(['30 minutes','20-30 minutes','45 minutes']) + ' per session',
      '  Patient demonstrates independence with all exercises with proper form.',
      '',
      'DISCHARGE RECOMMENDATIONS:',
      '  1. Continue home exercise program as instructed',
      '  2. ' + pick(['Gradually return to full activities over next 2-4 weeks','Resume gym program starting with light weights','Progress walking/running program per guidelines provided','Return to sport with gradual progression']),
      '  3. ' + pick(['Follow up with referring physician as scheduled','Return to PT if symptoms recur or worsen','Annual wellness screen recommended','No further PT anticipated at this time']),
      '  4. ' + pick(['Apply ice after activity for 15-20 min as needed','Continue activity modification strategies as discussed','Maintain ergonomic setup at workstation','Use proper body mechanics with lifting and bending']),
      '',
      'PATIENT EDUCATION PROVIDED:',
      '  - Independent HEP with written and visual instructions',
      '  - Activity modification and self-management strategies',
      '  - ' + pick(['Ergonomic guidelines for work/home','Return-to-sport guidelines','Fall prevention strategies','Injury prevention and wellness recommendations']),
      '  - When to seek medical attention',
      '  Patient verbalized understanding of all instructions.',
      '',
      '========================================================================',
      'Electronically signed by: ' + (note.author || 'N/A'),
      'Date/Time: ' + (note.date || 'N/A') + ' ' + pick(['08:30','09:15','10:00','10:45','11:30','14:00','14:30','15:15']),
      '========================================================================'
    ].join('\n');
  }

  // FALLBACK
  return header + '\n\n' + [
    'CLINICAL NOTE - ' + (note.type || 'General').toUpperCase(),
    '========================================================================',
    '',
    'DIAGNOSIS: ' + (p.dx || 'N/A') + ' (' + (p.dxCode || '') + ')',
    'Body Region: ' + (p.bodyRegion || 'N/A'),
    'Pain: ' + (p.currentPain || 'N/A') + '/10',
    '',
    'SUBJECTIVE:',
    '  Patient seen for skilled PT. Reports ' + pick(['improved function','stable symptoms','gradual improvement']) + '.',
    '',
    'OBJECTIVE:',
    '  Treatment provided per established POC.',
    '  Exercises: ' + (exerciseList.length > 0 ? exerciseList.slice(0,4).join(', ') : 'Per POC'),
    '',
    'ASSESSMENT:',
    '  Patient continues to require skilled PT for functional deficits.',
    '',
    'PLAN:',
    '  Continue POC as established.',
    '',
    '========================================================================',
    'Electronically signed by: ' + (note.author || 'N/A'),
    'Date/Time: ' + (note.date || 'N/A'),
    '========================================================================'
  ].join('\n');
}

function DocumentsTab({ patient }) {
  const [viewingNote, setViewingNote] = React.useState(null);
  const docs = patient.noteHistory || [];
  return (
    <div>
      <h4 style={{fontSize:"16px",fontWeight:"600",marginBottom:"12px",color:"#1e293b"}}>Documents & Notes</h4>
      {docs.length === 0 ? (
        <div style={{padding:"40px",textAlign:"center",color:"#94a3b8",background:"#f8fafc",borderRadius:"8px"}}>
          <p style={{fontSize:"32px",marginBottom:"8px"}}>📄</p>
          <p>No notes documented yet.</p>
        </div>
      ) : (
        <table style={{width:"100%",borderCollapse:"collapse",background:"#fff",borderRadius:"8px",overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
          <thead>
            <tr style={{background:"#f1f5f9"}}>
              <th style={{padding:"10px 12px",textAlign:"left",fontWeight:"600",color:"#475569"}}>Type</th>
              <th style={{padding:"10px 12px",textAlign:"left",fontWeight:"600",color:"#475569"}}>Date</th>
              <th style={{padding:"10px 12px",textAlign:"left",fontWeight:"600",color:"#475569"}}>Author</th>
              <th style={{padding:"10px 12px",textAlign:"left",fontWeight:"600",color:"#475569"}}>Status</th>
              <th style={{padding:"10px 12px",textAlign:"left",fontWeight:"600",color:"#475569"}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((n, i) => (
              <tr key={i} style={{borderBottom:"1px solid #e2e8f0"}}>
                <td style={{padding:"10px 12px",fontWeight:"500"}}>{n.type}</td>
                <td style={{padding:"10px 12px",color:"#64748b"}}>{n.date}</td>
                <td style={{padding:"10px 12px",color:"#64748b"}}>{n.author}</td>
                <td style={{padding:"10px 12px"}}>
                  <span style={{padding:"2px 8px",borderRadius:"12px",fontSize:"11px",fontWeight:"500",
                    background: n.status==="Signed"?"#dcfce7":n.status==="Co-Signed"?"#dbeafe":n.status==="Draft"?"#fef3c7":n.status==="Sent"?"#dbeafe":"#fef9c3",
                    color: n.status==="Signed"?"#166534":n.status==="Co-Signed"?"#1e40af":n.status==="Draft"?"#92400e":n.status==="Sent"?"#1e40af":"#854d0e"}}>{n.status}</span>
                </td>
                <td style={{padding:"10px 12px"}}>
                  <button onClick={()=>setViewingNote(n)} style={{padding:"4px 12px",fontSize:"12px",border:"1px solid #3b82f6",borderRadius:"6px",background:"#fff",color:"#3b82f6",cursor:"pointer",fontWeight:"500"}}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {viewingNote && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setViewingNote(null)}>
          <div style={{background:"#fff",borderRadius:"12px",width:"100%",maxWidth:"800px",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 25px 50px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f8fafc",borderRadius:"12px 12px 0 0"}}>
              <h3 style={{margin:0,fontSize:"18px",fontWeight:"700",color:"#1e293b"}}>{viewingNote.type}</h3>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>{var w=window.open("","_blank");w.document.write("<pre style=\"font-family:Consolas,monospace;padding:40px;max-width:800px;margin:auto;line-height:1.6\">"+generateNoteContent(viewingNote,patient)+"</pre>");w.document.title=viewingNote.type;}} style={{padding:"6px 14px",fontSize:"12px",border:"none",borderRadius:"6px",background:"#3b82f6",color:"#fff",cursor:"pointer",fontWeight:"500"}}>Print</button>
                <button onClick={()=>setViewingNote(null)} style={{padding:"6px 14px",fontSize:"12px",border:"none",borderRadius:"6px",background:"#ef4444",color:"#fff",cursor:"pointer",fontWeight:"500"}}>Close</button>
              </div>
            </div>
            <div style={{padding:"20px 24px",borderBottom:"1px solid #e2e8f0"}}>
              <p style={{margin:"4px 0",fontSize:"13px",color:"#64748b"}}>{viewingNote.date} | {viewingNote.author} | {viewingNote.status}</p>
            </div>
            <div style={{padding:"24px",overflowY:"auto",flex:1}}>
              <pre style={{fontFamily:"Consolas,Monaco,monospace",fontSize:"13px",lineHeight:"1.7",whiteSpace:"pre-wrap",wordWrap:"break-word",color:"#1e293b",margin:0,background:"#fafafa",padding:"20px",borderRadius:"8px",border:"1px solid #e2e8f0"}}>{generateNoteContent(viewingNote,patient)}</pre>
            </div>
          </div>
        </div>
      )}
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
function MessagesPage({ patients, sentMessages, setSentMessages }) {
    const [showCompose, setShowCompose] = useState(false);
  const [msgView, setMsgView] = useState('inbox');
  const [compRecipient, setCompRecipient] = useState('');
  const [compSubject, setCompSubject] = useState('');
  const [compBody, setCompBody] = useState('');
  const [compPatient, setCompPatient] = useState('');
  var compProviders = ['Dr. Robert Chen - Orthopedics','Dr. Sarah Kim - PCP','Dr. James Wilson - Neurology','Alex Rivera, PTA','Maria Santos, OT'];
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
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",gap:8}}>
          <button className={msgView==="inbox"?"btn btn-primary":"btn btn-outline"} onClick={()=>setMsgView("inbox")}>Inbox</button>
          <button className={msgView==="sent"?"btn btn-primary":"btn btn-outline"} onClick={()=>setMsgView("sent")}>Sent ({(sentMessages||[]).length})</button>
        </div>
        <button className="btn btn-success" onClick={()=>setShowCompose(true)}>Compose Message</button>
      </div>
      {showCompose && <div className="card" style={{marginBottom:16}}><div className="card-body"><h4>Compose Message</h4><div style={{marginBottom:8}}><label>To:</label><select className="form-control" value={compRecipient} onChange={e=>setCompRecipient(e.target.value)}><option value="">Select...</option>{compProviders.map(p=><option key={p} value={p}>{p}</option>)}</select></div><div style={{marginBottom:8}}><label>Subject:</label><input type="text" className="form-control" value={compSubject} onChange={e=>setCompSubject(e.target.value)}/></div><div style={{marginBottom:8}}><label>Patient (optional):</label><select className="form-control" value={compPatient} onChange={e=>setCompPatient(e.target.value)}><option value="">None</option>{(patients||[]).map(p=><option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}</select></div><div style={{marginBottom:8}}><label>Message:</label><textarea className="form-control" rows={4} value={compBody} onChange={e=>setCompBody(e.target.value)}/></div><div style={{display:"flex",gap:8}}><button className="btn btn-primary" onClick={()=>{if(!compRecipient||!compSubject||!compBody){alert("Fill all fields");return;}var msg={id:Date.now(),to:compRecipient,from:"You",subject:compSubject,body:compBody,date:new Date().toLocaleDateString(),patientRef:compPatient};if(setSentMessages)setSentMessages([].concat(sentMessages||[],[msg]));setShowCompose(false);setCompRecipient("");setCompSubject("");setCompBody("");setCompPatient("");alert("Message sent!");}}>Send</button><button className="btn btn-outline" onClick={()=>setShowCompose(false)}>Cancel</button></div></div></div>}
      {msgView==="sent" && <div className="card"><div className="card-body">{(sentMessages||[]).length===0?<p style={{color:"var(--text-muted)"}}>No sent messages</p>:(sentMessages||[]).map((m,i)=><div key={i} style={{padding:8,borderBottom:"1px solid var(--border)"}}><strong>To: {m.to}</strong><br/><span>{m.subject}</span><br/><small style={{color:"var(--text-muted)"}}>{m.date}{m.patientRef?" | Re: "+m.patientRef:""}</small></div>)}</div></div>}
      {msgView==="inbox" && 
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
      </div>}
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
  const [patients, setPatients] = useState(SAMPLE_PATIENTS);
  const [appointments, setAppointments] = useState(SCHEDULE_DATA);
  const [navigationSource, setNavigationSource] = useState(null);
  const [customAppointments, setCustomAppointments] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);

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
          {currentPage==='schedule' && <SchedulePage setCurrentPage={setCurrentPage} setSelectedPatient={setSelectedPatient} patients={patients} appointments={appointments} setAppointments={setAppointments} setNavigationSource={setNavigationSource} customAppointments={customAppointments} setCustomAppointments={setCustomAppointments}/>}
          {currentPage==='patients' && <PatientList patients={patients} setPatients={setPatients} setSelectedPatient={setSelectedPatient} setCurrentPage={setCurrentPage} setNavigationSource={setNavigationSource}/>}
          {currentPage==='chart' && selectedPatient && <PatientChart patient={selectedPatient} user={user} setCurrentPage={setCurrentPage} patients={patients} setPatients={setPatients} setSelectedPatient={setSelectedPatient} navigationSource={navigationSource} sentMessages={sentMessages} setSentMessages={setSentMessages}/>}
          {currentPage==='documentation' && <DocumentationPage patients={patients} user={user}/>}
          {currentPage==='billing' && <BillingPage patients={patients}/>}
          {currentPage==='messages' && <MessagesPage patients={patients} sentMessages={sentMessages} setSentMessages={setSentMessages}/>}
          {currentPage==='reports' && <ReportsPage patients={patients}/>}
        </div>
      </div>
    </div>
  );
}


// ========== WeeklyScheduleView Component ==========
function WeeklyScheduleView({ patients, appointments, setSelectedPatient, setCurrentPage, setNavigationSource, customAppointments, selectedDate }) {
  var _wk = useState(0); var weekOffset = _wk[0], setWeekOffset = _wk[1];
  
  var getMonday = function(d, offset) {
    var dt = new Date(d); dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7) + (offset * 7)); return dt;
  };
  var monday = getMonday(selectedDate || new Date(), weekOffset);
  var weekDays = [];
  for (var i = 0; i < 5; i++) { var d = new Date(monday); d.setDate(d.getDate() + i); weekDays.push(d); }
  
  var timeSlots = [];
  for (var h = 7; h < 17; h++) {
    for (var m = 0; m < 60; m += 30) {
      var label = (h > 12 ? h-12 : h) + ':' + (m === 0 ? '00' : '30') + ' ' + (h >= 12 ? 'PM' : 'AM');
      timeSlots.push({hour: h, min: m, label: label});
    }
  }
  
  var prevWeek = function() { setWeekOffset(weekOffset - 1); };
  var nextWeek = function() { setWeekOffset(weekOffset + 1); };
  
  var getApptsForDay = function(dayDate) {
    var dateStr = dayDate.toISOString().split('T')[0];
    var isToday = dayDate.toDateString() === new Date().toDateString();
    var dayOfWeek = dayDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return [];
    
    var generated = [];
    if (isToday && appointments) {
      appointments.forEach(function(a) { generated.push(a); });
    } else {
      var seed = dayDate.getFullYear()*10000 + (dayDate.getMonth()+1)*100 + dayDate.getDate();
      var rng = function() { seed = (seed * 16807 + 0) % 2147483647; return (seed & 0x7fffffff) / 0x7fffffff; };
      rng(); rng(); rng();
      timeSlots.forEach(function(slot) {
        if (rng() < 0.55) {
          var pi = Math.floor(rng() * patients.length);
          var types = ['Follow-up','Re-eval','Treatment','Discharge'];
          var statuses = ['Scheduled','Checked In','In Progress'];
          generated.push({time: slot.label, therapist: 'PT', patientId: patients[pi].id, patient: patients[pi], type: types[Math.floor(rng()*types.length)], status: statuses[Math.floor(rng()*statuses.length)]});
        }
        if (rng() < 0.45) {
          var pi2 = Math.floor(rng() * patients.length);
          var types2 = ['Follow-up','Treatment','Re-eval'];
          generated.push({time: slot.label, therapist: 'PTA', patientId: patients[pi2].id, patient: patients[pi2], type: types2[Math.floor(rng()*types2.length)], status: 'Scheduled'});
        }
      });
    }
    if (customAppointments) {
      customAppointments.forEach(function(ca) {
        if (ca.date === dateStr) {
          var pt = patients.find(function(p) { return p.id == ca.patientId; });
          if (pt) generated.push({time: ca.time, therapist: ca.therapist, patientId: ca.patientId, patient: pt, type: ca.type, status: 'Scheduled'});
        }
      });
    }
    return generated;
  };

  var typeColors = {'Follow-up':'#dbeafe','Re-eval':'#fef3c7','Treatment':'#dcfce7','Discharge':'#fee2e2','Initial Eval':'#f3e8ff'};
  var typeBorders = {'Follow-up':'#3b82f6','Re-eval':'#f59e0b','Treatment':'#22c55e','Discharge':'#ef4444','Initial Eval':'#a855f7'};
  
  var handlePatientClick = function(appt) {
    if (!setSelectedPatient) return;
    var pt = null;
    if (appt.patient && typeof appt.patient === 'object') { pt = appt.patient; }
    else if (appt.patientId && patients) { pt = patients.find(function(p) { return p.id === appt.patientId; }); }
    if (pt) {
      setSelectedPatient(pt);
      if (setNavigationSource) setNavigationSource('schedule');
      setCurrentPage('chart');
    }
  };

  return (
    <div className="card" style={{padding:0,overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:'var(--bg-secondary)',borderBottom:'2px solid var(--border)'}}>
        <button className="btn btn-outline btn-sm" onClick={prevWeek}>◄ Prev Week</button>
        <h4 style={{margin:0,fontSize:16}}>Week of {monday.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</h4>
        <button className="btn btn-outline btn-sm" onClick={nextWeek}>Next Week ►</button>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,tableLayout:'fixed'}}>
          <colgroup>
            <col style={{width:'80px'}} />
            {weekDays.map((_,i) => <col key={i} style={{width:'calc((100% - 80px)/5)'}} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{padding:'10px 8px',background:'#1e293b',color:'white',fontWeight:700,fontSize:12,textAlign:'center',position:'sticky',top:0,zIndex:2}}>Time</th>
              {weekDays.map((d,i) => {
                var isToday = d.toDateString() === new Date().toDateString();
                return <th key={i} style={{padding:'10px 8px',background:isToday?'#2563eb':'#1e293b',color:'white',fontWeight:700,fontSize:12,textAlign:'center',position:'sticky',top:0,zIndex:2}}>
                  <div>{['Mon','Tue','Wed','Thu','Fri'][i]}</div>
                  <div style={{fontSize:14,fontWeight:800}}>{(d.getMonth()+1) + '/' + d.getDate()}</div>
                </th>;
              })}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, si) => {
              var isHourStart = slot.min === 0;
              return (
                <tr key={si} style={{background: isHourStart ? '#f8fafc' : 'white'}}>
                  <td style={{padding:'6px 8px',fontWeight:isHourStart?700:400,fontSize:isHourStart?13:11,color:isHourStart?'#1e293b':'#94a3b8',borderBottom:'1px solid '+(isHourStart?'#cbd5e1':'#f1f5f9'),borderRight:'2px solid #e2e8f0',textAlign:'center',whiteSpace:'nowrap'}}>{slot.label}</td>
                  {weekDays.map((dayDate, di) => {
                    var dayAppts = getApptsForDay(dayDate);
                    var cellAppts = dayAppts.filter(function(a) { return a.time === slot.label && a.patientId; });
                    return (
                      <td key={di} style={{padding:'3px 4px',borderBottom:'1px solid '+(isHourStart?'#cbd5e1':'#f1f5f9'),borderRight:'1px solid #f1f5f9',verticalAlign:'top',minHeight:36}}>
                        {cellAppts.map((appt, ai) => (
                          <div key={ai} onClick={function(){handlePatientClick(appt);}} style={{padding:'4px 6px',marginBottom:2,borderRadius:4,fontSize:11,cursor:'pointer',background:typeColors[appt.type]||'#f1f5f9',borderLeft:'3px solid '+(typeBorders[appt.type]||'#94a3b8'),lineHeight:1.3,transition:'transform 0.1s',overflow:'hidden'}}
                            onMouseOver={function(e){e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.15)';}}
                            onMouseOut={function(e){e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='none';}}>
                            <div style={{fontWeight:700,color:'#1e293b',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{appt.patient ? (typeof appt.patient === 'string' ? appt.patient : appt.patient.lastName + ', ' + (appt.patient.firstName || '').charAt(0) + '.') : '—'}</div>
                            <div style={{color:'#64748b',fontSize:10}}>{appt.therapist} • {appt.type}</div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{padding:'8px 16px',background:'var(--bg-secondary)',borderTop:'1px solid var(--border)',display:'flex',gap:12,flexWrap:'wrap',fontSize:11}}>
        {Object.keys(typeColors).map(function(type) {
          return <span key={type} style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:12,height:12,borderRadius:2,background:typeColors[type],border:'1px solid '+typeBorders[type],display:'inline-block'}}></span>{type}</span>;
        })}
      </div>
    </div>
  );
}


// ========== AddAppointmentModal Component ==========


// ____________________ ADD APPOINTMENT MODAL ____________________
function AddAppointmentModal({ patients, selectedDate, customAppointments, setCustomAppointments, onClose }) {
  var _ad = useState({patientId:patients.length>0?patients[0].id:'',date:selectedDate.toISOString().split('T')[0],time:'8:00 AM',therapist:'PT',type:'Treatment'});
  var apptData = _ad[0], setApptData = _ad[1];
  var timeOpts = [];
  for (var h = 7; h < 17; h++) { for (var m = 0; m < 60; m += 30) { timeOpts.push((h>12?h-12:h)+':'+(m===0?'00':'30')+' '+(h>=12?'PM':'AM')); } }
  var handleSave = function() {
    if (!apptData.patientId) { alert('Select a patient'); return; }
    setCustomAppointments([].concat(customAppointments||[],[apptData]));
    onClose();
  };
  return React.createElement('div',{style:{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}},
    React.createElement('div',{style:{background:'var(--card-bg,#fff)',borderRadius:8,padding:24,width:400,maxWidth:'90%'}},
      React.createElement('h3',{style:{marginBottom:16}},'Add Appointment'),
      React.createElement('div',{style:{marginBottom:12}},React.createElement('label',null,'Patient'),React.createElement('select',{className:'form-control',value:apptData.patientId,onChange:function(e){setApptData(Object.assign({},apptData,{patientId:parseInt(e.target.value)||e.target.value}))}},patients.map(function(p){return React.createElement('option',{key:p.id,value:p.id},p.lastName+', '+p.firstName)}))),
      React.createElement('div',{style:{marginBottom:12}},React.createElement('label',null,'Date'),React.createElement('input',{type:'date',className:'form-control',value:apptData.date,onChange:function(e){setApptData(Object.assign({},apptData,{date:e.target.value}))}})),
      React.createElement('div',{style:{marginBottom:12}},React.createElement('label',null,'Time'),React.createElement('select',{className:'form-control',value:apptData.time,onChange:function(e){setApptData(Object.assign({},apptData,{time:e.target.value}))}},timeOpts.map(function(t){return React.createElement('option',{key:t,value:t},t)}))),
      React.createElement('div',{style:{marginBottom:12}},React.createElement('label',null,'Therapist'),React.createElement('select',{className:'form-control',value:apptData.therapist,onChange:function(e){setApptData(Object.assign({},apptData,{therapist:e.target.value}))}},React.createElement('option',{value:'PT'},'PT'),React.createElement('option',{value:'PTA'},'PTA'))),
      React.createElement('div',{style:{marginBottom:16}},React.createElement('label',null,'Type'),React.createElement('select',{className:'form-control',value:apptData.type,onChange:function(e){setApptData(Object.assign({},apptData,{type:e.target.value}))}},['Initial Eval','Treatment','Re-eval','Discharge Eval'].map(function(ty){return React.createElement('option',{key:ty,value:ty},ty)}))),
      React.createElement('div',{style:{display:'flex',gap:8,justifyContent:'flex-end'}},
        React.createElement('button',{className:'btn btn-outline',onClick:onClose},'Cancel'),
        React.createElement('button',{className:'btn btn-primary',onClick:handleSave},'Add Appointment')
      )
    )
  );
}


// ========== SendMessageFromChart Component ==========


// ____________________ SEND MESSAGE FROM CHART ____________________
function SendMessageFromChart({ patient, user, patients, setPatients, setSelectedPatient, sentMessages, setSentMessages }) {
  var _r = useState(''); var recipient = _r[0], setRecipient = _r[1];
  var _s = useState(''); var subject = _s[0], setSubject = _s[1];
  var _b = useState(''); var body = _b[0], setBody = _b[1];
  var providers = ['Dr. Robert Chen - Orthopedics','Dr. Sarah Kim - PCP','Dr. James Wilson - Neurology','Alex Rivera, PTA','Maria Santos, OT','Jennifer Walsh, SLP'];
  var handleSend = function() {
    if (!recipient || !subject || !body) { alert('Please fill all fields'); return; }
    var msg = {id:Date.now(),from:user.displayName,to:recipient,subject:subject,body:body,date:new Date().toISOString(),patientRef:patient.firstName+' '+patient.lastName};
    setSentMessages([].concat(sentMessages||[],[msg]));
    if (patients && setPatients) {
      var updated = patients.map(function(p) {
        if (p.id === patient.id) { return Object.assign({},p,{noteHistory:[].concat(p.noteHistory||[],[{type:'Message',date:new Date().toISOString().split('T')[0],author:user.displayName,status:'Sent',subject:'To: '+recipient+' - '+subject,recipient:recipient}])}); }
        return p;
      });
      setPatients(updated);
      if(setSelectedPatient){var up=updated.find(function(p){return p.id===patient.id;});if(up)setSelectedPatient(up);}
    }
    alert('Message sent and saved to Documents');
    setRecipient('');setSubject('');setBody('');
  };
  return React.createElement('div',{className:'card',style:{maxWidth:600,margin:'0 auto'}},
    React.createElement('div',{className:'card-body'},
      React.createElement('h3',{style:{marginBottom:16}},'Send Message about '+patient.firstName+' '+patient.lastName),
      React.createElement('div',{style:{marginBottom:12}},React.createElement('label',null,'To:'),React.createElement('select',{className:'form-control',value:recipient,onChange:function(e){setRecipient(e.target.value)}},React.createElement('option',{value:''},'Select recipient...'),providers.map(function(p){return React.createElement('option',{key:p,value:p},p)}))),
      React.createElement('div',{style:{marginBottom:12}},React.createElement('label',null,'Subject:'),React.createElement('input',{type:'text',className:'form-control',value:subject,onChange:function(e){setSubject(e.target.value)},placeholder:'Message subject'})),
      React.createElement('div',{style:{marginBottom:16}},React.createElement('label',null,'Message:'),React.createElement('textarea',{className:'form-control',rows:6,value:body,onChange:function(e){setBody(e.target.value)},placeholder:'Type your message...'})),
      React.createElement('button',{className:'btn btn-primary',onClick:handleSend},'Send Message')
    )
  );
}


ReactDOM.createRoot(document.getElementById('root')).render(<App />);
