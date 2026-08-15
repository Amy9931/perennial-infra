// Perennial Infrasolutions LLP - 3D scenes
(function () {
  if (typeof THREE === 'undefined') return;

  /* ============ HERO 3D SCENE ============ */
  var container = document.getElementById('bg3d');
  if (!container) return;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 14, 34);

  var camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 9.5;

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Glow sprite (canvas radial gradient)
  function makeGlow(color) {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, color);
    g.addColorStop(0.4, color.replace('1)', '0.35)'));
    g.addColorStop(1, color.replace('1)', '0)'));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(c);
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    return new THREE.Sprite(mat);
  }

  var coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // Outer wireframe icosahedron
  var coreOuter = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      wireframe: true,
      emissive: 0x1e3a8a,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.5
    })
  );
  coreGroup.add(coreOuter);

  // Mid dodecahedron (rotates opposite)
  var coreMid = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.35, 0),
    new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.55
    })
  );
  coreGroup.add(coreMid);

  // Inner solid golden gem
  var coreInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.78, 0),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xb45309,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2
    })
  );
  coreGroup.add(coreInner);

  // Glow halos
  var glowGold = makeGlow('rgba(212,175,55,0.5)');
  glowGold.scale.set(9, 9, 1);
  coreGroup.add(glowGold);
  var glowBlue = makeGlow('rgba(56,189,248,0.5)');
  glowBlue.scale.set(5, 5, 1);
  coreGroup.add(glowBlue);

  // Orbiting rings
  var ringMats = [];
  function makeRing(radius, tube, color, opacity) {
    var mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: opacity,
      metalness: 0.75,
      roughness: 0.25
    });
    ringMats.push(mat);
    return new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 24, 120), mat);
  }

  var rings = [];
  var r1 = makeRing(3.0, 0.06, 0x38bdf8, 0.75); r1.rotation.x = 1.25; r1.rotation.y = 0.5; rings.push(r1);
  var r2 = makeRing(3.9, 0.035, 0xd4af37, 0.5); r2.rotation.x = 1.5; r2.rotation.y = -0.7; rings.push(r2);
  var r3 = makeRing(4.8, 0.02, 0x8b5cf6, 0.35); r3.rotation.x = 1.1; r3.rotation.y = 1.0; rings.push(r3);
  var r4 = makeRing(5.6, 0.014, 0x34d399, 0.28); r4.rotation.x = 1.75; r4.rotation.y = -0.4; rings.push(r4);
  rings.forEach(function (r) { scene.add(r); });

  // Orbiting satellites (each on its own tilted plane)
  var sats = [];
  var satMats = [];
  var satColors = [0x38bdf8, 0xd4af37, 0x8b5cf6, 0x34d399, 0xf472b6, 0xf59e0b];
  for (var i = 0; i < 14; i++) {
    var size = 0.14 + Math.random() * 0.2;
    var geo = (i % 3 === 0) ? new THREE.OctahedronGeometry(size, 0) :
              (i % 3 === 1) ? new THREE.TetrahedronGeometry(size, 0) :
              new THREE.BoxGeometry(size, size, size);
    var mat = new THREE.MeshStandardMaterial({
      color: satColors[i % satColors.length],
      emissive: satColors[i % satColors.length],
      emissiveIntensity: 0.9,
      metalness: 0.6,
      roughness: 0.3
    });
    satMats.push(mat);
    var sat = new THREE.Mesh(geo, mat);
    var radius = 3.2 + Math.random() * 2.4;
    sat.userData = {
      radius: radius,
      speed: 0.0035 + Math.random() * 0.008,
      angle: Math.random() * Math.PI * 2,
      incline: (Math.random() - 0.5) * 1.2,
      plane: Math.random() * Math.PI * 2,
      cidx: i % satColors.length
    };
    scene.add(sat);
    sats.push(sat);
  }

  // Starfield - two layers
  function makeStars(count, size, opacity) {
    var arr = new Float32Array(count * 3);
    for (var i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 55;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    var mat = new THREE.PointsMaterial({ color: 0x93c5fd, size: size, transparent: true, opacity: opacity });
    var pts = new THREE.Points(geo, mat);
    pts.mat = mat;
    return pts;
  }
  var stars1 = makeStars(1400, 0.05, 0.9);
  var stars2 = makeStars(350, 0.12, 0.6);
  scene.add(stars1); scene.add(stars2);

  // Flowing colorful particle stream (spiral galaxy around the core)
  var streamCount = 700;
  var sp = new Float32Array(streamCount * 3);
  var sc = new Float32Array(streamCount * 3);
  var streamPalette = [0x38bdf8, 0xd4af37, 0x8b5cf6, 0x34d399, 0xf472b6, 0xf59e0b];
  function paintStream() {
    for (var i = 0; i < streamCount; i++) {
      var c = new THREE.Color(streamPalette[i % streamPalette.length]);
      sc[i * 3] = c.r; sc[i * 3 + 1] = c.g; sc[i * 3 + 2] = c.b;
    }
    streamGeo.attributes.color.needsUpdate = true;
  }
  for (var i = 0; i < streamCount; i++) {
    var r = 2.4 + Math.random() * 2.8;
    var a = Math.random() * Math.PI * 2;
    var bob = (Math.random() - 0.5) * 2.2;
    sp[i * 3] = Math.cos(a) * r;
    sp[i * 3 + 1] = bob;
    sp[i * 3 + 2] = Math.sin(a) * r - 1;
  }
  var streamGeo = new THREE.BufferGeometry();
  streamGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  streamGeo.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  var stream = new THREE.Points(streamGeo, new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  scene.add(stream);
  paintStream();

  // Floating wireframe "warehouse grid" platform
  var floorGrid = new THREE.GridHelper(24, 24, 0x2a3a5e, 0x1c2740);
  floorGrid.position.set(0, -4.6, 0);
  scene.add(floorGrid);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  var key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(5, 7, 6);
  scene.add(key);
  var rim = new THREE.PointLight(0x38bdf8, 1.6, 25);
  rim.position.set(-6, -2, 5);
  scene.add(rim);
  var gold = new THREE.PointLight(0xd4af37, 1.3, 25);
  gold.position.set(5, 4, -4);
  scene.add(gold);
  var violet = new THREE.PointLight(0x8b5cf6, 1.0, 22);
  violet.position.set(0, -5, 3);
  scene.add(violet);

  // Interaction
  var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    if (container.clientWidth !== renderer.domElement.width && container.clientWidth > 2) onResize();

    coreOuter.rotation.y = t * 0.25;
    coreOuter.rotation.x = t * 0.12;
    coreMid.rotation.y = -t * 0.5;
    coreMid.rotation.x = t * 0.35;
    coreMid.rotation.z = t * 0.18;
    coreInner.rotation.y = t * 0.7;
    coreInner.rotation.x = t * 0.45;
    coreInner.scale.setScalar(1 + Math.sin(t * 2) * 0.08);

    glowGold.material.opacity = 0.35 + Math.sin(t * 1.6) * 0.12;
    glowBlue.material.opacity = 0.3 + Math.cos(t * 2.2) * 0.1;

    r1.rotation.z = t * 0.32;
    r2.rotation.z = -t * 0.24;
    r3.rotation.z = t * 0.18;
    r4.rotation.z = -t * 0.12;

    sats.forEach(function (sat) {
      var u = sat.userData;
      u.angle += u.speed;
      sat.position.x = Math.cos(u.angle) * u.radius;
      sat.position.y = Math.sin(u.angle + u.plane) * u.radius * 0.35;
      sat.position.z = Math.sin(u.angle) * u.radius - 1;
      sat.rotation.x += 0.02;
      sat.rotation.y += 0.03;
      sat.rotation.z += 0.01;
    });

    stars1.rotation.y = t * 0.008;
    stars2.rotation.y = -t * 0.012;
    stars1.rotation.x = Math.sin(t * 0.05) * 0.05;
    stream.rotation.y = t * 0.16;
    stream.rotation.x = Math.sin(t * 0.35) * 0.08;
    floorGrid.rotation.y = t * 0.03;

    targetX += (mouseX - targetX) * 0.045;
    targetY += (mouseY - targetY) * 0.045;
    camera.position.x = targetX * 1.3;
    camera.position.y = targetY * 1.0;
    camera.lookAt(0, 0, -1.5);

    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onResize);

  // Fade the hero scene out as user scrolls
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset;
    var opacity = Math.max(0, 1 - y / (window.innerHeight * 0.75));
    container.style.opacity = opacity;
  });

  // Theme sync — recolors the whole 3D hero
  var THEME_COLORS = {
    nebula:   { main: 0x38bdf8, gold: 0xd4af37, violet: 0x8b5cf6, green: 0x34d399, pink: 0xf472b6, orange: 0xf59e0b },
    ocean:    { main: 0x22d3ee, gold: 0x67e8f9, violet: 0x3b82f6, green: 0x5eead4, pink: 0x38bdf8, orange: 0x2dd4bf },
    sunset:   { main: 0xfb923c, gold: 0xfbbf24, violet: 0xf43f5e, green: 0xfb7185, pink: 0xf472b6, orange: 0xf97316 },
    emerald:  { main: 0x34d399, gold: 0xfcd34d, violet: 0x2dd4bf, green: 0x6ee7b7, pink: 0x4ade80, orange: 0x10b981 },
    rose:     { main: 0xf472b6, gold: 0xfda4af, violet: 0xc084fc, green: 0xf9a8d4, pink: 0xf472b6, orange: 0xfb7185 }
  };
  function applyTheme(name) {
    var a = THEME_COLORS[name] || THEME_COLORS.nebula;
    coreOuter.material.color.setHex(a.main);
    coreOuter.material.emissive.setHex(a.main);
    coreMid.material.color.setHex(a.violet);
    coreMid.material.emissive.setHex(a.violet);
    coreInner.material.color.setHex(a.gold);
    coreInner.material.emissive.setHex(a.gold);
    var ringColors = [a.main, a.gold, a.violet, a.green];
    ringMats.forEach(function (m, idx) {
      var c = ringColors[idx % ringColors.length];
      m.color.setHex(c);
      m.emissive.setHex(c);
    });
    var satPalette = [a.main, a.gold, a.violet, a.green, a.pink, a.orange];
    satMats.forEach(function (m, idx) {
      var c = satPalette[idx % satPalette.length];
      m.color.setHex(c);
      m.emissive.setHex(c);
    });
    streamPalette = [a.main, a.gold, a.violet, a.green, a.pink, a.orange];
    paintStream();
    stars1.mat.color.setHex(a.main);
    stars2.mat.color.setHex(a.violet);
    rim.color.setHex(a.main);
    gold.color.setHex(a.gold);
    violet.color.setHex(a.violet);
  }
  if (!window.__perennialThemeHooks) window.__perennialThemeHooks = [];
  window.__perennialThemeHooks.push(applyTheme);
  window.THEME_PALETTE = THEME_COLORS;
})();

