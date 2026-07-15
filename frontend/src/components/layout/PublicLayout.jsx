import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, Info, BookOpen, Users, GraduationCap, Mail, X, Menu } from '../ui/Icons';

const FacebookIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
const InstagramIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
);
const WhatsAppIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.114-2.877-6.974-1.858-1.859-4.325-2.883-6.963-2.885-5.437 0-9.86 4.422-9.864 9.865-.001 1.73.454 3.42 1.32 4.925l-.995 3.635 3.71-.973zm11.514-5.29c-.07-.117-.258-.187-.54-.327-.281-.14-1.661-.82-1.919-.914-.258-.094-.446-.14-.633.14-.187.28-.725.914-.889 1.101-.164.186-.327.21-.609.07-.28-.14-1.187-.437-2.261-1.396-.836-.746-1.4-1.667-1.564-1.948-.164-.282-.018-.434.122-.574.127-.127.282-.328.422-.492.141-.164.188-.28.282-.469.094-.187.046-.351-.023-.49-.07-.14-.633-1.523-.867-2.086-.228-.547-.46-.473-.633-.482-.164-.008-.351-.01-.54-.01-.187 0-.491.07-.749.351-.258.282-.983.961-.983 2.343 0 1.382 1.006 2.719 1.147 2.907.14.187 1.98 3.024 4.797 4.237.67.289 1.192.462 1.6.593.673.214 1.287.184 1.77.112.54-.08 1.661-.68 1.896-1.336.234-.656.234-1.22.164-1.336z" />
    </svg>
);
const TikTokIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.08-.07-.17-.17-.25-.26V14c0 1.71-.35 3.48-1.4 4.88-1.5 2-4.12 2.95-6.55 2.5-2.2-.4-4.1-2.1-4.66-4.27-.7-2.73.48-5.91 3-7.16.85-.41 1.8-.62 2.75-.62.33 0 .66.02.99.07v4.13c-.33-.1-.67-.14-1.02-.13-1.63.02-3.13 1.19-3.48 2.78-.4 1.8.84 3.75 2.66 4.02 1.48.22 3.03-.54 3.55-1.93.2-.5.27-1.05.26-1.6V.02z" />
    </svg>
);

