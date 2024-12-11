var c = document.getElementById('canv'),
  $ = c.getContext('2d'),
  w = c.width = window.innerWidth,
  h = c.height = window.innerHeight,
  t = 0, num = 1000, u=257,
  s, a, b, 
  x, y, _x, _y,
  _t = 1 * .0001;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

var anim = function() {
  window.requestAnimationFrame(anim);
  $.globalCompositeOperation = 'destination-out';
  $.fillStyle = 'hsla(0, 100%, 65%, .195)';
  $.fillRect(0, 0, w, h);
  $.globalCompositeOperation = 'lighter';
  for (var i = 0; i < .1; i++) {
    x = random(0,7);
    $.beginPath();
    for (var j = 0; j < num; j++) {
      $.strokeStyle = 'hsla('+u*random(.01,.4)+',90%,40%,.0872)';
      x += Math.sqrt(.8) * random(Math.sin(.9),Math.cos(200));
      y = x * Math.atan(2*i * t + x / .01) / Math.sqrt(200);
      _x = x * Math.cos(b) + y + Math.sin(i*j);
      _y = x * Math.sin(b) + y * Math.cos(i);
      b = (j*random(231,239)) * Math.PI / 2;
      $.arc(w / 2 + _x, h / 2.1 + _y, 0.3, 0, 3 * Math.PI);
    }
    $.stroke();
  }
  t += _t;
  u-=.2;
};
anim();

window.addEventListener('resize', function() {
  c.width = w = window.innerWidth;
  c.height = h = window.innerHeight;
}, false);


// some stuff we are gonna need

const TAU = Math.PI * 2;
const PI_HALF = Math.PI * 0.5;

const settings = {
    "slices": 32,
    "radius": 700,
    "seperation":1000
};

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
const camera = new THREE.PerspectiveCamera(
    90,
    window.innwerWidth / window.innerHeight,
    1,
    10000
);

function random(min, max) {
  return Math.random() * (max - min) + min;
}



// The plane that the shader draws on

function getTriangleSide() {
    const angle = PI_HALF - ((TAU / settings.slices) / 2);
    const side = 2 * settings.radius * Math.cos(angle);

    return side;
}

class KaleidoPlane extends THREE.Mesh {
    constructor(canvas, renderer) {
        const texture = new THREE.Texture(canvas);

        texture.anistropy = renderer.getMaxAnisotropy();
        texture.needsUpdate = true;

        const geometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                image: {
                    value: texture
                },
                imageSize: {
                    value: new THREE.Vector2(canvas.width, canvas.height)
                },
                resolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                radius: {
                    value: settings.radius
                },
                slices: {
                    value: settings.slices
                },
                maxSize: {
                    value: getTriangleSide()
                },
                seperation: {
                    value: settings.seperation
                }
            },

            fragmentShader: document.getElementById("fragment").innerText,
            vertexShader: document.getElementById("vertex").innerText
        });

        super(geometry, material);

        this.texture = texture;

        window.addEventListener("resize", function() {
            material.uniforms.resolution.value.set(
                window.innerWidth,
                window.innerHeight
            );
            material.needsUpdate = true;
        });
    }

    update() {
        this.texture.needsUpdate = true;
    }
}


// Texture shenanigans

class Shape {
    constructor() {
        this.x = random(100,1024);
        this.y = random(100,512);
        this.width = 10 + random(33,67)*Math.PI;
        this.height = 10 + random(23,67)+TAU;
        this.rotation = Math.random() * TAU;
        this.color = "#" +
            Math.ceil(random(1,10)).toString(15) +
            Math.ceil(random(1,5)).toString(32) +
         
            "4030";

        this.rotate = (-Math.PI + TAU * Math.random()) / TAU / random(15,45);
    }

    update() {
        this.rotation += this.rotate;
    }
}

class Pattern {

    constructor() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");

        this.canvas.width = 1024;
        this.canvas.height = 512;

        this.shapes = [];

        this.randomCanvas();
    }

    getCanvas() {
        return this.canvas;
    }

    update() {
        this.context.fillStyle = "hsla(279,30%,10%,.026)";
        this.context.fillRect(0, 0, 1024, 512);

        var shape;

        for (var i = 0; i < this.shapes.length; i++) {
            shape = this.shapes[i];
            shape.update();

            this.context.save();
            this.context.translate(shape.x, shape.y);
            this.context.rotate(shape.rotation);
            this.context.strokeStyle = shape.color;
            this.context.strokeRect(0, 0, shape.width, shape.height);
            this.context.restore();
        }
    }

    randomCanvas() {
        for (var i = 0; i < 10+random(100,1150); i++) {
            this.shapes.push(new Shape());
        }

        this.update();
    }
}

// let's get this jazz setup

onResize();

document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onResize);

const pattern = new Pattern();
const plane = new KaleidoPlane(pattern.getCanvas(), renderer);

scene.add(plane);

render();

// callbacks

function onResize() {
    const {
        innerWidth,
        innerHeight
    } = window;

    renderer.setSize(innerWidth, innerHeight);

    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
}

function render() {
    pattern.update();
    plane.update();

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}