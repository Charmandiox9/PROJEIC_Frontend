import { ExternalLink, BookOpen, Building2, Cpu, Laptop, LucideIcon } from 'lucide-react';

interface LinkItem {
  id: number;
  label: string;
  url: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  hoverClass: string;
  groupHoverClass: string;
}

interface CareerItem {
  id: number;
  name: string;
  url: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  groupHoverTextClass: string;
  hoverBorderClass: string;
}

const PAGE_TEXTS = {
  heroTitle: 'Escuela de Ingeniería Coquimbo',
  heroSubtitle: 'Universidad Católica del Norte.',
  aboutTitle: '¿Quiénes somos?',
  aboutDescription: 'La Escuela de Ingeniería Coquimbo (EIC) es la unidad académica de la Universidad Católica del Norte, sede Coquimbo, encargada de proyectar, coordinar y desarrollar la docencia, investigación y vinculación con el medio en el ámbito de las ciencias de la ingeniería. Formamos profesionales integrales, con sólida base científica y tecnológica, capaces de resolver problemas complejos con una mirada ética y sostenible.',
  linksTitle: 'Enlaces oficiales',
  careersTitle: 'Nuestras carreras'
};

const OFFICIAL_LINKS: LinkItem[] = [
  {
    id: 1,
    label: 'Sitio oficial UCN',
    url: 'https://www.ucn.cl',
    icon: Building2,
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-50',
    hoverClass: 'hover:border-blue-500',
    groupHoverClass: 'group-hover:bg-blue-500 group-hover:text-white',
  },
  {
    id: 2,
    label: 'Escuela de Ingeniería',
    url: 'https://eic.ucn.cl',
    icon: Cpu,
    colorClass: 'text-brand',
    bgClass: 'bg-brand-light',
    hoverClass: 'hover:border-brand',
    groupHoverClass: 'group-hover:bg-brand group-hover:text-white',
  },
  {
    id: 3,
    label: 'Campus Virtual',
    url: 'https://campusvirtual.ucn.cl/login/index.php',
    icon: Laptop,
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
    hoverClass: 'hover:border-orange-500',
    groupHoverClass: 'group-hover:bg-orange-500 group-hover:text-white',
  }
];

const CAREERS: CareerItem[] = [
  {
    id: 1,
    name: 'Ingeniería Civil en Computación e Informática',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-Civil-en-Computacion-e-Informatica',
    bgClass: 'bg-career-cs/10',
    borderClass: 'border-career-cs',
    textClass: 'text-career-cs',
    groupHoverTextClass: 'group-hover:text-career-cs',
    hoverBorderClass: 'hover:border-career-cs'
  },
  {
    id: 2,
    name: 'Ingeniería Civil Industrial',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-Civil-Industrial',
    bgClass: 'bg-career-industrial/10',
    borderClass: 'border-career-industrial',
    textClass: 'text-career-industrial',
    groupHoverTextClass: 'group-hover:text-career-industrial',
    hoverBorderClass: 'hover:border-career-industrial'
  },
  {
    id: 3,
    name: 'Ingeniería en Tecnologías de Información',
    url: 'https://eic.ucn.cl/pregrados/Ingenieria-en-Tecnologias-de-Informacion',
    bgClass: 'bg-career-ti/10',
    borderClass: 'border-career-ti',
    textClass: 'text-career-ti',
    groupHoverTextClass: 'group-hover:text-career-ti',
    hoverBorderClass: 'hover:border-career-ti'
  }
];

export default function EicPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <section className="bg-brand-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent text-white py-16 px-6">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-8">{PAGE_TEXTS.linksTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {OFFICIAL_LINKS.map((link) => {
              const Icon = link.icon;
              return (
              <a 
                key={link.id} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${link.hoverClass}`}
              >
                <div className={`w-16 h-16 rounded-2xl mb-5 flex items-center justify-center transition-colors duration-300 ${link.bgClass} ${link.colorClass} ${link.groupHoverClass}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-bold text-gray-900 text-lg mb-2 text-center transition-colors">
                  {link.label}
                </span>
                <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                  <span>Visitar plataforma</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </a>
            )})}
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
                className={`flex flex-col p-6 bg-white border border-gray-100 rounded-xl shadow-sm ${career.hoverBorderClass} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group h-full focus-visible:ring-2 focus-visible:outline-none focus:ring-brand`}
              >
                <div className={`${career.bgClass} ${career.textClass} p-3 rounded-lg mb-4 self-start transition-colors`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <h3 className={`font-bold text-gray-900 leading-tight ${career.groupHoverTextClass} transition-colors mb-4`}>
                    {career.name}
                  </h3>
                  <div className={`flex justify-between items-center text-sm font-medium ${career.textClass} transition-colors`}>
                    <span>Ver programa</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <footer className="bg-brand-dark text-white/80 py-6 text-center text-sm mt-auto border-t border-white/10">
        <p>PROJEIC &middot; Escuela de Ingeniería Coquimbo</p>
      </footer>
    </div>
  );
}