/* ============ CITY + ROAD 3D SCENE (theme: city) ============ */
(function () {
  var container = document.getElementById('bg3dCity');
  if (typeof THREE === 'undefined' || !container) return;
  try {

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x05070d, 22, 50);

  var camera = new THREE.PerspectiveCamera(62, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 3.0, 5.4);
  camera.lookAt(0, 0.5, -14);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  function fitScene() {
    var w = container.clientWidth || window.innerWidth;
    var h = container.clientHeight || window.innerHeight;
    if (w < 2 || h < 2) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  fitScene();

  // Building window texture (canvas)
  function buildingTexture(base, lit) {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 128, 256);
    for (var row = 0; row < 14; row++) {
      for (var col = 0; col < 4; col++) {
        var litWin = Math.random() > 0.45;
        if (!litWin) continue;
        ctx.fillStyle = lit;
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillRect(8 + col * 30, 10 + row * 17, 16, 10);
      }
    }
    ctx.globalAlpha = 1;
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  function makeBuilding(x, z, w, h, d, base, lit) {
    var tex = buildingTexture(base, lit);
    var mat = new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: lit,
      emissiveIntensity: 1.3,
      roughness: 0.85,
      metalness: 0.1
    });
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);
    return mesh;
  }

  var buildingBase = [
    [0x0f1630, 0x3b82f6], [0x101b3c, 0xfbbf24], [0x0d1428, 0x34d399],
    [0x131a36, 0xf472b6], [0x0c1224, 0x38bdf8], [0x151d3d, 0xfb923c]
  ];
  // Buildings - left side
  for (var i = 0; i < 5; i++) {
    var c = buildingBase[i % buildingBase.length];
    makeBuilding(-3.0 - i * 0.12, -3 - i * 3.2, 1.9 + Math.random() * 0.5, 3 + Math.random() * 4.5, 1.9, c[0], c[1]);
  }
  // Buildings - right side
  for (var j = 0; j < 5; j++) {
    var c2 = buildingBase[(j + 2) % buildingBase.length];
    makeBuilding(3.0 + j * 0.12, -3.5 - j * 3.4, 1.9 + Math.random() * 0.5, 2.5 + Math.random() * 5, 1.9, c2[0], c2[1]);
  }

  // Ground / road
  var roadTex = document.createElement('canvas');
  roadTex.width = 128; roadTex.height = 256;
  var rctx = roadTex.getContext('2d');
  rctx.fillStyle = '#151823';
  rctx.fillRect(0, 0, 128, 256);
  rctx.fillStyle = '#f5c531';
  for (var li = 0; li < 10; li++) {
    rctx.fillRect(60, 12 + li * 26, 8, 13);
  }
  var roadTexture = new THREE.CanvasTexture(roadTex);
  roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, 8);
  roadTexture.minFilter = THREE.LinearFilter;

  var road = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 90),
    new THREE.MeshStandardMaterial({ map: roadTexture, roughness: 0.9, metalness: 0.1, color: 0xffffff })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -25);
  scene.add(road);

  var groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 1 });
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -18);
  scene.add(ground);

  // Street lights
  function streetLight(x, z) {
    var poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a, metalness: 0.8, roughness: 0.4 });
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), poleMat);
    pole.position.set(x, 1.3, z);
    scene.add(pole);
    var head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.24), new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xfbbf24, emissiveIntensity: 2 }));
    head.position.set(x, 2.64, z);
    scene.add(head);
    var lamp = new THREE.PointLight(0xfbbf24, 1.0, 9);
    lamp.position.set(x, 2.6, z);
    scene.add(lamp);
  }
  streetLight(-2.7, -3); streetLight(2.7, -3);
  streetLight(-2.7, -10); streetLight(2.7, -10);
  streetLight(-2.7, -17); streetLight(2.7, -17);

  // Vehicles (trucks + cars) driving along the road
  var vehicles = [];
  function makeVehicle(color, isTruck) {
    var g = new THREE.Group();
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(isTruck ? 0.8 : 0.55, isTruck ? 0.7 : 0.4, isTruck ? 1.7 : 1.1),
      new THREE.MeshStandardMaterial({ color: color, metalness: 0.7, roughness: 0.35, emissive: color, emissiveIntensity: 0.15 })
    );
    body.position.y = 0.35;
    g.add(body);
    var cab = new THREE.Mesh(
      new THREE.BoxGeometry(isTruck ? 0.8 : 0.55, isTruck ? 0.5 : 0.35, isTruck ? 0.6 : 0.6),
      new THREE.MeshStandardMaterial({ color: 0x11141c, metalness: 0.6, roughness: 0.4 })
    );
    cab.position.set(0, isTruck ? 0.85 : 0.5, isTruck ? 0.95 : 0.5);
    g.add(cab);
    var hl = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xfff7d6, emissive: 0xfde68a, emissiveIntensity: 2 })
    );
    hl.position.set(0, 0.35, isTruck ? 1.0 : 0.6);
    g.add(hl);
    scene.add(g);
    return g;
  }

  var vehicleColors = [0x38bdf8, 0xd4af37, 0xf472b6, 0x34d399, 0xf59e0b, 0x8b5cf6];
  for (var v = 0; v < 8; v++) {
    var truck = v % 3 === 0;
    var veh = makeVehicle(vehicleColors[v % vehicleColors.length], truck);
    veh.userData = {
      lane: (v % 2 === 0) ? -0.55 : 0.55,
      speed: 0.045 + Math.random() * 0.07,
      z: 6 + Math.random() * 26,
      heading: (v % 2 === 0) ? 1 : -1
    };
    veh.rotation.y = veh.userData.heading > 0 ? Math.PI : 0;
    vehicles.push(veh);
  }

  // Lights
  scene.add(new THREE.AmbientLight(0x475569, 0.9));
  var dir = new THREE.DirectionalLight(0xbae6fd, 0.65);
  dir.position.set(4, 8, 2);
  scene.add(dir);
  scene.add(new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.6));

  var clock = new THREE.Clock();
  var mouseX = 0, mouseY = 0, tx = 0, ty = 0;
  container.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    if (container.clientWidth !== renderer.domElement.width && container.clientWidth > 2) fitScene();

    vehicles.forEach(function (veh) {
      veh.position.z += veh.userData.speed * veh.userData.heading;
      veh.position.x = veh.userData.lane;
      if (veh.userData.heading > 0 && veh.position.z > 8) veh.position.z = -30;
      if (veh.userData.heading < 0 && veh.position.z < -30) veh.position.z = 8;
    });

    roadTexture.offset.y -= 0.0016 * 60 / 60;
    roadTexture.offset.y = roadTexture.offset.y % 1;

    tx += (mouseX - tx) * 0.05;
    ty += (mouseY - ty) * 0.05;
    camera.position.x = tx * 0.8;
    camera.position.y = 3.4 - ty * 0.4;
    camera.lookAt(0, 0.6, -12);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', fitScene);

  // Fade out on scroll, same as hero
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset;
    container.style.opacity = Math.max(0, 1 - y / (window.innerHeight * 0.75));
  });
  } catch (e) {
    container.textContent = 'City 3D error: ' + e.message;
    container.style.cssText = 'display:flex;align-items:center;justify-content:center;color:#f87171;font-size:14px;padding:20px';
  }
})();

