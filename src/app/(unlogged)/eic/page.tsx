import { ExternalLink, BookOpen, Github, Linkedin } from 'lucide-react';

interface LinkItem {
  id: number;
  label: string;
  url: string;
}

interface CareerItem {
  id: number;
  name: string;
  url: string;
}

interface DeveloperItem {
  id: number;
  name: string;
  role: string;
  minor: string;
  github: string;
  linkedin: string;
}

const PAGE_TEXTS = {
  heroTitle: 'Escuela de Ingeniería Coquimbo',
  heroSubtitle: 'Universidad Católica del Norte.',
  aboutTitle: '¿Quiénes somos?',
  aboutDescription: 'La Escuela de Ingeniería Coquimbo (EIC) es la unidad académica de la Universidad Católica del Norte, sede Coquimbo, encargada de proyectar, coordinar y desarrollar la docencia, investigación y vinculación con el medio en el ámbito de las ciencias de la ingeniería. Formamos profesionales integrales, con sólida base científica y tecnológica, capaces de resolver problemas complejos con una mirada ética y sostenible.',
  developersTitle: 'Desarrolladores',
  linksTitle: 'Enlaces oficiales',
  careersTitle: 'Nuestras carreras'
};

const OFFICIAL_LINKS: LinkItem[] = [
  {
    id: 1,
    label: 'Sitio oficial UCN',
    url: 'https://www.ucn.cl'
  },
  {
    id: 2,
    label: 'Escuela de Ingeniería Coquimbo',
    url: 'https://eic.ucn.cl'
  },
  {
    id: 3,
    label: 'Campus Virtual UCN',
    url: 'https://campusvirtual.ucn.cl/login/index.php'
  }
];

const CAREERS: CareerItem[] = [
  {
    id: 1,
    name: 'Ingeniería Civil en Computación e Informática',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-Civil-en-Computacion-e-Informatica'
  },
  {
    id: 2,
    name: 'Ingeniería Civil Industrial',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-Civil-Industrial'
  },
  {
    id: 3,
    name: 'Ingeniería en Tecnologías de Información',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-en-Tecnologias-de-Informacion'
  }
];

const DEVELOPERS: DeveloperItem[] = [
  {
    id: 1,
    name: 'Martín Castillo',
    role: 'Estudiante de Ingeniería en Tecnologías de Información',
    minor: 'Minor: Seguridad Digital y Ciberinteligencia',
    github: 'https://github.com/Marton1123',
    linkedin: 'https://www.linkedin.com/in/martin-castillo-t'
  },
  {
    id: 2,
    name: 'Daniel Durán',
    role: 'Estudiante de Ingeniería en Tecnologías de Información',
    minor: 'Minor: Desarrollo y Arquitectura de Software',
    github: 'https://github.com/Charmandiox9',
    linkedin: 'https://www.linkedin.com/in/daniel-durán-garcía/'
  }
];

export default function EicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="bg-[#1e3a5f] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{PAGE_TEXTS.heroTitle}</h1>
          <p className="text-blue-200 text-lg md:text-xl">{PAGE_TEXTS.heroSubtitle}</p>
        </div>
      </section>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-16 space-y-16">
        
        <section className="bg-gray-50 border border-gray-100 p-8 md:p-10 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{PAGE_TEXTS.aboutTitle}</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            {PAGE_TEXTS.aboutDescription}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{PAGE_TEXTS.developersTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {DEVELOPERS.map((dev) => (
              <div key={dev.id} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col justify-between hover:border-[#1e3a5f] hover:shadow-md transition-all">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{dev.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{dev.role}</p>
                  <p className="text-sm font-medium text-blue-600 mt-2">{dev.minor}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col space-y-3">
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                  >
                    <Github className="w-5 h-5" />
                    <span>Perfil de GitHub</span>
                  </a>
                  <a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>Perfil de LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{PAGE_TEXTS.linksTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {OFFICIAL_LINKS.map((link) => (
              <a 
                key={link.id} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-[#1e3a5f] hover:shadow-md transition-all"
              >
                <span className="font-semibold text-gray-800 group-hover:text-[#1e3a5f] transition-colors">
                  {link.label}
                </span>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#1e3a5f] transition-colors" />
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{PAGE_TEXTS.careersTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {CAREERS.map((career) => (
              <a 
                key={career.id}
                href={career.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#1e3a5f] hover:shadow-md transition-all group h-full"
              >
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600 mb-4 self-start group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <h3 className="font-bold text-gray-900 leading-tight group-hover:text-[#1e3a5f] transition-colors mb-4">{career.name}</h3>
                  <div className="flex justify-between items-center text-sm font-medium text-blue-600 group-hover:text-[#1e3a5f] transition-colors">
                    <span>Ver programa</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <footer className="bg-[#1e3a5f] text-white/80 py-6 text-center text-sm mt-auto">
        <p>PROJEIC &middot; Escuela de Ingeniería Coquimbo</p>
      </footer>
    </div>
  );
}
