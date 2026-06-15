import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Personagem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Holographic Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // A. Core Solid Sphere (Dark base to block background lines)
    const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      transparent: true,
      opacity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // B. Wireframe Grid Globe (Monochromatic Tech look)
    const globeGeo = new THREE.SphereGeometry(3.6, 24, 24);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // C. Globe Points/Vertices (Glowing Tech Nodes)
    const pointsGeo = new THREE.SphereGeometry(3.61, 24, 24);
    const pointsCount = pointsGeo.attributes.position.count;
    const pointsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
    });
    const globePoints = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(globePoints);

    // 3. Orbiting Data Rings
    const ringsGroup = new THREE.Group();
    scene.add(ringsGroup);

    const ringCount = 3;
    const rings: THREE.Line[] = [];
    const ringSpeeds: number[] = [0.005, -0.008, 0.006];

    for (let i = 0; i < ringCount; i++) {
      const radius = 4.8 + i * 0.9;
      const segments = 64;
      const ringGeo = new THREE.BufferGeometry();
      
      const positions: number[] = [];
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        positions.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
      }
      
      ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      
      const ringMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.22 - i * 0.05,
      });

      const ring = new THREE.Line(ringGeo, ringMat);
      
      // Random tilts for tech orbits
      ring.rotation.x = Math.random() * Math.PI * 0.25;
      ring.rotation.z = Math.random() * Math.PI * 0.25;
      
      ringsGroup.add(ring);
      rings.push(ring);
    }

    // 4. Orbiting Particles / Floating Tech Packets
    const particlesCount = 40;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);
    const particleAngles = new Float32Array(particlesCount);
    const particleRadii = new Float32Array(particlesCount);
    const particleSpeeds = new Float32Array(particlesCount);
    const particleYOffsets = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      particleRadii[i] = 4.2 + Math.random() * 2.5;
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = 0.008 + Math.random() * 0.012;
      particleYOffsets[i] = (Math.random() - 0.5) * 1.5;

      const x = Math.cos(particleAngles[i]) * particleRadii[i];
      const z = Math.sin(particleAngles[i]) * particleRadii[i];
      const y = particleYOffsets[i];

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });
    const orbitingParticles = new THREE.Points(particlesGeo, particlesMat);
    ringsGroup.add(orbitingParticles);

    // 5. Lighting (Subtle depth)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // 6. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      // Rotate core globe
      globeGroup.rotation.y += 0.003;
      globeGroup.rotation.x += 0.001;

      // Rotate orbit rings
      rings.forEach((ring, idx) => {
        ring.rotation.y += ringSpeeds[idx];
      });

      // Update floating particles orbit coordinates
      const positions = orbitingParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        particleAngles[i] += particleSpeeds[i];
        
        const x = Math.cos(particleAngles[i]) * particleRadii[i];
        const z = Math.sin(particleAngles[i]) * particleRadii[i];
        
        positions[i * 3] = x;
        positions[i * 3 + 2] = z;
      }
      orbitingParticles.geometry.attributes.position.needsUpdate = true;

      // Rotate the overall rings group slightly
      ringsGroup.rotation.y += 0.002;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 7. Responsive handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      // Dispose resources
      globeGeo.dispose();
      globeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative flex items-center justify-center pointer-events-none select-none"
      style={{ minHeight: "260px" }}
    />
  );
}
