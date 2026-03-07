"use client";

import { Warp } from "@paper-design/shaders-react";

export default function WarpShaderBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Warp
                style={{ height: "100%", width: "100%" }}
                proportion={0.45}
                softness={1}
                distortion={0.25}
                swirl={0.8}
                swirlIterations={10}
                shape="checks"
                shapeScale={0.1}
                scale={1}
                rotation={0}
                speed={0.6}
                colors={[
                    "hsl(174, 72%, 10%)",   // deep dark teal
                    "hsl(168, 80%, 55%)",   // bright teal-400
                    "hsl(172, 66%, 25%)",   // mid teal-700
                    "hsl(166, 72%, 65%)",   // light teal-300
                ]}
            />
        </div>
    );
}