/* ============ ABOUT 3D SCENE (drag to rotate) ============ */
(function () {
  var el = document.getElementById('about3d');
  if (typeof THREE === 'undefined' || !el) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100);
  camera.position.set(5, 4, 6.5);
  camera.lookAt(0, 0.2, 0);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var d = new THREE.DirectionalLight(0xffffff, 1.1);
  d.position.set(5, 8, 5);
  scene.add(d);
  var p = new THREE.PointLight(0x38bdf8, 1.3, 20);
  p.position.set(-4, 2, 3);
  scene.add(p);

  // Grid floor
  var grid = new THREE.GridHelper(10, 16, 0x2a3a5e, 0x1c2740);
  grid.position.y = -1.6;
  scene.add(grid);

  // Industrial storage tanks (cylinders) of varying heights
  var tankGroup = new THREE.Group();
  scene.add(tankGroup);

  var tanks = [];
  var tankMats = [];
  var tankData = [
    { x: -1.7, r: 0.34, h: 1.1, color: 0xd4af37 },
    { x: -0.75, r: 0.44, h: 1.6, color: 0x38bdf8 },
    { x: 0.45, r: 0.38, h: 1.3, color: 0xf59e0b },
    { x: 1.45, r: 0.52, h: 2.1, color: 0x8b5cf6 },
    { x: 2.55, r: 0.3, h: 0.95, color: 0x34d399 }
  ];
  for (var i = 0; i < tankData.length; i++) {
    var td = tankData[i];
    var tMat = new THREE.MeshStandardMaterial({ color: td.color, metalness: 0.75, roughness: 0.3, emissive: td.color, emissiveIntensity: 0.22 });
    tankMats.push(tMat);
    var t = new THREE.Mesh(new THREE.CylinderGeometry(td.r, td.r, 1, 28), tMat);
    t.position.set(td.x, -1.55 + 0.5, 0);
    t.scale.y = 0.02;
    t.userData.target = td.h;
    tankGroup.add(t);
    tanks.push(t);
  }

  // Pipeline connecting tanks
  var pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 4.6, 12),
    new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0xd4af37, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 })
  );
  pipe.rotation.z = Math.PI / 2;
  pipe.position.y = -1.0;
  tankGroup.add(pipe);

  var grown = false;
  var clock = new THREE.Clock();

  // Drag to rotate
  var dragging = false;
  var prevX = 0, prevY = 0;
  var rotY = 0, rotX = 0;

  el.addEventListener('pointerdown', function (e) {
    dragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    rotY += (e.clientX - prevX) * 0.01;
    rotX += (e.clientY - prevY) * 0.005;
    rotX = Math.max(-0.6, Math.min(0.6, rotX));
    prevX = e.clientX; prevY = e.clientY;
  });
  window.addEventListener('pointerup', function () { dragging = false; });

  var mouseX = 0, mouseY = 0, tx = 0, ty = 0;
  el.addEventListener('mousemove', function (e) {
    var r = el.getBoundingClientRect();
    mouseX = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseY = -((e.clientY - r.top) / r.height) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    // Tanks rise up once when scrolled into view
    var rect = el.getBoundingClientRect();
    var grow = rect.top < window.innerHeight && rect.bottom > 0;

    tanks.forEach(function (tank, idx) {
      var s = tank.scale.y;
      if (grown) s = 1;
      else if (grow) {
        s += (1 - s) * 0.05;
        if (idx === tanks.length - 1 && Math.abs(s - 1) < 0.02) grown = true;
      }
      tank.scale.y = s;
      tank.position.y = -1.55 + 0.5 * s;
      tank.rotation.y = t * 0.12 + idx * 0.3;
    });

    pipe.position.x = Math.sin(t * 0.6) * 0.15;

    // Auto-rotate gently when not dragging
    if (!dragging) rotY += 0.0018;

    tankGroup.rotation.y = rotY;
    tankGroup.rotation.x = rotX;

    tx += (mouseX - tx) * 0.05;
    ty += (mouseY - ty) * 0.05;
    camera.position.x = 5 + tx * 1.2;
    camera.position.y = 4 - ty * 0.8;
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function () {
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  });

  // Theme sync for the About scene
  function applyAboutTheme(name) {
    var c = (typeof THEME_PALETTE !== 'undefined' && THEME_PALETTE[name]) ? THEME_PALETTE[name] : { gold: 0xd4af37, main: 0x38bdf8, orange: 0xf59e0b, violet: 0x8b5cf6, green: 0x34d399 };
    var order = [c.gold, c.main, c.orange, c.violet, c.green];
    tankMats.forEach(function (m, idx) {
      var col = order[idx % order.length];
      m.color.setHex(col);
      m.emissive.setHex(col);
    });
    pipe.material.color.setHex(c.gold);
    pipe.material.emissive.setHex(c.gold);
    p.color.setHex(c.main);
  }
  window.__perennialThemeHooks.push(applyAboutTheme);
})();
