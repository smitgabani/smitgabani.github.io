'use client'

/**
 * Logo3D.jsx - Core 3D Logo Component Implementation
 * 
 * This file contains the complete implementation of the 3D animated logo.
 * See index.js for usage documentation.
 * 
 * ARCHITECTURE:
 * - Logo3D: Standalone component with its own Canvas (simple, works anywhere)
 * - Logo3DProvider + Logo3DView: Shared Canvas system for multiple logos (performant)
 * 
 * KEY LEARNINGS FROM IMPLEMENTATION:
 * 
 * 1. VIEW COMPONENT (from @react-three/drei):
 *    - View is BOTH a DOM element AND a 3D viewport
 *    - Place View components in your HTML, they act as div containers
 *    - View.Port inside Canvas renders all View contents via scissor clipping
 *    - Each View needs its own camera and lights (they don't inherit from parent Canvas)
 * 
 * 2. Z-INDEX HANDLING:
 *    - The shared Canvas is position:fixed with z-index:1000
 *    - HTML content that should appear IN FRONT needs z-index > 1000
 *    - The View scissor clips to match DOM element bounds
 * 
 * 3. INTERACTIVE MODE (OrbitControls):
 *    - When interactive=true, OrbitControls captures mouse/touch events
 *    - This PREVENTS page scrolling when cursor is over the 3D scene!
 *    - Solution: Only enable interactive mode after user clicks (not by default)
 *    - Disable on mobile to prevent scroll interference
 * 
 * 4. CAMERA SETUP:
 *    - Position at [d, d, d] looking at origin creates isometric-like view
 *    - ~35° elevation, 45° azimuth
 *    - Use onUpdate={(self) => self.lookAt(0,0,0)} to ensure camera faces origin
 *    - FOV and distance determine how much of the animation is visible
 * 
 * 5. ANIMATION VISIBILITY:
 *    - Animations start from positions far from center (orbitRadius = 8)
 *    - If camera is too close or FOV too narrow, animation gets clipped
 *    - Ensure camera can see the full animation bounding box
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, View, PerspectiveCamera } from '@react-three/drei'
import { useRef, useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// ============================================================================
// CONSTANTS
// ============================================================================

// Material presets - visual styles for the logo
const MATERIAL_PRESETS = {
  STANDARD: 'standard',
  HOLOGRAPHIC: 'holographic',
  NEON: 'neon',
  BRUSHED_METAL: 'brushed_metal',
  GRADIENT: 'gradient',
  IRIDESCENT: 'iridescent',
}

// Animation types available
const ANIMATION_TYPES = {
  SPIRAL: 'spiral',
  EXPLOSION: 'explosion',
  DROP: 'drop',
  ORBIT: 'orbit',
  WAVE: 'wave',
  ZOOM: 'zoom',
  PORTAL: 'portal',
  HELIX: 'helix',
  TORNADO: 'tornado',
  MATRIX: 'matrix',
  VORTEX: 'vortex',
  ASSEMBLE: 'assemble',
}

// Size calculation constants
// Scale 1 = navbar size (~40px), Scale 100 = 90% viewport width/height
// This allows responsive sizing: small logos for nav, large for hero sections
const BASE_SIZE = 40 // pixels for scale 1
const MAX_SCALE_FACTOR = 100
const VIEWPORT_COVERAGE = 0.9 // 90% of viewport at max scale

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Calculate pixel size based on scale (1-100)
const calculateSize = (scale, isWidth = true) => {
  if (typeof window === 'undefined') return BASE_SIZE * scale
  
  const viewportSize = isWidth ? window.innerWidth : window.innerHeight
  const maxSize = viewportSize * VIEWPORT_COVERAGE
  
  // Linear interpolation: scale 1 = BASE_SIZE, scale 100 = maxSize
  const size = BASE_SIZE + ((maxSize - BASE_SIZE) * (scale - 1)) / (MAX_SCALE_FACTOR - 1)
  return Math.round(size)
}

// Get material configuration based on preset
const getMaterialConfig = (preset) => {
  switch(preset) {
    case MATERIAL_PRESETS.HOLOGRAPHIC:
      return {
        type: 'custom',
        customType: 'holographic',
        props: {
          metalness: 0.9,
          roughness: 0.2,
          iridescence: 1,
          iridescenceIOR: 2.4,
          iridescenceThicknessRange: [100, 800],
        }
      }
    case MATERIAL_PRESETS.NEON:
      return {
        type: 'standard',
        props: {
          metalness: 0.1,
          roughness: 0.3,
          emissiveIntensity: 2,
          toneMapped: false,
        }
      }
    case MATERIAL_PRESETS.BRUSHED_METAL:
      return {
        type: 'standard',
        props: {
          metalness: 0.95,
          roughness: 0.35,
          envMapIntensity: 1.2,
        }
      }
    case MATERIAL_PRESETS.GRADIENT:
      return {
        type: 'gradient',
        props: {
          metalness: 0.3,
          roughness: 0.4,
        }
      }
    case MATERIAL_PRESETS.IRIDESCENT:
      return {
        type: 'physical',
        props: {
          metalness: 0.5,
          roughness: 0.2,
          iridescence: 1,
          iridescenceIOR: 1.8,
          iridescenceThicknessRange: [200, 600],
          sheen: 1,
          sheenRoughness: 0.2,
          sheenColor: '#88ccff',
        }
      }
    case MATERIAL_PRESETS.STANDARD:
    default:
      return {
        type: 'standard',
        props: {
          metalness: 0.5,
          roughness: 0.3,
        }
      }
  }
}

// Get animation configuration
const getAnimationConfig = (animationType, orbitRadius = 8) => {
  const configs = {
    [ANIMATION_TYPES.SPIRAL]: {
      duration: 2.5,
      startPositions: {
        plane1: [orbitRadius, 5, 0],
        plane2: [-orbitRadius/2, 5, orbitRadius * 0.866],
        plane3: [-orbitRadius/2, 5, -orbitRadius * 0.866]
      },
      startRotations: {
        plane1: [0, 0, 0],
        plane2: [0, Math.PI * 2/3, 0],
        plane3: [0, Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [0.3, 0.3, 0.3],
        plane2: [0.3, 0.3, 0.3],
        plane3: [0.3, 0.3, 0.3]
      }
    },
    [ANIMATION_TYPES.EXPLOSION]: {
      duration: 2.0,
      startPositions: {
        plane1: [0, 0, 0],
        plane2: [0, 0, 0],
        plane3: [0, 0, 0]
      },
      startRotations: {
        plane1: [Math.PI, Math.PI, 0],
        plane2: [Math.PI, Math.PI + Math.PI * 2/3, 0],
        plane3: [Math.PI, Math.PI + Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [0.01, 0.01, 0.01],
        plane2: [0.01, 0.01, 0.01],
        plane3: [0.01, 0.01, 0.01]
      }
    },
    [ANIMATION_TYPES.DROP]: {
      duration: 2.0,
      startPositions: {
        plane1: [1, 15, 0],
        plane2: [-0.5, 18, 0.866],
        plane3: [-0.5, 21, -0.866]
      },
      startRotations: {
        plane1: [Math.PI/4, 0, 0],
        plane2: [Math.PI/4, Math.PI * 2/3, 0],
        plane3: [Math.PI/4, Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [1, 1, 1],
        plane2: [1, 1, 1],
        plane3: [1, 1, 1]
      }
    },
    [ANIMATION_TYPES.ORBIT]: {
      duration: 3.0,
      startPositions: {
        plane1: [orbitRadius, 0, 0],
        plane2: [orbitRadius * Math.cos(Math.PI * 2/3), 2, orbitRadius * Math.sin(Math.PI * 2/3)],
        plane3: [orbitRadius * Math.cos(Math.PI * 4/3), -2, orbitRadius * Math.sin(Math.PI * 4/3)]
      },
      startRotations: {
        plane1: [0, 0, 0],
        plane2: [0, Math.PI * 2/3, 0],
        plane3: [0, Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [0.5, 0.5, 0.5],
        plane2: [0.5, 0.5, 0.5],
        plane3: [0.5, 0.5, 0.5]
      }
    },
    [ANIMATION_TYPES.WAVE]: {
      duration: 2.5,
      startPositions: {
        plane1: [-10, 0, 0],
        plane2: [-12, 0, 0.866],
        plane3: [-14, 0, -0.866]
      },
      startRotations: {
        plane1: [0, -Math.PI/2, 0],
        plane2: [0, -Math.PI/2 + Math.PI * 2/3, 0],
        plane3: [0, -Math.PI/2 + Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [1, 1, 1],
        plane2: [1, 1, 1],
        plane3: [1, 1, 1]
      }
    },
    [ANIMATION_TYPES.ZOOM]: {
      duration: 1.5,
      startPositions: {
        plane1: [1, 0, 0],
        plane2: [-0.5, 0, 0.866],
        plane3: [-0.5, 0, -0.866]
      },
      startRotations: {
        plane1: [0, Math.PI * 4, 0],
        plane2: [0, Math.PI * 4 + Math.PI * 2/3, 0],
        plane3: [0, Math.PI * 4 + Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [0.01, 0.01, 0.01],
        plane2: [0.01, 0.01, 0.01],
        plane3: [0.01, 0.01, 0.01]
      }
    },
    [ANIMATION_TYPES.PORTAL]: {
      duration: 2.0,
      startPositions: {
        plane1: [1, 0, -20],
        plane2: [-0.5, 0, -20],
        plane3: [-0.5, 0, -20]
      },
      startRotations: {
        plane1: [Math.PI/2, 0, 0],
        plane2: [Math.PI/2, Math.PI * 2/3, 0],
        plane3: [Math.PI/2, Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [2, 2, 2],
        plane2: [2, 2, 2],
        plane3: [2, 2, 2]
      }
    },
    [ANIMATION_TYPES.HELIX]: {
      duration: 3.0,
      startPositions: {
        plane1: [5, -10, 0],
        plane2: [-2.5, -10, 4.33],
        plane3: [-2.5, -10, -4.33]
      },
      startRotations: {
        plane1: [0, 0, Math.PI/4],
        plane2: [0, Math.PI * 2/3, Math.PI/4],
        plane3: [0, Math.PI * 4/3, Math.PI/4]
      },
      startScales: {
        plane1: [0.5, 0.5, 0.5],
        plane2: [0.5, 0.5, 0.5],
        plane3: [0.5, 0.5, 0.5]
      }
    },
    [ANIMATION_TYPES.TORNADO]: {
      duration: 2.5,
      startPositions: {
        plane1: [8, -8, 0],
        plane2: [-4, -8, 6.93],
        plane3: [-4, -8, -6.93]
      },
      startRotations: {
        plane1: [Math.PI/6, 0, Math.PI/3],
        plane2: [Math.PI/6, Math.PI * 2/3, Math.PI/3],
        plane3: [Math.PI/6, Math.PI * 4/3, Math.PI/3]
      },
      startScales: {
        plane1: [0.3, 0.3, 0.3],
        plane2: [0.3, 0.3, 0.3],
        plane3: [0.3, 0.3, 0.3]
      }
    },
    [ANIMATION_TYPES.MATRIX]: {
      duration: 2.5,
      startPositions: {
        plane1: [1, 20, 0],
        plane2: [-0.5, 25, 0.866],
        plane3: [-0.5, 30, -0.866]
      },
      startRotations: {
        plane1: [0, 0, 0],
        plane2: [0, Math.PI * 2/3, 0],
        plane3: [0, Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [1, 1, 1],
        plane2: [1, 1, 1],
        plane3: [1, 1, 1]
      }
    },
    [ANIMATION_TYPES.VORTEX]: {
      duration: 3.0,
      startPositions: {
        plane1: [10, 5, 0],
        plane2: [-5, 5, 8.66],
        plane3: [-5, 5, -8.66]
      },
      startRotations: {
        plane1: [0, Math.PI * 6, 0],
        plane2: [0, Math.PI * 6 + Math.PI * 2/3, 0],
        plane3: [0, Math.PI * 6 + Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [0.2, 0.2, 0.2],
        plane2: [0.2, 0.2, 0.2],
        plane3: [0.2, 0.2, 0.2]
      }
    },
    [ANIMATION_TYPES.ASSEMBLE]: {
      duration: 2.5,
      startPositions: {
        plane1: [8, 0, 0],
        plane2: [-4, 8, 6.93],
        plane3: [-4, -8, -6.93]
      },
      startRotations: {
        plane1: [0, Math.PI/2, 0],
        plane2: [Math.PI/2, Math.PI * 2/3, 0],
        plane3: [-Math.PI/2, Math.PI * 4/3, 0]
      },
      startScales: {
        plane1: [1.5, 1.5, 1.5],
        plane2: [1.5, 1.5, 1.5],
        plane3: [1.5, 1.5, 1.5]
      }
    }
  }
  
  return configs[animationType] || configs[ANIMATION_TYPES.SPIRAL]
}

// ============================================================================
// MATERIAL COMPONENT
// ============================================================================

function LogoMaterial({ preset, color, metalness, roughness }) {
  const config = getMaterialConfig(preset)
  
  switch(config.type) {
    case 'physical':
      return (
        <meshPhysicalMaterial
          color={color}
          metalness={config.props.metalness ?? metalness}
          roughness={config.props.roughness ?? roughness}
          iridescence={config.props.iridescence}
          iridescenceIOR={config.props.iridescenceIOR}
          iridescenceThicknessRange={config.props.iridescenceThicknessRange}
          sheen={config.props.sheen}
          sheenRoughness={config.props.sheenRoughness}
          sheenColor={config.props.sheenColor}
          side={THREE.DoubleSide}
        />
      )
    
    case 'custom':
      if (config.customType === 'holographic') {
        return (
          <meshPhysicalMaterial
            color={color}
            metalness={config.props.metalness ?? metalness}
            roughness={config.props.roughness ?? roughness}
            iridescence={config.props.iridescence}
            iridescenceIOR={config.props.iridescenceIOR}
            iridescenceThicknessRange={config.props.iridescenceThicknessRange}
            side={THREE.DoubleSide}
          />
        )
      }
      // Fallthrough to standard
    
    case 'standard':
    default:
      const isNeon = preset === MATERIAL_PRESETS.NEON
      return (
        <meshStandardMaterial
          color={color}
          metalness={config.props.metalness ?? metalness}
          roughness={config.props.roughness ?? roughness}
          envMapIntensity={config.props.envMapIntensity}
          emissive={isNeon ? color : undefined}
          emissiveIntensity={isNeon ? 2 : 0}
          toneMapped={config.props.toneMapped}
          side={THREE.DoubleSide}
        />
      )
  }
}

// ============================================================================
// LOGO PLANE COMPONENT
// ============================================================================

function LogoPlane({ color, metalness, roughness, thickness, width, height, materialPreset }) {
  return (
    <mesh>
      <boxGeometry args={[width, height, thickness]} />
      <LogoMaterial
        preset={materialPreset}
        color={color}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  )
}

// ============================================================================
// ANIMATED LOGO ICON (3D Scene Content)
// ============================================================================

function AnimatedLogoIcon({
  color = '#8b5cf6',
  metalness = 0.5,
  roughness = 0.3,
  thickness = 0.05,
  planeWidth = 2,
  planeHeight = 7,
  rotationSpeed = 1,
  animationType = ANIMATION_TYPES.SPIRAL,
  materialPreset = MATERIAL_PRESETS.IRIDESCENT,
  onAnimationComplete
}) {
  const groupRef = useRef()
  const plane1Ref = useRef()
  const plane2Ref = useRef()
  const plane3Ref = useRef()
  const animationStartRef = useRef(null) // Start as null, set on first frame
  const [animationComplete, setAnimationComplete] = useState(false)
  
  const orbitRadius = 8
  const animConfig = useMemo(() => getAnimationConfig(animationType, orbitRadius), [animationType])
  
  const startPositions = animConfig.startPositions
  const startRotations = animConfig.startRotations
  const startScales = animConfig.startScales
  
  // Final positions - 120° arrangement
  const finalPositions = {
    plane1: [1, 0, 0],
    plane2: [-0.5, 0, 0.866],
    plane3: [-0.5, 0, -0.866]
  }
  
  const finalRotations = {
    plane1: [0, 0, 0],
    plane2: [0, 1.0471975511965976, 0],
    plane3: [0, 5.235987755982989, 0]
  }
  
  const finalScales = {
    plane1: [1, 1, 1],
    plane2: [1, 1, 1],
    plane3: [1, 1, 1]
  }
  
  useFrame((state, delta) => {
    // Initialize animation start time on first frame
    if (animationStartRef.current === null) {
      animationStartRef.current = state.clock.elapsedTime
    }
    
    // After animation complete, rotate on diagonal axis
    if (animationComplete && groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed * 0.5
    }
    
    const elapsed = state.clock.elapsedTime - animationStartRef.current
    const duration = animConfig.duration || 2.5
    const t = Math.min(elapsed / duration, 1)
    
    if (t >= 1 && !animationComplete) {
      setAnimationComplete(true)
      if (onAnimationComplete) onAnimationComplete()
    }
    
    if (t >= 1) return // Animation complete
    
    // Easing function
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
    const easeT = easeOutCubic(t)
    
    // Animate each plane
    const planes = [
      { ref: plane1Ref, key: 'plane1', index: 0 },
      { ref: plane2Ref, key: 'plane2', index: 1 },
      { ref: plane3Ref, key: 'plane3', index: 2 }
    ]
    
    planes.forEach(({ ref, key, index }) => {
      if (!ref.current) return
      
      const startPos = startPositions[key]
      const finalPos = finalPositions[key]
      const startRot = startRotations[key]
      const finalRot = finalRotations[key]
      const startScale = startScales[key]
      const finalScale = finalScales[key]
      
      // Animation logic based on type
      switch(animationType) {
        case ANIMATION_TYPES.SPIRAL: {
          const spiralT = Math.min(t * 1.2, 1)
          const spiralAngle = (1 - spiralT) * Math.PI * 4 + index * (Math.PI * 2 / 3)
          const spiralRadius = orbitRadius * (1 - easeT)
          const spiralX = Math.cos(spiralAngle) * spiralRadius
          const spiralZ = Math.sin(spiralAngle) * spiralRadius
          const spiralYRot = spiralAngle
          const blendFactor = easeT
          
          ref.current.position.x = spiralX * (1 - blendFactor) + finalPos[0] * blendFactor
          ref.current.position.y = startPos[1] * (1 - easeT) + finalPos[1] * easeT
          ref.current.position.z = spiralZ * (1 - blendFactor) + finalPos[2] * blendFactor
          ref.current.rotation.y = spiralYRot * (1 - blendFactor) + finalRot[1] * blendFactor
          ref.current.rotation.x = startRot[0] * (1 - easeT) + finalRot[0] * easeT
          ref.current.rotation.z = 0
          break
        }
        
        case ANIMATION_TYPES.EXPLOSION: {
          const explosionEase = easeOutCubic(t)
          ref.current.position.x = startPos[0] * (1 - explosionEase) + finalPos[0] * explosionEase
          ref.current.position.y = startPos[1] * (1 - explosionEase) + finalPos[1] * explosionEase
          ref.current.position.z = startPos[2] * (1 - explosionEase) + finalPos[2] * explosionEase
          ref.current.rotation.x = startRot[0] * (1 - explosionEase) + finalRot[0] * explosionEase
          ref.current.rotation.y = startRot[1] * (1 - explosionEase) + finalRot[1] * explosionEase
          ref.current.rotation.z = startRot[2] * (1 - explosionEase) + finalRot[2] * explosionEase
          break
        }
        
        default: {
          // Default linear interpolation for other animations
          ref.current.position.x = startPos[0] * (1 - easeT) + finalPos[0] * easeT
          ref.current.position.y = startPos[1] * (1 - easeT) + finalPos[1] * easeT
          ref.current.position.z = startPos[2] * (1 - easeT) + finalPos[2] * easeT
          ref.current.rotation.x = startRot[0] * (1 - easeT) + finalRot[0] * easeT
          ref.current.rotation.y = startRot[1] * (1 - easeT) + finalRot[1] * easeT
          ref.current.rotation.z = startRot[2] * (1 - easeT) + finalRot[2] * easeT
        }
      }
      
      // Scale animation
      ref.current.scale.x = startScale[0] + (finalScale[0] - startScale[0]) * easeT
      ref.current.scale.y = startScale[1] + (finalScale[1] - startScale[1]) * easeT
      ref.current.scale.z = startScale[2] + (finalScale[2] - startScale[2]) * easeT
    })
  })
  
  return (
    <group ref={groupRef}>
      <group ref={plane1Ref}>
        <LogoPlane
          color={color}
          metalness={metalness}
          roughness={roughness}
          thickness={thickness}
          width={planeWidth}
          height={planeHeight}
          materialPreset={materialPreset}
        />
      </group>
      
      <group ref={plane2Ref}>
        <LogoPlane
          color={color}
          metalness={metalness}
          roughness={roughness}
          thickness={thickness}
          width={planeWidth}
          height={planeHeight}
          materialPreset={materialPreset}
        />
      </group>
      
      <group ref={plane3Ref}>
        <LogoPlane
          color={color}
          metalness={metalness}
          roughness={roughness}
          thickness={thickness}
          width={planeWidth}
          height={planeHeight}
          materialPreset={materialPreset}
        />
      </group>
    </group>
  )
}

// ============================================================================
// MAIN LOGO3D COMPONENT (Exported)
// ============================================================================

/**
 * Logo3D - A reusable 3D animated logo component
 * 
 * @param {number} width - Width scale (1-100). 1 = navbar size (~40px), 100 = 90% viewport
 * @param {number} height - Height scale (1-100). 1 = navbar size (~40px), 100 = 90% viewport
 * @param {boolean} interactive - Enable orbit controls for user interaction (default: false)
 * @param {string} color - Logo color (default: '#8b5cf6')
 * @param {string} materialPreset - Material type: 'standard', 'iridescent', 'holographic', 'neon', 'brushed_metal', 'gradient'
 * @param {string} animationType - Animation: 'spiral', 'explosion', 'drop', 'orbit', 'wave', 'zoom', 'portal', etc.
 * @param {number} rotationSpeed - Speed of continuous rotation after animation (default: 1)
 * @param {number} metalness - Material metalness 0-1 (default: 0.5)
 * @param {number} roughness - Material roughness 0-1 (default: 0.3)
 * @param {function} onAnimationComplete - Callback when entry animation finishes
 */
