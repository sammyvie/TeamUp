import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'client-bg',
  template: '',
  styles: [':host { display: none; }']
})
export class ClientBackground implements OnInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId!: number;
  private particles: Particle[] = [];
  private W = 0;
  private H = 0;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    // Remove any existing canvas left over from previous route
    document.querySelectorAll('canvas[data-teamup-bg]').forEach(c => c.remove());

    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('data-teamup-bg', 'true');
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '0',
      pointerEvents: 'none',
      display: 'block',
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
    this.particles = Array.from({ length: 80 }, () => new Particle(this.W, this.H));
  }

  private loop(): void {
    const { ctx, W, H } = this;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#0d0025');
    bg.addColorStop(0.5, '#120030');
    bg.addColorStop(1,   '#0a0018');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    this.drawGrid();
    this.particles.forEach(p => { p.update(W, H); p.draw(ctx); });
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private drawGrid(): void {
    const { ctx, W, H } = this;
    const horizon = H * 0.62;
    const vp = { x: W / 2, y: horizon };
    const cols = 18;
    const rows = 14;
    ctx.save();
    ctx.strokeStyle = 'rgba(244,114,182,0.4)';
    ctx.lineWidth = 0.8;
    ctx.shadowColor = 'rgba(244,114,182,0.5)';
    ctx.shadowBlur = 4;
    for (let i = 0; i <= cols; i++) {
      const x = (i / cols) * W;
      ctx.beginPath();
      ctx.moveTo(vp.x + (x - vp.x) * 0.01, horizon);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let j = 1; j <= rows; j++) {
      const t  = j / rows;
      const et = Math.pow(t, 2.2);
      const y  = horizon + et * (H - horizon);
      const xL = vp.x - (vp.x * et * 1.4);
      const xR = vp.x + (W - vp.x) * et * 1.4;
      ctx.beginPath();
      ctx.moveTo(Math.max(0, xL), y);
      ctx.lineTo(Math.min(W, xR), y);
      ctx.globalAlpha = 0.3 + 0.7 * et;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const hg = ctx.createLinearGradient(0, horizon - 2, 0, horizon + 2);
    hg.addColorStop(0,   'transparent');
    hg.addColorStop(0.5, 'rgba(244,114,182,0.85)');
    hg.addColorStop(1,   'transparent');
    ctx.fillStyle = hg;
    ctx.fillRect(0, horizon - 3, W, 6);
    ctx.fillStyle = 'rgba(244,114,182,0.12)';
    ctx.fillRect(0, horizon - 12, W, 24);
    ctx.restore();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.canvas.remove();
  }
}

class Particle {
  x!: number; y!: number; vx!: number; vy!: number;
  r!: number; alpha!: number; color!: string;
  constructor(W: number, H: number) { this.reset(W, H); }
  reset(W: number, H: number): void {
    this.x = Math.random() * W;
    this.y = Math.random() * H * 0.6;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -Math.random() * 0.5 - 0.1;
    this.r = Math.random() * 2 + 0.5;
    this.alpha = Math.random() * 0.7 + 0.3;
    const colors = ['rgba(244,114,182,','rgba(168,85,247,','rgba(216,180,254,','rgba(255,182,255,'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update(W: number, H: number): void {
    this.x += this.vx; this.y += this.vy; this.alpha -= 0.002;
    if (this.alpha <= 0 || this.y < 0 || this.x < 0 || this.x > W) {
      this.reset(W, H); this.alpha = Math.random() * 0.5 + 0.2;
    }
  }
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save(); ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${this.alpha})`;
    ctx.shadowColor = this.color + '0.8)'; ctx.shadowBlur = 8;
    ctx.fill(); ctx.restore();
  }
}
