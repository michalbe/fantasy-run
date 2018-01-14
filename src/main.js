const elements = [];

const scene = document.querySelector('#scene1');

function add_element() {
	const el = document.createElement('a-entity');
	el.setAttribute('collada-model', '#rock1');
	el.setAttribute('position', '0 .1 -4');

	scene.appendChild(el);
}


add_element();
