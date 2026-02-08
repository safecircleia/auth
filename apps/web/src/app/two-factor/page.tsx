import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { TwoFactorForm } from "@/components/two-factor-form";
import Grainient from "@/components/Grainient";

const APP_VERSION = "0.1.0";

export default function TwoFactorPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Logo size="sm" />
            SafeCircle Auth.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={
                <div className="flex items-center justify-center">
                  Loading...
                </div>
              }
            >
              <TwoFactorForm />
            </Suspense>
          </div>
        </div>
        <p className="text-muted-foreground/60 text-center text-xs">
          SafeCircle Auth v{APP_VERSION}
        </p>
      </div>
      <div className="relative hidden lg:block">
        <Grainient
          color1="#3584e4"
          color2="#99c1f1"
          color3="#1a5fb4"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>
    </div>
  );
}
