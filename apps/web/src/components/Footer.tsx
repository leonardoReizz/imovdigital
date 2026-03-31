import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <span className="text-xl font-bold text-white">Imobiliária</span>
            <p className="text-sm mt-3 leading-relaxed">
              Encontre o imóvel ideal para você. Apartamentos, casas e muito mais com
              a confiança de quem entende do mercado.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Imóveis</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/?type=APARTMENT" className="hover:text-white transition-colors">Apartamentos</a></li>
              <li><a href="/?type=HOUSE" className="hover:text-white transition-colors">Casas</a></li>
              <li><a href="/?type=COMMERCIAL" className="hover:text-white transition-colors">Comerciais</a></li>
              <li><a href="/?type=LAND" className="hover:text-white transition-colors">Terrenos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/?listing=SALE" className="hover:text-white transition-colors">Comprar</a></li>
              <li><a href="/?listing=RENT" className="hover:text-white transition-colors">Alugar</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>contato@imobiliaria.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span>São Paulo, SP</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Imobiliária. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-600">
            Powered by <span className="text-gray-400 font-medium">ImovDigital</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
