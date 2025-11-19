
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ball, Gender, SimulationConfig, SimulationStats } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  MAX_CONTAINER_RADIUS,
  INITIAL_CONTAINER_RADIUS,
  CONTAINER_GROWTH_RATE,
  BALL_RADIUS, 
  MIN_BALL_RADIUS,
  MAX_BALL_RADIUS,
  MALE_COLOR, 
  FEMALE_COLOR,
  CONTAINER_BORDER_COLOR,
  BALL_LIFETIME_MS,
  MALE_KILL_CHANCE,
  FEMALE_KILL_CHANCE,
  TWIN_CHANCE
} from '../constants';

interface PetriDishProps {
  isRunning: boolean;
  config: SimulationConfig;
  shouldReset: boolean;
  onResetComplete: () => void;
  onStatsUpdate: (stats: SimulationStats) => void;
}

export const PetriDish: React.FC<PetriDishProps> = ({
  isRunning,
  config,
  shouldReset,
  onResetComplete,
  onStatsUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const containerRadiusRef = useRef<number>(INITIAL_CONTAINER_RADIUS);
  
  // Physics helpers
  const generateBall = (
    id: string, 
    x: number, 
    y: number, 
    forcedGender?: Gender,
    targetRadius?: number
  ): Ball => {
    const angle = Math.random() * Math.PI * 2;
    
    // Size calculation
    let radius = targetRadius || (BALL_RADIUS + (Math.random() * 4 - 2)); // Default variance +/- 2
    radius = Math.max(MIN_BALL_RADIUS, Math.min(MAX_BALL_RADIUS, radius));

    // Speed is inversely proportional to size
    const sizeMultiplier = BALL_RADIUS / radius;
    const speed = (Math.random() * 0.5 + 0.5) * config.ballSpeed * sizeMultiplier;
    
    const gender = forcedGender ?? (Math.random() > 0.5 ? Gender.Male : Gender.Female);
    
    return {
      id,
      position: { x, y },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      radius: radius,
      gender,
      color: gender === Gender.Male ? MALE_COLOR : FEMALE_COLOR,
      lastBreedTime: Date.now() + 2000, // Grace period for newborns
      age: 0,
      createdAt: Date.now()
    };
  };

  const initializePopulation = useCallback(() => {
    const newBalls: Ball[] = [];
    containerRadiusRef.current = INITIAL_CONTAINER_RADIUS; // Reset container size

    for (let i = 0; i < config.initialPopulation; i++) {
      // Force 50/50 split
      const gender = i % 2 === 0 ? Gender.Male : Gender.Female;

      // Random position within CURRENT (small) circle
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (containerRadiusRef.current - BALL_RADIUS * 2);
      const x = CANVAS_WIDTH / 2 + r * Math.cos(angle);
      const y = CANVAS_HEIGHT / 2 + r * Math.sin(angle);
      
      newBalls.push(generateBall(`init-${i}-${Date.now()}`, x, y, gender));
    }
    ballsRef.current = newBalls;
  }, [config.initialPopulation, config.ballSpeed]);

  // Main Physics Loop
  const update = (timestamp: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Grow Container
    if (isRunning && containerRadiusRef.current < MAX_CONTAINER_RADIUS) {
      containerRadiusRef.current = Math.min(
        MAX_CONTAINER_RADIUS, 
        containerRadiusRef.current + CONTAINER_GROWTH_RATE
      );
    }

    const currentRadius = containerRadiusRef.current;
    const now = Date.now();

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Container
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // Container Gradient/Glow
    const gradient = ctx.createRadialGradient(centerX, centerY, currentRadius - 20, centerX, centerY, currentRadius);
    gradient.addColorStop(0, '#1e293b'); // slate-800
    gradient.addColorStop(1, '#334155'); // slate-700

    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = CONTAINER_BORDER_COLOR;
    ctx.stroke();

    // Logic Update only if running
    if (isRunning) {
       // Remove old balls first
       ballsRef.current = ballsRef.current.filter(b => now - b.createdAt < BALL_LIFETIME_MS);

       const balls = ballsRef.current;
       const newBorns: Ball[] = [];
       const deadBallIds = new Set<string>();

       // 1. Move balls
       balls.forEach(ball => {
         ball.position.x += ball.velocity.x;
         ball.position.y += ball.velocity.y;
         ball.age++;
       });

       // 2. Boundary Collision (Circle)
       balls.forEach(ball => {
         const dx = ball.position.x - centerX;
         const dy = ball.position.y - centerY;
         const dist = Math.sqrt(dx * dx + dy * dy);

         if (dist + ball.radius > currentRadius) {
           const nx = dx / dist;
           const ny = dy / dist;

           const dot = ball.velocity.x * nx + ball.velocity.y * ny;
           ball.velocity.x = ball.velocity.x - 2 * dot * nx;
           ball.velocity.y = ball.velocity.y - 2 * dot * ny;

           const overlap = dist + ball.radius - currentRadius;
           ball.position.x -= nx * overlap;
           ball.position.y -= ny * overlap;
         }
       });

       // 3. Ball Collision & Logic
       for (let i = 0; i < balls.length; i++) {
         const b1 = balls[i];
         if (deadBallIds.has(b1.id)) continue;

         for (let j = i + 1; j < balls.length; j++) {
           const b2 = balls[j];
           if (deadBallIds.has(b2.id)) continue;

           const dx = b2.position.x - b1.position.x;
           const dy = b2.position.y - b1.position.y;
           const distSq = dx * dx + dy * dy;
           const minDist = b1.radius + b2.radius;

           if (distSq < minDist * minDist) {
             const dist = Math.sqrt(distSq);
             const nx = dx / dist;
             const ny = dy / dist;
             
             // --- Handle Same Gender Destruction ---
             if (b1.gender === b2.gender) {
               const killChance = b1.gender === Gender.Male ? MALE_KILL_CHANCE : FEMALE_KILL_CHANCE;
               if (Math.random() < killChance) {
                 // Kill one of them randomly
                 const victim = Math.random() > 0.5 ? b1 : b2;
                 deadBallIds.add(victim.id);
                 // We skip physics bounce if a death occurs to represent absorption/destruction
                 continue; 
               }
             }

             // --- Physics Resolution (Elastic) ---
             // Relative velocity
             const dvx = b2.velocity.x - b1.velocity.x;
             const dvy = b2.velocity.y - b1.velocity.y;
             const dot = dvx * nx + dvy * ny;

             if (dot < 0) {
                const m1 = b1.radius * b1.radius;
                const m2 = b2.radius * b2.radius;
                const impulse = (2 * dot) / (m1 + m2);
                
                b1.velocity.x += impulse * m2 * nx;
                b1.velocity.y += impulse * m2 * ny;
                b2.velocity.x -= impulse * m1 * nx;
                b2.velocity.y -= impulse * m1 * ny;
                
                // Separate
                const overlap = (minDist - dist) / 2;
                b1.position.x -= nx * overlap;
                b1.position.y -= ny * overlap;
                b2.position.x += nx * overlap;
                b2.position.y += ny * overlap;

                // --- Breeding Logic (Different Gender) ---
                if (
                   b1.gender !== b2.gender && 
                   balls.length + newBorns.length - deadBallIds.size < config.maxPopulation &&
                   now - b1.lastBreedTime > config.breedCooldown &&
                   now - b2.lastBreedTime > config.breedCooldown
                ) {
                   if (Math.random() < config.breedChance) {
                      const spawnX = (b1.position.x + b2.position.x) / 2;
                      const spawnY = (b1.position.y + b2.position.y) / 2;
                      
                      const avgRadius = (b1.radius + b2.radius) / 2;
                      const variance = (Math.random() * 2 - 1); 
                      
                      // Check for twins
                      const spawnCount = Math.random() < TWIN_CHANCE ? 2 : 1;

                      for (let k=0; k<spawnCount; k++) {
                         // Slight offset for twins so they don't spawn perfectly inside each other
                         const offset = k === 0 ? 0 : 2; 
                         const baby = generateBall(
                            `baby-${now}-${Math.random()}`, 
                            spawnX + offset, 
                            spawnY + offset, 
                            undefined, 
                            avgRadius + variance
                         );
                         newBorns.push(baby);
                      }
                      
                      b1.lastBreedTime = now;
                      b2.lastBreedTime = now;
                   }
                }
             }
           }
         }
       }
       
       // Commit death and birth
       if (deadBallIds.size > 0) {
         ballsRef.current = ballsRef.current.filter(b => !deadBallIds.has(b.id));
       }
       if (newBorns.length > 0) {
         ballsRef.current = [...ballsRef.current, ...newBorns];
       }
    }

    // Draw Balls
    ballsRef.current.forEach(ball => {
      // Visual indicator for age (fade out slightly near death)
      const agePercent = (now - ball.createdAt) / BALL_LIFETIME_MS;
      const opacity = 1 - Math.pow(agePercent, 4); // Stays opaque mostly, fades at very end

      ctx.globalAlpha = Math.max(0.1, opacity);
      ctx.beginPath();
      ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.color;
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = ball.color;
      
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.position.x - (ball.radius/3), ball.position.y - (ball.radius/3), ball.radius/3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    
    // Update Stats
    if (timestamp - lastUpdateRef.current > 200) {
        const counts = ballsRef.current.reduce((acc, b) => {
            if (b.gender === Gender.Male) acc.males++;
            else acc.females++;
            return acc;
        }, { males: 0, females: 0 });
        
        onStatsUpdate({
            population: ballsRef.current.length,
            males: counts.males,
            females: counts.females,
            maxPopulationReached: 0 
        });
        lastUpdateRef.current = timestamp;
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (shouldReset) {
      initializePopulation();
      onResetComplete();
    }
  }, [shouldReset, initializePopulation, onResetComplete]);

  useEffect(() => {
    initializePopulation();
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning, config]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="max-w-full max-h-screen shadow-2xl rounded-full bg-slate-900 border border-slate-800 cursor-crosshair"
    />
  );
};
