import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import anime from "animejs/lib/anime.es.js";
import gsap from "gsap";
import pub_dat from "./publications.json"


// menu icon
const menu_button = document.querySelector("#menu_icon")
menu_button.addEventListener("click", () => {
  const nav_lst = document.querySelector(".topnav ul")
  if (nav_lst.style.display == "none") {
    nav_lst.style.display = "flex"
  } else {
    nav_lst.style.display = "none"
  }
})
// list publications
const pub_content = document.querySelector("#pub_content")
pub_dat.forEach((pub, index) => {
  // add item to html
  pub_content.insertAdjacentHTML("beforeend", 
  `<div class="pub_item" id="pub_item_${index}">
  <h4 class=pub_title>${pub.title}</h4> 
  <p class=pub_journal>${pub.year}, ${pub.journal}</p>
  <p class=pub_auth><i>${pub.author}</i></p>
  </div>`)

  // add URL link to each item
  document.querySelector(`#pub_item_${index}`).addEventListener("click", () => {
    window.open(pub.url)
  })
})    

let desk_div_shrink = false;


const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
  document.querySelector(".loader").style.display = "flex"
	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
loadingManager.onLoad = function() {
  document.querySelector(".loader").style.display = "none"
};
loadingManager.onError = function() {
  console.error(`error loading: ${url}`)
}

const loader = new GLTFLoader(loadingManager);
const scene = new THREE.Scene();
const animation_time = 1;
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / (window.innerHeight-53.333),
  0.1,
  1000
);
const renderer = new THREE.WebGL1Renderer({
  alpha: true,
  canvas: document.querySelector("#canvas_3d"),
});
renderer.outputEncoding = THREE.sRGBEncoding;

let dna;


loader.load(
  "./desktop3_bake.glb",
  function (gltf) {
    dna = gltf.scene;
    scene.add(dna);
    console.log(dna);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

// create a testing dot
const dotGeometry = new THREE.BufferGeometry();
dotGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array([-2.5, -2, 2.5]), 3)
);
const dotMaterial = new THREE.PointsMaterial({ size: 0.1, color: "red" });
const dot = new THREE.Points(dotGeometry, dotMaterial);
scene.add(dot);

// create a second testing dot
const dotGeometry2 = new THREE.BufferGeometry();
dotGeometry2.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array([-2.5, 2, 2.5]), 3)
);
const dotMaterial2 = new THREE.PointsMaterial({ size: 0.1, color: "blue" });
const dot2 = new THREE.Points(dotGeometry2, dotMaterial2);
scene.add(dot2);

const controls = new OrbitControls(camera, renderer.domElement)
const light = new THREE.DirectionalLight(0xffffff, 3); // soft white light
light.position.set(3, 3, 7);
let start_position = {x:0, y:3, z:10}
if (window.innerWidth <= 768) {
  start_position = {x:0, y:3, z:20}
}
scene.add(light); 

camera.position.set(start_position.x, start_position.y, start_position.z)
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight - 53.333);
camera.lookAt(0, 0, 0);
let cur_cameraLookAt = { x: 0, y: 0, z: 0 };
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function getLateralPos(objx, objy, objz, camx0, camy0, camz0, lux, luy, luz) {
  const obj_cam_dist = sqrt((objx - camx0)^2 + (objy - camy0)^2 + (objz - camz0)^2)
  const vert_vec = {x: objx - camx0, y: objy - camy0, z:objz - camz0}
  const d = -1 * (vert_vect.x * camx0 + vert_vect.y * camy0 + vert_vect.z * camz0 )
}

function moveCameraTo(x, y, z) {
  gsap.to(camera.position, {
    x: x,
    y: y,
    z: z,
    duration: animation_time,
  });
}

