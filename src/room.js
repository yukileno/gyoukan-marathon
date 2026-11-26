import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const sceneBox = document.getElementById('scene');
const stageMessage = document.getElementById('roomMode');

const forms = [
  {size:.76, fur:'#df8645', mark:'#a94f2b', tip:'#fff2d9'},
  {size:.86, fur:'#dc6840', mark:'#92391e', tip:'#fff2d9'},
  {size:.94, fur:'#c67945', mark:'#62341f', tip:'#62341f', bands:3},
  {size:1.01, fur:'#9caabf', mark:'#485368', tip:'#e5edfb', bands:5},
  {size:1.08, fur:'#ad7353', mark:'#593728', tip:'#593728', bands:4, mane:.72, maneColor:'#a64a29'},
  {size:1.16, fur:'#c58b51', mark:'#6d4124', tip:'#6d4124', bands:2, mane:.92, maneColor:'#8d492a', tuft:1, face:.25},
  {size:1.23, fur:'#e4ac4b', mark:'#753c20', tip:'#9a531f', mane:1.07, maneColor:'#c07924', tuft:1.18, face:.42},
  {size:1.31, fur:'#d48545', mark:'#723522', tip:'#9d3920', mane:1.22, maneColor:'#a83720', tuft:1.3, face:.56},
  {size:1.38, fur:'#b88250', mark:'#392920', tip:'#32221e', mane:1.36, maneColor:'#38231d', tuft:1.42, face:.7},
  {size:1.45, fur:'#e2a75b', mark:'#623722', tip:'#623722', mane:1.49, maneColor:'#5f3221', tuft:1.55, face:.85, aura:true},
  {size:1.53, fur:'#49305f', faceColor:'#964dd5', mark:'#321740', tip:'#291336', mane:1.65, maneColor:'#29153f', tuft:1.7, face:1, aura:true}
];

