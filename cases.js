/* Geographic entities are real. All witnesses, incident records and timetable snapshots are fictional. */
window.DR = {
  incidentUTC: '2026-07-17T21:17:00Z',
  people: [
    { id: 'vale', name: 'Mara Vale', role: 'External archive auditor', key: 'MV-07', detail: 'Named custodian of signing key MV-07.' },
    { id: 'ren', name: 'Ren Sato', role: 'Transit consultant', key: 'RS-12', detail: 'Named custodian of signing key RS-12.' },
    { id: 'ortiz', name: 'Daniel Ortiz', role: 'Newsroom liaison', key: 'DO-04', detail: 'Named custodian of signing key DO-04.' }
  ],
  cities: [
    {
      id: 'lisbon', no: '01', city: 'Lisbon', country: 'Portugal', zone: 'Europe/Lisbon',
      center: [-9.1458,38.6974], span: [.035,.025], label: 'The Other Bank',
      victim: 'Inês Duarte', date: '14 JUL 2026', coordinate: '38.707° N / 9.145° W',
      intro: 'An archivist was found dead in a dockside office. A witness says she crossed the Tagus before a camera placed her on the other bank. Her crossing is the only part of her statement nobody has tested.',
      water: 'TAGUS RIVER',
      sites: [
        ['north', 'Cais do Sodré', -9.14447, 38.70640],
        ['south', 'Cacilhas', -9.14745, 38.68743],
        ['office', 'Dockside office', -9.14160, 38.70660]
      ],
      route: [[-9.14447,38.70640],[-9.1441,38.7047],[-9.1449,38.6983],[-9.1462,38.6920],[-9.14745,38.68743]],
      track: [12,20,30],
      range: [10,32],
      ops: [
        {id:'gate', tag:'TERMINAL / GATE', name:'North-bank gate scan', site:'north', time:12, body:'22:12 local. A terminal gate places Mara Vale at Cais do Sodré. The gate clock was checked against the dispatch clock.'},
        {id:'manifest',tag:'TRANSIT / DISPATCH',name:'Crossing dispatch log',site:'north',time:20,body:'The first crossing available after the gate scan departs at 22:20 and docks at 22:30. This is the service snapshot preserved in the case.'},
        {id:'camera',tag:'CCTV / EXPORTED FILE',name:'South-bank camera export',site:'south',time:17,body:'22:17 is visible in the export interface. The embedded acquisition timestamp was stripped by the export software. The still shows a terminal corridor.'},
        {id:'audit',tag:'ARCHIVE / METADATA',name:'Export field dictionary',site:'office',time:null,body:'The UI label is export_receipt. It records when a processed file entered the archive. The interface can show this value even when capture_at is missing.'}
      ],
      tests: [
        {title:'Test the river crossing', routeCheck:true, needs:['gate','manifest'], time:17, result:'At 22:17 the documented crossing has not departed. Scheduled arrival in this case is 22:30.'},
        {title:'Identify the camera timestamp', needs:['camera','audit'], time:17, result:'22:17 belongs to the export receipt. The camera still cannot establish when Vale was on the south bank.'}
      ],
      choices: ['The still proves Vale was in Cacilhas at 22:17.', 'The stated crossing fails and the still cannot repair the alibi.', 'The north-bank gate and south-bank camera are the same site.'], answer:1,
      report:'The crossing claim fails. The archive uses the same unusual export template as the files recovered in New York and Tokyo.',
      sync: [
        { type:'Door panel diagnostic', iso:'2026-07-17T20:53:00Z', key:'SERVICE' },
        { type:'Replace evidence index', iso:'2026-07-17T21:17:00Z', key:'MV-07' }
      ]
    },
    {
      id:'newyork',no:'02',city:'New York',country:'United States',zone:'America/New_York',
      center:[-73.9963,40.7013],span:[.027,.019],label:'The Duplicate Frame',
      victim:'Evan Price',date:'15 JUL 2026',coordinate:'40.703° N / 73.992° W',
      intro:'A documentary producer had been comparing port records with the Lisbon archive. The still submitted in his file is tagged DUMBO. A separately verified receipt places the original camera somewhere else.',
      water:'EAST RIVER',
      sites:[
        ['pier','Pier 11',-74.0082,40.7034],
        ['dumbo','DUMBO landing',-73.9943,40.7033],
        ['gate','Brooklyn office',-73.9920,40.7025]
      ],
      route:[[-74.0082,40.7034],[-74.0066,40.7024],[-74.003,40.7018],[-73.9996,40.7017],[-73.9964,40.7021],[-73.9943,40.7033]],
      track:[8,15,24],range:[7,27],hour:17,
      ops:[
        {id:'still',tag:'CCTV / STILL',name:'Still submitted as DUMBO',site:'dumbo',time:12,body:'17:12 local. The archive location tag reads DUMBO. The source device identifier in the sealed image record is ER-11.'},
        {id:'registry',tag:'CAMERA / REGISTRY',name:'Fixed-camera registry',site:'pier',time:null,body:'ER-11 is fixed to the Pier 11 terminal building on the Manhattan shore. DUMBO has a different camera, ER-23.'},
        {id:'boarding',tag:'TRANSIT / BOARDING',name:'Verified boarding scan',site:'pier',time:15,body:'17:15 local. An independent attendant signed a boarding scan for Mara Vale at Pier 11. The vessel is logged arriving at DUMBO at 17:24.'},
        {id:'interview',tag:'STATEMENT / WITNESS',name:'Statement about the crossing',site:'dumbo',time:16,body:'Vale says the signed Pier 11 boarding scan marks her ferry. She also says she stepped off that ferry at DUMBO at 17:16.'}
      ],
      tests:[
        {title:'Verify which bank the still shows',needs:['still','registry'],time:12,result:'Device ER-11 pins the camera to Manhattan. The DUMBO label puts the still on the wrong bank.'},
        {title:'Compare boarding and arrival',routeCheck:true,needs:['boarding','interview'],time:16,result:'The documented vessel is in transit at 17:16. Its DUMBO arrival in the preserved case log is 17:24.'}
      ],
      choices:['The registered device and ferry log contradict the submitted account.','Both records place Vale in DUMBO at 17:12.','Device ER-11 is registered to both banks.'],answer:0,
      report:'The location label was altered. The original image record and the transit log came from independent sources.',
      sync:[
        {type:'Replace evidence index',iso:'2026-07-17T21:17:00Z', key:'MV-07'},
        {type:'Ferry manifest backup',iso:'2026-07-17T22:05:00Z', key:'SERVICE'}
      ]
    },
    {
      id:'tokyo',no:'03',city:'Tokyo',country:'Japan',zone:'Asia/Tokyo',
      center:[139.7688,35.6767],span:[.026,.018],label:'Below the Street',
      victim:'Aiko Mori',date:'17 JUL 2026',coordinate:'35.671° N / 139.765° E',
      intro:'A data journalist died hours after filing a request to inspect the original recordings. Her notes point to a disputed Ginza Line journey and a custody ledger kept outside the compromised archive.',
      water:'',
      sites:[
        ['ginza','Ginza',139.76415,35.67192],
        ['kyobashi','Kyobashi',139.77001,35.67683],
        ['nihon','Nihombashi',139.77331,35.68206]
      ],
      route:[[139.76415,35.67192],[139.7656,35.6731],[139.77001,35.67683],[139.7710,35.67845],[139.77331,35.68206]],
      track:[6,10,17],range:[5,21],hour:6,
      ops:[
        {id:'entry',tag:'METRO / GATE',name:'Recorded Ginza entry',site:'ginza',time:6,body:'06:06 local. A signed tap places the transit token at Ginza. The next eligible train in the saved scenario leaves at 06:10 and reaches Nihombashi at 06:17.'},
        {id:'claimed',tag:'ARCHIVE / STATEMENT',name:'Train arrival claim',site:'nihon',time:9,body:'An archive note states that the same token completed the documented Ginza Line journey to Nihombashi at 06:09.'},
        {id:'ledger',tag:'CUSTODY / INDEPENDENT',name:'Hardware key custody',site:'kyobashi',time:null,body:'MV-07 was checked out exclusively to Mara Vale. RS-12 belongs to Ren Sato. DO-04 belongs to Daniel Ortiz. The ledger is a signed copy held by the investigating team.'},
        {id:'signed',tag:'ARCHIVE / ATTACHMENT',name:'Victim’s sealed export',site:'nihon',time:null,body:'Mori saved a copy that shows the evidence index records the key that signs each replacement. Archive display names can change. The signing key field remains in the audit record.'}
      ],
      tests:[
        {title:'Reconstruct the metro journey',routeCheck:true,needs:['entry','claimed'],time:9,result:'At the time of the claimed arrival the documented train has not left Ginza. In the case snapshot it reaches Nihombashi at 06:17.'},
        {title:'Connect an audit key to its custodian',needs:['ledger','signed'],time:17,result:'Use the key in a synchronized replacement record and match it to the independent custody ledger.'}
      ],
      choices:['The journey is confirmed by the timing.', 'The correct identifier is the editable archive display name.', 'The trip fails the timeline test and the signing key can identify the index editor.'],answer:2,
      report:'The independent custody ledger provides the identity test. Compare the three archive clocks before assigning the common alteration.',
      sync:[
        {type:'Station camera export',iso:'2026-07-18T00:42:00Z',key:'SERVICE'},
        {type:'Replace evidence index',iso:'2026-07-17T21:17:00Z',key:'MV-07'}
      ]
    }
  ]
};
