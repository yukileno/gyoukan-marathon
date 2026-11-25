import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const sceneBox = document.getElementById('scene');
const tools = document.getElementById('layoutTools');
const picker = document.getElementById('layoutFurniture');
const turn = document.getElementById('layoutTurn');
const message = document.getElementById('layoutMessage');
const defaultSlots = [
  [-3.7,-3.7], [3.7,-3.7], [1.25,-1.1], [-3.8,0],
  [-1.4,-3.15], [0.05,-0.7], [1.5,-3.8], [1.8,3.6],
  [3.55,0.85], [-3.1,2.55], [-0.65,3.65], [3.75,3.7]
];
const placementKey = 'gyoukan-marathon-layout-v1';
let layouts = {};
try {
  const saved = JSON.parse(localStorage.getItem(placementKey) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) layouts = saved;
} catch {
  message.textContent = '配置を読み込めませんでした。';
}

function start() {
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const world = new THREE.Scene();
  world.background = new THREE.Color('#dcefe9');
  const view = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  view.position.set(12, 11, 14);
  const orbit = new OrbitControls(view, renderer.domElement);
  orbit.target.set(0, .65, 0);
  orbit.minDistance = 11;
  orbit.maxDistance = 30;
  orbit.minPolarAngle = .25;
  orbit.maxPolarAngle = 1.26;
  orbit.enablePan = false;
  world.add(new THREE.HemisphereLight('#fff8ee', '#92aaa1', 2.1));
  const sun = new THREE.DirectionalLight('#fff4dc', 2);
  sun.position.set(4, 8, 2);
  world.add(sun);

  function box(w,h,d,color,x,y,z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({color}));
    mesh.position.set(x,y,z);
    world.add(mesh);
    return mesh;
  }
  box(10.2,.35,10.2,'#9e6446',0,-.19,0);
  for (let i = 0; i < 12; i++) {
    box(10,.07,.83,i % 2 ? '#deb28b' : '#e6bb96',0,-.035,(i - 5.5) * .833);
  }
  const rear = box(10,2.7,.15,'#ffe3bd',0,1.35,-5);
  const left = box(.15,2.7,10,'#f4d1a6',-5,1.35,0);
  const floor = new THREE.Plane(new THREE.Vector3(0,1,0),0);
  const ray = new THREE.Raycaster();
  const indicator = new THREE.Mesh(new THREE.RingGeometry(.38,.46,36),
    new THREE.MeshBasicMaterial({color:'#18805e',side:THREE.DoubleSide}));
  indicator.rotation.x = -Math.PI / 2;
  world.add(indicator);

  const cache = new Map();
  const pieces = new THREE.Group();
  world.add(pieces);
  let current = {index: 0, items: []};
  let selected = '';
  let generation = 0;

  function render() {
    rear.visible = view.position.z > -5;
    left.visible = view.position.x > -5;
    const model = pieces.children.find(piece => piece.name === selected);
    indicator.visible = Boolean(model);
    if (model) indicator.position.set(model.position.x,.012,model.position.z);
    renderer.render(world, view);
  }
  orbit.addEventListener('change', render);

  function loadModel(key) {
    if (!cache.has(key)) {
      const folder = new URL('furniture/Models/', document.baseURI).href;
      const promise = new MTLLoader().setPath(folder).loadAsync(key + '.mtl').then(materials => {
        materials.preload();
        return new OBJLoader().setPath(folder).setMaterials(materials).loadAsync(key + '.obj');
      }).then(model => {
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -bounds.min.y, -center.z);
        const root = new THREE.Group();
        root.add(model);
        root.scale.setScalar(.25);
        return root;
      }).catch(error => {
        cache.delete(key);
        throw error;
      });
      cache.set(key,promise);
    }
    return cache.get(key);
  }

  function placement(key, index) {
    const saved = layouts[current.index + '/' + key];
    if (Array.isArray(saved) && saved.length === 3 && saved.every(Number.isFinite)) {
      return [THREE.MathUtils.clamp(saved[0],-4,4),THREE.MathUtils.clamp(saved[1],-4,4),saved[2] % 4];
    }
    return [...defaultSlots[index],0];
  }
  function apply(model, pose) {
    const [x,z,quarterTurns] = pose;
    model.position.set(x,0,z);
    model.rotation.y = quarterTurns * Math.PI / 2;
  }
  function selection(key) {
    selected = key;
    picker.value = key;
    const enabled = pieces.children.some(piece => piece.name === key);
    turn.disabled = !enabled;
    message.textContent = enabled ? '床をクリック・タップして、選んだ家具を置きます。' : '';
    render();
  }
  function save(model, pose) {
    const next = {...layouts, [current.index + '/' + model.name]:pose};
    try {
      localStorage.setItem(placementKey, JSON.stringify(next));
      layouts = next;
      apply(model,pose);
      message.textContent = '配置を保存しました。';
      render();
    } catch {
      message.textContent = '配置を保存できませんでした。';
    }
  }
  picker.addEventListener('change', () => selection(picker.value));
  turn.addEventListener('click', () => {
    const model = pieces.children.find(piece => piece.name === selected);
    if (model) save(model,[model.position.x,model.position.z,(Math.round(model.rotation.y / (Math.PI / 2)) + 1) % 4]);
  });

  let press;
  renderer.domElement.addEventListener('pointerdown', event => {
    press = event.isPrimary && event.button === 0 ? [event.pointerId,event.clientX,event.clientY] : undefined;
  });
  renderer.domElement.addEventListener('pointercancel', () => { press = undefined; });
  renderer.domElement.addEventListener('pointerup', event => {
    const tap = press;
    press = undefined;
    if (!tap || tap[0] !== event.pointerId || Math.hypot(tap[1]-event.clientX,tap[2]-event.clientY) > 7) return;
    const rect = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),view);
    const model = pieces.children.find(piece => piece.name === selected);
    const target = ray.ray.intersectPlane(floor,new THREE.Vector3());
    if (model && target && Math.abs(target.x) <= 5 && Math.abs(target.z) <= 5) {
      save(model,[THREE.MathUtils.clamp(target.x,-4,4),THREE.MathUtils.clamp(target.z,-4,4),Math.round(model.rotation.y / (Math.PI / 2))]);
    } else if (!selected) {
      const hit = ray.intersectObjects(pieces.children,true)[0];
      if (hit) {
        let piece = hit.object;
        while (piece.parent !== pieces) piece = piece.parent;
        selection(piece.name);
      }
    }
  });
  document.getElementById('layoutReset').addEventListener('click', () => orbit.reset());
  sceneBox.append(renderer.domElement);
  sceneBox.classList.add('room-3d');
  tools.hidden = false;
  new ResizeObserver(() => {
    const {clientWidth:w,clientHeight:h} = sceneBox;
    if (!w || !h) return;
    renderer.setSize(w,h,false);
    view.aspect = w / h;
    view.updateProjectionMatrix();
    render();
  }).observe(sceneBox);

  document.addEventListener('marathon-room-update', async ({detail}) => {
    if (detail.index === current.index && detail.items.length === current.items.length && generation) return;
    const request = ++generation;
    const previouslySelected = detail.index === current.index ? selected : '';
    current = detail;
    pieces.clear();
    picker.replaceChildren(new Option('家具を選ぶ',''), ...detail.items.map(([key,name]) => new Option(name,key)));
    selection('');
    try {
      const models = await Promise.all(detail.items.map(([key]) => loadModel(key)));
      if (request !== generation) return;
      models.forEach((original,index) => {
        const [key] = detail.items[index];
        const model = original.clone();
        model.name = key;
        apply(model,placement(key,index));
        pieces.add(model);
      });
      selection(detail.items.some(([key]) => key === previouslySelected) ? previouslySelected : '');
    } catch {
      if (request !== generation) return;
      generation = 0;
      message.textContent = '家具を読み込めませんでした。ページを再読み込みしてください。';
    }
  });
  document.dispatchEvent(new Event('marathon-room-ready'));
}

try {
  start();
} catch {
  document.getElementById('roomMode').textContent = 'この端末では2Dで表示しています。';
}
