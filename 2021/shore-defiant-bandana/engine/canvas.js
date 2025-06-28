export const width = window.innerWidth;
export const height = window.innerHeight;

export const canvas = document.getElementById('canvas');
canvas.width = width;
canvas.height = height;

export const context = canvas.getContext('2d');
