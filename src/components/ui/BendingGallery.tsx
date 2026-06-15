/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Plane, Mesh, Program, Texture } from "ogl";

interface BendingGalleryProps {
  images: string[];
  className?: string;
}

const vertexShader = `
  precision highp float;

  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  uniform float uTime;
  uniform float uSpeed;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    // Bending distortion based on sin/cos waves scaled by speed
    p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + abs(uSpeed) * 1.5);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2 uImageSizes;
  uniform vec2 uPlaneSizes;
  uniform sampler2D tMap;

  varying vec2 vUv;

  void main() {
    // cover aspect ratio calculation
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );

    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    gl_FragColor.rgb = texture2D(tMap, uv).rgb;
    gl_FragColor.a = 1.0;
  }
`;

export default function BendingGallery({ images, className = "" }: BendingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || images.length === 0) return;

    // Scroll state management
    const scroll = {
      current: 0,
      target: 0,
      last: 0,
      ease: 0.08,
      position: 0,
    };

    let startX = 0;
    let isDragging = false;

    // 1. Initialize OGL Renderer
    const renderer = new Renderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // 2. Camera Setup
    const camera = new Camera(gl);
    camera.fov = 45;
    camera.position.z = 22;

    // 3. Scene Setup
    const scene = new Transform();

    // 4. Shared Geometry
    const geometry = new Plane(gl, {
      heightSegments: 40,
      widthSegments: 80,
    });

    // 5. Build Medias
    interface MediaItem {
      mesh: Mesh;
      program: Program;
      x: number;
      extra: number;
      width: number;
      isLoaded: boolean;
    }

    let screenWidth = container.clientWidth;
    let screenHeight = container.clientHeight;
    renderer.setSize(screenWidth, screenHeight);

    camera.perspective({
      aspect: screenWidth / screenHeight,
    });

    // Calculate viewport size in 3D world units
    const fovRad = camera.fov * (Math.PI / 180);
    const viewportHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
    const viewportWidth = viewportHeight * camera.aspect;

    const scale = screenHeight / 1500;
    const planeHeight = viewportHeight * (600 * scale) / screenHeight;
    const planeWidth = viewportWidth * (550 * scale) / screenWidth;
    const padding = 0.8;
    const itemWidth = planeWidth + padding;
    const widthTotal = itemWidth * images.length;

    const medias: MediaItem[] = [];

    images.forEach((imgUrl, index) => {
      const texture = new Texture(gl, { generateMipmaps: false });
      const program = new Program(gl, {
        depthTest: false,
        depthWrite: false,
        transparent: true,
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          tMap: { value: texture },
          uPlaneSizes: { value: [planeWidth, planeHeight] },
          uImageSizes: { value: [1, 1] },
          uViewportSizes: { value: [viewportWidth, viewportHeight] },
          uSpeed: { value: 0 },
          uTime: { value: Math.random() * 100 },
        },
      });

      const mesh = new Mesh(gl, {
        geometry,
        program,
      });

      mesh.scale.x = planeWidth;
      mesh.scale.y = planeHeight;
      mesh.setParent(scene);

      const media: MediaItem = {
        mesh,
        program,
        x: itemWidth * index,
        extra: 0,
        width: itemWidth,
        isLoaded: false,
      };

      // Load Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl;
      img.onload = () => {
        texture.image = img;
        program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
        media.isLoaded = true;
      };

      medias.push(media);
    });

    // Event handlers
    const handleTouchDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      scroll.position = scroll.current;
      startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    };

    const handleTouchMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const dist = (startX - clientX) * 0.02;
      scroll.target = scroll.position + dist;
    };

    const handleTouchUp = () => {
      isDragging = false;
      // Snapping to nearest item
      const itemIndex = Math.round(scroll.target / itemWidth);
      scroll.target = itemIndex * itemWidth;
    };

    const handleWheel = (e: WheelEvent) => {
      scroll.target += e.deltaY * 0.005;
      const itemIndex = Math.round(scroll.target / itemWidth);
      scroll.target = itemIndex * itemWidth;
    };

    // Listeners
    container.addEventListener("mousedown", handleTouchDown);
    window.addEventListener("mousemove", handleTouchMove);
    window.addEventListener("mouseup", handleTouchUp);
    container.addEventListener("touchstart", handleTouchDown);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchUp);
    container.addEventListener("wheel", handleWheel, { passive: true });

    // Resize Handler
    const handleResize = () => {
      screenWidth = container.clientWidth;
      screenHeight = container.clientHeight;
      renderer.setSize(screenWidth, screenHeight);

      camera.perspective({
        aspect: screenWidth / screenHeight,
      });

      const nextFovRad = camera.fov * (Math.PI / 180);
      const nextViewportHeight = 2 * Math.tan(nextFovRad / 2) * camera.position.z;
      const nextViewportWidth = nextViewportHeight * camera.aspect;

      const nextScale = screenHeight / 1500;
      const nextPlaneHeight = nextViewportHeight * (600 * nextScale) / screenHeight;
      const nextPlaneWidth = nextViewportWidth * (550 * nextScale) / screenWidth;
      const nextItemWidth = nextPlaneWidth + padding;

      medias.forEach((media, index) => {
        media.mesh.scale.x = nextPlaneWidth;
        media.mesh.scale.y = nextPlaneHeight;
        media.width = nextItemWidth;
        media.x = nextItemWidth * index;
        media.program.uniforms.uPlaneSizes.value = [nextPlaneWidth, nextPlaneHeight];
        media.program.uniforms.uViewportSizes.value = [nextViewportWidth, nextViewportHeight];
      });
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    let animFrameId: number;
    const updateLoop = () => {
      // Lerp scroll current position to target
      scroll.current += (scroll.target - scroll.current) * scroll.ease;
      const speed = scroll.current - scroll.last;

      medias.forEach((media) => {
        // Calculate raw X position based on scroll
        const rawX = media.x - scroll.current - media.extra;
        
        // Circular placement (bending math)
        // Bends items on a curved arc representing a cylinder
        const arcProgress = rawX / widthTotal;
        media.mesh.position.x = rawX;
        media.mesh.position.y = Math.cos(arcProgress * Math.PI) * 10 - 10;
        media.mesh.rotation.z = arcProgress * Math.PI * -0.5;

        // Update uniforms
        media.program.uniforms.uTime.value += 0.015;
        media.program.uniforms.uSpeed.value = speed;

        // Infinite wrap logic
        const planeOffset = media.mesh.scale.x / 2;
        const viewportOffset = viewportWidth;

        if (speed > 0 && media.mesh.position.x + planeOffset < -viewportOffset) {
          media.extra -= widthTotal;
        } else if (speed < 0 && media.mesh.position.x - planeOffset > viewportOffset) {
          media.extra += widthTotal;
        }
      });

      renderer.render({ scene, camera });
      scroll.last = scroll.current;
      animFrameId = requestAnimationFrame(updateLoop);
    };

    animFrameId = requestAnimationFrame(updateLoop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      container.removeEventListener("mousedown", handleTouchDown);
      window.removeEventListener("mousemove", handleTouchMove);
      window.removeEventListener("mouseup", handleTouchUp);
      container.removeEventListener("touchstart", handleTouchDown);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchUp);
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[350px] overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}



