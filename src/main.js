const speed = 0.00002;
let scene;
const road_size = 8;
const max_distance = 30;
const rocks = 10;

function add_element() {
	const el = document.createElement('a-entity');
	const scale = 0.4 + Math.random();
	const position_modifier = 1 - Math.random()*2;

	el.setAttribute('collada-model', '#rock1');
	el.setAttribute('position', `-${road_size/2 + position_modifier} 0 -${max_distance}`);
	el.setAttribute('scale', `${scale} ${scale} ${scale}`);
	el.setAttribute('rotation', `0 ${~~(Math.random()*360)} 0`);
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
