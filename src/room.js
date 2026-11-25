import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const sceneBox = document.getElementById('scene');
const stageMessage = document.getElementById('roomMode');

function start() {
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  const surface = renderer.domElement;
  surface.setAttribute('role', 'img');
  surface.setAttribute('aria-label', '猫が歩き回る3Dの部屋');
  const world = new THREE.Scene();
  world.background = new THREE.Color('#d9eddf');
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 100);
  camera.position.set(9, 7, 11);
  const orbit = new OrbitControls(camera, surface);
  orbit.target.set(0, .35, 0);
  orbit.enablePan = false;
  orbit.minDistance = 7;
  orbit.maxDistance = 24;
  orbit.minPolarAngle = .3;
  orbit.maxPolarAngle = 1.34;
  orbit.update();
  orbit.saveState();
  world.add(new THREE.HemisphereLight('#fff9ec', '#b3b4b0', 2.1));
  const sun = new THREE.DirectionalLight('#fff4dd', 2);
  sun.position.set(4, 8, 5);
  world.add(sun);

  function mesh(parent, geometry, color, x, y, z) {
    const part = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color, roughness: .88}));
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

  box(world, '#9d674b', 0, -.18, 0, 8.6, .28, 8.6);
  for (let i = 0; i < 12; i++) {
    box(world, i % 2 ? '#e3b287' : '#edbf96', 0, -.027, (i - 5.5) * .7, 8.4, .05, .696);
  }
  const rear = new THREE.Group();
  const left = new THREE.Group();
  world.add(rear, left);
  box(rear, '#fff0d9', 0, 1.38, -4.2, 8.4, 2.76, .15);
  box(left, '#f1d4af', -4.2, 1.38, 0, .15, 2.76, 8.4);
  box(rear, '#cb9673', 0, .11, -4.09, 8.4, .22, .09);
  box(left, '#cb9673', -4.09, .11, 0, .09, .22, 8.4);
  box(rear, '#a6dfe5', .6, 1.65, -4.105, 2.5, 1.43, .1);
  for (const x of [-.65, .6, 1.85]) box(rear, '#faf5e3', x, 1.65, -4.03, .08, 1.51, .09);
  for (const y of [.91, 1.65, 2.39]) box(rear, '#faf5e3', .6, y, -4.03, 2.56, .08, .09);
  oval(world, '#679d8d', 0, .006, .48, 2.6, .018, 1.9);
  oval(world, '#8fb9a7', 0, .012, .48, 2.43, .018, 1.73);

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 36),
    new THREE.MeshBasicMaterial({color: '#654636', opacity: .19, transparent: true, depthWrite: false}));
  shadow.rotation.x = -Math.PI / 2;
  world.add(shadow);
  const cat = new THREE.Group();
  const body = new THREE.Group();
  world.add(cat);
  cat.add(body);
  const ginger = '#df8645';
  const stripe = '#a94f2b';
  const cream = '#fff2d9';
  oval(body, ginger, 0, .59, -.18, .37, .35, .65);
  oval(body, cream, 0, .44, .27, .29, .25, .27);
  const head = new THREE.Group();
  head.position.set(0, .93, .47);
  body.add(head);
  oval(head, ginger, 0, 0, 0, .46, .39, .37);
  const eyes = [];
  for (const side of [-1, 1]) {
    const ear = mesh(head, new THREE.ConeGeometry(.19, .43, 4), ginger, side * .28, .34, -.045);
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
  for (const z of [-.55, .23]) {
    for (const side of [-1, 1]) {
      const joint = new THREE.Group();
      joint.position.set(side * .24, .45, z);
      body.add(joint);
      oval(joint, ginger, 0, -.16, 0, .108, .23, .12);
      oval(joint, cream, 0, -.345, .04, .12, .084, .154);
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
  mesh(tail, new THREE.TubeGeometry(curve, 20, .074, 10, false), ginger, 0, 0, 0);
  const tip = curve.getPoint(1);
  oval(tail, cream, tip.x, tip.y, tip.z, .078, .078, .078);

  let target = new THREE.Vector3(1.9, 0, .9);
  let pause = 0;
  let time = 0;
  let gait = 0;
  let size = .74;
  let desiredSize = size;
  let heading = .5;
  let lastFrame = null;
  let frame = 0;
  let visible = true;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('catMotion');
  let moving = !motion.matches;
  const draw = () => {
    rear.visible = camera.position.z > -4;
    left.visible = camera.position.x > -4;
    renderer.render(world, camera);
  };
  function animate(now) {
    frame = 0;
    const dt = Math.min((now - (lastFrame ?? now)) / 1000, .05);
    lastFrame = now;
    if (moving) {
      time += dt;
      const dx = target.x - cat.position.x;
      const dz = target.z - cat.position.z;
      const distance = Math.hypot(dx,dz);
      let walking = 0;
      if (distance > .1) {
        const angle = Math.atan2(dx,dz);
        heading += Math.atan2(Math.sin(angle-heading), Math.cos(angle-heading)) * Math.min(1,dt*6);
        const step = Math.min(distance,dt*.97);
        cat.position.x += Math.sin(heading) * step;
        cat.position.z += Math.cos(heading) * step;
        gait += dt * 10;
        walking = 1;
      } else {
        pause += dt;
        if (pause > 1.35) {
          const x = (Math.random() - .5) * 5;
          const z = (Math.random() - .5) * 5;
          if (Math.hypot(x - cat.position.x, z - cat.position.z) > 1.4) {
            target.set(x,0,z);
            pause = 0;
          }
        }
      }
      cat.rotation.y = heading;
      legs.forEach((leg, index) => {
        const swing = Math.sin(gait + ([0,3].includes(index) ? 0 : Math.PI)) * .42 * walking;
        leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x,swing,Math.min(1,dt*16));
      });
      body.position.y = Math.abs(Math.sin(gait)) * .048 * walking;
      tail.rotation.y = Math.sin(time * 3.2) * .32;
      head.rotation.y = Math.sin(time * 1.3) * .13 * (1-walking);
      eyes.forEach(eye => { eye.scale.y = time % 5 > 4.86 ? .16 : 1; });
    }
    size = moving ? THREE.MathUtils.lerp(size,desiredSize,Math.min(1,dt*5)) : desiredSize;
    cat.scale.setScalar(size);
    shadow.position.set(cat.position.x,.037,cat.position.z);
    shadow.scale.set(.51*size,.77*size,1);
    draw();
    if (moving && visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    lastFrame = null;
    animate(performance.now());
  }

  document.addEventListener('marathon-cat-update', ({detail: laps}) => {
    desiredSize = .74 + .81 * (laps / (laps + 23));
    if (!moving || !frame) refresh();
  });
  function updateMotionButton() {
    toggle.textContent = moving ? '動きを止める' : '歩かせる';
  }
  toggle.onclick = () => {
    moving = !moving;
    updateMotionButton();
    refresh();
  };
  updateMotionButton();
  document.getElementById('catReset').onclick = () => orbit.reset();
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
  stageMessage.textContent = 'この端末では3D表示を利用できません。周回を記録すると猫は育ちます。';
}
