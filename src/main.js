const elements = [];
const speed = 0.002;
let scene;


function add_element() {
	const el = document.createElement('a-entity');
	el.setAttribute('collada-model', '#rock1');
	el.setAttribute('position', '0 .1 -4');
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
