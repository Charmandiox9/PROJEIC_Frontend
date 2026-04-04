import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, Info, GraduationCap, Github, BookOpen, LogIn, TerminalSquare, Building2, Cpu } from 'lucide-react';
import logoTexto from '../../../public/Logo__Texto.png';

export default function PublicFooter() {
  return (
    <footer className="bg-ui-dark text-white py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
        <div className="flex flex-col space-y-4">
          <Image
            src={logoTexto}
            alt="PROJEIC Logo"
            width={160}
            height={46}
            className="w-40 h-auto object-contain"
          />
          <p className="text-sm text-white/50 mt-2">
            Gestión y trazabilidad de proyectos académicos para ingeniería.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">Plataforma</h3>
          <Link href="/proyectos" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
            <LayoutGrid className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>Proyectos</span>
          </Link>
          <Link href="/acerca" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
            <Info className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>Acerca de</span>
          </Link>
          <Link href="/eic" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
            <GraduationCap className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>EIC</span>
          </Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">Acceso</h3>
          <Link href="/auth/login" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
            <LogIn className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>Iniciar sesión</span>
          </Link>
        </div>

        <div className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">Universidad</h3>
          <a href="https://www.ucn.cl/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
            <Building2 className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>UCN</span>
          </a>
          <a href="https://eic.ucn.cl/" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
            <Cpu className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
            <span>EIC UCN</span>
          </a>
        </div>

        <div className="flex flex-col space-y-4">
          <h3 className="font-semibold text-lg text-white/90">Desarrolladores</h3>
          
          <div className="flex flex-col space-y-3">
            <a href="https://github.com/Marton1123" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
              <TerminalSquare className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>Martín Castillo</span>
            </a>
            <a href="https://github.com/Charmandiox9" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
              <TerminalSquare className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>Daniel Durán</span>
            </a>
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <a href="https://github.com/Charmandiox9/PROJEIC_Frontend" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
              <Github className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>Código Frontend</span>
            </a>
            <a href="https://github.com/Charmandiox9/PROJEIC_Backend" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center space-x-2 text-sm text-white/70 hover:text-brand transition-colors">
              <Github className="w-4 h-4 text-white/40 group-hover:text-brand transition-colors" />
              <span>Código Backend</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex justify-center items-center">
        <p className="text-center text-xs text-white/50">
          © 2026 PROJEIC · Escuela de Ingeniería Coquimbo, UCN
        </p>
      </div>
    </footer>
  );
}