export default function Logo3D({
  width = 5,
  height = 5,
  interactive = false,
  color = '#8b5cf6',
  materialPreset = 'iridescent',
  animationType = 'spiral',
  rotationSpeed = 1,
  metalness = 0.5,
  roughness = 0.3,
  onAnimationComplete,
  className = '',
  style = {}
}) {
  const [containerSize, setContainerSize] = useState({ width: 200, height: 200 })
  const [isReady, setIsReady] = useState(false)
  
  // Calculate container size based on scale props
  useEffect(() => {
    const updateSize = () => {
      const calculatedWidth = calculateSize(width, true)
      const calculatedHeight = calculateSize(height, false)
      setContainerSize({ width: calculatedWidth, height: calculatedHeight })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [width, height])
  
  // Map string presets to constants
  const materialPresetValue = MATERIAL_PRESETS[materialPreset.toUpperCase()] || MATERIAL_PRESETS.IRIDESCENT
  const animationTypeValue = ANIMATION_TYPES[animationType.toUpperCase()] || ANIMATION_TYPES.SPIRAL
  
  // Camera distance - closer to fill more of the viewport (~5% padding)
  // The logo spans roughly 7 units tall, camera at 45° angle
  const cameraDistance = 6
  
  return (
    <div 
      className={`logo3d-container ${className}`}
      style={{ 
        width: containerSize.width, 
        height: containerSize.height,
        position: 'relative',
        overflow: 'hidden',
        ...style 
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        style={{ 
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 45, near: 0.1, far: 1000 }}
        dpr={[1, 2]}
        onCreated={() => {
          // Small delay to ensure first frame is rendered
          setTimeout(() => setIsReady(true), 50)
        }}
      >
        {/* Orbit controls - only if interactive */}
        {interactive && (
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            enableZoom={true}
            enablePan={false}
          />
        )}
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        {/* The animated logo */}
        <AnimatedLogoIcon
          color={color}
          metalness={metalness}
          roughness={roughness}
          thickness={0.05}
          planeWidth={2}
          planeHeight={7}
          rotationSpeed={rotationSpeed}
          animationType={animationTypeValue}
          materialPreset={materialPresetValue}
          onAnimationComplete={onAnimationComplete}
        />
      </Canvas>
    </div>
  )
}

// ============================================================================
// SHARED SCENE SYSTEM (Logo3DProvider + Logo3DView)
// ============================================================================

/**
 * Logo3DProvider - Creates a shared Canvas for multiple Logo3DView components
 * 
 * HOW IT WORKS:
 * 1. Creates a container div that wraps all children
 * 2. Creates a single fixed Canvas that covers the entire viewport
 * 3. The Canvas has pointerEvents: 'none' so it doesn't block interactions
 * 4. View.Port inside Canvas renders all Logo3DView contents
 * 5. eventSource={containerRef} allows pointer events to pass through to Views
 * 
 * Z-INDEX LAYERING:
 * - Canvas is at z-index: 1000
 * - Content that should appear BEHIND the 3D: use z-index < 1000
 * - Content that should appear IN FRONT of the 3D: use z-index > 1000 (e.g., z-[1001])
 * 
 * @example
 * <Logo3DProvider>
 *   <nav className="z-[1002]">Navbar in front</nav>
 *   <Logo3DView width={50} height={50} />
 *   <div className="z-[1001]">Text overlay in front</div>
 * </Logo3DProvider>
 */
export function Logo3DProvider({ children }) {
  const containerRef = useRef(null)
  
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {children}
      
      {/* 
        Single shared Canvas covering entire viewport
        - position: fixed ensures it stays in place during scroll
        - pointerEvents: none allows clicks to pass through to HTML beneath
        - eventSource connects pointer events back to the container for OrbitControls
        - View.Port renders all View component contents via scissor clipping
      */}
      <Canvas
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
        eventSource={containerRef}
        eventPrefix="client"
      >
        <View.Port />
      </Canvas>
    </div>
  )
}

/**
 * Logo3DView - A 3D logo viewport for use inside Logo3DProvider
 * 
 * IMPORTANT CONCEPTS:
 * 
 * 1. View Component Behavior:
 *    - View is a DOM element (renders as a div in HTML)
 *    - Its 3D contents are rendered via View.Port in the parent Canvas
 *    - The Canvas uses scissor clipping to render 3D only within View bounds
 *    - This is why the View needs width/height - it defines the 3D viewport size
 * 
 * 2. Each View is Independent:
 *    - Each View needs its own PerspectiveCamera (doesn't share with Canvas)
 *    - Each View needs its own lights (Canvas lights don't apply)
 *    - Each View can have its own OrbitControls
 * 
 * 3. Interactive Mode Warning:
 *    - When interactive=true, OrbitControls captures scroll/drag events
 *    - This BLOCKS page scrolling when cursor is over the View!
 *    - Recommendation: Enable interactive only after user clicks on the scene
 *    - Disable on mobile devices to prevent scroll issues
 * 
 * 4. Sizing:
 *    - width/height props use scale 1-100
 *    - Scale 1 = ~40px (navbar icon size)
 *    - Scale 100 = 90% of viewport
 *    - The View div is sized in pixels based on this scale
 * 
 * @example
 * // Basic usage
 * <Logo3DView width={10} height={10} animationType="spiral" />
 * 
 * // Full-screen with interaction disabled until clicked
 * const [interactive, setInteractive] = useState(false)
 * <div onClick={() => setInteractive(true)}>
 *   <Logo3DView width={100} height={100} interactive={interactive} />
 * </div>
 */
export function Logo3DView({
  width = 5,
  height = 5,
  interactive = false,
  color = '#8b5cf6',
  materialPreset = 'iridescent',
  animationType = 'spiral',
  rotationSpeed = 1,
  metalness = 0.5,
  roughness = 0.3,
  onAnimationComplete,
  className = '',
  style = {}
}) {
  const [containerSize, setContainerSize] = useState({ width: 200, height: 200 })
  
  // Map string presets to constants
  const materialPresetValue = MATERIAL_PRESETS[materialPreset.toUpperCase()] || MATERIAL_PRESETS.IRIDESCENT
  const animationTypeValue = ANIMATION_TYPES[animationType.toUpperCase()] || ANIMATION_TYPES.SPIRAL
  
  // Camera distance - further back to show full animation
  const cameraDistance = 5
  
  // Calculate container size based on scale props
  useEffect(() => {
    const updateSize = () => {
      const calculatedWidth = calculateSize(width, true)
      const calculatedHeight = calculateSize(height, false)
      setContainerSize({ width: calculatedWidth, height: calculatedHeight })
    }
    
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [width, height])
  
  return (
    <View
      className={`logo3d-view ${className}`}
      style={{
        width: containerSize.width,
        height: containerSize.height,
        position: 'relative',
        ...style
      }}
    >
      {/* 
        CAMERA SETUP
        - Position at [d, d, d] creates isometric-like view (~35° elevation, 45° azimuth)
        - onUpdate ensures camera always faces origin (where logo ends up)
        - FOV of 60° gives good visibility of the animation
        - cameraDistance of 5 balances seeing the full animation vs logo size
      */}
      <PerspectiveCamera
        makeDefault
        position={[cameraDistance, cameraDistance, cameraDistance]}
        fov={60}
        near={0.1}
        far={1000}
        onUpdate={(self) => self.lookAt(0, 0, 0)}
      />
      
      {/* 
        LIGHTING SETUP
        IMPORTANT: Each View needs its own lights! Canvas lights don't apply to Views.
        - ambientLight: Base illumination so nothing is completely dark
        - directionalLight (10,10,5): Main key light from upper-right-front
        - directionalLight (-10,-10,-5): Fill light from opposite side
        - directionalLight (-15,5,0): Left side accent light for depth
      */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <directionalLight position={[-15, 5, 0]} intensity={0.8} />
      
      {/* Environment map for realistic reflections on metallic materials */}
      <Environment preset="city" />
      
      {/* 
        ORBIT CONTROLS
        WARNING: When enabled, this captures mouse/touch events!
        - Scroll over the View will zoom instead of scrolling the page
        - Drag will rotate the camera instead of selecting text
        - Only enable after explicit user interaction (click)
        - Disable on mobile to prevent scroll interference
      */}
      {interactive && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={false}
        />
      )}
      
      {/* The animated 3D logo - animates from start position to center, then rotates */}
      <AnimatedLogoIcon
        color={color}
        metalness={metalness}
        roughness={roughness}
        thickness={0.05}
        planeWidth={2}
        planeHeight={7}
        rotationSpeed={rotationSpeed}
        animationType={animationTypeValue}
        materialPreset={materialPresetValue}
        onAnimationComplete={onAnimationComplete}
      />
    </View>
  )
}

// Export constants for external use
export { MATERIAL_PRESETS, ANIMATION_TYPES }