function start() {
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const surface = renderer.domElement;
  surface.setAttribute('role', 'img');
  surface.setAttribute('aria-label', '猫が歩き回る3Dの部屋');
  const world = new THREE.Scene();
  world.background = new THREE.Color('#f0dce5');
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 100);
  camera.position.set(15, 12, 19);
  const orbit = new OrbitControls(camera, surface);
  orbit.target.set(0, .35, 0);
  orbit.enablePan = false;
  orbit.minDistance = 7;
  orbit.maxDistance = 43;
  orbit.minPolarAngle = .3;
  orbit.maxPolarAngle = 1.34;
  orbit.update();
  orbit.saveState();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  world.add(new THREE.HemisphereLight('#fff9ed', '#807b83', 1.55));
  const sun = new THREE.DirectionalLight('#fff2dc', 2.5);
  sun.position.set(5, 12, 5);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:1,far:33});
  sun.shadow.mapSize.set(1024,1024);
  sun.shadow.normalBias = .025;
  world.add(sun);
  const fill = new THREE.DirectionalLight('#c8e5ff', .55);
  fill.position.set(-5,4,-6);
  world.add(fill);

  function mesh(parent, geometry, color, x, y, z) {
    const material = color instanceof THREE.Material ? color : new THREE.MeshStandardMaterial({color, roughness: .88});
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  }
  function box(parent, color, x, y, z, width, height, depth) {
    return mesh(parent, new THREE.BoxGeometry(width, height, depth), color, x, y, z);
  }
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  function oval(parent, color, x, y, z, sx, sy, sz) {
    const part = mesh(parent, sphere, color, x, y, z);
    part.scale.set(sx, sy, sz);
    return part;
  }

  const roomWidth = 16.8;
  const edge = roomWidth / 2;
  box(world, '#956447', 0, -.18, 0, roomWidth + .2, .28, roomWidth + .2);
  const boards = box(world, '#c79b75', 0, -.028, 0, roomWidth, .05, roomWidth);
  boards.receiveShadow = true;
  new THREE.TextureLoader().load('art/oak-floor.webp', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3,3);
    texture.anisotropy = Math.min(8,renderer.capabilities.getMaxAnisotropy());
    boards.material.color.set('#ffffff');
    boards.material.map = texture;
    boards.material.needsUpdate = true;
    draw();
  });
  const rear = new THREE.Group();
  const left = new THREE.Group();
  world.add(rear, left);
  const wallpaperWalls = [];
  for (const wall of [rear,left]) {
    if (wall === left) wall.rotation.y = Math.PI / 2;
    const plaster = box(wall, '#ede0ca', 0, 1.54, -edge, roomWidth, 3.08, .16);
    plaster.receiveShadow = true;
    wallpaperWalls.push(plaster.material);
    box(wall, '#e7bdc6', 0,.47,-edge+.09,roomWidth,.94,.09);
    box(wall, '#fff5e4', 0,.95,-edge+.16,roomWidth,.085,.10);
    box(wall, '#bb8d76', 0,.09,-edge+.15,roomWidth,.18,.13);
    box(wall, '#fff4dd', 0,3.01,-edge+.13,roomWidth,.12,.09);
    for (let x = -7.7; x <= 7.8; x += .86) {
      box(wall,'#cba4b0',x,.50,-edge+.142,.022,.72,.022);
    }
  }
  new THREE.TextureLoader().load('art/cat-wallpaper.webp', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.set(5,1);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    for (const material of wallpaperWalls) {
      material.color.set('#ffffff');
      material.map = texture;
      material.needsUpdate = true;
    }
    draw();
  });

  for (const center of [-4.2,4.2]) {
    const glass = box(rear,'#a4ccde',center,1.94,-edge+.12,2.8,1.61,.08);
    glass.material.emissive.set('#7da5c2');
    glass.material.emissiveIntensity = .32;
    for (const offset of [-1.44,0,1.44]) box(rear,'#fffaee',center+offset,1.94,-edge+.20,.09,1.7,.14);
    for (const y of [1.09,1.94,2.79]) box(rear,'#fffaee',center,y,-edge+.20,2.97,.09,.14);
    box(rear,'#ac815f',center,1.055,-edge+.27,3.14,.10,.28);
  }


  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 36),
    new THREE.MeshBasicMaterial({color: '#654636', opacity: .19, transparent: true, depthWrite: false}));
  shadow.rotation.x = -Math.PI / 2;
  world.add(shadow);
  const cat = new THREE.Group();
  const body = new THREE.Group();
  world.add(cat);
  cat.add(body);
  const fur = new THREE.MeshStandardMaterial({color:forms[0].fur, roughness:.88});
  const faceFur = new THREE.MeshStandardMaterial({color:forms[0].fur, roughness:.88});
  const stripe = new THREE.MeshStandardMaterial({color:forms[0].mark, roughness:.88});
  const tailColor = new THREE.MeshStandardMaterial({color:forms[0].tip, roughness:.88});
  const cream = '#fff2d9';
  const torso = oval(body, fur, 0, .59, -.18, .37, .35, .65);
  oval(body, cream, 0, .44, .27, .29, .25, .27);
  const head = new THREE.Group();
  head.position.set(0, .93, .47);
  body.add(head);
  oval(head, faceFur, 0, 0, 0, .46, .39, .37);
  const horns = new THREE.Group();
  head.add(horns);
  for (const side of [-1, 1]) {
    const horn = mesh(horns, new THREE.ConeGeometry(.135, .61, 12), '#c34376', side * .34, .49, .15);
    horn.rotation.z = -side * .38;
  }
  const eyes = [];
  const fierceFace = new THREE.Group();
  head.add(fierceFace);
  const mouth = oval(fierceFace, '#301b1b', 0, -.235, .329, .234, .135, .098);
  const brows = [];
  for (const side of [-1, 1]) {
    const ear = mesh(head, new THREE.ConeGeometry(.19, .43, 4), fur, side * .28, .34, -.045);
    ear.rotation.y = Math.PI / 4;
    ear.rotation.z = -side * .17;
    const inner = mesh(head, new THREE.ConeGeometry(.105, .25, 4), '#eeaca1', side * .30, .35, .043);
    inner.rotation.copy(ear.rotation);
    oval(head, cream, side * .13, -.13, .30, .19, .12, .089);
    const eye = new THREE.Group();
    eye.position.set(side * .185, .04, .327);
    head.add(eye);
    eyes.push(eye);
    oval(eye, '#304136', 0, 0, 0, .057, .078, .027);
    oval(eye, '#ffffff', -.016, .025, .025, .016, .018, .009);
    const brow = oval(fierceFace, stripe, side * .188, .1, .363, .091, .022, .038);
    brow.rotation.z = side * .45;
    brows.push(brow);
    oval(fierceFace, '#e8a333', side * .185, .032, .369, .05, .034, .02);
    oval(fierceFace, '#241915', side * .185, .032, .387, .017, .031, .009);
    const fang = mesh(fierceFace, new THREE.ConeGeometry(.039, .138, 12), '#fff4db', side * .152, -.232, .411);
    fang.rotation.z = Math.PI - side * .16;
    mesh(fierceFace, new THREE.ConeGeometry(.024, .074, 10), '#fff4db', side * .098, -.316, .392);
    for (let i=0; i<2; i++) {
      const whisker = oval(head, '#845f48', side * .34, -.115 - i * .052, .30, .20, .009, .009);
      whisker.rotation.z = side * (.12 - i * .20);
    }
  }
  oval(head, '#ae5f58', 0, -.09, .391, .065, .044, .028);
  for (const x of [-.1, 0, .1]) {
    const mark = oval(head, stripe, x, .275, .245, .024, .068, .016);
    mark.rotation.x = -.48;
  }
  const legs = [];
  const paws = [];
  for (const z of [-.55, .23]) {
    for (const side of [-1, 1]) {
      const joint = new THREE.Group();
      joint.position.set(side * .24, .45, z);
      body.add(joint);
      oval(joint, fur, 0, -.16, 0, .108, .23, .12);
      const paw = new THREE.Group();
      paw.position.set(0, -.345, .04);
      joint.add(paw);
      oval(paw, cream, 0, 0, 0, .12, .084, .154);
      const claws = new THREE.Group();
      paw.add(claws);
      for (const x of [-.063, 0, .063]) {
        const claw = mesh(claws, new THREE.ConeGeometry(.021, .067, 9), '#fff2d9', x, -.02, .147);
        claw.rotation.x = Math.PI / 2;
      }
      paws.push({paw, claws});
      legs.push(joint);
    }
  }
  const tail = new THREE.Group();
  tail.position.set(0, .64, -.67);
  body.add(tail);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,0,0), new THREE.Vector3(0,.22,-.29),
    new THREE.Vector3(.05,.58,-.47), new THREE.Vector3(.22,.72,-.59)
  ]);
  mesh(tail, new THREE.TubeGeometry(curve, 32, .074, 12, false), fur, 0, 0, 0);
  const tailBands = [.32, .59, .82, .45, .71].map(position => {
    const {x,y,z} = curve.getPointAt(position);
    const band = mesh(tail, new THREE.TorusGeometry(.073, .019, 8, 18), stripe, x, y, z);
    band.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), curve.getTangentAt(position));
    return band;
  });
  const tip = curve.getPoint(1);
  const tailTip = oval(tail, tailColor, tip.x, tip.y, tip.z, .078, .078, .078);
  const tailTuft = oval(tail, tailColor, tip.x + .036, tip.y + .02, tip.z - .015, .10, .17, .105);
  tailTuft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), curve.getTangent(1));

  const mane = new THREE.Group();
  head.add(mane);
  const maneColors = Array.from({length:2}, () => new THREE.MeshStandardMaterial({roughness:.96}));
  for (let i = 0; i < 11; i++) {
    const angle = i * Math.PI * 2 / 11;
    const tuft = oval(mane, maneColors[i % 2], Math.cos(angle)*.38, Math.sin(angle)*.36-.04, -.13, .17,.26,.23);
    tuft.rotation.z = angle - Math.PI/2;
  }
  const manePoints = new THREE.Group();
  mane.add(manePoints);
  for (let i = 0; i < 11; i++) {
    const angle = (i + .5) * Math.PI * 2 / 11;
    const lock = mesh(manePoints, new THREE.ConeGeometry(.139, .41, 7), maneColors[i % 2],
      Math.cos(angle)*.47, Math.sin(angle)*.43-.04, -.23);
    lock.rotation.z = angle - Math.PI/2;
  }
  const neckRuff = new THREE.Group();
  body.add(neckRuff);
  neckRuff.position.set(0, .7, .2);
  for (const side of [-1, 1]) {
    for (let i=0; i<4; i++) {
      const lock = oval(neckRuff, maneColors[i % 2], side * (.39 - i * .105), .16 - i * .085, .13, .17, .32, .23);
      lock.rotation.z = side * (.52 - i * .12);
    }
  }
  const aura = new THREE.Group();
  cat.add(aura);
  body.traverse(part => {
    if (part.isMesh) part.castShadow = true;
  });
  const stars = [];
  const glow = new THREE.MeshBasicMaterial({color:'#ffe386',transparent:true,opacity:.88,depthWrite:false});
  const haloMaterial = new THREE.MeshBasicMaterial({color:'#ffc061',transparent:true,opacity:.64,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});
  const halo = new THREE.Mesh(new THREE.RingGeometry(.91,1.03,54),haloMaterial);
  halo.rotation.x = -Math.PI/2;
  halo.position.y = .055;
  aura.add(halo);
  const spark = new THREE.OctahedronGeometry(.09);
  for (let i=0;i<18;i++) {
    const star = new THREE.Mesh(spark,glow);
    aura.add(star);
    stars.push(star);
  }
  const gold = new THREE.PointLight('#ffc15e',3.2,4,1.4);
  gold.position.set(0,.65,.3);
  aura.add(gold);

  function applyForm(form, xp) {
    const {bands = 0, mane: maneSize = 0, tuft = 0, face = 0} = form;
    fur.color.set(form.fur);
    faceFur.color.set(form.faceColor ?? form.fur);
    horns.visible = face === 1;
    stripe.color.set(form.mark);
    tailColor.color.set(form.tip);
    tailBands.forEach((band, i) => { band.visible = i < bands; });
    tailTip.visible = !tuft;
    tailTuft.visible = tuft > 0;
    tailTuft.scale.set(.10 * tuft, .17 * tuft, .105 * tuft);
    mane.visible = maneSize > 0;
    mane.scale.set(maneSize, maneSize, .65 + .35 * maneSize);
    manePoints.visible = face === 1;
    neckRuff.visible = face >= .56;
    neckRuff.scale.setScalar(.55 + .45 * face);
    if (mane.visible) {
      maneColors[0].color.set(form.maneColor);
      maneColors[1].color.copy(maneColors[0].color).multiplyScalar(.60);
    }
    torso.scale.set(.37 + .11 * face, .35 + .045 * face, .65 + .09 * face);
    head.scale.set(1 + .12 * face, 1, 1 + .05 * face);
    fierceFace.visible = face >= .56;
    eyes.forEach(eye => { eye.visible = !fierceFace.visible; });
    mouth.scale.y = .085 + .05 * face;
    brows.forEach((brow, i) => { brow.rotation.z = (i * 2 - 1) * (.2 + .3 * face); });
    paws.forEach(({paw, claws}) => {
      paw.scale.set(1 + .28 * face, 1, 1 + .18 * face);
      claws.visible = face === 1;
    });
    aura.visible = !!form.aura;
    glow.color.set(face === 1 ? '#db8bff' : '#ffe386');
    haloMaterial.color.set(face === 1 ? '#ac49ee' : '#ffc061');
    gold.color.set(face === 1 ? '#be65ff' : '#ffc15e');
    desiredSize = form.size + .3 * (xp / (xp + 25));
  }

  const furnitureSlots = {
    rugRound: [0,.5,0], sideTable: [-2.8,-2.6,0],
    lampRoundFloor: [3,-2.8,0], loungeSofa: [-.3,-3,0]
  };
  const furnitureNames = {};
  const outerSlots = [
    ...[-6.55,-3.95,-1.35,1.35,3.95,6.55].flatMap(x => [[x,-6.62,0],[x,6.62,2]]),
    ...[-4.2,-1.4,1.4,4.2].flatMap(z => [[-6.65,z,1],[6.65,z,3]]),
    ...[-4.3,-2.14,0,2.14,4.3].map(x => [x,3.75,2]),
    [4.7,-.45,3]
  ];
  const furnitureBounds = new Map();

  const models = new Map();
  const picker = document.getElementById('furnitureSelect');
  const rotateFurniture = document.getElementById('furnitureTurn');
  const hint = document.getElementById('furnitureHint');
  let ownedIds = [];
  let savedPoses = {};
  let selected = '';
  const floor = new THREE.Plane(new THREE.Vector3(0,1,0),0);
  const ray = new THREE.Raycaster();

  function applyPose(id) {
    const model = models.get(id);
    if (!model) return;
    const [x,z,turns] = savedPoses[id] || furnitureSlots[id];
    model.position.set(x,id.startsWith('rug') ? .044 : 0,z);
    model.rotation.y = turns * Math.PI / 2;
    if (!id.startsWith('rug')) furnitureBounds.set(id,new THREE.Box3().setFromObject(model).expandByScalar(.30));
  }
  function updatePicker() {
    document.getElementById('decorate').hidden = !ownedIds.length;
    picker.replaceChildren(new Option('家具を選ぶ',''),...ownedIds.map(id => new Option(furnitureNames[id],id)));
    picker.value = selected;
    rotateFurniture.disabled = !selected;
  }
  function loadFurniture(id) {
    const folder = new URL('furniture/Models/',document.baseURI).href;
    new MTLLoader().setPath(folder).loadAsync(id + '.mtl')
      .then(materials => new OBJLoader().setPath(folder).setMaterials(materials).loadAsync(id + '.obj'))
      .then(model => {
        if (!ownedIds.includes(id) || models.has(id)) return;
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        model.position.set(-center.x,-bounds.min.y,-center.z);
        const root = new THREE.Group();
        model.traverse(part => {
          if (part.isMesh) {
            part.castShadow = !id.startsWith('rug');
            part.receiveShadow = true;
          }
        });
        root.add(model);
        root.scale.setScalar(.23);
        models.set(id,root);
        world.add(root);
        applyPose(id);
        draw();
      }).catch(() => {
        hint.textContent = '家具を読み込めませんでした。ページを再読み込みしてください。';
      });
  }
  function place(id, pose) {
    document.dispatchEvent(new CustomEvent('marathon-place-furniture',{detail:{id,pose}}));
  }
  picker.onchange = () => {
    selected = picker.value;
    rotateFurniture.disabled = !selected;
    hint.textContent = selected ? '床をタップして置きます。' : '';
  };
  rotateFurniture.onclick = () => {
    if (!selected) return;
    const [x,z,turns] = savedPoses[selected] || furnitureSlots[selected];
    place(selected,[x,z,(turns + 1) % 4]);
  };
  let pointer;
  surface.addEventListener('pointerdown', event => {
    pointer = event.isPrimary && event.button === 0 ? [event.pointerId,event.clientX,event.clientY] : undefined;
  });
  surface.addEventListener('pointercancel', () => { pointer = undefined; });
  surface.addEventListener('pointerup', event => {
    const tap = pointer;
    pointer = undefined;
    if (!selected || !tap || tap[0] !== event.pointerId || Math.hypot(tap[1]-event.clientX,tap[2]-event.clientY) > 7) return;
    const rect = surface.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),camera);
    const point = ray.ray.intersectPlane(floor,new THREE.Vector3());
    if (!point || Math.abs(point.x) > edge || Math.abs(point.z) > edge) return;
    const [, , turns] = savedPoses[selected] || furnitureSlots[selected];
    place(selected,[THREE.MathUtils.clamp(point.x,-edge+1,edge-1),THREE.MathUtils.clamp(point.z,-edge+1,edge-1),turns]);
  });

  let target = new THREE.Vector3(1.9, 0, .9);
  let time = 0;
  let gait = 0;
  let size = .76;
  let desiredSize = size;
  let heading = .5;
  let lastFrame = null;
  let frame = 0;
  let visible = true;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('catMotion');
  let moving = !motion.matches;
  let following = false;
  const cameraShift = new THREE.Vector3();
  const draw = () => {
    rear.visible = camera.position.z > -edge;
    left.visible = camera.position.x > -edge;
    renderer.render(world, camera);
  };
  const activity = document.getElementById('catActivity');
  const furnitureActions = new Map([
    ['rugRound','roll'], ['rugRounded','roll'],
    ['bedSingle','nap'], ['bedDouble','nap'], ['loungeSofa','nap'],
    ['loungeSofaCorner','nap'], ['benchCushion','nap']
  ]);
  const labels = {walk:'おさんぽ中', groom:'毛づくろい中', roll:'ラグでごろん', nap:'お昼寝中'};
  let action = 'walk';
  let actionTime = 0;
  let outing = 0;
  let nextFurniture = 0;
  let destination;
  const hopRay = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0));

  function setAction(next) {
    if (action !== next || !activity.textContent) activity.textContent = labels[next];
    action = next;
    actionTime = 0;
  }
  function canWalkTo(x,z,ignore) {
    const sx = cat.position.x;
    const sz = cat.position.z;
    return ![...furnitureBounds].some(([id,bounds]) => {
      if (id === ignore) return false;
      const inside = (px,pz) => px >= bounds.min.x && px <= bounds.max.x && pz >= bounds.min.z && pz <= bounds.max.z;
      if (inside(sx,sz)) return inside(x,z);
      for (let i = 1; i <= 16; i++) {
        if (inside(THREE.MathUtils.lerp(sx,x,i/16),THREE.MathUtils.lerp(sz,z,i/16))) return true;
      }
      return false;
    });
  }
  function chooseDestination() {
    const limit = edge - 1.5;
    target.copy(cat.position);
    for (let attempt = 0; attempt < 18; attempt++) {
      const x = (Math.random() * 2 - 1) * limit;
      const z = (Math.random() * 2 - 1) * limit;
      if (Math.hypot(x-cat.position.x,z-cat.position.z) >= 1.7 && canWalkTo(x,z)) {
        target.set(x,0,z);
        break;
      }
    }
  }
  function visitFurniture() {
    const options = [...furnitureActions].filter(([id]) => models.has(id));
    for (let i=0;i<options.length;i++) {
      const [id,kind] = options[nextFurniture++ % options.length];
      const model = models.get(id);
      const x = model.position.x;
      const z = model.position.z;
      if (!canWalkTo(x,z,id)) continue;
      const elevation = kind === 'nap' ? furnitureBounds.get(id)?.max.y || 0 : 0;
      if (kind === 'nap') {
        hopRay.ray.origin.set(x,elevation+1,z);
        const hit = hopRay.intersectObject(model,true)[0];
        if (!hit) continue;
        destination = {id,kind,x,z,height:hit.point.y+.065,angle:model.rotation.y};
      } else destination = {id,kind,x,z,height:.10,angle:heading};
      target.set(x,0,z);
      return true;
    }
    return false;
  }
  function updateCat(dt) {
    time += dt;
    actionTime += dt;
    let walking = false;
    let lift = 0;
    let bob = 0;
    let lean = 0;
    let headTilt = 0;
    let paw = 0;
    let amount = 0;
    if (destination) {
      const model = models.get(destination.id);
      if (!model || model.position.x !== destination.x || model.position.z !== destination.z ||
          (destination.kind === 'nap' && model.rotation.y !== destination.angle)) {
        destination = undefined;
        chooseDestination();
        setAction('walk');
      }
    }
    if (action === 'walk') {
      const dx = target.x - cat.position.x;
      const dz = target.z - cat.position.z;
      const distance = Math.hypot(dx,dz);
      if (distance > .09) {
        const angle = Math.atan2(dx,dz);
        heading += Math.atan2(Math.sin(angle-heading),Math.cos(angle-heading)) * Math.min(1,dt*7);
        const step = Math.min(distance,dt*1.37);
        cat.position.x += dx / distance * step;
        cat.position.z += dz / distance * step;
        gait += dt*12;
        walking = true;
        bob = Math.abs(Math.sin(gait))*.048;
        if (destination?.kind === 'nap') {
          lift = destination.height * THREE.MathUtils.smoothstep(1.2 - distance,0,1.2);
        }
      } else if (destination) {
        setAction(destination.kind);
      } else if (actionTime > .3) {
        setAction('groom');
      }
    }
    if (action !== 'walk') {
      const duration = action === 'nap' ? 6 : action === 'roll' ? 3.3 : 3.1;
      amount = Math.min(1,actionTime*3,(duration-actionTime)*3);
      amount = Math.max(0,amount);
      if (action === 'groom') {
        headTilt = (.28 + Math.sin(actionTime*10)*.15)*amount;
        paw = -1.05*amount;
        bob = -.09*amount;
      } else if (action === 'roll') {
        lean = Math.sin(actionTime*4)*.58*amount;
        lift = destination.height;
        bob = -.16*amount;
      } else {
        lean = .76*amount;
        bob = -.23*amount + Math.sin(actionTime*3)*.022;
        lift = destination.height * Math.min(1,(duration-actionTime)*3);
        heading = destination.angle;
      }
      if (actionTime >= duration) {
        const onFurniture = Boolean(destination);
        destination = undefined;
        setAction('walk');
        outing += 1;
        if (onFurniture || outing % 2 === 0 || !visitFurniture()) chooseDestination();
      }
    }
    cat.position.y = Math.max(0,lift);
    cat.rotation.y = heading;
    body.position.y = bob;
    body.rotation.z = lean;
    head.rotation.x = headTilt;
    head.rotation.y = walking ? 0 : Math.sin(time*1.3)*.11;
    tail.rotation.y = Math.sin(time*(action === 'nap' ? 1.3 : 3.2))*.32;
    legs.forEach((leg,index) => {
      const swing = walking ? Math.sin(gait + (index === 0 || index === 3 ? 0 : Math.PI))*.42 :
        index === 2 ? paw : 0;
      leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x,swing,Math.min(1,dt*16));
    });
    eyes.forEach(eye => { eye.scale.y = action === 'nap' || time % 5 > 4.86 ? .16 : 1; });
  }
  setAction('walk');

  function animate(now) {
    frame = 0;
    const dt = Math.min((now - (lastFrame ?? now)) / 1000, .05);
    lastFrame = now;
    if (moving) updateCat(dt);
    size = moving ? THREE.MathUtils.lerp(size,desiredSize,Math.min(1,dt*5)) : desiredSize;
    if (aura.visible) {
      halo.scale.setScalar(1 + Math.sin(time*4)*.09);
      stars.forEach((star,i) => {
        const angle = i * 2.399 + time * .73;
        const rise = (i * .137 + time * .62) % 1;
        star.position.set(Math.cos(angle)*(1.08-rise*.29),.12+rise*1.92,Math.sin(angle)*(1.08-rise*.29));
        star.scale.setScalar(Math.sin(rise * Math.PI)*1.18+.15);
        star.rotation.y = angle;
      });
    }

    cat.scale.setScalar(size);
    shadow.position.set(cat.position.x,.037,cat.position.z);
    shadow.scale.set(.51*size,.77*size,1);
    if (following) {
      const focusHeight = .65 + Math.max(0, size - 1) * .55;
      cameraShift.set(cat.position.x - orbit.target.x, focusHeight - orbit.target.y, cat.position.z - orbit.target.z);
      camera.position.add(cameraShift);
      orbit.target.add(cameraShift);
    }
    draw();
    if (moving && visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    lastFrame = null;
    animate(performance.now());
  }

  document.addEventListener('marathon-cat-update', ({detail:{xp,index,owned,poses,furniture}}) => {
    applyForm(forms[index], xp);
    savedPoses = poses;
    furniture.forEach(({id,name},i) => {
      furnitureNames[id] = name;
      furnitureSlots[id] ??= outerSlots[i - 4];
    });
    const next = furniture.filter(item => owned[item.id]).map(item => item.id);
    if (next.length !== ownedIds.length || next.some(id => !ownedIds.includes(id))) {
      const previous = ownedIds;
      ownedIds = next;
      for (const id of previous) {
        if (!next.includes(id)) {
          const model = models.get(id);
          if (model) world.remove(model);
          models.delete(id);
          furnitureBounds.delete(id);
          if (destination?.id === id) {
            destination = undefined;
            cat.position.y = 0;
            body.position.y = 0;
            body.rotation.z = 0;
            chooseDestination();
            setAction('walk');
          }
        }
      }
      for (const id of next) if (!previous.includes(id)) loadFurniture(id);
      if (!next.includes(selected)) selected = '';
      updatePicker();
    }
    for (const id of ownedIds) applyPose(id);
    if (!moving || !frame) refresh();
  });
  function updateMotionButton() {
    toggle.textContent = moving ? '動きを止める' : '動かす';
  }
  toggle.onclick = () => {
    moving = !moving;
    updateMotionButton();
    refresh();
  };
  updateMotionButton();
  document.getElementById('catFocus').onclick = () => {
    const distance = 7.4 + Math.max(0, desiredSize - 1) * 3.2;
    const offset = new THREE.Vector3().subVectors(camera.position,orbit.target).setLength(distance);
    orbit.target.set(cat.position.x,.65,cat.position.z);
    camera.position.copy(orbit.target).add(offset);
    following = true;
    orbit.update();
    refresh();
  };
  document.getElementById('catReset').onclick = () => {
    following = false;
    orbit.reset();
  };
  orbit.addEventListener('change', draw);
  sceneBox.append(surface);
  sceneBox.classList.add('room-3d');
  document.getElementById('catControls').hidden = false;
  new ResizeObserver(() => {
    const {clientWidth: width, clientHeight: height} = sceneBox;
    if (!width || !height) return;
    renderer.setSize(width,height,false);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    draw();
  }).observe(sceneBox);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    refresh();
  }).observe(sceneBox);
  document.addEventListener('visibilitychange', refresh);
  document.dispatchEvent(new Event('marathon-cat-ready'));
  refresh();
}
try {
  start();
} catch {
  stageMessage.textContent = 'この端末では3D表示を利用できません。エサをあげると猫は育ちます。';
}
