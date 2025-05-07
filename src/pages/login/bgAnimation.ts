export default function useAnimation(canvas: HTMLCanvasElement) {
    let render = 0;
    let ctx: CanvasRenderingContext2D;
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d') as CanvasRenderingContext2D;
    const hue = 217;
    const stars: any[] = [];
    const maxStars = 1200;

    canvas2.width = 100;
    canvas2.height = 100;

    function random(_min: number, _max?: number) {
        let max = _max || _min;
        let min = _min;
        if (arguments.length < 2) {
            max = min;
            min = 0;
        }
        if (min > max) {
            const hold = max;
            max = min;
            min = hold;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function maxOrbit(x: number, y: number) {
        const max = Math.max(x, y);
        const diameter = Math.round(Math.sqrt(max * max + max * max));
        return diameter / 2;
    }

    class Star {
        w = canvas.width;

        h = canvas.height;

        orbitRadius = random(maxOrbit(this.w, this.h));

        radius = random(60, this.orbitRadius) / 12;

        orbitX = this.w / 2;

        orbitY = this.h / 2;

        timePassed = random(0, maxStars);

        speed = random(this.orbitRadius) / 900000;

        alpha = random(2, 10) / 10;

        draw = () => {
            const x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
            const y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
            const twinkle = random(10);

            if (twinkle === 1 && this.alpha > 0) {
                this.alpha -= 0.05;
            } else if (twinkle === 2 && this.alpha < 1) {
                this.alpha += 0.05;
            }

            ctx.globalAlpha = this.alpha;
            ctx.drawImage(
                canvas2,
                x - this.radius / 2,
                y - this.radius / 2,
                this.radius,
                this.radius
            );
            this.timePassed += this.speed;
        };
    }

    const init = () => {
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        // eslint-disable-next-line no-param-reassign
        canvas.width = window.innerWidth;
        // eslint-disable-next-line no-param-reassign
        canvas.height = window.innerHeight;
        const half = canvas2.width / 2;
        // star的圆心渐变
        const gradient2 = ctx2?.createRadialGradient(half, half, 0, half, half, half);

        gradient2.addColorStop(0.025, '#fff');
        gradient2.addColorStop(0.1, `hsla(${hue}, 61%, 33%, 0.2)`);
        gradient2.addColorStop(0.25, `hsla(${hue}, 64%, 6%, 0.1)`);
        gradient2.addColorStop(1, 'transparent');

        ctx2.fillStyle = gradient2;
        ctx2.beginPath();
        ctx2.arc(half, half, half, 0, Math.PI * 2);
        ctx2.fill();

        for (let i = 0; i < maxStars; i++) {
            stars.push(new Star());
        }
    };

    const animation = () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.1;
        // ctx.fillStyle = `hsla(${hue}, 64%, 6%, 0.8)`;
        // ctx.fillStyle = `rgba(0,0,0,0.1)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'lighter';
        for (let i = 1, l = stars.length; i < l; i++) {
            stars[i].draw();
        }

        render = window.requestAnimationFrame(animation);
    };

    const stop = () => window.cancelAnimationFrame(render);

    return {
        init,
        animation,
        stop
    };
}
