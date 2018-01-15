const speed = 0.0002;
let scene;


function add_element() {
	const el = document.createElement('a-entity');
	const scale = Math.random();

	el.setAttribute('collada-model', '#rock1');
	el.setAttribute('position', '0 .1 -4');
	el.setAttribute('scale', `${scale} ${Math.random()} ${Math.random()}`);
	el.setAttribute('rotation', `0 0 ${~~(Math.random()*360)}`);
	el.setAttribute('move', '');
	window.el = el;
	scene.appendChild(el);
}

AFRAME.registerComponent('move', {
	tick() {
		this.el.object3D.position.z += speed;
	}
});

function init() {
	scene = document.querySelector('#scene1');
	add_element();
}
