// Particle background: spawn at random x positions along the bottom, float upward and disappear at the top
class Particle {
	constructor(canvas) {
		this.canvas = canvas;
		this.reset();
	}

	reset() {
		// start slightly below the visible bottom so they flow in
		this.x = Math.random() * this.canvas.width;
		this.y = this.canvas.height + (Math.random() * 30 + 5);
		this.size = Math.random() * 3 + 1.5;
		this.speedY = Math.random() * 0.8 + 0.8; // upward speed
		this.speedX = Math.random() * 0.6 - 0.3; // slight drift
		this.opacity = Math.random() * 0.2 + 0.2;
		this.fadeStart = Math.random() * (this.canvas.height * 1); // where fading begins
	}

	update() {
		this.y -= this.speedY;
		this.x += this.speedX;

		// start fading once past fadeStart distance from bottom
		if (this.canvas.height - this.y > this.fadeStart) {
			this.opacity -= 0.01;
		}
	}

	draw(ctx) {
		if (this.opacity <= 0) return;
		ctx.fillStyle = `rgba(255,255,255,${Math.max(0, this.opacity)})`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
	}

	isAlive() {
		// alive while above top boundary and still visible
		return this.y > -20 && this.opacity > 0.05;
	}
}

class ParticleBackground {
	constructor(canvasId, options = {}) {
		this.canvas = document.getElementById(canvasId);
		if (!this.canvas) {
			console.error('Particle canvas not found:', canvasId);
			return;
		}
		this.ctx = this.canvas.getContext('2d');
		this.particles = [];
		this.spawnRate = options.spawnRate || 1; // particles per frame
		this.maxParticles = options.maxParticles || 1;
		this.bgColor = options.bgColor || 'rgba(41,50,75,0)';

		this.resize();
		window.addEventListener('resize', () => this.resize());

		this.loop = this.loop.bind(this);
		requestAnimationFrame(this.loop);
	}

	resize() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	spawn() {
		for (let i = 0; i < this.spawnRate; i++) {
			if (this.particles.length < this.maxParticles) this.particles.push(new Particle(this.canvas));
		}
	}

	loop() {
		// clear with transparent background so page background shows through
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// spawn new particles at bottom
		this.spawn();

		// update and draw
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			p.update();
			p.draw(this.ctx);
			if (!p.isAlive()) this.particles.splice(i, 1);
		}

		requestAnimationFrame(this.loop);
	}
}

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
	// canvas id used in infob.html is 'particleCanvas'
	new ParticleBackground('particleCanvas', { spawnRate: 3, maxParticles: 50 });
});

