"use client";

import React, { useRef, useEffect } from 'react';
import { RippleButton } from "@/components/ui/multi-type-ripple-buttons";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ShaderCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff = center-uv;
        float len = length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        len -= variation(diff,vec2(1.,0.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 v=rotate2d(iTime)*uv;
        vec3 foregroundColor=vec3(v.x,v.y,.7-v.y*v.x);
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r);
        gl_FragColor=vec4(color,1.);
      }`;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation error");
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, 'iTime');
    const iResLoc = gl.getUniformLocation(program, 'iResolution');
    const bgColorLoc = gl.getUniformLocation(program, 'uBackgroundColor');
    gl.uniform3fv(bgColorLoc, new Float32Array([0.043, 0.067, 0.125]));

    let animationFrameId: number;
    const render = (time: number) => {
      gl.uniform1f(iTimeLoc, time * 0.001);
      gl.uniform2f(iResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    const parentEl = canvas.parentElement;
    const handleResize = () => {
      if (parentEl) {
        canvas.width = parentEl.clientWidth;
        canvas.height = parentEl.clientHeight;
      } else {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (parentEl) resizeObserver.observe(parentEl);

    animationFrameId = requestAnimationFrame(render);
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 rounded-2xl" />;
};

export interface GlassyPricingCardProps {
  planName: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: 'primary' | 'secondary';
  href?: string;
}

export const GlassyPricingCard = ({
  planName, description, price, features, buttonText, isPopular = false, buttonVariant = 'primary', href
}: GlassyPricingCardProps) => {
  const cardClasses = `
    backdrop-blur-[14px] backdrop-brightness-[0.91] bg-gradient-to-br rounded-2xl shadow-xl flex-1 max-w-xs px-7 py-8 flex flex-col transition-all duration-300
    from-white/10 to-white/5 border border-white/10
    ${isPopular ? 'scale-105 relative ring-2 ring-accent-green/20 from-white/20 to-white/10 border-accent-green/30 shadow-2xl' : ''}
  `;
  const buttonClasses = `
    mt-auto w-full py-2.5 rounded-xl font-semibold text-[14px] transition font-body
    ${buttonVariant === 'primary'
      ? 'bg-accent-green hover:brightness-110 text-black'
      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
    }
  `;

  return (
    <div className={cardClasses.trim()}>
      {isPopular && (
        <div className="absolute -top-4 right-4 px-3 py-1 text-[12px] font-semibold rounded-full bg-accent-green text-black">
          Most Popular
        </div>
      )}
      <div className="mb-3">
        <h3 className="text-[48px] font-extralight tracking-[-0.03em] text-white font-heading">{planName}</h3>
        <p className="text-[16px] text-white/70 mt-1 font-body">{description}</p>
      </div>
      <div className="my-6 flex items-baseline gap-2">
        <span className="text-[48px] font-extralight text-white font-heading">${price}</span>
        <span className="text-[14px] text-white/70 font-body">p/month</span>
      </div>
      <div className="w-full mb-5 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.09)_20%,rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.09)_80%,transparent)]"></div>
      <ul className="flex flex-col gap-2 text-[14px] text-white/90 mb-6 font-body">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <CheckIcon className="text-accent-green w-4 h-4" /> {feature}
          </li>
        ))}
      </ul>
      {href ? (
        <a href={href} className={buttonClasses.trim() + " block text-center"}>
          {buttonText}
        </a>
      ) : (
        <RippleButton className={buttonClasses.trim()}>{buttonText}</RippleButton>
      )}
    </div>
  );
};

interface GlassyPricingSectionProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  plans: GlassyPricingCardProps[];
  showAnimatedBackground?: boolean;
}

export const GlassyPricingSection = ({
  title,
  subtitle,
  plans,
  showAnimatedBackground = true,
}: GlassyPricingSectionProps) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      {showAnimatedBackground && <ShaderCanvas />}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 py-16 md:py-20 lg:py-24">
        <div className="w-full max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-[48px] md:text-[64px] font-extralight leading-tight tracking-[-0.03em] bg-clip-text text-transparent bg-gradient-to-r from-white via-accent-green to-accent-teal font-heading">
            {title}
          </h2>
          <p className="mt-3 text-[16px] md:text-[20px] text-white/80 max-w-2xl mx-auto font-body">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-center w-full max-w-4xl">
          {plans.map((plan) => <GlassyPricingCard key={plan.planName} {...plan} />)}
        </div>
      </div>
    </div>
  );
};