function lookCameraAT(x1, y1, z1, x2, y2, z2) {
  let cur_pos = {
    x1: cur_cameraLookAt.x,
    y1: cur_cameraLookAt.y,
    z1: cur_cameraLookAt.z,
    x2: camera.up.x,
    y2: camera.up.y,
    z2: camera.up.z,
  };
  gsap.to(cur_pos, {
    x1: x1,
    y1: y1,
    z1: z1,
    x2: x2,
    y2: y2,
    z2: z2,
    duration: animation_time,
    onUpdate: function () {
      camera.lookAt(cur_pos.x1, cur_pos.y1, cur_pos.z1);
      camera.up.set(cur_pos.x2, cur_pos.y2, cur_pos.z2);
    },
    onComplete: function () {
      cur_cameraLookAt = { x: x1, y: y1, z: z1 };
    },
  });
}

function hideAllTabs() {
  document.querySelector("#content_col").style.display = "none"
}

function shrinkDeskDiv() {
  const desk_div = document.querySelector("#desktop_col")
  let cur_render_size = new THREE.Vector2
  renderer.getSize(cur_render_size)
  let div_size = {width: desk_div.offsetWidth, height: desk_div.offsetHeight}
  gsap.to(cur_render_size, {
    x: div_size.width,
    y: div_size.height,
    duration: 2,
    onUpdate: function() {
      camera.aspect = cur_render_size.x/cur_render_size.y
      camera.updateProjectionMatrix()
      renderer.setSize(cur_render_size.x, cur_render_size.y)
      renderer.render(scene, camera);
    }
  })
  desk_div_shrink = true
}

function expandDeskDiv() {
  let cur_render_size = new THREE.Vector2
  renderer.getSize(cur_render_size)
  gsap.to(cur_render_size, {
    x: window.innerWidth,
    y: window.innerHeight - 53.333,
    duration: animation_time,
    onUpdate: function() {
      camera.aspect = cur_render_size.x/cur_render_size.y
      camera.updateProjectionMatrix()
      renderer.setSize(cur_render_size.x, cur_render_size.y)
      renderer.render(scene, camera);
    }
  })
  desk_div_shrink = false
}

//scroll to activate tabs
document.querySelectorAll(".tabcontent").forEach( (div) => {
  div.addEventListener("mouseover", (event) => {
    let tab_id = div.id.replace("content", "button");
    let cur_button = document.querySelector(`#${tab_id}`)
    cur_button.click()
  })
})

let is_animating = false;

//click to activate tabs and scroll to section
document.querySelectorAll(".nav_button").forEach((button) => {
  button.addEventListener("click", () => {    
    //scroll to content
    if(!is_animating){
      console.log(getComputedStyle(menu_button))
      if (getComputedStyle(menu_button).display == "flex") {
        const nav_lst = document.querySelector(".topnav ul")
        nav_lst.style.display = "none"
      }
      if (button.id != "home_button"){
        if (!desk_div_shrink) {
          document.querySelector("#content_col").style.display = "block"
          shrinkDeskDiv()
        }
        let content_id = button.id.replace("button", "content")
        console.log("scrolling...")
        document.querySelector(`#${content_id}`).scrollIntoView({behavior: "smooth"})
      }
    }
  })
})


const home_button = document.querySelector("#home_button");
home_button.addEventListener("click", () => {
  moveCameraTo(start_position.x, start_position.y, start_position.z);
  lookCameraAT(0, 0, 0, 0, 1, 0);
  if (desk_div_shrink) {
    expandDeskDiv()
  }
  hideAllTabs();
  
});

const about_button = document.querySelector("#about_button");
about_button.addEventListener("click", () => {
  //avoid multiple clicking
  if(is_animating) {return(null)}
  is_animating = true;
  setTimeout(() => {is_animating = false}, animation_time*1000)

  const obj = dna.children.filter((object) => object.name == "shelf")[0];
  const bbox = new THREE.Box3().setFromObject(obj);
  const cent = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2,
    z: (bbox.max.z + bbox.min.z) / 2,
  };
  console.log(cent);
  moveCameraTo(cent.x + 3, cent.y + 1, cent.z + 1);
  lookCameraAT(cent.x, cent.y, cent.z, 0, 1, 0);

  //hideAllTabs()

});

