const elements = document.querySelectorAll("p, .project");

let delay = 0;

elements.forEach(el => {
el.style.opacity = 0;

setTimeout(() => {
el.style.opacity = 1;
}, delay);

delay += 150;
});