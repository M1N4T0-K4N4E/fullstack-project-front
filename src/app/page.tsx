'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { SiteHeader } from '@/components/app/site-header';
import { Footer } from '@/components/app/footer';
import { SimplexNoise } from '@paper-design/shaders-react';
import { Button } from '@/components/ui/button';
import { ShaderCard } from '@/components/app/shader-card';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className='min-h-screen flex flex-col overflow-x-hidden'>
      <SiteHeader />
      <div className="px-6 w-full py-4">
        <div className="py-2 w-full max-w-6xl mx-auto">
          <div className="aspect-20/9 relative flex items-center justify-center">
            <SimplexNoise
              className='size-full'
              colors={["#ffffff", "#ff9e9e", "#5f57ff", "#00f7ff"]}
              stepsPerColor={1}
              softness={1}
              speed={2}
              scale={1.6}
            />
            <div className='absolute text-white text-2xl sm:text-3xl md:text-6xl '>
              Welcome to shaderd
            </div>
          </div>
          <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full my-4'>
            <ShaderCard url="/shader/1/hello" name="Transition Shader With Patterns" username='boon4681' like={10} dislike={10}></ShaderCard>
            <ShaderCard url="/shader/1/hello" name="Transition Shader With Patterns" username='boon4681' like={10} dislike={10}></ShaderCard>
            <ShaderCard url="/shader/1/hello" name="Transition Shader With Patterns" username='boon4681' like={10} dislike={10}></ShaderCard>
            <ShaderCard url="/shader/1/hello" name="Transition Shader With Patterns" username='boon4681' like={10} dislike={10}></ShaderCard>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-pink-300 justify-center h-90 my-12">
        <div className='max-w-4xl flex flex-col items-center mx-auto text-background'>
          <div className='text-2xl font-bold mb-2'>
            Contribute to the library!
          </div>
          <div className='text-center'>
            Help build the largest library of shaders for the Godot game engine. Godot Shaders is only possible with the contributions from the community. So, if you have a shader you would like to share submit it now for everyone to see!
          </div>
          <Button size="lg" className="mt-6 p-4">Upload a shader</Button>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}