const exp_button = document.querySelector("#exp_button");
exp_button.addEventListener("click", () => {
  //avoid multiple clicking
  if(is_animating) {return(null)}
  is_animating = true;
  setTimeout(() => {is_animating = false}, animation_time*1000)

  const obj = dna.children.filter((object) => object.name == "steps")[0];
  const bbox = new THREE.Box3().setFromObject(obj);
  const cent = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2,
    z: (bbox.max.z + bbox.min.z) / 2,
  };
  console.log(cent);
  moveCameraTo(cent.x, cent.y + 1, cent.z + 1);
  lookCameraAT(cent.x, cent.y, cent.z, 0, 1, 0);
  
  document.querySelector("#content_col").style.display = "block"
});

const pub_button = document.querySelector("#pub_button");
pub_button.addEventListener("click", () => {
  //avoid multiple clicking
  if(is_animating) {return(null)}
  is_animating = true;
  setTimeout(() => {is_animating = false}, animation_time*1000)

  const obj = dna.children.filter((object) => object.name == "open_book")[0];
  const bbox = new THREE.Box3().setFromObject(obj);
  const cent = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2,
    z: (bbox.max.z + bbox.min.z) / 2,
  };
  console.log(cent);
  moveCameraTo(cent.x, cent.y + 2, cent.z + 3);
  lookCameraAT(cent.x, cent.y, cent.z, 0, 1, 0);

  document.querySelector("#content_col").style.display = "block"
});

const cv_button = document.querySelector("#cv_button");
cv_button.addEventListener("click", () => {
  //avoid multiple clicking
  if(is_animating) {return(null)}
  is_animating = true;
  setTimeout(() => {is_animating = false}, animation_time*1000)

  const obj = dna.children.filter((object) => object.name == "CV")[0];
  const bbox = new THREE.Box3().setFromObject(obj);
  const cent = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2,
    z: (bbox.max.z + bbox.min.z) / 2,
  };
  console.log(cent);
  moveCameraTo(cent.x - 2, cent.y + 1, cent.z + 1);
  lookCameraAT(cent.x, cent.y, cent.z, 0, 1, 0);

  //hideAllTabs()
  document.querySelector("#content_col").style.display = "block"
});

const contact_button = document.querySelector("#contact_button");
contact_button.addEventListener("click", () => {
  //avoid multiple clicking
  if(is_animating) {return(null)}
  is_animating = true;
  setTimeout(() => {is_animating = false}, animation_time*1000)

  const obj = dna.children.filter((object) => object.name == "link")[0];
  const bbox = new THREE.Box3().setFromObject(obj);
  const cent = {
    x: (bbox.max.x + bbox.min.x) / 2,
    y: (bbox.max.y + bbox.min.y) / 2,
    z: (bbox.max.z + bbox.min.z) / 2,
  };
  console.log(cent);
  moveCameraTo(cent.x, cent.y, cent.z + 1.5);
  lookCameraAT(cent.x, cent.y, cent.z, 0, 1, 0);

  document.querySelector("#content_col").style.display = "block"
});

window.addEventListener("resize", () => {
  //navbar
  const nav_lst = document.querySelector(".topnav ul")
  if (window.innerWidth <= 768){
    nav_lst.style.display = "none";
  } else {
    nav_lst.style.display = "flex";
  }
  let target_div = null;
  if (! desk_div_shrink) {
    console.log("resize and not shrink!")
    target_div = document.querySelector(".row")
  } else {
    target_div = document.querySelector("#desktop_col")
  }
  camera.aspect = target_div.offsetWidth/target_div.offsetHeight
  camera.updateProjectionMatrix()
  renderer.setSize(target_div.offsetWidth, target_div.offsetHeight)
  renderer.render(scene, camera)
})

hideAllTabs();

