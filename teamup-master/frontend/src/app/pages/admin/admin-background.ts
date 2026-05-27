import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

@Component({
  selector: 'admin-bg',
  template: '',
  styles: [':host { position: fixed; inset: 0; z-index: 0; pointer-events: none; }']
})
export class AdminBackground implements OnInit, OnDestroy {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animId!: number;
  private W = 0;
  private H = 0;
  private sweepAngle = 0;
  private dots: SweepDot[] = [];

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
      position: 'fixed', inset: '0', width: '100%', height: '100%',
      zIndex: '0', pointerEvents: 'none', top: '0', left: '0'
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
  }

  private loop(): void {
    const { ctx, W, H } = this;
    const cx = W * 0.5;
    const cy = H * 0.5;
    const maxR = Math.max(W, H) * 0.72;

    ctx.fillStyle = '#06000f';
    ctx.fillRect(0, 0, W, H);

    // Ambient glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grd.addColorStop(0,   'rgba(140,20,220,0.22)');
    grd.addColorStop(0.4, 'rgba(80,0,160,0.1)');
    grd.addColorStop(1,   'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(168,85,247,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 55) {
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 55) {
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
    ctx.restore();

    // Radar rings
    ctx.save();
    for (let i = 1; i <= 5; i++) {
      const r = (maxR / 5) * i;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(244,114,182,${0.06 + 0.02 * (5 - i)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.restore();

    // Sweep
    ctx.save();
    const sweepWidth = Math.PI * 0.45;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0,   'rgba(244,114,182,0.0)');
    grad.addColorStop(0.3, 'rgba(244,114,182,0.08)');
    grad.addColorStop(1,   'rgba(244,114,182,0.0)');
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxR, this.sweepAngle - sweepWidth, this.sweepAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(this.sweepAngle) * maxR, cy + Math.sin(this.sweepAngle) * maxR);
    ctx.strokeStyle = 'rgba(244,114,182,0.7)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(244,114,182,0.9)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // Spawn dots
    if (Math.random() < 0.12) {
      const r = Math.random() * maxR * 0.9;
      this.dots.push(new SweepDot(
        cx + Math.cos(this.sweepAngle) * r,
        cy + Math.sin(this.sweepAngle) * r
      ));
    }

    this.dots = this.dots.filter(d => d.alpha > 0);
    this.dots.forEach(d => { d.draw(ctx); d.alpha -= 0.008; });

    // Crosshair
    ctx.save();
    ctx.strokeStyle = 'rgba(168,85,247,0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx-12,cy); ctx.lineTo(cx+12,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy-12); ctx.lineTo(cx,cy+12); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(244,114,182,0.6)';
    ctx.stroke();
    ctx.restore();

    this.sweepAngle += 0.018;
    this.animId = requestAnimationFrame(() => this.loop());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    this.canvas.remove();
  }
}

class SweepDot {
  alpha = 1;
  r: number;
  color: string;
  constructor(public x: number, public y: number) {
    this.r = Math.random() * 3 + 1;
    const colors = ['rgba(244,114,182,', 'rgba(168,85,247,', 'rgba(216,180,254,'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${this.alpha})`;
    ctx.shadowColor = this.color + '1)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }
}