export default function PublicLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Accueil', Icon: HomeIcon },
        { path: '/bureau', label: 'Bureau', Icon: Users },
        { path: '/ufr-met', label: "L'UFR MET", Icon: GraduationCap },
        { path: '/contact', label: 'Contact', Icon: Mail }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between antialiased text-slate-800">
            {/* ════════ NAVBAR ════════ */}
            <nav className="bg-[#003058]/95 text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 transition-all">
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <div className="relative w-10 h-10 shrink-0">
                        <img src="/images/logo-CMET.png" alt="Logo Club-MET"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/20" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-base tracking-wide leading-none">CLUB-MET</span>
                        <span className="text-[10px] text-gray-400 tracking-wider mt-0.5">UFR MET • UCAK</span>
                    </div>
                </Link>

                <div className="hidden md:flex gap-6 text-[13px] font-medium items-center">
                    {navLinks.map((link) => {
                        const IconComponent = link.Icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`hover:text-[#187840] transition-colors flex items-center gap-1.5 ${
                                    isActive(link.path) ? 'text-[#187840]' : ''
                                }`}
                            >
                                <IconComponent size={14} /> {link.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="hidden md:flex items-center gap-5 text-xs">
                    <button onClick={() => navigate('/login')}
                        className="font-semibold text-gray-300 hover:text-white transition-colors tracking-wide">
                        Se connecter
                    </button>
                    <button onClick={() => navigate('/register')}
                        className="bg-[#187840] text-white px-5 py-2 rounded-lg font-bold tracking-wide hover:bg-green-600 transition-colors shadow-md">
                        S'inscrire
                    </button>
                </div>

                <button onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    className="md:hidden p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        {mobileNavOpen
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        }
                    </svg>
                </button>
            </nav>

            {/* Menu Mobile */}
            {mobileNavOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-[#003058] pt-24 px-6 pb-6 overflow-y-auto">
                    <div className="flex flex-col gap-6 text-lg font-medium text-white">
                        {navLinks.map((link) => {
                            const IconComponent = link.Icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={`flex items-center gap-3 ${
                                        isActive(link.path) ? 'text-[#187840]' : ''
                                    }`}
                                >
                                    <IconComponent size={20} /> {link.label}
                                </Link>
                            );
                        })}

                        <div className="border-t border-slate-700 my-2 pt-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Connexion</p>
                            <div className="flex flex-col gap-3">
                                <button onClick={() => { setMobileNavOpen(false); navigate('/login'); }}
                                    className="w-full text-center font-semibold text-white bg-slate-800 py-3 rounded-xl transition-colors">
                                    Se connecter
                                </button>
                                <button onClick={() => { setMobileNavOpen(false); navigate('/register'); }}
                                    className="w-full text-center bg-[#187840] text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md">
                                    S'inscrire
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ MAIN CONTENT ════════ */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* ════════ FOOTER ════════ */}
            <footer className="bg-[#003058] text-white pt-10 pb-4 px-6 border-t border-slate-800 text-xs">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="space-y-3">
                        <h5 className="font-bold text-[#187840] uppercase tracking-wider">Contacts</h5>
                        <div className="text-slate-400 space-y-3 leading-relaxed">
                            <div className="flex items-start gap-2.5">
                                <svg className="w-4 h-4 text-[#187840] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span>Complexe Universitaire de Touba, Mbacké, Sénégal</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-[#187840] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:+221338000000" className="hover:text-white underline">+221 33 800 00 00</a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <svg className="w-4 h-4 text-[#187840] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:contact.met@ucak.edu.sn" className="hover:text-white underline">contact.met@ucak.edu.sn</a>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <h5 className="font-bold text-slate-300 uppercase tracking-wider">Navigation</h5>
                        <ul className="space-y-1 text-slate-400">
                            <li><Link to="/" className="hover:text-[#187840] transition-colors">L'Institution</Link></li>
                            <li><Link to="/" className="hover:text-[#187840] transition-colors">Règlement Interne</Link></li>
                            <li><Link to="/bureau" className="hover:text-[#187840] transition-colors">Le Bureau</Link></li>
                            <li><Link to="/ufr-met" className="hover:text-[#187840] transition-colors">L'UFR MET</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h5 className="font-bold text-slate-300 uppercase tracking-wider">Réseaux Officiels</h5>
                        <div className="flex flex-col space-y-2">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-400 hover:text-[#1877F2] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#1877F2]/20 flex items-center justify-center transition-colors shrink-0"><FacebookIcon /></span>
                                <span>Facebook</span>
                            </a>
                            <a href="https://www.instagram.com/cmet_officiel?igsh=c2hqN2EwaXgyazV5" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-400 hover:text-[#E1306C] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#E1306C]/20 flex items-center justify-center transition-colors shrink-0"><InstagramIcon /></span>
                                <span>Instagram</span>
                            </a>
                            <a href="https://wa.me/221787941004" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-400 hover:text-[#25D366] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#25D366]/20 flex items-center justify-center transition-colors shrink-0"><WhatsAppIcon /></span>
                                <span>WhatsApp</span>
                            </a>
                            <a href="https://www.tiktok.com/@cmet_officiel" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-400 hover:text-[#ff0050] transition-colors group">
                                <span className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-[#ff0050]/20 flex items-center justify-center transition-colors shrink-0"><TikTokIcon /></span>
                                <span>TikTok</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-500 border-t border-slate-800 pt-4 text-[10px]">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img src="/images/logo-CMET.png" alt="" className="w-7 h-7 rounded-full object-cover opacity-70" />
                        <span className="text-slate-400 font-semibold text-[11px] tracking-wide">CLUB-MET</span>
                    </div>
                    <span>© {new Date().getFullYear()} Club-MET UCAK. Tous droits réservés.</span>
                </div>
            </footer>
        </div>
    );
}
