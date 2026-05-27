import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'freelancer-bg',
  standalone: true,
  template: '',
  styles: [':host { display: none; }']
})
export class FreelancerBackground implements OnInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId!: number;
  private particles: Particle[] = [];
  private W = 0;
  private H = 0;
  private tick = 0;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    document.querySelectorAll('canvas[data-freelancer-bg]').forEach(c => c.remove());
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('data-freelancer-bg', 'true');
    Object.assign(this.canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      zIndex: '0', pointerEvents: 'none', display: 'block',
    });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.zone.runOutsideAngular(() => this.loop());
  }

  private resize(): void {
    this.W = this.canvas.width  = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
    this.particles = Array.from({ length: 60 }, () => new Particle(this.W, this.H));
  }

  private loop(): void {
    const { ctx, W, H } = this;
    this.tick++;

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#0a001e');
    bg.addColorStop(0.5, '#0d0025');
    bg.addColorStop(1,   '#150030');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    this.drawHexGrid();
    this.drawScanlines();
    this.particles.forEach(p => { p.update(W, H, this.tick); p.draw(ctx); });

    this.animId = requestAnimationFrame(() => this.loop());
  }

  private drawHexGrid(): void {
    const { ctx, W, H, tick } = this;
    const size = 40;
    const cols = Math.ceil(W / (size * 1.5)) + 2;
    const rows = Math.ceil(H / (size * Math.sqrt(3))) + 2;

    ctx.save();
    for (let col = -1; col < cols; col++) {
      for (let row = -1; row < rows; row++) {
        const x = col * size * 1.5;
        const y = row * size * Math.sqrt(3) + (col % 2 === 0 ? 0 : size * Math.sqrt(3) / 2);

        // Pulsing opacity based on distance from center + time
        const dx = x - W / 2;
        const dy = y - H / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pulse = Math.sin(dist * 0.008 - tick * 0.02) * 0.5 + 0.5;
        const alpha = 0.04 + pulse * 0.06;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const hx = x + size * 0.85 * Math.cos(angle);
          const hy = y + size * 0.85 * Math.sin(angle);
          i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(199,164,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Occasionally fill a hex with pink glow
        if ((col * 7 + row * 13) % 23 === 0) {
          const pinkPulse = Math.sin(dist * 0.006 - tick * 0.015 + col + row) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(244,114,182,${pinkPulse * 0.04})`;
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  private drawScanlines(): void {
    const { ctx, W, H } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 2);
    }
    ctx.restore();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.canvas.remove();
  }
}

class Particle {
  x!: number; y!: number; vx!: number; vy!: number;
  r!: number; alpha!: number; color!: string; type!: string;

  constructor(W: number, H: number) { this.reset(W, H); }

  reset(W: number, H: number): void {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = (Math.random() - 0.5) * 0.3;
    this.r     = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.2;
    // Mix of purple and pink particles
    const colors = [
      'rgba(199,164,255,', 'rgba(168,85,247,',
      'rgba(244,114,182,', 'rgba(255,182,255,',
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.type  = Math.random() > 0.8 ? 'diamond' : 'circle';
  }

  update(W: number, H: number, tick: number): void {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.001;
    if (this.alpha <= 0 || this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.reset(W, H);
      this.alpha = Math.random() * 0.4 + 0.1;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    if (this.type === 'diamond') {
      ctx.translate(this.x, this.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = `${this.color}${this.alpha})`;
      ctx.shadowColor = this.color + '0.6)';
      ctx.shadowBlur = 6;
      ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.alpha})`;
      ctx.shadowColor = this.color + '0.6)';
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();
  }
}